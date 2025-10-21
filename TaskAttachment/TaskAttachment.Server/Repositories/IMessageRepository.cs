using System.Linq.Expressions;
using TaskAttachment.Server.Models;

namespace TaskAttachment.Server.Repositories;

public interface IMessageRepository : IRepository<Message>
{
    Task<IEnumerable<Message>> SearchAsync(
        string searchTerm,
        int? senderId = null,
        DateTime? startDate = null,
        DateTime? endDate = null,
        bool includeAttachments = false,
        int skip = 0,
        int take = 20);
        
    Task<int> SearchCountAsync(
        string searchTerm,
        int? senderId = null,
        DateTime? startDate = null,
        DateTime? endDate = null);
}
