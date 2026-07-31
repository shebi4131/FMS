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
        fileDto.FileInDate = null;

        if (fileDto.FileOutDate == default)
            fileDto.FileOutDate = DateTime.Now;

        if (string.IsNullOrEmpty(fileDto.Status))
            fileDto.Status = "In"; 

        if (fileDto.FileOutDate > DateTime.Now)
        {
            throw new ArgumentException("File out date cannot be in the future.");
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

        if (fileDto.FileOutDate > DateTime.Now)
        {
            throw new ArgumentException("File out date cannot be in the future.");
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
        existingFile.FileOutDate = fileDto.FileOutDate;

        // Sync FileInDate with Status so they can never contradict each other.
        if (fileDto.Status == "In")
        {
            // Stamp real server time only the first time it's marked In.
            if (!existingFile.FileInDate.HasValue)
            {
                existingFile.FileInDate = DateTime.Now;
            }
            // If already set, leave the original timestamp untouched on subsequent saves.
        }
        else
        {
            // Status is "Out" (or anything else) — file hasn't returned, so no in-date.
            existingFile.FileInDate = null;
        }

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
            TodaysOutFiles = allFiles.Count(f => f.FileOutDate.Date == DateTime.Today),
            TodaysInFiles = allFiles.Count(f => f.FileInDate.HasValue && f.FileInDate.Value.Date == DateTime.Today),
            RecentFiles = allFiles.Count(f => f.CreatedAt >= DateTime.Today.AddDays(-7))
        };
    }
}