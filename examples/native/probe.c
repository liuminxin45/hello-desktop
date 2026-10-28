#include "workbench.h"
#include <stddef.h>
#include <stdio.h>
#include <string.h>
#ifdef _WIN32
#include <windows.h>
#endif

int main(int argc, char** argv)
{
    if (argc == 2 && strcmp(argv[1], "--crash") == 0) {
#ifdef _WIN32
        /* Explicit, isolated teaching exception. Never called by CI checks. */
        RaiseException(0xE0424242u, EXCEPTION_NONCONTINUABLE, 0, NULL);
        return 2;
#else
        fputs("The crash exercise is Windows-only.\n", stderr);
        return 2;
#endif
    }
    uint64_t total = 99;
    const uint8_t bytes[] = {1, 2, 255};
    if (wb_abi_version() != 1) return 1;
    if (wb_sum_bytes(bytes, 3, &total) != 0 || total != 258) return 1;
    if (wb_sum_bytes(NULL, 0, &total) != 0 || total != 0) return 1;
    if (wb_sum_bytes(NULL, 1, &total) != 1) return 1;
    if (wb_sum_bytes(bytes, 3, NULL) != 1) return 1;
    puts("PASS: 5 native contract checks.");
    return 0;
}
