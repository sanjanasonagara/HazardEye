using System.Text.Json.Serialization;

namespace HazardEye.API.DTOs;



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
