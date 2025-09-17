using Fms.Api.Models;

namespace Fms.Api.Services;

public interface IFileService
{
    Task<FileDto> CreateFileAsync(FileDto fileDto);
    Task<IEnumerable<FileDto>> GetAllFilesAsync();
    Task<FileDto?> GetFileByIdAsync(int id);
    Task<FileDto?> UpdateFileAsync(int id, FileDto fileDto);
    Task<bool> DeleteFileAsync(int id);
    Task<FileDto?> CheckInFileAsync(int id);
    Task<FileDto?> CheckOutFileAsync(int id);
    Task<IEnumerable<FileDto>> GetFilesByStatusAsync(string status);
    Task<IEnumerable<FileDto>> GetFilesByDateRangeAsync(DateTime startDate, DateTime endDate);
    Task<object> GetFileSummaryAsync();
}
