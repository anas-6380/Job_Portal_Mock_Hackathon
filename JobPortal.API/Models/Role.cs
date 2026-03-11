using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace JobPortal.API.Models;

[Table("roles")]
public class Role
{
    [Key]
    [Column("id")]
    public int Id { get; set; }

    [Column("name")]
    [MaxLength(50)]
    public string Name { get; set; } = string.Empty;

    public virtual ICollection<User> Users { get; set; } = new List<User>();
}
