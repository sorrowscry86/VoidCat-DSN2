# PR #8 Required Fixes

## Fix #1: MCP Server Input Validation

**File**: `src/mcp/server.js`  
**Location**: Line 239 (handleToolCall method)

**Current Code**:
```javascript
async handleToolCall(request) {
  const { name, arguments: args } = request.params;
  
  try {
    switch (name) {
      // ... cases
    }
  } catch (error) {
    return {
      content: [{ type: 'text', text: `Error: ${error.message}` }],
      isError: true
    };
  }
}
```

**Fixed Code**:
```javascript
async handleToolCall(request) {
  // Validate request structure
  if (!request?.params) {
    return {
      content: [{
        type: 'text',
        text: 'Error: Invalid request - missing params'
      }],
      isError: true
    };
  }
  
  if (!request.params.name) {
    return {
      content: [{
        type: 'text',
        text: 'Error: Invalid request - missing tool name'
      }],
      isError: true
    };
  }
  
  const { name, arguments: args = {} } = request.params;
  
  try {
    switch (name) {
      case 'sanctuary_health_check':
        return await this.healthCheck();
      case 'sanctuary_beta_analyze':
        return await this.callBetaAnalyze(args);
      case 'sanctuary_gamma_design':
        return await this.callGammaDesign(args);
      case 'sanctuary_delta_test':
        return await this.callDeltaTest(args);
      case 'sanctuary_sigma_document':
        return await this.callSigmaDocument(args);
      case 'sanctuary_omega_orchestrate':
        return await this.callOmegaOrchestrate(args);
      case 'sanctuary_store_artifact':
        return await this.storeArtifact(args);
      case 'sanctuary_get_artifact':
        return await this.getArtifact(args);
      case 'sanctuary_audit_log':
        return await this.getAuditLog(args);
      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    return {
      content: [{
        type: 'text',
        text: `Error: ${error.message}`
      }],
      isError: true
    };
  }
}
```

---

## Fix #2: .dockerignore Improvement

**File**: `docker/.dockerignore`

**Current Code**:
```dockerignore
# Documentation
*.md
docs/
.specstory/
```

**Fixed Code**:
```dockerignore
# Documentation (exclude most markdown, but preserve essential files)
docs/
.specstory/
CLAUDE.md
IMPLEMENTATION*.md
PHASE*.md

# Keep these essential docs
# README.md (needed for container documentation)
# DEPLOYMENT.md (deployment reference)
```

**Rationale**: Excluding ALL `.md` files means `README.md` won't be in the container, which could be useful for troubleshooting. However, we DO want to exclude most documentation to keep image size small. This is a balanced approach.

---

## Fix #3: Documentation Link Audit

### Broken Links to Fix:

**File**: `docs/CLAUDE_DESKTOP_INTEGRATION.md`

**Line**: Near end of file
```markdown
## Examples in Action

See [examples/mcp-workflows.md](examples/mcp-workflows.md) for detailed workflow examples.
```

**Fix Options**:
1. **Create the file**: Add `examples/mcp-workflows.md` with actual examples
2. **Remove the link**: Delete this section
3. **Update the link**: Point to existing documentation

**Recommendation**: Remove the broken link section for now, add the examples file in a future PR.

**Updated Section**:
```markdown
## Examples in Action

Examples will be added in a future documentation update. For now, refer to the tool usage patterns above and the troubleshooting guide.
```

---

**File**: `docs/TROUBLESHOOTING.md`

Check all relative links - these appear correct based on the PR structure.

---

## Fix #4: Package.json - Add Missing Scripts

**File**: `package.json`

**Current Scripts Section** (missing Phase 3 additions):
```json
"scripts": {
  "test": "c8 mocha 'test/**/*.test.js'",
  "test:unit": "c8 mocha 'test/unit/**/*.test.js'",
  "test:integration": "c8 mocha 'test/integration/**/*.test.js'",
  "test:e2e": "mocha 'test/e2e/**/*.test.js'",
  "test:watch": "mocha --watch 'test/**/*.test.js'",
  "test:coverage": "c8 --reporter=html --reporter=text mocha 'test/**/*.test.js'",
  "lint": "echo 'Linting not configured yet'",
  "docker:build": "docker-compose build",
  "docker:up": "docker-compose up -d",
  "docker:down": "docker-compose down",
  "docker:logs": "docker-compose logs -f",
  "docker:restart": "docker-compose restart",
  "health-check": "node scripts/health-check.js",
  "start:omega": "node src/clones/omega/index.js",
  "start:beta": "node src/clones/beta/index.js",
  "start:gamma": "node src/clones/gamma/index.js",
  "start:delta": "node src/clones/delta/index.js",
  "start:sigma": "node src/clones/sigma/index.js"
}
```

**Fixed Scripts Section** (with Phase 3):
```json
"scripts": {
  "test": "c8 mocha 'test/**/*.test.js'",
  "test:unit": "c8 mocha 'test/unit/**/*.test.js'",
  "test:integration": "c8 mocha 'test/integration/**/*.test.js'",
  "test:e2e": "mocha 'test/e2e/**/*.test.js'",
  "test:watch": "mocha --watch 'test/**/*.test.js'",
  "test:coverage": "c8 --reporter=html --reporter=text mocha 'test/**/*.test.js'",
  "lint": "echo 'Linting not configured yet'",
  "docker:build": "docker-compose build",
  "docker:up": "docker-compose up -d",
  "docker:down": "docker-compose down",
  "docker:logs": "docker-compose logs -f",
  "docker:restart": "docker-compose restart",
  "deploy": "bash scripts/deploy.sh",
  "validate": "node scripts/validate-deployment.js",
  "health-check": "node scripts/health-check.js",
  "mcp:start": "node src/mcp/server.js",
  "start:omega": "node src/clones/omega/index.js",
  "start:beta": "node src/clones/beta/index.js",
  "start:gamma": "node src/clones/gamma/index.js",
  "start:delta": "node src/clones/delta/index.js",
  "start:sigma": "node src/clones/sigma/index.js"
}
```

