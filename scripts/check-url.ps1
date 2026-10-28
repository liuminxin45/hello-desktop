param(
    [Parameter(Mandatory = $true)]
    [ValidatePattern('^https?://')]
    [string]$Url
)

# Native Windows HTTP fallback: honor the existing system HTTP configuration.
# This script neither changes proxy settings nor evaluates URL text as code.
$ErrorActionPreference = 'Stop'
try {
    $response = Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec 25 -MaximumRedirection 8
    [int]$response.StatusCode
    exit 0
} catch {
    [Console]::Error.WriteLine($_.Exception.Message)
    exit 1
}
