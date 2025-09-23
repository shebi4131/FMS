using Fms.Api.Models;

namespace Fms.Api.Services;

public interface IFileService
{
    Task<FileDto> CreateFileAsync(FileDto fileDto);
    Task<IEnumerable<FileDto>> GetAllFilesAsync();
    Task<FileDto?> GetFileByIdAsync(int id);
    Task<FileDto?> UpdateFileAsync(int id, FileDto fileDto);
    Task<bool> DeleteFileAsync(int id);
    Task<(IEnumerable<FileDto> Files, int TotalCount)> GetFilteredFilesAsync(
        FileFilterDto filterDto,
        CancellationToken cancellationToken = default);
    Task<object> GetFileSummaryAsync();
}
