namespace HazardEye.API.Models;

public class SeverityRule
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Condition { get; set; } = string.Empty; // JSON condition expression
    public string Severity { get; set; } = string.Empty; // Maps to IncidentSeverity
    public int Priority { get; set; } // Lower = higher priority
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

