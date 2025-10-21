using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.AspNetCore.Identity;

namespace TaskAttachment.Server.Models;

public class Message
{
    public int MessageId { get; set; }
    public string SenderId { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    public bool IsRead { get; set; } = false;

    // Navigation properties
    [ForeignKey("SenderId")]
    public virtual ApplicationUser? Sender { get; set; }
    public virtual ICollection<Attachment> Attachments { get; set; } = new List<Attachment>();
    public virtual ICollection<Reaction> Reactions { get; set; } = new List<Reaction>();
}
