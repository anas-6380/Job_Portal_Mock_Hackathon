using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace JobPortal.API.Models;

[Table("candidates")]
public class Candidate
{
    [Key]
    [Column("id")]
    public int Id { get; set; }

    [Column("user_id")]
    public int? UserId { get; set; }

    [Column("headline")]
    [MaxLength(200)]
    public string? Headline { get; set; }

    [Column("experience_years")]
    public int? ExperienceYears { get; set; }

    [Column("skills")]
    public string? Skills { get; set; }

    [ForeignKey("UserId")]
    public virtual User? User { get; set; }

    public virtual ICollection<Resume> Resumes { get; set; } = new List<Resume>();
    public virtual ICollection<JobApplication> Applications { get; set; } = new List<JobApplication>();
}
