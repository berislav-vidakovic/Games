
using System.Collections.Concurrent;
using System.Net.WebSockets;
using System.Runtime.CompilerServices;
using System.Text;
using System.Text.Json;
using System.Timers;
using Services;

public class WebSocketMonitor 
{
  public WebSocket WebSocket { get; set; }
  public DateTime LastActive { get; set; }

  public WebSocketMonitor(WebSocket ws)
  {
    WebSocket = ws;
    LastActive = DateTime.Now;
  }
}
public class WebSocketManager : TimerManager
{
  public WebSocketManager(IConfiguration config, string key) : base(config, key)
  {
    _wsConnections = new();
    _onlineUsers = new();

    Console.WriteLine($"Ws Timer settings: {_idleTimeoutSec}s, {_checkIntervalMin}min");

  }
  private readonly ConcurrentDictionary<Guid, WebSocketMonitor> _wsConnections;
  private readonly ConcurrentDictionary<Guid, int> _onlineUsers;


  public WebSocket? GetSocketByGuid(Guid id)
  {
    if (_wsConnections.TryGetValue(id, out var socket))
      return socket.WebSocket;
    return null;
  }

  public IEnumerable<WebSocket> GetAllSockets()
  {
    return _wsConnections.Values.Select(monitor => monitor.WebSocket);
  }



  public void UpdateOnlineUsers(Guid clientId, int userId, bool online)
  {
    if (online)
      _onlineUsers[clientId] = userId;
    else
      _onlineUsers.TryRemove(clientId, out _);
  }

  public void AddSocket(Guid id, WebSocket ws)
  {
    _wsConnections[id] = new WebSocketMonitor(ws);
    if(_wsConnections.Count == 1)
      TimerStart();
    Console.WriteLine($"Added WS: {RuntimeHelpers.GetHashCode(ws)}, WS(s): {_wsConnections.Count}");
  }

  private void RemoveSocketByClientId(Guid clientId)
  {
    _wsConnections.TryRemove(clientId, out _);
    if (_wsConnections.IsEmpty)
      TimerStop();
  }

  public void RemoveSocket(WebSocket ws)
  {
    // Find the first entry with this WebSocket instance
    var item = _wsConnections.FirstOrDefault(pair => pair.Value.WebSocket == ws);
    if (!item.Equals(default(KeyValuePair<Guid, WebSocketMonitor>)))
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
    foreach (WebSocket ws in wsConns)
    {
      SendMessageAsync(ws, message);
    }
  }

  public void SendMessage(int userId, object message)
  {
    foreach (var kvp in _onlineUsers) //<Guid, int> _onlineUsers
      if (kvp.Value == userId)
        SendMessageByGuid(kvp.Key, message);
  }

  public void SendMessageByGuid(Guid id, object message)
  {
    Console.WriteLine($"Sending WS to ID: {id} (_wsConnections size: {_wsConnections.Count})");
    var wsm = _wsConnections.TryGetValue(id, out var m) ? m : null;
    if (wsm != null)
      SendMessageAsync(wsm.WebSocket, message);
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
    var item = _wsConnections.FirstOrDefault(pair => pair.Value.WebSocket == ws);
    if (!item.Equals(default(KeyValuePair<Guid, WebSocketMonitor>)))
    {
      item.Value.LastActive = DateTime.Now;
    }
  }
  
  private bool IsIdleTimeout(WebSocketMonitor wsm)
  {
    return (long)(DateTime.Now - wsm.LastActive).TotalSeconds > _idleTimeoutSec;
  }
    
  private async Task CloseWebSocket(Guid id)
  {
    WebSocket? ws = GetSocketByGuid(id);
    if (ws == null)
      return;
    if (ws.State == WebSocketState.Open || ws.State == WebSocketState.CloseReceived)
      await ws.CloseAsync(
        WebSocketCloseStatus.NormalClosure, "Idle timeout", CancellationToken.None);

    ws.Dispose();
  }
  
  protected override async void CleanupIdleItems(object? sender, ElapsedEventArgs e)
  {
    Console.WriteLine($"*** START-CleanupIdleWS, WS(s): {GetAllSockets().Count()} *** ");
    foreach (var kvp in _wsConnections)
    {
      WebSocketMonitor wsm = kvp.Value;
      if (IsIdleTimeout(wsm))
      {
        await CloseWebSocket(kvp.Key);
        RemoveSocketByClientId(kvp.Key);
        Console.WriteLine($"--- Closed idle WS: {RuntimeHelpers.GetHashCode(wsm.WebSocket)} ---");
      }
    }
    Console.WriteLine($"*** END-CleanupIdleWS, WS(s): {GetAllSockets().Count()} *** ");
  } 
}
