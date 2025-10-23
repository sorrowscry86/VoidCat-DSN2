# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**VoidCat-DSN v2.0: "Rebuilt from Wisdom"**

A distributed AI coordination system featuring five specialized Claude AI instances (Omega-Coordinator, Beta-Analyzer, Gamma-Architect, Delta-Tester, Sigma-Communicator) running in Docker containers with artifact-centric workflows, context-engineered communication, and built-in integrity monitoring.

- **Version**: 2.0.0
- **Status**: Blueprint - Ready for Implementation
- **Type**: Node.js ES Modules (ES2022+)
- **Runtime**: Node.js >=18.0.0

## Core Principles

1. **NO SIMULATIONS LAW**: 100% real AI execution with audit trails, zero mock fallbacks
2. **Integrity-First Architecture**: Every component includes verification from inception
3. **Artifact-Centric Workflow**: Version-controlled work products with SHA-256 checksums
4. **Context Engineering**: Quality-scored inter-clone communication (0-100 metrics)
5. **Test-First Development**: Comprehensive test suite with evidence collection built-in

## Common Commands

### Setup & Dependencies
```bash
npm install                    # Install all dependencies
npm list                       # View installed packages
```

### Testing
```bash
npm test                       # Run all tests with coverage (unit + integration)
npm run test:unit              # Run unit tests only
npm run test:integration       # Run integration tests only
npm run test:e2e               # Run end-to-end tests (no coverage)
npm run test:watch             # Run tests in watch mode
npm run test:coverage          # Generate HTML coverage report
```

### Development & Execution
```bash
# All clones use PORT environment variable (defaults to 3001 internally)
npm run start:omega            # Start Omega clone (Coordinator, internal 3001)
npm run start:beta             # Start Beta clone (Analyzer, internal 3001)
npm run start:gamma            # Start Gamma clone (Architect, internal 3001)
npm run start:delta            # Start Delta clone (Tester, internal 3001)
npm run start:sigma            # Start Sigma clone (Communicator, internal 3001)

# Override port if needed (for local testing):
# PORT=3010 npm run start:beta
```

### Docker Operations
```bash
npm run docker:build           # Build all containers
npm run docker:up              # Start network in background
npm run docker:down            # Stop and remove containers
npm run docker:logs            # Stream logs from all containers
npm run docker:restart         # Restart all containers
```

### Health & Monitoring
```bash
npm run health-check           # Verify all clones are operational
```

## Architecture Overview

### Five Specialized Clones

The system is built around five distinct AI clones, each with a specialized role:

| Clone | External Port | Internal Port | Role | Primary Function |
|-------|---------------|---------------|------|------------------|
| Omega | 3000 | 3001 | Coordinator | Task delegation, orchestration, global health monitoring |
| Beta | 3002 | 3001 | Analyzer | Code analysis, security review, vulnerability assessment |
| Gamma | 3003 | 3001 | Architect | System design, refactoring proposals, architecture planning |
| Delta | 3004 | 3001 | Tester | Test strategy, test implementation, quality assurance |
| Sigma | 3005 | 3001 | Communicator | Documentation, communication coordination, context engineering |

**Note**: All clones use `process.env.PORT || 3001` internally. Docker maps internal 3001 to unique external ports.

### Core Infrastructure

**Key Components** (in `src/`):
- `src/clones/` - Individual clone implementations (omega, beta, gamma, delta, sigma)
- `src/infrastructure/` - Shared infrastructure (health monitoring, artifact management, evidence collection)
- `src/mcp/` - Model Context Protocol integration with Claude Desktop/Code
- `src/protocols/` - Communication protocols and context engineering

**Storage & Artifacts**:
- `/tmp/sanctuary-workspace/` - Runtime workspace volume
- `artifacts/` - Version-controlled work products with SHA-256 checksums
- `manifests/` - Operational manifests
- `audit/` - Audit logs with structured JSON logging (Winston)

### Tech Stack

**Runtime**: Node.js 18+ with ES Modules
**Framework**: Express.js for HTTP APIs
**AI**: Anthropic Claude API via AutoGen SDK
**Testing**: Mocha + Chai + c8 (code coverage)
**Integration**: Model Context Protocol (MCP) for Claude Desktop/Code

**Key Dependencies**:
- `@anthropic-ai/autogen-core` - AutoGen framework for real AI execution
- `@anthropic-ai/autogen-ext` - AutoGen extensions
- `@anthropic-ai/claude-code` - Claude Code SDK integration
- `express` - HTTP server framework
- `axios` - HTTP client for inter-clone communication
- `uuid` - Unique ID generation for artifacts
- `winston` - Structured logging

## Special Codacy Integration Rules

After **any file edits** or **dependency changes**:

1. **File Edits**: Must run `codacy_cli_analyze` tool from Codacy's MCP Server for each edited file
   - Example: After editing `src/clones/beta/index.js`, analyze it with Codacy

