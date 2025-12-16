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
[Authorize(Roles = "SafetyOfficer,Admin")]
public class TasksController : ControllerBase
{
    private readonly HazardEyeDbContext _context;

    public TasksController(HazardEyeDbContext context)
    {
        _context = context;
    }

    [HttpGet]
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
}
