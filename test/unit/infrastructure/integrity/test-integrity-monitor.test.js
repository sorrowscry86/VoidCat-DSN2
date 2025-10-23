/**
 * IntegrityMonitor Unit Tests
 * 
 * Tests for NO SIMULATIONS LAW enforcement and integrity verification
 * Following TDD: write tests first, then implement
 */

import { describe, it, beforeEach } from 'mocha';
import { assert } from 'chai';
import IntegrityMonitor from '../../../../src/infrastructure/integrity/IntegrityMonitor.js';

describe('IntegrityMonitor', () => {
  let integrityMonitor;

  beforeEach(() => {
    integrityMonitor = new IntegrityMonitor();
  });

  describe('Constructor', () => {
    it('should create IntegrityMonitor instance', () => {
      assert.exists(integrityMonitor);
      assert.instanceOf(integrityMonitor, IntegrityMonitor);
    });

    it('should initialize with verification enabled', () => {
      assert.isTrue(integrityMonitor.isVerificationEnabled());
    });
  });

  describe('calculateChecksum()', () => {
    it('should calculate SHA-256 checksum for string content', () => {
      const content = 'Hello, Digital Sanctuary!';
      const checksum = integrityMonitor.calculateChecksum(content);
      
      assert.exists(checksum);
      assert.equal(checksum.length, 64); // SHA-256 produces 64 hex characters
      assert.match(checksum, /^[a-f0-9]{64}$/); // Hex format
    });

    it('should produce consistent checksums for same content', () => {
      const content = 'Consistency test';
      const checksum1 = integrityMonitor.calculateChecksum(content);
      const checksum2 = integrityMonitor.calculateChecksum(content);
      
      assert.equal(checksum1, checksum2);
    });

    it('should produce different checksums for different content', () => {
      const content1 = 'Content A';
      const content2 = 'Content B';
      
      const checksum1 = integrityMonitor.calculateChecksum(content1);
      const checksum2 = integrityMonitor.calculateChecksum(content2);
      
      assert.notEqual(checksum1, checksum2);
    });

    it('should throw error for null content', () => {
      assert.throws(
        () => integrityMonitor.calculateChecksum(null),
        /Content cannot be null or undefined/
      );
    });

    it('should throw error for undefined content', () => {
      assert.throws(
        () => integrityMonitor.calculateChecksum(undefined),
        /Content cannot be null or undefined/
      );
    });
  });

  describe('verifyChecksum()', () => {
    it('should return true for matching checksum', () => {
      const content = 'Verify me';
      const checksum = integrityMonitor.calculateChecksum(content);
      
      const isValid = integrityMonitor.verifyChecksum(content, checksum);
      assert.isTrue(isValid);
    });

    it('should return false for mismatched checksum', () => {
      const content = 'Original content';
      const checksum = integrityMonitor.calculateChecksum(content);
      
      const tamperedContent = 'Tampered content';
      const isValid = integrityMonitor.verifyChecksum(tamperedContent, checksum);
      
      assert.isFalse(isValid);
    });

    it('should throw error for null checksum', () => {
      assert.throws(
        () => integrityMonitor.verifyChecksum('content', null),
        /Expected checksum cannot be null or undefined/
      );
    });
  });

  describe('NO SIMULATIONS LAW Enforcement', () => {
    it('should detect real execution marker', () => {
      const response = { execution: 'real', data: 'AI response' };
      const isReal = integrityMonitor.verifyRealExecution(response);
      
      assert.isTrue(isReal);
    });

    it('should reject execution without marker', () => {
      const response = { data: 'AI response' };
      
      assert.throws(
        () => integrityMonitor.verifyRealExecution(response),
        /NO SIMULATIONS LAW VIOLATION: Missing execution marker/
      );
    });

    it('should reject simulated execution', () => {
      const response = { execution: 'simulated', data: 'Mock response' };
      
      assert.throws(
        () => integrityMonitor.verifyRealExecution(response),
        /NO SIMULATIONS LAW VIOLATION: Execution type must be 'real'/
      );
    });

    it('should reject failed execution without marker', () => {
      const response = { execution: 'failed', data: null };
      
      // Failed is acceptable as long as it's marked (not simulated)
      assert.throws(
        () => integrityMonitor.verifyRealExecution(response),
        /NO SIMULATIONS LAW VIOLATION: Execution type must be 'real'/
      );
    });

    it('should accept real execution with additional metadata', () => {
      const response = {
        execution: 'real',
        model: 'claude-3-5-sonnet-20241022',
        timestamp: new Date().toISOString(),
        data: 'Response'
      };
      
      const isReal = integrityMonitor.verifyRealExecution(response);
      assert.isTrue(isReal);
    });
  });

  describe('verifyRequest()', () => {
    it('should verify valid request object', () => {
      const request = {
        prompt: 'Analyze this code',
        context: 'Security audit',
        sessionId: 'session-123'
      };
      
      const result = integrityMonitor.verifyRequest(request);
      assert.isTrue(result.valid);
      assert.isEmpty(result.errors);
    });

    it('should reject request without prompt', () => {
      const request = {
        context: 'Some context',
        sessionId: 'session-123'
      };
      
      const result = integrityMonitor.verifyRequest(request);
      assert.isFalse(result.valid);
      assert.include(result.errors, 'Missing required field: prompt');
    });

    it('should reject request with empty prompt', () => {
      const request = {
        prompt: '',
        context: 'Context',
        sessionId: 'session-123'
      };
      
      const result = integrityMonitor.verifyRequest(request);
      assert.isFalse(result.valid);
      assert.include(result.errors, 'Prompt cannot be empty');
    });

    it('should accept request without sessionId (optional)', () => {
      const request = {
        prompt: 'Valid prompt',
        context: 'Context'
      };
      
      const result = integrityMonitor.verifyRequest(request);
      assert.isTrue(result.valid);
    });
  });

  describe('Integration with Evidence Collection', () => {
    it('should record verification result', () => {
      const content = 'Test content';
      const checksum = integrityMonitor.calculateChecksum(content);
      
      const result = integrityMonitor.verifyChecksumWithEvidence(content, checksum);
      
      assert.isTrue(result.verified);
      assert.exists(result.evidence);
      assert.equal(result.evidence.operation, 'checksum_verification');
      assert.exists(result.evidence.timestamp);
    });
  });
});
