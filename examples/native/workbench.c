#include "workbench.h"
#include <stddef.h>

uint32_t WB_CALL wb_abi_version(void) { return 1; }

int32_t WB_CALL wb_sum_bytes(const uint8_t* data, uint32_t length, uint64_t* total)
{
    if (total == NULL || (data == NULL && length != 0)) return 1;
    uint64_t sum = 0;
    for (uint32_t i = 0; i < length; ++i) sum += data[i];
    *total = sum;
    return 0;
}
