using HazardEye.API.Models;

namespace HazardEye.API.Services;

public interface IAdvisoryService
{
    Task<IncidentSeverity> DetermineSeverityAsync(Dictionary<string, object> mlMetadata);
    Task<IncidentCategory> DetermineCategoryAsync(Dictionary<string, object> mlMetadata);
    Task<string> GenerateAdvisoryAsync(Dictionary<string, object> mlMetadata, IncidentSeverity severity);
}

