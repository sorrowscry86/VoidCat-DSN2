/**
 * EvidenceCollector Unit Tests
 * 
 * Tests for audit trail generation and evidence recording
 * Following TDD: write tests first, then implement
 */

import { describe, it, beforeEach, afterEach } from 'mocha';
import { assert } from 'chai';
import EvidenceCollector from '../../../../src/infrastructure/evidence/EvidenceCollector.js';
import fs from 'fs/promises';
import path from 'path';

describe('EvidenceCollector', () => {
  let evidenceCollector;
  const testAuditDir = path.join(process.cwd(), 'test-audit');

  beforeEach(async () => {
    // Create test audit directory
    await fs.mkdir(testAuditDir, { recursive: true });
    evidenceCollector = new EvidenceCollector({ auditDir: testAuditDir });
  });

  afterEach(async () => {
    // Cleanup test audit directory
    try {
      await fs.rm(testAuditDir, { recursive: true, force: true });
    } catch (_error) {
      // Ignore cleanup errors
    }
  });

  describe('Constructor', () => {
    it('should create EvidenceCollector instance', () => {
      assert.exists(evidenceCollector);
      assert.instanceOf(evidenceCollector, EvidenceCollector);
    });

    it('should initialize with active status', () => {
      assert.isTrue(evidenceCollector.isActive());
    });
  });

  describe('record()', () => {
    it('should record evidence with required fields', () => {
      const evidence = {
        operation: 'test_operation',
        execution: 'real',
        timestamp: new Date().toISOString()
      };

      const record = evidenceCollector.record(evidence);

      assert.exists(record);
      assert.exists(record.evidenceId);
      assert.equal(record.operation, 'test_operation');
      assert.equal(record.execution, 'real');
      assert.exists(record.timestamp);
    });

    it('should auto-generate evidenceId if not provided', () => {
      const evidence = {
        operation: 'auto_id_test',
        execution: 'real'
      };

      const record = evidenceCollector.record(evidence);

      assert.exists(record.evidenceId);
      assert.match(record.evidenceId, /^[a-f0-9-]{36}$/); // UUID format
    });

    it('should auto-generate timestamp if not provided', () => {
      const evidence = {
        operation: 'auto_timestamp_test',
        execution: 'real'
      };

      const record = evidenceCollector.record(evidence);

      assert.exists(record.timestamp);
      assert.doesNotThrow(() => new Date(record.timestamp));
    });

    it('should preserve additional metadata', () => {
      const evidence = {
        operation: 'metadata_test',
        execution: 'real',
        taskId: 'task-123',
        cloneRole: 'Beta',
        executionTime: 287
      };

      const record = evidenceCollector.record(evidence);

      assert.equal(record.taskId, 'task-123');
      assert.equal(record.cloneRole, 'Beta');
      assert.equal(record.executionTime, 287);
    });

    it('should throw error for missing operation', () => {
      const evidence = {
        execution: 'real'
      };

      assert.throws(
        () => evidenceCollector.record(evidence),
        /Operation is required/
      );
    });
  });

  describe('getLastRecord()', () => {
    it('should return most recently recorded evidence', () => {
      const evidence1 = {
        operation: 'first',
        execution: 'real'
      };
      const evidence2 = {
        operation: 'second',
        execution: 'real'
      };

      evidenceCollector.record(evidence1);
      const record2 = evidenceCollector.record(evidence2);
      const lastRecord = evidenceCollector.getLastRecord();

      assert.equal(lastRecord.evidenceId, record2.evidenceId);
      assert.equal(lastRecord.operation, 'second');
    });

    it('should return null if no records exist', () => {
      const lastRecord = evidenceCollector.getLastRecord();
      assert.isNull(lastRecord);
    });
  });

  describe('getRecords()', () => {
    it('should return all records for given taskId', () => {
      const taskId = 'task-456';

      evidenceCollector.record({
        operation: 'op1',
        execution: 'real',
        taskId
      });
      evidenceCollector.record({
        operation: 'op2',
        execution: 'real',
        taskId
      });
      evidenceCollector.record({
        operation: 'op3',
        execution: 'real',
        taskId: 'different-task'
      });

      const records = evidenceCollector.getRecords(taskId);

      assert.equal(records.length, 2);
      assert.isTrue(records.every(r => r.taskId === taskId));
    });

    it('should return empty array if no matching records', () => {
      const records = evidenceCollector.getRecords('nonexistent-task');
      assert.isArray(records);
      assert.isEmpty(records);
    });
  });

  describe('writeToAuditLog()', () => {
    it('should write evidence to daily audit log file', async () => {
      const evidence = {
        operation: 'file_write_test',
        execution: 'real'
      };

      const record = evidenceCollector.record(evidence);
      await evidenceCollector.writeToAuditLog(record);

      // Verify file was created
      const today = new Date().toISOString().split('T')[0];
      const logFile = path.join(testAuditDir, `${today}-audit.log`);
      
      const fileExists = await fs.access(logFile).then(() => true).catch(() => false);
      assert.isTrue(fileExists);

      // Verify content
      const content = await fs.readFile(logFile, 'utf-8');
      const logLines = content.trim().split('\n');
      const lastLine = logLines[logLines.length - 1];
      const parsedRecord = JSON.parse(lastLine);

      assert.equal(parsedRecord.evidenceId, record.evidenceId);
      assert.equal(parsedRecord.operation, 'file_write_test');
    });

    it('should append to existing audit log', async () => {
      const evidence1 = { operation: 'append1', execution: 'real' };
      const evidence2 = { operation: 'append2', execution: 'real' };

      const record1 = evidenceCollector.record(evidence1);
      const record2 = evidenceCollector.record(evidence2);

      await evidenceCollector.writeToAuditLog(record1);
      await evidenceCollector.writeToAuditLog(record2);

      const today = new Date().toISOString().split('T')[0];
      const logFile = path.join(testAuditDir, `${today}-audit.log`);
      const content = await fs.readFile(logFile, 'utf-8');
      const logLines = content.trim().split('\n');

      assert.equal(logLines.length, 2);
    });
  });

  describe('generateAuditTrail()', () => {
    it('should generate audit trail for taskId', () => {
      const taskId = 'audit-trail-task';

      evidenceCollector.record({
        operation: 'start',
        execution: 'real',
        taskId
      });
      evidenceCollector.record({
        operation: 'process',
        execution: 'real',
        taskId
      });
      evidenceCollector.record({
        operation: 'complete',
        execution: 'real',
        taskId
      });

      const auditTrail = evidenceCollector.generateAuditTrail(taskId);

      assert.exists(auditTrail);
      assert.equal(auditTrail.taskId, taskId);
      assert.equal(auditTrail.totalRecords, 3);
      assert.isArray(auditTrail.records);
      assert.equal(auditTrail.records.length, 3);
    });

    it('should include timestamps in audit trail', () => {
      const taskId = 'timestamp-trail';

      evidenceCollector.record({ operation: 'op1', execution: 'real', taskId });
      const auditTrail = evidenceCollector.generateAuditTrail(taskId);

      assert.exists(auditTrail.startTime);
      assert.exists(auditTrail.endTime);
    });
  });
});
