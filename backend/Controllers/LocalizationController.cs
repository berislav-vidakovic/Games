using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Data;
using Models;
using System.Text.Json;
using Services;

namespace Controllers;

[ApiController]
[Route("api/[controller]")]
public class LocalizationController : ControllerBase
{
  private readonly GamesContext _context;

  private readonly GameManager _gameManager;

  private readonly WebSocketManager _wsManager;

  public LocalizationController(GamesContext context, WebSocketManager wsManager, GameManager gm)
  {
    _context = context;
    _wsManager = wsManager;
    _gameManager = gm;
  } 

  // POST /api/localization/get
  [HttpGet("get")]
  public async Task<ActionResult<IEnumerable<Localization>>> GetLocalization()
  {     
    var locales = await _context.Locales.ToListAsync();
    var response = new { locales };
    return Ok( response );  
  }
}
