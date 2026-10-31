using System.ComponentModel.DataAnnotations;

namespace Fms.Api.Models;

public class UpdateProfileDto
{
    [Required, StringLength(150)] public string FullName { get; set; } = string.Empty;
    [Required, StringLength(80)] public string Username { get; set; } = string.Empty;
    [Required, EmailAddress] public string Email { get; set; } = string.Empty;
}

public class ChangePasswordDto
{
    [Required] public string CurrentPassword { get; set; } = string.Empty;
    [Required, MinLength(8)] public string NewPassword { get; set; } = string.Empty;
}
