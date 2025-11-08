using System.ComponentModel.DataAnnotations.Schema;

namespace Models;

public class Localization
{
  [Column("id")]
  public int Id { get; set; }
  
  [Column("paramkey")]
  public string ParamKey { get; set; } = "";
  
  [Column("paramvalue")]
  public string ParamValue { get; set; } = "";

  [Column("lang")]
  public string Language { get; set; } = "";
 
 }
