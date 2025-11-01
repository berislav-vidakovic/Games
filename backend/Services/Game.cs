namespace Services;

public class Game
{
  protected int _userId1;
  protected int _userId2;

  protected Guid _user1Guid;
  protected Guid _user2Guid;
  readonly string _game;
  protected bool _gameHandshakeDone;

  private readonly object _lockBase = new();

  public Game( int user1, int user2, string game)
  {
    _userId1 = user1;
    _userId2 = user2;
    _game = game;
    _gameHandshakeDone = false;
    _user1Guid = Guid.Empty;
    _user2Guid = Guid.Empty;
  }
  public int GetUser1() => _userId1;
  public int GetUser2() => _userId2;

  public int GetPartner(int userId)
  {
    if (userId == _userId1) return _userId2;
    if (userId == _userId2) return _userId1;
    return -1;
  }
  public void SetGameHandshake()
  {
    _gameHandshakeDone = true;
  }
  public bool GetGameHandshake()
  {
    return _gameHandshakeDone;
  }

  public bool SetUserGuid(int userId, Guid id)
  {
    lock( _lockBase )
    {
      if (userId == _userId1)
        _user1Guid = id;
      else if (userId == _userId2)
        _user2Guid = id;
      else
        return false;

      Console.WriteLine($"*** Set Guid={id} for UserId={userId}");
      return true;
    }
  }

  public Guid GetUserGuid(int userId)
  {
    if (userId == _userId1)
      return _user1Guid;

    if (userId == _userId2)
      return _user2Guid;

    return Guid.Empty;
  }
  
  public Guid GetPartnerGuid(int userId)
  {
    if (userId == _userId1)
      return _user2Guid;

    if (userId == _userId2)
      return _user1Guid;

    return Guid.Empty;
  }
}