using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HazardEye.API.Models;

public enum TaskStatus
{
    Pending,
    Assigned,
    InProgress,
    Completed,
    Overdue
}

public class WorkTask
{
    [Key]
    public int Id { get; set; }

    [ForeignKey("Incident")]
    public int IncidentId { get; set; }
    
    [ForeignKey("AssignedToUser")]
    public int AssignedToUserId { get; set; }

    public string Description { get; set; } = string.Empty;

    public TaskStatus Status { get; set; } = TaskStatus.Pending;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? DueDate { get; set; }
    public DateTime? CompletedAt { get; set; }

    // Navigation properties
    public Incident Incident { get; set; } = null!;
    public User AssignedToUser { get; set; } = null!;
}
