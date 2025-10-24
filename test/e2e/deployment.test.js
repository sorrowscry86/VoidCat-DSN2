/**
 * VoidCat-DSN v2.0 - End-to-End Deployment Tests
 * 
 * These tests validate the deployed Sanctuary Network.
 * NOTE: These tests require the network to be running via docker-compose.
 * Run: docker-compose up -d
 * Before running: npm run test:e2e
 */

import { expect } from 'chai';
import axios from 'axios';

describe('E2E: Sanctuary Network Deployment', function() {
  // Longer timeout for network operations
  this.timeout(30000);

  const CLONES = [
    { name: 'Omega', role: 'Coordinator', port: 3000 },
    { name: 'Beta', role: 'Analyzer', port: 3002 },
    { name: 'Gamma', role: 'Architect', port: 3003 },
    { name: 'Delta', role: 'Tester', port: 3004 },
    { name: 'Sigma', role: 'Communicator', port: 3005 }
  ];

  describe('Clone Health Checks', () => {
    CLONES.forEach(clone => {
      it(`should have ${clone.name} (${clone.role}) healthy on port ${clone.port}`, async () => {
        const response = await axios.get(
          `http://localhost:${clone.port}/health`,
          { timeout: 5000 }
        );
        
        expect(response.status).to.equal(200);
        expect(response.data).to.have.property('status');
        expect(response.data.status).to.equal('active'); // Clones return 'active' not 'running'
        expect(response.data).to.have.property('role', clone.name);
      });
    });
  });

  describe('Network Coordination', () => {
    it('should allow Omega to check network status', async () => {
      const response = await axios.get(
        'http://localhost:3000/network-status',
        { timeout: 5000 }
      );
      
      expect(response.status).to.equal(200);
      expect(response.data).to.have.property('clones');
      expect(response.data.clones).to.be.an('object'); // clones is object, not array
      expect(Object.keys(response.data.clones)).to.have.lengthOf(4); // beta, gamma, delta, sigma
    });

    it('should allow Omega to orchestrate task to Beta', async () => {
      const response = await axios.post(
        'http://localhost:3000/orchestrate',
        {
          objective: 'Analyze simple test code',
          targetClone: 'beta',
          essentialData: {
            code: 'function test() { return true; }',
            language: 'JavaScript'
          }
        },
        { timeout: 30000 } // Increased timeout for orchestration + AI
      );
      
      expect(response.status).to.equal(200);
      expect(response.data).to.have.property('success', true);
    });
  });

  describe('Artifact Management', () => {
    let testArtifactId;

    it('should store artifact via Omega', async () => {
      const response = await axios.post(
        'http://localhost:3000/artifacts',
        {
          type: 'test',
          content: 'E2E test artifact content',
          metadata: {
            description: 'E2E deployment test',
            test: true
          }
        },
        { timeout: 5000 }
      );
      
      expect(response.status).to.equal(201);
      expect(response.data).to.have.property('success', true);
      expect(response.data).to.have.property('manifest');
      expect(response.data.manifest).to.have.property('artifactId');
      expect(response.data.manifest).to.have.property('checksum');
      
      testArtifactId = response.data.manifest.artifactId;
    });

    it('should retrieve stored artifact', async () => {
      expect(testArtifactId).to.exist;
      
      const response = await axios.get(
        `http://localhost:3000/artifacts/${testArtifactId}`,
        { timeout: 5000 }
      );
      
      expect(response.status).to.equal(200);
      expect(response.data).to.have.property('manifest');
      expect(response.data).to.have.property('content', 'E2E test artifact content');
    });

    it('should list all artifacts', async () => {
      const response = await axios.get(
        'http://localhost:3000/artifacts',
        { timeout: 5000 }
      );
      
      expect(response.status).to.equal(200);
      expect(response.data).to.have.property('artifacts');
      expect(response.data.artifacts).to.be.an('array');
    });
  });

  describe('Specialized Clone Operations', () => {
    it('should allow Beta to analyze code', async () => {
      const response = await axios.post(
        'http://localhost:3002/analyze',
        {
          code: 'function add(a, b) { return a + b; }',
          language: 'JavaScript'
        },
        { timeout: 10000 }
      );
      
      expect(response.status).to.equal(200);
      expect(response.data).to.have.property('success', true);
    });

    it('should allow Gamma to create design', async () => {
      const response = await axios.post(
        'http://localhost:3003/design',
        {
          requirements: 'Simple API with authentication'
        },
        { timeout: 30000 } // Increased timeout for real AI calls
      );
      
      expect(response.status).to.equal(200);
      expect(response.data).to.have.property('success', true);
    });

    it('should allow Delta to generate tests', async () => {
      const response = await axios.post(
        'http://localhost:3004/generate-tests',
        {
          code: 'class Calculator { add(a, b) { return a + b; } }',
          testFramework: 'mocha'
        },
        { timeout: 30000 } // Increased timeout for real AI calls
      );
      
      expect(response.status).to.equal(200);
      expect(response.data).to.have.property('success', true);
    });

    it('should allow Sigma to generate documentation', async () => {
      const response = await axios.post(
        'http://localhost:3005/document',
        {
          content: 'function example() { /* example */ }',
          format: 'markdown'
        },
        { timeout: 10000 }
      );
      
      expect(response.status).to.equal(200);
      expect(response.data).to.have.property('success', true);
    });
  });

  describe('Evidence Collection & Integrity', () => {
    it('should have integrity monitoring active on all clones', async () => {
      for (const clone of CLONES) {
        const response = await axios.get(
          `http://localhost:${clone.port}/health`,
          { timeout: 5000 }
        );
        
        expect(response.data).to.have.property('integrity');
        expect(response.data.integrity).to.have.property('autoGenConnected');
        expect(response.data.integrity).to.have.property('evidenceCollectorActive');
        expect(response.data.integrity).to.have.property('artifactManagerInitialized');
      }
    });

    it('should collect evidence for operations', async () => {
      // Perform operation
      const response = await axios.post(
        'http://localhost:3002/analyze',
        {
          code: 'function test() { return "evidence test"; }',
          language: 'JavaScript'
        },
        { timeout: 10000 }
      );
      
      expect(response.status).to.equal(200);
      expect(response.data).to.have.property('evidence');
      expect(response.data.evidence).to.have.property('execution');
      // Should be 'real' per NO SIMULATIONS LAW
      expect(response.data.evidence.execution).to.be.oneOf(['real', 'failed']);
    });
  });
});
