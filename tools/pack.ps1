# Pack and sign the CDN Detector extension (Windows PowerShell 5.1 compatible).
# Outputs:
#   dist/cdn-detector-<version>.crx              CRX3 signed package (via Chrome/Edge --pack-extension)
#   dist/cdn-detector-<version>-webstore.zip     upload package for Chrome Web Store / Edge Add-ons
#   dist/extension_key.pem                       RSA-2048 signing key (auto-generated on first run; keep secret,
#                                                reuse it to keep a stable extension ID)
# Usage: powershell -ExecutionPolicy Bypass -File tools\pack.ps1
$ErrorActionPreference = "Stop"

$root  = Split-Path -Parent $PSScriptRoot
$dist  = Join-Path $root "dist"
$stage = Join-Path $dist "stage"
New-Item -ItemType Directory -Force $dist | Out-Null

# ---------- 1) staging: runtime files only ----------
Remove-Item -Recurse -Force $stage -ErrorAction SilentlyContinue
New-Item -ItemType Directory -Force $stage | Out-Null
Copy-Item (Join-Path $root "manifest.json"), (Join-Path $root "background.js") -Destination $stage
foreach ($name in @("lib", "rules", "popup", "icons", "_locales", "content")) {
  Copy-Item (Join-Path $root $name) -Destination $stage -Recurse
}

$version = (Get-Content (Join-Path $root "manifest.json") -Raw -Encoding UTF8 | ConvertFrom-Json).version
$crxPath = Join-Path $dist ("cdn-detector-" + $version + ".crx")
$zipPath = Join-Path $dist ("cdn-detector-" + $version + "-webstore.zip")

# ---------- 2) signing key + extension ID (computed by Node helper) ----------
$node = $null
$cmd = Get-Command node -ErrorAction SilentlyContinue
if ($cmd) { $node = $cmd.Source }
if (-not $node) {
  $fallback = "C:\Users\vr2.bi2xm\.dsh\dsh-runtimes\dsh-primary-runtime\dependencies\node\bin\node.exe"
  if (Test-Path $fallback) { $node = $fallback }
}
if (-not $node) { throw "node not found (needed for signing key / extension ID)" }

$keyPath = Join-Path $dist "extension_key.pem"
$keyExisted = Test-Path $keyPath
$extensionId = (& $node (Join-Path $root "tools\crx_key.mjs") | Out-String).Trim()
if (-not $extensionId -or $extensionId.Length -ne 32) { throw "extension ID computation failed: '$extensionId'" }
if (-not $keyExisted) { Write-Host "new signing key generated: $keyPath" }

# ---------- 3) locate a Chromium browser (filesystem + registry App Paths) ----------
$candidates = @()
$pf86 = [Environment]::GetFolderPath("ProgramFilesX86")
if ($pf86) {
  $candidates += (Join-Path $pf86 "Microsoft\Edge\Application\msedge.exe")
  $candidates += (Join-Path $pf86 "Google\Chrome\Application\chrome.exe")
}
if ($env:ProgramFiles) {
  $candidates += (Join-Path $env:ProgramFiles "Google\Chrome\Application\chrome.exe")
  $candidates += (Join-Path $env:ProgramFiles "Microsoft\Edge\Application\msedge.exe")
}
if ($env:LOCALAPPDATA) {
  $candidates += (Join-Path $env:LOCALAPPDATA "Google\Chrome\Application\chrome.exe")
  $candidates += (Join-Path $env:LOCALAPPDATA "Microsoft\Edge\Application\msedge.exe")
}
foreach ($regRoot in @("HKLM:\SOFTWARE", "HKCU:\SOFTWARE")) {
  foreach ($exeName in @("chrome.exe", "msedge.exe")) {
    $regPath = Join-Path $regRoot ("Microsoft\Windows\CurrentVersion\App Paths\" + $exeName)
    $reg = Get-ItemProperty $regPath -ErrorAction SilentlyContinue
    if ($reg -and $reg.'(default)') { $candidates += $reg.'(default)' }
  }
}
$browser = $candidates | Where-Object { $_ -and (Test-Path $_) } | Select-Object -First 1
if (-not $browser) { throw "no Chrome/Edge browser found on this machine" }
Write-Host "pack browser: $browser"

$rawCrx  = "$stage.crx"
$profile = Join-Path $env:TEMP "crxpack-profile"
Remove-Item $rawCrx -Force -ErrorAction SilentlyContinue

try {
  $p = Start-Process -FilePath $browser -ArgumentList @(
    "--pack-extension=$stage",
    "--pack-extension-key=$keyPath",
    "--user-data-dir=$profile",
    "--no-first-run",
    "--no-default-browser-check"
  ) -WindowStyle Hidden -PassThru
  if (-not $p.WaitForExit(90000)) {
    Stop-Process -Id $p.Id -Force -ErrorAction SilentlyContinue
    throw "browser did not exit within 90s"
  }
  if (-not (Test-Path $rawCrx)) {
    throw "browser exited (code $($p.ExitCode)) but produced no CRX; signing key must be PKCS#8 PEM"
  }
  Move-Item $rawCrx $crxPath -Force
}
finally {
  # only kill pack processes using our temp profile; never touch the user's browser
  Get-CimInstance Win32_Process -Filter "Name='msedge.exe' OR Name='chrome.exe'" -ErrorAction SilentlyContinue |
    Where-Object { $_.CommandLine -like "*crxpack-profile*" } |
    ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }
}

# ---------- 4) verify CRX3 magic and version ----------
$bytes = [System.IO.File]::ReadAllBytes($crxPath)
$magic = [System.Text.Encoding]::ASCII.GetString($bytes, 0, 4)
$crxVer = [BitConverter]::ToUInt32($bytes, 4)
if ($magic -ne "Cr24") { throw "bad CRX magic: $magic" }
Write-Host ("CRX format check: Cr24 v{0}" -f $crxVer)

# ---------- 5) web store zip (forward-slash entry names) ----------
Remove-Item $zipPath -Force -ErrorAction SilentlyContinue
Add-Type -AssemblyName System.IO.Compression, System.IO.Compression.FileSystem
$zip = [System.IO.Compression.ZipFile]::Open($zipPath, "Create")
try {
  Get-ChildItem $stage -Recurse -File | ForEach-Object {
    $rel = $_.FullName.Substring($stage.Length + 1).Replace("\", "/")
    [void][System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($zip, $_.FullName, $rel, [System.IO.Compression.CompressionLevel]::Optimal)
  }
} finally { $zip.Dispose() }

# ---------- 6) cleanup staging ----------
Remove-Item -Recurse -Force $stage -ErrorAction SilentlyContinue

Write-Host ""
Write-Host "pack complete:"
Write-Host ("  CRX         : {0}  ({1:N0} bytes)" -f $crxPath, (Get-Item $crxPath).Length)
Write-Host ("  store zip   : {0}  ({1:N0} bytes)" -f $zipPath, (Get-Item $zipPath).Length)
Write-Host ("  private key : {0}  (keep secret)" -f $keyPath)
Write-Host ("  extension ID: {0}" -f $extensionId)
