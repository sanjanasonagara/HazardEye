using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HazardEye.API.Migrations
{
    /// <inheritdoc />
    public partial class AddAreaAndPlantToTasks : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Area",
                table: "Tasks",
                type: "text",
                nullable: true);



            migrationBuilder.AddColumn<string>(
                name: "Plant",
                table: "Tasks",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Area",
                table: "Tasks");

            migrationBuilder.DropColumn(
                name: "Comments",
                table: "Tasks");

            migrationBuilder.DropColumn(
                name: "Plant",
                table: "Tasks");
        }
    }
}
