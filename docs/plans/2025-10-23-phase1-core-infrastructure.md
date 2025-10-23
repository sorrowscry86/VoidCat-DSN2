# Phase 1: Core Infrastructure Implementation Plan

> **For Claude:** Use the executing-plans skill to implement this plan task-by-task.

**Goal:** Build artifact management with SHA-256 checksums, context engineering with quality scoring, and the RyuzuClone base class that all specialized clones inherit from.

**Architecture:** ArtifactManager handles version-controlled work products with cryptographic integrity. ContextEngineer scores inter-clone communication quality (0-100). RyuzuClone base class integrates all foundation components (from Phase 0) and provides standardized HTTP endpoints, health monitoring, and lifecycle management.

**Tech Stack:** Node.js 18+, Express.js, Mocha/Chai, Winston logging, crypto, uuid

---

## Task 1: Create ArtifactManager Class

**Files:**
- Create: `src/infrastructure/artifact-manager.js`
- Test: `test/unit/infrastructure/artifact-manager.test.js`
- Create: `artifacts/` directory (if not exists)

**Step 1: Write failing test for ArtifactManager**

```javascript
// test/unit/infrastructure/artifact-manager.test.js
import { expect } from 'chai';
import { ArtifactManager } from '../../src/infrastructure/artifact-manager.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const testArtifactDir = path.join(__dirname, '../../..', 'artifacts', 'test');

describe('ArtifactManager', () => {
  let manager;

  beforeEach(() => {
    if (!fs.existsSync(testArtifactDir)) {
      fs.mkdirSync(testArtifactDir, { recursive: true });
    }
    manager = new ArtifactManager(testArtifactDir);
  });

  afterEach(() => {
    // Clean up test artifacts
    if (fs.existsSync(testArtifactDir)) {
      fs.rmSync(testArtifactDir, { recursive: true });
    }
  });

  it('should initialize with artifact directory', () => {
    expect(manager.artifactDir).to.equal(testArtifactDir);
  });

  it('should store artifact with metadata and checksum', () => {
    const artifact = {
      type: 'code_analysis',
      content: 'function test() { return true; }',
      metadata: { language: 'javascript', lines: 1 }
    };

    const manifest = manager.storeArtifact(artifact);

    expect(manifest).to.have.property('id');
    expect(manifest).to.have.property('checksum').with.lengthOf(64);
    expect(manifest).to.have.property('version').equal('1.0.0');
    expect(manifest).to.have.property('stored').equal(true);
  });

  it('should retrieve artifact by id', () => {
    const artifact = {
      type: 'code_analysis',
      content: 'test content',
      metadata: {}
    };

    const manifest = manager.storeArtifact(artifact);
    const retrieved = manager.getArtifact(manifest.id);

    expect(retrieved).to.have.property('content').equal('test content');
    expect(retrieved).to.have.property('type').equal('code_analysis');
  });

  it('should verify artifact integrity via checksum', () => {
    const artifact = {
      type: 'design',
      content: 'architecture diagram',
      metadata: {}
    };

    const manifest = manager.storeArtifact(artifact);
    const isValid = manager.verifyIntegrity(manifest.id, manifest.checksum);

    expect(isValid).to.equal(true);
  });

  it('should detect corrupted artifact via checksum', () => {
    const artifact = {
      type: 'design',
      content: 'original content',
      metadata: {}
    };

    const manifest = manager.storeArtifact(artifact);

    // Simulate corruption
    const filePath = path.join(testArtifactDir, `${manifest.id}.json`);
    const corrupted = { ...artifact, content: 'corrupted' };
    fs.writeFileSync(filePath, JSON.stringify(corrupted));

    const isValid = manager.verifyIntegrity(manifest.id, manifest.checksum);
    expect(isValid).to.equal(false);
  });

  it('should list all artifacts with manifest', () => {
    manager.storeArtifact({ type: 'test1', content: 'content1', metadata: {} });
    manager.storeArtifact({ type: 'test2', content: 'content2', metadata: {} });
    manager.storeArtifact({ type: 'test3', content: 'content3', metadata: {} });

    const manifests = manager.listArtifacts();

    expect(manifests).to.be.an('array').with.lengthOf(3);
    expect(manifests[0]).to.have.property('id');
    expect(manifests[0]).to.have.property('type');
  });

  it('should calculate total artifact size', () => {
    manager.storeArtifact({
      type: 'test',
      content: 'x'.repeat(1000),
      metadata: {}
    });

    const stats = manager.getStatistics();
    expect(stats.totalArtifacts).to.equal(1);
    expect(stats.totalSize).to.be.greaterThan(0);
  });
});
```

