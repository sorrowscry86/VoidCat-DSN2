/**
 * Tests for ArtifactManager
 * 
 * Validates artifact storage, retrieval, checksum verification,
 * and manifest management.
 */

import { describe, it, beforeEach, afterEach } from 'mocha';
import { assert } from 'chai';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import ArtifactManager from '../../../../src/infrastructure/artifacts/ArtifactManager.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

describe('ArtifactManager', () => {
  let artifactManager;
  let testArtifactDir;
  let testManifestDir;

  beforeEach(() => {
    // Create unique test directories for each test
    const testId = Math.random().toString(36).substring(7);
    const testRootDir = path.join(__dirname, '../../../..', `.tmp-test-${testId}`);
    testArtifactDir = path.join(testRootDir, 'artifacts');
    testManifestDir = path.join(testRootDir, 'manifests');
    
    // Clean up before each test
    if (fs.existsSync(testRootDir)) {
      fs.rmSync(testRootDir, { recursive: true, force: true });
    }
    artifactManager = new ArtifactManager(testArtifactDir);
  });

  afterEach(() => {
    // Clean up after each test
    const testRootDir = path.dirname(testArtifactDir);
    if (fs.existsSync(testRootDir)) {
      fs.rmSync(testRootDir, { recursive: true, force: true });
    }
  });

  describe('initialization', () => {
    it('should create artifact and manifest directories', () => {
      assert.isTrue(fs.existsSync(testArtifactDir));
      assert.isTrue(fs.existsSync(testManifestDir));
    });

    it('should report as initialized', () => {
      assert.isTrue(artifactManager.isInitialized());
    });
  });

  describe('calculateChecksum()', () => {
    it('should calculate SHA-256 checksum', () => {
      const content = 'test content';
      const checksum = artifactManager.calculateChecksum(content);
      
      assert.exists(checksum);
      assert.equal(checksum.length, 64); // SHA-256 is 64 hex characters
      assert.match(checksum, /^[a-f0-9]{64}$/);
    });

    it('should produce consistent checksums for same content', () => {
      const content = 'consistent content';
      const checksum1 = artifactManager.calculateChecksum(content);
      const checksum2 = artifactManager.calculateChecksum(content);
      
      assert.equal(checksum1, checksum2);
    });

    it('should produce different checksums for different content', () => {
      const checksum1 = artifactManager.calculateChecksum('content 1');
      const checksum2 = artifactManager.calculateChecksum('content 2');
      
      assert.notEqual(checksum1, checksum2);
    });
  });

  describe('storeArtifact()', () => {
    it('should store artifact with manifest', () => {
      const manifest = artifactManager.storeArtifact(
        'code',
        'class Test {}',
        { description: 'Test class' }
      );

      assert.exists(manifest.artifactId);
      assert.equal(manifest.type, 'code');
      assert.exists(manifest.checksum);
      assert.equal(manifest.checksum.length, 64);
      assert.exists(manifest.timestamp);
      assert.equal(manifest.size, Buffer.byteLength('class Test {}', 'utf8'));
      assert.deepEqual(manifest.metadata, { description: 'Test class' });
    });

    it('should create artifact file on disk', () => {
      const manifest = artifactManager.storeArtifact('code', 'test content', {});
      const artifactPath = path.join(testArtifactDir, manifest.artifactId);
      
      assert.isTrue(fs.existsSync(artifactPath));
      assert.equal(fs.readFileSync(artifactPath, 'utf8'), 'test content');
    });

    it('should create manifest file on disk', () => {
      const manifest = artifactManager.storeArtifact('code', 'test', {});
      const manifestPath = path.join(testManifestDir, `${manifest.artifactId}.json`);
      
      assert.isTrue(fs.existsSync(manifestPath));
    });

    it('should generate unique artifact IDs', () => {
      const manifest1 = artifactManager.storeArtifact('code', 'content 1', {});
      const manifest2 = artifactManager.storeArtifact('code', 'content 2', {});
      
      assert.notEqual(manifest1.artifactId, manifest2.artifactId);
    });
  });

  describe('retrieveArtifact()', () => {
    it('should retrieve artifact with content', () => {
      const content = 'function test() { return true; }';
      const manifest = artifactManager.storeArtifact('code', content, {});
      
      const result = artifactManager.retrieveArtifact(manifest.artifactId);
      
      assert.equal(result.content, content);
      assert.deepEqual(result.manifest, manifest);
    });

    it('should retrieve manifest only when requested', () => {
      const manifest = artifactManager.storeArtifact('code', 'test', {});
      
      const result = artifactManager.retrieveArtifact(
        manifest.artifactId,
        { manifestOnly: true }
      );
      
      assert.exists(result.manifest);
      assert.notExists(result.content);
    });

    it('should verify checksum on retrieval', () => {
      const manifest = artifactManager.storeArtifact('code', 'original', {});
      
      // Corrupt the file
      const artifactPath = path.join(testArtifactDir, manifest.artifactId);
      fs.writeFileSync(artifactPath, 'corrupted', 'utf8');
      
      assert.throws(
        () => artifactManager.retrieveArtifact(manifest.artifactId),
        /Checksum mismatch/
      );
    });

    it('should throw error for non-existent artifact', () => {
      assert.throws(
        () => artifactManager.retrieveArtifact('non-existent-id'),
        /Manifest not found/
      );
    });
  });

  describe('listArtifacts()', () => {
    it('should return empty array when no artifacts', () => {
      const manifests = artifactManager.listArtifacts();
      assert.isArray(manifests);
      assert.equal(manifests.length, 0);
    });

    it('should list all artifact manifests', () => {
      artifactManager.storeArtifact('code', 'content 1', {});
      artifactManager.storeArtifact('documentation', 'content 2', {});
      artifactManager.storeArtifact('schema', 'content 3', {});
      
      const manifests = artifactManager.listArtifacts();
      
      assert.equal(manifests.length, 3);
      assert.exists(manifests[0].artifactId);
      assert.exists(manifests[0].type);
      assert.exists(manifests[0].checksum);
    });
  });

  describe('deleteArtifact()', () => {
    it('should delete artifact and manifest', () => {
      const manifest = artifactManager.storeArtifact('code', 'test', {});
      const artifactPath = path.join(testArtifactDir, manifest.artifactId);
      const manifestPath = path.join(testManifestDir, `${manifest.artifactId}.json`);
      
      assert.isTrue(fs.existsSync(artifactPath));
      assert.isTrue(fs.existsSync(manifestPath));
      
      const deleted = artifactManager.deleteArtifact(manifest.artifactId);
      
      assert.isTrue(deleted);
      assert.isFalse(fs.existsSync(artifactPath));
      assert.isFalse(fs.existsSync(manifestPath));
    });

    it('should return true even if artifact does not exist', () => {
      const deleted = artifactManager.deleteArtifact('non-existent-id');
      assert.isFalse(deleted);
    });
  });

  describe('getStatistics()', () => {
    it('should return zero statistics for empty manager', () => {
      const stats = artifactManager.getStatistics();
      
      assert.equal(stats.totalArtifacts, 0);
      assert.equal(stats.totalSize, 0);
      assert.equal(stats.averageSize, 0);
    });

    it('should calculate correct statistics', () => {
      artifactManager.storeArtifact('code', 'x'.repeat(100), {});
      artifactManager.storeArtifact('code', 'y'.repeat(200), {});
      
      const stats = artifactManager.getStatistics();
      
      assert.equal(stats.totalArtifacts, 2);
      assert.equal(stats.totalSize, 300);
      assert.equal(stats.averageSize, 150);
    });

    it('should group statistics by type', () => {
      artifactManager.storeArtifact('code', 'test1', {});
      artifactManager.storeArtifact('code', 'test2', {});
      artifactManager.storeArtifact('documentation', 'test3', {});
      
      const stats = artifactManager.getStatistics();
      
      assert.equal(stats.byType.code.count, 2);
      assert.equal(stats.byType.documentation.count, 1);
    });
  });
});
