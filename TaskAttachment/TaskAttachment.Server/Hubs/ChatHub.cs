using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using TaskAttachment.Server.Data;
using TaskAttachment.Server.Models;

namespace TaskAttachment.Server.Hubs;

[Authorize]
public class ChatHub : Hub
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<ChatHub> _logger;
    private readonly UserManager<ApplicationUser> _userManager;

    public ChatHub(
        ApplicationDbContext context, 
        ILogger<ChatHub> logger,
        UserManager<ApplicationUser> userManager)
    {
        _context = context;
        _logger = logger;
        _userManager = userManager;
    }

    public override async Task OnConnectedAsync()
    {
        var userId = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!string.IsNullOrEmpty(userId))
        {
            var user = await _userManager.FindByIdAsync(userId);
            if (user != null)
            {
                user.IsOnline = true;
                user.LastActive = DateTime.UtcNow;
                await _userManager.UpdateAsync(user);
                
                await Clients.All.SendAsync("UserConnected", new 
                { 
                    UserId = user.Id,
                    Username = user.UserName,
                    DisplayName = user.DisplayName,
                    AvatarUrl = user.AvatarUrl
                });
            }
        }
        await base.OnConnectedAsync();
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        var userId = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!string.IsNullOrEmpty(userId))
        {
            var user = await _userManager.FindByIdAsync(userId);
            if (user != null)
            {
                user.IsOnline = false;
                user.LastActive = DateTime.UtcNow;
                await _userManager.UpdateAsync(user);
                
                await Clients.All.SendAsync("UserDisconnected", user.Id);
            }
        }
        await base.OnDisconnectedAsync(exception);
    }

    public async Task SendMessage(string message)
    {
        try
        {
            var userId = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                throw new UnauthorizedAccessException("User not authenticated");
            }

            // Validate message length
            if (string.IsNullOrWhiteSpace(message) || message.Length > 1000)
            {
                throw new ArgumentException("Message must be between 1 and 1000 characters.");
            }

            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
            {
                throw new InvalidOperationException("User not found");
            }

            // Create and save the message
            var chatMessage = new Message
            {
                SenderId = user.Id,
                Content = message,
                Timestamp = DateTime.UtcNow,
                IsRead = false
            };

            _context.Messages.Add(chatMessage);
            await _context.SaveChangesAsync();

            // Get the message with sender details
            var messageWithDetails = await _context.Messages
                .Include(m => m.Sender)
                .FirstOrDefaultAsync(m => m.MessageId == chatMessage.MessageId);

            if (messageWithDetails == null)
            {
                throw new InvalidOperationException("Failed to retrieve message details");
            }

            // Broadcast the message to all clients
            await Clients.All.SendAsync("ReceiveMessage", new
            {
                MessageId = messageWithDetails.MessageId,
                SenderId = user.Id,
                SenderName = user.DisplayName ?? user.UserName,
                SenderAvatar = user.AvatarUrl,
                messageWithDetails.Content,
                messageWithDetails.Timestamp,
                messageWithDetails.IsRead
            });

            _logger.LogInformation($"Message sent by {user.UserName}: {message}");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error sending message");
            await Clients.Caller.SendAsync("Error", ex.Message);
        }
    }
}
