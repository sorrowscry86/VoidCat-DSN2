/**
 * ArtifactManager - SHA-256 Verified Artifact Storage
 * 
 * Manages work products with cryptographic integrity verification.
 * NO SIMULATIONS LAW: Real SHA-256 checksums, real file I/O, no mocks.
 * 
 * Features:
 * - Real SHA-256 checksum calculation for all artifacts
 * - Lightweight manifest storage (<1KB references)
 * - Corruption detection via checksum verification
 * - Version control and metadata support
 * - Type-based filtering and statistics
 * 
 * Storage Structure:
 * - Artifacts: /tmp/sanctuary-workspace/artifacts/{uuid}.artifact
 * - Manifests: In-memory index with file:// URIs
 */

import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

export default class ArtifactManager {
  constructor(artifactDir = '/tmp/sanctuary-workspace/artifacts') {
    this.artifactDir = artifactDir;
    this.manifestIndex = {};
    this.initialized = false;
    
    this.ensureDirectory();
    this.initialized = true;
  }

  /**
   * Ensure artifact directory exists
   * Creates directory structure if not present
   */
  ensureDirectory() {
    if (!fs.existsSync(this.artifactDir)) {
      fs.mkdirSync(this.artifactDir, { recursive: true });
    }
  }

  /**
   * Calculate real SHA-256 checksum for content
   * NO SIMULATIONS LAW: Uses Node.js crypto module, not mocks
   * 
   * @param {string} content - Content to checksum
   * @returns {string} SHA-256 hash (64 character hex)
   */
  calculateChecksum(content) {
    return crypto.createHash('sha256').update(content).digest('hex');
  }

  /**
   * Store artifact with metadata and SHA-256 checksum
   * NO SIMULATIONS LAW: Real file I/O, real checksum calculation
   * 
   * @param {string} type - Artifact type (code, documentation, schema, configuration)
   * @param {string} content - Artifact content
   * @param {Object} metadata - Additional metadata
   * @returns {Object} Manifest with artifactId, checksum, location, etc.
   */
  storeArtifact(type, content, metadata = {}) {
    const artifactId = uuidv4();
    
    // Calculate real SHA-256 checksum
    const checksum = this.calculateChecksum(content);
    
    // Create file path
    const filename = `${artifactId}.artifact`;
    const filePath = path.join(this.artifactDir, filename);
    
    // Write to disk (real file I/O)
    fs.writeFileSync(filePath, content, 'utf-8');
    
    // Get file statistics
    const stats = fs.statSync(filePath);
    
    // Create manifest
    const manifest = {
      artifactId,
      type,
      checksum,
      location: `file://${filePath}`,
      timestamp: new Date().toISOString(),
      size: stats.size,
      metadata
    };
    
    // Store in manifest index
    this.manifestIndex[artifactId] = manifest;
    
    return manifest;
  }

  /**
   * Retrieve artifact by ID with checksum verification
   * NO SIMULATIONS LAW: Real file I/O, real checksum verification
   * 
   * @param {string} artifactId - Artifact ID
   * @param {Object} options - Options (manifestOnly: boolean)
   * @returns {Object} { manifest, content } or { manifest } if manifestOnly
   * @throws {Error} If artifact not found or checksum mismatch
   */
  retrieveArtifact(artifactId, options = {}) {
    // Check manifest exists
    if (!this.manifestIndex[artifactId]) {
      throw new Error(`Artifact ${artifactId} not found in manifest index`);
    }
    
    const manifest = this.manifestIndex[artifactId];
    
    // If manifestOnly requested, return just manifest
    if (options.manifestOnly) {
      return { manifest };
    }
    
    // Read from disk
    const location = manifest.location.replace('file://', '');
    
    if (!fs.existsSync(location)) {
      throw new Error(`Artifact file not found at ${location}`);
    }
    
    const content = fs.readFileSync(location, 'utf-8');
    
    // Verify checksum (corruption detection)
    const calculatedChecksum = this.calculateChecksum(content);
    
    if (calculatedChecksum !== manifest.checksum) {
      throw new Error(
        `Checksum mismatch for artifact ${artifactId}. ` +
        `Expected: ${manifest.checksum}, Got: ${calculatedChecksum}. ` +
        `Artifact may be corrupted.`
      );
    }
    
    return { manifest, content };
  }

  /**
   * List all artifacts with optional filtering
   * 
   * @param {Object} options - Filter options (type: string)
   * @returns {Array} Array of manifests
   */
  listArtifacts(options = {}) {
    let manifests = Object.values(this.manifestIndex);
    
    // Filter by type if specified
    if (options.type) {
      manifests = manifests.filter(m => m.type === options.type);
    }
    
    return manifests;
  }

  /**
   * Delete artifact by ID
   * Removes both file and manifest entry
   * 
   * @param {string} artifactId - Artifact ID
   * @returns {boolean} True if deleted, false if not found
   */
  deleteArtifact(artifactId) {
    // Check if exists
    if (!this.manifestIndex[artifactId]) {
      return false;
    }
    
    const manifest = this.manifestIndex[artifactId];
    const location = manifest.location.replace('file://', '');
    
    // Delete file from disk
    if (fs.existsSync(location)) {
      fs.unlinkSync(location);
    }
    
    // Remove from manifest index
    delete this.manifestIndex[artifactId];
    
    return true;
  }

  /**
   * Get storage statistics
   * 
   * @returns {Object} { totalArtifacts, totalSize }
   */
  getStatistics() {
    const manifests = Object.values(this.manifestIndex);
    const totalArtifacts = manifests.length;
    
    let totalSize = 0;
    
    manifests.forEach(manifest => {
      totalSize += manifest.size || 0;
    });
    
    return {
      totalArtifacts,
      totalSize
    };
  }

  /**
   * Check if manager is initialized
   * 
   * @returns {boolean} True if initialized
   */
  isInitialized() {
    return this.initialized;
  }
}