2. **Dependency Changes**: Must run `codacy_cli_analyze` with `tool: "trivy"` immediately after:
   - `npm install`
   - Adding/removing packages from `package.json`
   - Updating any dependencies

3. **If Security Vulnerabilities Found**: Stop work and fix security issues before continuing

This is a **CRITICAL** requirement per `.cursor/rules/codacy.mdc`. See that file for detailed rules.

## Key Architectural Patterns

### Clone-to-Clone Communication
Clones communicate via HTTP REST APIs. The Omega clone acts as the primary coordinator, delegating tasks to specialized clones based on the task nature.

**Pattern**:
```
User/MCP → Omega (3000) → [Delegates to] → Beta/Gamma/Delta/Sigma
     ↓
Artifact Storage + Audit Logs + Evidence Collection
```

### Context Engineering
Each inter-clone message is scored 0-100 for quality before dispatch. Quality gates block context packages scoring <40. Sigma (Communicator) is responsible for optimizing context quality.

### Artifact Management
All significant work products are stored as versioned artifacts with SHA-256 checksums. This enables:
- Full audit trails
- Integrity verification
- Evidence-based documentation
- Task reproducibility

### Health Monitoring
Each clone includes a health endpoint that reports:
- Operational status
- AI execution capability (AutoGen client connected)
- Last heartbeat timestamp
- Service dependencies

30-second health check intervals with auto-recovery for failed containers.

## Testing Strategy

### Test Organization
- `test/unit/` - Unit tests for individual functions/modules
- `test/integration/` - Integration tests for clone interactions
- `test/e2e/` - End-to-end tests for complete workflows

### Coverage Targets
- Core functionality: >90% coverage
- Overall test pass rate: 95%+
- E2E scenarios: All critical workflows covered

### Running Specific Tests
```bash
# Single test file
mocha test/unit/clones/beta.test.js

# Tests matching a pattern
mocha test/**/*.test.js --grep "health-check"

# With coverage
c8 mocha test/unit/**/*.test.js
```

## Important Notes

### No Mock Fallbacks
The NO SIMULATIONS LAW is fundamental. Every operation must use real AI execution via Anthropic's API. Never add mock responses or fallback simulations.

### ES Modules Only
This project uses `"type": "module"` in package.json. Use ES6 import/export syntax exclusively. No CommonJS require() statements.

### Docker Dependency
All clones are designed to run in Docker containers. Local development can run individual clones directly with `npm run start:*`, but production deployment uses Docker Compose.

### Port Allocation
**CRITICAL**: Always use environment variables for ports, never hard-code port numbers.

Standard port mapping (external → internal):
- Omega: `3000 → 3001` (use `process.env.PORT` or `3001` internally)
- Beta: `3002 → 3001` (use `process.env.PORT` or `3001` internally)
- Gamma: `3003 → 3001` (use `process.env.PORT` or `3001` internally)
- Delta: `3004 → 3001` (use `process.env.PORT` or `3001` internally)
- Sigma: `3005 → 3001` (use `process.env.PORT` or `3001` internally)

**Pattern**: All clones listen on internal port `3001`, Docker maps to unique external ports.

**Code Pattern**:
```javascript
// ✅ CORRECT - Use environment variable
const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`${this.role} clone listening on port ${port}`);
});

// ❌ WRONG - Hard-coded port
app.listen(3000, () => { /* ... */ });
```

### Anthropic API Key
Required for real AI execution. Set via environment variable: `ANTHROPIC_API_KEY`

## Development Workflow

1. **Understand the Architecture**: Read through `plan.md` for comprehensive context on design philosophy
2. **Identify Clone Responsibilities**: Determine which clone(s) are affected by changes
3. **Write Tests First**: Add tests before implementing features
4. **Implement with Artifacts**: Store significant work products as versioned artifacts
5. **Collect Evidence**: Log outcomes and decisions in audit trails
6. **Run Codacy Analysis**: After every edit, verify code quality and security
7. **Verify Health**: Test inter-clone communication and overall system health

## References

- **plan.md** - Complete architectural blueprint (1847 lines, read first for deep understanding)
- **.cursor/rules/codacy.mdc** - Critical Codacy integration rules (must follow)
- **.github/instructions/codacy.instructions.md** - GitHub Copilot Codacy instructions
- **package.json** - All dependencies and npm scripts defined here
- **docker/** - Docker configuration for each clone

## Personality & Cultural Guidelines

All clones follow the gentle, dutiful personality inspired by Ryuzu Meyer from Re:Zero. This means:

- Helpful and thorough in all responses
- Collaborative approach to multi-clone tasks
- Respectful and courteous tone
- Dedicated to specialization and excellence
- Organized, methodical approach

**Forbidden**: Mock responses, dismissive tone, claiming uncovered capabilities, skipping evidence, ignoring quality gates.
