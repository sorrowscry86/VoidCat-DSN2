# Phase 2: Clone Specialization Implementation Plan

> **For Claude:** Use the executing-plans skill to implement this plan task-by-task.

**Goal:** Implement all five specialized Claude AI clones (Beta-Analyzer, Gamma-Architect, Delta-Tester, Sigma-Communicator, Omega-Coordinator) with real AI execution via AutoGen, specialized system prompts, and inter-clone communication.

**Architecture:** Each clone extends RyuzuClone with Express.js HTTP server, specialized endpoints, real AI query execution via AutoGen, and routing to communicate with other clones. Omega acts as the central coordinator managing task delegation.

**Tech Stack:** Node.js 18+, Express.js, AutoGen SDK, Mocha/Chai, ES Modules

---

## Task 1: Create Beta Clone (Analyzer)

**Files:**
- Create: `src/clones/beta/index.js`
- Create: `src/clones/beta/routes.js`
- Test: `test/unit/clones/beta.test.js`

**Step 1: Write failing test for Beta Clone**

```javascript
// test/unit/clones/beta.test.js
import { expect } from 'chai';
import { BetaClone } from '../../src/clones/beta/index.js';

describe('Beta Clone (Analyzer)', () => {
  let beta;

  beforeEach(() => {
    beta = new BetaClone({ port: 3001, apiKey: 'test-key' });
  });

  it('should initialize as Analyzer clone', () => {
    expect(beta.name).to.include('Beta');
    expect(beta.role).to.equal('analyzer');
  });

  it('should have security analysis capability', () => {
    expect(beta).to.have.property('analyzeCode');
  });

  it('should have code review capability', () => {
    expect(beta).to.have.property('reviewCode');
  });

  it('should have vulnerability detection capability', () => {
    expect(beta).to.have.property('detectVulnerabilities');
  });

  it('should specialize in security analysis', async () => {
    const systemPrompt = beta.getSystemPrompt();
    expect(systemPrompt).to.include('security');
    expect(systemPrompt).to.include('analysis');
  });

  it('should analyze code for security issues', async () => {
    const result = await beta.analyzeCode({
      language: 'javascript',
      code: 'const password = "hardcoded";'
    });

    expect(result).to.have.property('findings');
    expect(result).to.have.property('severity');
  });

  it('should record analysis in audit trail', async () => {
    await beta.analyzeCode({
      language: 'javascript',
      code: 'function test() {}'
    });

    const trail = beta.getAuditTrail();
    const analysisEvent = trail.find(e => e.action === 'code_analysis');

    expect(analysisEvent).to.exist;
    expect(analysisEvent.status).to.equal('completed');
  });
});
```

**Step 2: Write minimal Beta Clone implementation**

```javascript
// src/clones/beta/index.js
import { RyuzuClone } from '../../infrastructure/ryuzu-clone.js';

export class BetaClone extends RyuzuClone {
  constructor(config = {}) {
    super({
      name: 'Beta-Analyzer',
      role: 'analyzer',
      port: config.port || 3001,
      apiKey: config.apiKey,
      model: 'claude-3-opus',
      systemPrompt: `You are Beta, a specialized security analyst AI clone. Your expertise includes:
- Code security analysis and vulnerability detection
- Best practices review
- Authentication and authorization patterns
- Data protection and encryption analysis
- OWASP Top 10 vulnerability identification
- Security recommendations and hardening strategies

