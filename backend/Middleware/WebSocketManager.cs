
using System.Collections.Concurrent;
using System.Net.WebSockets;
using System.Runtime.CompilerServices;
using System.Text;
using System.Text.Json;
using Services;

public class WebSocketManager : TimerManager
{
  public WebSocketManager(IConfiguration config, string key) : base(config, key)
  {
    _wsConnections = new();
    _onlineUsers = new();

    Console.WriteLine($"Ws Timer settings: {_idleTimeoutSec}s, {_checkIntervalMin}min");

  }
  private readonly ConcurrentDictionary<Guid, WebSocket> _wsConnections;

  public WebSocket? GetSocketByGuid(Guid id)
  {
    _wsConnections.TryGetValue(id, out var socket);
    return socket;
  }

  public IEnumerable<WebSocket> GetAllSockets() => _wsConnections.Values;


  private readonly ConcurrentDictionary<Guid, int> _onlineUsers;

  public void UpdateOnlineUsers(Guid clientId, int userId, bool online)
  {
    if (online)
      _onlineUsers[clientId] = userId;
    else
      _onlineUsers.TryRemove(clientId, out _);
  }

  public void AddSocket(Guid id, WebSocket ws)
  {
    _wsConnections[id] = ws;
    Console.WriteLine($"Added WS: {RuntimeHelpers.GetHashCode(ws)}, WS(s): {_wsConnections.Count}");
  }

  public void RemoveSocketByClientId(Guid clientId)
  {
    _wsConnections.TryRemove(clientId, out _);
  }
  
  public void RemoveSocket(WebSocket ws)
  {
    // Find the first entry with this WebSocket instance
    var item = _wsConnections.FirstOrDefault(pair => pair.Value == ws);
    if (!item.Equals(default(KeyValuePair<Guid, WebSocket>)))
    {
      RemoveSocketByClientId(item.Key);
      Console.WriteLine($"Removed WS: {RuntimeHelpers.GetHashCode(ws)}, WS(s): {_wsConnections.Count}");
    }
    else
      Console.WriteLine($"WS to remove not found: {RuntimeHelpers.GetHashCode(ws)}, WS(s): {_wsConnections.Count}");
  }

  public void BroadcastMessage(object message)
  {
    IEnumerable<WebSocket> wsConns = GetAllSockets();
    var options = new JsonSerializerOptions
    {
      PropertyNamingPolicy = JsonNamingPolicy.CamelCase
    };
    foreach (WebSocket ws in wsConns)
    {
      SendMessageAsync(ws, message);
    }
  }

  public void SendMessage(int userId, object message)
  {
    // ConcurrentDictionary<Guid, WebSocket> _wsConnections;
    // ConcurrentDictionary<Guid, int> _onlineUsers;
    foreach (var kvp in _onlineUsers) //<Guid, int> _onlineUsers
      if (kvp.Value == userId)
        SendMessageByGuid(kvp.Key, message);
  }

  public void SendMessageByGuid(Guid id, object message)
  {
    var options = new JsonSerializerOptions
    {
      PropertyNamingPolicy = JsonNamingPolicy.CamelCase
    };
    WebSocket ws = _wsConnections[id]; //<Guid, WebSocket> _wsConnections
    SendMessageAsync(ws, message);
  }

  public void SendMessageAsync(WebSocket webSocket, object message)
  {
    //Console.WriteLine("Sending WS.................................");
    SetTimeStamp(webSocket);
    var options = new JsonSerializerOptions
    {
      PropertyNamingPolicy = JsonNamingPolicy.CamelCase
    };
    string json = JsonSerializer.Serialize(message, options);
    byte[] bytes = Encoding.UTF8.GetBytes(json);
    ArraySegment<byte> buffer = new ArraySegment<byte>(bytes);
    webSocket.SendAsync(buffer, WebSocketMessageType.Text, true, CancellationToken.None);
  }

  public void SetTimeStamp(WebSocket ws)
  {
    Console.WriteLine($"===Added Timestamp WS: {RuntimeHelpers.GetHashCode(ws)}===");
  }

/*
  private bool IsIdleTimeout(Game game)
  {
    return game.GetIdleTimeSec() > _idleTimeoutSec;
  }
  private async Task CloseWebSockets(Guid[] ids)
  {
    foreach (var id in ids)
    {
      WebSocket? ws = _wsManager.GetSocketByGuid(id);
      if (ws == null)
        return;
      if (ws.State == WebSocketState.Open || ws.State == WebSocketState.CloseReceived)
        await ws.CloseAsync(
          WebSocketCloseStatus.NormalClosure, "Idle timeout", CancellationToken.None);

      // TODO: Remove Socket object from dict

      ws.Dispose();
    }
  }
  private void RemoveWebSockets(Guid[] ids)
  {
    foreach (var id in ids)
      _wsManager.RemoveSocketByClientId(id);
  }
  protected override async void CleanupIdleItems(object? sender, ElapsedEventArgs e)
  {
    Console.WriteLine($"*** START-CleanupIdleGames, game(s): {_games.Count}, WS(s): {_wsManager.GetAllSockets().Count()} *** ");
    foreach (var kvp in _games)
    {
      Game game = kvp.Value;
      if (IsIdleTimeout(game))
      {
        Guid id1 = game.GetUser1Guid();
        Guid id2 = game.GetUser2Guid();
        await CloseWebSockets([id1, id2]);
        RemoveWebSockets([id1, id2]);
        RemoveGameByIds(id1, id2);
      }
    }
    Console.WriteLine($"*** END-CleanupIdleGames, game(s): {_games.Count}, WS(s): {_wsManager.GetAllSockets().Count()} *** ");
  } */
}
