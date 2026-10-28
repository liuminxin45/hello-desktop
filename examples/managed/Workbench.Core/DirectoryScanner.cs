namespace HelloDesktop.Workbench;

public sealed record ScanResult(long FileCount, long TotalBytes);

public interface IScanner
{
    ScanResult Scan(string directory, CancellationToken cancellationToken);
}

/// <summary>
/// Synchronous teaching scanner. Fails the whole run on an I/O error, skips
/// reparse points, and does not promise a filesystem snapshot or a security sandbox.
/// Cancellation is cooperative between filesystem operations.
/// </summary>
public sealed class DirectoryScanner : IScanner
{
    public ScanResult Scan(string directory, CancellationToken cancellationToken)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(directory);
        cancellationToken.ThrowIfCancellationRequested();
        string root = Path.GetFullPath(directory);
        FileAttributes rootAttributes = File.GetAttributes(root);
        if (!rootAttributes.HasFlag(FileAttributes.Directory))
            throw new ArgumentException("The input must be a directory.", nameof(directory));
        if (rootAttributes.HasFlag(FileAttributes.ReparsePoint))
            throw new ArgumentException("The root must not be a reparse point.", nameof(directory));

        var pending = new Stack<DirectoryInfo>();
        pending.Push(new DirectoryInfo(root));
        long files = 0;
        long bytes = 0;
        while (pending.TryPop(out DirectoryInfo? current))
        {
            cancellationToken.ThrowIfCancellationRequested();
            // foreach disposes the enumerator even when cancellation or I/O throws.
            foreach (FileSystemInfo entry in current.EnumerateFileSystemInfos())
            {
                cancellationToken.ThrowIfCancellationRequested();
                FileAttributes attributes = entry.Attributes;
                if (attributes.HasFlag(FileAttributes.ReparsePoint))
                    continue;
                if (entry is DirectoryInfo child)
                    pending.Push(child);
                else if (entry is FileInfo file)
                {
                    files = checked(files + 1);
                    bytes = checked(bytes + file.Length);
                }
            }
        }
        cancellationToken.ThrowIfCancellationRequested();
        return new ScanResult(files, bytes);
    }
}
