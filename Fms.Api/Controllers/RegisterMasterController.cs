using Fms.Api.Data;
using Fms.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Fms.Api.Controllers;

[ApiController, Route("api/register-master"), Authorize]
public class RegisterMasterController(ApplicationDbContext db) : ControllerBase
{
    [HttpGet("projects")]
    public async Task<IActionResult> Projects() => Ok(await db.Projects.AsNoTracking().OrderBy(x => x.ProjectName).ToListAsync());
    [HttpPost("projects"), Authorize(Roles="Admin,Manager")]
    public async Task<IActionResult> CreateProject(Project item) { item.ProjectCode=item.ProjectCode.Trim();item.ProjectName=item.ProjectName.Trim();item.Status="Active";db.Projects.Add(item);await db.SaveChangesAsync();return Ok(item); }
    [HttpPut("projects/{id:int}"), Authorize(Roles="Admin,Manager")]
    public async Task<IActionResult> UpdateProject(int id, Project input) { var x=await db.Projects.FindAsync(id);if(x is null)return NotFound();x.ProjectCode=input.ProjectCode.Trim();x.ProjectName=input.ProjectName.Trim();x.UpdatedAt=DateTime.Now;await db.SaveChangesAsync();return Ok(x); }
    [HttpDelete("projects/{id:int}"), Authorize(Roles="Admin")]
    public async Task<IActionResult> DeleteProject(int id) { var x=await db.Projects.FindAsync(id);if(x is null)return NotFound();if(await db.Streets.AnyAsync(s=>s.ProjectId==id))return BadRequest(new{message="Remove this project's streets first."});db.Remove(x);await db.SaveChangesAsync();return NoContent(); }

    [HttpGet("streets")]
    public async Task<IActionResult> Streets([FromQuery]int? projectId) { var q=db.Streets.Include(x=>x.Project).AsNoTracking().AsQueryable();if(projectId.HasValue)q=q.Where(x=>x.ProjectId==projectId);return Ok(await q.OrderBy(x=>x.Project!.ProjectName).ThenBy(x=>x.StreetNo).ThenBy(x=>x.StreetNo2).Select(x=>new{x.Id,x.ProjectId,x.StreetNo,x.StreetNo2,DisplayName=string.IsNullOrEmpty(x.StreetNo2)?x.StreetNo:x.StreetNo+"-"+x.StreetNo2,ProjectName=x.Project!.ProjectName}).ToListAsync()); }
    [HttpPost("streets"), Authorize(Roles="Admin,Manager")]
    public async Task<IActionResult> CreateStreet(Street item) { item.StreetNo=item.StreetNo.Trim();item.StreetNo2=string.IsNullOrWhiteSpace(item.StreetNo2)?null:item.StreetNo2.Trim().ToUpperInvariant();db.Streets.Add(item);await db.SaveChangesAsync();return Ok(item); }
    [HttpPut("streets/{id:int}"), Authorize(Roles="Admin,Manager")]
    public async Task<IActionResult> UpdateStreet(int id, Street input) { var x=await db.Streets.FindAsync(id);if(x is null)return NotFound();x.ProjectId=input.ProjectId;x.StreetNo=input.StreetNo.Trim();x.StreetNo2=string.IsNullOrWhiteSpace(input.StreetNo2)?null:input.StreetNo2.Trim().ToUpperInvariant();await db.SaveChangesAsync();return Ok(x); }
    [HttpDelete("streets/{id:int}"), Authorize(Roles="Admin")]
    public async Task<IActionResult> DeleteStreet(int id) { var x=await db.Streets.FindAsync(id);if(x is null)return NotFound();db.Remove(x);await db.SaveChangesAsync();return NoContent(); }

    [HttpGet("categories")]
    public async Task<IActionResult> Categories() => Ok(await db.PlotCategories.AsNoTracking().OrderBy(x=>x.Name).ToListAsync());
    [HttpPost("categories"), Authorize(Roles="Admin,Manager")]
    public async Task<IActionResult> CreateCategory(PlotCategory item) { item.Name=item.Name.Trim();db.PlotCategories.Add(item);await db.SaveChangesAsync();return Ok(item); }
    [HttpPut("categories/{id:int}"), Authorize(Roles="Admin,Manager")]
    public async Task<IActionResult> UpdateCategory(int id, PlotCategory input) { var x=await db.PlotCategories.FindAsync(id);if(x is null)return NotFound();x.Name=input.Name.Trim();await db.SaveChangesAsync();return Ok(x); }
    [HttpDelete("categories/{id:int}"), Authorize(Roles="Admin")]
    public async Task<IActionResult> DeleteCategory(int id) { var x=await db.PlotCategories.FindAsync(id);if(x is null)return NotFound();if(await db.PlotSizes.AnyAsync(s=>s.PlotCategoryId==id))return BadRequest(new{message="Remove this category's sizes first."});db.Remove(x);await db.SaveChangesAsync();return NoContent(); }

    [HttpGet("sizes")]
    public async Task<IActionResult> Sizes([FromQuery]int? categoryId) { var q=db.PlotSizes.Include(x=>x.PlotCategory).AsNoTracking().AsQueryable();if(categoryId.HasValue)q=q.Where(x=>x.PlotCategoryId==categoryId);return Ok(await q.OrderBy(x=>x.PlotCategory!.Name).ThenBy(x=>x.Name).Select(x=>new{x.Id,x.PlotCategoryId,x.Name,CategoryName=x.PlotCategory!.Name}).ToListAsync()); }
    [HttpPost("sizes"), Authorize(Roles="Admin,Manager")]
    public async Task<IActionResult> CreateSize(PlotSize item) { item.Name=item.Name.Trim();db.PlotSizes.Add(item);await db.SaveChangesAsync();return Ok(item); }
    [HttpPut("sizes/{id:int}"), Authorize(Roles="Admin,Manager")]
    public async Task<IActionResult> UpdateSize(int id, PlotSize input) { var x=await db.PlotSizes.FindAsync(id);if(x is null)return NotFound();x.PlotCategoryId=input.PlotCategoryId;x.Name=input.Name.Trim();await db.SaveChangesAsync();return Ok(x); }
    [HttpDelete("sizes/{id:int}"), Authorize(Roles="Admin")]
    public async Task<IActionResult> DeleteSize(int id) { var x=await db.PlotSizes.FindAsync(id);if(x is null)return NotFound();db.Remove(x);await db.SaveChangesAsync();return NoContent(); }
}
