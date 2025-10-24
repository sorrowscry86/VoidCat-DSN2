# Sets up Claude Desktop MCP configuration for VoidCat-DSN2 on Windows
# - Creates or updates %USERPROFILE%\.claude_desktop_config.json
# - Adds/updates the "sanctuary" MCP server pointing to this repo's MCP server
#
# Usage (from repo root PowerShell):
#   powershell -ExecutionPolicy Bypass -File .\scripts\setup-mcp.ps1

$ErrorActionPreference = 'Stop'

function Write-Info($msg) { Write-Host "[INFO] $msg" -ForegroundColor Cyan }
function Write-Ok($msg)   { Write-Host "[ OK ] $msg" -ForegroundColor Green }
function Write-Warn($msg) { Write-Host "[WARN] $msg" -ForegroundColor Yellow }
function Write-Err($msg)  { Write-Host "[ERR ] $msg" -ForegroundColor Red }

# Resolve repo root and server path
$repoRoot   = (Resolve-Path "$PSScriptRoot\..\").Path.TrimEnd('\')
$serverPath = Join-Path $repoRoot 'src\mcp\server.js'

if (-not (Test-Path $serverPath)) {
  Write-Err "MCP server not found at $serverPath"
  Write-Err "Ensure the repository contains src\\mcp\\server.js"
  exit 1
}

# Target Claude Desktop config path
$claudeConfigPath = Join-Path $env:USERPROFILE '.claude_desktop_config.json'

# Load existing config or initialize a new object
if (Test-Path $claudeConfigPath) {
  Write-Info "Loading existing Claude Desktop config: $claudeConfigPath"
  try {
    $existingJson = Get-Content $claudeConfigPath -Raw
    $config = $existingJson | ConvertFrom-Json -ErrorAction Stop
  } catch {
    Write-Err "Failed to parse existing JSON. Aborting to avoid corruption."
    throw
  }
} else {
  Write-Info "Creating new Claude Desktop config: $claudeConfigPath"
  $config = [ordered]@{}
}

# Ensure mcpServers section exists
if (-not $config.mcpServers) {
  $config | Add-Member -NotePropertyName mcpServers -NotePropertyValue ([ordered]@{})
}

# Create/overwrite sanctuary server entry
$sanctuary = [ordered]@{
  command = 'node'
  args    = @($serverPath)
  env     = @{ NODE_ENV = 'production' }
}

$config.mcpServers.sanctuary = $sanctuary

# Write back to file with pretty formatting
# ConvertTo-Json defaults to depth 2; increase to cover nested objects
$config | ConvertTo-Json -Depth 8 | Out-File -FilePath $claudeConfigPath -Encoding UTF8

Write-Ok "Claude Desktop MCP config updated"
Write-Info "Path: $claudeConfigPath"
Write-Info "Server: $serverPath"

Write-Info "Next steps:"
Write-Info "  1) Quit and restart Claude Desktop"
Write-Info "  2) In Claude, ask: 'List available Sanctuary MCP tools'"
