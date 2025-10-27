using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace Models;

[Table("sudokuboards")]
public class SudokuBoard
{
  [Key]
  [Column("board_id")]
  public int BoardId { get; set; }
  [Column("board")]
  public required string Board { get; set; }
  [Column("solution")]
  public required string Solution { get; set; }
  [Column("name")]
  public required string Name { get; set; }
  [Column("level")]
  public int Level { get; set; }
}

