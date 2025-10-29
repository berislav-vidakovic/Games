using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Data;
using Models;
using System.Text.Json;

namespace Controllers;

[ApiController]
[Route("api/[controller]")]
public class UsersController : ControllerBase
{
  private readonly GamesContext _context;

  private readonly WebSocketManager _wsManager;

  public UsersController(GamesContext context, WebSocketManager wsManager)
  {
    _context = context;
    _wsManager = wsManager;
  }

  // GET: /api/users/all
  [HttpGet("all")]
  [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(IEnumerable<User>))]
  public async Task<ActionResult<IEnumerable<User>>> GetUsers()
  {
    var users = await _context.Users.ToListAsync();
    Guid id = Guid.NewGuid();
    var response = new { id, users };
    return Ok( response );
  }

  // POST /api/users/new
  [HttpPost("new")]
  public async Task<IActionResult> PostUsersReceived([FromBody] JsonElement body)
  {
    try
    {
      if (body.TryGetProperty("register", out JsonElement credentials))
      { // {"register":{"login":"penny","fullname":"Penny"}}
        string? login = credentials.GetProperty("login").GetString();
        string? fullname = credentials.GetProperty("fullname").GetString();

        if (string.IsNullOrWhiteSpace(login) || string.IsNullOrWhiteSpace(fullname))
          return BadRequest(new { acknowledged = false, error = "Missing login or fullname" });
        Console.WriteLine($"Register request: login={login}, fullname={fullname}");

        bool exists = await _context.Users // Check if user already exists
            .AnyAsync(u => u.Login == login || u.FullName == fullname);
        if (exists)
          return Conflict(new { acknowledged = false, error = "User already exists" });

        var newUser = new User // Create and insert new user
        {
          Login = login,
          FullName = fullname
        };
        _context.Users.Add(newUser);  // marks entity as "Added"
        await _context.SaveChangesAsync(); // INSERT new user INTO db table
        Console.WriteLine($"New user inserted: {login}");

        var response = new { acknowledged = true, user = newUser };

        var wsBroadcastMsg = new { type = "userRegister", status = "WsStatus.OK", data = response };

        _wsManager.BroadcastMessage(wsBroadcastMsg);

        return StatusCode(StatusCodes.Status201Created, response);
      }
    }
    catch (Exception ex)
    {
      Console.WriteLine($"Error in PostUsersReceived: {ex.Message}");
      return StatusCode(500, new { acknowledged = false, error = ex.Message });
    }
    return StatusCode(500, new { acknowledged = false });
  }

  // POST /api/users/login
  [HttpPost("login")]
  public async Task<IActionResult> PostUserLogin([FromBody] JsonElement body)
  {
    try
    {
      string clientId = Request.Query["id"].ToString();
      if (!Guid.TryParse(clientId, out Guid parsedClientId))
        return StatusCode(StatusCodes.Status400BadRequest,
          new { acknowledged = false, error = "Missing ID" });

      Console.WriteLine("Received POST /api/users/login with valid ID");

      //{ userId: userId }
      if (!body.TryGetProperty("userId", out var loginProp))
        return BadRequest(new { acknowledged = false, error = "Missing 'userId' field" });

      int userId = loginProp.GetInt32()!;

      // Find user by userId and update online status=true
      var user = await _context.Users.FirstOrDefaultAsync(u => u.UserId == userId);
      if (user == null)
        return StatusCode(StatusCodes.Status204NoContent,
          new { acknowledged = false, error = "UserID Not found" });
      // Update online status
      user!.IsOnline = true;
      await _context.SaveChangesAsync();

      var response = new { userId, isOnline = true };
      var msg = new { type = "userSessionUpdate", status = "WsStatus.OK", data = response };
      _wsManager.BroadcastMessage(msg);

      return StatusCode(StatusCodes.Status200OK, response);
    }
    catch (Exception ex)
    {
      Console.WriteLine($"Error in Post Login User Received: {ex.Message}");
      return StatusCode(500, new { acknowledged = false, error = ex.Message });
    }
  }

  // POST /api/users/logout
  [HttpPost("logout")]
  public async Task<IActionResult> PostUserLogout([FromBody] JsonElement body)
  {
    try
    {
      string clientId = Request.Query["id"].ToString();
      if (!Guid.TryParse(clientId, out Guid parsedClientId))
        return StatusCode(StatusCodes.Status400BadRequest,
          new { acknowledged = false, error = "Missing ID" });

      Console.WriteLine("Received POST /api/users/logout with valid ID");

      //{ userId: userId }
      if (!body.TryGetProperty("userId", out var loginProp))
        return BadRequest(new { acknowledged = false, error = "Missing 'userId' field" });

      int userId = loginProp.GetInt32()!;

      // Find user by userId and update online status=true
      var user = await _context.Users.FirstOrDefaultAsync(u => u.UserId == userId);
      if (user == null)
        return StatusCode(StatusCodes.Status204NoContent,
          new { acknowledged = false, error = "UserID Not found" });
      // Update online status
      user!.IsOnline = false;
      await _context.SaveChangesAsync();

      var response = new { userId, isOnline = false };
      var msg = new { type = "userSessionUpdate", status = "WsStatus.OK", data = response };
      _wsManager.BroadcastMessage(msg);

      return StatusCode(StatusCodes.Status200OK, response);
    }
    catch (Exception ex)
    {
      Console.WriteLine($"Error in Post Login User Received: {ex.Message}");
      return StatusCode(500, new { acknowledged = false, error = ex.Message });
    }
  }
}
