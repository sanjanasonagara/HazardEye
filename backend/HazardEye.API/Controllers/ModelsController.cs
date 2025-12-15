using HazardEye.API.DTOs;
using HazardEye.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace HazardEye.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Policy = "AdminOnly")]
public class ModelsController : ControllerBase
{
    private readonly IModelService _modelService;

    public ModelsController(IModelService modelService)
    {
        _modelService = modelService;
    }

    [HttpGet]
    public async Task<ActionResult<List<ModelDto>>> GetModels()
    {
        var models = await _modelService.GetModelsAsync();
        return Ok(models);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ModelDto>> GetModel(int id)
    {
        var model = await _modelService.GetModelByIdAsync(id);
        if (model == null)
        {
            return NotFound();
        }
        return Ok(model);
    }

    [HttpPost("upload")]
    public async Task<ActionResult<ModelDto>> UploadModel([FromForm] UploadModelRequest request)
    {
        var userId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value ?? "0");
        var model = await _modelService.UploadModelAsync(request, userId);
        return CreatedAtAction(nameof(GetModel), new { id = model.Id }, model);
    }

    [HttpPost("{id}/publish")]
    public async Task<IActionResult> PublishModel(int id)
    {
        var userId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value ?? "0");
        var success = await _modelService.PublishModelAsync(id, userId);
        if (!success)
        {
            return NotFound();
        }
        return Ok(new { message = "Model published" });
    }

    [HttpPost("{id}/rollback")]
    public async Task<IActionResult> RollbackModel(int id)
    {
        var userId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value ?? "0");
        var success = await _modelService.RollbackModelAsync(id, userId);
        if (!success)
        {
            return NotFound();
        }
        return Ok(new { message = "Model rolled back" });
    }
}

