using HazardEye.API.Data;
using HazardEye.API.DTOs;
using HazardEye.API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TaskStatus = HazardEye.API.Models.TaskStatus;

namespace HazardEye.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class TasksController : ControllerBase
{
    private readonly HazardEyeDbContext _context;
    private readonly ILogger<TasksController> _logger;

    public TasksController(HazardEyeDbContext context, ILogger<TasksController> logger)
    {
        _context = context;
        _logger = logger;
    }

    [HttpGet]
    [Authorize(Roles = "SafetyOfficer,Admin")]
    public async Task<ActionResult<IEnumerable<WorkTaskDto>>> GetTasks()
    {
        var tasks = await _context.Tasks
            .Include(t => t.AssignedToUser)
            .OrderByDescending(t => t.CreatedAt)
            .Select(t => new WorkTaskDto
            {
                Id = t.Id,
                IncidentId = t.IncidentId,
                AssignedToUserId = t.AssignedToUserId,
                AssignedToName = $"{t.AssignedToUser.FirstName} {t.AssignedToUser.LastName}",
                Description = t.Description,
                Status = t.Status.ToString(),
                CreatedAt = t.CreatedAt,
                DueDate = t.DueDate,
                CompletedAt = t.CompletedAt
            })
            .ToListAsync();

        return Ok(tasks);
    }

    [HttpPost]
    [Authorize(Roles = "SafetyOfficer,Admin")]
    public async Task<ActionResult<WorkTaskDto>> CreateTask(CreateWorkTaskDto createTaskDto)
    {
        var assignedUser = await _context.Users.FindAsync(createTaskDto.AssignedToUserId);
        if (assignedUser == null)
        {
            return BadRequest("Assigned user not found.");
        }

        var incident = await _context.Incidents.FindAsync(createTaskDto.IncidentId);
        if (incident == null)
        {
            return BadRequest("Incident not found.");
        }

        var task = new WorkTask
        {
            IncidentId = createTaskDto.IncidentId,
            AssignedToUserId = createTaskDto.AssignedToUserId,
            Description = createTaskDto.Description,
            DueDate = createTaskDto.DueDate,
            Status = HazardEye.API.Models.TaskStatus.Assigned
        };

        _context.Tasks.Add(task);
        await _context.SaveChangesAsync();

        var taskDto = new WorkTaskDto
        {
            Id = task.Id,
            IncidentId = task.IncidentId,
            AssignedToUserId = task.AssignedToUserId,
            AssignedToName = $"{assignedUser.FirstName} {assignedUser.LastName}",
            Description = task.Description,
            Status = task.Status.ToString(),
            CreatedAt = task.CreatedAt,
            DueDate = task.DueDate,
            CompletedAt = task.CompletedAt
        };

        return CreatedAtAction(nameof(GetTasks), new { id = task.Id }, taskDto);
    }

    [HttpPut("{id}/status")]
    public async Task<IActionResult> UpdateTaskStatus(int id, [FromBody] string status)
    {
         if (!Enum.TryParse<HazardEye.API.Models.TaskStatus>(status, true, out var newStatus))
        {
            return BadRequest("Invalid status.");
        }

        var task = await _context.Tasks.FindAsync(id);
        if (task == null)
        {
            return NotFound();
        }

        task.Status = newStatus;
        if (newStatus == HazardEye.API.Models.TaskStatus.Completed)
        {
            task.CompletedAt = DateTime.UtcNow;
        }
        else
        {
            task.CompletedAt = null;
        }

        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpPost("sync")]
    [Authorize(Roles = "SafetyOfficer,Admin,Worker")]
    public async Task<IActionResult> SyncTask([FromBody] SyncTaskRequest request)
    {
        // Try to match task or create it.
        // We'll match by external ID if we had a mapping, but for now we use description as a heuristic.
        var task = await _context.Tasks.FirstOrDefaultAsync(t => t.Description == request.Description);
        
        if (task == null)
        {
            // Resolve Incident Entity
            // Resolve Incident Entity
            Incident? incidentEntity = null;
            _logger.LogInformation("[SyncTask] Processing Task: {Description}, ExtID: {Id}, IncID Req: {IncidentId}", request.Description, request.Id, request.IncidentId);

            if (!string.IsNullOrEmpty(request.IncidentId) && int.TryParse(request.IncidentId, out var id)) 
            {
                // Verify it actually exists in DB to avoid FK error
                incidentEntity = await _context.Incidents.FindAsync(id);
                if (incidentEntity == null) _logger.LogWarning("[SyncTask] Incident ID {Id} not found in DB.", id);
            }

            // If invalid or lookup failed, use fallback
            if (incidentEntity == null)
            {
                _logger.LogInformation("[SyncTask] Using 'General Tasks' fallback.");
                incidentEntity = await _context.Incidents.FirstOrDefaultAsync(i => i.Advisory == "General Tasks");
                if (incidentEntity == null)
                {
                    _logger.LogInformation("[SyncTask] Creating 'General Tasks' incident.");
                    incidentEntity = new Incident
                    {
                        Advisory = "General Tasks",
                        Severity = HazardEye.API.Models.IncidentSeverity.Low,
                        Status = HazardEye.API.Models.IncidentStatus.Pending,
                        CreatedAt = DateTime.UtcNow,
                        CreatedBy = 1 // Assume Admin exists
                    };
                    _context.Incidents.Add(incidentEntity);
                    await _context.SaveChangesAsync();
                }
            }

            if (incidentEntity.Id == 0)
            {
                 _logger.LogError("[SyncTask] Resolved Incident Entity has ID 0 even after save/fetch.");
                 throw new Exception("Resolved Incident Entity has ID 0.");
            }
            _logger.LogInformation("[SyncTask] Resolved Incident ID: {Id}", incidentEntity.Id);

            // Resolve Assigned User
            int assignedUserId = 0;
            if (!string.IsNullOrEmpty(request.Assignee))
            {
                var user = await _context.Users.FirstOrDefaultAsync(u => (u.FirstName + " " + u.LastName) == request.Assignee);
                if (user != null) assignedUserId = user.Id;
            }
            
            // Fallback to current authenticated user or first user
            if (assignedUserId == 0)
            {
                var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
                if (!string.IsNullOrEmpty(userIdClaim) && int.TryParse(userIdClaim, out var uid))
                {
                    assignedUserId = uid;
                }
                else
                {
                    assignedUserId = await _context.Users.Select(u => u.Id).FirstOrDefaultAsync();
                }
            }

            task = new WorkTask
            {
                IncidentId = incidentEntity.Id,
                AssignedToUserId = assignedUserId, 
                Description = request.Description,
                DueDate = request.DueDate?.ToUniversalTime(),
                Status = Enum.TryParse<TaskStatus>(request.Status, true, out var s) ? s : TaskStatus.Assigned,
                CreatedAt = request.CreatedAt ?? DateTime.UtcNow
            };
            _context.Tasks.Add(task);
        }
        else
        {
            task.Status = Enum.TryParse<TaskStatus>(request.Status, true, out var s) ? s : task.Status;
            task.Description = request.Description;
            task.DueDate = request.DueDate?.ToUniversalTime();
        }

        await _context.SaveChangesAsync();
        return Ok(new { id = task.Id, externalId = request.Id });
    }
}

public class SyncTaskRequest
{
    public string Id { get; set; } = string.Empty;
    public string? IncidentId { get; set; }
    public string? Assignee { get; set; }
    public string Description { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public DateTime? DueDate { get; set; }
    public DateTime? CreatedAt { get; set; }
}
