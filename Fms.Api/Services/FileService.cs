using Fms.Api.Models;
using Fms.Api.Repositories;

namespace Fms.Api.Services;

public class FileService : IFileService
{
    private readonly IFileRepository _files;

    public FileService(IFileRepository files)
    {
        _files = files;
    }

    public async Task<FileDto> CreateFileAsync(FileDto fileDto)
    {
        fileDto.CreatedAt = DateTime.Now;
        fileDto.UpdatedAt = null;

        if (fileDto.Date == default)
            fileDto.Date = DateTime.Now;

        if (string.IsNullOrEmpty(fileDto.Status))
            fileDto.Status = "In"; 

        if (fileDto.Date > DateTime.Now.Date)
        {
            throw new ArgumentException("File date cannot be in the future.");
        }

        return await _files.CreateFileAsync(fileDto);
    }

    public async Task<bool> DeleteFileAsync(int id)
    {
        var existingFile = await _files.GetFileByIdAsync(id);
        if (existingFile == null)
            return false;

        return await _files.DeleteFileAsync(id);
    }

    public async Task<IEnumerable<FileDto>> GetAllFilesAsync()
    {
        return await _files.GetAllFilesAsync();
    }

    public async Task<FileDto?> GetFileByIdAsync(int id)
    {
        return await _files.GetFileByIdAsync(id);
    }

    public async Task<FileDto?> UpdateFileAsync(int id, FileDto fileDto)
    {
        var existingFile = await _files.GetFileByIdAsync(id);
        if (existingFile == null)
            return null;

        if (fileDto.Date > DateTime.Now.Date)
        {
            throw new ArgumentException("File date cannot be in the future.");
        }

        var originalCreatedAt = existingFile.CreatedAt;
        var originalCreatedBy = existingFile.CreatedBy;

        existingFile.PlotNo = fileDto.PlotNo;
        existingFile.StNo = fileDto.StNo;
        existingFile.Phase = fileDto.Phase;
        existingFile.From = fileDto.From;
        existingFile.Carrier = fileDto.Carrier;
        existingFile.To = fileDto.To;
        existingFile.Purpose = fileDto.Purpose;
        existingFile.Date = fileDto.Date;
        existingFile.Status = fileDto.Status;
        existingFile.Remarks = fileDto.Remarks;

        existingFile.UpdatedAt = DateTime.Now;
        existingFile.UpdatedBy = fileDto.UpdatedBy;

        existingFile.CreatedAt = originalCreatedAt;
        existingFile.CreatedBy = originalCreatedBy;

        return await _files.UpdateFileAsync(id, existingFile);
    }

    public async Task<(IEnumerable<FileDto> Files, int TotalCount)> GetFilteredFilesAsync(
        FileFilterDto filterDto,
        CancellationToken cancellationToken = default)
    {
        return await _files.GetFilteredFilesAsync(filterDto, cancellationToken);
    }

    public async Task<object> GetFileSummaryAsync()
    {
        var allFiles = await _files.GetAllFilesAsync();

        return new
        {
            TotalFiles = allFiles.Count(),
            FilesIn = allFiles.Count(f => f.Status == "In"),
            FilesOut = allFiles.Count(f => f.Status == "Out"),
            TodaysFiles = allFiles.Count(f => f.Date.Date == DateTime.Today),
            RecentFiles = allFiles.Count(f => f.CreatedAt >= DateTime.Today.AddDays(-7))
        };
    }
}