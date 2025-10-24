/**
 * SigmaClone Unit Tests
 * 
 * Tests for Sigma (Communicator) clone specialization
 * NO SIMULATIONS LAW: Real HTTP endpoints, real artifact checksums
 */

import { describe, it, beforeEach, afterEach } from 'mocha';
import { assert } from 'chai';
import request from 'supertest';
import SigmaClone from '../../../../src/clones/sigma/SigmaClone.js';

describe('SigmaClone', () => {
  let sigma;

  beforeEach(async () => {
    sigma = new SigmaClone({
      testMode: true,
      port: 3095
    });
  });

  afterEach(async () => {
    if (sigma && sigma.server) {
      await sigma.stop();
    }
  });

  describe('Constructor', () => {
    it('should create SigmaClone instance', () => {
      assert.exists(sigma);
      assert.instanceOf(sigma, SigmaClone);
    });

    it('should set role to Sigma and correct specialization', () => {
      assert.equal(sigma.role, 'Sigma');
      assert.include(sigma.specialization, 'Documentation');
    });

    it('should initialize Express app and inherited components', () => {
      assert.exists(sigma.app);
      assert.exists(sigma.integrityMonitor);
      assert.exists(sigma.evidenceCollector);
      assert.exists(sigma.autoGenClient);
      assert.exists(sigma.artifactManager);
      assert.exists(sigma.contextEngineer);
    });

    it('should have communicator-specific system prompt', () => {
      assert.include(sigma.systemPrompt, 'Sigma');
      assert.include(sigma.systemPrompt, 'Communicator');
      assert.include(sigma.systemPrompt, 'NO SIMULATIONS LAW');
    });
  });

  describe('HTTP Routes', () => {
    it('should have GET /health', async () => {
      const res = await request(sigma.app).get('/health').expect(200);
      assert.equal(res.body.role, 'Sigma');
    });

    it('should have POST /task', async () => {
      const res = await request(sigma.app)
        .post('/task')
        .send({ prompt: 'Draft README outline', context: {} })
        .expect(200);
      assert.isTrue(res.body.success);
    });

    it('should have POST /document', async () => {
      const res = await request(sigma.app)
        .post('/document')
        .send({
          content: 'export function f(x){return x+1}',
          type: 'api'
        })
        .expect(200);
      assert.exists(res.body.documentation);
      assert.exists(res.body.artifact);
    });

    it('should have artifact endpoints', async () => {
      const store = await request(sigma.app)
        .post('/artifacts')
        .send({ type: 'documentation', content: 'hello', metadata: { a: 1 } })
        .expect(201);
      const id = store.body.manifest.artifactId;

      const get = await request(sigma.app).get(`/artifacts/${id}`).expect(200);
      assert.equal(get.body.content, 'hello');

      const getManifestOnly = await request(sigma.app)
        .get(`/artifacts/${id}?manifestOnly=true`)
        .expect(200);
      assert.exists(getManifestOnly.body.manifest);
      assert.notExists(getManifestOnly.body.content);
    });

    it('should 404 on missing artifact', async () => {
      await request(sigma.app).get('/artifacts/missing').expect(404);
    });
  });

  describe('generateDocumentation()', () => {
    it('should generate documentation and store artifact with metadata', async () => {
      const code = 'export const inc=(n)=>n+1;';
      const result = await sigma.generateDocumentation(code, 'readme', { audience: 'devs' });
      assert.isTrue(result.success);
      assert.exists(result.documentation);
      assert.equal(result.artifact.type, 'documentation');
      assert.equal(result.artifact.metadata.docType, 'readme');
      assert.equal(result.artifact.metadata.codeLength, code.length);
      assert.equal(result.artifact.metadata.audience, 'devs');
      assert.match(result.artifact.checksum, /^[a-f0-9]{64}$/);
    });
  });

  describe('Server Lifecycle', () => {
    it('should start and stop server', async () => {
      await sigma.start();
      assert.exists(sigma.server);
      const res = await request(`http://localhost:${sigma.port}`).get('/health').expect(200);
      assert.equal(res.body.role, 'Sigma');
      await sigma.stop();
    });
  });

  describe('NO SIMULATIONS LAW Compliance', () => {
    it('should record real execution evidence and checksum', async () => {
      const code = 'export default function greet(n){return n}';
      await sigma.generateDocumentation(code, 'inline');
      const records = sigma.evidenceCollector.records;
      const taskRecord = records.find(r => r.operation === 'task_execution');
      assert.exists(taskRecord);
      assert.equal(taskRecord.execution, 'real');
    });
  });
});
