namespace Services;
using System.Collections.Concurrent;
using System.Net.WebSockets;
using System.Text;
using System.Timers;


public class GameManager
{
  private ConcurrentDictionary<string, Game> _games;
  private readonly WebSocketManager _wsManager;
  private readonly IServiceScopeFactory _scopeFactory;
  protected int _idleTimeoutSec;
  protected int _checkIntervalMin;
  private Timer? _activityMonitor;

  public GameManager(WebSocketManager wsManager,
    IServiceScopeFactory scopeFactory, IConfiguration config)
  {
    _wsManager = wsManager;
    _games = new();

    _scopeFactory = scopeFactory;
    _activityMonitor = null;

    string keyIdleTimeout = "GameMonitor:IdleTimeoutSec"; // TODO: Add to appsettings.json
    string keyCheckInterval = "GameMonitor:CheckIntervalMin";

    if (config.GetSection(keyIdleTimeout).Exists())
      _idleTimeoutSec = int.Parse(config[keyIdleTimeout]!);

    if (config.GetSection(keyCheckInterval).Exists())
      _checkIntervalMin = int.Parse(config[keyCheckInterval]!);

    Console.WriteLine($"Timer settings: {_idleTimeoutSec}s, {_checkIntervalMin}min");
  }



  public string GetGameID(int userId1, int userId2 )
  {
    string gameId = userId1 < userId2 ? $"{userId1};{userId2}" : $"{userId2};{userId1}";
    Game? game = GetGame(gameId);
    if (game != null)
      game.SetTimeStamp();

    return gameId;
  }
  public bool AddGame(int userId1, int userId2, string game)
  {
    //Guid id = Guid.NewGuid();
    string key = GetGameID(userId1, userId2);
    Console.WriteLine($"Adding game: {key} {game}");
    TimerStart();

    if (game == "Connect Four")
      return _games.TryAdd(key, new GameConnect4(userId1, userId2, game));
    
    return _games.TryAdd(key, new Game(userId1, userId2, game));
  }

  public void RemoveGame(int userId1, int userId2)
  {
    string key = GetGameID(userId1, userId2);
    _games.TryRemove(key, out _);
    if (_games.IsEmpty)
      TimerStop();
  }



  public int GetPartnerId(string gameId, int userId)
  {
    Game game = _games.GetValueOrDefault(gameId)!;
    game.SetTimeStamp();
    return game.GetPartner(userId);
  }

  public void InitGame(int userId1, int userId2)
  {
    string gameId = GetGameID(userId1, userId2);
    Game game = _games.GetValueOrDefault(gameId)!;
    game.SetGameHandshake();
    game.SetTimeStamp();
  }
  public bool IsGameInitialized(string gameId)
  {
    Game? game = _games.GetValueOrDefault(gameId);
    if (game == null)
      return false;
    else
      game.SetTimeStamp();
    
    return game.GetGameHandshake();
  }

  public bool SetUserGuid(string gameId, int userId, Guid id)
  {
    Game? game = _games.GetValueOrDefault(gameId);
    if (game == null)
      return false;
    else
      game.SetTimeStamp();
    return game.SetUserGuid(userId, id);
  }

  public Guid GetUserGuid(string gameId, int userId)
  {
    Game? game = _games.GetValueOrDefault(gameId);
    if (game == null)
      return Guid.Empty;

    game.SetTimeStamp();
    return game.GetUserGuid(userId);
  }

  public Guid GetPartnerGuid(string gameId, int userId)
  {
    Game? game = _games.GetValueOrDefault(gameId);
    if (game == null)
      return Guid.Empty;
    game.SetTimeStamp();
    return game.GetPartnerGuid(userId);
  }

  public Game? GetGame(string gameId)
  {
    Game? game = _games.GetValueOrDefault(gameId);
    if (game != null)
      game.SetTimeStamp();
    return game;
  }

  // Timer implementation ------------------------------------------
  public void TimerStart()
  {
    _activityMonitor = new System.Timers.Timer(_checkIntervalMin * 60 * 1000);
    _activityMonitor.AutoReset = true;
    _activityMonitor.Elapsed += CleanupIdleGames;
    _activityMonitor.Start();
    Console.WriteLine($"*** TIMER started ************");

  }

  public void TimerStop()
  {
    Console.WriteLine($"*** TIMER stopping .....  ************");
    
    if ( _activityMonitor != null )
      return;
    _activityMonitor!.Stop();
    _activityMonitor!.Dispose();
    Console.WriteLine($"*** ... TIMER stopped ************");

  }



  public void RemoveGameByIds(Guid id1, Guid id2)
  {
    foreach (var kvp in _games)
    {
      Game game = kvp.Value;
      Guid guid1 = game.GetUser1Guid();
      Guid guid2 = game.GetUser2Guid();
      if ((guid1 == id1 && guid2 == id2) || (guid1 == id2 && guid2 == id1))
      {
        _games.TryRemove(kvp.Key, out _);
        return;
      }
    }
  }
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

  private async void CleanupIdleGames(object? sender, ElapsedEventArgs e)
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
    
  }
}