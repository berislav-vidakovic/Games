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
  public string Board { get; set; }
  [Column("solution")]
  public string Solution { get; set; }
}

