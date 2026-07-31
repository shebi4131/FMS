using Fms.Api.Data;
using Fms.Api.Models;
using Fms.Api.Services;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace Fms.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly UserManager<IdentityUser> _userManager;
    private readonly RoleManager<IdentityRole> _roleManager;
    private readonly ApplicationDbContext _dbContext;
    private readonly IEmailService _emailService;
    public AuthController(UserManager<IdentityUser> userManager, RoleManager<IdentityRole> roleManager, ApplicationDbContext dbContext, IEmailService emailService)
    {
        _userManager = userManager;
        _roleManager = roleManager;
        _dbContext = dbContext;
        _emailService = emailService;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register(RegisterDto model)
    {
        // 1. Check if user already exists
        var existingUser = await _userManager.FindByNameAsync(model.Username);
        if (existingUser != null)
            return BadRequest(new { message = "Username already taken" });

        var existingEmail = await _userManager.FindByEmailAsync(model.Email);
        if (existingEmail != null)
            return BadRequest(new { message = "Email already registered" });

        // 2. Create user object
        var user = new IdentityUser
        {
            UserName = model.Username,
            Email = model.Email
        };

        // 3. Save to database
        var result = await _userManager.CreateAsync(user, model.Password);

        if (!result.Succeeded)
            return BadRequest(result.Errors);

        // 4. Ensure role exists
        if (!await _roleManager.RoleExistsAsync(model.Role))
            await _roleManager.CreateAsync(new IdentityRole(model.Role));

        // 5. Assign role to user
        await _userManager.AddToRoleAsync(user, model.Role);

        return Ok(new { message = "User registered successfully" });
    }

    private string GenerateJwtToken(IdentityUser user, IList<string> roles)
    {
        var jwtSettings = HttpContext.RequestServices.GetRequiredService<IConfiguration>().GetSection("Jwt");
        var key = Encoding.UTF8.GetBytes(jwtSettings["Key"]);

        var claims = new List<Claim>
    {
        new Claim(ClaimTypes.NameIdentifier, user.Id),
        new Claim(ClaimTypes.Name, user.UserName),
        new Claim(ClaimTypes.Email, user.Email)
    };

        // Add role claims
        foreach (var role in roles)
        {
            claims.Add(new Claim(ClaimTypes.Role, role));
        }

        var now = DateTime.UtcNow;
        var expireHours = jwtSettings["ExpireHours"] != null ? Convert.ToDouble(jwtSettings["ExpireHours"]) : 2; // Default to 2 hours

        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(claims),
            NotBefore = now,
            Expires = now.AddHours(expireHours),
            Issuer = jwtSettings["Issuer"],
            Audience = jwtSettings["Audience"],
            SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256)
        };

        var tokenHandler = new JwtSecurityTokenHandler();
        var token = tokenHandler.CreateToken(tokenDescriptor);
        return tokenHandler.WriteToken(token);
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginDto model)
    {
        var user = await _userManager.FindByEmailAsync(model.Email);
        if (user == null)
            return Unauthorized(new { message = "Invalid email or password" });

        var passwordCheck = await _userManager.CheckPasswordAsync(user, model.Password);
        if (!passwordCheck)
            return Unauthorized(new { message = "Invalid email or password" });

        // Get user roles
        var userRoles = await _userManager.GetRolesAsync(user);

        // Generate JWT token with roles
        var token = GenerateJwtToken(user, userRoles);

        return Ok(new
        {
            message = "Login successful",
            token = token,
            roles = userRoles
        });
    }

    [HttpPost("forgot-password")]
    public async Task<IActionResult> ForgotPassword(ForgotPasswordDto model)
    {
        var user = await _userManager.FindByEmailAsync(model.Email);

        // Always return success message regardless, to avoid leaking which emails are registered
        if (user == null)
            return Ok(new { message = "If this email is registered, a code has been sent." });

        var code = new Random().Next(1000, 9999).ToString();

        var otp = new PasswordResetOtp
        {
            Email = model.Email,
            Code = code,
            ExpiresAt = DateTime.UtcNow.AddMinutes(10),
            IsUsed = false
        };

        _dbContext.PasswordResetOtps.Add(otp);
        await _dbContext.SaveChangesAsync();

        var body = $@"
        <h3>Password Reset Code</h3>
        <p>Your verification code is:</p>
        <h2>{code}</h2>
        <p>This code expires in 10 minutes.</p>";

        await _emailService.SendEmailAsync(model.Email, "FMS Password Reset Code", body);

        return Ok(new { message = "If this email is registered, a code has been sent." });
    }

    [HttpPost("verify-otp")]
    public async Task<IActionResult> VerifyOtp(VerifyOtpDto model)
    {
        var otp = await _dbContext.PasswordResetOtps
            .Where(o => o.Email == model.Email && o.Code == model.Code && !o.IsUsed)
            .OrderByDescending(o => o.CreatedAt)
            .FirstOrDefaultAsync();

        if (otp == null)
            return BadRequest(new { message = "Invalid code" });

        if (otp.ExpiresAt < DateTime.UtcNow)
            return BadRequest(new { message = "Code has expired" });

        return Ok(new { message = "Code verified" });
    }

    [HttpPost("reset-password")]
    public async Task<IActionResult> ResetPassword(ResetPasswordDto model)
    {
        if (model.NewPassword != model.ConfirmPassword)
            return BadRequest(new { message = "Passwords do not match" });

        var otp = await _dbContext.PasswordResetOtps
            .Where(o => o.Email == model.Email && o.Code == model.Code && !o.IsUsed)
            .OrderByDescending(o => o.CreatedAt)
            .FirstOrDefaultAsync();

        if (otp == null)
            return BadRequest(new { message = "Invalid code" });

        if (otp.ExpiresAt < DateTime.UtcNow)
            return BadRequest(new { message = "Code has expired" });

        var user = await _userManager.FindByEmailAsync(model.Email);
        if (user == null)
            return BadRequest(new { message = "User not found" });

        var resetToken = await _userManager.GeneratePasswordResetTokenAsync(user);
        var result = await _userManager.ResetPasswordAsync(user, resetToken, model.NewPassword);

        if (!result.Succeeded)
            return BadRequest(result.Errors);

        otp.IsUsed = true;
        await _dbContext.SaveChangesAsync();

        return Ok(new { message = "Password reset successfully" });
    }
}
