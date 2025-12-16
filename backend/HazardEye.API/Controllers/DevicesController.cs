using HazardEye.API.DTOs;
using HazardEye.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace HazardEye.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Policy = "AdminOnly")]
public class DevicesController : ControllerBase
{
    private readonly IDeviceService _deviceService;

    public DevicesController(IDeviceService deviceService)
    {
        _deviceService = deviceService;
    }

    [HttpGet]
    public async Task<ActionResult<List<DeviceDto>>> GetDevices()
    {
        var devices = await _deviceService.GetDevicesAsync();
        return Ok(devices);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<DeviceDto>> GetDevice(int id)
    {
        var device = await _deviceService.GetDeviceByIdAsync(id);
        if (device == null)
        {
            return NotFound();
        }
        return Ok(device);
    }

    [HttpPost]
    public async Task<ActionResult<DeviceDto>> RegisterDevice([FromBody] RegisterDeviceRequest request)
    {
        var device = await _deviceService.RegisterDeviceAsync(request);
        return CreatedAtAction(nameof(GetDevice), new { id = device.Id }, device);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<DeviceDto>> UpdateDevice(int id, [FromBody] UpdateDeviceRequest request)
    {
        var device = await _deviceService.UpdateDeviceAsync(id, request);
        if (device == null)
        {
            return NotFound();
        }
        return Ok(device);
    }

    [HttpPost("{id}/revoke")]
    public async Task<IActionResult> RevokeDevice(int id)
    {
        var userId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value ?? "0");
        var success = await _deviceService.RevokeDeviceAsync(id, userId);
        if (!success)
        {
            return NotFound();
        }
        return Ok(new { message = "Device revoked" });
    }

    [HttpPost("{id}/push-model")]
    public async Task<IActionResult> PushModelUpdate(int id, [FromBody] PushModelRequest request)
    {
        var success = await _deviceService.PushModelUpdateAsync(id, request.ModelVersion);
        if (!success)
        {
            return NotFound();
        }
        return Ok(new { message = "Model update queued" });
    }
}

public class PushModelRequest
{
    public string ModelVersion { get; set; } = string.Empty;
}

