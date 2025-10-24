/**
 * BetaClone Unit Tests
 * 
 * Tests for Beta (Analyzer) clone specialization
 * Following TDD: write tests first, then implement
 * NO SIMULATIONS LAW: Real HTTP endpoints, real code analysis
 */

import { describe, it, beforeEach, afterEach } from 'mocha';
import { assert } from 'chai';
import request from 'supertest';
import BetaClone from '../../../../src/clones/beta/BetaClone.js';

describe('BetaClone', () => {
  let betaClone;

  beforeEach(async () => {
    betaClone = new BetaClone({
      testMode: true,
      port: 3099 // Use test port to avoid conflicts
    });
  });

  afterEach(async () => {
    if (betaClone && betaClone.server) {
      await betaClone.stop();
    }
  });

  describe('Constructor', () => {
    it('should create BetaClone instance', () => {
      assert.exists(betaClone);
      assert.instanceOf(betaClone, BetaClone);
    });

    it('should set role to Beta', () => {
      assert.equal(betaClone.role, 'Beta');
    });

    it('should set correct specialization', () => {
      assert.include(betaClone.specialization, 'Code analysis');
      assert.include(betaClone.specialization, 'debugging');
      assert.include(betaClone.specialization, 'security');
    });

    it('should initialize Express app', () => {
      assert.exists(betaClone.app);
    });

    it('should inherit from RyuzuClone', () => {
      assert.exists(betaClone.integrityMonitor);
      assert.exists(betaClone.evidenceCollector);
      assert.exists(betaClone.autoGenClient);
      assert.exists(betaClone.artifactManager);
      assert.exists(betaClone.contextEngineer);
    });

    it('should have analyzer-specific system prompt', () => {
      assert.include(betaClone.systemPrompt, 'Beta');
      assert.include(betaClone.systemPrompt, 'Analyzer');
      assert.include(betaClone.systemPrompt, 'NO SIMULATIONS LAW');
    });

    it('should use configured port or default', () => {
      assert.equal(betaClone.port, 3099);
    });
  });

  describe('HTTP Routes', () => {
    it('should have GET /health endpoint', async () => {
      const response = await request(betaClone.app)
        .get('/health')
        .expect(200);

      assert.exists(response.body);
      assert.equal(response.body.role, 'Beta');
    });

    it('should have POST /task endpoint', async () => {
      const response = await request(betaClone.app)
        .post('/task')
        .send({
          prompt: 'Test analysis task',
          context: {}
        })
        .expect(200);

      assert.exists(response.body);
      assert.isTrue(response.body.success);
    });

    it('should have POST /analyze endpoint', async () => {
      const response = await request(betaClone.app)
        .post('/analyze')
        .send({
          code: 'function test() { return true; }',
          language: 'javascript'
        })
        .expect(200);

      assert.exists(response.body);
      assert.exists(response.body.analysis);
    });

    it('should have POST /artifacts endpoint', async () => {
      const response = await request(betaClone.app)
        .post('/artifacts')
        .send({
          type: 'code',
          content: 'test content',
          metadata: { description: 'Test artifact' }
        })
        .expect(201);

      assert.exists(response.body);
      assert.isTrue(response.body.success);
      assert.exists(response.body.manifest);
    });

    it('should have GET /artifacts/:id endpoint', async () => {
      // First store an artifact
      const storeResponse = await request(betaClone.app)
        .post('/artifacts')
        .send({
          type: 'code',
          content: 'test content',
          metadata: {}
        });

      const artifactId = storeResponse.body.manifest.artifactId;

      // Then retrieve it
      const response = await request(betaClone.app)
        .get(`/artifacts/${artifactId}`)
        .expect(200);

      assert.exists(response.body);
      assert.exists(response.body.manifest);
    });
  });

  describe('analyzeCode()', () => {
    it('should analyze code and return results', async () => {
      const code = 'function add(a, b) { return a + b; }';
      const result = await betaClone.analyzeCode(code, 'javascript');

      assert.exists(result);
      assert.exists(result.analysis);
      assert.isTrue(result.success);
    });

    it('should support different languages', async () => {
      const code = 'def add(a, b): return a + b';
      const result = await betaClone.analyzeCode(code, 'python');

      assert.exists(result);
      assert.exists(result.analysis);
    });

    it('should store analysis as artifact', async () => {
      const code = 'function test() {}';
      const result = await betaClone.analyzeCode(code, 'javascript');

      assert.exists(result.artifact);
      assert.equal(result.artifact.type, 'code_analysis');
      assert.exists(result.artifact.checksum);
    });

    it('should include language metadata in artifact', async () => {
      const code = 'const x = 1;';
      const result = await betaClone.analyzeCode(code, 'javascript');

      assert.equal(result.artifact.metadata.language, 'javascript');
    });

    it('should include code length in metadata', async () => {
      const code = 'function test() { return 42; }';
      const result = await betaClone.analyzeCode(code, 'javascript');

      assert.equal(result.artifact.metadata.codeLength, code.length);
    });

    it('should support custom context focus', async () => {
      const code = 'function sensitive(password) { return password; }';
      const result = await betaClone.analyzeCode(code, 'javascript', {
        focus: 'security vulnerabilities'
      });

      assert.exists(result);
      assert.exists(result.analysis);
    });

    it('should collect evidence for analysis', async () => {
      const code = 'function test() {}';
      await betaClone.analyzeCode(code, 'javascript');

      // Get task execution evidence (not artifact storage evidence)
      const records = betaClone.evidenceCollector.records;
      const taskRecord = records.find(r => r.operation === 'task_execution');
      
      assert.exists(taskRecord);
      assert.equal(taskRecord.execution, 'real');
    });

    it('should throw error for missing code', async () => {
      try {
        await betaClone.analyzeCode(null, 'javascript');
        assert.fail('Should have thrown error');
      } catch (error) {
        assert.exists(error);
      }
    });
  });

  describe('Health Check', () => {
    it('should return health status via HTTP', async () => {
      const response = await request(betaClone.app)
        .get('/health')
        .expect(200);

      const health = response.body;

      assert.equal(health.role, 'Beta');
      assert.exists(health.specialization);
      assert.exists(health.timestamp);
      assert.exists(health.integrity);
      assert.exists(health.metrics);
    });

    it('should report component integrity', async () => {
      const response = await request(betaClone.app).get('/health');
      const integrity = response.body.integrity;

      assert.isTrue(integrity.integrityMonitorActive);
      assert.isTrue(integrity.evidenceCollectorActive);
      assert.isTrue(integrity.autoGenConnected);
      assert.isTrue(integrity.artifactManagerInitialized);
    });
  });

  describe('Artifact Management via HTTP', () => {
    it('should store artifact via POST /artifacts', async () => {
      const response = await request(betaClone.app)
        .post('/artifacts')
        .send({
          type: 'code',
          content: 'const x = 42;',
          metadata: { language: 'javascript' }
        })
        .expect(201);

      assert.isTrue(response.body.success);
      assert.exists(response.body.manifest.artifactId);
      assert.exists(response.body.manifest.checksum);
    });

    it('should retrieve artifact via GET /artifacts/:id', async () => {
      // Store artifact first
      const storeResponse = await request(betaClone.app)
        .post('/artifacts')
        .send({
          type: 'code',
          content: 'test content',
          metadata: {}
        });

      const artifactId = storeResponse.body.manifest.artifactId;

      // Retrieve artifact
      const response = await request(betaClone.app)
        .get(`/artifacts/${artifactId}`)
        .expect(200);

      assert.exists(response.body.manifest);
      assert.exists(response.body.content);
      assert.equal(response.body.content, 'test content');
    });

    it('should support manifestOnly query parameter', async () => {
      // Store artifact
      const storeResponse = await request(betaClone.app)
        .post('/artifacts')
        .send({
          type: 'code',
          content: 'large content that we dont want to retrieve',
          metadata: {}
        });

      const artifactId = storeResponse.body.manifest.artifactId;

      // Retrieve manifest only
      const response = await request(betaClone.app)
        .get(`/artifacts/${artifactId}?manifestOnly=true`)
        .expect(200);

      assert.exists(response.body.manifest);
      assert.notExists(response.body.content);
    });

    it('should return 404 for non-existent artifact', async () => {
      await request(betaClone.app)
        .get('/artifacts/non-existent-id')
        .expect(404);
    });
  });

  describe('Task Execution via HTTP', () => {
    it('should execute task via POST /task', async () => {
      const response = await request(betaClone.app)
        .post('/task')
        .send({
          prompt: 'Analyze this code pattern',
          context: { focus: 'performance' }
        })
        .expect(200);

      assert.exists(response.body);
      assert.isTrue(response.body.success);
      assert.exists(response.body.messages);
      assert.equal(response.body.clone, 'Beta');
    });

    it('should handle task execution errors', async () => {
      const response = await request(betaClone.app)
        .post('/task')
        .send({
          // Missing prompt - should cause validation error
          context: {}
        })
        .expect(500);

      assert.isFalse(response.body.success);
      assert.exists(response.body.error);
    });

    it('should support custom sessionId', async () => {
      const sessionId = 'test-session-123';
      const response = await request(betaClone.app)
        .post('/task')
        .send({
          prompt: 'Test task',
          sessionId
        })
        .expect(200);

      assert.equal(response.body.sessionId, sessionId);
    });
  });

  describe('Code Analysis via HTTP', () => {
    it('should analyze code via POST /analyze', async () => {
      const response = await request(betaClone.app)
        .post('/analyze')
        .send({
          code: 'function vulnerable(input) { eval(input); }',
          language: 'javascript'
        })
        .expect(200);

      assert.exists(response.body.analysis);
      assert.exists(response.body.artifact);
      assert.isTrue(response.body.success);
    });

    it('should handle analysis errors gracefully', async () => {
      const response = await request(betaClone.app)
        .post('/analyze')
        .send({
          // Missing code - should cause error
          language: 'javascript'
        })
        .expect(500);

      assert.isFalse(response.body.success);
      assert.exists(response.body.error);
    });
  });

  describe('Server Lifecycle', () => {
    it('should start server on configured port', async () => {
      await betaClone.start();

      assert.exists(betaClone.server);

      // Verify server is listening by making a request
      const response = await request(`http://localhost:${betaClone.port}`)
        .get('/health')
        .expect(200);

      assert.equal(response.body.role, 'Beta');
    });

    it('should stop server gracefully', async () => {
      await betaClone.start();
      assert.exists(betaClone.server);

      await betaClone.stop();

      // Server should be closed
      // Note: We can't easily test that server is truly closed without
      // trying to bind to the same port, which is complex in async tests
    });
  });

  describe('NO SIMULATIONS LAW Compliance', () => {
    it('should use real code analysis (not mocked)', async () => {
      const code = 'function test() { return "real"; }';
      const _result = await betaClone.analyzeCode(code, 'javascript');

      // Verify execution is marked as real in task execution evidence
      const records = betaClone.evidenceCollector.records;
      const taskRecord = records.find(r => r.operation === 'task_execution');
      assert.exists(taskRecord);
      assert.equal(taskRecord.execution, 'real');
    });

    it('should generate real SHA-256 checksums for artifacts', async () => {
      const code = 'const x = 1;';
      const result = await betaClone.analyzeCode(code, 'javascript');

      assert.exists(result.artifact.checksum);
      assert.equal(result.artifact.checksum.length, 64);
      assert.match(result.artifact.checksum, /^[a-f0-9]{64}$/);
    });

    it('should collect real evidence for all operations', async () => {
      await betaClone.analyzeCode('function test() {}', 'javascript');

      // Check for task execution evidence
      const records = betaClone.evidenceCollector.records;
      const taskRecord = records.find(r => r.operation === 'task_execution');
      
      assert.exists(taskRecord);
      assert.exists(taskRecord.evidenceId);
      assert.exists(taskRecord.timestamp);
      assert.equal(taskRecord.execution, 'real');
    });
  });
});
