using HazardEye.API.Data;
using HazardEye.API.Models;
using Microsoft.EntityFrameworkCore;
using HazardEye.API.DTOs;

namespace HazardEye.API.Services;

public class ReportService : IReportService
{
    private readonly HazardEyeDbContext _context;

    public ReportService(HazardEyeDbContext context)
    {
        _context = context;
    }

    public async Task<DashboardStatsDto> GetDashboardStatsAsync()
    {
        var today = DateTime.UtcNow.Date;
        var incidentsToday = await _context.Incidents
            .CountAsync(i => i.CapturedAt.Date == today);

        var pendingHighSeverity = await _context.Incidents
            .CountAsync(i => i.Status != IncidentStatus.Closed && 
                            (i.Severity == IncidentSeverity.High || i.Severity == IncidentSeverity.Critical));

        var resolvedIncidents = await _context.Incidents
            .Where(i => i.ResolvedAt.HasValue)
            .ToListAsync();

        var averageTTR = resolvedIncidents.Any()
            ? resolvedIncidents.Average(i => (i.ResolvedAt!.Value - i.CreatedAt).TotalHours)
            : 0;

        var offlineThreshold = DateTime.UtcNow.AddHours(-1);
        var devicesOffline = await _context.Devices
            .CountAsync(d => d.Status == DeviceStatus.Active && 
                            (d.LastSeen == null || d.LastSeen < offlineThreshold));

        var totalIncidents = await _context.Incidents.CountAsync();
        var openIncidents = await _context.Incidents.CountAsync(i => i.Status != IncidentStatus.Closed && i.Status != IncidentStatus.Resolved);
        var closedIncidents = await _context.Incidents.CountAsync(i => i.Status == IncidentStatus.Closed || i.Status == IncidentStatus.Resolved);

        return new DashboardStatsDto
        {
            IncidentsToday = incidentsToday,
            PendingHighSeverity = pendingHighSeverity,
            AverageTTR = averageTTR,
            DevicesOffline = devicesOffline,
            TotalIncidents = totalIncidents,
            OpenIncidents = openIncidents,
            ClosedIncidents = closedIncidents
        };
    }

    public async Task<ReportDataDto> GenerateReportAsync(ReportRequest request)
    {
        var data = new Dictionary<string, object>();

        switch (request.ReportType.ToLower())
        {
            case "trends":
                data = await GenerateTrendsReportAsync(request.StartDate, request.EndDate);
                break;
            case "compliance":
                data = await GenerateComplianceReportAsync(request.StartDate, request.EndDate);
                break;
            case "performance":
                data = await GeneratePerformanceReportAsync(request.StartDate, request.EndDate);
                break;
            case "heatmap":
                data = await GenerateHeatmapReportAsync(request.StartDate, request.EndDate);
                break;
            default:
                data["error"] = "Unknown report type";
                break;
        }

        return new ReportDataDto
        {
            Data = data,
            Format = "json"
        };
    }

    private async Task<Dictionary<string, object>> GenerateTrendsReportAsync(DateTime startDate, DateTime endDate)
    {
        var incidents = await _context.Incidents
            .Where(i => i.CapturedAt >= startDate && i.CapturedAt <= endDate)
            .ToListAsync();

        var dailyCounts = incidents
            .GroupBy(i => i.CapturedAt.Date)
            .Select(g => new { Date = g.Key, Count = g.Count() })
            .OrderBy(x => x.Date)
            .ToList();

        return new Dictionary<string, object>
        {
            ["daily_counts"] = dailyCounts.Select(x => new { date = x.Date.ToString("yyyy-MM-dd"), count = x.Count }),
            ["total_incidents"] = incidents.Count,
            ["by_severity"] = incidents.GroupBy(i => i.Severity.ToString()).ToDictionary(g => g.Key, g => g.Count()),
            ["by_category"] = incidents.GroupBy(i => i.Category.ToString()).ToDictionary(g => g.Key, g => g.Count())
        };
    }

    private async Task<Dictionary<string, object>> GenerateComplianceReportAsync(DateTime startDate, DateTime endDate)
    {
        var incidents = await _context.Incidents
            .Where(i => i.CapturedAt >= startDate && i.CapturedAt <= endDate)
            .ToListAsync();

        var ppeIncidents = incidents.Where(i => i.Category == IncidentCategory.PPE).ToList();
        var resolvedCount = incidents.Count(i => i.Status == IncidentStatus.Resolved || i.Status == IncidentStatus.Closed);

        return new Dictionary<string, object>
        {
            ["total_incidents"] = incidents.Count,
            ["ppe_incidents"] = ppeIncidents.Count,
            ["resolved_count"] = resolvedCount,
            ["compliance_rate"] = incidents.Count > 0 ? (double)resolvedCount / incidents.Count : 0,
            ["ppe_compliance_rate"] = ppeIncidents.Count > 0 
                ? (double)ppeIncidents.Count(i => i.Status == IncidentStatus.Resolved || i.Status == IncidentStatus.Closed) / ppeIncidents.Count 
                : 0
        };
    }

    private async Task<Dictionary<string, object>> GeneratePerformanceReportAsync(DateTime startDate, DateTime endDate)
    {
        var incidents = await _context.Incidents
            .Where(i => i.CapturedAt >= startDate && i.CapturedAt <= endDate && i.ResolvedAt.HasValue)
            .Include(i => i.AssignedToUser)
            .ToListAsync();

        var teamPerformance = incidents
            .Where(i => i.AssignedToUser != null)
            .GroupBy(i => i.AssignedToUser!.Id)
            .Select(g => new
            {
                UserId = g.Key,
                UserName = $"{g.First().AssignedToUser!.FirstName} {g.First().AssignedToUser!.LastName}",
                AssignedCount = g.Count(),
                ResolvedCount = g.Count(i => i.Status == IncidentStatus.Resolved || i.Status == IncidentStatus.Closed),
                AvgResolutionTime = g.Average(i => (i.ResolvedAt!.Value - i.CreatedAt).TotalHours)
            })
            .ToList();

        return new Dictionary<string, object>
        {
            ["team_performance"] = teamPerformance,
            ["average_resolution_time"] = incidents.Any() 
                ? incidents.Average(i => (i.ResolvedAt!.Value - i.CreatedAt).TotalHours) 
                : 0
        };
    }

    private async Task<Dictionary<string, object>> GenerateHeatmapReportAsync(DateTime startDate, DateTime endDate)
    {
        var incidents = await _context.Incidents
            .Where(i => i.CapturedAt >= startDate && i.CapturedAt <= endDate)
            .ToListAsync();

        // Group by hour of day
        var hourlyData = incidents
            .GroupBy(i => i.CapturedAt.Hour)
            .Select(g => new { Hour = g.Key, Count = g.Count() })
            .OrderBy(x => x.Hour)
            .ToList();

        return new Dictionary<string, object>
        {
            ["hourly_distribution"] = hourlyData.Select(x => new { hour = x.Hour, count = x.Count }),
            ["peak_hour"] = hourlyData.OrderByDescending(x => x.Count).FirstOrDefault()?.Hour ?? 0
        };
    }
}

