/**
 * ArtifactManager - Version-Controlled Work Products with SHA-256 Checksums
 * 
 * Manages storage, retrieval, and integrity verification of artifacts.
 * NO SIMULATIONS LAW: All checksums are real SHA-256 hashes.
 * 
 * Features:
 * - SHA-256 checksum verification for all artifacts
 * - Manifest-based artifact tracking
 * - Automatic integrity verification on retrieval
 * - Storage statistics and reporting
 */

import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

export default class ArtifactManager {
  constructor(artifactDir = '/tmp/sanctuary-workspace/artifacts') {
    this.artifactDir = artifactDir;
    this.manifestDir = path.join(path.dirname(artifactDir), 'manifests');
    this.ensureDirectories();
  }

  /**
   * Ensure artifact and manifest directories exist
   * @private
   */
  ensureDirectories() {
    if (!fs.existsSync(this.artifactDir)) {
      fs.mkdirSync(this.artifactDir, { recursive: true });
    }
    if (!fs.existsSync(this.manifestDir)) {
      fs.mkdirSync(this.manifestDir, { recursive: true });
    }
  }

  /**
   * Calculate SHA-256 checksum for content
   * NO SIMULATIONS LAW: Real cryptographic hash
   * 
   * @param {string} content - Content to hash
   * @returns {string} SHA-256 hash (64 character hex string)
   */
  calculateChecksum(content) {
    return crypto.createHash('sha256').update(content).digest('hex');
  }

  /**
   * Store artifact with automatic checksum and manifest generation
   * 
   * @param {string} type - Artifact type (code, documentation, schema, configuration)
   * @param {string} content - Artifact content
   * @param {object} metadata - Additional metadata
   * @returns {object} Artifact manifest
   */
  storeArtifact(type, content, metadata = {}) {
    const artifactId = uuidv4();
    const checksum = this.calculateChecksum(content);
    const timestamp = new Date().toISOString();
    const size = Buffer.byteLength(content, 'utf8');

    // Create manifest
    const manifest = {
      artifactId,
      type,
      checksum,
      size,
      timestamp,
      metadata,
      location: `file://${path.join(this.artifactDir, artifactId)}`
    };

    // Store artifact content
    const artifactPath = path.join(this.artifactDir, artifactId);
    fs.writeFileSync(artifactPath, content, 'utf8');

    // Store manifest
    const manifestPath = path.join(this.manifestDir, `${artifactId}.json`);
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf8');

    return manifest;
  }

  /**
   * Retrieve artifact with automatic checksum verification
   * Throws error if checksum mismatch detected
   * 
   * @param {string} artifactId - Artifact ID
   * @param {object} options - Retrieval options
   * @param {boolean} options.manifestOnly - Return only manifest without content
   * @returns {object} Object with manifest and content (if manifestOnly=false)
   */
  retrieveArtifact(artifactId, options = {}) {
    const manifestPath = path.join(this.manifestDir, `${artifactId}.json`);
    
    if (!fs.existsSync(manifestPath)) {
      throw new Error(`Manifest not found for artifact ${artifactId}`);
    }

    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

    if (options.manifestOnly) {
      return { manifest };
    }

    const artifactPath = path.join(this.artifactDir, artifactId);
    
    if (!fs.existsSync(artifactPath)) {
      throw new Error(`Artifact file not found: ${artifactId}`);
    }

    const content = fs.readFileSync(artifactPath, 'utf8');

    // Verify integrity
    const calculatedChecksum = this.calculateChecksum(content);
    if (calculatedChecksum !== manifest.checksum) {
      throw new Error(`Checksum mismatch for artifact ${artifactId}. File may be corrupted.`);
    }

    return {
      manifest,
      content
    };
  }

  /**
   * List all artifact manifests
   * 
   * @returns {Array<object>} Array of manifests
   */
  listArtifacts() {
    if (!fs.existsSync(this.manifestDir)) {
      return [];
    }

    const manifestFiles = fs.readdirSync(this.manifestDir)
      .filter(file => file.endsWith('.json'));

    return manifestFiles.map(file => {
      const manifestPath = path.join(this.manifestDir, file);
      return JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    });
  }

  /**
   * Delete artifact and its manifest
   * 
   * @param {string} artifactId - Artifact ID
   * @returns {boolean} True if deleted successfully
   */
  deleteArtifact(artifactId) {
    const artifactPath = path.join(this.artifactDir, artifactId);
    const manifestPath = path.join(this.manifestDir, `${artifactId}.json`);

    let deleted = false;

    if (fs.existsSync(artifactPath)) {
      fs.unlinkSync(artifactPath);
      deleted = true;
    }

    if (fs.existsSync(manifestPath)) {
      fs.unlinkSync(manifestPath);
      deleted = true;
    }

    return deleted;
  }

  /**
   * Get storage statistics
   * 
   * @returns {object} Statistics including count and total size
   */
  getStatistics() {
    const manifests = this.listArtifacts();
    const totalSize = manifests.reduce((sum, m) => sum + (m.size || 0), 0);

    return {
      totalArtifacts: manifests.length,
      totalSize,
      averageSize: manifests.length > 0 ? Math.round(totalSize / manifests.length) : 0,
      byType: this._getStatisticsByType(manifests)
    };
  }

  /**
   * Get statistics grouped by artifact type
   * @private
   */
  _getStatisticsByType(manifests) {
    const stats = {};
    
    manifests.forEach(manifest => {
      const type = manifest.type || 'unknown';
      if (!stats[type]) {
        stats[type] = { count: 0, totalSize: 0 };
      }
      stats[type].count++;
      stats[type].totalSize += manifest.size || 0;
    });

    return stats;
  }

  /**
   * Check if ArtifactManager is initialized
   * Used for health checks
   * 
   * @returns {boolean} True if directories exist
   */
  isInitialized() {
    return fs.existsSync(this.artifactDir) && fs.existsSync(this.manifestDir);
  }
}
