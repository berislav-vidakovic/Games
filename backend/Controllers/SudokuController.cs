using Microsoft.AspNetCore.Mvc;
using Data;
using Microsoft.EntityFrameworkCore;

namespace Controllers;

[ApiController]
[Route("api/[controller]")]
public class SudokuController : ControllerBase
{
  private readonly GamesContext _context;

  public SudokuController(GamesContext context)
  {
    _context = context;
    Console.WriteLine("Backend build with automated CI/CD"); 

  }

  // GET: /api/sudoku/board
  [HttpGet("board")]   
  public async Task<IActionResult> GetBoards()
  {
    var boards = await _context.SudokuBoards.ToListAsync();
    if (boards.Count == 0)
      return StatusCode(StatusCodes.Status204NoContent, new { msg = "No Sudoku boards in DB" });

    Console.WriteLine("Response: " + string.Join(",", boards));
    return Ok(new { boards });
  }
}
