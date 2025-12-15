using HazardEye.API.Models;
using Microsoft.EntityFrameworkCore;

namespace HazardEye.API.Data;

public class HazardEyeDbContext : DbContext
{
    public HazardEyeDbContext(DbContextOptions<HazardEyeDbContext> options) : base(options) { }

    public DbSet<User> Users { get; set; }
    public DbSet<Incident> Incidents { get; set; }
    public DbSet<Device> Devices { get; set; }
    public DbSet<Model> Models { get; set; }
    public DbSet<AdvisoryTemplate> AdvisoryTemplates { get; set; }
    public DbSet<SeverityRule> SeverityRules { get; set; }
    public DbSet<AuditLog> AuditLogs { get; set; }
    public DbSet<ApprovalRequest> ApprovalRequests { get; set; }

    public DbSet<HazardEye.API.Models.WorkTask> Tasks { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // User configuration
        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.Email).IsUnique();
            entity.Property(e => e.Role).HasConversion<string>();
        });

        // Incident configuration
        modelBuilder.Entity<Incident>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.ServerIncidentId).IsUnique();
            entity.HasIndex(e => e.DeviceId);
            entity.HasIndex(e => e.Status);
            entity.HasIndex(e => e.Severity);
            entity.HasIndex(e => e.CapturedAt);
            entity.Property(e => e.Status).HasConversion<string>();
            entity.Property(e => e.Severity).HasConversion<string>();
            entity.Property(e => e.Category).HasConversion<string>();
            entity.Property(e => e.MediaUris).HasColumnType("jsonb");
            entity.Property(e => e.MlMetadata).HasColumnType("jsonb");
            entity.HasOne(e => e.AssignedToUser)
                  .WithMany()
                  .HasForeignKey(e => e.AssignedTo)
                  .OnDelete(DeleteBehavior.SetNull);
            entity.HasOne(e => e.CreatedByUser)
                  .WithMany()
                  .HasForeignKey(e => e.CreatedBy)
                  .OnDelete(DeleteBehavior.Restrict);
        });

        // Task configuration
        modelBuilder.Entity<WorkTask>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.Status);
            entity.Property(e => e.Status).HasConversion<string>();
            entity.HasOne(e => e.Incident)
                  .WithMany()
                  .HasForeignKey(e => e.IncidentId)
                  .OnDelete(DeleteBehavior.Cascade);
            entity.HasOne(e => e.AssignedToUser)
                  .WithMany()
                  .HasForeignKey(e => e.AssignedToUserId)
                  .OnDelete(DeleteBehavior.Restrict);
        });

        // Device configuration
        modelBuilder.Entity<Device>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.DeviceId).IsUnique();
            entity.Property(e => e.Status).HasConversion<string>();
            entity.Property(e => e.Metadata).HasColumnType("jsonb");
        });

        // Model configuration
        modelBuilder.Entity<Model>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.Version).IsUnique();
            entity.Property(e => e.Status).HasConversion<string>();
            entity.Property(e => e.Metrics).HasColumnType("jsonb");
        });

        // Advisory Template configuration
        modelBuilder.Entity<AdvisoryTemplate>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Rules).HasColumnType("jsonb");
        });

        // Severity Rule configuration
        modelBuilder.Entity<SeverityRule>(entity =>
        {
            entity.HasKey(e => e.Id);
        });

        // Audit Log configuration
        modelBuilder.Entity<AuditLog>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.Timestamp);
            entity.HasIndex(e => e.UserId);
            entity.HasIndex(e => e.Action);
            entity.Property(e => e.Details).HasColumnType("jsonb");
        });

        // Approval Request configuration
        modelBuilder.Entity<ApprovalRequest>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Status).HasConversion<string>();
            entity.Property(e => e.ActionType).HasConversion<string>();
            entity.Property(e => e.Metadata).HasColumnType("jsonb");
        });
    }
}

