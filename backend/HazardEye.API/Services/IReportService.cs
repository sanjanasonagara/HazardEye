using HazardEye.API.DTOs;

namespace HazardEye.API.Services;

public interface IReportService
{
    Task<DashboardStatsDto> GetDashboardStatsAsync();
    Task<ReportDataDto> GenerateReportAsync(ReportRequest request);
}



