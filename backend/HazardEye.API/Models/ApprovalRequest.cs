namespace HazardEye.API.Models;

public enum ApprovalStatus
{
    Pending,
    Approved,
    Rejected
}

public enum ApprovalActionType
{
    DeleteIncident,
    RollbackModel,
    RevokeDevice,
    DeleteUser,
    SystemConfigChange
}

public class ApprovalRequest
{
    public int Id { get; set; }
    public ApprovalActionType ActionType { get; set; }
    public string EntityType { get; set; } = string.Empty;
    public int EntityId { get; set; }
    public int RequestedBy { get; set; }
    public int? ApprovedBy { get; set; }
    public ApprovalStatus Status { get; set; } = ApprovalStatus.Pending;
    public string Reason { get; set; } = string.Empty;
    public Dictionary<string, object> Metadata { get; set; } = new();
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? ResolvedAt { get; set; }
}

