using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using TaskAttachment.Server.Data;
using TaskAttachment.Server.Models;

namespace TaskAttachment.Server.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class MessagesController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly ILogger<MessagesController> _logger;

    public MessagesController(
        ApplicationDbContext context, 
        UserManager<ApplicationUser> userManager,
        ILogger<MessagesController> logger)
    {
        _context = context;
        _userManager = userManager;
        _logger = logger;
    }

    /// <summary>
    /// Get all messages with sender information
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<IEnumerable<object>>> GetMessages()
    {
        try
        {
            var messages = await _context.Messages
                .Include(m => m.Sender)
                .OrderBy(m => m.Timestamp)
                .Select(m => new
                {
                    m.MessageId,
                    m.SenderId,
                    SenderName = m.Sender != null ? (m.Sender.DisplayName ?? m.Sender.UserName) : "Unknown",
                    SenderAvatar = m.Sender != null ? m.Sender.AvatarUrl : null,
                    m.Content,
                    m.Timestamp,
                    m.IsRead,
                    Reactions = m.Reactions != null ? m.Reactions.Select(r => new
                    {
                        r.ReactionId,
                        r.Emoji,
                        r.UserId,
                        UserName = r.User != null ? (r.User.DisplayName ?? r.User.UserName) : "Unknown"
                    }) : null
                })
                .ToListAsync();

            return Ok(messages);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving messages");
            return StatusCode(500, "Internal server error");
        }
    }

    /// <summary>
    /// Get a specific message by ID
    /// </summary>
    [HttpGet("{id}")]
    public async Task<ActionResult<object>> GetMessage(int id)
    {
        try
        {
var message = await _context.Messages
                .Include(m => m.Sender)
                .Include(m => m.Reactions)
                    .ThenInclude(r => r.User)
                .FirstOrDefaultAsync(m => m.MessageId == id);

            if (message == null)
            {
                return NotFound();
            }

            return Ok(new
            {
                message.MessageId,
                message.SenderId,
                SenderName = message.Sender?.DisplayName ?? message.Sender?.UserName,
                SenderAvatar = message.Sender?.AvatarUrl,
                message.Content,
                message.Timestamp,
                message.IsRead,
                Reactions = message.Reactions?.Select(r => new
                {
                    r.ReactionId,
                    r.Emoji,
                    r.UserId,
                    UserName = r.User != null ? (r.User.DisplayName ?? r.User.UserName) : "Unknown"
                })
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error retrieving message with ID {id}");
            return StatusCode(500, "Internal server error");
        }
    }

    /// <summary>
    /// Mark a message as read
    /// </summary>
    [HttpPut("{id}/read")]
    public async Task<IActionResult> MarkAsRead(int id)
    {
        try
        {
            var message = await _context.Messages.FindAsync(id);
            if (message == null)
            {
                return NotFound();
            }

            message.IsRead = true;
            await _context.SaveChangesAsync();

            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error marking message {id} as read");
            return StatusCode(500, "Internal server error");
        }
    }

    /// <summary>
    /// Create a new message
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<object>> CreateMessage([FromBody] CreateMessageDto messageDto)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized();
            }

            var message = new Message
            {
                SenderId = userId,
                Content = messageDto.Content,
                Timestamp = DateTime.UtcNow,
                IsRead = false
            };

            _context.Messages.Add(message);
            await _context.SaveChangesAsync();

            // Get the message with sender details
            var result = await _context.Messages
                .Include(m => m.Sender)
                .FirstOrDefaultAsync(m => m.MessageId == message.MessageId);

            if (result == null)
            {
                return StatusCode(500, "Error retrieving created message");
            }

            return CreatedAtAction(nameof(GetMessage), new { id = message.MessageId }, new
            {
                result.MessageId,
                result.SenderId,
                SenderName = result.Sender?.DisplayName ?? result.Sender?.UserName,
                SenderAvatar = result.Sender?.AvatarUrl,
                result.Content,
                result.Timestamp,
                result.IsRead,
                result.Reactions
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating message");
            return StatusCode(500, "Internal server error");
        }
    }
}

public class CreateMessageDto
{
    public string Content { get; set; } = string.Empty;
}
