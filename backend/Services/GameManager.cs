namespace Services;
using System.Collections.Concurrent;
using System.Text;

public class GameManager
{
  private ConcurrentDictionary<string, Game> _games;
  public GameManager()
  {
    _games = new();
  }

  

  public string GetGameID(int userId1, int userId2 )
  {
    return userId1 < userId2 
      ? $"{userId1};{userId2}"
      : $"{userId2};{userId1}";
  }
  public bool AddGame(int userId1, int userId2, string game)
  {
    //Guid id = Guid.NewGuid();
    string key = GetGameID(userId1, userId2);
    Console.WriteLine($"Adding game: {key} {game}");

    if (game == "Connect Four")
      return _games.TryAdd(key, new GameConnect4(userId1, userId2, game));
    
    return _games.TryAdd(key, new Game(userId1, userId2, game));
  }

  public void RemoveGame(int userId1, int userId2)
  {
    string key = GetGameID(userId1, userId2);
    _games.TryRemove(key, out _);
    //var game = _games.GetValueOrDefault(game.Id);
  }

  public int GetPartnerId(string gameId, int userId)
  {
    Game game = _games.GetValueOrDefault(gameId)!;
    return game.GetPartner(userId);
  }

  public void InitGame(int userId1, int userId2)
  {
    string gameId = GetGameID(userId1, userId2);
    Game game = _games.GetValueOrDefault(gameId)!;
    game.SetGameHandshake();
  }
  public bool IsGameInitialized(string gameId)
  {
    Game? game = _games.GetValueOrDefault(gameId);
    if (game == null)
      return false;
    return game.GetGameHandshake();
  }

  public bool SetUserGuid(string gameId, int userId, Guid id)
  {
    Game? game = _games.GetValueOrDefault(gameId);
    if (game == null)
      return false;
    return game.SetUserGuid(userId, id);
  }

  public Guid GetUserGuid(string gameId, int userId)
  {
    Game? game = _games.GetValueOrDefault(gameId);
    if (game == null)
      return Guid.Empty;
    return game.GetUserGuid(userId);
  }
  public Game? GetGame(string gameId)
  {
    return _games.GetValueOrDefault(gameId);
  }
}