using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Fms.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddFileInDateCol : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "Date",
                table: "Files",
                newName: "FileOutDate");

            migrationBuilder.AddColumn<DateTime>(
                name: "FileInDate",
                table: "Files",
                type: "datetime2",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "FileInDate",
                table: "Files");

            migrationBuilder.RenameColumn(
                name: "FileOutDate",
                table: "Files",
                newName: "Date");
        }
    }
}
