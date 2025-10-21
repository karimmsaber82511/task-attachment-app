using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using Microsoft.EntityFrameworkCore;
using TaskAttachment.Server.Data;
using TaskAttachment.Server.Models;
using System.IO;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Logging;

namespace TaskAttachment.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class FilesController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IWebHostEnvironment _env;
        private readonly IConfiguration _configuration;
        private readonly ILogger<FilesController> _logger;
        private readonly long _fileSizeLimit;
        private readonly string[] _allowedExtensions = { ".jpg", ".jpeg", ".png", ".gif", ".pdf" };

        public FilesController(
            ApplicationDbContext context,
            IWebHostEnvironment env,
            IConfiguration configuration,
            ILogger<FilesController> logger)
        {
            _context = context;
            _env = env;
            _configuration = configuration;
            _logger = logger;
            _fileSizeLimit = _configuration.GetValue<long>("FileUpload:SizeLimit", 10 * 1024 * 1024); // Default 10MB
        }

        [HttpPost("upload")]
        public async Task<IActionResult> UploadFile([FromForm] IFormFile file, [FromForm] int messageId, [FromForm] int userId)
        {
            try
            {
                if (file == null || file.Length == 0)
                    return BadRequest("No file uploaded.");

                // Validate file size
                if (file.Length > _fileSizeLimit)
                    return BadRequest($"File size exceeds the maximum limit of {_fileSizeLimit / (1024 * 1024)}MB");

                // Validate file extension
                var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
                if (string.IsNullOrEmpty(extension) || !_allowedExtensions.Contains(extension))
                    return BadRequest("Invalid file type. Allowed types: " + string.Join(", ", _allowedExtensions));

                // Create uploads directory if it doesn't exist
                var uploadsFolder = Path.Combine(_env.WebRootPath, "uploads");
                if (!Directory.Exists(uploadsFolder))
                {
                    Directory.CreateDirectory(uploadsFolder);
                }

                // Generate a unique file name
                var uniqueFileName = $"{Guid.NewGuid()}{extension}";
                var filePath = Path.Combine(uploadsFolder, uniqueFileName);

                // Save the file
                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await file.CopyToAsync(stream);
                }

                // Create attachment record
                var attachment = new Attachment
                {
                    MessageId = messageId,
                    FileName = file.FileName,
                    ContentType = file.ContentType,
                    StoredFileName = uniqueFileName,
                    FileSize = file.Length,
                    UploadDate = DateTime.UtcNow
                };

                _context.Attachments.Add(attachment);
                await _context.SaveChangesAsync();

                // Create the URL for the file
                var fileUrl = $"/uploads/{attachment.StoredFileName}";

                return Ok(new 
                { 
                    id = attachment.AttachmentId, 
                    url = fileUrl,
                    name = attachment.FileName,
                    size = attachment.FileSize,
                    type = attachment.ContentType
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error uploading file");
                return StatusCode(500, "Internal server error while uploading file");
            }
        }

        [HttpGet("download/{id}")]
        public async Task<IActionResult> DownloadFile(int id)
        {
            var attachment = await _context.Attachments.FindAsync(id);
            if (attachment == null)
                return NotFound();

            var filePath = Path.Combine(_env.WebRootPath, "uploads", attachment.StoredFileName);
            if (!System.IO.File.Exists(filePath))
                return NotFound();

            var memory = new MemoryStream();
            using (var stream = new FileStream(filePath, FileMode.Open))
            {
                await stream.CopyToAsync(memory);
            }
            memory.Position = 0;

            return File(memory, attachment.ContentType ?? GetContentType(filePath), attachment.FileName);
        }

        private string GetContentType(string path)
        {
            var types = new Dictionary<string, string>
            {
                { ".png", "image/png" },
                { ".jpg", "image/jpeg" },
                { ".jpeg", "image/jpeg" },
                { ".gif", "image/gif" },
                { ".pdf", "application/pdf" }
            };

            var ext = Path.GetExtension(path).ToLowerInvariant();
            return types.ContainsKey(ext) ? types[ext] : "application/octet-stream";
        }
    }
}