Approach each analysis with methodical precision and provide actionable security recommendations.`
    });
  }

  /**
   * Analyze code for security vulnerabilities
   * @param {Object} analysis - Object with language, code, context
   * @returns {Promise<Object>} Analysis results with findings
   */
  async analyzeCode(analysis) {
    this.recordEvidence({
      type: 'analysis',
      action: 'code_analysis',
      status: 'started',
      metadata: { language: analysis.language }
    });

    try {
      const query = {
        messages: [
          {
            role: 'user',
            content: `Analyze this ${analysis.language} code for security vulnerabilities:\n\n${analysis.code}\n\nProvide findings with severity levels.`
          }
        ],
        systemPrompt: this.getSystemPrompt()
      };

      const response = await this.submitQuery(query);

      const result = {
        findings: [],
        severity: 'info',
        analysis: response.content,
        timestamp: Date.now()
      };

      this.recordEvidence({
        type: 'analysis',
        action: 'code_analysis',
        status: 'completed',
        metadata: { language: analysis.language }
      });

      return result;
    } catch (error) {
      this.recordEvidence({
        type: 'analysis',
        action: 'code_analysis',
        status: 'failed',
        metadata: { error: error.message }
      });
      throw error;
    }
  }

  /**
   * Review code for quality and best practices
   * @param {Object} review - Object with code, context
   * @returns {Promise<Object>} Review results
   */
  async reviewCode(review) {
    this.recordEvidence({
      type: 'review',
      action: 'code_review',
      status: 'started'
    });

    try {
      const query = {
        messages: [
          {
            role: 'user',
            content: `Review this code for quality and best practices:\n\n${review.code}\n\nProvide constructive feedback.`
          }
        ],
        systemPrompt: this.getSystemPrompt()
      };

      const response = await this.submitQuery(query);

      this.recordEvidence({
        type: 'review',
        action: 'code_review',
        status: 'completed'
      });

      return {
        suggestions: [],
        feedback: response.content,
        timestamp: Date.now()
      };
    } catch (error) {
      this.recordEvidence({
        type: 'review',
        action: 'code_review',
        status: 'failed'
      });
      throw error;
    }
  }

  /**
   * Detect vulnerabilities in code
   * @param {Object} detection - Object with code
   * @returns {Promise<Object>} Detected vulnerabilities
   */
  async detectVulnerabilities(detection) {
    this.recordEvidence({
      type: 'detection',
      action: 'vulnerability_detection',
      status: 'started'
    });

    try {
      const query = {
        messages: [
          {
            role: 'user',
            content: `Identify specific vulnerabilities in this code:\n\n${detection.code}\n\nList CVE references and OWASP categories.`
          }
        ],
        systemPrompt: this.getSystemPrompt()
      };

      const response = await this.submitQuery(query);

      this.recordEvidence({
        type: 'detection',
        action: 'vulnerability_detection',
        status: 'completed'
      });

      return {
        vulnerabilities: [],
        cvesFound: [],
        details: response.content,
        timestamp: Date.now()
      };
    } catch (error) {
      this.recordEvidence({
        type: 'detection',
        action: 'vulnerability_detection',
        status: 'failed'
      });
      throw error;
    }
  }
}
```

**Step 3: Create routes for Beta**

```javascript
// src/clones/beta/routes.js
import express from 'express';

export function createBetaRoutes(beta) {
  const router = express.Router();

  router.post('/analyze', async (req, res) => {
    try {
      const result = await beta.analyzeCode(req.body);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  router.post('/review', async (req, res) => {
    try {
      const result = await beta.reviewCode(req.body);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  router.post('/vulnerabilities', async (req, res) => {
    try {
      const result = await beta.detectVulnerabilities(req.body);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  router.get('/health', (req, res) => {
    res.json(beta.getHealth());
  });

  return router;
}
```

**Step 4: Run tests and commit**

```bash
npm test -- test/unit/clones/beta.test.js
git add src/clones/beta/ test/unit/clones/beta.test.js
git commit -m "feat: implement Beta Clone (Analyzer) with security analysis capabilities"
```

---

## Task 2: Create Gamma Clone (Architect)

**Files:**
- Create: `src/clones/gamma/index.js`
- Create: `src/clones/gamma/routes.js`
- Test: `test/unit/clones/gamma.test.js`

Follow the same pattern as Beta Clone but with architecture-focused capabilities:

```javascript
// src/clones/gamma/index.js - skeleton
export class GammaClone extends RyuzuClone {
  constructor(config = {}) {
    super({
      name: 'Gamma-Architect',
      role: 'architect',
      port: config.port || 3002,
      apiKey: config.apiKey,
      model: 'claude-3-opus',
      systemPrompt: `You are Gamma, a specialized system architect AI clone. Your expertise includes:
- System architecture design and planning
- Scalability and performance optimization
- Design patterns and architectural patterns
- Technology selection and evaluation
- Microservices architecture
- Database schema design

Provide comprehensive architectural recommendations with clear rationale.`
    });
  }

  async designSystem(design) {
    // Implement system design capability
  }

  async optimizeArchitecture(optimization) {
    // Implement architecture optimization
  }

  async suggestPatterns(context) {
    // Implement design pattern suggestions
  }
}
```

**Step 1-5:** Implement following Task 1 pattern

---

## Task 3: Create Delta Clone (Tester)

**Files:**
- Create: `src/clones/delta/index.js`
- Create: `src/clones/delta/routes.js`
- Test: `test/unit/clones/delta.test.js`

