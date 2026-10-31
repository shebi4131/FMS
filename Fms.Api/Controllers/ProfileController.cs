using System.Security.Claims;
using Fms.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace Fms.Api.Controllers;

[ApiController, Route("api/[controller]"), Authorize]
public class ProfileController(UserManager<ApplicationUser> users) : ControllerBase
{
    private Task<ApplicationUser?> CurrentUser() => users.FindByIdAsync(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpGet]
    public async Task<IActionResult> Get()
    {
        var user = await CurrentUser();
        if (user is null) return Unauthorized();
        return Ok(new { user.FullName, Username = user.UserName, user.Email });
    }

    [HttpPut]
    public async Task<IActionResult> Update(UpdateProfileDto dto)
    {
        var user = await CurrentUser();
        if (user is null) return Unauthorized();
        user.FullName = dto.FullName.Trim();
        user.UserName = dto.Username.Trim();
        user.Email = dto.Email.Trim();
        var result = await users.UpdateAsync(user);
        if (!result.Succeeded) return BadRequest(new { message = string.Join(" ", result.Errors.Select(x => x.Description)) });
        return Ok(new { message = "Profile updated.", user.FullName, Username = user.UserName, user.Email });
    }

    [HttpPost("change-password")]
    public async Task<IActionResult> ChangePassword(ChangePasswordDto dto)
    {
        var user = await CurrentUser();
        if (user is null) return Unauthorized();
        var result = await users.ChangePasswordAsync(user, dto.CurrentPassword, dto.NewPassword);
        if (!result.Succeeded) return BadRequest(new { message = string.Join(" ", result.Errors.Select(x => x.Description)) });
        return Ok(new { message = "Password changed successfully." });
    }
}
