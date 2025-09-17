using System.ComponentModel.DataAnnotations;

namespace Fms.Api.Models;

public class RegisterDto
{
    [Required]
    public string Username { get; set; }

    [Required]
    [EmailAddress]
    public string Email { get; set; }

    [Required]
    [MinLength(6, ErrorMessage = "Password must be at least 6 characters.")]
    public string Password { get; set; }

    public string Role { get; set; } = "User"; // Default role
}
