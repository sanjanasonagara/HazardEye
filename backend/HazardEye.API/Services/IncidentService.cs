using HazardEye.API.Data;
using HazardEye.API.DTOs;
using HazardEye.API.Models;
using Microsoft.EntityFrameworkCore;

namespace HazardEye.API.Services;

public class IncidentService : IIncidentService
{
    private readonly HazardEyeDbContext _context;
    private readonly IStorageService _storageService;
    private readonly IAdvisoryService _advisoryService;
    private readonly IAuditService _auditService;

    public IncidentService(
        HazardEyeDbContext context,
        IStorageService storageService,
        IAdvisoryService advisoryService,
        IAuditService auditService)
    {
        _context = context;
        _storageService = storageService;
        _advisoryService = advisoryService;
        _auditService = auditService;
    }

    public async Task<IncidentDto> CreateIncidentAsync(CreateIncidentRequest request, int createdBy)
    {
        var serverIncidentId = $"INC-{DateTime.UtcNow:yyyyMMdd}-{Guid.NewGuid():N}";
        
        var incident = new Incident
        {
            ServerIncidentId = serverIncidentId,
            DeviceId = request.DeviceId,
            IncidentId = request.IncidentId,
            CapturedAt = request.CapturedAt,
            MediaUris = request.MediaUris,
            MlMetadata = request.MlMetadata,
            CreatedBy = createdBy,
            Status = IncidentStatus.Pending
        };

        // Apply severity rules
        incident.Severity = await _advisoryService.DetermineSeverityAsync(request.MlMetadata);
        incident.Category = await _advisoryService.DetermineCategoryAsync(request.MlMetadata);
        incident.Advisory = await _advisoryService.GenerateAdvisoryAsync(request.MlMetadata, incident.Severity);

        _context.Incidents.Add(incident);
        await _context.SaveChangesAsync();

        await _auditService.LogAsync(createdBy, "INCIDENT_CREATED", "Incident", incident.Id, new Dictionary<string, object>
        {
            ["ServerIncidentId"] = serverIncidentId,
            ["DeviceId"] = request.DeviceId
        }, "", "");

        return await MapToDtoAsync(incident);
    }

    public async Task<IncidentListResponse> GetIncidentsAsync(IncidentFilterRequest filter)
    {
        var query = _context.Incidents
            .Include(i => i.AssignedToUser)
            .Include(i => i.CreatedByUser)
            .AsQueryable();

        if (filter.StartDate.HasValue)
            query = query.Where(i => i.CapturedAt >= filter.StartDate.Value);

        if (filter.EndDate.HasValue)
            query = query.Where(i => i.CapturedAt <= filter.EndDate.Value);

        if (!string.IsNullOrEmpty(filter.Severity))
            query = query.Where(i => i.Severity.ToString() == filter.Severity);

        if (!string.IsNullOrEmpty(filter.Category))
            query = query.Where(i => i.Category.ToString() == filter.Category);

        if (!string.IsNullOrEmpty(filter.Status))
            query = query.Where(i => i.Status.ToString() == filter.Status);

        if (!string.IsNullOrEmpty(filter.DeviceId))
            query = query.Where(i => i.DeviceId == filter.DeviceId);

        if (filter.AssignedTo.HasValue)
            query = query.Where(i => i.AssignedTo == filter.AssignedTo.Value);

        var totalCount = await query.CountAsync();
        var totalPages = (int)Math.Ceiling(totalCount / (double)filter.PageSize);

        var incidents = await query
            .OrderByDescending(i => i.CapturedAt)
            .Skip((filter.Page - 1) * filter.PageSize)
            .Take(filter.PageSize)
            .ToListAsync();

        var items = new List<IncidentDto>();
        foreach (var incident in incidents)
        {
            items.Add(await MapToDtoAsync(incident));
        }

        return new IncidentListResponse
        {
            Items = items,
            TotalCount = totalCount,
            Page = filter.Page,
            PageSize = filter.PageSize,
            TotalPages = totalPages
        };
    }

    public async Task<IncidentDto?> GetIncidentByIdAsync(int id)
    {
        var incident = await _context.Incidents
            .Include(i => i.AssignedToUser)
            .Include(i => i.CreatedByUser)
            .Include(i => i.Comments)
                .ThenInclude(c => c.User)
            .FirstOrDefaultAsync(i => i.Id == id);

        if (incident == null) return null;

        return await MapToDtoAsync(incident);
    }

    public async Task<IncidentDto?> UpdateIncidentAsync(int id, UpdateIncidentRequest request, int userId)
    {
        var incident = await _context.Incidents.FindAsync(id);
        if (incident == null) return null;

        var oldStatus = incident.Status.ToString();

        if (!string.IsNullOrEmpty(request.Status))
            incident.Status = Enum.Parse<IncidentStatus>(request.Status);

        if (!string.IsNullOrEmpty(request.Severity))
            incident.Severity = Enum.Parse<IncidentSeverity>(request.Severity);

        if (request.AssignedTo.HasValue)
            incident.AssignedTo = request.AssignedTo.Value;

        if (request.Note != null)
            incident.Note = request.Note;

        if (request.Advisory != null)
            incident.Advisory = request.Advisory;

        if (incident.Status == IncidentStatus.Resolved && !incident.ResolvedAt.HasValue)
            incident.ResolvedAt = DateTime.UtcNow;

        if (incident.Status == IncidentStatus.Closed && !incident.ClosedAt.HasValue)
            incident.ClosedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        await _auditService.LogAsync(userId, "INCIDENT_UPDATED", "Incident", id, new Dictionary<string, object>
        {
            ["OldStatus"] = oldStatus,
            ["NewStatus"] = incident.Status.ToString(),
            ["AssignedTo"] = request.AssignedTo
        }, "", "");

        return await GetIncidentByIdAsync(id);
    }

