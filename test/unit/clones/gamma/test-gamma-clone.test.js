01/**
 * GammaClone Unit Tests
 * 
 * Tests for Gamma (Architect) clone specialization
 * NO SIMULATIONS LAW: Real HTTP endpoints, real evidence and checksums
 */

import { describe, it, beforeEach, afterEach } from 'mocha';
import { assert } from 'chai';
import request from 'supertest';
import GammaClone from '../../../../src/clones/gamma/GammaClone.js';

describe('GammaClone', () => {
  let gammaClone;

  beforeEach(async () => {
    gammaClone = new GammaClone({
      testMode: true,
      port: 3098 // use a dedicated test port
    });
  });

  afterEach(async () => {
    if (gammaClone && gammaClone.server) {
      await gammaClone.stop();
    }
  });

  describe('Constructor', () => {
    it('should create GammaClone instance', () => {
      assert.exists(gammaClone);
      assert.instanceOf(gammaClone, GammaClone);
    });

    it('should set role to Gamma', () => {
      assert.equal(gammaClone.role, 'Gamma');
    });

    it('should set correct specialization', () => {
      assert.include(gammaClone.specialization, 'System design');
      assert.include(gammaClone.specialization, 'architecture patterns');
      assert.include(gammaClone.specialization, 'optimization');
    });

    it('should initialize Express app and inherited components', () => {
      assert.exists(gammaClone.app);
      assert.exists(gammaClone.integrityMonitor);
      assert.exists(gammaClone.evidenceCollector);
      assert.exists(gammaClone.autoGenClient);
      assert.exists(gammaClone.artifactManager);
      assert.exists(gammaClone.contextEngineer);
    });

    it('should have architect-specific system prompt', () => {
      assert.include(gammaClone.systemPrompt, 'Gamma');
      assert.include(gammaClone.systemPrompt, 'Architect');
      assert.include(gammaClone.systemPrompt, 'NO SIMULATIONS LAW');
    });

    it('should use configured port or default', () => {
      assert.equal(gammaClone.port, 3098);
    });
  });

  describe('HTTP Routes', () => {
    it('should have GET /health endpoint', async () => {
      const res = await request(gammaClone.app).get('/health').expect(200);
      assert.equal(res.body.role, 'Gamma');
      assert.exists(res.body.integrity);
    });

    it('should have POST /task endpoint', async () => {
      const res = await request(gammaClone.app)
        .post('/task')
        .send({ prompt: 'High-level architecture evaluation', context: {} })
        .expect(200);
      assert.isTrue(res.body.success);
      assert.equal(res.body.clone, 'Gamma');
    });

    it('should have POST /design endpoint', async () => {
      const res = await request(gammaClone.app)
        .post('/design')
        .send({
          requirements: 'Design a scalable web API with auth and rate limiting.',
          constraints: 'Must use Node.js and PostgreSQL.'
        })
        .expect(200);
      assert.isTrue(res.body.success);
      assert.exists(res.body.design);
      assert.exists(res.body.artifact);
    });

    it('should have POST /artifacts endpoint and GET /artifacts/:id', async () => {
      const store = await request(gammaClone.app)
        .post('/artifacts')
        .send({ type: 'architecture_design', content: 'sample', metadata: { source: 'test' } })
        .expect(201);
      assert.isTrue(store.body.success);
      const id = store.body.manifest.artifactId;

      const retrieve = await request(gammaClone.app)
        .get(`/artifacts/${id}`)
        .expect(200);
      assert.exists(retrieve.body.manifest);
      assert.exists(retrieve.body.content);
    });
  });

  describe('designArchitecture()', () => {
    it('should generate a design and store as artifact', async () => {
      const requirements = 'Design an event-driven microservices system with resilience.';
      const constraints = 'Deployable with Docker Compose.';
      const result = await gammaClone.designArchitecture(requirements, constraints, { focus: 'scalability' });

      assert.isTrue(result.success);
      assert.exists(result.design);
      assert.exists(result.artifact);
      assert.equal(result.artifact.type, 'architecture_design');
      assert.equal(result.artifact.metadata.hasConstraints, true);

      // Evidence should have a task_execution record marked real
      const taskRecord = gammaClone.evidenceCollector.records.find(r => r.operation === 'task_execution');
      assert.exists(taskRecord);
      assert.equal(taskRecord.execution, 'real');
    });
  });

  describe('Server Lifecycle', () => {
    it('should start and stop server on configured port', async () => {
      await gammaClone.start();
      assert.exists(gammaClone.server);

      const res = await request(`http://localhost:${gammaClone.port}`)
        .get('/health')
        .expect(200);
      assert.equal(res.body.role, 'Gamma');

      await gammaClone.stop();
    });
  });

  describe('NO SIMULATIONS LAW Compliance', () => {
    it('should mark execution as real and create real checksums', async () => {
      const reqs = 'Design a logging subsystem with rotation and alerts.';
      const out = await gammaClone.designArchitecture(reqs, '', {});

      const taskRecord = gammaClone.evidenceCollector.records.find(r => r.operation === 'task_execution');
      assert.exists(taskRecord);
      assert.equal(taskRecord.execution, 'real');

      assert.exists(out.artifact.checksum);
      assert.equal(out.artifact.checksum.length, 64);
      assert.match(out.artifact.checksum, /^[a-f0-9]{64}$/);
    });
  });
});
