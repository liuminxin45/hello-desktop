using System.Text.Json;
using HelloDesktop.Workbench;

if (args.Length != 2 || args[0] is not ("scan" or "native"))
{
    Console.Error.WriteLine("Usage: Workbench.Cli scan <directory> | native <absolute-library-path>");
    return 2;
}

using var cancellation = new CancellationTokenSource();
var lifetime = new object();
bool finished = false;
ConsoleCancelEventHandler handler = (_, e) =>
{
    lock (lifetime)
    {
        if (finished) return;
        e.Cancel = true;
        cancellation.Cancel();
    }
};
Console.CancelKeyPress += handler;
try
{
    if (args[0] == "native")
        NativeDemo.Run(args[1]);
    else
        Console.WriteLine(JsonSerializer.Serialize(
            new DirectoryScanner().Scan(args[1], cancellation.Token)));
    return 0;
}
catch (OperationCanceledException) when (cancellation.IsCancellationRequested)
{
    Console.Error.WriteLine("Scan cancelled. No complete result was returned.");
    return 130;
}
catch (Exception error)
{
    // Teaching CLI: keep errors distinct from a valid zero result.
    Console.Error.WriteLine($"{error.GetType().Name}: {error.Message}");
    return 1;
}
finally
{
    // A console callback may already be in flight when we unsubscribe.
    // Serialize shutdown so none can use the source after it is disposed.
    lock (lifetime) finished = true;
    Console.CancelKeyPress -= handler;
}
