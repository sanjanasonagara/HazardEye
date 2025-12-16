using HazardEye.API.Data;
using HazardEye.API.Models;
using Microsoft.EntityFrameworkCore;

namespace HazardEye.API.Services;

public class AuditService : IAuditService
{
    private readonly HazardEyeDbContext _context;

    public AuditService(HazardEyeDbContext context)
    {
        _context = context;
    }

    public async System.Threading.Tasks.Task LogAsync(int? userId, string action, string entityType, int? entityId, Dictionary<string, object> details, string ipAddress, string userAgent)
    {
        var log = new AuditLog
        {
            UserId = userId,
            Action = action,
            EntityType = entityType,
            EntityId = entityId,
            Details = details,
            IpAddress = ipAddress,
            UserAgent = userAgent,
            Timestamp = DateTime.UtcNow
        };

        _context.AuditLogs.Add(log);
        await _context.SaveChangesAsync();
    }

    public async System.Threading.Tasks.Task<List<AuditLogDto>> GetAuditLogsAsync(AuditLogFilterRequest filter)
    {
        var query = _context.AuditLogs
            .Include(a => a.User)
            .AsQueryable();

        if (filter.StartDate.HasValue)
            query = query.Where(a => a.Timestamp >= filter.StartDate.Value);

        if (filter.EndDate.HasValue)
            query = query.Where(a => a.Timestamp <= filter.EndDate.Value);

        if (filter.UserId.HasValue)
            query = query.Where(a => a.UserId == filter.UserId.Value);

        if (!string.IsNullOrEmpty(filter.Action))
            query = query.Where(a => a.Action == filter.Action);

        if (!string.IsNullOrEmpty(filter.EntityType))
            query = query.Where(a => a.EntityType == filter.EntityType);

        var logs = await query
            .OrderByDescending(a => a.Timestamp)
            .Skip((filter.Page - 1) * filter.PageSize)
            .Take(filter.PageSize)
            .ToListAsync();

        return logs.Select(l => new AuditLogDto
        {
            Id = l.Id,
            UserId = l.UserId,
            UserName = l.User != null ? $"{l.User.FirstName} {l.User.LastName}" : null,
            Action = l.Action,
            EntityType = l.EntityType,
            EntityId = l.EntityId,
            Details = l.Details,
            IpAddress = l.IpAddress,
            Timestamp = l.Timestamp
        }).ToList();
    }
}

