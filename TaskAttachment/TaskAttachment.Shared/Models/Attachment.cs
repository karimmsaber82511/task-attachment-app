using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TaskAttachment.Shared.Models
{
    public class Attachment
    {
        [Key]
        public int AttachmentId { get; set; }
        
        [Required]
        public int MessageId { get; set; }
        
        [Required]
        [StringLength(50)]
        public string FileName { get; set; }
        
        [Required]
        [StringLength(100)]
        public string FileType { get; set; }
        
        [Required]
        public string FilePath { get; set; }
        
        public long FileSize { get; set; }
        
        public DateTime UploadDate { get; set; } = DateTime.UtcNow;
        
        // Navigation property
        public virtual Message Message { get; set; }
    }
}
