$ErrorActionPreference = 'Stop'

function Read-Utf8NoBom([string]$Path) {
    $enc = New-Object System.Text.UTF8Encoding($false)
    [System.IO.File]::ReadAllText($Path, $enc)
}

function Write-Utf8NoBom([string]$Path, [string]$Text) {
    $enc = New-Object System.Text.UTF8Encoding($false)
    [System.IO.File]::WriteAllText($Path, $Text, $enc)
}

function Backup-Once([string]$Path) {
    $backup = "$Path.before-mfa-session-fix.bak"
    if (-not (Test-Path $backup)) {
        Copy-Item $Path $backup -Force
    }
}

$root = (Get-Location).Path
$path = Join-Path $root 'api\auth\mfa.js'
if (-not (Test-Path $path)) {
    throw "Required file not found: $path"
}

Backup-Once $path
$text = Read-Utf8NoBom $path

# The existing MFA API had a typo that used bitwise OR instead of logical OR
# while reading challengeId.
$text = $text.Replace(
    "const challengeId = String(req.body?.challengeId | '').trim();",
    "const challengeId = String(req.body?.challengeId || '').trim();"
)

# Enable encryption for both reading and persisting the refreshed MFA session tokens.
$text = $text.Replace(
    "['decrypt']",
    "['encrypt', 'decrypt']"
)

if (-not $text.Contains('async function persistCurrentAuthSession')) {
    $helperText = [System.Text.Encoding]::UTF8.GetString([Convert]::FromBase64String('CmFzeW5jIGZ1bmN0aW9uIGVuY3J5cHRTZWNyZXQoc2VjcmV0LCBlbmNyeXB0aW9uS2V5KSB7CiAgY29uc3QgaXYgPSB3ZWJjcnlwdG8uZ2V0UmFuZG9tVmFsdWVzKG5ldyBVaW50OEFycmF5KDEyKSk7CiAgY29uc3QgZW5jcnlwdGVkID0gYXdhaXQgd2ViY3J5cHRvLnN1YnRsZS5lbmNyeXB0KAogICAgeyBuYW1lOiAnQUVTLUdDTScsIGl2IH0sCiAgICBlbmNyeXB0aW9uS2V5LAogICAgbmV3IFRleHRFbmNvZGVyKCkuZW5jb2RlKHNlY3JldCkKICApOwoKICByZXR1cm4gewogICAgZW5jcnlwdGVkOiBCdWZmZXIuZnJvbShlbmNyeXB0ZWQpLnRvU3RyaW5nKCdiYXNlNjQnKSwKICAgIGl2OiBCdWZmZXIuZnJvbShpdikudG9TdHJpbmcoJ2Jhc2U2NCcpLAogIH07Cn0KCmFzeW5jIGZ1bmN0aW9uIHBlcnNpc3RDdXJyZW50QXV0aFNlc3Npb24oYXBwbGljYXRpb25TZXNzaW9uLCB1c2VyQ2xpZW50KSB7CiAgY29uc3QgeyBkYXRhLCBlcnJvciB9ID0gYXdhaXQgdXNlckNsaWVudC5hdXRoLmdldFNlc3Npb24oKTsKICBpZiAoZXJyb3IgfHwgIWRhdGE/LnNlc3Npb24pIHRocm93IG5ldyBFcnJvcignQVVUSF9TRVNTSU9OX1JFRlJFU0hfRkFJTEVEJyk7CiAgaWYgKGRhdGEuc2Vzc2lvbi51c2VyPy5pZCAhPT0gYXBwbGljYXRpb25TZXNzaW9uLnVzZXJfaWQpIHsKICAgIHRocm93IG5ldyBFcnJvcignQVVUSF9TRVNTSU9OX1VTRVJfTUlTTUFUQ0gnKTsKICB9CgogIGNvbnN0IGVuY3J5cHRpb25LZXkgPSBhd2FpdCBnZXRFbmNyeXB0aW9uS2V5KCk7CiAgY29uc3QgW2FjY2VzcywgcmVmcmVzaF0gPSBhd2FpdCBQcm9taXNlLmFsbChbCiAgICBlbmNyeXB0U2VjcmV0KGRhdGEuc2Vzc2lvbi5hY2Nlc3NfdG9rZW4sIGVuY3J5cHRpb25LZXkpLAogICAgZW5jcnlwdFNlY3JldChkYXRhLnNlc3Npb24ucmVmcmVzaF90b2tlbiwgZW5jcnlwdGlvbktleSksCiAgXSk7CgogIGNvbnN0IG5vdyA9IG5ldyBEYXRlKCk7CiAgY29uc3QgbmV4dEV4cGlyeSA9IG5ldyBEYXRlKG5vdy5nZXRUaW1lKCkgKyAzMCAqIDYwICogMTAwMCkudG9JU09TdHJpbmcoKTsKCiAgY29uc3QgeyBlcnJvcjogdXBkYXRlRXJyb3IgfSA9IGF3YWl0IGFkbWluCiAgICAuZnJvbSgnc2VjdXJpdHlfc2Vzc2lvbnMnKQogICAgLnVwZGF0ZSh7CiAgICAgIGVuY3J5cHRlZF9hY2Nlc3NfdG9rZW46IGFjY2Vzcy5lbmNyeXB0ZWQsCiAgICAgIGFjY2Vzc190b2tlbl9pdjogYWNjZXNzLml2LAogICAgICBlbmNyeXB0ZWRfcmVmcmVzaF90b2tlbjogcmVmcmVzaC5lbmNyeXB0ZWQsCiAgICAgIHJlZnJlc2hfdG9rZW5faXY6IHJlZnJlc2guaXYsCiAgICAgIGxhc3Rfc2Vlbl9hdDogbm93LnRvSVNPU3RyaW5nKCksCiAgICAgIGh0dHBfc2Vzc2lvbl9leHBpcmVzX2F0OiBuZXh0RXhwaXJ5LAogICAgfSkKICAgIC5lcSgnaWQnLCBhcHBsaWNhdGlvblNlc3Npb24uaWQpCiAgICAuZXEoJ3N0YXR1cycsICdhY3RpdmUnKTsKCiAgaWYgKHVwZGF0ZUVycm9yKSB0aHJvdyB1cGRhdGVFcnJvcjsKCiAgcmV0dXJuIHsKICAgIGV4cGlyZXNBdDogbmV4dEV4cGlyeSwKICAgIHNlc3Npb246IGRhdGEuc2Vzc2lvbiwKICB9Owp9Cg=='))
    $marker = "async function loadApplicationSession(req)"
    $pos = $text.IndexOf($marker)
    if ($pos -lt 0) {
        throw 'Could not locate MFA application-session loader.'
    }
    $text = $text.Insert($pos, $helperText + "`r`n`r`n")
}

