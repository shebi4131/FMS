using Microsoft.AspNetCore.Identity;
using System.ComponentModel.DataAnnotations;

namespace Fms.Api.Models;

public class ApplicationUser : IdentityUser
{
    [StringLength(150)]
    public string FullName { get; set; } = string.Empty;
}
