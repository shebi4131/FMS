using System.ComponentModel.DataAnnotations;

namespace Fms.Api.Models;

public class ReturnFileDto
{
    [StringLength(500)]
    public string? Remarks { get; set; }
}
