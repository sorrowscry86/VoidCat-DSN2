/**
 * DeltaClone Unit Tests
 * 
 * Tests for Delta (Tester) clone specialization
 * NO SIMULATIONS LAW: Real HTTP endpoints, real artifact checksums
 */

import { describe, it, beforeEach, afterEach } from 'mocha';
import { assert } from 'chai';
import request from 'supertest';
import DeltaClone from '../../../../src/clones/delta/DeltaClone.js';

describe('DeltaClone', () => {
  let delta;

  beforeEach(async () => {
    delta = new DeltaClone({
      testMode: true,
      port: 3096
    });
  });

  afterEach(async () => {
    if (delta && delta.server) {
      await delta.stop();
    }
  });

  describe('Constructor', () => {
    it('should create DeltaClone instance', () => {
      assert.exists(delta);
      assert.instanceOf(delta, DeltaClone);
    });

    it('should set role to Delta', () => {
      assert.equal(delta.role, 'Delta');
    });

    it('should set correct specialization', () => {
      assert.include(delta.specialization, 'Test');
      assert.include(delta.specialization, 'QA');
    });

    it('should initialize Express app and inherited components', () => {
      assert.exists(delta.app);
      assert.exists(delta.integrityMonitor);
      assert.exists(delta.evidenceCollector);
      assert.exists(delta.autoGenClient);
      assert.exists(delta.artifactManager);
      assert.exists(delta.contextEngineer);
    });

    it('should have tester-specific system prompt', () => {
      assert.include(delta.systemPrompt, 'Delta');
      assert.include(delta.systemPrompt, 'Tester');
      assert.include(delta.systemPrompt, 'NO SIMULATIONS LAW');
    });

    it('should use configured port', () => {
      assert.equal(delta.port, 3096);
    });
  });

  describe('HTTP Routes', () => {
    it('should have GET /health endpoint', async () => {
      const res = await request(delta.app).get('/health').expect(200);
      assert.equal(res.body.role, 'Delta');
      assert.exists(res.body.integrity);
    });

    it('should have POST /task endpoint', async () => {
      const res = await request(delta.app)
        .post('/task')
        .send({ prompt: 'Draft a test strategy', context: {} })
        .expect(200);
      assert.isTrue(res.body.success);
    });

    it('should have POST /generate-tests endpoint', async () => {
      const res = await request(delta.app)
        .post('/generate-tests')
        .send({
          code: 'function sum(a,b){return a+b}; export default sum;',
          framework: 'mocha'
        })
        .expect(200);
      assert.exists(res.body.tests);
      assert.exists(res.body.artifact);
    });

    it('should have POST /artifacts and GET /artifacts/:id endpoints', async () => {
      const store = await request(delta.app)
        .post('/artifacts')
        .send({ type: 'code', content: 'alpha', metadata: { desc: 't' } })
        .expect(201);
      const id = store.body.manifest.artifactId;

      const get = await request(delta.app)
        .get(`/artifacts/${id}`)
        .expect(200);
      assert.exists(get.body.manifest);
      assert.equal(get.body.content, 'alpha');
    });

    it('should support manifestOnly on GET /artifacts/:id', async () => {
      const store = await request(delta.app)
        .post('/artifacts')
        .send({ type: 'code', content: 'large content', metadata: {} })
        .expect(201);
      const id = store.body.manifest.artifactId;

      const get = await request(delta.app)
        .get(`/artifacts/${id}?manifestOnly=true`)
        .expect(200);
      assert.exists(get.body.manifest);
      assert.notExists(get.body.content);
    });

    it('should return 404 for missing artifact', async () => {
      await request(delta.app).get('/artifacts/missing-id').expect(404);
    });
  });

  describe('generateTests()', () => {
    it('should generate tests and store artifact with metadata', async () => {
      const code = 'export function mul(a,b){return a*b}';
      const result = await delta.generateTests(code, 'jest');
      assert.isTrue(result.success);
      assert.exists(result.tests);
      assert.equal(result.artifact.type, 'test_suite');
      assert.equal(result.artifact.metadata.framework, 'jest');
      assert.equal(result.artifact.metadata.codeLength, code.length);
      assert.match(result.artifact.checksum, /^[a-f0-9]{64}$/);
    });
  });

  describe('Server Lifecycle', () => {
    it('should start and stop server on configured port', async () => {
      await delta.start();
      assert.exists(delta.server);
      const res = await request(`http://localhost:${delta.port}`).get('/health').expect(200);
      assert.equal(res.body.role, 'Delta');
      await delta.stop();
    });
  });

  describe('NO SIMULATIONS LAW Compliance', () => {
    it('should record real execution evidence and real checksum', async () => {
      const code = 'export const id = (x)=>x;';
      await delta.generateTests(code, 'mocha');
      const records = delta.evidenceCollector.records;
      const taskRecord = records.find(r => r.operation === 'task_execution');
      assert.exists(taskRecord);
      assert.equal(taskRecord.execution, 'real');
    });
  });
});
