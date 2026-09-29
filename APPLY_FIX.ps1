$ErrorActionPreference = "Stop"

$oldFiles = @(
  "api/developer/account.js",
  "api/developer/company-360.js",
  "api/developer/control-plane.js",
  "api/developer/finalization.js",
  "api/developer/health.js",
  "api/developer/overview.js",
  "api/developer/platform-registry.js",
  "api/developer/saas-management.js"
)

foreach ($file in $oldFiles) {
  if (Test-Path $file) {
    Remove-Item $file -Force
    Write-Host "Deleted $file"
  }
}

$apiCount = (Get-ChildItem -Path api -Filter *.js -Recurse -File).Count
Write-Host ""
Write-Host "Vercel API function file count: $apiCount"

if ($apiCount -gt 12) {
  Write-Error "API function count is still above Vercel Hobby limit (12)."
}

Write-Host "Fix applied. Next run: npm run build"
