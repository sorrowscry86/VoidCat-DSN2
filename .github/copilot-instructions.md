# VoidCat-DSN v2.0 - AI Agent Instructions

**Project Status:** Blueprint/Implementation Phase  
**Architecture:** Distributed AI Clone Coordination System  
**Tech Stack:** Node.js 18+ (ES Modules), Docker, Anthropic Claude API, MCP  
**Critical Law:** NO SIMULATIONS - All outputs must be 100% real, verifiable, audit-traceable

---

## 🏗️ Big Picture Architecture

This is a **5-clone distributed AI system** inspired by Re:Zero's Ryuzu Meyer:

```
User → MCP Server → Omega (Coordinator) → [Beta, Gamma, Delta, Sigma] → Real AI Execution
                         ↓
                    Context Engineering (Quality Scoring 0-100)
                         ↓
                    Artifact Manager (SHA-256 Checksums)
                         ↓
                    Evidence Collector (Audit Trails)
```

### The 5 Specialized Clones

| Clone | External Port | Internal Port | Role | Specialization |
|-------|---------------|---------------|------|----------------|
| **Omega** | 3000 | 3001 | Coordinator | Task orchestration, context engineering, multi-clone workflows |
| **Beta** | 3002 | 3001 | Analyzer | Code analysis, debugging, security review |
| **Gamma** | 3003 | 3001 | Architect | System design, architecture, design patterns |
| **Delta** | 3004 | 3001 | Tester | Testing strategies, QA, test generation |
| **Sigma** | 3005 | 3001 | Communicator | Documentation, communication, user-facing content |

**CRITICAL**: All clones use `process.env.PORT || 3001` internally - **NEVER hard-code port numbers**. Docker maps internal port 3001 to unique external ports (3000, 3002-3005).

---

## 🔒 IRON CLAD LAW: NO SIMULATIONS

**THIS IS THE MOST CRITICAL RULE IN THE ENTIRE PROJECT.**

### What This Means

- ❌ **FORBIDDEN**: Mock responses, simulated metrics, fake test results, placeholder data presented as real
- ✅ **REQUIRED**: Real AI execution via AutoGen, measured metrics, actual checksums, verifiable audit trails

### Code Pattern (Real Execution)

```javascript
// ✅ CORRECT - Real or throw
async generateAgentResponse(prompt, context) {
  try {
    const response = await this.autoGenClient.query({
      model: 'claude-3-5-sonnet-20241022',
      prompt: this.enhancePrompt(prompt, context),
      stream: true
    });
    
    this.evidenceCollector.record({
      type: 'ai_execution',
      execution: 'real', // ← Required marker
      timestamp: new Date().toISOString()
    });
    
    return response;
  } catch (error) {
    this.evidenceCollector.record({
      type: 'ai_execution',
      execution: 'failed',
      error: error.message
    });
    throw error; // ← NO fallback to mocks
  }
}
```

```javascript
// ❌ WRONG - Simulated fallback (NEVER DO THIS)
async generateAgentResponse(prompt, context) {
  try {
    return await this.autoGenClient.query(...);
  } catch (error) {
    // ❌ FORBIDDEN - This violates NO SIMULATIONS LAW
    return { 
      role: 'assistant', 
      content: 'Mock response...' 
    };
  }
}
```

### Verification Before Committing

**Run this mental checklist:**
1. ☐ Does this code execute real AI via AutoGen?
2. ☐ Is there evidence collection with `execution: 'real'` marker?
3. ☐ Are metrics measured, not estimated?
4. ☐ Are checksums calculated for artifacts?
5. ☐ Is there an audit trail?

**If ANY checkbox is unchecked, DO NOT COMMIT.**

---

## 📦 Module System & Project Structure

### ES Modules Enforcement

**CRITICAL:** This project uses ES Modules (`"type": "module"` in package.json). CommonJS is NOT allowed.

```javascript
// ✅ CORRECT - ES Module syntax
import express from 'express';
import { RyuzuClone } from '../infrastructure/RyuzuClone.js';
export class BetaClone extends RyuzuClone { /* ... */ }
export default BetaClone;
```

