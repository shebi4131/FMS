using Fms.Api.Data;
using Fms.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace Fms.Api.Repositories;

public class FileRepository : IFileRepository
{
    private readonly ApplicationDbContext _context;
    public FileRepository(ApplicationDbContext context)
    {
        _context = context;
    }
    public async Task<FileDto> CreateFileAsync(FileDto fileDto)
    {
       _context.Files.Add(fileDto);
         await _context.SaveChangesAsync();
        return fileDto;
    }

    public async Task<FileDto?> GetFileByIdAsync(int id)
    {
        return await _context.Files.FindAsync(id);
    }

    public async Task<IEnumerable<FileDto>> GetAllFilesAsync()
    {
        return await _context.Files.OrderByDescending(f => f.CreatedAt)
            .ThenByDescending(f => f.Date )
            .ToListAsync();
    }

    public async Task<FileDto?> UpdateFileAsync(int id, FileDto fileDto)
    {
        var existingFile = await _context.Files.FindAsync(id);
        if (existingFile == null)
            return null;

        var originalCreatedAt = existingFile.CreatedAt;

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
        existingFile.CreatedAt = originalCreatedAt;
        existingFile.UpdatedAt = DateTime.Now;
        existingFile.UpdatedBy = fileDto.UpdatedBy;

        await _context.SaveChangesAsync();

        return existingFile;
    }

    public async  Task<bool> DeleteFileAsync(int id)
    {
        var file = await _context.Files.FindAsync(id);

        if (file == null)

            return false;
        _context.Files.Remove(file);
        await _context.SaveChangesAsync();
        return true;
    }
}
