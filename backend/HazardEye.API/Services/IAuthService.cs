using HazardEye.API.DTOs;

namespace HazardEye.API.Services;

public interface IAuthService
{
    Task<LoginResponse?> LoginAsync(LoginRequest request);
    Task<UserDto?> GetUserByIdAsync(int id);
    Task<List<UserDto>> GetAllUsersAsync();
    Task<bool> DeleteUserAsync(int id);
    Task<UserDto?> CreateUserAsync(CreateUserDto request);
}