```javascript
// ❌ WRONG - CommonJS (causes deployment failures)
const express = require('express');
const { RyuzuClone } = require('../infrastructure/RyuzuClone.js');
module.exports = class BetaClone extends RyuzuClone { /* ... */ };
```

**File Extensions:** Always include `.js` in imports: `import { X } from './module.js'`

### Directory Structure

```
src/
├── clones/                      # 5 specialized AI clones
│   ├── omega/index.js           # Coordinator (port 3000)
│   ├── beta/index.js            # Analyzer (port 3002)
│   ├── gamma/index.js           # Architect (port 3003)
│   ├── delta/index.js           # Tester (port 3004)
│   └── sigma/index.js           # Communicator (port 3005)
├── infrastructure/              # Core shared systems
│   ├── integrity/               # IntegrityMonitor - NO SIMULATIONS enforcement
│   ├── evidence/                # EvidenceCollector - Audit trail generation
│   ├── artifacts/               # ArtifactManager - SHA-256 checksum storage
│   ├── context/                 # ContextEngineer - Quality scoring (0-100)
│   └── autogen/                 # AutoGenClient - Real AI execution wrapper
├── mcp/                         # Model Context Protocol integration
│   ├── server/                  # MCP server (STDIO transport)
│   └── tools/                   # 9 standardized MCP tools
└── protocols/                   # Inter-clone communication protocols

test/
├── unit/                        # Component tests (90%+ coverage target)
├── integration/                 # Multi-component workflows
└── e2e/                         # Full system end-to-end tests

docker/                          # Docker configurations per clone
├── omega/, beta/, gamma/, delta/, sigma/
```

**Navigation Tips:**
- Need to understand integrity enforcement? → `src/infrastructure/integrity/`
- Adding a new clone capability? → Start in `src/clones/{clone}/`
- Modifying artifact storage? → `src/infrastructure/artifacts/`
- Testing a workflow? → `test/integration/`

---

## 🛠️ Core Development Patterns

### 1. Base Clone Architecture

All clones extend `RyuzuClone` base class with integrity built-in:

```javascript
import { RyuzuClone } from '../infrastructure/RyuzuClone.js';

export class BetaClone extends RyuzuClone {
  constructor() {
    super({
      role: 'Beta',
      specialization: 'Code analysis, debugging, security review',
      port: process.env.PORT || 3001,  // ✅ ALWAYS use environment variable
      systemPrompt: 'You are Beta, specializing in...'
    });
  }
  
  // Specialized methods
  async analyzeCode(code, context) {
    // Uses inherited: this.autoGenClient, this.evidenceCollector
    const response = await this.generateAgentResponse(
      `Analyze this code: ${code}`,
      context
    );
    
    // Store result as artifact
    const manifest = await this.artifactManager.storeArtifact(
      'analysis',
      response.content,
      { language: context.language }
    );
    
    return { response, manifest };
  }
}
```

**Key Pattern:** Inherit from base, specialize behavior, leverage shared infrastructure.

### 2. Artifact Storage with Checksums

**Every work product MUST be stored with SHA-256 verification:**

```javascript
// Store artifact
const manifest = await artifactManager.storeArtifact(
  'code',              // type: code | documentation | schema | configuration
  'class Auth {...}',  // content
  {                    // metadata
    description: 'JWT Authentication Service',
    language: 'JavaScript',
    version: '1.0.0'
  }
);

// manifest contains:
// - artifactId: UUID
// - checksum: SHA-256 hash
// - location: file:///tmp/sanctuary-workspace/artifacts/...
// - timestamp, size, metadata

// Retrieve artifact (with automatic checksum verification)
const { manifest, content } = await artifactManager.retrieveArtifact(
  manifest.artifactId
);
// Throws error if checksum mismatch (corruption detected)
```

**Storage Location:** `/tmp/sanctuary-workspace/artifacts/` (Docker volume)  
**Manifests:** `/tmp/sanctuary-workspace/manifests/` (lightweight refs <1KB)

### 3. Context Engineering (Quality Scoring)

**Omega-specific pattern for inter-clone communication:**