**Also add MCP dependency**:
```json
"dependencies": {
  "express": "^4.18.2",
  "@anthropic-ai/sdk": "^0.27.0",
  "@modelcontextprotocol/sdk": "^1.0.0",
  "axios": "^1.6.0",
  "uuid": "^9.0.0",
  "winston": "^3.11.0"
}
```

---

## Fix #5: Deployment Script - Health Check Logic

**File**: `scripts/deploy.sh`

**Potential Issue**: The health check at the end may not handle partial failures well.

**Current Code** (lines 62-89):
```bash
# Run health check
if npm run health-check; then
    echo ""
    echo "✅ Deployment complete!"
    # ... success messages
else
    echo ""
    echo "⚠️  Some clones may not be healthy yet."
    # ... warning messages
fi
```

**Improved Code**:
```bash
# Run health check with retries
echo "✓ Running health checks (with retries)..."
RETRIES=3
RETRY_DELAY=10

for i in $(seq 1 $RETRIES); do
  if npm run health-check; then
    echo ""
    echo "✅ Deployment complete!"
    echo ""
    echo "📍 Sanctuary Network Status:"
    echo "   - Omega (Coordinator):   http://localhost:3000/health"
    echo "   - Beta (Analyzer):       http://localhost:3002/health"
    echo "   - Gamma (Architect):     http://localhost:3003/health"
    echo "   - Delta (Tester):        http://localhost:3004/health"
    echo "   - Sigma (Communicator):  http://localhost:3005/health"
    echo ""
    echo "📋 Useful Commands:"
    echo "   - View logs:     docker-compose logs -f"
    echo "   - Stop network:  docker-compose down"
    echo "   - Restart:       docker-compose restart"
    echo "   - Health check:  npm run health-check"
    echo ""
    exit 0
  fi
  
  if [ $i -lt $RETRIES ]; then
    echo "⏳ Health check attempt $i failed. Waiting ${RETRY_DELAY}s before retry..."
    sleep $RETRY_DELAY
  fi
done

echo ""
echo "⚠️  Health checks failed after $RETRIES attempts."
echo "   This may be normal if clones need more initialization time."
echo "   You can manually verify with: npm run health-check"
echo ""
echo "   To view logs: docker-compose logs -f"
echo ""
exit 1
```

---

## Fix #6: Validation Script - Container Check

**File**: `scripts/validate-deployment.js`

**Potential Issue**: The Docker container check may not work on all systems.

**Current Code** (lines 72-93):
```javascript
{
  name: 'Docker containers running',
  check() {
    try {
      const output = execSync('docker-compose ps --services --filter "status=running"', {
        encoding: 'utf-8',
        cwd: process.cwd()
      });
      
      const runningServices = output.trim().split('\n').filter(s => s);
      const expectedServices = ['omega', 'beta', 'gamma', 'delta', 'sigma'];
      
      for (const service of expectedServices) {
        if (!runningServices.includes(service)) {
          throw new Error(`Service ${service} not running`);
        }
      }
      
      return true;
    } catch (error) {
      throw new Error(`Docker check failed: ${error.message}`);
    }
  }
}
```

**Improved Code**:
```javascript
{
  name: 'Docker containers running',
  check() {
    try {
      // Try docker-compose v2 syntax first
      let output;
      try {
        output = execSync('docker compose ps --services --filter "status=running"', {
          encoding: 'utf-8',
          cwd: process.cwd(),
          stdio: ['pipe', 'pipe', 'pipe']
        });
      } catch {
        // Fallback to v1 syntax
        output = execSync('docker-compose ps --services --filter "status=running"', {
          encoding: 'utf-8',
          cwd: process.cwd()
        });
      }
      
      const runningServices = output.trim().split('\n').filter(s => s.length > 0);
      const expectedServices = ['omega', 'beta', 'gamma', 'delta', 'sigma'];
      
      for (const service of expectedServices) {
        if (!runningServices.includes(service)) {
          throw new Error(`Service ${service} not running`);
        }
      }
      
      return true;
    } catch (error) {
      throw new Error(`Docker check failed: ${error.message}`);
    }
  }
}
```

---

## Summary of Changes

1. ✅ **MCP Server**: Add input validation (src/mcp/server.js:239)
2. ✅ **Dockerignore**: Refine exclusions (docker/.dockerignore)
3. ✅ **Documentation**: Fix broken links (docs/CLAUDE_DESKTOP_INTEGRATION.md)
4. ✅ **Package.json**: Add Phase 3 scripts and dependency
5. ✅ **Deploy Script**: Add retry logic (scripts/deploy.sh:62-89)
6. ✅ **Validation Script**: Handle both docker-compose versions (scripts/validate-deployment.js:72-93)

---

## Testing After Fixes

```bash
# 1. Install dependencies
npm install

# 2. Verify package structure
npm list @anthropic-ai/sdk
npm list @modelcontextprotocol/sdk

# 3. Test Docker build
docker-compose build

# 4. Run deployment
npm run deploy

# 5. Validate deployment
npm run validate

# 6. Run tests
npm test
npm run test:e2e

# 7. Test MCP server
npm run mcp:start
# (should output: "Sanctuary MCP Server v2.0.0 running on stdio")
```

---

**These fixes address all critical and major concerns from both Claude and Gemini reviews.**
