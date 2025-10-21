using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using TaskAttachment.Server.Models;

namespace TaskAttachment.Server.Data;

public class ApplicationDbContext : IdentityDbContext<ApplicationUser>
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    // Users are now handled by Identity
    public DbSet<Message> Messages { get; set; } = null!;
    public DbSet<Attachment> Attachments { get; set; } = null!;
    public DbSet<Reaction> Reactions { get; set; } = null!;

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Configure Message entity
        modelBuilder.Entity<Message>(entity =>
        {
            entity.HasKey(m => m.MessageId);
            entity.Property(m => m.Content).IsRequired();
            entity.Property(m => m.Timestamp).IsRequired();

            // Configure relationships
            entity.HasOne(m => m.Sender)
                .WithMany()
                .HasForeignKey(m => m.SenderId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        // Configure Attachment entity
        modelBuilder.Entity<Attachment>(entity =>
        {
            entity.HasKey(a => a.AttachmentId);
            entity.Property(a => a.FileName).IsRequired();
            entity.Property(a => a.ContentType).IsRequired();
            entity.Property(a => a.StoredFileName).IsRequired();
        });

        // Configure Reaction entity
        modelBuilder.Entity<Reaction>(entity =>
        {
            entity.HasKey(r => r.ReactionId);
            entity.Property(r => r.Emoji).IsRequired();
            
            entity.HasOne(r => r.User)
                .WithMany()
                .HasForeignKey(r => r.UserId)
                .OnDelete(DeleteBehavior.Restrict);
        });    
    }
}
