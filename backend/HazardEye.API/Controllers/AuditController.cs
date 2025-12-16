using HazardEye.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HazardEye.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Policy = "AuditorOrAdmin")]
public class AuditController : ControllerBase
{
    private readonly IAuditService _auditService;

    public AuditController(IAuditService auditService)
    {
        _auditService = auditService;
    }

    [HttpGet]
    public async Task<ActionResult> GetAuditLogs([FromQuery] AuditLogFilterRequest filter)
    {
        var logs = await _auditService.GetAuditLogsAsync(filter);
        return Ok(logs);
    }
}

