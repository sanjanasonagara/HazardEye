namespace HazardEye.API.Models;

public class AuditLog
{
    public int Id { get; set; }
    public int? UserId { get; set; }
    public string Action { get; set; } = string.Empty; // e.g., "INCIDENT_ASSIGNED", "DEVICE_REVOKED"
    public string EntityType { get; set; } = string.Empty; // e.g., "Incident", "Device"
    public int? EntityId { get; set; }
    public Dictionary<string, object> Details { get; set; } = new();
    public string IpAddress { get; set; } = string.Empty;
    public string UserAgent { get; set; } = string.Empty;
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;

    public User? User { get; set; }
}

