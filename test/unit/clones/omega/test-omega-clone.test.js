/**
 * OmegaClone Unit Tests
 * 
 * Tests for Omega (Coordinator) clone specialization
 * NO SIMULATIONS LAW: Real evidence on orchestration attempts (even on failure)
 */

import { describe, it, beforeEach, afterEach } from 'mocha';
import { assert } from 'chai';
import request from 'supertest';
import OmegaClone from '../../../../src/clones/omega/OmegaClone.js';

describe('OmegaClone', () => {
  let omega;

  beforeEach(async () => {
    omega = new OmegaClone({
      testMode: true,
      port: 3097
    });
  });

  afterEach(async () => {
    if (omega && omega.server) {
      await omega.stop();
    }
  });

  describe('Constructor', () => {
    it('should create OmegaClone instance with coordinator role', () => {
      assert.exists(omega);
      assert.equal(omega.role, 'Omega');
      assert.include(omega.specialization, 'orchestration');
      assert.exists(omega.cloneRegistry);
      assert.exists(omega.app);
    });

    it('should include default clones in registry', () => {
      assert.property(omega.cloneRegistry, 'beta');
      assert.property(omega.cloneRegistry, 'gamma');
      assert.property(omega.cloneRegistry, 'delta');
      assert.property(omega.cloneRegistry, 'sigma');
    });

    it('should support registerClone()', () => {
      omega.registerClone('theta', 4000, 'misc');
      assert.property(omega.cloneRegistry, 'theta');
      assert.equal(omega.cloneRegistry.theta.port, 4000);
    });
  });

  describe('HTTP Routes', () => {
    it('should have GET /health', async () => {
      const res = await request(omega.app).get('/health').expect(200);
      assert.equal(res.body.role, 'Omega');
      assert.exists(res.body.metrics);
    });

    it('should have POST /task', async () => {
      const res = await request(omega.app)
        .post('/task')
        .send({ prompt: 'Coordinate a simple task', context: {} })
        .expect(200);
      assert.isTrue(res.body.success);
    });

    it('should have GET /network-status', async () => {
      const res = await request(omega.app).get('/network-status').expect(200);
      assert.exists(res.body.coordinator);
      assert.exists(res.body.clones);
      // In test env, clones are not running, should be reachable=false
      const clones = res.body.clones;
      for (const c of Object.keys(clones)) {
        assert.property(clones[c], 'reachable');
      }
    });

    it('should have POST /delegate and handle unknown clone error', async () => {
      const res = await request(omega.app)
        .post('/delegate')
        .send({ targetClone: 'unknown', prompt: 'hi' })
        .expect(500);
      assert.isFalse(res.body.success);
      assert.match(res.body.error, /Unknown clone/);
    });

    it('should have POST /orchestrate and fail gracefully when target clone not running', async () => {
      // Point beta to a guaranteed-unused high port to avoid accidental local listeners
      omega.registerClone('beta', 61555, 'Code analysis, debugging, security');

      const res = await request(omega.app)
        .post('/orchestrate')
        .send({
          objective: 'Analyze code for bugs',
          targetClone: 'beta', // not running in this test
          artifactManifests: [],
          essentialData: { code: 'function a(){}' }
        })
        .expect(500);
      assert.isFalse(res.body.success);
      assert.exists(res.body.error);
    });
  });

  describe('Server Lifecycle', () => {
    it('should start and stop server', async () => {
      await omega.start();
      assert.exists(omega.server);
      const res = await request(`http://localhost:${omega.port}`).get('/health').expect(200);
      assert.equal(res.body.role, 'Omega');
      await omega.stop();
    });
  });
});
