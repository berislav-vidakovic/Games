using Microsoft.EntityFrameworkCore;
using Models;

namespace Data;

public class GamesContext : DbContext
{
  public GamesContext(DbContextOptions<GamesContext> options) : base(options) { }

  public DbSet<SudokuBoard> SudokuBoards { get; set; }
  public DbSet<User> Users { get; set; }
  public DbSet<Localization> Locales { get; set; }


  protected override void OnModelCreating(ModelBuilder modelBuilder)
  {
    modelBuilder.Entity<User>().ToTable("users");
    modelBuilder.Entity<SudokuBoard>().ToTable("sudokuboards");
    modelBuilder.Entity<Localization>().ToTable("localization")
      .HasKey(l => new { l.ParamKey, l.Language });
  }
}
