namespace Services;

public class GameConnect4 : Game
{
  private string? _color1;
  private string? _color2;
  
  public GameConnect4(int user1, int user2, string game) : base(user1, user2, game)
  {
    _color1 = null;
    _color2 = null;
  }

  void SetUserColor(int userId, string color)
  {
    if (userId == _userId1)
      _color1 = color;
    else
      _color2 = color;
  }
  private string GetAnotherColor( string color)
  {
    if (color == "Red")
      return "Yellow";
    return "Red";
  }

  public string GetUserColor(int userId)
  {
    if (userId == _userId1)
    {
      if (_color2 != null)
        _color1 = GetAnotherColor(_color2);
      else
        _color1 = "Red";
      return _color1;
    }
    else // userId2 
    {
      if (_color1 != null)
        _color2 = GetAnotherColor(_color1);
      else
        _color2 = "Red";
      return _color2;
    }
  }
  
  public void ToggleUserColors()
  {
    (_color1, _color2) = (_color2, _color1);
  }


}