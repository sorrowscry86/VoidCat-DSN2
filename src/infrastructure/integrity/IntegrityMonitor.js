/**
 * IntegrityMonitor
 * 
 * Core integrity verification system enforcing the NO SIMULATIONS LAW
 * and providing SHA-256 checksum verification for data integrity.
 * 
 * Key Responsibilities:
 * - Calculate and verify SHA-256 checksums
 * - Enforce NO SIMULATIONS LAW (reject non-real AI execution)
 * - Validate request structures
 * - Generate evidence for verification operations
 * 
 * @class IntegrityMonitor
 */

import crypto from 'crypto';

export default class IntegrityMonitor {
  constructor() {
    this.verificationEnabled = true;
  }

  /**
   * Check if verification is enabled
   * @returns {boolean} True if verification is enabled
   */
  isVerificationEnabled() {
    return this.verificationEnabled;
  }

  /**
   * Calculate SHA-256 checksum for content
   * 
   * @param {string} content - Content to hash
   * @returns {string} 64-character hex SHA-256 checksum
   * @throws {Error} If content is null or undefined
   */
  calculateChecksum(content) {
    if (content === null || content === undefined) {
      throw new Error('Content cannot be null or undefined');
    }

    // Convert to string if not already
    const contentString = typeof content === 'string' ? content : JSON.stringify(content);

    // Calculate SHA-256 hash
    const hash = crypto.createHash('sha256');
    hash.update(contentString);
    return hash.digest('hex');
  }

  /**
   * Verify content matches expected checksum
   * 
   * @param {string} content - Content to verify
   * @param {string} expectedChecksum - Expected SHA-256 checksum
   * @returns {boolean} True if checksum matches
   * @throws {Error} If expected checksum is null or undefined
   */
  verifyChecksum(content, expectedChecksum) {
    if (expectedChecksum === null || expectedChecksum === undefined) {
      throw new Error('Expected checksum cannot be null or undefined');
    }

    const actualChecksum = this.calculateChecksum(content);
    return actualChecksum === expectedChecksum;
  }

  /**
   * Verify checksum and generate evidence record
   * 
   * @param {string} content - Content to verify
   * @param {string} expectedChecksum - Expected checksum
   * @returns {Object} Verification result with evidence
   */
  verifyChecksumWithEvidence(content, expectedChecksum) {
    const verified = this.verifyChecksum(content, expectedChecksum);
    
    return {
      verified,
      evidence: {
        operation: 'checksum_verification',
        verified,
        expectedChecksum,
        actualChecksum: this.calculateChecksum(content),
        timestamp: new Date().toISOString()
      }
    };
  }

  /**
   * Verify real AI execution (NO SIMULATIONS LAW enforcement)
   * 
   * This method enforces the NO SIMULATIONS LAW by verifying that
   * AI responses have the 'execution: real' marker. Any attempt to
   * use simulated, mocked, or fabricated responses will be rejected.
   * 
   * @param {Object} response - AI response object to verify
   * @returns {boolean} True if execution is verified as real
   * @throws {Error} If execution marker is missing or not 'real'
   */
  verifyRealExecution(response) {
    if (!response || !response.execution) {
      throw new Error('NO SIMULATIONS LAW VIOLATION: Missing execution marker');
    }

    if (response.execution !== 'real') {
      throw new Error(
        `NO SIMULATIONS LAW VIOLATION: Execution type must be 'real', got '${response.execution}'`
      );
    }

    return true;
  }

  /**
   * Verify request structure
   * 
   * @param {Object} request - Request object to verify
   * @returns {Object} Validation result with errors array
   */
  verifyRequest(request) {
    const errors = [];

    // Check required fields
    if (!request.prompt && request.prompt !== '') {
      errors.push('Missing required field: prompt');
    } else if (request.prompt === '' || (request.prompt && request.prompt.trim() === '')) {
      errors.push('Prompt cannot be empty');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}