# After successful enrollment, refresh the current session so its JWT carries AAL2,
# then persist the new access/refresh tokens in the current Buddy Fleets session row.
$oldEnable = @'
      if (stateError) throw stateError;

      await securityEvent(auth.session, 'MFA_ENABLED', { factor_id: factorId });
'@
$newEnable = @'
      if (stateError) throw stateError;

      const { error: refreshError } = await userClient.auth.refreshSession();
      if (refreshError) throw refreshError;
      await persistCurrentAuthSession(auth.session, userClient);

      await securityEvent(auth.session, 'MFA_ENABLED', { factor_id: factorId });
'@
if ($text.Contains($oldEnable)) {
    $text = $text.Replace($oldEnable, $newEnable)
} elseif (-not $text.Contains("await persistCurrentAuthSession(auth.session, userClient);")) {
    throw 'Could not locate MFA enable success block.'
}

# After unenrolling, explicitly refresh to obtain the immediate AAL1 JWT and persist it.
$oldDisable = @'
      if (stateError) throw stateError;

      await securityEvent(auth.session, 'MFA_DISABLED', { factor_id: factorId });
'@
$newDisable = @'
      if (stateError) throw stateError;

      const { error: refreshError } = await userClient.auth.refreshSession();
      if (refreshError) throw refreshError;
      await persistCurrentAuthSession(auth.session, userClient);

      await securityEvent(auth.session, 'MFA_DISABLED', { factor_id: factorId });
'@
if ($text.Contains($oldDisable)) {
    $text = $text.Replace($oldDisable, $newDisable)
} elseif (-not $text.Contains("MFA_DISABLED', { factor_id: factorId });`r`n      await revokeBuddySessions")) {
    throw 'Could not locate MFA disable success block.'
}

# The current session remains active; only other sessions are forced to re-authenticate.
$text = $text.Replace(
    "return send(res, 200, { ok: true, mfaEnabled: true, reauthRequired: true });",
    "return send(res, 200, { ok: true, mfaEnabled: true, reauthRequired: false });"
)
$text = $text.Replace(
    "return send(res, 200, { ok: true, mfaEnabled: false, reauthRequired: true });",
    "return send(res, 200, { ok: true, mfaEnabled: false, reauthRequired: false });"
)

Write-Utf8NoBom $path $text

Write-Host ''
Write-Host 'SUCCESS: MFA current-session token persistence fixed.'
Write-Host 'Updated: api\auth\mfa.js'
Write-Host 'Backup: api\auth\mfa.js.before-mfa-session-fix.bak'
