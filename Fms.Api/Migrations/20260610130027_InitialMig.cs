using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Fms.Api.Migrations
{
    /// <inheritdoc />
    public partial class InitialMig : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "TimeIn",
                table: "Files");

            migrationBuilder.DropColumn(
                name: "TimeOut",
                table: "Files");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<TimeOnly>(
                name: "TimeIn",
                table: "Files",
                type: "time",
                nullable: true);

            migrationBuilder.AddColumn<TimeOnly>(
                name: "TimeOut",
                table: "Files",
                type: "time",
                nullable: true);
        }
    }
}
