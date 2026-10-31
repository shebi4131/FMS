using Fms.Api.Data;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable
namespace Fms.Api.Migrations;

[DbContext(typeof(ApplicationDbContext))]
[Migration("20261031170000_AddStreetNumberPart")]
public partial class AddStreetNumberPart : Migration
{
    protected override void Up(MigrationBuilder m)
    {
        m.DropIndex("IX_Streets_ProjectId_StreetNo", "Streets");
        m.AddColumn<string>("StreetNo2", "Streets", "nvarchar(10)", maxLength: 10, nullable: true);
        m.CreateIndex("IX_Streets_ProjectId_StreetNo_StreetNo2", "Streets", new[] { "ProjectId", "StreetNo", "StreetNo2" }, unique: true);
    }

    protected override void Down(MigrationBuilder m)
    {
        m.DropIndex("IX_Streets_ProjectId_StreetNo_StreetNo2", "Streets");
        m.DropColumn("StreetNo2", "Streets");
        m.CreateIndex("IX_Streets_ProjectId_StreetNo", "Streets", new[] { "ProjectId", "StreetNo" }, unique: true);
    }
}
