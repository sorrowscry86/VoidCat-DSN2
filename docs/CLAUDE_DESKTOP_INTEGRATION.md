# VoidCat-DSN v2.0 - Claude Desktop Integration Guide

## Overview

VoidCat-DSN v2.0 provides a Model Context Protocol (MCP) server that enables seamless integration with Claude Desktop and Claude Code. This allows you to interact with the Sanctuary Network's 5 specialized AI clones directly from your Claude interface.

## Prerequisites

- VoidCat-DSN v2.0 deployed and running (see [DEPLOYMENT.md](../DEPLOYMENT.md))
- Claude Desktop or Claude Code installed
- Node.js 18+ installed
- All clones healthy and accessible on ports 3000-3005

## Setup Instructions

### 1. Install MCP SDK Dependencies

The MCP server requires the Model Context Protocol SDK:

```bash
npm install @modelcontextprotocol/sdk
```

This should already be included if you've run `npm install` in the project.

### 2. Configure Claude Desktop

Add the Sanctuary Network MCP server to your Claude Desktop configuration:

**Location:** `~/.claude_desktop_config.json` (create if it doesn't exist)

```json
{
  "mcpServers": {
    "sanctuary": {
      "command": "node",
      "args": ["/absolute/path/to/VoidCat-DSN2/src/mcp/server.js"],
      "env": {
        "NODE_ENV": "production"
      }
    }
  }
}
```

**Important:** Replace `/absolute/path/to/VoidCat-DSN2` with the actual absolute path to your VoidCat-DSN installation.

### 3. Restart Claude Desktop

After updating the configuration:
1. Completely quit Claude Desktop
2. Restart Claude Desktop
3. The MCP server will automatically start when Claude Desktop launches

### 4. Verify Connection

In Claude Desktop, you should now see the Sanctuary Network tools available. You can verify by asking Claude:

```
Can you show me the available Sanctuary Network tools?
```

## Available Tools

The MCP server provides 9 specialized tools:

### 1. sanctuary_health_check
Check the health status of all clones in the Sanctuary Network.

**Example:**
```
Please run sanctuary_health_check to see if all clones are operational.
```

### 2. sanctuary_beta_analyze
Submit code to Beta Clone for security analysis and debugging.

**Parameters:**
- `code` (required): Code to analyze
- `language` (optional): Programming language
- `context` (optional): Additional context

**Example:**
```
Use sanctuary_beta_analyze to review this authentication function for security issues:

function authenticate(user, pass) {
  if (user === "admin" && pass === "password123") {
    return true;
  }
  return false;
}
```

### 3. sanctuary_gamma_design
Request architecture design from Gamma Clone.

**Parameters:**
- `requirements` (required): System requirements
- `constraints` (optional): Technical constraints

**Example:**
```
Use sanctuary_gamma_design to architect a real-time chat system that supports 10,000 concurrent users.
```

### 4. sanctuary_delta_test
Request test generation from Delta Clone.

**Parameters:**
- `code` (required): Code to generate tests for
- `testFramework` (optional): Test framework (mocha, jest, pytest)
- `context` (optional): Additional context

**Example:**
```
Use sanctuary_delta_test to create Mocha tests for this calculator class:

class Calculator {
  add(a, b) { return a + b; }
  subtract(a, b) { return a - b; }
}
```

### 5. sanctuary_sigma_document
Request documentation from Sigma Clone.

**Parameters:**
- `content` (required): Code or system to document
- `format` (optional): Documentation format (markdown, jsdoc)

**Example:**
```
Use sanctuary_sigma_document to create JSDoc documentation for this API module.
```

### 6. sanctuary_omega_orchestrate
Orchestrate multi-clone workflows via Omega Coordinator.

**Parameters:**
- `objective` (required): Clear workflow objective (5-20 words)
- `targetClone` (required): Target clone (beta, gamma, delta, sigma)
- `essentialData` (optional): Essential data for the task

**Example:**
```
Use sanctuary_omega_orchestrate to have Beta analyze security and then have Gamma propose architectural improvements.
```

### 7. sanctuary_store_artifact
Store work products as artifacts with SHA-256 checksums.

**Parameters:**
- `type` (required): Artifact type (code, documentation, schema, configuration)
- `content` (required): Artifact content
- `metadata` (optional): Additional metadata

**Example:**
```
Use sanctuary_store_artifact to save this authentication module as a code artifact.
```

### 8. sanctuary_get_artifact
Retrieve artifacts by ID.

**Parameters:**
- `artifactId` (required): Artifact UUID
- `manifestOnly` (optional): Return only manifest without content

**Example:**
```
Use sanctuary_get_artifact with ID abc-123-def to retrieve the stored authentication module.
```

### 9. sanctuary_audit_log
View audit trail for clone operations.

**Parameters:**
- `clone` (required): Clone name (omega, beta, gamma, delta, sigma)
- `limit` (optional): Number of recent entries

**Example:**
```
Use sanctuary_audit_log to see the last 10 operations performed by Beta.
```

## Usage Patterns

### Pattern 1: Security Analysis
```
I need to analyze this Express.js authentication middleware for security issues. 
Please use sanctuary_beta_analyze to review it.
```

### Pattern 2: Architecture Design
```
I need to design a microservices architecture for an e-commerce platform.
Use sanctuary_gamma_design with requirements for 100k daily users, payment processing, 
and inventory management.
```

### Pattern 3: Test Generation
```
Please use sanctuary_delta_test to generate comprehensive Mocha tests 
for this user service class, including edge cases.
```

### Pattern 4: Documentation
```
Use sanctuary_sigma_document to create detailed API documentation 
for this REST controller in Markdown format.
```

### Pattern 5: Multi-Clone Workflow
```
Please use sanctuary_omega_orchestrate to:
1. Have Beta analyze this payment processing code
2. Have Gamma suggest architectural improvements
3. Have Delta generate tests for the refactored code
```

## Troubleshooting

### MCP Server Not Appearing

**Check Claude Desktop logs:**
- macOS: `~/Library/Logs/Claude/`
- Windows: `%APPDATA%/Claude/logs/`

**Common issues:**
1. **Incorrect path**: Ensure the path in config is absolute and correct
2. **Node not in PATH**: Use full path to node binary
3. **Clones not running**: Run `npm run health-check` to verify

### Connection Timeout

If MCP tools timeout when called:
1. Verify clones are running: `docker-compose ps`
2. Check clone health: `npm run health-check`
3. Ensure ports 3000-3005 are accessible
4. Check Docker logs: `docker-compose logs -f`

### Tools Not Working

1. **Restart Claude Desktop completely**
2. Verify MCP server can start manually:
   ```bash
   node src/mcp/server.js
   ```
3. Check that clones respond:
   ```bash
   curl http://localhost:3000/health
   ```

## Advanced Configuration

### Custom Port Configuration

If you've changed clone ports in `docker-compose.yml`, update the port mappings in `src/mcp/server.js`:

```javascript
const CLONE_PORTS = {
  omega: 3000,  // Your custom port
  beta: 3002,   // Your custom port
  // etc.
};
```

### Adding Custom Environment Variables

In `~/.claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "sanctuary": {
      "command": "node",
      "args": ["/path/to/src/mcp/server.js"],
      "env": {
        "NODE_ENV": "production",
        "LOG_LEVEL": "info",
        "TIMEOUT": "60000"
      }
    }
  }
}
```

## Best Practices

1. **Keep clones running**: The MCP server requires all clones to be accessible
2. **Use health checks**: Regularly verify network status before complex workflows
3. **Clear objectives**: When using orchestrate, provide clear 5-20 word objectives
4. **Store artifacts**: Save important work products as artifacts for reuse
5. **Review audit logs**: Check audit trails to understand clone operations

## Examples in Action

See [examples/mcp-workflows.md](examples/mcp-workflows.md) for detailed workflow examples.

## Support

If you encounter issues:
1. Check clone health: `npm run health-check`
2. View MCP server logs in Claude Desktop logs folder
3. Review Docker logs: `docker-compose logs -f`
4. Verify MCP server can connect to clones manually

## Next Steps

- Review [DEPLOYMENT.md](../DEPLOYMENT.md) for deployment details
- Check [TROUBLESHOOTING.md](TROUBLESHOOTING.md) for common issues
- Explore example workflows in `examples/` directory
