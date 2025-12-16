using HazardEye.API.Data;
using HazardEye.API.Models;
using Microsoft.EntityFrameworkCore;

namespace HazardEye.API.Services;

public class NotificationWorker : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<NotificationWorker> _logger;

    public NotificationWorker(IServiceProvider serviceProvider, ILogger<NotificationWorker> logger)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
    }

    protected override async System.Threading.Tasks.Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                using var scope = _serviceProvider.CreateScope();
                var context = scope.ServiceProvider.GetRequiredService<HazardEyeDbContext>();

                // Check for high-severity incidents that need notifications
                var highSeverityIncidents = await context.Incidents
                    .Where(i => (i.Severity == IncidentSeverity.High || i.Severity == IncidentSeverity.Critical) &&
                               i.Status == IncidentStatus.Pending &&
                               i.CreatedAt > DateTime.UtcNow.AddMinutes(-5))
                    .ToListAsync(stoppingToken);

                foreach (var incident in highSeverityIncidents)
                {
                    // In production, send email/SMS notifications
                    _logger.LogInformation("High-severity incident detected: {IncidentId}", incident.ServerIncidentId);
                    // TODO: Implement actual notification sending
                }

                await System.Threading.Tasks.Task.Delay(TimeSpan.FromMinutes(1), stoppingToken);
            }
            catch (OperationCanceledException)
            {
                // Graceful shutdown
                break;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in notification worker");
                await System.Threading.Tasks.Task.Delay(TimeSpan.FromMinutes(5), stoppingToken);
            }
        }
    }
}

