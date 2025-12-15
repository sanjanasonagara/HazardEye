namespace HazardEye.API.Services;

public interface IReportService
{
    Task<DashboardStatsDto> GetDashboardStatsAsync();
    Task<ReportDataDto> GenerateReportAsync(ReportRequest request);
}

public class DashboardStatsDto
{
    public int IncidentsToday { get; set; }
    public int PendingHighSeverity { get; set; }
    public double AverageTTR { get; set; } // Time to resolve in hours
    public int DevicesOffline { get; set; }
    public int TotalIncidents { get; set; }
    public int OpenIncidents { get; set; }
    public int ClosedIncidents { get; set; }
}

public class ReportRequest
{
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public string ReportType { get; set; } = string.Empty; // "trends", "compliance", "performance", "heatmap"
}

public class ReportDataDto
{
    public Dictionary<string, object> Data { get; set; } = new();
    public string Format { get; set; } = "json"; // json, csv, pdf
}

