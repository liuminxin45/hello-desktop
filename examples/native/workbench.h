#ifndef HELLO_DESKTOP_WORKBENCH_H
#define HELLO_DESKTOP_WORKBENCH_H

#include <stdint.h>

#ifdef _WIN32
#  define WB_CALL __cdecl
#  ifdef WB_BUILD
#    define WB_API __declspec(dllexport)
#  else
#    define WB_API __declspec(dllimport)
#  endif
#else
#  define WB_CALL
#  define WB_API
#endif

#ifdef __cplusplus
extern "C" {
#endif

/* Teaching ABI v1, tested combinations are listed in editorial/validation.md.
 * 0 = success, 1 = invalid argument. On failure total is unspecified.
 * data may be NULL only for length == 0. total must be writable and non-NULL.
 * Valid pointers and buffer bounds remain the caller's responsibility.
 * Synchronous; no retained pointers, callbacks, allocations, or exceptions.
 * Inputs/outputs must not overlap. Distinct calls with disjoint buffers may run
 * concurrently; simultaneous writes to the same output are not supported.
 */
WB_API uint32_t WB_CALL wb_abi_version(void);
WB_API int32_t WB_CALL wb_sum_bytes(const uint8_t* data, uint32_t length, uint64_t* total);

#ifdef __cplusplus
}
#endif
#endif
