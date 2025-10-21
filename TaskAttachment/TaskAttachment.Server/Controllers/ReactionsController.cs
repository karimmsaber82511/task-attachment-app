using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TaskAttachment.Server.Data;
using TaskAttachment.Server.DTOs;
using TaskAttachment.Server.Models;
using Microsoft.AspNetCore.Authorization;

namespace TaskAttachment.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class ReactionsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<ReactionsController> _logger;

        public ReactionsController(
            ApplicationDbContext context,
            ILogger<ReactionsController> logger)
        {
            _context = context;
            _logger = logger;
        }

        // GET: api/Reactions/message/5
        [HttpGet("message/{messageId}")]
        public async Task<ActionResult<IEnumerable<ReactionDto>>> GetMessageReactions(int messageId)
        {
            try
            {
                var reactions = await _context.Reactions
                    .Where(r => r.MessageId == messageId)
                    .Include(r => r.User)
                    .Select(r => new ReactionDto
                    {
                        ReactionId = r.ReactionId,
                        MessageId = r.MessageId,
                        UserId = r.UserId,
                        Username = r.User!.UserName ?? r.User.Email ?? "Unknown User",
                        Emoji = r.Emoji,
                        CreatedAt = r.CreatedAt
                    })
                    .ToListAsync();

                return Ok(reactions);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting message reactions");
                return StatusCode(500, "Error retrieving reactions");
            }
        }

        // POST: api/Reactions
        [HttpPost]
        public async Task<ActionResult<ReactionDto>> AddReaction([FromBody] ReactionDto reactionDto)
        {
            try
            {
                // Check if the user has already reacted with the same emoji to this message
                var existingReaction = await _context.Reactions
                    .FirstOrDefaultAsync(r => r.MessageId == reactionDto.MessageId && 
                                           r.UserId == reactionDto.UserId && 
                                           r.Emoji == reactionDto.Emoji);

                if (existingReaction != null)
                {
                    // If the same reaction exists, remove it (toggle)
                    _context.Reactions.Remove(existingReaction);
                    await _context.SaveChangesAsync();
                    return NoContent();
                }

                var reaction = new Reaction
                {
                    MessageId = reactionDto.MessageId,
                    UserId = reactionDto.UserId,
                    Emoji = reactionDto.Emoji,
                    CreatedAt = DateTime.UtcNow
                };

                _context.Reactions.Add(reaction);
                await _context.SaveChangesAsync();

                // Get the created reaction with user data
                var createdReaction = await _context.Reactions
                    .Include(r => r.User)
                    .FirstOrDefaultAsync(r => r.ReactionId == reaction.ReactionId);

                if (createdReaction == null)
                {
                    return BadRequest("Failed to create reaction");
                }

                var result = new ReactionDto
                {
                    ReactionId = createdReaction.ReactionId,
                    MessageId = createdReaction.MessageId,
                    UserId = createdReaction.UserId,
                    Username = createdReaction.User?.UserName ?? createdReaction.User?.Email ?? "Unknown User",
                    Emoji = createdReaction.Emoji,
                    CreatedAt = createdReaction.CreatedAt
                };

                return CreatedAtAction(
                    nameof(GetMessageReactions), 
                    new { messageId = reaction.MessageId }, 
                    result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error adding reaction");
                return StatusCode(500, "Error adding reaction");
            }
        }

        // DELETE: api/Reactions/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> RemoveReaction(int id)
        {
            try
            {
                var reaction = await _context.Reactions.FindAsync(id);
                if (reaction == null)
                {
                    return NotFound();
                }

                _context.Reactions.Remove(reaction);
                await _context.SaveChangesAsync();

                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error removing reaction");
                return StatusCode(500, "Error removing reaction");
            }
        }
    }
}
