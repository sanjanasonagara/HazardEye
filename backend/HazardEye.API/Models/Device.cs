namespace HazardEye.API.Models;

public enum DeviceStatus
{
    Active,
    Revoked,
    Offline
}

public class Device
{
    public int Id { get; set; }
    public string DeviceId { get; set; } = string.Empty; // Unique device identifier
    public string Model { get; set; } = string.Empty;
    public string? ModelVersion { get; set; }
    public DeviceStatus Status { get; set; } = DeviceStatus.Active;
    public DateTime RegisteredAt { get; set; } = DateTime.UtcNow;
    public DateTime? LastSeen { get; set; }
    public string? LastKnownLocation { get; set; }
    public Dictionary<string, object> Metadata { get; set; } = new();
}