```javascript
const contextPackage = contextEngineer.constructContextPackage({
  objective: 'Analyze payment module security vulnerabilities', // 5-20 words optimal
  targetClone: 'beta',
  artifactManifests: [{ artifactId, type, checksum }], // Lightweight refs
  essentialData: {
    framework: 'Express.js',
    compliance: 'PCI DSS'
  },
  constraints: ['Production environment', 'Zero-downtime']
});

// contextPackage.quality contains:
// - objectiveClarity: 0-100 (how well-defined is the goal?)
// - dataRelevance: 0-100 (is data sanitized and relevant?)
// - artifactUtilization: 0-100 (are artifacts properly referenced?)
// - overallQuality: 0-100 (average)

if (contextPackage.quality.overallQuality < 60) {
  console.warn('⚠️ Low context quality'); // Warning threshold
}

if (contextPackage.quality.overallQuality < 40) {
  throw new Error('Context quality too low'); // Block threshold
}
```

**Why?** Prevents context overload. Initial implementation had clones passing full artifacts; this uses lightweight manifests with quality validation.

### 4. Evidence Collection Pattern

**Every operation generates audit trail:**

```javascript
const evidence = evidenceCollector.record({
  taskId: 'task-uuid',
  traceId: 'trace-12345',
  execution: 'real',                           // ← Required marker
  executionTime: 287,                          // milliseconds
  autoGenModel: 'claude-3-5-sonnet-20241022',
  checksumVerified: true,
  metrics: {
    promptTokens: 150,
    completionTokens: 450,
    totalTokens: 600
  }
});

// Writes to: /tmp/sanctuary-workspace/audit/{date}-audit.log
// Daily rotation, 30-day retention
```

**When to call:**
- After every AI execution
- After artifact storage/retrieval
- After context package construction
- After task orchestration

---

## 🧪 Testing Requirements

### Coverage Targets

| Module Type | Coverage Target | Enforcement |
|-------------|-----------------|-------------|
| **Core Infrastructure** | 90%+ | Quality gate blocks deployment |
| **Clone Implementations** | 80%+ | Required before production |
| **Overall Project** | 80%+ | CI/CD requirement |

### Test Structure Template

```javascript
// test/unit/infrastructure/test-artifact-manager.js
import { describe, it, beforeEach } from 'mocha';
import { assert } from 'chai';
import ArtifactManager from '../../../src/infrastructure/artifacts/ArtifactManager.js';

describe('ArtifactManager', () => {
  let artifactManager;
  
  beforeEach(() => {
    artifactManager = new ArtifactManager();
  });
  
  describe('storeArtifact()', () => {
    it('should store artifact with SHA-256 checksum', async () => {
      const manifest = await artifactManager.storeArtifact(
        'code',
        'class Test {}',
        { description: 'Test' }
      );
      
      assert.exists(manifest.checksum);
      assert.equal(manifest.checksum.length, 64); // SHA-256 length
      
      // ✅ Evidence verification (NO SIMULATIONS enforcement)
      const evidence = evidenceCollector.getLastRecord();
      assert.equal(evidence.operation, 'artifact_stored');
    });
    
    it('should throw on checksum mismatch', async () => {
      const manifest = await artifactManager.storeArtifact('code', 'test');
      
      // Simulate corruption
      await corruptArtifactFile(manifest.artifactId);
      
      await assert.rejects(
        () => artifactManager.retrieveArtifact(manifest.artifactId),
        /Checksum mismatch/
      );
    });
  });
});
```

### Running Tests

```powershell
# All tests with coverage
npm test                      # c8 mocha 'test/**/*.test.js'

# Specific test suites
npm run test:unit            # Unit tests only
npm run test:integration     # Integration tests only
npm run test:e2e             # End-to-end tests

# Coverage report
npm run test:coverage        # HTML report in coverage/

# Watch mode (development)
npm run test:watch
```

**Before committing:** Ensure `npm test` passes with 80%+ coverage.

---

## 🐳 Docker Development Workflow

### Quick Start Commands

```powershell
# Build all containers
docker-compose build

# Start entire network
docker-compose up -d

# Check health
docker-compose ps
curl http://localhost:3000/health  # Omega
curl http://localhost:3002/health  # Beta

# View logs
docker-compose logs -f omega
docker-compose logs -f beta

# Stop network
docker-compose down

# Rebuild single clone
docker-compose up -d --build beta
```

