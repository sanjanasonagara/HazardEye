namespace HazardEye.API.Models;

public class AdvisoryTemplate
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Template { get; set; } = string.Empty; // Template text with placeholders
    public Dictionary<string, object> Rules { get; set; } = new(); // Rule engine config
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
}

