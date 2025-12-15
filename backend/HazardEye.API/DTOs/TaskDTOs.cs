using HazardEye.API.Models;

namespace HazardEye.API.DTOs;

public class CreateWorkTaskDto
{
    public int IncidentId { get; set; }
    public int AssignedToUserId { get; set; }
    public string Description { get; set; } = string.Empty;
    public DateTime? DueDate { get; set; }
}

public class WorkTaskDto
{
    public int Id { get; set; }
    public int IncidentId { get; set; }
    public int AssignedToUserId { get; set; }
    public string AssignedToName { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public DateTime? DueDate { get; set; }
    public DateTime? CompletedAt { get; set; }
}
