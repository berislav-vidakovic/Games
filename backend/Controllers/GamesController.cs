using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Data;
using Models;
using System.Text.Json;
using Services;

namespace Controllers;

[ApiController]
[Route("api/[controller]")]
public class GamesController : ControllerBase
{
  private readonly GamesContext _context;

  private readonly WebSocketManager _wsManager;

  private readonly GameManager _gameManager;

  public GamesController(GamesContext context, WebSocketManager wsManager, GameManager gm)
  {
    _context = context;
    _wsManager = wsManager;
    _gameManager = gm;
  }

  // POST /api/games/run  - Request sent from Panel browser
  [HttpPost("run")]
  public IActionResult PostRunGame([FromBody] JsonElement body)
  {
    try 
    { // Req: { run: "Connect Four", userId1, userId2, senderId } Resp: { game: "Connect Four", gameid, senderId }
      if (body.TryGetProperty("run", out JsonElement game))
      { // Req: { action: run, userId1, userId2 } Resp: { gameid }
        Console.WriteLine("POst Run Game 1");
        if (!body.TryGetProperty("userId1", out var callerId1prop) ||
            !body.TryGetProperty("userId2", out var calleeId2prop) ||
            !body.TryGetProperty("senderId", out var senderIdprop))
          return BadRequest(new
          {
            acknowledged = false,
            error = "Both userId1, userId2 required in POST request"
          });
        Console.WriteLine("POst Run Game 2");

        int userId1 = callerId1prop.GetInt32()!;
        int userId2 = calleeId2prop.GetInt32()!;
        int senderId = senderIdprop.GetInt32()!;

        string gameid = _gameManager.GetGameID(userId1, userId2);
        var response = new { game, gameid, senderId };
        Console.WriteLine("POst Run Game 3");

        return Ok(response);
      }
    }
    catch (Exception ex)
    {
      Console.WriteLine($"Error in Post Run Received: {ex.Message}");
      return StatusCode(500, new { acknowledged = false, error = ex.Message });
    }
    return StatusCode(500, new { acknowledged = false });
  }

  // POST /api/games/init - Request sent from Game browser
  [HttpPost("init")]
  public async Task<IActionResult> PostInitGame([FromBody] JsonElement body)
  {
    try  // POST request send from Game new browser
    { // Req: {gameId, userId} Resp: {gameId, id, userName, user2Id, user2Name}
      if (body.TryGetProperty("gameId", out JsonElement game))
      { 
        if (!body.TryGetProperty("userId", out JsonElement userIdprop) )
          return BadRequest(new { acknowledged = false,
            error = "Missing keys in POST request" });

        string gameId = game.ToString()!;
        if (!_gameManager.IsGameInitialized(gameId) )
          return BadRequest(new { acknowledged = false, error = "Invalid gameId in POST request" });

        int userId = userIdprop.GetInt32()!;
        int user2Id = _gameManager.GetPartnerId(gameId, userId);

        Guid id = Guid.NewGuid();
        _gameManager.SetUserGuid(gameId, userId, id);
        User? user1 = await _context.Users.FirstOrDefaultAsync(u => u.UserId == userId);
        User? user2 = await _context.Users.FirstOrDefaultAsync(u => u.UserId == user2Id);
        if (user1 == null || user2 == null)
          return BadRequest(new { acknowledged = false, error = "Invalid userIds in POST request" });

        string userName = user1.FullName!;
        string user2Name = user2.FullName!;

        var response = new { gameId, id, userName, user2Id, user2Name  };  
        return Ok(response);
      }
    }
    catch (Exception ex)
    {
      Console.WriteLine($"Error in Post Init Received: {ex.Message}");
      return StatusCode(500, new { acknowledged = false, error = ex.Message });
    }
    return StatusCode(500, new { acknowledged = false });
  }

}
