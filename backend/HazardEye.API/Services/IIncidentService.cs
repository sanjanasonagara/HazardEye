using HazardEye.API.DTOs;

namespace HazardEye.API.Services;

public interface IIncidentService
{
    Task<IncidentDto> CreateIncidentAsync(CreateIncidentRequest request, int createdBy);
    Task<IncidentListResponse> GetIncidentsAsync(IncidentFilterRequest filter);
    Task<IncidentDto?> GetIncidentByIdAsync(int id);
    Task<IncidentDto?> UpdateIncidentAsync(int id, UpdateIncidentRequest request, int userId);
    Task<bool> DeleteIncidentAsync(int id, int userId);
    Task<CommentDto> AddCommentAsync(int incidentId, AddCommentRequest request, int userId);
    Task<CorrectiveActionDto> AddCorrectiveActionAsync(int incidentId, AddCorrectiveActionRequest request);
    Task<string> GetPresignedMediaUrlAsync(string mediaUri, int expirationMinutes = 15);
    Task<bool> RerunMLAsync(int incidentId);
}

