using Fms.Api.Models;
using Fms.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Fms.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class FileController : ControllerBase
{
    private readonly IFileService _fileService;
    private readonly IEmailService _emailService;
    public FileController(IFileService fileService, IEmailService emailService)
    {
        _fileService = fileService;
        _emailService = emailService;
    }
    [HttpPost("create")]
    public async Task<FileDto> CreateAsync(FileDto fileDto)
    {
        return await _fileService.CreateFileAsync(fileDto);
    }

    [HttpGet("all")]
    public async Task<IEnumerable<FileDto>> GetAllAsync()
    {
        return await _fileService.GetAllFilesAsync();
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<FileDto>> GetByIdAsync(int id)
    {
        var file = await _fileService.GetFileByIdAsync(id);
        if (file == null)
            return NotFound();
        return Ok(file);
    }

    [HttpPut("update/{id}")]
    public async Task<ActionResult<FileDto>> UpdateAsync(int id, FileDto fileDto)
    {
        var updatedFile = await _fileService.UpdateFileAsync(id, fileDto);
        if (updatedFile == null)
            return NotFound();
        return Ok(updatedFile);
    }

    [HttpDelete("delete/{id}")]
    public async Task<IActionResult> DeleteAsync(int id)
    {
        var success = await _fileService.DeleteFileAsync(id);
        if (!success)
            return NotFound();
        return NoContent();
    }

    [HttpGet("filtered")]
    public async Task<ActionResult> GetFilteredFilesAsync(
     [FromQuery] FileFilterDto filterDto,
     CancellationToken cancellationToken = default)
    {
        var result = await _fileService.GetFilteredFilesAsync(filterDto, cancellationToken);

        return Ok(new
        {
            Data = result.Files,
            TotalCount = result.TotalCount,
            page = filterDto.Page,
            limit = filterDto.Limit
        });
    }

    [HttpGet("summary")]
    public async Task<IActionResult> GetFileSummaryAsync()
    {
        var summary = await _fileService.GetFileSummaryAsync();
        return Ok(summary);
    }

    [HttpGet("notifications")]
    public async Task<IActionResult> GetNotifications([FromServices] Fms.Api.Data.ApplicationDbContext db)
    {
        var now = DateTime.Now;
        var overdue = await Microsoft.EntityFrameworkCore.EntityFrameworkQueryableExtensions.CountAsync(
            db.Files, f => f.Status == "Out" && f.FileOutDate < now.AddDays(-1));
        var returnedToday = await Microsoft.EntityFrameworkCore.EntityFrameworkQueryableExtensions.CountAsync(
            db.Files, f => f.FileInDate.HasValue && f.FileInDate.Value.Date == now.Date);
        return Ok(new[] {
            new { Id = $"overdue-{now:yyyyMMdd}-{overdue}", Type = "warning", Title = "Overdue custody", Message = $"{overdue} file(s) have been out for more than 24 hours.", Count = overdue },
            new { Id = $"returns-{now:yyyyMMdd}-{returnedToday}", Type = "success", Title = "Returned today", Message = $"{returnedToday} file(s) returned today.", Count = returnedToday }
        }.Where(x => x.Count > 0));
    }

    [HttpPost("return/{id:int}")]
    public async Task<IActionResult> ReturnFile(int id, [FromBody] ReturnFileDto dto,
        [FromServices] Fms.Api.Data.ApplicationDbContext db)
    {
        var file = await db.Files.FirstOrDefaultAsync(x => x.Id == id);
        if (file is null) return NotFound(new { message = "Movement record was not found." });
        if (file.Status == "In") return BadRequest(new { message = "This file has already been returned." });

        file.Status = "In";
        file.FileInDate = DateTime.Now;
        file.ReturnRemarks = string.IsNullOrWhiteSpace(dto.Remarks) ? null : dto.Remarks.Trim();
        file.ReturnConfirmationNo = $"RET-{DateTime.Now:yyyyMMdd}-{file.Id:D6}";
        file.UpdatedAt = DateTime.Now;
        file.UpdatedBy = User.Identity?.Name;
        await db.SaveChangesAsync();

        return Ok(new
        {
            message = "File returned successfully.",
            confirmationNumber = file.ReturnConfirmationNo,
            returnedAt = file.FileInDate,
            fileId = file.Id
        });
    }

    [HttpPost("send-pdf-email")]
    public async Task<IActionResult> SendPdfEmailAsync([FromBody] SendPdfEmailDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Recipient))
            return BadRequest(new { message = "Recipient email is required." });
        if (string.IsNullOrWhiteSpace(dto.PdfBase64))
            return BadRequest(new { message = "PDF data is required." });

        var pdfBytes = Convert.FromBase64String(dto.PdfBase64);
        var fileName = string.IsNullOrWhiteSpace(dto.FileName)
            ? $"Records_Export_{DateTime.Now:yyyy-MM-dd}.pdf"
            : dto.FileName;

        var body = $@"
        <h3>FMS Records Export</h3>
        <p>Please find the attached records export generated on {DateTime.Now:dd MMM yyyy hh:mm tt}.</p>";

        await _emailService.SendEmailWithAttachmentAsync(
            dto.Recipient,
            "FMS - Records Export",
            body,
            pdfBytes,
            fileName);

        return Ok(new { message = $"PDF sent successfully to {dto.Recipient}" });
    }
}
