$ErrorActionPreference = 'Stop'

$path = Join-Path $env:APPDATA 'Claude\claude_desktop_config.json'
Write-Host "PATH: $path" -ForegroundColor Cyan

if (-not (Test-Path $path)) { Write-Error "Not found: $path" }

$content = Get-Content $path -Raw
$preview = if ($content.Length -gt 2000) { $content.Substring(0,2000) } else { $content }

Write-Host '--- CURRENT CONTENT (first 2000 chars) ---' -ForegroundColor Yellow
Write-Output $preview

Write-Host '--- JSON PARSE TEST ---' -ForegroundColor Yellow
try {
  $null = $content | ConvertFrom-Json -ErrorAction Stop
  Write-Host 'OK: JSON is valid' -ForegroundColor Green
} catch {
  Write-Host ('ERROR: ' + $_.Exception.Message) -ForegroundColor Red
}
