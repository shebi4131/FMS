using Fms.Api.Models;
using Fms.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Fms.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class FileController : ControllerBase
{
    private readonly IFileService _fileService;
    public FileController(IFileService fileService)
    {
        _fileService = fileService;
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
}
