using Microsoft.EntityFrameworkCore;

namespace JobPortal.API.Models;

public class JobPortalContext : DbContext
{
    public JobPortalContext(DbContextOptions<JobPortalContext> options) : base(options) { }

    public DbSet<Role> Roles => Set<Role>();
    public DbSet<User> Users => Set<User>();
    public DbSet<Employer> Employers => Set<Employer>();
    public DbSet<Candidate> Candidates => Set<Candidate>();
    public DbSet<Job> Jobs => Set<Job>();
    public DbSet<Resume> Resumes => Set<Resume>();
    public DbSet<JobApplication> JobApplications => Set<JobApplication>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<User>()
            .HasIndex(u => u.Email)
            .IsUnique();

        modelBuilder.Entity<Employer>()
            .HasIndex(e => e.UserId)
            .IsUnique();

        modelBuilder.Entity<Candidate>()
            .HasIndex(c => c.UserId)
            .IsUnique();
    }
}
