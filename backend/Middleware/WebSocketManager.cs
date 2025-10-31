
using System.Collections.Concurrent;
using System.Net.WebSockets;
using System.Text;
using System.Text.Json;

public class WebSocketManager
{
  public WebSocketManager()
  {
    _wsConnections = new();
    _onlineUsers = new();
  }
  private readonly ConcurrentDictionary<Guid, WebSocket> _wsConnections;

  public IEnumerable<WebSocket> GetAllSockets() => _wsConnections.Values;

  private readonly ConcurrentDictionary<Guid, int> _onlineUsers;

  public void UpdateOnlineUsers(Guid clientId, int userId, bool online)
  {
    if (online)
      _onlineUsers[clientId] = userId;
    else
      _onlineUsers.TryRemove(clientId, out _);
  }

  public void AddSocket(Guid id, WebSocket ws) => _wsConnections[id] = ws;

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
      _wsConnections.TryRemove(item.Key, out _);
    }
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
      string jsonR = JsonSerializer.Serialize(message, options);
      byte[] bytes = Encoding.UTF8.GetBytes(jsonR);
      ArraySegment<byte> buffer = new ArraySegment<byte>(bytes);
      ws.SendAsync(buffer, WebSocketMessageType.Text, true, CancellationToken.None);
    }
  }

  public void SendMessage(int userId, object message)
  {
    // ConcurrentDictionary<Guid, WebSocket> _wsConnections;
    // ConcurrentDictionary<Guid, int> _onlineUsers;
    var options = new JsonSerializerOptions
    {
      PropertyNamingPolicy = JsonNamingPolicy.CamelCase
    };
    foreach( var kvp in _onlineUsers ) //<Guid, int> _onlineUsers
      if( kvp.Value == userId)
      {
        WebSocket ws = _wsConnections[kvp.Key]; //<Guid, WebSocket> _wsConnections
        string jsonR = JsonSerializer.Serialize(message, options);
        byte[] bytes = Encoding.UTF8.GetBytes(jsonR);
        ArraySegment<byte> buffer = new ArraySegment<byte>(bytes);
        ws.SendAsync(buffer, WebSocketMessageType.Text, true, CancellationToken.None);
      }
  }
}
