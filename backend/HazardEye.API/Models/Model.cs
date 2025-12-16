namespace HazardEye.API.Models;

public enum ModelStatus
{
    Draft,
    Published,
    Archived
}

public class Model
{
    public int Id { get; set; }
    public string Version { get; set; } = string.Empty; // e.g., "1.0.0"
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string StoragePath { get; set; } = string.Empty; // Path to model bundle
    public string? Signature { get; set; } // Server-side signature
    public ModelStatus Status { get; set; } = ModelStatus.Draft;
    public Dictionary<string, object> Metrics { get; set; } = new();
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? PublishedAt { get; set; }
    public int CreatedBy { get; set; }
    public string? ReleaseNotes { get; set; }
}

