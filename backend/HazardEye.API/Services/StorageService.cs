using Minio;
using Minio.DataModel.Args;

namespace HazardEye.API.Services;

public class StorageService : IStorageService
{
    private readonly IMinioClient _minioClient;
    private readonly string _bucketName;
    private readonly ILogger<StorageService> _logger;

    public StorageService(IConfiguration configuration, ILogger<StorageService> logger)
    {
        _logger = logger;
        // Prioritize Environment Variables
        var endpoint = Environment.GetEnvironmentVariable("MINIO_ENDPOINT") 
            ?? configuration["Storage:MinIO:Endpoint"] 
            ?? "localhost:9000";
            
        var accessKey = Environment.GetEnvironmentVariable("MINIO_ACCESS_KEY") 
            ?? configuration["Storage:MinIO:AccessKey"] 
            ?? "minioadmin";
            
        var secretKey = Environment.GetEnvironmentVariable("MINIO_SECRET_KEY") 
            ?? configuration["Storage:MinIO:SecretKey"] 
            ?? "minioadmin";
            
        var useSSL = configuration.GetValue<bool>("Storage:MinIO:UseSSL", false);
        
        _bucketName = configuration["Storage:MinIO:BucketName"] ?? "hazardeeye-media";

        _minioClient = new MinioClient()
            .WithEndpoint(endpoint)
            .WithCredentials(accessKey, secretKey)
            .WithSSL(useSSL)
            .Build();

        EnsureBucketExists();
    }

    private void EnsureBucketExists()
    {
        try
        {
            var existsArgs = new BucketExistsArgs().WithBucket(_bucketName);
            if (!_minioClient.BucketExistsAsync(existsArgs).GetAwaiter().GetResult())
            {
                var makeArgs = new MakeBucketArgs().WithBucket(_bucketName);
                _minioClient.MakeBucketAsync(makeArgs).GetAwaiter().GetResult();
            }
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to ensure bucket exists. Continuing anyway.");
        }
    }

    public async Task<string> GetPresignedUrlAsync(string objectKey, int expirationMinutes = 15)
    {
        try
        {
            var args = new PresignedGetObjectArgs()
                .WithBucket(_bucketName)
                .WithObject(objectKey)
                .WithExpiry(expirationMinutes * 60);

            return await _minioClient.PresignedGetObjectAsync(args);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to generate presigned URL for {ObjectKey}", objectKey);
            throw;
        }
    }

    public async Task<string> UploadFileAsync(Stream fileStream, string fileName, string contentType)
    {
        try
        {
            var objectKey = $"{DateTime.UtcNow:yyyy/MM/dd}/{Guid.NewGuid()}/{fileName}";
            
            var args = new PutObjectArgs()
                .WithBucket(_bucketName)
                .WithObject(objectKey)
                .WithStreamData(fileStream)
                .WithObjectSize(fileStream.Length)
                .WithContentType(contentType);

            await _minioClient.PutObjectAsync(args);
            return objectKey;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to upload file {FileName}", fileName);
            throw;
        }
    }

    public async Task<bool> DeleteFileAsync(string objectKey)
    {
        try
        {
            var args = new RemoveObjectArgs()
                .WithBucket(_bucketName)
                .WithObject(objectKey);

            await _minioClient.RemoveObjectAsync(args);
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to delete file {ObjectKey}", objectKey);
            return false;
        }
    }
}

