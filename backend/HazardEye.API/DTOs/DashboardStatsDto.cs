namespace HazardEye.API.DTOs;

public class DashboardStatsDto
{
    public int IncidentsToday { get; set; }
    public int PendingHighSeverity { get; set; }
    public double AverageTTR { get; set; }
    public int DevicesOffline { get; set; }
    public int TotalIncidents { get; set; }
    public double TotalIncidentsChange { get; set; } // Percentage change from last week
    public int OpenIncidents { get; set; }
    public int ClosedIncidents { get; set; }
    public int CriticalIssues { get; set; }
    public int ResolvedToday { get; set; }
    public double ResolvedTodayChange { get; set; } // Percentage change from last week
    public List<DailyTrendDto> IncidentTrends { get; set; } = new();
    public List<IncidentDto> RecentIncidents { get; set; } = new();
}

public class DailyTrendDto
{
    public string Date { get; set; } = string.Empty; // "Mon", "Tue", etc. or "YYYY-MM-DD"
    public int Count { get; set; }
}
