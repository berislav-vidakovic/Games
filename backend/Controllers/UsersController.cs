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
    
  public UsersController(GamesContext context)
  {
    _context = context;
  }

  // GET: /api/users/all
  [HttpGet("all")]
  [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(IEnumerable<User>))]
  public async Task<ActionResult<IEnumerable<User>>> GetUsers()
  {
    var users = await _context.Users.ToListAsync();
    return Ok( users );
  }

  // POST /api/users/register
  [HttpPost("register")]
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

        //_clientManager.BroadcastWsMessage(wsBroadcastMsg);

        return Ok(response); 
      }
      
    }
    catch (Exception ex)
    {
      Console.WriteLine($"Error in PostUsersReceived: {ex.Message}");
      return StatusCode(500, new { acknowledged = false, error = ex.Message });
    }
    return StatusCode(500, new { acknowledged = false });
  }
}