### Individual Clone Development

When working on a specific clone (e.g., Beta):

```powershell
# Build just Beta
docker build -f docker/Dockerfile.beta -t ryuzu-beta:latest src/

# Run Beta standalone
docker run -d `
  --name ryuzu-beta-test `
  -p 3002:3001 `
  -e ANTHROPIC_API_KEY=$env:ANTHROPIC_API_KEY `
  -v sanctuary-workspace:/tmp/sanctuary-workspace `
  ryuzu-beta:latest

# Test Beta
curl http://localhost:3002/health

# Check logs
docker logs -f ryuzu-beta-test

# Stop and remove
docker stop ryuzu-beta-test
docker rm ryuzu-beta-test
```

### Health Check Pattern

**All Dockerfiles include:**

```dockerfile
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3001/health || exit 1
```

**What this means:**
- Every 30 seconds, Docker checks `/health` endpoint
- Clone has 5 seconds grace period on startup
- After 3 failed checks, container marked unhealthy → auto-restart

**Expected health response:**

```json
{
  "status": "active",
  "role": "Beta",
  "specialization": "Code analysis, debugging, security review",
  "timestamp": "2025-10-23T14:30:00.000Z",
  "integrity": {
    "autoGenConnected": true,
    "evidenceCollectorActive": true,
    "artifactManagerInitialized": true
  },
  "metrics": {
    "uptime": 3600,
    "tasksProcessed": 47,
    "averageResponseTime": 312
  }
}
```

---

## 🔌 API Design Patterns

### Standard Clone Endpoints

All clones implement these:

```javascript
// GET /health - Health check (required for Docker)
app.get('/health', (req, res) => {
  res.json({
    status: 'active',
    role: this.role,
    specialization: this.specialization,
    timestamp: new Date().toISOString(),
    integrity: {
      autoGenConnected: this.autoGenClient.isConnected(),
      evidenceCollectorActive: this.evidenceCollector.isActive(),
      artifactManagerInitialized: this.artifactManager.isInitialized()
    },
    metrics: this.getMetrics()
  });
});

