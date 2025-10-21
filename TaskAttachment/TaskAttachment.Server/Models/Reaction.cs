using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.AspNetCore.Identity;

namespace TaskAttachment.Server.Models;

public class Reaction
{
    [Key]
    public int ReactionId { get; set; }
    
    [Required]
    public int MessageId { get; set; }
    
    [Required]
    public string UserId { get; set; } = string.Empty;
    
    [Required]
    [StringLength(10)]
    public string Emoji { get; set; } = string.Empty;
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    // Navigation properties
    [ForeignKey("MessageId")]
    public virtual Message? Message { get; set; }
    
    [ForeignKey("UserId")]
    public virtual ApplicationUser? User { get; set; }
}
