using ClosedXML.Excel;
using Fms.Api.Data;
using Fms.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Fms.Api.Controllers;

[ApiController, Route("api/[controller]"), Authorize(Roles = "Admin,Manager")]
public class ImportController(ApplicationDbContext db) : ControllerBase
{
    private static readonly string[] Headers = ["Project", "Street", "Plot", "Size", "From", "To", "Purpose", "OutDate", "OutTime", "Remarks"];

    [HttpGet("template")]
    public IActionResult Template([FromQuery] string module = "Daily")
    {
        using var wb = new XLWorkbook(); var ws = wb.Worksheets.Add("Import Template");
        for (var i = 0; i < Headers.Length; i++) { ws.Cell(1, i + 1).Value = Headers[i]; ws.Cell(1, i + 1).Style.Font.Bold = true; }
        ws.Cell(2, 1).Value = "JG-I"; ws.Cell(2, 2).Value = "12"; ws.Cell(2, 3).Value = "45-A";
        ws.Cell(2, 4).Value = "10 Marla"; ws.Cell(2, 5).Value = "Record Room"; ws.Cell(2, 6).Value = "Legal";
        ws.Cell(2, 7).Value = "Review"; ws.Cell(2, 8).Value = DateTime.Today; ws.Cell(2, 8).Style.DateFormat.Format = "dd-MM-yyyy";
        ws.Cell(2, 9).Value = DateTime.Now.TimeOfDay; ws.Cell(2, 9).Style.DateFormat.Format = "hh:mm AM/PM";
        ws.Columns().AdjustToContents(); using var stream = new MemoryStream(); wb.SaveAs(stream);
        return File(stream.ToArray(), "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", $"{module}-movement-template.xlsx");
    }

    [HttpPost("movements")]
    [RequestSizeLimit(10_000_000)]
    public async Task<IActionResult> Movements(IFormFile file, [FromForm] string module = "Daily")
    {
        if (file.Length == 0) return BadRequest(new { message = "Choose a non-empty Excel or CSV file." });
        var rows = new List<string[]>();
        if (Path.GetExtension(file.FileName).Equals(".csv", StringComparison.OrdinalIgnoreCase))
        {
            using var reader = new StreamReader(file.OpenReadStream()); await reader.ReadLineAsync();
            while (await reader.ReadLineAsync() is { } line) rows.Add(ParseCsv(line));
        }
        else
        {
            using var wb = new XLWorkbook(file.OpenReadStream()); var ws = wb.Worksheet(1);
            foreach (var row in ws.RowsUsed().Skip(1)) rows.Add(Enumerable.Range(1, Headers.Length).Select(i => row.Cell(i).GetFormattedString()).ToArray());
        }
        var errors = new List<string>(); var imported = 0;
        for (var index = 0; index < rows.Count; index++)
        {
            var r = rows[index]; if (r.All(string.IsNullOrWhiteSpace)) continue;
            try
            {
                if (r.Length < 9 || string.IsNullOrWhiteSpace(r[0]) || string.IsNullOrWhiteSpace(r[1]) || string.IsNullOrWhiteSpace(r[2])) throw new Exception("Project, Street and Plot are required.");
                var formats = new[] { "dd-MM-yyyy", "d-M-yyyy", "yyyy-MM-dd", "M/d/yyyy", "MM/dd/yyyy" };
                var validDate = DateTime.TryParseExact(r[7].Trim(), formats, System.Globalization.CultureInfo.InvariantCulture,
                    System.Globalization.DateTimeStyles.None, out var d) || DateTime.TryParse(r[7], out d);
                var date = validDate ? d.Date : throw new Exception("Invalid OutDate. Use DD-MM-YYYY.");
                if (DateTime.TryParse(r[8], out var timeValue)) date = date.Add(timeValue.TimeOfDay);
                else if (TimeSpan.TryParse(r[8], out var t)) date = date.Add(t);
                var active = db.Files.Any(x => x.Project == r[0].Trim() && x.StNo == r[1].Trim() && x.PlotNo == r[2].Trim() && x.Status == "Out");
                if (active) throw new Exception("File is already out.");
                db.Files.Add(new FileDto { Project = r[0].Trim(), Phase = r[0].Trim(), StNo = r[1].Trim(), PlotNo = r[2].Trim(), Size = r[3].Trim(), From = r[4].Trim(), To = r[5].Trim(), Carrier = "", Purpose = r[6].Trim(), FileOutDate = date, Status = "Out", MovementType = module == "Extended" ? "Extended" : "Daily", Remarks = r.ElementAtOrDefault(9), CreatedAt = DateTime.Now });
                await db.SaveChangesAsync(); imported++;
            }
            catch (Exception ex) { errors.Add($"Row {index + 2}: {ex.Message}"); }
        }
        return Ok(new { imported, failed = errors.Count, errors = errors.Take(50) });
    }

    private static string[] ParseCsv(string line)
    {
        var result = new List<string>(); var current = ""; var quoted = false;
        for (var i = 0; i < line.Length; i++) { var c = line[i]; if (c == '"') { if (quoted && i + 1 < line.Length && line[i + 1] == '"') { current += '"'; i++; } else quoted = !quoted; } else if (c == ',' && !quoted) { result.Add(current); current = ""; } else current += c; }
        result.Add(current); return result.ToArray();
    }

