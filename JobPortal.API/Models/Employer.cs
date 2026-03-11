using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace JobPortal.API.Models;

[Table("employers")]
public class Employer
{
    [Key]
    [Column("id")]
    public int Id { get; set; }

    [Column("user_id")]
    public int? UserId { get; set; }

    [Column("company_name")]
    [MaxLength(200)]
    public string? CompanyName { get; set; }

    [Column("company_description")]
    public string? CompanyDescription { get; set; }

    [Column("company_website")]
    [MaxLength(200)]
    public string? CompanyWebsite { get; set; }

    [Column("company_location")]
    [MaxLength(150)]
    public string? CompanyLocation { get; set; }

    [ForeignKey("UserId")]
    public virtual User? User { get; set; }

    public virtual ICollection<Job> Jobs { get; set; } = new List<Job>();
}
