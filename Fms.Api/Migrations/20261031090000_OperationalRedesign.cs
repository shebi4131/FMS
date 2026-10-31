using Microsoft.EntityFrameworkCore.Migrations;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Fms.Api.Data;

#nullable disable
namespace Fms.Api.Migrations;

[DbContext(typeof(ApplicationDbContext))]
[Migration("20261031090000_OperationalRedesign")]
public partial class OperationalRedesign : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.AddColumn<string>(name: "Project", table: "Files", type: "nvarchar(100)", maxLength: 100, nullable: false, defaultValue: "");
        migrationBuilder.AddColumn<string>(name: "Size", table: "Files", type: "nvarchar(50)", maxLength: 50, nullable: false, defaultValue: "");
        migrationBuilder.AddColumn<string>(name: "MovementType", table: "Files", type: "nvarchar(20)", maxLength: 20, nullable: false, defaultValue: "Daily");
        migrationBuilder.Sql("UPDATE Files SET Project = Phase WHERE Project = ''");
        migrationBuilder.CreateTable(name: "LedgerFiles", columns: table => new {
            Id = table.Column<int>(type: "int", nullable: false).Annotation("SqlServer:Identity", "1, 1"),
            Project = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false), StreetNo = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false), PlotNo = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false), Size = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false), CurrentFileNo = table.Column<string>(type: "nvarchar(60)", maxLength: 60, nullable: false), OldFileNo = table.Column<string>(type: "nvarchar(60)", maxLength: 60, nullable: true), IsRenumbered = table.Column<bool>(type: "bit", nullable: false), IsDuplicate = table.Column<bool>(type: "bit", nullable: false), DuplicateOfFileNo = table.Column<string>(type: "nvarchar(60)", maxLength: 60, nullable: true), Category = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false), OtherCategory = table.Column<string>(type: "nvarchar(80)", maxLength: 80, nullable: true), Notes = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true), CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false), UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
        }, constraints: table => table.PrimaryKey("PK_LedgerFiles", x => x.Id));
        migrationBuilder.CreateIndex(name: "IX_Files_Project_StNo_PlotNo_MovementType", table: "Files", columns: new[] { "Project", "StNo", "PlotNo", "MovementType" });
        migrationBuilder.CreateIndex(name: "IX_LedgerFiles_Project_StreetNo_CurrentFileNo", table: "LedgerFiles", columns: new[] { "Project", "StreetNo", "CurrentFileNo" });
    }
    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropTable(name: "LedgerFiles"); migrationBuilder.DropIndex(name: "IX_Files_Project_StNo_PlotNo_MovementType", table: "Files"); migrationBuilder.DropColumn(name: "Project", table: "Files"); migrationBuilder.DropColumn(name: "Size", table: "Files"); migrationBuilder.DropColumn(name: "MovementType", table: "Files");
    }
}
