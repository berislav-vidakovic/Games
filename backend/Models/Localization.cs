using System.ComponentModel.DataAnnotations.Schema;

namespace Models;

public class Localization
{
  [Column("paramkey")]
  public string ParamKey { get; set; } = "";
  
  [Column("paramvalue")]
  public string ParamValue { get; set; } = "";

  [Column("lang")]
  public string Language { get; set; } = "";
 
 }
