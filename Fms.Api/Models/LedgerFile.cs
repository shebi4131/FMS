using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Fms.Api.Models;

public class LedgerFile
{
    [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int Id { get; set; }
    public int? ProjectId { get; set; }
    public int? StreetId { get; set; }
    public int? PlotCategoryId { get; set; }
    public int? PlotSizeId { get; set; }
    [StringLength(100)] public string Project { get; set; } = string.Empty;
    [StringLength(30)] public string StreetNo { get; set; } = string.Empty;
    [Required, StringLength(50)] public string PlotNo { get; set; } = string.Empty;
    [StringLength(30)] public string PlotNoNumeric { get; set; } = string.Empty;
    [StringLength(10)] public string? PlotNoSuffix { get; set; }
    [StringLength(50)] public string Size { get; set; } = string.Empty;
    [Required, StringLength(60)] public string CurrentFileNo { get; set; } = string.Empty;
    [StringLength(60)] public string? OldFileNo { get; set; }
    public bool IsRenumbered { get; set; }
    public bool IsDuplicate { get; set; }
    [StringLength(60)] public string? DuplicateOfFileNo { get; set; }
    [StringLength(30)] public string Category { get; set; } = "Residential";
    [StringLength(80)] public string? OtherCategory { get; set; }
    [StringLength(500)] public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.Now;
    public DateTime? UpdatedAt { get; set; }
}
