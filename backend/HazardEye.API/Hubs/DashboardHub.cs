using Microsoft.AspNetCore.SignalR;
using Microsoft.AspNetCore.Authorization;

namespace HazardEye.API.Hubs;

[Authorize]
public class DashboardHub : Hub
{
    // Clients can join specific groups if needed, 
    // for now we'll just use global broadcasts or authenticated user broadcasts.
    
    public override async Task OnConnectedAsync()
    {
        await base.OnConnectedAsync();
        // Optional: Log connection
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        await base.OnDisconnectedAsync(exception);
    }
}
