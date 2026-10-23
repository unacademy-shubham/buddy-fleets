# Buddy Fleets Phase 3 final patch installer / dry-run.
# Run from the repository root on a new feature branch (NOT on main).
# Intentionally NEVER pushes a production migration or edits secrets.
$ErrorActionPreference = 'Stop'
$repo = (Get-Location).Path
if (-not (Test-Path (Join-Path $repo 'package.json'))) { throw 'Run this script from D:\buddy-fleets repository root.' }
$branch = (& git branch --show-current).Trim()
if ($LASTEXITCODE -ne 0 -or -not $branch -or $branch -eq 'main') {
  throw 'Run on a new feature branch, e.g. fix/phase3-final-hardening (never main).'
}
$sqlSource = Join-Path $repo 'scripts\phase3-final-security-hardening.sql'
$migrationsDir = Join-Path $repo 'supabase\migrations'
if (-not (Test-Path $sqlSource) -or -not (Test-Path $migrationsDir)) {
  throw 'First copy all patch files into their original directories.'
}
$existing = @(Get-ChildItem $migrationsDir -Filter '*_phase3_final_security_hardening.sql' -File)
if ($existing.Count -gt 0) {
  throw ('Phase 3 final migration already present: ' + ($existing.Name -join ', ') + '. Reuse and review; do not generate duplicates.')
}
Write-Host 'Running regression tests (no database changes)...'
& node --test tests/phase3-final-hardening.test.mjs tests/phase3-part3-schema-contract.test.mjs tests/phase3-part2-legacy-functions.test.mjs tests/phase3-alignment.test.mjs tests/phase2-auth-hardening.test.mjs tests/phase1-security.test.mjs
if ($LASTEXITCODE -ne 0) { throw 'Tests failed; no migration created.' }
$maxVersion = @(Get-ChildItem $migrationsDir -Filter '*.sql' -File | ForEach-Object {
  if ($_.BaseName -match '^([0-9]{14})_') { $Matches[1] }
} | Sort-Object -Descending | Select-Object -First 1)
if ($maxVersion.Count -ne 1) { throw 'No 14-digit existing migration version; inspect manually.' }
Write-Host 'Generating migration using the installed Supabase CLI...'
& npx supabase migration new phase3_final_security_hardening
if ($LASTEXITCODE -ne 0) { throw 'Supabase CLI migration creation failed.' }
$created = @(Get-ChildItem $migrationsDir -Filter '*_phase3_final_security_hardening.sql' -File)
if ($created.Count -ne 1) { throw 'Expected exactly one new migration. Stop and inspect.' }
$version = [regex]::Match($created[0].BaseName, '^[0-9]{14}').Value
if ([string]::CompareOrdinal($version, $maxVersion[0]) -le 0) {
  $culture = [System.Globalization.CultureInfo]::InvariantCulture
  $later = [datetime]::ParseExact($maxVersion[0], 'yyyyMMddHHmmss', $culture).AddSeconds(1)
  $name = $later.ToString('yyyyMMddHHmmss') + '_phase3_final_security_hardening.sql'
  if (Test-Path (Join-Path $migrationsDir $name)) { throw 'Migration timestamp collision; stop and inspect.' }
  Rename-Item -LiteralPath $created[0].FullName -NewName $name
  $created = @(Get-Item (Join-Path $migrationsDir $name))
}
Copy-Item -LiteralPath $sqlSource -Destination $created[0].FullName -Force
$a = (Get-FileHash -Algorithm SHA256 $sqlSource).Hash
$b = (Get-FileHash -Algorithm SHA256 $created[0].FullName).Hash
if ($a -ne $b) { throw 'Migration does not match reviewed SQL source.' }
Write-Host ('PASS: migration file ' + $created[0].Name)
Write-Host 'Checking remote migration ordering (READ-ONLY)...'
& npx supabase migration list
if ($LASTEXITCODE -ne 0) { throw 'Migration list failed. Do not deploy.' }
Write-Host 'Checking pending migrations (DRY RUN ONLY)...'
& npx supabase db push --dry-run
if ($LASTEXITCODE -ne 0) { throw 'Dry-run failed. Do not deploy.' }
Write-Host 'Preparation finished: NO PRODUCTION CHANGE performed.'
Write-Host 'Manually confirm dry-run lists ONLY the generated Phase 3 final migration.'
