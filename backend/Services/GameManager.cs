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
  public bool AddGame(int userId1, int userId2)
  {
    //Guid id = Guid.NewGuid();
    var key = userId1 < userId2 ? $"{userId1};{userId2}"
                : $"{userId2};{userId1}";
    Console.WriteLine("Adding game: " + key);

    return _games.TryAdd(key, new Game(userId1, userId2));
  }

  public void RemoveGame(int userId1, int userId2)
  {
    var key = userId1 < userId2 ? $"{userId1};{userId2}"
                : $"{userId2};{userId1}";
    _games.TryRemove(key, out _);
    //var game = _games.GetValueOrDefault(game.Id);
  }

  public void InitGame(int userId1, int userId2)
  {
    
  }
}