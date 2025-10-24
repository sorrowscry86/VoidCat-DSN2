---
description: Repository Information Overview
alwaysApply: true
---

# VoidCat-DSN v2.0 Information

## Summary
VoidCat-DSN v2.0 is a distributed AI clone coordination system featuring five specialized Claude AI instances running in Docker containers. The system implements an integrity-first architecture with artifact-centric workflows, context-engineered communication, and built-in audit trails.

## Structure
- **src/clones/**: Five specialized AI clones (Omega, Beta, Gamma, Delta, Sigma)
- **src/infrastructure/**: Shared infrastructure components (integrity, evidence, artifacts)
- **src/mcp/**: Model Context Protocol integration for Claude Desktop/Code
- **test/**: Unit, integration, and end-to-end tests
- **docker/**: Docker configuration files for each clone
- **scripts/**: Deployment and health check utilities

## Language & Runtime
**Language**: JavaScript (ES Modules)
**Version**: Node.js >=18.0.0, npm >=9.0.0
**Build System**: npm
**Package Manager**: npm

## Dependencies
**Main Dependencies**:
- express: ^4.18.2 (HTTP server framework)
- @anthropic-ai/sdk: ^0.27.0 (Claude API client)
- @modelcontextprotocol/sdk: ^1.0.0 (MCP integration)
- axios: ^1.6.0 (HTTP client for inter-clone communication)
- uuid: ^9.0.0 (Unique ID generation)
- winston: ^3.11.0 (Structured logging)

**Development Dependencies**:
- c8: ^8.0.0 (Code coverage)
- mocha: ^10.2.0 (Testing framework)
- chai: ^4.3.7 (Assertion library)
- supertest: ^6.3.3 (HTTP testing)

## Build & Installation
```bash
# Install dependencies
npm install

# Run tests
npm test
npm run test:unit
npm run test:integration
npm run test:e2e

# Start individual clones
npm run start:omega
npm run start:beta
npm run start:gamma
npm run start:delta
npm run start:sigma
```

## Docker
**Dockerfiles**: docker/Dockerfile.{omega,beta,gamma,delta,sigma}
**Image**: Node.js 18 slim
**Configuration**: 
- All clones use internal port 3001, mapped to unique external ports (3000, 3002-3005)
- Shared volume for artifact storage: sanctuary-workspace
- Health checks every 30 seconds
- Environment variables: PORT, ANTHROPIC_API_KEY, NODE_ENV

**Docker Commands**:
```bash
# Build and start all containers
npm run docker:build
npm run docker:up

# Check logs and status
npm run docker:logs
npm run health-check

# Stop containers
npm run docker:down
```

## Main Components

### Clones Architecture
The system is built around five specialized AI clones, each extending the RyuzuClone base class:

| Clone | Port | Role | Specialization |
|-------|------|------|----------------|
| Omega | 3000 | Coordinator | Task orchestration, context engineering |
| Beta | 3002 | Analyzer | Code analysis, debugging, security review |
| Gamma | 3003 | Architect | System design, architecture planning |
| Delta | 3004 | Tester | Testing strategies, QA, test generation |
| Sigma | 3005 | Communicator | Documentation, communication |

### Core Infrastructure
- **IntegrityMonitor**: Enforces NO SIMULATIONS LAW
- **EvidenceCollector**: Generates audit trails for all operations
- **ArtifactManager**: Stores work products with SHA-256 checksums
- **ContextEngineer**: Quality-scores inter-clone communication (0-100)
- **AutoGenClient**: Real AI execution via Anthropic's API

## Testing
**Framework**: Mocha + Chai
**Test Location**: test/unit/, test/integration/, test/e2e/
**Naming Convention**: test-*.test.js
**Configuration**: c8 for code coverage
**Run Command**:
```bash
npm test
```

## Key Architectural Patterns
1. **NO SIMULATIONS LAW**: All operations use real AI execution with audit trails
2. **Artifact-Centric Workflow**: All work products stored with SHA-256 checksums
3. **Context Engineering**: Inter-clone messages scored 0-100 for quality
4. **Health Monitoring**: Each clone includes a health endpoint with auto-recovery
5. **Evidence Collection**: Every operation generates audit trail entries