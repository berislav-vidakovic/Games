using System.Text;
using System.Text.RegularExpressions;
using MySqlConnector;

namespace Services;

public static class Connect4Results
{
    public const int INVALID = -1;
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
  private const int ROWS = 6;
  private const int COLUMNS = 7;
  private const int WIN = 4;
  private const char RED = 'R';
  private const char YELLOW = 'Y';
  private const char EMPTY = '-';


  public GameConnect4(int user1, int user2, string game) : base(user1, user2, game)
  {
    _color1 = null;
    _color2 = null;
    //_board = "YRY---------------------YYY---------------";
    _board   = "------------------------------------------";
  }

  public int EvaluateBoard()
  {
    if (!Regex.IsMatch(_board, $"^[{RED}{YELLOW}{EMPTY}]+$"))
      return Connect4Results.INVALID;
    if (GameWin())
      return Connect4Results.WIN;
    if (!_board.Contains(EMPTY))
      return Connect4Results.DRAW;

    return Connect4Results.IN_PROGRESS;
  }

  private bool GameWin()
  {
    Console.WriteLine("BOARD: " + _board);
    List<string> matrix = new();
    for (int i = 0; i < _board.Length; i += COLUMNS)
      matrix.Add(_board.Substring(i, COLUMNS));

    foreach (var row in matrix)
      Console.WriteLine(row);

    // Check rows
    foreach (var row in matrix)
    {
      int col = 0;
      char c = row[col]; // first column
      int len = 1;
      while (col < COLUMNS-1)
      {
        if (row[col + 1] == c && c != '-')
          ++len;
        else
        {
          c = row[col + 1];
          len = 1;
        }
        ++col;
        if (len == WIN)
          return true;
      }
    }


    // Check columns
    for (int col = 0; col < COLUMNS; col++)
    {
      int row = 0;
      char c = matrix[row][col]; // first row
      int len = 1;
      for (row = 0; row < ROWS - 1; row++)
      {
        if (matrix[row + 1][col] == c && c != '-')
          ++len;
        else
        {
          c = matrix[row + 1][col];
          len = 1;
        }
        if (len == WIN)
          return true;
      }
    }

    // 'falling' diagonal
    for (int col = 0; col < COLUMNS-WIN+1; col++)
      for (int row = 0; row < ROWS-WIN+1; row++)
      {
        char c = matrix[row][col];
        int len = 1;
        for (int i = 1; i < WIN; i++)
        {
          if (matrix[row + i][col + i] == c && c != '-')
            ++len;
          else
            break;
          if (len == WIN)
            return true;
        }
      }
    
    // 'rising' diagonal
    for (int col = COLUMNS-WIN; col < COLUMNS; col++)
      for ( int row = 0; row < ROWS-WIN+1; row++)
      {
        char c = matrix[row][col];
        int len = 1;
        for (int i = 1; i < WIN; i++)
        {
          if (matrix[row + i][col - i] == c && c != '-')
            ++len;
          else
            break;          
          if (len == WIN)
            return true;
        }
    }
    return false;
  }
  

  public void InsertDisk(int userId, int row, int col)
  {
    int idx = row * 7 + col;
    StringBuilder sb = new StringBuilder(_board);
    char c = GetUserColor(userId)[0];
    sb[idx] = c;
    _board = sb.ToString();
  }
  public void SetBoard(string sBoard)
  {
    _board = sBoard;
  }
  public string GetBoard()
  {
    return _board;
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