    public async Task<bool> DeleteIncidentAsync(int id, int userId)
    {
        var incident = await _context.Incidents.FindAsync(id);
        if (incident == null) return false;

        _context.Incidents.Remove(incident);
        await _context.SaveChangesAsync();

        await _auditService.LogAsync(userId, "INCIDENT_DELETED", "Incident", id, new Dictionary<string, object>(), "", "");

        return true;
    }

    public async Task<CommentDto> AddCommentAsync(int incidentId, AddCommentRequest request, int userId)
    {
        var comment = new IncidentComment
        {
            IncidentId = incidentId,
            UserId = userId,
            Comment = request.Comment
        };

        _context.Set<IncidentComment>().Add(comment);
        await _context.SaveChangesAsync();

        var commentWithUser = await _context.Set<IncidentComment>()
            .Include(c => c.User)
            .FirstAsync(c => c.Id == comment.Id);

        return new CommentDto
        {
            Id = commentWithUser.Id,
            UserId = commentWithUser.UserId,
            UserName = $"{commentWithUser.User.FirstName} {commentWithUser.User.LastName}",
            Comment = commentWithUser.Comment,
            CreatedAt = commentWithUser.CreatedAt
        };
    }

    public async Task<CorrectiveActionDto> AddCorrectiveActionAsync(int incidentId, AddCorrectiveActionRequest request)
    {
        var action = new CorrectiveAction
        {
            IncidentId = incidentId,
            Action = request.Action,
            DueDate = request.DueDate
        };

        _context.Set<CorrectiveAction>().Add(action);
        await _context.SaveChangesAsync();

        return new CorrectiveActionDto
        {
            Id = action.Id,
            Action = action.Action,
            DueDate = action.DueDate,
            Completed = action.Completed
        };
    }

    public async Task<string> GetPresignedMediaUrlAsync(string mediaUri, int expirationMinutes = 15)
    {
        return await _storageService.GetPresignedUrlAsync(mediaUri, expirationMinutes);
    }

    public async Task<bool> RerunMLAsync(int incidentId)
    {
        var incident = await _context.Incidents.FindAsync(incidentId);
        if (incident == null) return false;

        // Queue ML re-run (in production, use a message queue)
        // For now, just update metadata timestamp
        incident.MlMetadata["rerun_requested_at"] = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        return true;
    }

    private async Task<IncidentDto> MapToDtoAsync(Incident incident)
    {
        var dto = new IncidentDto
        {
            Id = incident.Id,
            ServerIncidentId = incident.ServerIncidentId,
            DeviceId = incident.DeviceId,
            IncidentId = incident.IncidentId,
            CapturedAt = incident.CapturedAt,
            Severity = incident.Severity.ToString(),
            Category = incident.Category.ToString(),
            Status = incident.Status.ToString(),
            AssignedTo = incident.AssignedTo,
            AssignedToName = incident.AssignedToUser != null 
                ? $"{incident.AssignedToUser.FirstName} {incident.AssignedToUser.LastName}" 
                : null,
            CreatedBy = incident.CreatedBy,
            CreatedByName = $"{incident.CreatedByUser.FirstName} {incident.CreatedByUser.LastName}",
            MediaUris = incident.MediaUris,
            MlMetadata = incident.MlMetadata,
            Advisory = incident.Advisory,
            Note = incident.Note,
            CreatedAt = incident.CreatedAt,
            ResolvedAt = incident.ResolvedAt,
            ClosedAt = incident.ClosedAt
        };

        // Load comments if not already loaded
        if (incident.Comments == null || incident.Comments.Count == 0)
        {
            var comments = await _context.Set<IncidentComment>()
                .Include(c => c.User)
                .Where(c => c.IncidentId == incident.Id)
                .ToListAsync();
            
            dto.Comments = comments.Select(c => new CommentDto
            {
                Id = c.Id,
                UserId = c.UserId,
                UserName = $"{c.User.FirstName} {c.User.LastName}",
                Comment = c.Comment,
                CreatedAt = c.CreatedAt
            }).ToList();
        }
        else
        {
            dto.Comments = incident.Comments.Select(c => new CommentDto
            {
                Id = c.Id,
                UserId = c.UserId,
                UserName = $"{c.User.FirstName} {c.User.LastName}",
                Comment = c.Comment,
                CreatedAt = c.CreatedAt
            }).ToList();
        }

        // Load corrective actions
        var actions = await _context.Set<CorrectiveAction>()
            .Where(a => a.IncidentId == incident.Id)
            .ToListAsync();
        
        dto.CorrectiveActions = actions.Select(a => new CorrectiveActionDto
        {
            Id = a.Id,
            Action = a.Action,
            DueDate = a.DueDate,
            Completed = a.Completed,
            CompletedAt = a.CompletedAt
        }).ToList();

        return dto;
    }
}

