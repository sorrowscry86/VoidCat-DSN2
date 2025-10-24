$ErrorActionPreference = 'Stop'
$src = Join-Path $env:APPDATA 'Claude\claude_desktop_config.json'
$dstDir = 'D:\Development\VoidCat-DSN2\tmp'
if (-not (Test-Path $dstDir)) { New-Item -ItemType Directory -Path $dstDir | Out-Null }
$dst = Join-Path $dstDir 'claude_desktop_config.current.json'
Copy-Item $src $dst -Force
Write-Host "Copied to $dst"