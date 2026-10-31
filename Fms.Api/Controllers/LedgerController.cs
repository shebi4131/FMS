using Fms.Api.Data;
using Fms.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Fms.Api.Controllers;

[ApiController, Route("api/[controller]"), Authorize]
public class LedgerController(ApplicationDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> Get([FromQuery] string? project, [FromQuery] string? streetNo,
        [FromQuery] string? search, [FromQuery] string? category, [FromQuery] int page = 1, [FromQuery] int limit = 25)
    {
        var q = db.LedgerFiles.AsNoTracking().AsQueryable();
        if (!string.IsNullOrWhiteSpace(project)) q = q.Where(x => x.Project.Contains(project));
        if (!string.IsNullOrWhiteSpace(streetNo)) q = q.Where(x => x.StreetNo.Contains(streetNo));
        if (!string.IsNullOrWhiteSpace(category)) q = q.Where(x => x.Category == category);
        if (!string.IsNullOrWhiteSpace(search)) q = q.Where(x => x.PlotNo.Contains(search) || x.CurrentFileNo.Contains(search) || (x.OldFileNo ?? "").Contains(search));
        var total = await q.CountAsync();
        var data = await q.OrderBy(x => x.Project).ThenBy(x => x.StreetNo).ThenBy(x => x.PlotNo)
            .Skip((Math.Max(page, 1) - 1) * Math.Clamp(limit, 1, 200)).Take(Math.Clamp(limit, 1, 200)).ToListAsync();
        return Ok(new { data, totalCount = total, page, limit });
    }

    [HttpGet("summary")]
    public async Task<IActionResult> Summary() => Ok(new {
        totalFiles = await db.LedgerFiles.CountAsync(),
        projects = await db.LedgerFiles.Select(x => x.Project).Distinct().CountAsync(),
        streets = await db.LedgerFiles.Select(x => new { x.Project, x.StreetNo }).Distinct().CountAsync(),
        renumbered = await db.LedgerFiles.CountAsync(x => x.IsRenumbered),
        duplicates = await db.LedgerFiles.CountAsync(x => x.IsDuplicate),
        categories = await db.LedgerFiles.GroupBy(x => x.Category).Select(g => new { name = g.Key, count = g.Count() }).ToListAsync()
    });

    [HttpPost, Authorize(Roles = "Admin,Manager")]
    public async Task<IActionResult> Create(LedgerFile item)
    {
        await Hydrate(item);
        item.CreatedAt = DateTime.Now;
        db.LedgerFiles.Add(item); await db.SaveChangesAsync(); return Ok(item);
    }

    [HttpPut("{id:int}"), Authorize(Roles = "Admin,Manager")]
    public async Task<IActionResult> Update(int id, LedgerFile input)
    {
        var item = await db.LedgerFiles.FindAsync(id); if (item is null) return NotFound();
        item.ProjectId = input.ProjectId; item.StreetId = input.StreetId; item.PlotCategoryId = input.PlotCategoryId; item.PlotSizeId = input.PlotSizeId;
        input.ProjectId = item.ProjectId; input.StreetId = item.StreetId; input.PlotCategoryId = item.PlotCategoryId; input.PlotSizeId = item.PlotSizeId;
        await Hydrate(input);
        item.Project = input.Project; item.StreetNo = input.StreetNo; item.PlotNo = input.PlotNo;
        item.PlotNoNumeric = input.PlotNoNumeric; item.PlotNoSuffix = input.PlotNoSuffix;
        item.Size = input.Size; item.CurrentFileNo = input.CurrentFileNo; item.OldFileNo = input.OldFileNo;
        item.IsRenumbered = input.IsRenumbered; item.IsDuplicate = input.IsDuplicate;
        item.DuplicateOfFileNo = input.DuplicateOfFileNo; item.Category = input.Category;
        item.OtherCategory = input.OtherCategory; item.Notes = input.Notes; item.UpdatedAt = DateTime.Now;
        await db.SaveChangesAsync(); return Ok(item);
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> Detail(int id)
    {
        var item = await db.LedgerFiles.AsNoTracking().FirstOrDefaultAsync(x => x.Id == id);
        return item is null ? NotFound() : Ok(item);
    }

    [HttpDelete("{id:int}"), Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(int id)
    {
        var item = await db.LedgerFiles.FindAsync(id);
        if (item is null) return NotFound();
        db.LedgerFiles.Remove(item);
        await db.SaveChangesAsync();
        return NoContent();
    }

    private async Task Hydrate(LedgerFile item)
    {
        if (item.ProjectId.HasValue)
        {
            var project = await db.Projects.FindAsync(item.ProjectId.Value);
            if (project is null) throw new ArgumentException("Selected project does not exist.");
            item.Project = project.ProjectName;
        }
        if (item.StreetId.HasValue)
        {
            var street = await db.Streets.FindAsync(item.StreetId.Value);
            if (street is null || (item.ProjectId.HasValue && street.ProjectId != item.ProjectId)) throw new ArgumentException("Selected street is invalid for this project.");
            item.StreetNo = street.DisplayName;
        }
        if (item.PlotCategoryId.HasValue)
        {
            var category = await db.PlotCategories.FindAsync(item.PlotCategoryId.Value);
            if (category is null) throw new ArgumentException("Selected plot category does not exist.");
            item.Category = category.Name;
        }
        if (item.PlotSizeId.HasValue)
        {
            var size = await db.PlotSizes.FindAsync(item.PlotSizeId.Value);
            if (size is null || (item.PlotCategoryId.HasValue && size.PlotCategoryId != item.PlotCategoryId)) throw new ArgumentException("Selected size is invalid for this category.");
            item.Size = size.Name;
        }
        item.PlotNo = item.PlotNo.Trim().ToUpperInvariant();
        item.PlotNoNumeric = item.PlotNo;
        item.PlotNoSuffix = null;
    }
}
