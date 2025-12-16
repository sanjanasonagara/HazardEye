namespace HazardEye.API.Models;

public enum IncidentStatus
{
    Pending,
    Assigned,
    InProgress,
    Resolved,
    Closed,
    Rejected
}

public enum IncidentSeverity
{
    Low,
    Medium,
    High,
    Critical
}

public enum IncidentCategory
{
    PPE,
    Fire,
    Chemical,
    Structural,
    Electrical,
    Other
}

public class Incident
{
    public int Id { get; set; }
    public string ServerIncidentId { get; set; } = string.Empty; // Unique server-side ID
    public string DeviceId { get; set; } = string.Empty;
    public string? IncidentId { get; set; } // Client-side ID (nullable for backward compat)
    public DateTime CapturedAt { get; set; }
    public IncidentSeverity Severity { get; set; }
    public IncidentCategory Category { get; set; }
    public IncidentStatus Status { get; set; } = IncidentStatus.Pending;
    public int? AssignedTo { get; set; }
    public int CreatedBy { get; set; }
    public List<string> MediaUris { get; set; } = new();
    public Dictionary<string, object> MlMetadata { get; set; } = new();
    public string? Advisory { get; set; }
    public string? Note { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? ResolvedAt { get; set; }
    public DateTime? ClosedAt { get; set; }
    public List<IncidentComment> Comments { get; set; } = new();
    public List<CorrectiveAction> CorrectiveActions { get; set; } = new();

    // Navigation properties
    public User? AssignedToUser { get; set; }
    public User CreatedByUser { get; set; } = null!;
}

public class IncidentComment
{
    public int Id { get; set; }
    public int IncidentId { get; set; }
    public int UserId { get; set; }
    public string Comment { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public User User { get; set; } = null!;
}

public class CorrectiveAction
{
    public int Id { get; set; }
    public int IncidentId { get; set; }
    public string Action { get; set; } = string.Empty;
    public DateTime DueDate { get; set; }
    public bool Completed { get; set; }
    public DateTime? CompletedAt { get; set; }
    public int? CompletedBy { get; set; }
}