**Step 2: Run test to verify it fails**

```bash
npm test -- test/unit/infrastructure/artifact-manager.test.js
```

Expected: FAIL - "ArtifactManager is not defined"

**Step 3: Write minimal ArtifactManager implementation**

```javascript
// src/infrastructure/artifact-manager.js
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

export class ArtifactManager {
  constructor(artifactDir = './artifacts') {
    this.artifactDir = artifactDir;
    this.ensureDirectory();
    this.manifestIndex = {};
  }

  /**
   * Ensure artifact directory exists
   */
  ensureDirectory() {
    if (!fs.existsSync(this.artifactDir)) {
      fs.mkdirSync(this.artifactDir, { recursive: true });
    }
  }

  /**
   * Calculate SHA-256 checksum for artifact
   * @param {Object} artifact - Artifact object
   * @returns {string} SHA-256 hash (64 char hex)
   */
  calculateChecksum(artifact) {
    const data = JSON.stringify(artifact);
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  /**
   * Store artifact with metadata and checksum
   * @param {Object} artifact - Object with type, content, metadata
   * @returns {Object} Manifest with id, checksum, version
   */
  storeArtifact(artifact) {
    const id = uuidv4();
    const checksum = this.calculateChecksum(artifact);

    const manifest = {
      id,
      type: artifact.type,
      checksum,
      version: '1.0.0',
      stored: new Date().toISOString(),
      metadata: artifact.metadata || {}
    };

    const filePath = path.join(this.artifactDir, `${id}.json`);
    fs.writeFileSync(filePath, JSON.stringify(artifact, null, 2));

    this.manifestIndex[id] = manifest;

    return manifest;
  }

  /**
   * Retrieve artifact by id
   * @param {string} id - Artifact ID
   * @returns {Object} Artifact object
   */
  getArtifact(id) {
    if (!this.manifestIndex[id]) {
      throw new Error(`Artifact ${id} not found in manifest index`);
    }

    const filePath = path.join(this.artifactDir, `${id}.json`);
    if (!fs.existsSync(filePath)) {
      throw new Error(`Artifact file ${filePath} not found on disk`);
    }

    const content = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(content);
  }

  /**
   * Verify artifact integrity via checksum
   * @param {string} id - Artifact ID
   * @param {string} expectedChecksum - Expected SHA-256 checksum
   * @returns {boolean} True if artifact integrity verified
   */
  verifyIntegrity(id, expectedChecksum) {
    try {
      const artifact = this.getArtifact(id);
      const calculatedChecksum = this.calculateChecksum(artifact);
      return calculatedChecksum === expectedChecksum;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get manifest for artifact
   * @param {string} id - Artifact ID
   * @returns {Object} Manifest object
   */
  getManifest(id) {
    if (!this.manifestIndex[id]) {
      throw new Error(`Manifest for ${id} not found`);
    }
    return this.manifestIndex[id];
  }

  /**
   * List all artifacts
   * @returns {Array} Array of manifest objects
   */
  listArtifacts() {
    return Object.values(this.manifestIndex);
  }

  /**
   * Delete artifact by id
   * @param {string} id - Artifact ID
   * @returns {boolean} True if deleted
   */
  deleteArtifact(id) {
    const filePath = path.join(this.artifactDir, `${id}.json`);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    delete this.manifestIndex[id];
    return true;
  }

  /**
   * Get storage statistics
   * @returns {Object} Statistics including count and size
   */
  getStatistics() {
    let totalSize = 0;
    const files = fs.readdirSync(this.artifactDir);

    files.forEach(file => {
      const filePath = path.join(this.artifactDir, file);
      const stats = fs.statSync(filePath);
      totalSize += stats.size;
    });

    return {
      totalArtifacts: Object.keys(this.manifestIndex).length,
      totalSize,
      averageSize: Object.keys(this.manifestIndex).length > 0
        ? totalSize / Object.keys(this.manifestIndex).length
        : 0
    };
  }
}
```

**Step 4: Run test to verify it passes**

```bash
npm test -- test/unit/infrastructure/artifact-manager.test.js
```

