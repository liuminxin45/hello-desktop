using HelloDesktop.Workbench;

DirectoryInfo fixture = Directory.CreateTempSubdirectory("hello-desktop-checks-");
string fixtureRoot = fixture.FullName;
int passed = 0;
var scanner = new DirectoryScanner();
try
{
    Check("empty directory", () =>
        Equal(new ScanResult(0, 0), scanner.Scan(fixtureRoot, default)));

    string nested = Path.Combine(fixtureRoot, "中文 空格");
    Directory.CreateDirectory(nested);
    string first = Path.Combine(fixtureRoot, "first.bin");
    File.WriteAllBytes(first, [1, 2, 3]);
    File.WriteAllBytes(Path.Combine(nested, "second.bin"), [4, 5, 6, 7]);
    Check("nested directory and Unicode path", () =>
        Equal(new ScanResult(2, 7), scanner.Scan(fixtureRoot, default)));

    Check("missing directory is an error", () =>
        Throws<DirectoryNotFoundException>(() =>
            scanner.Scan(Path.Combine(fixtureRoot, "missing", "child"), default)));
    Check("file is not accepted as root", () =>
        Throws<ArgumentException>(() => scanner.Scan(first, default)));
    Check("pre-cancelled scan returns no success", () =>
    {
        using var source = new CancellationTokenSource();
        source.Cancel();
        Throws<OperationCanceledException>(() => scanner.Scan(fixtureRoot, source.Token));
    });
    Check("reuse after cancellation and exclusive file access", () =>
    {
        Equal(new ScanResult(2, 7), scanner.Scan(fixtureRoot, default));
        using var stream = new FileStream(first, FileMode.Open, FileAccess.ReadWrite, FileShare.None);
        Equal(3L, stream.Length);
    });
    Console.WriteLine($"PASS: {passed} managed contract checks.");
    return 0;
}
finally
{
    // Validate the resolved recursive-delete target: only our newly created
    // named fixture directly under the system temp directory is permitted.
    string parent = Path.GetFullPath(Path.GetTempPath()).TrimEnd(Path.DirectorySeparatorChar);
    string actualParent = Path.GetDirectoryName(Path.GetFullPath(fixtureRoot))!;
    if (!string.Equals(parent, actualParent, StringComparison.OrdinalIgnoreCase)
        || !Path.GetFileName(fixtureRoot).StartsWith("hello-desktop-checks-", StringComparison.Ordinal))
        throw new InvalidOperationException("Unexpected fixture cleanup path.");
    Directory.Delete(fixtureRoot, recursive: true);
}

void Check(string name, Action action)
{
    action();
    Console.WriteLine($"PASS: {name}");
    passed++;
}

static void Equal<T>(T expected, T actual)
{
    if (!EqualityComparer<T>.Default.Equals(expected, actual))
        throw new InvalidOperationException($"Expected {expected}, got {actual}.");
}

static void Throws<T>(Action action) where T : Exception
{
    try { action(); }
    catch (T) { return; }
    throw new InvalidOperationException($"Expected {typeof(T).Name}.");
}
