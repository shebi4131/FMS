using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Fms.Api.Models;

public class Project
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int Id { get; set; }

    [Required(ErrorMessage = "Project name is required")]
    [StringLength(100, ErrorMessage = "Project name cannot exceed 100 characters")]
    public string ProjectName { get; set; } = string.Empty;

    [Required(ErrorMessage = "Project code is required")]
    [StringLength(50, ErrorMessage = "Project code cannot exceed 50 characters")]
    public string ProjectCode { get; set; } = string.Empty;

    [Required(ErrorMessage = "Status is required")]
    [StringLength(20, ErrorMessage = "Status cannot exceed 20 characters")]
    public string Status { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
}
