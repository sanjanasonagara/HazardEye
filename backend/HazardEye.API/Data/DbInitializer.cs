using HazardEye.API.Models;
using HazardEye.API.Services;

namespace HazardEye.API.Data;

public static class DbInitializer
{
    public static void Initialize(HazardEyeDbContext context)
    {
        // Migrations are applied in Program.cs, so we just seed data now.

        // Check if any users exist
        if (context.Users.Any())
        {
            return; // DB has been seeded
        }

        var adminUser = new User
        {
            Email = "admin@hazardeye.com",
            PasswordHash = AuthService.HashPassword("AdminPassword123!"),
            FirstName = "System",
            LastName = "Admin",
            Role = UserRole.Admin,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        context.Users.Add(adminUser);
        context.SaveChanges();
    }
}
