
using System.Collections.Concurrent;
using System.Net.WebSockets;
using System.Text;
using System.Text.Json;

public class WebSocketManager
{
  public WebSocketManager()
  {
    _wsConnections = new();
  }
  private readonly ConcurrentDictionary<Guid, WebSocket> _wsConnections;

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

  public IEnumerable<WebSocket> GetAllSockets() => _wsConnections.Values;

  public void BroadcastMessage( object message )
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
}