Expected: PASS - All tests passing

**Step 5: Commit**

```bash
git add src/infrastructure/artifact-manager.js test/unit/infrastructure/artifact-manager.test.js
git commit -m "feat: implement ArtifactManager with SHA-256 integrity verification"
```

---

## Task 2: Create ContextEngineer Class

**Files:**
- Create: `src/infrastructure/context-engineer.js`
- Test: `test/unit/infrastructure/context-engineer.test.js`

**Step 1: Write failing test for ContextEngineer**

```javascript
// test/unit/infrastructure/context-engineer.test.js
import { expect } from 'chai';
import { ContextEngineer } from '../../src/infrastructure/context-engineer.js';

describe('ContextEngineer', () => {
  let engineer;

  beforeEach(() => {
    engineer = new ContextEngineer();
  });

  it('should initialize with quality threshold', () => {
    expect(engineer).to.have.property('qualityThreshold').equal(40);
  });

  it('should create context package from request', () => {
    const request = {
      type: 'analysis',
      content: 'analyze this code',
      requesterClone: 'omega',
      targetClone: 'beta'
    };

    const pkg = engineer.createContextPackage(request);

    expect(pkg).to.have.property('content').equal('analyze this code');
    expect(pkg).to.have.property('requesterClone').equal('omega');
    expect(pkg).to.have.property('timestamp');
  });

  it('should calculate quality score for context package', () => {
    const request = {
      type: 'analysis',
      content: 'comprehensive analysis request with full context',
      requesterClone: 'omega',
      targetClone: 'beta'
    };

    const score = engineer.calculateQualityScore(request);

    expect(score).to.be.a('number');
    expect(score).to.be.at.least(0);
    expect(score).to.be.at.most(100);
  });

  it('should block context packages below quality threshold', () => {
    const poorRequest = {
      type: 'query',
      content: 'x', // Very short, low quality
      requesterClone: 'omega',
      targetClone: 'beta'
    };

    const shouldBlock = engineer.shouldBlockContext(poorRequest);

    expect(shouldBlock).to.equal(true);
  });

  it('should allow context packages above quality threshold', () => {
    const goodRequest = {
      type: 'analysis',
      content: 'Please perform a comprehensive security analysis of the authentication module, including checking for injection vulnerabilities',
      requesterClone: 'omega',
      targetClone: 'beta'
    };

    const shouldBlock = engineer.shouldBlockContext(goodRequest);

    expect(shouldBlock).to.equal(false);
  });

  it('should provide quality scoring breakdown', () => {
    const request = {
      type: 'analysis',
      content: 'Analyze the proposed architecture for scalability and fault tolerance',
      requesterClone: 'omega',
      targetClone: 'gamma'
    };

    const breakdown = engineer.getScoreBreakdown(request);

    expect(breakdown).to.have.property('contentLength');
    expect(breakdown).to.have.property('specificity');
    expect(breakdown).to.have.property('clarity');
    expect(breakdown).to.have.property('totalScore');
  });

  it('should track context package history', () => {
    const req1 = {
      type: 'analysis',
      content: 'analyze code',
      requesterClone: 'omega',
      targetClone: 'beta'
    };

    const req2 = {
      type: 'design',
      content: 'design system',
      requesterClone: 'omega',
      targetClone: 'gamma'
    };

    engineer.createContextPackage(req1);
    engineer.createContextPackage(req2);

    const history = engineer.getPackageHistory();

    expect(history).to.be.an('array').with.lengthOf(2);
    expect(history[0].targetClone).to.equal('beta');
    expect(history[1].targetClone).to.equal('gamma');
  });
});
```

**Step 2: Run test to verify it fails**

```bash
npm test -- test/unit/infrastructure/context-engineer.test.js
```

Expected: FAIL - "ContextEngineer is not defined"

**Step 3: Write minimal ContextEngineer implementation**

