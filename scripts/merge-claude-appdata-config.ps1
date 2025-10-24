# Merge a new MCP server entry into Claude Desktop config under %APPDATA%\Claude\claude_desktop_config.json
# Adds or updates mcpServers.sanctuary-dsn2 pointing to this repo's MCP server

$ErrorActionPreference = 'Stop'

function Write-Info($msg) { Write-Host "[INFO] $msg" -ForegroundColor Cyan }
function Write-Ok($msg)   { Write-Host "[ OK ] $msg" -ForegroundColor Green }
function Write-Err($msg)  { Write-Host "[ERR ] $msg" -ForegroundColor Red }

# Resolve repo server path from current working directory
$repoRoot   = (Get-Location).Path
$serverPath = Join-Path $repoRoot 'src\mcp\server.js'
if (-not (Test-Path $serverPath)) {
  Write-Err "MCP server not found at $serverPath"
  exit 1
}

# Claude Desktop AppData config path
$configPath = Join-Path $env:APPDATA 'Claude\claude_desktop_config.json'
if (-not (Test-Path $configPath)) {
  Write-Err "Claude Desktop config not found: $configPath"
  exit 1
}

# Backup existing config
$backup = "$configPath.bak." + (Get-Date -Format 'yyyyMMdd-HHmmss')
Copy-Item $configPath $backup -Force
Write-Info "Backup created: $backup"

# Load existing JSON
try {
  $config = Get-Content $configPath -Raw | ConvertFrom-Json -ErrorAction Stop
} catch {
  Write-Err "Failed to parse existing JSON at $configPath"
  throw
}

# Ensure mcpServers exists
if (-not $config.mcpServers) {
  $config | Add-Member -NotePropertyName mcpServers -NotePropertyValue ([ordered]@{})
}

# Create or update the sanctuary-dsn2 entry
$sanctuary = [ordered]@{
  command = 'node'
  args    = @($serverPath)
  env     = @{ NODE_ENV = 'production' }
}

# Support both hashtable and PSCustomObject for mcpServers
if ($config.mcpServers -is [System.Collections.IDictionary]) {
  $config.mcpServers['sanctuary-dsn2'] = $sanctuary
} else {
  # PSCustomObject path
  if ($config.mcpServers.PSObject.Properties.Name -contains 'sanctuary-dsn2') {
    $config.mcpServers | Add-Member -MemberType NoteProperty -Name 'sanctuary-dsn2' -Value $sanctuary -Force
  } else {
    $config.mcpServers | Add-Member -MemberType NoteProperty -Name 'sanctuary-dsn2' -Value $sanctuary
  }
}

# Write back JSON
$config | ConvertTo-Json -Depth 10 | Out-File -FilePath $configPath -Encoding UTF8

Write-Ok "Updated Claude Desktop MCP config"
Write-Info "Path: $configPath"
Write-Info "Server: $serverPath"