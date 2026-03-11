using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace JobPortal.API.Models;

[Table("resumes")]
public class Resume
{
    [Key]
    [Column("id")]
    public int Id { get; set; }

    [Column("candidate_id")]
    public int? CandidateId { get; set; }

    [Column("file_name")]
    [MaxLength(200)]
    public string? FileName { get; set; }

    [Column("file_path")]
    [MaxLength(300)]
    public string? FilePath { get; set; }

    [Column("uploaded_at")]
    public DateTime UploadedAt { get; set; } = DateTime.UtcNow;

    [ForeignKey("CandidateId")]
    public virtual Candidate? Candidate { get; set; }
}
