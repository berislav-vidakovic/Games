namespace Services;
using System.Collections.Concurrent;
using System.Net.WebSockets;
using System.Text;
using System.Timers;


public class TimerManager
{
  private readonly IServiceScopeFactory _scopeFactory;
  protected int _idleTimeoutSec;
  protected int _checkIntervalMin;
  private Timer? _activityMonitor;

  public TimerManager(IServiceScopeFactory scopeFactory,
    IConfiguration config, string configKey )
  {
    _scopeFactory = scopeFactory;
    _activityMonitor = null;

    string keyIdleTimeout = $"{configKey}:IdleTimeoutSec"; // TODO: Add to appsettings.json
    string keyCheckInterval = $"{configKey}:CheckIntervalMin";

    if (config.GetSection(keyIdleTimeout).Exists())
      _idleTimeoutSec = int.Parse(config[keyIdleTimeout]!);

    if (config.GetSection(keyCheckInterval).Exists())
      _checkIntervalMin = int.Parse(config[keyCheckInterval]!);

    Console.WriteLine($"Timer settings: {_idleTimeoutSec}s, {_checkIntervalMin}min");
  }

  protected virtual void SetTimeStamp()
  {
    Console.WriteLine("Base class SetTimeStamp");
  }

  protected void TimerStart()
  {
    _activityMonitor = new System.Timers.Timer(_checkIntervalMin * 60 * 1000);
    _activityMonitor.AutoReset = true;
    _activityMonitor.Elapsed += CleanupIdleItems;
    _activityMonitor.Start();
    Console.WriteLine($"*** TIMER started ************");
  }

  public void TimerStop()
  {
    Console.WriteLine($"*** TIMER stopping .....  ************");
    
    if ( _activityMonitor != null )
      return;
    _activityMonitor!.Stop();
    _activityMonitor!.Dispose();
    Console.WriteLine($"*** ... TIMER stopped ************");

  }

  protected virtual void CleanupIdleItems(object? sender, ElapsedEventArgs e)
  {
    Console.WriteLine($"*** (Base class) CleanupIdleGames *** ");
  }
}