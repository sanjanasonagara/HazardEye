using System.Text.Json.Serialization;

namespace HazardEye.API.DTOs;

public class DashboardStatsDto
{
    [JsonPropertyName("totalIncidents")]
    public int TotalIncidents { get; set; }

    [JsonPropertyName("openIncidents")]
    public int OpenIncidents { get; set; }

    [JsonPropertyName("closedIncidents")]
    public int ClosedIncidents { get; set; }

    [JsonPropertyName("criticalOpenIncidents")]
    public int PendingHighSeverity { get; set; } // Mapped to PendingHighSeverity from service

    // Extra fields
    [JsonPropertyName("incidentsToday")]
    public int IncidentsToday { get; set; }

    [JsonPropertyName("averageTTR")]
    public double AverageTTR { get; set; }

    [JsonPropertyName("devicesOffline")]
    public int DevicesOffline { get; set; }
}

public class ReportRequest
{
    public string ReportType { get; set; } = string.Empty;
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
}

public class ReportDataDto
{
    public Dictionary<string, object> Data { get; set; } = new();
    public string Format { get; set; } = "json";
}
