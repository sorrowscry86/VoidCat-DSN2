/**
 * EvidenceCollector
 * 
 * Audit trail generation and evidence recording system.
 * All operations generate verifiable evidence for compliance and traceability.
 * 
 * Key Responsibilities:
 * - Record evidence with unique IDs and timestamps
 * - Generate audit trails for tasks
 * - Write immutable audit logs to file system
 * - Provide evidence retrieval and querying
 * 
 * @class EvidenceCollector
 */

import { randomUUID } from 'crypto';
import fs from 'fs/promises';
import path from 'path';

export default class EvidenceCollector {
  constructor(options = {}) {
    this.auditDir = options.auditDir || path.join(process.cwd(), 'workspace', 'audit');
    this.records = [];
    this.active = true;
  }

  /**
   * Check if evidence collection is active
   * @returns {boolean} True if active
   */
  isActive() {
    return this.active;
  }

  /**
   * Record evidence
   * 
   * @param {Object} evidence - Evidence object
   * @param {string} evidence.operation - Operation being performed
   * @param {string} evidence.execution - Execution type ('real', 'failed')
   * @param {string} [evidence.evidenceId] - Optional evidence ID (auto-generated if not provided)
   * @param {string} [evidence.timestamp] - Optional timestamp (auto-generated if not provided)
   * @returns {Object} Recorded evidence with generated fields
   * @throws {Error} If operation is missing
   */
  record(evidence) {
    if (!evidence.operation) {
      throw new Error('Operation is required');
    }

    const record = {
      evidenceId: evidence.evidenceId || randomUUID(),
      timestamp: evidence.timestamp || new Date().toISOString(),
      ...evidence
    };

    this.records.push(record);
    return record;
  }

  /**
   * Get the most recently recorded evidence
   * @returns {Object|null} Last evidence record or null if no records
   */
  getLastRecord() {
    if (this.records.length === 0) {
      return null;
    }
    return this.records[this.records.length - 1];
  }

  /**
   * Get all records for a specific task ID
   * 
   * @param {string} taskId - Task ID to filter by
   * @returns {Array} Array of evidence records
   */
  getRecords(taskId) {
    return this.records.filter(record => record.taskId === taskId);
  }

  /**
   * Write evidence record to daily audit log file
   * 
   * @param {Object} record - Evidence record to write
   * @returns {Promise<void>}
   */
  async writeToAuditLog(record) {
    // Ensure audit directory exists
    await fs.mkdir(this.auditDir, { recursive: true });

    // Generate daily log file name
    const today = new Date().toISOString().split('T')[0];
    const logFile = path.join(this.auditDir, `${today}-audit.log`);

    // Append record as JSON line
    const logLine = JSON.stringify(record) + '\n';
    await fs.appendFile(logFile, logLine, 'utf-8');
  }

  /**
   * Generate audit trail for a task
   * 
   * @param {string} taskId - Task ID
   * @returns {Object} Audit trail with all records for task
   */
  generateAuditTrail(taskId) {
    const records = this.getRecords(taskId);

    if (records.length === 0) {
      return {
        taskId,
        totalRecords: 0,
        records: [],
        startTime: null,
        endTime: null
      };
    }

    return {
      taskId,
      totalRecords: records.length,
      records: records,
      startTime: records[0].timestamp,
      endTime: records[records.length - 1].timestamp
    };
  }
}
