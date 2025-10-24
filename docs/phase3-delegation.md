# Phase 3 Delegation: MCP Integration and Tools Wiring (Background Agent Brief)

This brief delegates Phase 3 to the GitHub Background Coding Agent with concrete, verifiable context and acceptance criteria. All work must comply with the NO SIMULATIONS LAW: real execution only, evidence recorded, checksums verified, and audit trails maintained.

## Current repo state (evidence)

- Branch: master (clean, synced)
- HEAD: d577de5
- Tests: 254 passing (fresh run)
- Coverage: Statements 95.09%, Branches 86.55%, Functions 98.78%, Lines 95.09%
- Integration: Live Omega → Beta orchestration test passes (real HTTP servers on ephemeral ports)
- Architecture: ES Modules only; Express-based clones; orchestration via HTTP; integrity-first infra

## Architecture context and constraints

- Clones: Omega (Coordinator), Beta (Analyzer), Gamma (Architect), Delta (Tester), Sigma (Communicator)
- Base class: `src/clones/RyuzuClone.js`
- Infra: `ArtifactManager`, `AutoGenClient`, `ContextEngineer`, `EvidenceCollector`, `IntegrityMonitor`, `InputValidator`
- Ports: Internally always `process.env.PORT || 3001`; Docker maps externals (Omega 3000→3001, Beta 3002→3001, Gamma 3003→3001, Delta 3004→3001, Sigma 3005→3001)
- Enforcement: NO SIMULATIONS LAW — no mock fallbacks; evidence with `execution: 'real'` marker; SHA‑256 checksums for all artifacts; audit logs under `/tmp/sanctuary-workspace/audit/`
- ESM only: import/export with explicit `.js` extensions

## Phase 3 objective

Implement MCP integration: add MCP server and the standard tool set to expose clone capabilities through MCP, routed via Omega with context engineering and audit evidence, without simulation.

## Deliverables

1. MCP Server (STDIO transport) under `src/mcp/server/` with ESM exports
2. MCP Tools under `src/mcp/tools/` that call into Omega (preferred) or target clones via HTTP
   - sanctuary_health_check
   - sanctuary_beta_analyze
   - sanctuary_gamma_design
   - sanctuary_delta_test
   - sanctuary_sigma_document
   - sanctuary_omega_orchestrate
   - sanctuary_store_artifact
   - sanctuary_get_artifact
3. Wiring docs: minimal README in `src/mcp/` describing how to run and connect from an MCP client
4. Tests:
   - Unit tests for tool input validation and happy-path execution (no mocks for business logic; allow network to localhost clones with ephemeral ports like existing tests)
   - Integration test that exercises `sanctuary_omega_orchestrate` path end‑to‑end
5. Evidence:
   - Each tool execution records evidence with `execution: 'real'`
   - Artifact operations use `ArtifactManager` with checksum verification

## Acceptance criteria

- All MCP tools load successfully in the MCP server and pass schema validation (inputSchema)
- Calling each tool against running local clones returns real results and audit evidence
- Tests pass; coverage remains ≥ 90% statements overall
- No CommonJS; all imports include `.js` extensions; no hard‑coded internal ports
- Error handling returns non‑200 with clear error messages; no simulated fallbacks

## Implementation outline (suggested)

1. Create `src/mcp/server/index.js` exporting `createServer()` that registers tools and starts STDIO transport
2. Implement tool modules in `src/mcp/tools/` following existing patterns from clone endpoints
   - Tools should route via Omega `/orchestrate` when applicable to leverage context quality scoring
   - Use `uuid` for sessionIds; include tool name in evidence metadata
3. Add tests under `test/unit/mcp/` and `test/integration/mcp/`
4. Add `npm` scripts to run MCP server locally for development (optional)

## References in repo

- Plan: `docs/plans/2025-10-23-phase3-mcp-deployment.md`
- Patterns and expectations: `.github/copilot-instructions.md`
- Core infrastructure: `src/infrastructure/*`
- Clone endpoints: `src/clones/*/*Clone.js`
- Orchestration endpoint: `src/clones/omega/OmegaClone.js`

## Risks and mitigations

- Port conflicts → follow existing pattern using env PORT + ephemeral test ports in suites
- Context overload → use artifact manifests in context packages; avoid passing full artifacts between clones/tools
- Simulation risk → ensure all tool paths call real HTTP endpoints and record evidence; never fabricate responses

## Runbook (local)

- Tests
  - `npm test` (full)
  - `npm run test:unit`
  - `npm run test:integration`

## Hand‑off notes

- Commit that implements MCP should include a short section in `DEPLOYMENT.md` describing how MCP server is started in docker or locally
- Ensure health endpoints remain stable for Docker HEALTHCHECK

— Prepared for delegation by background agent. All metrics above are from the most recent real execution on this branch (HEAD d577de5).
