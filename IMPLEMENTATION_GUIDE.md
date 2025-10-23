# VoidCat-DSN v2.0 Implementation Guide

Quick reference for implementing the entire VoidCat-DSN v2.0 system from plan.md.

## 📋 What's Been Created

✅ **CLAUDE.md** - Codebase guidance for Claude Code (already created)
✅ **Implementation Plans** - 4 detailed, bite-sized phase plans
✅ **Plan README** - Master guide for all phases

## 🚀 Quick Start

### 1. Choose Your Execution Path

**Option A: Single Engineer, Sequential Tasks**
```bash
# Use executing-plans skill with subagent-driven approach
# One task at a time, fresh subagent per task, code review between tasks
# Duration: ~50-60 hours over 2-3 weeks
# Best for: Careful implementation, thorough testing
```

**Option B: Multiple Engineers, Parallel Tasks**
```bash
# Dispatch parallel subagents for independent tasks
# Review checkpoints after each phase
# Duration: ~15-20 hours across multiple engineers
# Best for: Fast iteration, distributed teams
```

**Option C: Hybrid Approach**
```bash
# Phases 0-1 sequential (foundation must be solid)
# Phases 2-3 partially parallel (clones can be built concurrently)
# Best for: Balance of speed and quality
```

### 2. Set Up Environment

```bash
# Install dependencies
npm install

# Set Anthropic API key
export ANTHROPIC_API_KEY="your-key-here"

# Create workspace directories
mkdir -p workspace/{artifacts,manifests,audit,temp}

# Optional: Set up git worktree for isolated work
git worktree add voidcat-impl
cd voidcat-impl
```

### 3. Start Implementation

```bash
# Read the master plan first (understand the big picture)
cat docs/plans/README.md

# Then start with Phase 0
# Use executing-plans skill to implement task by task
# File: docs/plans/2025-10-23-phase0-integrity-foundation.md
```

## 📚 Plan Files

All implementation plans are in `docs/plans/`:

| File | Phase | Duration | Tasks | Focus |
|------|-------|----------|-------|-------|
| `2025-10-23-phase0-integrity-foundation.md` | 0 | 8-12h | 5 | Foundation & integrity |
| `2025-10-23-phase1-core-infrastructure.md` | 1 | 8-12h | 5 | Artifact & context mgmt |
| `2025-10-23-phase2-clone-specialization.md` | 2 | 16-20h | 9 | All 5 clones + HTTP |
| `2025-10-23-phase3-mcp-deployment.md` | 3 | 12-16h | 8 | Docker, MCP, deploy |
| `README.md` | Summary | - | 27 | Master guide |

## ✅ Implementation Checklist

### Phase 0: Integrity-First Foundation
- [ ] IntegrityMonitor class ✓ [test + implementation + commit]
- [ ] EvidenceCollector class ✓ [test + implementation + commit]
- [ ] AutoGenClient wrapper ✓ [test + implementation + commit]
- [ ] TestFramework ✓ [test + implementation + commit]
- [ ] Phase 0 verification ✓ [coverage check + documentation]

### Phase 1: Core Infrastructure
- [ ] ArtifactManager ✓ [test + implementation + commit]
- [ ] ContextEngineer ✓ [test + implementation + commit]
- [ ] RyuzuClone base class ✓ [test + implementation + commit]
- [ ] Workspace structure ✓ [directory setup + config]
- [ ] Phase 1 integration ✓ [integration tests + documentation]

### Phase 2: Clone Specialization
- [ ] Beta Clone (Analyzer) ✓ [test + implementation + commit]
- [ ] Gamma Clone (Architect) ✓ [test + implementation + commit]
- [ ] Delta Clone (Tester) ✓ [test + implementation + commit]
- [ ] Sigma Clone (Communicator) ✓ [test + implementation + commit]
- [ ] Omega Clone (Coordinator) ✓ [test + implementation + commit]
- [ ] Express HTTP servers ✓ [routes + middleware + commit]
- [ ] SanctuaryMessageProtocol ✓ [inter-clone communication]
- [ ] Integration tests ✓ [clone communication tests]
- [ ] Phase 2 verification ✓ [health checks + documentation]

### Phase 3: Docker & Deployment
- [ ] Dockerfile ✓ [standardized, all clones]
- [ ] docker-compose.yml ✓ [5 clones, health checks]
- [ ] Health check script ✓ [monitoring + validation]
- [ ] MCP Server ✓ [9 tools, stdio transport]
- [ ] Deployment scripts ✓ [deploy.sh + validate]
- [ ] E2E tests ✓ [deployment verification]
- [ ] Documentation ✓ [DEPLOYMENT.md, MCP_SETUP.md]
- [ ] Phase 3 verification ✓ [full deployment test]

## 🧪 Testing Strategy

Each plan uses Test-Driven Development (TDD):

```
1. Write failing test (red)
2. Run test to confirm failure
3. Write minimal implementation (green)
4. Run test to confirm pass
5. Commit (small, focused commit)
6. Repeat for next feature
```

Run tests at each phase:

```bash
# After Phase 0
npm test -- test/unit/infrastructure/

# After Phase 1
npm test -- test/unit/infrastructure/
npm run test:integration

# After Phase 2
npm test
npm run test:integration

# After Phase 3
npm test
npm run test:integration
npm run test:e2e
npm run health-check
```

## 🐳 Docker Deployment

After Phase 3 is complete:

