// WebSocketMiddleware.cs
using System.Collections.Concurrent;
using System.Net.WebSockets;
using System.Text;
using System.Text.Json;
using Microsoft.VisualBasic;
using Models;
using Services;

namespace Middleware;

public class WebSocketMiddleware // Singleton 
{
  private readonly RequestDelegate _next;

  private readonly WebSocketManager _wsManager;

  private readonly GameManager _gameManager;

  public WebSocketMiddleware(RequestDelegate next, WebSocketManager wsManager, GameManager gm)
  {
    _next = next;
    _wsManager = wsManager;
    _gameManager = gm;
  }

  public void AddSocket(Guid clientId, WebSocket ws)
  {
    _wsManager.AddSocket(clientId, ws);
    _wsManager.SetTimeStamp(ws);
  }
  
  private async Task CloseAndRemoveWsConnection(WebSocket ws, string msg)
  {
    Console.WriteLine("Terminating WS connection..." + msg);
    await ws.CloseAsync(WebSocketCloseStatus.NormalClosure, msg, CancellationToken.None);
    //RemoveSocket(ws);
    _wsManager.RemoveSocket(ws);
    ws.Dispose();
  }

  public async Task InvokeAsync(HttpContext context)
  {
    if (context.Request.Path.StartsWithSegments("/websocket"))
    {
      if (!context.WebSockets.IsWebSocketRequest)
      {
        context.Response.StatusCode = 400; // Bad Request
        await context.Response.WriteAsync("WebSocket connections only.");
        return;
      }
      // obtain client ID 
      var clientId = context.Request.Query["id"].ToString();
      using WebSocket webSocket = await context.WebSockets.AcceptWebSocketAsync();
      Console.WriteLine("WS established");
      if (!Guid.TryParse(clientId, out Guid parsedClientId))
      {
        await CloseAndRemoveWsConnection(webSocket, "Invalid client ID");
        return;
      }
      Console.WriteLine($"WS established - ID = {clientId}");

      AddSocket(parsedClientId, webSocket);

      // Buffer for receiving data
      var buffer = new byte[4096]; // 4KB buffer size

      while (webSocket.State == WebSocketState.Open) // Wait for a message from the client
      {
        try
        {
          ArraySegment<byte> msgContent = new ArraySegment<byte>(buffer);
          WebSocketReceiveResult msgMetaData = await webSocket.ReceiveAsync(msgContent, CancellationToken.None);

          if (msgMetaData.MessageType == WebSocketMessageType.Close) // Closing WS connection
          {
            Console.WriteLine($"WebSocket connection CLOSED ");
            await CloseAndRemoveWsConnection(webSocket, "WS connection closed");

          }

          if (msgMetaData.MessageType == WebSocketMessageType.Text)
          {
            string message = Encoding.UTF8.GetString(buffer, 0, msgMetaData.Count);
            _ = HandleMessageAsync(message, webSocket);
          }
        }
        catch (Exception ex)
        {
          //Console.WriteLine($"Exception type: {ex.GetType().FullName}");
          if (webSocket.State == WebSocketState.Closed)
            Console.WriteLine("WebSocket closed due to idle timeout cleanup");
          else if (webSocket.State == WebSocketState.Open || webSocket.State == WebSocketState.CloseReceived)
          {
            await webSocket.CloseAsync(WebSocketCloseStatus.InternalServerError, "Internal server error", CancellationToken.None);
          }
          else
            Console.WriteLine($"WS-Error: {ex.Message} Exception type: {ex.GetType().FullName}");
          break;
        }
      }// while (webSocket.State == WebSocketState.Open)
    }
    else
    {
      // Not a WebSocket request, continue to the next middleware
      await _next(context);
    }
  }

  private async Task HandleMessageAsync(string message, WebSocket webSocket)
  {
    try
    {
      _wsManager.SetTimeStamp(webSocket);
      JsonDocument json = JsonDocument.Parse(message);
      //const msg = { type: "healthCheck", status: "WsStatus.Request", data: { id, content: "ping" } };
      string? id = json.RootElement.GetProperty("data").GetProperty("id").GetString();
      string? type = json.RootElement.GetProperty("type").GetString();
      Console.WriteLine($"Received WS message type={type}");
      json.RootElement.TryGetProperty("data", out JsonElement data);

      if (type == "healthCheck")
      {
        Console.WriteLine("---------WS message -healthCheck- received-----------");
        var response = new { type = "health", status = "WsStatus.OK", data = new { response = "pong" } };
        _wsManager.SendMessageAsync(webSocket, response);
      }
      else
      {
        Console.WriteLine($"Unknown message type: {type}");
      }
    }
    catch (Exception ex)
    {
      Console.WriteLine($"Message handling error: {ex.Message}");
      if (webSocket.State == WebSocketState.Open || webSocket.State == WebSocketState.CloseReceived)
      {
        await webSocket.CloseAsync(WebSocketCloseStatus.InvalidPayloadData, "Invalid message format", CancellationToken.None);
      }
    }
  }
}