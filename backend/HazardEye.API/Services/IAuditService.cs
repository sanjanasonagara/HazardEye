namespace HazardEye.API.Services;

public interface IAuditService
{
    Task LogAsync(int? userId, string action, string entityType, int? entityId, Dictionary<string, object> details, string ipAddress, string userAgent);
    Task<List<AuditLogDto>> GetAuditLogsAsync(AuditLogFilterRequest filter);
}

public class AuditLogDto
{
    public int Id { get; set; }
    public int? UserId { get; set; }
    public string? UserName { get; set; }
    public string Action { get; set; } = string.Empty;
    public string EntityType { get; set; } = string.Empty;
    public int? EntityId { get; set; }
    public Dictionary<string, object> Details { get; set; } = new();
    public string IpAddress { get; set; } = string.Empty;
    public DateTime Timestamp { get; set; }
}

public class AuditLogFilterRequest
{
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public int? UserId { get; set; }
    public string? Action { get; set; }
    public string? EntityType { get; set; }
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 50;
}

