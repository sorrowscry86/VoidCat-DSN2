/**
 * Integration: Omega orchestrates to a live Beta clone
 * Ensures real inter-clone communication without mocks (NO SIMULATIONS LAW)
 */

import { describe, it, before, after } from 'mocha';
import { assert } from 'chai';
import request from 'supertest';
import BetaClone from '../../src/clones/beta/BetaClone.js';
import OmegaClone from '../../src/clones/omega/OmegaClone.js';

// Choose non-conflicting ports for integration test
const BETA_PORT = 3112;
const OMEGA_PORT = 3111;

describe('Integration: Omega -> Beta orchestration', () => {
  let beta;
  let omega;

  before(async () => {
    beta = new BetaClone({ testMode: true, port: BETA_PORT });
    omega = new OmegaClone({ testMode: true, port: OMEGA_PORT });

    // Start both servers
    await beta.start();
    await omega.start();

    // Point Omega to the live Beta port for this test
    omega.registerClone('beta', BETA_PORT, 'Code analysis, debugging, security');
  });

  after(async () => {
    if (omega && omega.server) await omega.stop();
    if (beta && beta.server) await beta.stop();
  });

  it('should orchestrate to Beta and return a real execution result', async () => {
    const res = await request(`http://localhost:${OMEGA_PORT}`)
      .post('/orchestrate')
      .send({
        objective: 'Analyze code for potential bugs and security issues',
        targetClone: 'beta',
        artifactManifests: [],
        essentialData: { code: 'function inc(x){return x+1};', language: 'javascript' },
        sessionId: 'int-test-session-omega-beta'
      })
      .expect(200);

    assert.isTrue(res.body.success);
    assert.exists(res.body.result);
    assert.isTrue(res.body.result.success);
    // Evidence of real execution is tracked within clones; check common fields
    assert.exists(res.body.contextQuality);
    assert.isAtLeast(res.body.contextQuality.overallQuality, 40);
  });
});
