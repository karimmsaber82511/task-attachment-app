using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TaskAttachment.Server.Models
{
    public class Attachment
    {
        [Key]
        public int AttachmentId { get; set; }

        [Required]
        public int MessageId { get; set; }

        [Required]
        [StringLength(255)]
        public string FileName { get; set; } = string.Empty;

        [Required]
        [StringLength(100)]
        public string ContentType { get; set; } = string.Empty;

        [Required]
        public string StoredFileName { get; set; } = string.Empty;

        public long FileSize { get; set; }

        public DateTime UploadDate { get; set; } = DateTime.UtcNow;

        // Navigation property
        [ForeignKey("MessageId")]
        public virtual Message? Message { get; set; }
    }
}
