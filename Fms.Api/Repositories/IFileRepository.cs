using Fms.Api.Models;

namespace Fms.Api.Repositories;

public interface IFileRepository 
{
    Task<IEnumerable<FileDto>> GetAllFilesAsync();
    Task<FileDto?> GetFileByIdAsync(int id);
    Task<FileDto> CreateFileAsync(FileDto fileDto);
    Task<FileDto?> UpdateFileAsync(int id, FileDto fileDto);
    Task<bool> DeleteFileAsync(int id);
}
