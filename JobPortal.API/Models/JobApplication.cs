using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace JobPortal.API.Models;

[Table("job_applications")]
public class JobApplication
{
    [Key]
    [Column("id")]
    public int Id { get; set; }

    [Column("job_id")]
    public int? JobId { get; set; }

    [Column("candidate_id")]
    public int? CandidateId { get; set; }

    [Column("resume_id")]
    public int? ResumeId { get; set; }

    [Column("cover_letter")]
    public string? CoverLetter { get; set; }

    [Column("status")]
    [MaxLength(50)]
    public string Status { get; set; } = "Applied";

    [Column("applied_at")]
    public DateTime AppliedAt { get; set; } = DateTime.UtcNow;

    [ForeignKey("JobId")]
    public virtual Job? Job { get; set; }

    [ForeignKey("CandidateId")]
    public virtual Candidate? Candidate { get; set; }

    [ForeignKey("ResumeId")]
    public virtual Resume? Resume { get; set; }
}
