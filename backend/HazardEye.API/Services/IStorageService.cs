namespace HazardEye.API.Services;

public interface IStorageService
{
    Task<string> GetPresignedUrlAsync(string objectKey, int expirationMinutes = 15);
    Task<string> UploadFileAsync(Stream fileStream, string fileName, string contentType);
    Task<bool> DeleteFileAsync(string objectKey);
}