```javascript
// src/infrastructure/context-engineer.js
export class ContextEngineer {
  constructor(qualityThreshold = 40) {
    this.qualityThreshold = qualityThreshold;
    this.packageHistory = [];
  }

  /**
   * Calculate quality score for context package (0-100)
   * Factors: content length, specificity, clarity
   * @param {Object} request - Request object
   * @returns {number} Quality score 0-100
   */
  calculateQualityScore(request) {
    let score = 0;

    // Content length factor (0-30 points)
    const contentLength = (request.content || '').length;
    const lengthScore = Math.min(30, (contentLength / 300) * 30);
    score += lengthScore;

    // Specificity factor (0-35 points)
    const hasRequesterClone = !!request.requesterClone;
    const hasTargetClone = !!request.targetClone;
    const hasType = !!request.type;
    const specificity = [hasRequesterClone, hasTargetClone, hasType].filter(x => x).length;
    score += specificity * 12;

    // Clarity factor (0-35 points)
    const words = (request.content || '').split(/\s+/).length;
    const avgWordLength = words > 0
      ? (request.content || '').replace(/\s/g, '').length / words
      : 0;
    const clarityScore = Math.min(35, (avgWordLength / 8) * 35);
    score += clarityScore;

    return Math.round(score);
  }

  /**
   * Create context package from request
   * @param {Object} request - Request with type, content, requesterClone, targetClone
   * @returns {Object} Context package with metadata
   */
  createContextPackage(request) {
    const score = this.calculateQualityScore(request);

    const pkg = {
      id: `ctx-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: request.type,
      content: request.content,
      requesterClone: request.requesterClone,
      targetClone: request.targetClone,
      qualityScore: score,
      timestamp: Date.now(),
      created: new Date().toISOString()
    };

    this.packageHistory.push(pkg);
    return pkg;
  }

  /**
   * Determine if context should be blocked based on quality
   * @param {Object} request - Request object
   * @returns {boolean} True if package quality is below threshold
   */
  shouldBlockContext(request) {
    const score = this.calculateQualityScore(request);
    return score < this.qualityThreshold;
  }

  /**
   * Get detailed quality score breakdown
   * @param {Object} request - Request object
   * @returns {Object} Breakdown of scoring factors
   */
  getScoreBreakdown(request) {
    const contentLength = (request.content || '').length;
    const words = (request.content || '').split(/\s+/).length;
    const avgWordLength = words > 0
      ? (request.content || '').replace(/\s/g, '').length / words
      : 0;

    const lengthScore = Math.min(30, (contentLength / 300) * 30);
    const specificity = [!!request.requesterClone, !!request.targetClone, !!request.type]
      .filter(x => x).length;
    const specificityScore = specificity * 12;
    const clarityScore = Math.min(35, (avgWordLength / 8) * 35);

    return {
      contentLength,
      contentLengthScore: lengthScore,
      specificity,
      specificityScore,
      averageWordLength: avgWordLength.toFixed(2),
      clarityScore,
      totalScore: Math.round(lengthScore + specificityScore + clarityScore)
    };
  }

  /**
   * Get package history
   * @returns {Array} Array of context packages created
   */
  getPackageHistory() {
    return [...this.packageHistory];
  }

  /**
   * Clear package history (for testing/reset)
   */
  clearHistory() {
    this.packageHistory = [];
  }

  /**
   * Get statistics on context packages
   * @returns {Object} Statistics
   */
  getStatistics() {
    const avgQuality = this.packageHistory.length > 0
      ? this.packageHistory.reduce((sum, p) => sum + p.qualityScore, 0) / this.packageHistory.length
      : 0;

    const blockedCount = this.packageHistory.filter(
      p => p.qualityScore < this.qualityThreshold
    ).length;

    return {
      totalPackages: this.packageHistory.length,
      blockedPackages: blockedCount,
      averageQuality: avgQuality.toFixed(2),
      qualityThreshold: this.qualityThreshold
    };
  }
}
```

**Step 4: Run test to verify it passes**

```bash
npm test -- test/unit/infrastructure/context-engineer.test.js
```

Expected: PASS - All tests passing

**Step 5: Commit**

```bash
git add src/infrastructure/context-engineer.js test/unit/infrastructure/context-engineer.test.js
git commit -m "feat: implement ContextEngineer with quality scoring (0-100)"
```

---

## Task 3: Create RyuzuClone Base Class

**Files:**
- Create: `src/infrastructure/ryuzu-clone.js`
- Test: `test/unit/infrastructure/ryuzu-clone.test.js`

**Step 1: Write failing test for RyuzuClone**

```javascript
// test/unit/infrastructure/ryuzu-clone.test.js
import { expect } from 'chai';
import { RyuzuClone } from '../../src/infrastructure/ryuzu-clone.js';

