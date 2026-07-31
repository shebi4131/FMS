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
            .ThenByDescending(f => f.FileOutDate)
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
        existingFile.FileOutDate = fileDto.FileOutDate;
        existingFile.FileInDate = fileDto.FileInDate;
        existingFile.Status = fileDto.Status;
        existingFile.Remarks = fileDto.Remarks;
        existingFile.CreatedAt = originalCreatedAt;
        existingFile.UpdatedAt = DateTime.Now;
        existingFile.UpdatedBy = fileDto.UpdatedBy;

        await _context.SaveChangesAsync();
        return existingFile;
    }

    public async Task<bool> DeleteFileAsync(int id)
    {
        var file = await _context.Files.FindAsync(id);
        if (file == null)
            return false;
        file.IsDeleted = true;
        file.DeletedAt = DateTime.Now;

        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<(IEnumerable<FileDto> Files, int TotalCount)> GetFilteredFilesAsync(FileFilterDto filterDto,
      CancellationToken cancellationToken = default)
    {
        var query = _context.Files.AsQueryable();

        // Apply filters
        if (!string.IsNullOrWhiteSpace(filterDto.PlotNo))
            query = query.Where(f => f.PlotNo.Contains(filterDto.PlotNo));
        if (!string.IsNullOrWhiteSpace(filterDto.StNo))
            query = query.Where(f => f.StNo.Contains(filterDto.StNo));
        if (!string.IsNullOrWhiteSpace(filterDto.Phase))
            query = query.Where(f => f.Phase.Contains(filterDto.Phase));
        if (!string.IsNullOrWhiteSpace(filterDto.From))
            query = query.Where(f => f.From.Contains(filterDto.From));
        if (!string.IsNullOrWhiteSpace(filterDto.Carrier))
            query = query.Where(f => f.Carrier.Contains(filterDto.Carrier));
        if (!string.IsNullOrWhiteSpace(filterDto.To))
            query = query.Where(f => f.To.Contains(filterDto.To));
        if (!string.IsNullOrWhiteSpace(filterDto.Purpose))
            query = query.Where(f => f.Purpose.Contains(filterDto.Purpose));
        if (filterDto.FileOutDate.HasValue)
            query = query.Where(f => f.FileOutDate >= filterDto.FileOutDate.Value);
        if (filterDto.FileInDate.HasValue)
            query = query.Where(f => f.FileInDate >= filterDto.FileInDate.Value);
        if (!string.IsNullOrWhiteSpace(filterDto.Status))
            query = query.Where(f => f.Status.Contains(filterDto.Status));
        if (!string.IsNullOrWhiteSpace(filterDto.Remarks))
            query = query.Where(f => f.Remarks.Contains(filterDto.Remarks));

        // GET TOTAL COUNT (before pagination)
        var totalCount = await query.CountAsync(cancellationToken);

        // APPLY SORTING
        query = query.OrderByDescending(f => f.CreatedAt).ThenByDescending(f => f.FileOutDate);

        // APPLY PAGINATION
        var files = await query
            .Skip((filterDto.Page - 1) * filterDto.Limit)
            .Take(filterDto.Limit)
            .ToListAsync(cancellationToken);

        return (files, totalCount);
    }
}