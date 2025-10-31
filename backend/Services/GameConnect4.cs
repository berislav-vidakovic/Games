namespace Services;

public static class Connect4Results
{
    public const int IN_PROGRESS = 0;
    public const int WIN = 1;
    public const int DRAW = 2;
}

public class GameConnect4 : Game
{
  private string? _color1;
  private string? _color2;

  private readonly object _lockConnect4 = new();

  private string _board;

  private int? _nextMove;



  public GameConnect4(int user1, int user2, string game) : base(user1, user2, game)
  {
    _color1 = null;
    _color2 = null;
    _board = "YRY---------------------YYY---------------";
    _nextMove = null;
  }

  public void SetBoard(string sBoard)
  {
    _board = sBoard;
  }
  public string GetBoard()
  {
    return _board;
  }

  public int EvaluateBoard()
  {
    return Connect4Results.IN_PROGRESS;
  }

  public string GetAnotherColor(string color)
  {
    return color == "Red" ? "Yellow" : "Red";
  }

  public string GetUserColor(int userId)
  {
    lock (_lockConnect4)
    {
      if (userId == _userId1)
      {
        if (_color2 != null)
          _color1 = GetAnotherColor(_color2);
        else
          _color1 = "Red";
        return _color1;
      }
      else // _userId2 
      {
        if (_color1 != null)
          _color2 = GetAnotherColor(_color1);
        else
          _color2 = "Red";
        return _color2;
      }
    }
  }

  public string? GetPartnerColor(int userId)
  {
    return userId == _userId1 ? _color2 : _color1;
  }


  public void SwapColors()
  {
    lock (_lockConnect4)
    {
      (_color1, _color2) = (_color2, _color1);
    }
  }


}