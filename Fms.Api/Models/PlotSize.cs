using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Fms.Api.Models;

public class PlotSize
{
    [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)] public int Id { get; set; }
    public int PlotCategoryId { get; set; }
    [Required, StringLength(80)] public string Name { get; set; } = string.Empty;
    public PlotCategory? PlotCategory { get; set; }
}
