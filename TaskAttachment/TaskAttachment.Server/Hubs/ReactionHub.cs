using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using System.Threading.Tasks;
using TaskAttachment.Server.DTOs;

namespace TaskAttachment.Server.Hubs
{
    [Authorize]
    public class ReactionHub : Hub
    {
        private readonly IHubContext<ReactionHub> _hubContext;

        public ReactionHub(IHubContext<ReactionHub> hubContext)
        {
            _hubContext = hubContext;
        }

        public async Task JoinRoom(string roomId)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, roomId);
            await Clients.Group(roomId).SendAsync("UserJoined", Context.User?.Identity?.Name ?? "Anonymous user");
        }

        public async Task LeaveRoom(string roomId)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, roomId);
            await Clients.Group(roomId).SendAsync("UserLeft", Context.User?.Identity?.Name ?? "Anonymous user");
        }

        public async Task SendReaction(string roomId, ReactionDto reaction)
        {
            // Broadcast the reaction to all clients in the room except the sender
            await Clients.OthersInGroup(roomId).SendAsync("ReceiveReaction", reaction);
        }

        public async Task RemoveReaction(string roomId, int reactionId)
        {
            // Notify all clients in the room to remove the reaction
            await Clients.Group(roomId).SendAsync("RemoveReaction", reactionId);
        }
    }
}
