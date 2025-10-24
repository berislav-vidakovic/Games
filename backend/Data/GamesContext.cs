using Microsoft.EntityFrameworkCore;
using Models;

namespace Data;

public class GamesContext : DbContext
{
  public GamesContext(DbContextOptions<GamesContext> options) : base(options) { }

  public DbSet<SudokuBoard> SudokuBoards { get; set; }

  protected override void OnModelCreating(ModelBuilder modelBuilder)
  {
    modelBuilder.Entity<SudokuBoard>().ToTable("sudokuboards");
  }
}
