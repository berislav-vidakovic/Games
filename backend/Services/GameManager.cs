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
    var key = GetGameID(userId1, userId2);
    Console.WriteLine($"Adding game: {key} {game}" );

    return _games.TryAdd(key, new Game(userId1, userId2, game));
  }

  public void RemoveGame(int userId1, int userId2)
  {
    var key = GetGameID(userId1, userId2);
    _games.TryRemove(key, out _);
    //var game = _games.GetValueOrDefault(game.Id);
  }

  public void InitGame(int userId1, int userId2)
  {
    
  }
}