describe('RyuzuClone Base Class', () => {
  let clone;

  beforeEach(() => {
    clone = new RyuzuClone({
      name: 'TestClone',
      role: 'tester',
      port: 3099,
      apiKey: 'test-key'
    });
  });

  it('should initialize with name, role, and port', () => {
    expect(clone.name).to.equal('TestClone');
    expect(clone.role).to.equal('tester');
    expect(clone.port).to.equal(3099);
  });

  it('should have integrity monitor', () => {
    expect(clone).to.have.property('integrityMonitor');
    expect(clone.integrityMonitor).to.have.property('verifyRequest');
  });

  it('should have evidence collector', () => {
    expect(clone).to.have.property('evidenceCollector');
    expect(clone.evidenceCollector).to.have.property('record');
  });

  it('should have AutoGen client', () => {
    expect(clone).to.have.property('autogenClient');
    expect(clone.autogenClient).to.have.property('query');
  });

  it('should track health status', () => {
    const health = clone.getHealth();

    expect(health).to.have.property('status');
    expect(health).to.have.property('uptime');
    expect(health).to.have.property('clone').equal('TestClone');
    expect(health).to.have.property('role').equal('tester');
  });

  it('should record operation evidence', () => {
    clone.recordEvidence({
      type: 'task_execution',
      action: 'test_run',
      status: 'completed'
    });

    const trail = clone.getAuditTrail();

    expect(trail).to.have.lengthOf(1);
    expect(trail[0].action).to.equal('test_run');
  });

  it('should validate requests for integrity', () => {
    const validRequest = {
      id: 'req-123',
      type: 'query',
      timestamp: Date.now(),
      content: 'test'
    };

    const result = clone.validateRequest(validRequest);
    expect(result.valid).to.equal(true);
  });

  it('should enforce NO SIMULATIONS LAW in queries', () => {
    expect(() => {
      clone.submitQuery({
        type: 'mock',
        content: 'fake response'
      });
    }).to.throw('NO SIMULATIONS LAW');
  });

  it('should get audit trail summary', () => {
    clone.recordEvidence({ type: 'event1', action: 'start', status: 'pending' });
    clone.recordEvidence({ type: 'event2', action: 'process', status: 'running' });

    const summary = clone.getAuditSummary();

    expect(summary).to.have.property('totalEvents').equal(2);
    expect(summary).to.have.property('chainChecksum');
  });
});
```

**Step 2: Run test to verify it fails**

```bash
npm test -- test/unit/infrastructure/ryuzu-clone.test.js
```

Expected: FAIL - "RyuzuClone is not defined"

**Step 3: Write minimal RyuzuClone implementation**

```javascript
// src/infrastructure/ryuzu-clone.js
import { IntegrityMonitor } from './integrity-monitor.js';
import { EvidenceCollector } from './evidence-collector.js';
import { AutoGenClient } from './autogen-client.js';

export class RyuzuClone {
  constructor(config = {}) {
    this.name = config.name || 'UnnamedClone';
    this.role = config.role || 'generic';
    this.port = config.port || 3000;
    this.apiKey = config.apiKey || process.env.ANTHROPIC_API_KEY;

    // Initialize foundational infrastructure
    this.integrityMonitor = new IntegrityMonitor();
    this.evidenceCollector = new EvidenceCollector();
    this.autogenClient = new AutoGenClient({
      apiKey: this.apiKey,
      model: config.model || 'claude-3-opus'
    });

    // Clone lifecycle tracking
    this.startTime = Date.now();
    this.status = 'initialized';
    this.isRunning = false;

    // System prompt for specialized behavior
    this.systemPrompt = config.systemPrompt || `You are ${this.name}, a ${this.role} specialized AI clone.`;
  }

  /**
   * Start the clone (placeholder - Express setup in Phase 2)
   */
  async start() {
    this.isRunning = true;
    this.status = 'running';
    this.recordEvidence({
      type: 'lifecycle',
      action: 'start',
      status: 'success'
    });
    return { success: true, message: `${this.name} started on port ${this.port}` };
  }

  /**
   * Stop the clone gracefully
   */
  async stop() {
    this.isRunning = false;
    this.status = 'stopped';
    this.recordEvidence({
      type: 'lifecycle',
      action: 'stop',
      status: 'success'
    });
    return { success: true, message: `${this.name} stopped` };
  }