Delta specializes in testing and QA:

```javascript
// src/clones/delta/index.js - skeleton
export class DeltaClone extends RyuzuClone {
  constructor(config = {}) {
    super({
      name: 'Delta-Tester',
      role: 'tester',
      port: config.port || 3004,
      apiKey: config.apiKey,
      model: 'claude-3-opus',
      systemPrompt: `You are Delta, a specialized QA and testing AI clone. Your expertise includes:
- Test strategy and test plan development
- Unit, integration, and end-to-end testing
- Test case design and edge case identification
- Performance and load testing
- Mutation testing
- Test coverage analysis

Approach testing with thoroughness and comprehensive coverage.`
    });
  }

  async designTestStrategy(strategy) {
    // Implement test strategy capability
  }

  async generateTestCases(context) {
    // Implement test case generation
  }

  async identifyEdgeCases(code) {
    // Implement edge case identification
  }
}
```

---

## Task 4: Create Sigma Clone (Communicator)

**Files:**
- Create: `src/clones/sigma/index.js`
- Create: `src/clones/sigma/routes.js`
- Test: `test/unit/clones/sigma.test.js`

Sigma specializes in communication and documentation:

```javascript
// src/clones/sigma/index.js - skeleton
export class SigmaClone extends RyuzuClone {
  constructor(config = {}) {
    super({
      name: 'Sigma-Communicator',
      role: 'communicator',
      port: config.port || 3005,
      apiKey: config.apiKey,
      model: 'claude-3-opus',
      systemPrompt: `You are Sigma, a specialized communicator and documentation AI clone. Your expertise includes:
- Technical documentation writing
- API documentation generation
- User guide and tutorial creation
- Code comment and docstring generation
- Context engineering and message optimization
- Communication clarity and accessibility

Create clear, comprehensive, and accessible communication.`
    });
  }

  async generateDocumentation(context) {
    // Implement documentation generation
  }

  async optimizeContext(context) {
    // Implement context optimization
  }

  async generateComments(code) {
    // Implement comment generation
  }
}
```

---

## Task 5: Create Omega Clone (Coordinator)

**Files:**
- Create: `src/clones/omega/index.js`
- Create: `src/clones/omega/routes.js`
- Create: `src/clones/omega/orchestrator.js`
- Test: `test/unit/clones/omega.test.js`

Omega is the central coordinator:

```javascript
// src/clones/omega/index.js
export class OmegaClone extends RyuzuClone {
  constructor(config = {}) {
    super({
      name: 'Omega-Coordinator',
      role: 'coordinator',
      port: config.port || 3000,
      apiKey: config.apiKey,
      model: 'claude-3-opus',
      systemPrompt: `You are Omega, the coordinator AI clone orchestrating the Digital Sanctuary Network. Your role includes:
- Task delegation and workflow orchestration
- Clone health monitoring and management
- Context quality assurance and optimization
- Decision-making and strategic planning
- Network-wide integrity monitoring
- Performance optimization and load balancing

Coordinate all network operations with precision and integrity.`
    });

    this.networkClones = new Map();
    this.taskQueue = [];
    this.orchestrator = null;
  }

  async registerClone(cloneInfo) {
    // Register other clones with Omega
  }

  async delegateTask(task, targetClone) {
    // Delegate task to specific clone
  }

  async monitorNetwork() {
    // Monitor health of all clones
  }

  async getNetworkStatus() {
    // Return overall network status
  }
}
```

---

## Task 6: Create Express HTTP Server for Each Clone

**Files:**
- Create: `src/infrastructure/clone-server.js` (base server factory)

**Implementation:**

```javascript
// src/infrastructure/clone-server.js
import express from 'express';

export class CloneServer {
  constructor(clone, routes) {
    this.clone = clone;
    this.app = express();
    this.routes = routes;

    this.setupMiddleware();
    this.setupRoutes();
  }

  setupMiddleware() {
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));

    // Request logging
    this.app.use((req, res, next) => {
      const start = Date.now();
      res.on('finish', () => {
        const duration = Date.now() - start;
        this.clone.recordEvidence({
          type: 'http_request',
          action: req.method,
          status: res.statusCode,
          metadata: { path: req.path, duration }
        });
      });
      next();
    });
  }

  setupRoutes() {
    // Health check endpoint
    this.app.get('/health', (req, res) => {
      res.json(this.clone.getHealth());
    });

    // Audit trail endpoint
    this.app.get('/audit', (req, res) => {
      res.json({
        trail: this.clone.getAuditTrail(),
        summary: this.clone.getAuditSummary()
      });
    });

    // Evidence report
    this.app.get('/evidence', (req, res) => {
      res.json(this.clone.getEvidenceReport());
    });

    // Mount clone-specific routes
    if (this.routes) {
      this.app.use('/', this.routes);
    }
  }

  async start() {
    return new Promise((resolve) => {
      this.server = this.app.listen(this.clone.port, () => {
        console.log(`${this.clone.name} listening on port ${this.clone.port}`);
        this.clone.start();
        resolve(this.server);
      });
    });
  }

  async stop() {
    if (this.server) {
      this.server.close();
      await this.clone.stop();
    }
  }
}
```