    [HttpGet("master-template")]
    public IActionResult MasterTemplate([FromQuery] string type)
    {
        var headers = type.ToLowerInvariant() switch
        {
            "projects" => new[] { "ProjectCode", "ProjectName" },
            "streets" => new[] { "ProjectCode", "StreetNo", "StreetNo2" },
            "categories" => new[] { "CategoryName" },
            "sizes" => new[] { "CategoryName", "SizeName" },
            "plots" => new[] { "ProjectCode", "StreetNo", "StreetNo2", "CategoryName", "SizeName", "PlotNumber", "CurrentFileNo", "OldFileNo", "IsDuplicate", "DuplicateOfFileNo", "IsRenumbered", "Notes" },
            _ => throw new ArgumentException("Unknown register type.")
        };
        using var wb = new XLWorkbook(); var ws = wb.Worksheets.Add("Template");
        for (var i=0;i<headers.Length;i++){ws.Cell(1,i+1).Value=headers[i];ws.Cell(1,i+1).Style.Font.Bold=true;ws.Cell(1,i+1).Style.Fill.BackgroundColor=XLColor.FromHtml("#DFF0E9");}
        var samples = type.ToLowerInvariant() switch
        {
            "projects" => new[] { "JG-I", "Jinnah Gardens Phase I" },
            "streets" => new[] { "JG-I", "19", "B" },
            "categories" => new[] { "Residential" },
            "sizes" => new[] { "Residential", "30x60" },
            _ => new[] { "JG-I", "19", "B", "Residential", "30x60", "7A", "JG1-19B-7A", "", "No", "", "No", "Sample file" }
        };
        for(var i=0;i<samples.Length;i++)ws.Cell(2,i+1).Value=samples[i];ws.SheetView.FreezeRows(1);ws.Columns().AdjustToContents();
        using var stream=new MemoryStream();wb.SaveAs(stream);return File(stream.ToArray(),"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",$"{type}-import-template.xlsx");
    }

    [HttpPost("master")]
    [RequestSizeLimit(10_000_000)]
    public async Task<IActionResult> Master(IFormFile file,[FromForm]string type)
    {
        var rows=new List<string[]>();
        if(Path.GetExtension(file.FileName).Equals(".csv",StringComparison.OrdinalIgnoreCase)){using var reader=new StreamReader(file.OpenReadStream());await reader.ReadLineAsync();while(await reader.ReadLineAsync() is { } line)rows.Add(ParseCsv(line));}
        else{using var wb=new XLWorkbook(file.OpenReadStream());var ws=wb.Worksheet(1);foreach(var row in ws.RowsUsed().Skip(1))rows.Add(Enumerable.Range(1,row.LastCellUsed()?.Address.ColumnNumber??1).Select(i=>row.Cell(i).GetFormattedString().Trim()).ToArray());}
        var imported=0;var errors=new List<string>();
        for(var i=0;i<rows.Count;i++)try
        {
            var r=rows[i];if(r.All(string.IsNullOrWhiteSpace))continue;
            switch(type.ToLowerInvariant())
            {
                case "projects": db.Projects.Add(new Project{ProjectCode=r[0],ProjectName=r[1],Status="Active"});break;
                case "streets": {var p=await db.Projects.FirstOrDefaultAsync(x=>x.ProjectCode==r[0])??throw new Exception("Project code not found.");db.Streets.Add(new Street{ProjectId=p.Id,StreetNo=r[1],StreetNo2=string.IsNullOrWhiteSpace(r.ElementAtOrDefault(2))?null:r[2].ToUpperInvariant()});break;}
                case "categories": db.PlotCategories.Add(new PlotCategory{Name=r[0]});break;
                case "sizes": {var c=await db.PlotCategories.FirstOrDefaultAsync(x=>x.Name==r[0])??throw new Exception("Category not found.");db.PlotSizes.Add(new PlotSize{PlotCategoryId=c.Id,Name=r[1]});break;}
                case "plots":
                {
                    var p=await db.Projects.FirstOrDefaultAsync(x=>x.ProjectCode==r[0])??throw new Exception("Project code not found.");
                    var streetPart2=string.IsNullOrWhiteSpace(r.ElementAtOrDefault(2))?null:r[2].ToUpperInvariant();
                    var s=await db.Streets.FirstOrDefaultAsync(x=>x.ProjectId==p.Id&&x.StreetNo==r[1]&&x.StreetNo2==streetPart2)??throw new Exception("Street not found in project.");
                    var c=await db.PlotCategories.FirstOrDefaultAsync(x=>x.Name==r[3])??throw new Exception("Category not found.");
                    var z=await db.PlotSizes.FirstOrDefaultAsync(x=>x.PlotCategoryId==c.Id&&x.Name==r[4])??throw new Exception("Size not found in category.");
                    var plotNo=r[5].Trim().ToUpperInvariant();db.LedgerFiles.Add(new LedgerFile{ProjectId=p.Id,StreetId=s.Id,PlotCategoryId=c.Id,PlotSizeId=z.Id,Project=p.ProjectName,StreetNo=s.DisplayName,Category=c.Name,Size=z.Name,PlotNoNumeric=plotNo,PlotNo=plotNo,CurrentFileNo=r[6],OldFileNo=r.ElementAtOrDefault(7),IsDuplicate=Yes(r.ElementAtOrDefault(8)),DuplicateOfFileNo=r.ElementAtOrDefault(9),IsRenumbered=Yes(r.ElementAtOrDefault(10)),Notes=r.ElementAtOrDefault(11)});break;
                }
                default: throw new Exception("Unknown register type.");
            }
            await db.SaveChangesAsync();imported++;
        }catch(Exception ex){errors.Add($"Row {i+2}: {ex.GetBaseException().Message}");db.ChangeTracker.Clear();}
        return Ok(new{imported,failed=errors.Count,errors=errors.Take(50)});
    }

    private static bool Yes(string? value)=>value?.Equals("yes",StringComparison.OrdinalIgnoreCase)==true||value=="1"||value?.Equals("true",StringComparison.OrdinalIgnoreCase)==true;
}
