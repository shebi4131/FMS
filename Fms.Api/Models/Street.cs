using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Fms.Api.Models;

public class Street
{
    [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)] public int Id { get; set; }
    public int ProjectId { get; set; }
    [Required, StringLength(30)] public string StreetNo { get; set; } = string.Empty;
    [StringLength(10)] public string? StreetNo2 { get; set; }
    [NotMapped] public string DisplayName => string.IsNullOrWhiteSpace(StreetNo2) ? StreetNo : $"{StreetNo}-{StreetNo2}";
    public Project? Project { get; set; }
}
