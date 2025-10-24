# Removes the legacy 'digital-sanctuary' MCP entry from Claude Desktop config under %APPDATA%\Claude
$ErrorActionPreference = 'Stop'

function Write-Info($msg) { Write-Host "[INFO] $msg" -ForegroundColor Cyan }
function Write-Ok($msg)   { Write-Host "[ OK ] $msg" -ForegroundColor Green }
function Write-Warn($msg) { Write-Host "[WARN] $msg" -ForegroundColor Yellow }
function Write-Err($msg)  { Write-Host "[ERR ] $msg" -ForegroundColor Red }

$configPath = Join-Path $env:APPDATA 'Claude\claude_desktop_config.json'
if (-not (Test-Path $configPath)) {
  Write-Err "Claude Desktop config not found: $configPath"
  exit 1
}

# Backup
$backup = "$configPath.bak." + (Get-Date -Format 'yyyyMMdd-HHmmss')
Copy-Item $configPath $backup -Force
Write-Info "Backup created: $backup"

# Load
$config = Get-Content $configPath -Raw | ConvertFrom-Json
if ($null -eq $config.mcpServers) {
  Write-Warn "No mcpServers section present. Nothing to remove."
  exit 0
}

# Remove the entry if present
$removed = $false
if ($config.mcpServers -is [System.Collections.IDictionary]) {
  if ($config.mcpServers.Contains('digital-sanctuary')) {
    [void]$config.mcpServers.Remove('digital-sanctuary')
    $removed = $true
  }
} else {
  $removed = $config.mcpServers.PSObject.Properties.Remove('digital-sanctuary')
}

if ($removed) {
  $config | ConvertTo-Json -Depth 10 | Out-File -FilePath $configPath -Encoding UTF8
  Write-Ok "Removed 'digital-sanctuary' from mcpServers."
} else {
  Write-Warn "'digital-sanctuary' not found. No changes made."
}

# Show remaining servers
$names = @()
if ($config.mcpServers -is [System.Collections.IDictionary]) { $names = $config.mcpServers.Keys }
else { $names = $config.mcpServers.PSObject.Properties.Name }
Write-Info ("Remaining servers: " + ($names -join ', '))
