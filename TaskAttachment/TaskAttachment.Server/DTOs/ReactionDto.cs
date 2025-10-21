namespace TaskAttachment.Server.DTOs;

public class ReactionDto
{
    public int ReactionId { get; set; }
    public int MessageId { get; set; }
    public string UserId { get; set; } = string.Empty;
    public string Emoji { get; set; } = string.Empty;
    public string? Username { get; set; }
    public DateTime CreatedAt { get; set; }
}
