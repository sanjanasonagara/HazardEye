using HazardEye.API.Data;
using HazardEye.API.DTOs;
using HazardEye.API.Models;
using Microsoft.EntityFrameworkCore;
using System.Globalization;

namespace HazardEye.API.Services;

public class DashboardService : IDashboardService
{
    private readonly HazardEyeDbContext _context;
    private readonly IIncidentService _incidentService; // Reuse mapping logic if possible or map manually

    public DashboardService(HazardEyeDbContext context, IIncidentService incidentService)
    {
        _context = context;
        _incidentService = incidentService;
    }

    public async Task<DashboardStatsDto> GetDashboardStatsAsync()
    {
        var now = DateTime.UtcNow;
        var today = now.Date;
        var lastWeekStart = today.AddDays(-7);
        var lastWeekEnd = today.AddDays(-1); // Previous 7 day window comparison? 
        // Or "This week" vs "Last week". Let's stick to "Trend (Last 7 Days)" and comparison for specific counters.

        // 1. Total Incidents (All time? Or generic metric?) 
        // Usually "Total Incidents" on a dashboard might refer to "Active" or "This Month".
        // Based on user mock "Total Incidents 0 +12% from last week", let's assume it's "This Week" or "Total Recorded".
        // Let's implement as "Total Incidents All Time" for now, or "This Month". 
        // Let's go with All Time to be safe, or clarify. "Total Incidents" usually means total.
        
        var totalIncidents = await _context.Incidents.CountAsync();
        
        // Calculate change: Compare total incidents created this week vs last week?
        // Let's interpret "+12% from last week" as "Created in last 7 days vs previous 7 days".
        var thisWeekCount = await _context.Incidents.CountAsync(i => i.CreatedAt >= lastWeekStart);
        var previousWeekCount = await _context.Incidents.CountAsync(i => i.CreatedAt >= lastWeekStart.AddDays(-7) && i.CreatedAt < lastWeekStart);
        
        double totalChange = 0;
        if (previousWeekCount > 0)
        {
            totalChange = ((double)(thisWeekCount - previousWeekCount) / previousWeekCount) * 100;
        }
        else if (thisWeekCount > 0)
        {
            totalChange = 100; // 100% increase if starting from 0
        }

        // 2. Open Incidents
        var openIncidents = await _context.Incidents.CountAsync(i => i.Status == IncidentStatus.Pending || i.Status == IncidentStatus.InProgress);

        // 3. Critical Issues (Open & Critical)
        var criticalIssues = await _context.Incidents.CountAsync(i => 
            (i.Status == IncidentStatus.Pending || i.Status == IncidentStatus.InProgress) && 
            i.Severity == IncidentSeverity.Critical);

        // 4. Resolved Today
        var resolvedToday = await _context.Incidents.CountAsync(i => 
            (i.Status == IncidentStatus.Resolved || i.Status == IncidentStatus.Closed) && 
            i.ResolvedAt >= today);
            
        // Resolved Last Week on same day? Or average? 
        // User says "+5% from last week". Let's compare to "Resolved Last Monday" if today is Monday?
        // Or simpler: Resolved in last 24h vs previous 24h.
        var resolvedYesterday = await _context.Incidents.CountAsync(i => 
            (i.Status == IncidentStatus.Resolved || i.Status == IncidentStatus.Closed) && 
            i.ResolvedAt >= today.AddDays(-1) && i.ResolvedAt < today);

        double resolvedChange = 0;
        if (resolvedYesterday > 0)
        {
            resolvedChange = ((double)(resolvedToday - resolvedYesterday) / resolvedYesterday) * 100;
        }
        else if (resolvedToday > 0)
        {
            resolvedChange = 100;
        }

        // 5. Incident Trends (Last 7 Days)
        var trends = new List<DailyTrendDto>();
        for (int i = 6; i >= 0; i--)
        {
            var date = today.AddDays(-i);
            var nextDate = date.AddDays(1);
            var count = await _context.Incidents.CountAsync(x => x.CreatedAt >= date && x.CreatedAt < nextDate);
            trends.Add(new DailyTrendDto
            {
                Date = date.ToString("ddd"), // Mon, Tue...
                Count = count
            });
        }

        // 6. Recent Incidents (Last 5)
        // We'll fetching entities then mapping them.
        var recentEntities = await _context.Incidents
            .Include(i => i.AssignedToUser)
            .Include(i => i.CreatedByUser)
            .OrderByDescending(i => i.CreatedAt)
            .Take(5)
            .ToListAsync();

        var recentDtos = new List<IncidentDto>();
        // Using IIncidentService to map might be overhead if it does extra queries, but ensures consistency.
        // But GetIncidentById does single lookup. We can manually map mostly.
        // Let's assume MapToDtoAsync in IncidentService is private. 
        // We can replicate mapping here for speed or exposing Map functionality.
        // For now, let's fetch DTOs via service one by one? No, N+1 issue.
        // Let's just map manually here, similar to IncidentService.
        foreach (var incident in recentEntities)
        {
            recentDtos.Add(new IncidentDto
            {
                Id = incident.Id,
                ServerIncidentId = incident.ServerIncidentId,
                DeviceId = incident.DeviceId,
                Status = incident.Status.ToString(),
                Severity = incident.Severity.ToString(),
                Category = incident.Category.ToString(),
                CapturedAt = incident.CapturedAt,
                CreatedAt = incident.CreatedAt,
                MediaUris = incident.MediaUris,
                AssignedToName = incident.AssignedToUser != null ? $"{incident.AssignedToUser.FirstName} {incident.AssignedToUser.LastName}" : null
            });
        }

        return new DashboardStatsDto
        {
            TotalIncidents = totalIncidents,
            TotalIncidentsChange = Math.Round(totalChange, 1),
            OpenIncidents = openIncidents,
            CriticalIssues = criticalIssues,
            ResolvedToday = resolvedToday,
            ResolvedTodayChange = Math.Round(resolvedChange, 1),
            IncidentTrends = trends,
            RecentIncidents = recentDtos
        };
    }
}
