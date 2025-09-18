using Fms.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Fms.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
//[Authorize(Roles = "Admin")]
public class RoleController : ControllerBase
{
    private readonly UserManager<IdentityUser> _userManager;
    private readonly RoleManager<IdentityRole> _roleManager;

    public RoleController(UserManager<IdentityUser> userManager, RoleManager<IdentityRole> roleManager)
    {
        _userManager = userManager;
        _roleManager = roleManager;
    }

    [HttpGet("users")]
    public async Task<IActionResult> GetAllUsers()
    {
        var users = await _userManager.Users.ToListAsync();
        var userList = new List<object>();

        foreach( var user in users)
        {
            var roles = await _userManager.GetRolesAsync(user);
            userList.Add(new
            {
                Id = user.Id,
                Username = user.UserName,
                Email = user.Email,
                Roles = roles
            });
        }
        return Ok(userList);
    }

    [HttpGet("roles")]
    public async Task<IActionResult> GetAllRoles()
    {
        var roles = await _roleManager.Roles.ToListAsync();
        return Ok(roles);
    }

    // PUT: api/role/assign - Assign role to user
    [HttpPut("assign")]
    public async Task<IActionResult> AssignRole([FromBody] AssignRoleDto model)
    {
        var user = await _userManager.FindByIdAsync(model.UserId);
        if (user == null)
            return NotFound(new { message = "User not found" });

        if (!await _roleManager.RoleExistsAsync(model.RoleName))
            return BadRequest(new { message = "Role does not exist" });

        var result = await _userManager.AddToRoleAsync(user, model.RoleName);
        if (!result.Succeeded)
            return BadRequest(result.Errors);

        return Ok(new { message = "Role assigned successfully" });
    }

    // DELETE: api/role/remove - Remove role from user
    [HttpDelete("remove")]
    public async Task<IActionResult> RemoveRole([FromBody] AssignRoleDto model)
    {
        var user = await _userManager.FindByIdAsync(model.UserId);
        if (user == null)
            return NotFound(new { message = "User not found" });

        var result = await _userManager.RemoveFromRoleAsync(user, model.RoleName);
        if (!result.Succeeded)
            return BadRequest(result.Errors);

        return Ok(new { message = "Role removed successfully" });
    }

    // DELETE: api/role/user/{id} - Delete user
    [HttpDelete("user/{id}")]
    public async Task<IActionResult> DeleteUser(string id)
    {
        var user = await _userManager.FindByIdAsync(id);
        if (user == null)
            return NotFound(new { message = "User not found" });

        var result = await _userManager.DeleteAsync(user);
        if (!result.Succeeded)
            return BadRequest(result.Errors);

        return Ok(new { message = "User deleted successfully" });
    }
}
