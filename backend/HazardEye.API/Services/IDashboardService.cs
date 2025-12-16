using HazardEye.API.DTOs;

namespace HazardEye.API.Services;

public interface IDashboardService
{
    Task<DashboardStatsDto> GetDashboardStatsAsync();
}
