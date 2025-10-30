namespace Services;

public class Game
{
  public Game( int user1, int user2, string game)
  {
    _userId1 = user1;
    _userId2 = user2;
    _game = game;
  }
  
  private int _userId1;
  private int _userId2;

  string _game;
}