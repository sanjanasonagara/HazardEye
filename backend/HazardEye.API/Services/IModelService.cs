using HazardEye.API.DTOs;

namespace HazardEye.API.Services;

public interface IModelService
{
    Task<List<ModelDto>> GetModelsAsync();
    Task<ModelDto?> GetModelByIdAsync(int id);
    Task<ModelDto> UploadModelAsync(UploadModelRequest request, int userId);
    Task<bool> PublishModelAsync(int id, int userId);
    Task<bool> RollbackModelAsync(int id, int userId);
}

public class ModelDto
{
    public int Id { get; set; }
    public string Version { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public Dictionary<string, object> Metrics { get; set; } = new();
    public DateTime CreatedAt { get; set; }
    public DateTime? PublishedAt { get; set; }
    public string? ReleaseNotes { get; set; }
}

public class UploadModelRequest
{
    public string Version { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string? ReleaseNotes { get; set; }
    public IFormFile ModelFile { get; set; } = null!;
}