  /**
   * Get current health status
   * @returns {Object} Health information
   */
  getHealth() {
    const uptime = Date.now() - this.startTime;

    return {
      status: this.status,
      clone: this.name,
      role: this.role,
      port: this.port,
      isRunning: this.isRunning,
      uptime,
      timestamp: Date.now()
    };
  }

  /**
   * Validate incoming request for integrity
   * @param {Object} request - Request to validate
   * @returns {Object} Validation result
   */
  validateRequest(request) {
    return this.integrityMonitor.verifyRequest(request);
  }

  /**
   * Record evidence in audit trail
   * @param {Object} evidence - Evidence object
   */
  recordEvidence(evidence) {
    this.evidenceCollector.record(evidence);
  }

  /**
   * Get audit trail
   * @returns {Array} Array of evidence entries
   */
  getAuditTrail() {
    return this.evidenceCollector.getAuditTrail();
  }

  /**
   * Get audit trail summary
   * @returns {Object} Summary with statistics
   */
  getAuditSummary() {
    return this.evidenceCollector.getSummary();
  }

  /**
   * Submit query for AI execution via AutoGen
   * Enforces NO SIMULATIONS LAW
   * @param {Object} query - Query to execute
   * @returns {Promise<Object>} Response from AI
   */
  async submitQuery(query) {
    // Validate real execution (NO SIMULATIONS LAW)
    this.autogenClient.validateRealExecution(query);

    this.recordEvidence({
      type: 'ai_query',
      action: 'submit_query',
      status: 'started'
    });

    try {
      const response = await this.autogenClient.query(query);

      this.recordEvidence({
        type: 'ai_query',
        action: 'query_completed',
        status: 'success',
        metadata: { model: this.autogenClient.model }
      });

      return response;
    } catch (error) {
      this.recordEvidence({
        type: 'ai_query',
        action: 'query_failed',
        status: 'error',
        metadata: { error: error.message }
      });
      throw error;
    }
  }

  /**
   * Get full evidence report
   * @returns {Object} Complete evidence with statistics
   */
  getEvidenceReport() {
    return {
      clone: this.name,
      role: this.role,
      health: this.getHealth(),
      auditTrail: this.getAuditTrail(),
      auditSummary: this.getAuditSummary(),
      autogenEvidence: this.autogenClient.getEvidence()
    };
  }

  /**
   * Get specialized system prompt for this clone
   * @returns {string} System prompt
   */
  getSystemPrompt() {
    return this.systemPrompt;
  }
}
```

**Step 4: Run test to verify it passes**

```bash
npm test -- test/unit/infrastructure/ryuzu-clone.test.js
```

Expected: PASS - All tests passing

**Step 5: Commit**

```bash
git add src/infrastructure/ryuzu-clone.js test/unit/infrastructure/ryuzu-clone.test.js
git commit -m "feat: implement RyuzuClone base class with integrity monitoring"
```

---

## Task 4: Create Workspace Directory Structure

**Files:**
- Create: `workspace/` directory with subdirectories

**Step 1: Create workspace structure**

```bash
mkdir -p workspace/{artifacts,manifests,audit,temp}
```

**Step 2: Create workspace configuration**

```javascript
// src/infrastructure/workspace.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const WORKSPACE_ROOT = path.join(__dirname, '../../workspace');

export const WORKSPACE_PATHS = {
  root: WORKSPACE_ROOT,
  artifacts: path.join(WORKSPACE_ROOT, 'artifacts'),
  manifests: path.join(WORKSPACE_ROOT, 'manifests'),
  audit: path.join(WORKSPACE_ROOT, 'audit'),
  temp: path.join(WORKSPACE_ROOT, 'temp')
};

export function initializeWorkspace() {
  Object.values(WORKSPACE_PATHS).forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
  return WORKSPACE_PATHS;
}
```

**Step 3: Add test for workspace initialization**

```javascript
// test/unit/infrastructure/workspace.test.js
import { expect } from 'chai';
import { WORKSPACE_PATHS, initializeWorkspace } from '../../src/infrastructure/workspace.js';
import fs from 'fs';

