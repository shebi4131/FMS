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
        // Business Logic: Set audit fields and defaults
        fileDto.CreatedAt = DateTime.Now;
        fileDto.UpdatedAt = null;

        // Set current date if not provided
        if (fileDto.Date == default)
            fileDto.Date = DateTime.Now;

        // Business Logic: Validate status transitions
        if (string.IsNullOrEmpty(fileDto.Status))
            fileDto.Status = "In"; // Default status

        if (fileDto.Date > DateTime.Now.Date)
        {
            throw new ArgumentException("File date cannot be in the future.");
        }

        // Delegate to repository for data persistence
        return await _files.CreateFileAsync(fileDto);
    }

    public async Task<bool> DeleteFileAsync(int id)
    {
        // Business Logic: Could add validation here (e.g., prevent deleting active files)
        var existingFile = await _files.GetFileByIdAsync(id);
        if (existingFile == null)
            return false;

        // Optional: Add business rule validation
        if (existingFile.Status == "In")
        {
            // Could prevent deletion of checked-in files
            // throw new InvalidOperationException("Cannot delete files that are currently checked in");
        }

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

        // Business Logic: Preserve creation audit fields
        var originalCreatedAt = existingFile.CreatedAt;
        var originalCreatedBy = existingFile.CreatedBy;

        // Update all properties
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

        // Business Logic: Set updated audit fields
        existingFile.UpdatedAt = DateTime.Now;
        existingFile.UpdatedBy = fileDto.UpdatedBy;

        // Business Logic: Preserve creation audit fields
        existingFile.CreatedAt = originalCreatedAt;
        existingFile.CreatedBy = originalCreatedBy;

        return await _files.UpdateFileAsync(id, existingFile);
    }

    // Additional Business Logic Methods

    public async Task<FileDto?> CheckInFileAsync(int id)
    {
        var file = await _files.GetFileByIdAsync(id);
        if (file == null) return null;

        // Business Logic: Update status and audit fields
        file.Status = "In";
        file.UpdatedAt = DateTime.Now;

        return await _files.UpdateFileAsync(id, file);
    }

    public async Task<FileDto?> CheckOutFileAsync(int id)
    {
        var file = await _files.GetFileByIdAsync(id);
        if (file == null) return null;

        // Business Logic: Update status and audit fields
        file.Status = "Out";
        file.UpdatedAt = DateTime.Now;

        return await _files.UpdateFileAsync(id, file);
    }

    public async Task<IEnumerable<FileDto>> GetFilesByStatusAsync(string status)
    {
        var allFiles = await _files.GetAllFilesAsync();
        return allFiles.Where(f => f.Status.Equals(status, StringComparison.OrdinalIgnoreCase));
    }

    public async Task<IEnumerable<FileDto>> GetFilesByDateRangeAsync(DateTime startDate, DateTime endDate)
    {
        var allFiles = await _files.GetAllFilesAsync();
        return allFiles.Where(f => f.Date.Date >= startDate.Date && f.Date.Date <= endDate.Date);
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