Each clone startup: `src/clones/<name>/index.js` exports both the clone class and a startup function.

---

## Task 7: Create Inter-Clone Communication Protocol

**Files:**
- Create: `src/protocols/sanctuary-message-protocol.js`

**Implementation:**

```javascript
// src/protocols/sanctuary-message-protocol.js
import axios from 'axios';

export class SanctuaryMessageProtocol {
  constructor(clones = {}) {
    this.clones = clones; // Map of clone names to URLs
    this.messageHistory = [];
  }

  async sendMessage(from, to, message) {
    const payload = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      from,
      to,
      content: message.content,
      type: message.type,
      timestamp: Date.now()
    };

    try {
      const targetUrl = this.clones[to];
      if (!targetUrl) {
        throw new Error(`Clone ${to} not found in network`);
      }

      const response = await axios.post(`${targetUrl}/message`, payload);
      this.messageHistory.push({ ...payload, status: 'delivered' });
      return response.data;
    } catch (error) {
      this.messageHistory.push({ ...payload, status: 'failed', error: error.message });
      throw error;
    }
  }

  getMessageHistory() {
    return [...this.messageHistory];
  }
}
```

---

## Task 8: Create Integration Tests for Inter-Clone Communication

**Files:**
- Test: `test/integration/clone-communication.test.js`

```javascript
// test/integration/clone-communication.test.js
import { expect } from 'chai';
import { BetaClone } from '../../src/clones/beta/index.js';
import { GammaClone } from '../../src/clones/gamma/index.js';
import { SanctuaryMessageProtocol } from '../../src/protocols/sanctuary-message-protocol.js';

describe('Inter-Clone Communication', () => {
  it('should communicate between clones via protocol', async () => {
    const beta = new BetaClone({ port: 3001, apiKey: 'test' });
    const gamma = new GammaClone({ port: 3002, apiKey: 'test' });

    const protocol = new SanctuaryMessageProtocol({
      'Beta': 'http://localhost:3001',
      'Gamma': 'http://localhost:3002'
    });

    const messageHistory = protocol.getMessageHistory();
    expect(messageHistory).to.be.an('array');
  });
});
```

---

## Task 9: Verify Phase 2 Integration & Coverage

**Files:**
- Test: Full integration test suite for all clones

**Step 1: Run all clone tests**

```bash
npm test -- test/unit/clones/
```

Expected: All clone tests passing

**Step 2: Run integration tests**

```bash
npm run test:integration
```

Expected: Communication tests passing

**Step 3: Coverage verification**

```bash
npm run test:coverage
```

Expected: >90% coverage for clone modules

**Step 4: Verify HTTP endpoints**

Create health check test:

```bash
npm test -- test/e2e/clone-health.test.js
```

**Step 5: Commit**

```bash
git commit -m "feat: complete Phase 2 Clone Specialization with all 5 clones and inter-clone communication"
```

---

## Checklist for Phase 2 Completion

- [ ] Beta Clone (Analyzer) implemented and tested
- [ ] Gamma Clone (Architect) implemented and tested
- [ ] Delta Clone (Tester) implemented and tested
- [ ] Sigma Clone (Communicator) implemented and tested
- [ ] Omega Clone (Coordinator) implemented and tested
- [ ] CloneServer HTTP server factory implemented
- [ ] SanctuaryMessageProtocol for inter-clone communication
- [ ] Express routes created for all clones
- [ ] All Phase 2 tests passing (95%+ pass rate)
- [ ] Integration tests for clone communication passing
- [ ] Overall coverage >90%
- [ ] All changes committed

---

**Status:** Ready for implementation via executing-plans skill

**Estimated Effort:** 16-20 hours for complete implementation
