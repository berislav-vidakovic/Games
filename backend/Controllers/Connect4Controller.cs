using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Data;
using Models;
using System.Text.Json;
using Services;

namespace Controllers;

[ApiController]
[Route("api/games/connect4")]
public class Connect4Controller : ControllerBase
{
  private readonly GamesContext _context;

  private readonly WebSocketManager _wsManager;

  private readonly GameManager _gameManager;

  public Connect4Controller(GamesContext context, WebSocketManager wsManager, GameManager gm)
  {
    _context = context;
    _wsManager = wsManager;
    _gameManager = gm;
  }

  // POST /api/games/connect4/init - Request sent from Game browser
  [HttpPost("init")]
  //public async Task<IActionResult> PostInitGame([FromBody] JsonElement body)
  public IActionResult PostInitGame([FromBody] JsonElement body)
  {
    try  // POST request send from Game new browser
    { // Req: {gameId, userId} Resp: {color}
      if (body.TryGetProperty("gameId", out JsonElement game))
      {
        if (!body.TryGetProperty("userId", out JsonElement userIdprop))
          return BadRequest(new
          {
            acknowledged = false,
            error = "Missing keys gameId and/or userId in POST request"
          });

        string gameId = game.ToString()!;
        if (!_gameManager.IsGameInitialized(gameId))
          return BadRequest(new { acknowledged = false, error = "Invalid gameId in POST request" });

        // Get Color for userId, gameId
        GameConnect4? gamec4 = (GameConnect4?)_gameManager.GetGame(gameId);
        if (gamec4 == null)
          return BadRequest(new { acknowledged = false, error = "Invalid Game type in POST request" });

        int userId = userIdprop.GetInt32()!;
        string color = gamec4.GetUserColor(userId);

        var response = new { color };
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

  // POST /api/games/connect4/swapcolors - Request sent from Game browser
  [HttpPost("swapcolors")]
  //public async Task<IActionResult> PostSwapColors([FromBody] JsonElement body)
  public IActionResult PostSwapColors([FromBody] JsonElement body)
  {
    try  // POST request send from Game new browser
    { // Req: {gameId, userId} Resp: {color}
      if (body.TryGetProperty("gameId", out JsonElement game))
      {
        if (!body.TryGetProperty("userId", out JsonElement userIdprop))
          return BadRequest(new
          {
            acknowledged = false,
            error = "Missing keys gameId and/or userId in POST request"
          });

        string gameId = game.ToString()!;
        if (!_gameManager.IsGameInitialized(gameId))
          return BadRequest(new { acknowledged = false, error = "Invalid gameId in POST request" });

        // Get Color for userId, gameId
        GameConnect4? gameC4 = (GameConnect4?)_gameManager.GetGame(gameId);
        if (gameC4 == null)
          return BadRequest(new { acknowledged = false, error = "Invalid Game type in POST request" });

        int userId = userIdprop.GetInt32()!;
        gameC4.SwapColors();
        string color1 = gameC4.GetUserColor(userId);
        string color2 = gameC4.GetPartnerColor(userId)!;

        var response = new { color = color1 };

        var wsMsg = new { type = "swapColors", status = "WsStatus.OK", data = new { color = color2 } };
        Guid id2 = gameC4.GetPartnerGuid(userId);

        _wsManager.SendMessageByGuid(id2, wsMsg);

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
  
    // POST /api/games/connect4/start - Request sent from Game browser
  [HttpPost("start")]
  //public async Task<IActionResult> PostSwapColors([FromBody] JsonElement body)
  public IActionResult PostStartGame([FromBody] JsonElement body)
  {
    try  // POST request send from Game new browser
    { // Req: {gameId, userId} Resp: { move: userId}
      if (body.TryGetProperty("gameId", out JsonElement game))
      { 
        if (!body.TryGetProperty("userId", out JsonElement userIdprop) )
          return BadRequest(new { acknowledged = false,
            error = "Missing keys gameId and/or userId in POST request" });

        string gameId = game.ToString()!;
        if (!_gameManager.IsGameInitialized(gameId))
          return BadRequest(new { acknowledged = false, error = "Invalid gameId in POST request" });

        // Get Color for userId, gameId
        GameConnect4? gameC4 = (GameConnect4?)_gameManager.GetGame(gameId);
        if (gameC4 == null)
          return BadRequest(new { acknowledged = false, error = "Invalid Game type in POST request" });

        int userId = userIdprop.GetInt32()!; // Sender = POST response detination
        Guid id2 = gameC4.GetPartnerGuid(userId); // Partner = WS destination

        // user with Move is Red user
        if (gameC4.GetUserColor(userId) != "Red")
          userId = gameC4.GetPartner(userId);
        
        var response = new { userId };   

        var wsMsg = new { type = "startGame", status = "WsStatus.OK", data = response };       
        _wsManager.SendMessageByGuid(id2, wsMsg);

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
