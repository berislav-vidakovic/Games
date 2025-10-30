using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Data;
using Models;
using System.Text.Json;

namespace Controllers;

[ApiController]
[Route("api/[controller]")]
public class InvitationsController : ControllerBase
{
  private readonly GamesContext _context;

  private readonly WebSocketManager _wsManager;

  public InvitationsController(GamesContext context, WebSocketManager wsManager)
  {
    _context = context;
    _wsManager = wsManager;
  }
 


  public async Task<IActionResult> HandleInvitationMsg([FromBody] JsonElement body, string invitation)
  {
    try
    {
      string clientId = Request.Query["id"].ToString();
      if (!Guid.TryParse(clientId, out Guid parsedClientId))
        return BadRequest(new { acknowledged = false, error = "Missing ID" });

      Console.WriteLine("Received POST /api/invitations/invite with valid ID");

      //{ callerId, calleeId }
      if (!body.TryGetProperty("callerId", out var callerIdprop) ||
          !body.TryGetProperty("calleeId", out var calleeIdprop))
        return BadRequest(new { acknowledged = false, error = "No both callerId, calleeId specified" });

      int callerId = callerIdprop.GetInt32()!;
      int calleeId = calleeIdprop.GetInt32()!;

      var caller = await _context.Users.FirstOrDefaultAsync(u => u.UserId == callerId);
      if (caller == null || !caller.IsOnline)
        return StatusCode(StatusCodes.Status204NoContent,
          new { acknowledged = false, error = "Caller UserID Not found or Not online" });
      var callee = await _context.Users.FirstOrDefaultAsync(u => u.UserId == calleeId);
      if (callee == null || !callee.IsOnline)
        return StatusCode(StatusCodes.Status204NoContent,
          new { acknowledged = false, error = "Callee UserID Not found or Not online" });

      var response = new { invitation, callerId, calleeId };
      var msg = new { type = "invitation", status = "WsStatus.OK", data = response };

      if (invitation == "send" | invitation == "cancel")
        _wsManager.SendMessage(calleeId, msg);
      else if( invitation == "accept" | invitation == "reject")
        _wsManager.SendMessage(callerId, msg);

      return StatusCode(StatusCodes.Status200OK, response);
    }
    catch (Exception ex)
    {
      Console.WriteLine($"Error in Post Invite Received: {ex.Message}");
      return StatusCode(500, new { acknowledged = false, error = ex.Message });
    }
  }

  // POST /api/invitations/invite
  [HttpPost("invite")]
  public async Task<IActionResult> PostInvitationSend([FromBody] JsonElement body)
  {
    return await HandleInvitationMsg(body, "send");
  }

  // POST /api/invitations/cancel
  [HttpPost("cancel")]
  public async Task<IActionResult> PostInvitationCancel([FromBody] JsonElement body)
  {
    return await HandleInvitationMsg(body, "cancel");
  }


  // POST /api/invitations/accept
  [HttpPost("accept")]
  public async Task<IActionResult> PostInvitationAccept([FromBody] JsonElement body)
  {
    return await HandleInvitationMsg(body, "accept");
  }
  
  // POST /api/invitations/reject
  [HttpPost("reject")]
  public async Task<IActionResult> PostInvitationReject([FromBody] JsonElement body)
  {
    return await HandleInvitationMsg(body, "reject");
  }
}
