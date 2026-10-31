using Fms.Api.Data;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable
namespace Fms.Api.Migrations;

[DbContext(typeof(ApplicationDbContext))]
[Migration("20261031120000_AddReturnAudit")]
public partial class AddReturnAudit : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.AddColumn<string>(name: "ReturnRemarks", table: "Files", type: "nvarchar(500)", maxLength: 500, nullable: true);
        migrationBuilder.AddColumn<string>(name: "ReturnConfirmationNo", table: "Files", type: "nvarchar(40)", maxLength: 40, nullable: true);
        migrationBuilder.CreateIndex(name: "IX_Files_ReturnConfirmationNo", table: "Files", column: "ReturnConfirmationNo", unique: true, filter: "[ReturnConfirmationNo] IS NOT NULL");
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropIndex(name: "IX_Files_ReturnConfirmationNo", table: "Files");
        migrationBuilder.DropColumn(name: "ReturnRemarks", table: "Files");
        migrationBuilder.DropColumn(name: "ReturnConfirmationNo", table: "Files");
    }
}
