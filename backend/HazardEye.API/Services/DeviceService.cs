using HazardEye.API.Data;
using HazardEye.API.DTOs;
using HazardEye.API.Models;
using Microsoft.EntityFrameworkCore;

namespace HazardEye.API.Services;

public class DeviceService : IDeviceService
{
    private readonly HazardEyeDbContext _context;
    private readonly IAuditService _auditService;

    public DeviceService(HazardEyeDbContext context, IAuditService auditService)
    {
        _context = context;
        _auditService = auditService;
    }

    public async Task<List<DeviceDto>> GetDevicesAsync()
    {
        var devices = await _context.Devices.ToListAsync();
        return devices.Select(MapToDto).ToList();
    }

    public async Task<DeviceDto?> GetDeviceByIdAsync(int id)
    {
        var device = await _context.Devices.FindAsync(id);
        return device != null ? MapToDto(device) : null;
    }

    public async Task<DeviceDto> RegisterDeviceAsync(RegisterDeviceRequest request)
    {
        var device = new Device
        {
            DeviceId = request.DeviceId,
            Model = request.Model,
            ModelVersion = request.ModelVersion,
            Status = DeviceStatus.Active,
            RegisteredAt = DateTime.UtcNow,
            LastSeen = DateTime.UtcNow
        };

        _context.Devices.Add(device);
        await _context.SaveChangesAsync();

        return MapToDto(device);
    }

    public async Task<DeviceDto?> UpdateDeviceAsync(int id, UpdateDeviceRequest request)
    {
        var device = await _context.Devices.FindAsync(id);
        if (device == null) return null;

        if (!string.IsNullOrEmpty(request.ModelVersion))
            device.ModelVersion = request.ModelVersion;

        if (!string.IsNullOrEmpty(request.Status))
            device.Status = Enum.Parse<DeviceStatus>(request.Status);

        device.LastSeen = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return MapToDto(device);
    }

    public async Task<bool> RevokeDeviceAsync(int id, int userId)
    {
        var device = await _context.Devices.FindAsync(id);
        if (device == null) return false;

        device.Status = DeviceStatus.Revoked;
        await _context.SaveChangesAsync();

        await _auditService.LogAsync(userId, "DEVICE_REVOKED", "Device", id, new Dictionary<string, object>
        {
            ["DeviceId"] = device.DeviceId
        }, "", "");

        return true;
    }

    public async Task<bool> PushModelUpdateAsync(int deviceId, string modelVersion)
    {
        var device = await _context.Devices.FindAsync(deviceId);
        if (device == null) return false;

        // In production, use a message queue to push updates
        device.ModelVersion = modelVersion;
        device.Metadata["pending_model_update"] = modelVersion;
        await _context.SaveChangesAsync();

        return true;
    }

    private DeviceDto MapToDto(Device device)
    {
        return new DeviceDto
        {
            Id = device.Id,
            DeviceId = device.DeviceId,
            Model = device.Model,
            ModelVersion = device.ModelVersion,
            Status = device.Status.ToString(),
            RegisteredAt = device.RegisteredAt,
            LastSeen = device.LastSeen,
            LastKnownLocation = device.LastKnownLocation
        };
    }
}