describe('Workspace Initialization', () => {
  it('should initialize all workspace directories', () => {
    initializeWorkspace();

    expect(fs.existsSync(WORKSPACE_PATHS.artifacts)).to.equal(true);
    expect(fs.existsSync(WORKSPACE_PATHS.manifests)).to.equal(true);
    expect(fs.existsSync(WORKSPACE_PATHS.audit)).to.equal(true);
    expect(fs.existsSync(WORKSPACE_PATHS.temp)).to.equal(true);
  });

  it('should provide workspace paths', () => {
    expect(WORKSPACE_PATHS).to.have.property('root');
    expect(WORKSPACE_PATHS).to.have.property('artifacts');
    expect(WORKSPACE_PATHS).to.have.property('manifests');
    expect(WORKSPACE_PATHS).to.have.property('audit');
    expect(WORKSPACE_PATHS).to.have.property('temp');
  });
});
```

**Step 4: Run test**

```bash
npm test -- test/unit/infrastructure/workspace.test.js
```

Expected: PASS

**Step 5: Commit**

```bash
git add src/infrastructure/workspace.js test/unit/infrastructure/workspace.test.js workspace/.gitkeep
git commit -m "feat: create workspace directory structure with initialization"
```

---

## Task 5: Verify Phase 1 Integration & Coverage

**Files:**
- Verify: All infrastructure components working together
- Test: Run full Phase 1 test suite with coverage

**Step 1: Run all Phase 1 tests**

```bash
npm test -- test/unit/infrastructure/ --reporter json > phase1-coverage.json
```

Expected: All tests passing

**Step 2: Generate coverage report**

```bash
npm run test:coverage -- test/unit/infrastructure/
```

Expected: Coverage report shows >90% for all Phase 1 modules

**Step 3: Verify integration between components**

Create integration test: `test/integration/infrastructure-integration.test.js`

```javascript
import { expect } from 'chai';
import { RyuzuClone } from '../../src/infrastructure/ryuzu-clone.js';
import { ArtifactManager } from '../../src/infrastructure/artifact-manager.js';
import { ContextEngineer } from '../../src/infrastructure/context-engineer.js';

describe('Phase 1 Infrastructure Integration', () => {
  let clone;
  let artifactManager;
  let contextEngineer;

  beforeEach(() => {
    clone = new RyuzuClone({
      name: 'IntegrationTest',
      role: 'test',
      port: 3099,
      apiKey: 'test-key'
    });

    artifactManager = new ArtifactManager('./test-workspace/artifacts');
    contextEngineer = new ContextEngineer();
  });

  it('should integrate all Phase 1 components', () => {
    // Record evidence
    clone.recordEvidence({
      type: 'integration_test',
      action: 'start',
      status: 'running'
    });

    // Create context package
    const context = contextEngineer.createContextPackage({
      type: 'test',
      content: 'integration testing for Phase 1 infrastructure',
      requesterClone: 'omega',
      targetClone: 'beta'
    });

    // Store artifact
    const artifact = {
      type: 'integration_result',
      content: JSON.stringify(context),
      metadata: { test: true }
    };
    const manifest = artifactManager.storeArtifact(artifact);

    // Verify integration
    clone.recordEvidence({
      type: 'integration_test',
      action: 'complete',
      status: 'success',
      metadata: { artifactId: manifest.id, contextScore: context.qualityScore }
    });

    const report = clone.getEvidenceReport();
    expect(report.auditTrail.length).to.be.greaterThan(0);
    expect(context.qualityScore).to.be.greaterThan(0);
    expect(manifest.checksum).to.have.lengthOf(64);
  });
});
```

**Step 4: Run integration test**

```bash
npm run test:integration
```

Expected: Integration tests pass

**Step 5: Document Phase 1 completion**

Create `docs/phase1-completion.md`

**Step 6: Final commit**

```bash
git add docs/phase1-completion.md
git commit -m "docs: complete Phase 1 Core Infrastructure"
```

---

## Checklist for Phase 1 Completion

- [ ] ArtifactManager implemented and tested (>90% coverage)
- [ ] ContextEngineer implemented and tested (>90% coverage)
- [ ] RyuzuClone base class implemented and tested (>90% coverage)
- [ ] Workspace directory structure created
- [ ] Integration tests passing for all Phase 1 components
- [ ] All Phase 1 tests passing (95%+ pass rate)
- [ ] Overall coverage >90%
- [ ] Phase 1 completion documentation created
- [ ] All changes committed

---

**Status:** Ready for implementation via executing-plans skill

**Estimated Effort:** 8-12 hours for complete implementation and testing
