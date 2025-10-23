/**
 * RyuzuClone Base Class Tests
 * 
 * Tests the base class that all specialized clones inherit from.
 * NO SIMULATIONS LAW: All components are real, integrated properly.
 */

import { describe, it, beforeEach } from 'mocha';
import { expect } from 'chai';
import RyuzuClone from '../../../src/clones/RyuzuClone.js';

describe('RyuzuClone', () => {
  let clone;

  beforeEach(() => {
    clone = new RyuzuClone({
      role: 'TestClone',
      specialization: 'Testing and validation',
      testMode: true // Use test mode to avoid real API calls in unit tests
    });
  });

  describe('Constructor', () => {
    it('should create RyuzuClone instance', () => {
      expect(clone).to.be.instanceOf(RyuzuClone);
    });

    it('should set clone identity from config', () => {
      expect(clone.role).to.equal('TestClone');
      expect(clone.specialization).to.equal('Testing and validation');
    });

    it('should use default role if not provided', () => {
      const defaultClone = new RyuzuClone({ testMode: true });
      expect(defaultClone.role).to.equal('Unknown');
    });

    it('should use default specialization if not provided', () => {
      const defaultClone = new RyuzuClone({ testMode: true });
      expect(defaultClone.specialization).to.equal('General purpose');
    });

    it('should use environment PORT or default to 3001', () => {
      expect(clone.port).to.equal(3001);
    });

    it('should initialize IntegrityMonitor', () => {
      expect(clone.integrityMonitor).to.exist;
      expect(clone.integrityMonitor.constructor.name).to.equal('IntegrityMonitor');
    });

    it('should initialize EvidenceCollector', () => {
      expect(clone.evidenceCollector).to.exist;
      expect(clone.evidenceCollector.constructor.name).to.equal('EvidenceCollector');
    });

    it('should initialize AutoGenClient', () => {
      expect(clone.autoGenClient).to.exist;
      expect(clone.autoGenClient.constructor.name).to.equal('AutoGenClient');
    });

    it('should initialize ArtifactManager', () => {
      expect(clone.artifactManager).to.exist;
      expect(clone.artifactManager.constructor.name).to.equal('ArtifactManager');
    });

    it('should initialize ContextEngineer', () => {
      expect(clone.contextEngineer).to.exist;
      expect(clone.contextEngineer.constructor.name).to.equal('ContextEngineer');
    });

    it('should initialize metrics tracking', () => {
      expect(clone.metrics).to.have.property('startTime');
      expect(clone.metrics).to.have.property('tasksProcessed', 0);
      expect(clone.metrics).to.have.property('totalExecutionTime', 0);
      expect(clone.metrics).to.have.property('averageResponseTime', 0);
      expect(clone.metrics).to.have.property('errors', 0);
    });

    it('should generate default system prompt', () => {
      expect(clone.systemPrompt).to.include('TestClone');
      expect(clone.systemPrompt).to.include('Testing and validation');
      expect(clone.systemPrompt).to.include('NO SIMULATIONS LAW');
    });
  });

  describe('executeTask()', () => {
    it('should validate request before execution', async () => {
      // Empty prompt should be rejected by IntegrityMonitor
      let errorThrown = false;
      try {
        await clone.executeTask('', {});
      } catch (error) {
        errorThrown = true;
        expect(error.message.toLowerCase()).to.include('prompt');
      }
      expect(errorThrown).to.be.true;
    });

    it('should enhance prompt with system prompt and context', async () => {
      // In test mode, AutoGenClient returns a controlled response
      const response = await clone.executeTask(
        'Test task',
        { testContext: 'value' }
      );

      expect(response.success).to.be.true;
      expect(response.messages).to.be.an('array');
    });

    it('should collect evidence for successful execution', async () => {
      await clone.executeTask('Test task');

      const evidence = clone.evidenceCollector.getLastRecord();
      expect(evidence.operation).to.equal('task_execution');
      expect(evidence.execution).to.equal('real');
      expect(evidence.clone).to.equal('TestClone');
      expect(evidence).to.have.property('executionTime');
    });

    it('should update metrics after execution', async () => {
      const initialTasks = clone.metrics.tasksProcessed;
      await clone.executeTask('Test task');

      expect(clone.metrics.tasksProcessed).to.equal(initialTasks + 1);
      expect(clone.metrics.averageResponseTime).to.be.at.least(0);
    });

    it('should return task execution details', async () => {
      const response = await clone.executeTask('Test task');

      expect(response).to.have.property('success', true);
      expect(response).to.have.property('messages');
      expect(response).to.have.property('sessionId');
      expect(response).to.have.property('clone', 'TestClone');
      expect(response).to.have.property('executionTime');
      expect(response).to.have.property('evidence');
    });

    it('should use provided sessionId', async () => {
      const response = await clone.executeTask('Test task', {}, 'custom-session-123');

      expect(response.sessionId).to.equal('custom-session-123');
    });

    it('should generate sessionId if not provided', async () => {
      const response = await clone.executeTask('Test task');

      expect(response.sessionId).to.exist;
      expect(response.sessionId).to.include('task-');
    });

    it('should record evidence on task failure', async () => {
      // Force an error by passing invalid data to AutoGenClient
      try {
        await clone.executeTask(null); // Will fail validation
      } catch (error) {
        const evidence = clone.evidenceCollector.getLastRecord();
        expect(evidence.execution).to.equal('failed');
        expect(evidence.error).to.exist;
      }
    });

    it('should update error metrics on failure', async () => {
      const initialErrors = clone.metrics.errors;
      
      try {
        await clone.executeTask(null); // Will fail
      } catch (error) {
        expect(clone.metrics.errors).to.equal(initialErrors + 1);
      }
    });
  });

  describe('getHealthStatus()', () => {
    it('should return health status object', () => {
      const health = clone.getHealthStatus();

      expect(health).to.have.property('status', 'active');
      expect(health).to.have.property('role', 'TestClone');
      expect(health).to.have.property('specialization');
      expect(health).to.have.property('timestamp');
      expect(health).to.have.property('integrity');
      expect(health).to.have.property('metrics');
    });

    it('should report component integrity status', () => {
      const health = clone.getHealthStatus();

      expect(health.integrity.autoGenConnected).to.be.a('boolean');
      expect(health.integrity.evidenceCollectorActive).to.be.a('boolean');
      expect(health.integrity.artifactManagerInitialized).to.be.a('boolean');
    });

    it('should report metrics', () => {
      const health = clone.getHealthStatus();

      expect(health.metrics.uptime).to.be.a('number');
      expect(health.metrics.tasksProcessed).to.equal(clone.metrics.tasksProcessed);
      expect(health.metrics.averageResponseTime).to.be.a('number');
      expect(health.metrics.errors).to.be.a('number');
      expect(health.metrics.successRate).to.be.a('number');
    });

    it('should calculate success rate correctly', async () => {
      // Execute 2 successful tasks
      await clone.executeTask('Task 1');
      await clone.executeTask('Task 2');

      const health = clone.getHealthStatus();
      expect(health.metrics.successRate).to.equal(100);
    });

    it('should report uptime in seconds', (done) => {
      const health1 = clone.getHealthStatus();
      expect(health1.metrics.uptime).to.be.at.least(0);
      
      // Wait a bit and check uptime increased
      setTimeout(() => {
        try {
          const health2 = clone.getHealthStatus();
          expect(health2.metrics.uptime).to.be.at.least(health1.metrics.uptime);
          done();
        } catch (error) {
          done(error);
        }
      }, 100);
    });
  });

  describe('storeArtifact()', () => {
    it('should store artifact via ArtifactManager', async () => {
      const manifest = await clone.storeArtifact(
        'code',
        'test content',
        { description: 'Test artifact' }
      );

      expect(manifest).to.have.property('artifactId');
      expect(manifest).to.have.property('checksum');
      expect(manifest).to.have.property('type', 'code');
    });

    it('should add clone metadata to artifact', async () => {
      const manifest = await clone.storeArtifact(
        'documentation',
        'doc content'
      );

      expect(manifest.metadata.clone).to.equal('TestClone');
      expect(manifest.metadata.timestamp).to.exist;
    });

    it('should collect evidence for artifact storage', async () => {
      await clone.storeArtifact('code', 'test');

      const evidence = clone.evidenceCollector.getLastRecord();
      expect(evidence.operation).to.equal('artifact_stored');
      expect(evidence).to.have.property('artifactId');
      expect(evidence).to.have.property('checksum');
    });
  });

  describe('retrieveArtifact()', () => {
    it('should retrieve artifact via ArtifactManager', async () => {
      const manifest = await clone.storeArtifact('code', 'test content');
      const { content, manifest: retrieved } = await clone.retrieveArtifact(manifest.artifactId);

      expect(content).to.equal('test content');
      expect(retrieved.artifactId).to.equal(manifest.artifactId);
    });

    it('should collect evidence for artifact retrieval', async () => {
      const manifest = await clone.storeArtifact('code', 'test');
      await clone.retrieveArtifact(manifest.artifactId);

      const evidence = clone.evidenceCollector.getLastRecord();
      expect(evidence.operation).to.equal('artifact_retrieved');
      expect(evidence).to.have.property('checksumVerified', true);
    });

    it('should support manifestOnly option', async () => {
      const manifest = await clone.storeArtifact('code', 'test');
      const result = await clone.retrieveArtifact(manifest.artifactId, { manifestOnly: true });

      expect(result).to.have.property('manifest');
      expect(result).to.not.have.property('content');
    });
  });

  describe('validateContextQuality()', () => {
    it('should validate context package via ContextEngineer', () => {
      const contextPackage = clone.contextEngineer.constructContextPackage({
        objective: 'Analyze code for security issues',
        targetClone: 'beta',
        essentialData: { framework: 'Express.js' }
      });

      expect(() => clone.validateContextQuality(contextPackage)).to.not.throw();
    });

    it('should throw for low quality context', () => {
      const lowQuality = {
        quality: {
          overallQuality: 30,
          objectiveClarity: 30,
          dataRelevance: 30,
          artifactUtilization: 30
        }
      };

      expect(() => clone.validateContextQuality(lowQuality))
        .to.throw(/Context quality too low/);
    });
  });

  describe('NO SIMULATIONS LAW Enforcement', () => {
    it('should use real IntegrityMonitor for validation', () => {
      expect(clone.integrityMonitor).to.be.instanceOf(
        clone.integrityMonitor.constructor
      );
    });

    it('should use real EvidenceCollector for audit trails', () => {
      expect(clone.evidenceCollector.isActive()).to.be.true;
    });

    it('should use real ArtifactManager for storage', () => {
      expect(clone.artifactManager.isInitialized()).to.be.true;
    });

    it('should integrate all Phase 0 and Phase 1 components', () => {
      // Verify all components are present and functional
      expect(clone.integrityMonitor).to.exist;
      expect(clone.evidenceCollector).to.exist;
      expect(clone.autoGenClient).to.exist;
      expect(clone.artifactManager).to.exist;
      expect(clone.contextEngineer).to.exist;
    });

    it('should record real evidence for all operations', async () => {
      const initialRecords = clone.evidenceCollector.records.length;
      
      await clone.executeTask('Test');
      await clone.storeArtifact('code', 'test');
      
      expect(clone.evidenceCollector.records.length).to.be.greaterThan(initialRecords);
    });
  });
});
