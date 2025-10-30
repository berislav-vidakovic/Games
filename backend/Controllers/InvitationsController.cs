using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Data;
using Models;
using System.Text.Json;

namespace Controllers;

public class InvitationResult
{
  public IActionResult? Result { get; set; }
  public int? CallerId { get; set; }
  public int? CalleeId { get; set; }
}


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


  public async Task<InvitationResult> HandleInvitationMsg([FromBody] JsonElement body,
    string invitation)
  {
    InvitationResult res = new();
    try
    {
      string clientId = Request.Query["id"].ToString();
      if (!Guid.TryParse(clientId, out Guid parsedClientId))
      {
        res.Result = BadRequest(new { acknowledged = false, error = "Missing ID" });
        return res;
      }

      Console.WriteLine("Received POST /api/invitations/invite with valid ID");

      //{ callerId, calleeId }
      if (!body.TryGetProperty("callerId", out var callerIdprop) ||
          !body.TryGetProperty("calleeId", out var calleeIdprop))
      {
        res.Result = BadRequest(new { acknowledged = false, error = "No both callerId, calleeId specified" });
        return res;        
      }
      int callerId = callerIdprop.GetInt32()!;
      int calleeId = calleeIdprop.GetInt32()!;
      var caller = await _context.Users.FirstOrDefaultAsync(u => u.UserId == callerId);
      var callee = await _context.Users.FirstOrDefaultAsync(u => u.UserId == calleeId);
      if (caller == null || !caller.IsOnline || callee == null || !callee.IsOnline)
      {
        res.Result = StatusCode(StatusCodes.Status204NoContent,
          new { acknowledged = false, error = "Caller/Callee ID Not found or Not online" });
        return res;
      }

      var response = new { invitation, callerId, calleeId };
      var msg = new { type = "invitation", status = "WsStatus.OK", data = response };

      if (invitation == "send" || invitation == "cancel")
        _wsManager.SendMessage(calleeId, msg);
      else if( invitation == "accept" || invitation == "reject")
        _wsManager.SendMessage(callerId, msg);

      res.Result = StatusCode(StatusCodes.Status200OK, response);
      res.CalleeId = calleeId;
      res.CallerId = callerId;
      return res;
    }
    catch (Exception ex)
    {
      Console.WriteLine($"Error in Post Invite Received: {ex.Message}");
      res.Result = StatusCode(500, new { acknowledged = false, error = ex.Message });
      return res;
    }
  }

  // POST /api/invitations/invite
  [HttpPost("invite")]
  public async Task<IActionResult> PostInvitationSend([FromBody] JsonElement body)
  {
    var res = await HandleInvitationMsg(body, "send" );
    if (res.Result is OkObjectResult)
    {
      Console.WriteLine($"Invitation from {res.CallerId} to {res.CalleeId}");
    }
    return res.Result!;
  }

  // POST /api/invitations/cancel
  [HttpPost("cancel")]
  public async Task<IActionResult> PostInvitationCancel([FromBody] JsonElement body)
  {
    var res = await HandleInvitationMsg(body, "cancel");
    if (res.Result is OkObjectResult)
    {
      Console.WriteLine($"Invitation from {res.CallerId} to {res.CalleeId}");
    }
    return res.Result!;
  }

  // POST /api/invitations/accept
  [HttpPost("accept")]
  public async Task<IActionResult> PostInvitationAccept([FromBody] JsonElement body)
  {
    var res = await HandleInvitationMsg(body, "accept");
    if (res.Result is OkObjectResult)
    {
      Console.WriteLine($"Invitation from {res.CallerId} to {res.CalleeId}");
    }
    return res.Result!;
  }
  
  // POST /api/invitations/reject
  [HttpPost("reject")]
  public async Task<IActionResult> PostInvitationReject([FromBody] JsonElement body)
  {
    var res = await HandleInvitationMsg(body, "reject");

    if (res.Result is OkObjectResult)
    {
      Console.WriteLine($"Invitation from {res.CallerId} to {res.CalleeId}");
    }
    return res.Result!;  }
}
