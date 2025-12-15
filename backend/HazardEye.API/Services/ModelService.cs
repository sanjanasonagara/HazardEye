using HazardEye.API.Data;
using HazardEye.API.DTOs;
using HazardEye.API.Models;
using Microsoft.EntityFrameworkCore;

namespace HazardEye.API.Services;

public class ModelService : IModelService
{
    private readonly HazardEyeDbContext _context;
    private readonly IStorageService _storageService;
    private readonly IAuditService _auditService;

    public ModelService(HazardEyeDbContext context, IStorageService storageService, IAuditService auditService)
    {
        _context = context;
        _storageService = storageService;
        _auditService = auditService;
    }

    public async Task<List<ModelDto>> GetModelsAsync()
    {
        var models = await _context.Models.ToListAsync();
        return models.Select(MapToDto).ToList();
    }

    public async Task<ModelDto?> GetModelByIdAsync(int id)
    {
        var model = await _context.Models.FindAsync(id);
        return model != null ? MapToDto(model) : null;
    }

    public async Task<ModelDto> UploadModelAsync(UploadModelRequest request, int userId)
    {
        // Upload model file to storage
        using var stream = request.ModelFile.OpenReadStream();
        var storagePath = await _storageService.UploadFileAsync(
            stream, 
            request.ModelFile.FileName, 
            request.ModelFile.ContentType);

        // Generate signature (simplified - in production, use proper signing)
        var signature = GenerateSignature(storagePath);

        var model = new Model
        {
            Version = request.Version,
            Name = request.Name,
            Description = request.Description,
            StoragePath = storagePath,
            Signature = signature,
            Status = ModelStatus.Draft,
            CreatedBy = userId,
            ReleaseNotes = request.ReleaseNotes
        };

        _context.Models.Add(model);
        await _context.SaveChangesAsync();

        await _auditService.LogAsync(userId, "MODEL_UPLOADED", "Model", model.Id, new Dictionary<string, object>
        {
            ["Version"] = request.Version,
            ["Name"] = request.Name
        }, "", "");

        return MapToDto(model);
    }

    public async Task<bool> PublishModelAsync(int id, int userId)
    {
        var model = await _context.Models.FindAsync(id);
        if (model == null) return false;

        model.Status = ModelStatus.Published;
        model.PublishedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        await _auditService.LogAsync(userId, "MODEL_PUBLISHED", "Model", id, new Dictionary<string, object>
        {
            ["Version"] = model.Version
        }, "", "");

        return true;
    }

    public async Task<bool> RollbackModelAsync(int id, int userId)
    {
        var model = await _context.Models.FindAsync(id);
        if (model == null) return false;

        // Check for approval if required
        // For now, just archive the model
        model.Status = ModelStatus.Archived;
        await _context.SaveChangesAsync();

        await _auditService.LogAsync(userId, "MODEL_ROLLBACK", "Model", id, new Dictionary<string, object>
        {
            ["Version"] = model.Version
        }, "", "");

        return true;
    }

    private string GenerateSignature(string storagePath)
    {
        // Simplified signature - in production, use proper cryptographic signing
        using var sha256 = System.Security.Cryptography.SHA256.Create();
        var hash = sha256.ComputeHash(System.Text.Encoding.UTF8.GetBytes(storagePath));
        return Convert.ToBase64String(hash);
    }

    private ModelDto MapToDto(Model model)
    {
        return new ModelDto
        {
            Id = model.Id,
            Version = model.Version,
            Name = model.Name,
            Description = model.Description,
            Status = model.Status.ToString(),
            Metrics = model.Metrics,
            CreatedAt = model.CreatedAt,
            PublishedAt = model.PublishedAt,
            ReleaseNotes = model.ReleaseNotes
        };
    }
}