// POST /task - Execute specialized task
app.post('/task', async (req, res) => {
  const { prompt, context, sessionId, requireEvidence } = req.body;
  
  try {
    // Real AI execution (NO SIMULATIONS)
    const response = await this.generateAgentResponse(prompt, context);
    
    // Collect evidence
    const evidence = this.evidenceCollector.record({
      taskId: sessionId,
      execution: 'real',
      executionTime: response.metadata.executionTime,
      autoGenModel: response.metadata.model
    });
    
    res.json({
      success: true,
      execution: 'real',
      messages: response.messages,
      sessionId,
      clone: this.role,
      evidence: requireEvidence ? evidence : undefined
    });
  } catch (error) {
    this.evidenceCollector.record({
      execution: 'failed',
      error: error.message
    });
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /artifacts - Store work product
app.post('/artifacts', async (req, res) => {
  const { type, content, metadata } = req.body;
  const manifest = await this.artifactManager.storeArtifact(type, content, metadata);
  res.status(201).json({ success: true, manifest });
});

// GET /artifacts/:id - Retrieve artifact
app.get('/artifacts/:id', async (req, res) => {
  const manifestOnly = req.query.manifestOnly === 'true';
  const result = await this.artifactManager.retrieveArtifact(
    req.params.id,
    { manifestOnly }
  );
  res.json(result);
});
```

### Omega-Specific Endpoints

```javascript
// POST /orchestrate - Multi-clone coordination
app.post('/orchestrate', async (req, res) => {
  const { objective, targetClone, artifactManifests, essentialData, sessionId } = req.body;
  
  // Construct high-quality context package
  const contextPackage = this.contextEngineer.constructContextPackage({
    objective,
    targetClone,
    artifactManifests,
    essentialData
  });
  
  // Delegate to target clone
  const result = await this.delegateTask(targetClone, {
    prompt: objective,
    context: contextPackage,
    sessionId
  });
  
  res.json({
    success: true,
    result,
    contextPackage: {
      quality: contextPackage.quality
    },
    orchestration: {
      taskId: sessionId,
      startTime: result.metadata.startTime,
      endTime: result.metadata.endTime,
      duration: result.metadata.duration
    }
  });
});
```

---

## 🔗 MCP Integration (Model Context Protocol)

### Available MCP Tools

When user interacts via Claude Desktop/Code, these tools are available:

| Tool Name | Purpose | Target Clone |
|-----------|---------|--------------|
| `sanctuary_health_check` | Network status | All |
| `sanctuary_beta_analyze` | Code analysis & security | Beta |
| `sanctuary_gamma_design` | Architecture & design | Gamma |
| `sanctuary_delta_test` | Testing & QA | Delta |
| `sanctuary_sigma_document` | Documentation | Sigma |
| `sanctuary_omega_orchestrate` | Multi-clone workflows | Omega |
| `sanctuary_store_artifact` | Store work products | Any |
| `sanctuary_get_artifact` | Retrieve artifacts | Any |

### MCP Tool Implementation Pattern

```javascript
// src/mcp/tools/beta-analyze.js
export const betaAnalyzeTool = {
  name: 'sanctuary_beta_analyze',
  description: 'Analyze code for security, bugs, and quality issues using Beta clone',
  inputSchema: {
    type: 'object',
    properties: {
      code: { type: 'string', description: 'Code to analyze' },
      language: { type: 'string', description: 'Programming language' },
      context: { type: 'string', description: 'Additional context' }
    },
    required: ['code']
  },
  
  async execute({ code, language, context }) {
    // Route through Omega for context engineering
    const response = await fetch('http://localhost:3000/orchestrate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        objective: `Analyze this ${language || 'code'} for security and quality issues`,
        targetClone: 'beta',
        essentialData: { code, language, context },
        sessionId: crypto.randomUUID()
      })
    });
    
    const result = await response.json();
    
    return {
      content: [{
        type: 'text',
        text: result.result.messages[0].content
      }],
      isError: !result.success
    };
  }
};
```

---

## 🚨 Common Pitfalls & Solutions

### 1. Hard-Coded Port Numbers

**Problem:** Using hard-coded ports (e.g., `app.listen(3000)`) breaks Docker deployment  
**Solution:** Always use `process.env.PORT || 3001` for internal clone port  
**Verify:** Search codebase for `listen(3` or `.listen(30` patterns

**Correct Pattern:**
```javascript
// ✅ CORRECT - Environment variable with fallback
const port = process.env.PORT || 3001;
app.listen(port, () => console.log(`Listening on ${port}`));

// ❌ WRONG - Hard-coded port
app.listen(3000, () => { /* ... */ });
```

### 2. CommonJS vs ES Modules

**Problem:** `require()` in code causes deployment failure  
**Solution:** Always use `import/export`, include `.js` extensions  
**Verify:** Check `package.json` has `"type": "module"`

### 2. Mock Responses (NO SIMULATIONS Violation)

**Problem:** Fallback to template responses when AI fails  
**Solution:** Throw error, record evidence as `execution: 'failed'`  
**Verify:** Search codebase for `Mock`, `Fallback`, `Template` in catch blocks

### 3. Missing Checksums

**Problem:** Artifacts stored without integrity verification  
**Solution:** Always use `artifactManager.storeArtifact()`, never direct file writes  
**Verify:** All artifact operations go through ArtifactManager

### 4. Context Overload

**Problem:** Passing full artifacts between clones (slow, inefficient)  
**Solution:** Use `artifactManifests` (lightweight refs <1KB) in context packages  
**Verify:** Context packages use manifests, not full content

### 5. Port Conflicts

**Problem:** Docker fails to start because external ports 3000-3005 already in use  
**Solution:** 
1. Check running services: `netstat -an | findstr ":300[0-5]"`
2. Verify Docker port mapping in `docker-compose.yml`
3. Remember: Internal port is always 3001 (via `process.env.PORT`), external ports are mapped by Docker

**Standard allocation (External → Internal):**
- Omega: 3000→3001
- Beta: 3002→3001  
- Gamma: 3003→3001
- Delta: 3004→3001
- Sigma: 3005→3001

---

## 📝 Code Review Checklist

Before submitting PR or committing significant changes:

**NO SIMULATIONS Enforcement:**
- [ ] All AI responses use real AutoGen execution
- [ ] No mock/fallback responses in catch blocks
- [ ] Evidence collected with `execution: 'real'` or `'failed'` marker
- [ ] Audit trail generated for all operations

**Architecture Compliance:**
- [ ] ES Module syntax (`import/export`, not `require`)
- [ ] File extensions included in imports (`.js`)
- [ ] Clones extend `RyuzuClone` base class
- [ ] Artifacts use SHA-256 checksum verification
- [ ] Context packages include quality scoring

**Testing Requirements:**
- [ ] Unit tests added for new functionality
- [ ] Integration tests if multi-component
- [ ] `npm test` passes with 80%+ coverage
- [ ] Evidence verification in tests

**Docker Configuration:**
- [ ] Health check endpoint implemented
- [ ] Port allocation follows standard (3000-3005)
- [ ] Environment variables documented
- [ ] Dockerfile builds successfully

**Documentation:**
- [ ] Code comments explain "why", not "what"
- [ ] API endpoints documented if changed
- [ ] README updated if user-facing changes

---

## 🎯 Quick Reference

### Essential Commands

```powershell
# Testing
npm test                    # All tests with coverage
npm run test:unit          # Unit tests only
npm run test:integration   # Integration tests

# Docker
docker-compose up -d       # Start network
docker-compose ps          # Check status
docker-compose logs -f     # View logs
docker-compose down        # Stop network

# Health Checks
curl http://localhost:3000/health  # Omega
curl http://localhost:3002/health  # Beta
curl http://localhost:3003/health  # Gamma
curl http://localhost:3004/health  # Delta
curl http://localhost:3005/health  # Sigma

# Development
npm install                # Install dependencies
npm run lint              # Linting (when configured)
```

### Key File Locations

| Need to... | Check... |
|------------|----------|
| Understand NO SIMULATIONS enforcement | `src/infrastructure/integrity/IntegrityMonitor.js` |
| See evidence collection | `src/infrastructure/evidence/EvidenceCollector.js` |
| Modify artifact storage | `src/infrastructure/artifacts/ArtifactManager.js` |
| Update context quality scoring | `src/infrastructure/context/ContextEngineer.js` |
| Change base clone behavior | `src/infrastructure/RyuzuClone.js` |
| Add MCP tool | `src/mcp/tools/` |
| Configure Docker | `docker-compose.yml`, `docker/Dockerfile.*` |
| View architecture docs | `plan.md`, `docs/architecture/` |

### Emergency Troubleshooting

**Clone won't start:**
1. Check logs: `docker logs ryuzu-{clone}-sanctuary`
2. Verify port: `netstat -an | findstr ":300X"`
3. Check API key: `echo $env:ANTHROPIC_API_KEY`

**Health check failing:**
1. Test manually: `curl http://localhost:300X/health`
2. Check AutoGen connection in response
3. Review integrity monitor status

**Tests failing:**
1. Check ES Module syntax (no `require()`)
2. Verify evidence collection in tests
3. Ensure no mock responses (NO SIMULATIONS)

**High context quality warnings:**
1. Review objective clarity (5-20 words optimal)
2. Sanitize essential data (no nulls/empties)
3. Use artifact manifests, not full content

---

## 🌸 Project Philosophy

This project embodies **integrity-first architecture**. Every component, from IntegrityMonitor to EvidenceCollector, exists to ensure:

1. **100% Real Execution** - No simulations, no shortcuts
2. **Verifiable Outputs** - Every claim has audit trail
3. **Quality-Gated Communication** - Context packages scored 0-100
4. **Gentle, Dutiful Service** - Inspired by Ryuzu Meyer's character

When in doubt, ask: "Would Beatrice (Strategic Authority) approve this?" If there's any simulation, fabrication, or unverified claim - the answer is no.

---

**Last Updated:** October 23, 2025  
**Blueprint Phase:** Implementation in progress  
**Questions?** Reference `plan.md` for comprehensive architecture documentation.