```bash
# Build all containers
docker-compose build

# Start network
docker-compose up -d

# Verify health
npm run health-check

# View logs
docker-compose logs -f

# Stop network
docker-compose down
```

## 🔗 MCP Integration

After Phase 3:

```bash
# 1. Update Claude Desktop config
# Add to ~/.claude_desktop_config.json:
{
  "mcpServers": {
    "sanctuary": {
      "command": "node",
      "args": ["/path/to/voidcat-dsn/src/mcp/server.js"]
    }
  }
}

# 2. Restart Claude Desktop

# 3. Use MCP tools in Claude Desktop:
# - @sanctuary_beta_analyze
# - @sanctuary_gamma_design
# - @sanctuary_delta_test
# - @sanctuary_sigma_document
# - @sanctuary_omega_status
# - @sanctuary_omega_delegate
# - @sanctuary_artifacts_list
# - @sanctuary_artifacts_retrieve
# - @sanctuary_audit_log
```

## 📊 Success Metrics

### Code Quality
- ✅ All 159+ tests passing
- ✅ 95%+ test pass rate
- ✅ >90% code coverage
- ✅ Zero NO SIMULATIONS LAW violations
- ✅ All Codacy issues addressed

### System Health
- ✅ All 5 clones running
- ✅ Health checks passing
- ✅ Auto-recovery working
- ✅ Artifact storage operational
- ✅ Audit trails generated

### Functionality
- ✅ Inter-clone communication working
- ✅ MCP tools callable from Claude Desktop
- ✅ Task delegation successful
- ✅ Evidence collection operational
- ✅ Artifact integrity verified

## 🔧 Common Commands

```bash
# Development
npm install              # Install dependencies
npm test                # Run all tests with coverage
npm run test:watch      # Watch mode for development
npm run test:coverage   # HTML coverage report

# Linting (once configured)
npm run lint            # Run code quality checks

# Docker
docker-compose build    # Build all images
docker-compose up -d    # Start network
docker-compose down     # Stop network
docker-compose logs -f  # Stream logs

# Health & Status
npm run health-check    # Check all clones
curl http://localhost:3000/health  # Check Omega
curl http://localhost:3001/health  # Check Beta
# ... etc for other clones

# Cleanup
rm -rf workspace/*      # Clear workspace artifacts
docker system prune      # Clean up Docker
```

## 📖 Documentation Structure

```
docs/
├── plans/
│   ├── README.md                           # Master implementation guide
│   ├── 2025-10-23-phase0-*.md             # Phase 0 detailed plan
│   ├── 2025-10-23-phase1-*.md             # Phase 1 detailed plan
│   ├── 2025-10-23-phase2-*.md             # Phase 2 detailed plan
│   └── 2025-10-23-phase3-*.md             # Phase 3 detailed plan
├── CLAUDE.md                               # Claude Code guidance
├── DEPLOYMENT.md                           # Deployment procedures
├── MCP_SETUP.md                           # MCP configuration
└── TROUBLESHOOTING.md                     # Debugging guide
```

## ⚠️ Critical Requirements

### NO SIMULATIONS LAW
- Every AI query must use real Anthropic API
- Zero mock responses or fallback simulations
- AutoGenClient enforces this via throwing errors

### Integrity Verification
- All artifacts have SHA-256 checksums
- Audit trails use chain checksums
- NO SIMULATIONS LAW violations detected in tests

### Test Coverage
- Every component tested with >90% coverage
- Evidence collection in test framework
- All tests passing before moving to next phase

## 🆘 Troubleshooting

### Port Already in Use
```bash
# Check what's using the port
lsof -i :3000

# Kill the process
kill -9 <PID>

# Or change port in docker-compose.yml
```

### API Key Issues
```bash
# Verify key is set
echo $ANTHROPIC_API_KEY

# Set if not present
export ANTHROPIC_API_KEY="sk-..."

# Pass to docker-compose
docker-compose up -d --env ANTHROPIC_API_KEY=$ANTHROPIC_API_KEY
```

### Test Failures
```bash
# Run single test with verbose output
npm test -- test/path/to/test.js -v

# Run with grep filter
npm test -- --grep "specific test name"

# Check coverage report
npm run test:coverage
# Open coverage/index.html in browser
```

### Docker Build Issues
```bash
# Remove old images
docker image prune -a

# Rebuild from scratch
docker-compose build --no-cache

# Check build logs
docker build -f docker/Dockerfile -t voidcat:debug .
```

## 📞 Key Contacts/Resources

- **Architecture Details:** See `plan.md` (1,847 lines of comprehensive design)
- **Codebase Structure:** See `CLAUDE.md`
- **Implementation Help:** Read the specific phase plan file
- **Deployment Issues:** See `DEPLOYMENT.md` (created in Phase 3)
- **MCP Integration:** See `MCP_SETUP.md` (created in Phase 3)

## 🎯 Next Steps

1. **Read CLAUDE.md** (5 min) - Understand codebase structure
2. **Read docs/plans/README.md** (10 min) - Master implementation guide
3. **Start Phase 0** (8-12 hours) - Integrity foundation
4. **Progress through Phases 1-3** following the plans

---

**Total Effort:** 44-60 hours
**Timeline:** 9 weeks (4 phases, 2-3 weeks each)
**Team Size:** 1-3 engineers

Good luck! The plans are designed to be followed step-by-step with automated code review gates. Trust the process, write great tests, and ship small commits.

🏰 *Built with lessons learned, designed for excellence, inspired by Ryuzu Meyer* 🌸
