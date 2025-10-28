using System.ComponentModel.DataAnnotations.Schema;

namespace Models;

public class User
{
  [Column("user_id")]
  public int UserId { get; set; }

  [Column("login")]
  public string Login { get; set; } = "";

  [Column("full_name")]
  public string? FullName { get; set; }

  [Column("isonline")]
  public bool IsOnline { get; set; } = false;
}
