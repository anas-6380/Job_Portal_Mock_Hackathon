using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace JobPortal.API.Models;

[Table("jobs")]
public class Job
{
    [Key]
    [Column("id")]
    public int Id { get; set; }

    [Column("employer_id")]
    public int? EmployerId { get; set; }

    [Column("title")]
    [MaxLength(200)]
    public string? Title { get; set; }

    [Column("description")]
    public string? Description { get; set; }

    [Column("location")]
    [MaxLength(150)]
    public string? Location { get; set; }

    [Column("salary_min")]
    public decimal? SalaryMin { get; set; }

    [Column("salary_max")]
    public decimal? SalaryMax { get; set; }

    [Column("job_type")]
    [MaxLength(50)]
    public string? JobType { get; set; }

    [Column("experience_required")]
    public int? ExperienceRequired { get; set; }

    [Column("is_active")]
    public bool IsActive { get; set; } = true;

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [Column("expires_at")]
    public DateTime? ExpiresAt { get; set; }

    [ForeignKey("EmployerId")]
    public virtual Employer? Employer { get; set; }

    public virtual ICollection<JobApplication> Applications { get; set; } = new List<JobApplication>();
}
