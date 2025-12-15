using HazardEye.API.DTOs;
using HazardEye.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace HazardEye.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class IncidentsController : ControllerBase
{
    private readonly IIncidentService _incidentService;

    public IncidentsController(IIncidentService incidentService)
    {
        _incidentService = incidentService;
    }

    [HttpPost]
    public async Task<ActionResult<IncidentDto>> CreateIncident([FromBody] CreateIncidentRequest request)
    {
        var userId = GetCurrentUserId();
        var incident = await _incidentService.CreateIncidentAsync(request, userId);
        return CreatedAtAction(nameof(GetIncident), new { id = incident.Id }, incident);
    }

    [HttpGet]
    [Authorize(Policy = "SafetyOfficerOrAdmin")]
    public async Task<ActionResult<IncidentListResponse>> GetIncidents([FromQuery] IncidentFilterRequest filter)
    {
        var response = await _incidentService.GetIncidentsAsync(filter);
        return Ok(response);
    }

    [HttpGet("{id}")]
    [Authorize(Policy = "SafetyOfficerOrAdmin")]
    public async Task<ActionResult<IncidentDto>> GetIncident(int id)
    {
        var incident = await _incidentService.GetIncidentByIdAsync(id);
        if (incident == null)
        {
            return NotFound();
        }
        return Ok(incident);
    }

    [HttpPut("{id}")]
    [Authorize(Policy = "SafetyOfficerOrAdmin")]
    public async Task<ActionResult<IncidentDto>> UpdateIncident(int id, [FromBody] UpdateIncidentRequest request)
    {
        var userId = GetCurrentUserId();
        var incident = await _incidentService.UpdateIncidentAsync(id, request, userId);
        if (incident == null)
        {
            return NotFound();
        }
        return Ok(incident);
    }

    [HttpDelete("{id}")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> DeleteIncident(int id)
    {
        var userId = GetCurrentUserId();
        var deleted = await _incidentService.DeleteIncidentAsync(id, userId);
        if (!deleted)
        {
            return NotFound();
        }
        return NoContent();
    }

    [HttpPost("{id}/comments")]
    [Authorize(Policy = "SafetyOfficerOrAdmin")]
    public async Task<ActionResult<CommentDto>> AddComment(int id, [FromBody] AddCommentRequest request)
    {
        var userId = GetCurrentUserId();
        var comment = await _incidentService.AddCommentAsync(id, request, userId);
        return Ok(comment);
    }

    [HttpPost("{id}/corrective-actions")]
    [Authorize(Policy = "SafetyOfficerOrAdmin")]
    public async Task<ActionResult<CorrectiveActionDto>> AddCorrectiveAction(int id, [FromBody] AddCorrectiveActionRequest request)
    {
        var action = await _incidentService.AddCorrectiveActionAsync(id, request);
        return Ok(action);
    }

    [HttpGet("{id}/media/{mediaIndex}/url")]
    [Authorize(Policy = "SafetyOfficerOrAdmin")]
    public async Task<ActionResult<string>> GetMediaUrl(int id, int mediaIndex, [FromQuery] int expirationMinutes = 15)
    {
        var incident = await _incidentService.GetIncidentByIdAsync(id);
        if (incident == null || mediaIndex < 0 || mediaIndex >= incident.MediaUris.Count)
        {
            return NotFound();
        }

        var url = await _incidentService.GetPresignedMediaUrlAsync(incident.MediaUris[mediaIndex], expirationMinutes);
        return Ok(new { url });
    }

    [HttpPost("{id}/rerun-ml")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> RerunML(int id)
    {
        var success = await _incidentService.RerunMLAsync(id);
        if (!success)
        {
            return NotFound();
        }
        return Ok(new { message = "ML re-run queued" });
    }

    private int GetCurrentUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return int.Parse(userIdClaim ?? "0");
    }
}

