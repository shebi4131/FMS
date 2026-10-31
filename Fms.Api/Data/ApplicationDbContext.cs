using Fms.Api.Models;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace Fms.Api.Data;

public class ApplicationDbContext : IdentityDbContext<ApplicationUser>
{
    public DbSet<FileDto> Files { get; set; }
    public DbSet<PasswordResetOtp> PasswordResetOtps { get; set; }
    public DbSet<Project> Projects { get; set; }
    public DbSet<LedgerFile> LedgerFiles { get; set; }
    public DbSet<Street> Streets { get; set; }
    public DbSet<PlotCategory> PlotCategories { get; set; }
    public DbSet<PlotSize> PlotSizes { get; set; }


    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);
        builder.Entity<FileDto>(
            entity => { entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).ValueGeneratedOnAdd();
            });

        builder.Entity<FileDto>().HasQueryFilter(f => !f.IsDeleted);
        builder.Entity<FileDto>().HasIndex(f => new { f.Project, f.StNo, f.PlotNo, f.MovementType });
        builder.Entity<FileDto>().HasIndex(f => f.ReturnConfirmationNo).IsUnique().HasFilter("[ReturnConfirmationNo] IS NOT NULL");
        builder.Entity<LedgerFile>().HasIndex(f => new { f.Project, f.StreetNo, f.CurrentFileNo });
        builder.Entity<Project>().HasIndex(x => x.ProjectCode).IsUnique();
        builder.Entity<Street>().HasIndex(x => new { x.ProjectId, x.StreetNo, x.StreetNo2 }).IsUnique();
        builder.Entity<PlotCategory>().HasIndex(x => x.Name).IsUnique();
        builder.Entity<PlotSize>().HasIndex(x => new { x.PlotCategoryId, x.Name }).IsUnique();
    }
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }
}
