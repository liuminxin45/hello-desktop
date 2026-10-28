using System.Runtime.InteropServices;

internal static class NativeDemo
{
    [UnmanagedFunctionPointer(CallingConvention.Cdecl)]
    private delegate uint Version();

    [UnmanagedFunctionPointer(CallingConvention.Cdecl)]
    private delegate int Sum([In] byte[] data, uint length, out ulong total);

    public static void Run(string path)
    {
        // Loading a library executes code. Only use this with the teaching library
        // you just built; this sample is not a general-purpose plugin sandbox.
        nint module = NativeLibrary.Load(Path.GetFullPath(path));
        try
        {
            var version = Marshal.GetDelegateForFunctionPointer<Version>(
                NativeLibrary.GetExport(module, "wb_abi_version"));
            if (version() != 1)
                throw new NotSupportedException("Expected ABI major version 1.");
            var sum = Marshal.GetDelegateForFunctionPointer<Sum>(
                NativeLibrary.GetExport(module, "wb_sum_bytes"));
            byte[] input = [1, 2, 255];
            int status = sum(input, checked((uint)input.Length), out ulong total);
            if (status != 0 || total != 258)
                throw new InvalidOperationException("Native contract check failed.");
            status = sum([], 0, out total);
            if (status != 0 || total != 0)
                throw new InvalidOperationException("Empty input contract check failed.");
            Console.WriteLine("PASS: C# -> C ABI, ABI version, byte sum, empty input.");
        }
        finally
        {
            // All calls above are synchronous; the library retains no pointers.
            NativeLibrary.Free(module);
        }
    }
}
