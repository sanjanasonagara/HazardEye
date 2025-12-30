using HazardEye.API.Models;
using HazardEye.API.Services;

namespace HazardEye.API.Data;

public static class DbInitializer
{
    public static void Initialize(HazardEyeDbContext context)
    {
        // Migrations are applied in Program.cs, so we just seed data now.

        // Check and add Admin
        if (!context.Users.Any(u => u.Email == "admin@hazardeye.com"))
        {
            context.Users.Add(new User
            {
                Email = "admin@hazardeye.com",
                PasswordHash = AuthService.HashPassword("admin123"),
                FirstName = "System",
                LastName = "Admin",
                Role = UserRole.Admin,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            });
        }

        // Check and add Worker
        if (!context.Users.Any(u => u.Email == "worker@hazardeye.com"))
        {
            context.Users.Add(new User
            {
                Email = "worker@hazardeye.com",
                PasswordHash = AuthService.HashPassword("worker123"),
                FirstName = "John",
                LastName = "Worker",
                Role = UserRole.Worker,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            });
        }

        context.SaveChanges();
    }
}
