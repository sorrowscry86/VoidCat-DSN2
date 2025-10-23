# VoidCat-DSN v2.0 - Directory Structure Setup Script
# Creates complete project structure

$baseDir = "D:\Development\VoidCat-DSN2"

# Clone directories
$directories = @(
    "src\clones\omega",
    "src\clones\beta",
    "src\clones\gamma",
    "src\clones\delta",
    "src\clones\sigma",
    
    # Infrastructure
    "src\infrastructure\integrity",
    "src\infrastructure\evidence",
    "src\infrastructure\artifacts",
    "src\infrastructure\context",
    "src\infrastructure\autogen",
    
    # MCP
    "src\mcp\server",
    "src\mcp\tools",
    
    # Protocols
    "src\protocols",
    
    # Tests
    "test\unit\clones",
    "test\unit\infrastructure",
    "test\unit\protocols",
    "test\integration\clones",
    "test\integration\infrastructure",
    "test\integration\protocols",
    "test\e2e",
    
    # Docker
    "docker\omega",
    "docker\beta",
    "docker\gamma",
    "docker\delta",
    "docker\sigma",
    
    # Documentation
    "docs\architecture",
    "docs\api",
    "docs\guides",
    
    # Scripts
    "scripts",
    
    # Data directories
    "manifests",
    "audit",
    
    # CI/CD
    ".github\workflows"
)

foreach ($dir in $directories) {
    $fullPath = Join-Path $baseDir $dir
    if (!(Test-Path $fullPath)) {
        New-Item -ItemType Directory -Path $fullPath -Force | Out-Null
        Write-Host "Created: $dir"
    } else {
        Write-Host "Exists: $dir"
    }
}

Write-Host "`nDirectory structure created successfully!" -ForegroundColor Green
