namespace HazardEye.API.DTOs;

public class IncidentDto
{
    public int Id { get; set; }
    public string ServerIncidentId { get; set; } = string.Empty;
    public string DeviceId { get; set; } = string.Empty;
    public string? IncidentId { get; set; }
    public DateTime CapturedAt { get; set; }
    public string Severity { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public int? AssignedTo { get; set; }
    public string? AssignedToName { get; set; }
    public int CreatedBy { get; set; }
    public string CreatedByName { get; set; } = string.Empty;
    public List<string> MediaUris { get; set; } = new();
    public Dictionary<string, object> MlMetadata { get; set; } = new();
    public string? Advisory { get; set; }
    public string? Note { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? ResolvedAt { get; set; }
    public DateTime? ClosedAt { get; set; }
    public List<CommentDto> Comments { get; set; } = new();
    public List<CorrectiveActionDto> CorrectiveActions { get; set; } = new();
}

public class CreateIncidentRequest
{
    public string DeviceId { get; set; } = string.Empty;
    public string? IncidentId { get; set; }
    public DateTime CapturedAt { get; set; }
    public List<string> MediaUris { get; set; } = new();
    public Dictionary<string, object> MlMetadata { get; set; } = new();
}

public class UpdateIncidentRequest
{
    public string? Status { get; set; }
    public string? Severity { get; set; }
    public int? AssignedTo { get; set; }
    public string? Note { get; set; }
    public string? Advisory { get; set; }
}

public class IncidentFilterRequest
{
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public string? Severity { get; set; }
    public string? Category { get; set; }
    public string? Status { get; set; }
    public string? DeviceId { get; set; }
    public int? AssignedTo { get; set; }
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 25;
}

public class IncidentListResponse
{
    public List<IncidentDto> Items { get; set; } = new();
    public int TotalCount { get; set; }
    public int Page { get; set; }
    public int PageSize { get; set; }
    public int TotalPages { get; set; }
}

public class CommentDto
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public string UserName { get; set; } = string.Empty;
    public string Comment { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}

public class AddCommentRequest
{
    public string Comment { get; set; } = string.Empty;
}

public class CorrectiveActionDto
{
    public int Id { get; set; }
    public string Action { get; set; } = string.Empty;
    public DateTime DueDate { get; set; }
    public bool Completed { get; set; }
    public DateTime? CompletedAt { get; set; }
}

public class AddCorrectiveActionRequest
{
    public string Action { get; set; } = string.Empty;
    public DateTime DueDate { get; set; }
}

