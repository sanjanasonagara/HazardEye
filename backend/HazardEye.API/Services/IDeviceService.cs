using HazardEye.API.DTOs;

namespace HazardEye.API.Services;

public interface IDeviceService
{
    Task<List<DeviceDto>> GetDevicesAsync();
    Task<DeviceDto?> GetDeviceByIdAsync(int id);
    Task<DeviceDto> RegisterDeviceAsync(RegisterDeviceRequest request);
    Task<DeviceDto?> UpdateDeviceAsync(int id, UpdateDeviceRequest request);
    Task<bool> RevokeDeviceAsync(int id, int userId);
    Task<bool> PushModelUpdateAsync(int deviceId, string modelVersion);
}

public class DeviceDto
{
    public int Id { get; set; }
    public string DeviceId { get; set; } = string.Empty;
    public string Model { get; set; } = string.Empty;
    public string? ModelVersion { get; set; }
    public string Status { get; set; } = string.Empty;
    public DateTime RegisteredAt { get; set; }
    public DateTime? LastSeen { get; set; }
    public string? LastKnownLocation { get; set; }
}

public class RegisterDeviceRequest
{
    public string DeviceId { get; set; } = string.Empty;
    public string Model { get; set; } = string.Empty;
    public string? ModelVersion { get; set; }
}

public class UpdateDeviceRequest
{
    public string? ModelVersion { get; set; }
    public string? Status { get; set; }
}

