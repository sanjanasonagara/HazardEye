using HazardEye.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using HazardEye.API.DTOs;

namespace HazardEye.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ReportsController : ControllerBase
{
    private readonly IReportService _reportService;

    public ReportsController(IReportService reportService)
    {
        _reportService = reportService;
    }

    [HttpPost]
    [Authorize(Policy = "SafetyOfficerOrAdmin")]
    public async Task<ActionResult> GenerateReport([FromBody] ReportRequest request)
    {
        var report = await _reportService.GenerateReportAsync(request);
        return Ok(report);
    }
}

