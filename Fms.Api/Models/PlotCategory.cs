using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Fms.Api.Models;

public class PlotCategory
{
    [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)] public int Id { get; set; }
    [Required, StringLength(80)] public string Name { get; set; } = string.Empty;
}
