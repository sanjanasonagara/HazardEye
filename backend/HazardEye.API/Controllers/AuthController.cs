using HazardEye.API.DTOs;
using HazardEye.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace HazardEye.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        try
        {
            var response = await _authService.LoginAsync(request);
            if (response == null)
            {
                return Unauthorized(new { message = "Invalid email or password" });
            }
            return Ok(response);
        }
        catch (Exception ex)
        {
            // Log the full error to the console/file
            Console.WriteLine($"[Login Error] {ex.Message}");
            Console.WriteLine(ex.StackTrace);
            
            if (ex.InnerException != null)
            {
               Console.WriteLine($"[Inner Exception] {ex.InnerException.Message}");
            }

            return StatusCode(500, new { message = "An internal server error occurred.", details = ex.Message });
        }
    }

    [HttpGet("me")]
    [Authorize]
    public async Task<ActionResult<UserDto>> GetCurrentUser()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out var userId))
        {
            return Unauthorized();
        }

        var user = await _authService.GetUserByIdAsync(userId);
        if (user == null)
        {
            return NotFound();
        }

        return Ok(user);
    }

    [HttpPost("users")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<ActionResult<UserDto>> CreateUser([FromBody] CreateUserDto request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var createdUser = await _authService.CreateUserAsync(request);
        if (createdUser == null)
        {
            return Conflict(new { message = "User with this email already exists." });
        }

        return CreatedAtAction(nameof(GetCurrentUser), new { }, createdUser); 
        // Note: Ideally CreatedAtAction would point to GetUserById but that's internal to service or not exposed by ID yet. 
        // For now, returning the created object is fine.
    }

    [HttpGet("users")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<ActionResult<List<UserDto>>> GetUsers()
    {
        var users = await _authService.GetAllUsersAsync();
        return Ok(users);
    }

    [HttpDelete("users/{id}")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> DeleteUser(int id)
    {
        var success = await _authService.DeleteUserAsync(id);
        if (!success) return NotFound();
        return NoContent();
    }
}

