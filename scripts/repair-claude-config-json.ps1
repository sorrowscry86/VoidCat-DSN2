# Repairs claude_desktop_config.json by re-serializing with standard JSON formatting
$ErrorActionPreference = 'Stop'

function Write-Info($msg) { Write-Host "[INFO] $msg" -ForegroundColor Cyan }
function Write-Ok($msg)   { Write-Host "[ OK ] $msg" -ForegroundColor Green }
function Write-Err($msg)  { Write-Host "[ERR ] $msg" -ForegroundColor Red }

$path = Join-Path $env:APPDATA 'Claude\claude_desktop_config.json'
if (-not (Test-Path $path)) {
  Write-Err "Config not found: $path"
  exit 1
}

# Backup
$backup = "$path.bak." + (Get-Date -Format 'yyyyMMdd-HHmmss')
Copy-Item $path $backup -Force
Write-Info "Backup: $backup"

# Load and re-serialize as clean JSON
try {
  $config = Get-Content $path -Raw | ConvertFrom-Json -ErrorAction Stop
} catch {
  Write-Err "Could not parse JSON: $($_.Exception.Message)"
  exit 1
}

# Write back with standard formatting (depth 10, UTF8 no BOM)
$json = $config | ConvertTo-Json -Depth 10 -Compress:$false
[System.IO.File]::WriteAllText($path, $json, [System.Text.UTF8Encoding]::new($false))

Write-Ok "Repaired JSON formatting"
Write-Info "Path: $path"

# Verify
try {
  $null = Get-Content $path -Raw | ConvertFrom-Json -ErrorAction Stop
  Write-Ok "Verification: JSON is valid"
} catch {
  Write-Err "Verification failed: $($_.Exception.Message)"
}
