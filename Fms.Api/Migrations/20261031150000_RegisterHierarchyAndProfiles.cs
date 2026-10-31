using Fms.Api.Data;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable
namespace Fms.Api.Migrations;

[DbContext(typeof(ApplicationDbContext))]
[Migration("20261031150000_RegisterHierarchyAndProfiles")]
public partial class RegisterHierarchyAndProfiles : Migration
{
    protected override void Up(MigrationBuilder m)
    {
        m.AddColumn<string>("FullName", "AspNetUsers", "nvarchar(150)", maxLength:150, nullable:false, defaultValue:"");
        m.AddColumn<int>("ProjectId", "LedgerFiles", "int", nullable:true);
        m.AddColumn<int>("StreetId", "LedgerFiles", "int", nullable:true);
        m.AddColumn<int>("PlotCategoryId", "LedgerFiles", "int", nullable:true);
        m.AddColumn<int>("PlotSizeId", "LedgerFiles", "int", nullable:true);
        m.AddColumn<string>("PlotNoNumeric", "LedgerFiles", "nvarchar(30)", maxLength:30, nullable:false, defaultValue:"");
        m.AddColumn<string>("PlotNoSuffix", "LedgerFiles", "nvarchar(10)", maxLength:10, nullable:true);
        m.Sql("UPDATE LedgerFiles SET PlotNoNumeric = PlotNo WHERE PlotNoNumeric = ''");
        m.CreateTable("PlotCategories", table => new { Id=table.Column<int>("int",nullable:false).Annotation("SqlServer:Identity","1, 1"),Name=table.Column<string>("nvarchar(80)",maxLength:80,nullable:false)}, constraints:table=>table.PrimaryKey("PK_PlotCategories",x=>x.Id));
        m.CreateTable("Streets", table => new { Id=table.Column<int>("int",nullable:false).Annotation("SqlServer:Identity","1, 1"),ProjectId=table.Column<int>("int",nullable:false),StreetNo=table.Column<string>("nvarchar(30)",maxLength:30,nullable:false)}, constraints:table=>{table.PrimaryKey("PK_Streets",x=>x.Id);table.ForeignKey("FK_Streets_Projects_ProjectId",x=>x.ProjectId,"Projects","Id",onDelete:ReferentialAction.Cascade);});
        m.CreateTable("PlotSizes", table => new { Id=table.Column<int>("int",nullable:false).Annotation("SqlServer:Identity","1, 1"),PlotCategoryId=table.Column<int>("int",nullable:false),Name=table.Column<string>("nvarchar(80)",maxLength:80,nullable:false)}, constraints:table=>{table.PrimaryKey("PK_PlotSizes",x=>x.Id);table.ForeignKey("FK_PlotSizes_PlotCategories_PlotCategoryId",x=>x.PlotCategoryId,"PlotCategories","Id",onDelete:ReferentialAction.Cascade);});
        m.CreateIndex("IX_Projects_ProjectCode","Projects","ProjectCode",unique:true);
        m.CreateIndex("IX_PlotCategories_Name","PlotCategories","Name",unique:true);
        m.CreateIndex("IX_Streets_ProjectId_StreetNo","Streets",new[]{"ProjectId","StreetNo"},unique:true);
        m.CreateIndex("IX_PlotSizes_PlotCategoryId_Name","PlotSizes",new[]{"PlotCategoryId","Name"},unique:true);
    }
    protected override void Down(MigrationBuilder m)
    {
        m.DropTable("PlotSizes");m.DropTable("Streets");m.DropTable("PlotCategories");m.DropIndex("IX_Projects_ProjectCode","Projects");
        m.DropColumn("FullName","AspNetUsers");m.DropColumn("ProjectId","LedgerFiles");m.DropColumn("StreetId","LedgerFiles");m.DropColumn("PlotCategoryId","LedgerFiles");m.DropColumn("PlotSizeId","LedgerFiles");m.DropColumn("PlotNoNumeric","LedgerFiles");m.DropColumn("PlotNoSuffix","LedgerFiles");
    }
}
