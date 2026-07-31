using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Fms.Api.Models;

public class FileDto
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int Id { get; set; }

    [Required(ErrorMessage = "Plot number is required")]
    [StringLength(50, ErrorMessage = "Plot number cannot exceed 50 characters")]
    public string PlotNo { get; set; } = string.Empty;

    [Required(ErrorMessage = "Street number is required")]
    [StringLength(20, ErrorMessage = "Street number cannot exceed 20 characters")]
    public string StNo { get; set; } = string.Empty;

    [Required(ErrorMessage = "Phase is required")]
    [StringLength(20, ErrorMessage = "Phase cannot exceed 20 characters")]
    public string Phase { get; set; } = string.Empty;

    [Required(ErrorMessage = "From field is required")]
    [StringLength(100, ErrorMessage = "From field cannot exceed 100 characters")]
    public string From { get; set; } = string.Empty;

    [Required(ErrorMessage = "Carrier is required")]
    [StringLength(100, ErrorMessage = "Carrier cannot exceed 100 characters")]
    public string Carrier { get; set; } = string.Empty;

    [Required(ErrorMessage = "To field is required")]
    [StringLength(100, ErrorMessage = "To field cannot exceed 100 characters")]
    public string To { get; set; } = string.Empty;

    [Required(ErrorMessage = "Purpose is required")]
    [StringLength(200, ErrorMessage = "Purpose cannot exceed 200 characters")]
    public string Purpose { get; set; } = string.Empty;

    [Required(ErrorMessage = "Date is required")]
    [DataType(DataType.Date)]
    public DateTime FileOutDate { get; set; } = DateTime.Now;
    [DataType(DataType.Date)]
    public DateTime? FileInDate { get; set; } = null;

    [Required(ErrorMessage = "Status is required")]
    [RegularExpression("^(In|Out)$", ErrorMessage = "Status must be: In or Out")]
    public string Status { get; set; } = "In";

    [StringLength(500, ErrorMessage = "Remarks cannot exceed 500 characters")]
    public string? Remarks { get; set; }

    // Audit fields
    public DateTime CreatedAt { get; set; } = DateTime.Now;
    public DateTime? UpdatedAt { get; set; }
    public string? CreatedBy { get; set; }
    public string? UpdatedBy { get; set; }

    // Soft delete fields
    public bool IsDeleted { get; set; } = false;
    public DateTime? DeletedAt { get; set; }
    public string? DeletedBy { get; set; }

    // Computed time properties from audit fields
    public string CreatedTimeShort => CreatedAt.ToString("HH:mm");
    public string? UpdatedTimeShort => UpdatedAt?.ToString("HH:mm");

    // Time since creation
    public TimeSpan TimeSinceCreated => DateTime.Now - CreatedAt;
    public string TimeSinceCreatedText
    {
        get
        {
            var timeSpan = TimeSinceCreated;
            if (timeSpan.TotalMinutes < 60)
                return $"{(int)timeSpan.TotalMinutes} minutes ago";
            if (timeSpan.TotalHours < 24)
                return $"{(int)timeSpan.TotalHours} hours ago";
            return $"{(int)timeSpan.TotalDays} days ago";
        }
    }
}