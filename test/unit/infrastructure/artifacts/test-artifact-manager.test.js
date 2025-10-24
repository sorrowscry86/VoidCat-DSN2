/**
 * ArtifactManager Unit Tests
 * 
 * Tests for SHA-256 verified artifact storage with manifests
 * Following TDD: write tests first, then implement
 * NO SIMULATIONS LAW: Real checksums, real file I/O
 */

import { describe, it, beforeEach, afterEach } from 'mocha';
import { assert } from 'chai';
import fs from 'fs';
import path from 'path';
import ArtifactManager from '../../../../src/infrastructure/artifacts/ArtifactManager.js';

describe('ArtifactManager', () => {
  let artifactManager;
  const testArtifactDir = './test-workspace/artifacts';

  beforeEach(() => {
    // Create fresh test directory
    if (fs.existsSync(testArtifactDir)) {
      fs.rmSync(testArtifactDir, { recursive: true, force: true });
    }
    fs.mkdirSync(testArtifactDir, { recursive: true });
    
    artifactManager = new ArtifactManager(testArtifactDir);
  });

  afterEach(() => {
    // Cleanup test directory
    if (fs.existsSync(testArtifactDir)) {
      fs.rmSync(testArtifactDir, { recursive: true, force: true });
    }
  });

  describe('Constructor', () => {
    it('should create ArtifactManager instance', () => {
      assert.exists(artifactManager);
      assert.instanceOf(artifactManager, ArtifactManager);
    });

    it('should initialize with specified artifact directory', () => {
      assert.equal(artifactManager.artifactDir, testArtifactDir);
    });

    it('should create artifact directory if it does not exist', () => {
      const newDir = './test-workspace/new-artifacts';
      if (fs.existsSync(newDir)) {
        fs.rmSync(newDir, { recursive: true, force: true });
      }
      
      const manager = new ArtifactManager(newDir);
      assert.isTrue(fs.existsSync(newDir));
      
      // Cleanup
      fs.rmSync(newDir, { recursive: true, force: true });
    });

    it('should initialize with empty manifest index', () => {
      const artifacts = artifactManager.listArtifacts();
      assert.isArray(artifacts);
      assert.equal(artifacts.length, 0);
    });

    it('should be initialized', () => {
      assert.isTrue(artifactManager.isInitialized());
    });
  });

  describe('storeArtifact()', () => {
    it('should store artifact with type, content, and metadata', () => {
      const manifest = artifactManager.storeArtifact(
        'code',
        'class Test {}',
        { description: 'Test class', language: 'JavaScript' }
      );

      assert.exists(manifest);
      assert.exists(manifest.artifactId);
      assert.equal(manifest.type, 'code');
      assert.exists(manifest.checksum);
      assert.exists(manifest.location);
    });

    it('should generate unique artifact IDs', () => {
      const manifest1 = artifactManager.storeArtifact('code', 'content1', {});
      const manifest2 = artifactManager.storeArtifact('code', 'content2', {});

      assert.notEqual(manifest1.artifactId, manifest2.artifactId);
    });

    it('should calculate real SHA-256 checksum', () => {
      const manifest = artifactManager.storeArtifact('code', 'test content', {});

      assert.exists(manifest.checksum);
      assert.equal(manifest.checksum.length, 64); // SHA-256 produces 64 hex characters
      assert.match(manifest.checksum, /^[a-f0-9]{64}$/);
    });

    it('should produce consistent checksums for same content', () => {
      const content = 'Consistency test content';
      const manifest1 = artifactManager.storeArtifact('code', content, {});
      
      // Store same content again
      const manifest2 = artifactManager.storeArtifact('code', content, {});
      
      assert.equal(manifest1.checksum, manifest2.checksum);
    });

    it('should produce different checksums for different content', () => {
      const manifest1 = artifactManager.storeArtifact('code', 'content A', {});
      const manifest2 = artifactManager.storeArtifact('code', 'content B', {});

      assert.notEqual(manifest1.checksum, manifest2.checksum);
    });

    it('should store artifact to disk', () => {
      const manifest = artifactManager.storeArtifact('code', 'disk test', {});
      
      // Check file exists
      const location = manifest.location.replace('file://', '');
      assert.isTrue(fs.existsSync(location));
    });

    it('should include timestamp in manifest', () => {
      const manifest = artifactManager.storeArtifact('code', 'test', {});
      
      assert.exists(manifest.timestamp);
      assert.doesNotThrow(() => new Date(manifest.timestamp));
    });

    it('should include size in manifest', () => {
      const content = 'test content';
      const manifest = artifactManager.storeArtifact('code', content, {});
      
      assert.exists(manifest.size);
      assert.isNumber(manifest.size);
      assert.isAbove(manifest.size, 0);
    });

    it('should include metadata in manifest', () => {
      const metadata = { description: 'Test artifact', version: '1.0.0' };
      const manifest = artifactManager.storeArtifact('code', 'test', metadata);
      
      assert.exists(manifest.metadata);
      assert.equal(manifest.metadata.description, 'Test artifact');
      assert.equal(manifest.metadata.version, '1.0.0');
    });

    it('should support different artifact types', () => {
      const types = ['code', 'documentation', 'schema', 'configuration'];
      
      types.forEach(type => {
        const manifest = artifactManager.storeArtifact(type, 'content', {});
        assert.equal(manifest.type, type);
      });
    });
  });

  describe('retrieveArtifact()', () => {
    it('should retrieve stored artifact by ID', () => {
      const content = 'Test content for retrieval';
      const manifest = artifactManager.storeArtifact('code', content, {});
      
      const result = artifactManager.retrieveArtifact(manifest.artifactId);
      
      assert.exists(result);
      assert.exists(result.manifest);
      assert.exists(result.content);
      assert.equal(result.content, content);
    });

    it('should verify checksum on retrieval', () => {
      const manifest = artifactManager.storeArtifact('code', 'test', {});
      
      const result = artifactManager.retrieveArtifact(manifest.artifactId);
      
      // Checksum should match
      assert.equal(result.manifest.checksum, manifest.checksum);
    });

    it('should throw error for non-existent artifact', () => {
      assert.throws(
        () => artifactManager.retrieveArtifact('non-existent-id'),
        /not found/i
      );
    });

    it('should detect corrupted artifacts', () => {
      const manifest = artifactManager.storeArtifact('code', 'original', {});
      
      // Manually corrupt the file
      const location = manifest.location.replace('file://', '');
      fs.writeFileSync(location, 'corrupted content');
      
      assert.throws(
        () => artifactManager.retrieveArtifact(manifest.artifactId),
        /checksum mismatch/i
      );
    });

    it('should support manifestOnly option', () => {
      const manifest = artifactManager.storeArtifact('code', 'test content', {});
      
      const result = artifactManager.retrieveArtifact(manifest.artifactId, { manifestOnly: true });
      
      assert.exists(result.manifest);
      assert.notExists(result.content);
    });
  });

  describe('listArtifacts()', () => {
    it('should return empty array when no artifacts', () => {
      const artifacts = artifactManager.listArtifacts();
      
      assert.isArray(artifacts);
      assert.equal(artifacts.length, 0);
    });

    it('should list all stored artifacts', () => {
      artifactManager.storeArtifact('code', 'artifact 1', {});
      artifactManager.storeArtifact('documentation', 'artifact 2', {});
      artifactManager.storeArtifact('schema', 'artifact 3', {});
      
      const artifacts = artifactManager.listArtifacts();
      
      assert.equal(artifacts.length, 3);
    });

    it('should return manifests with all required fields', () => {
      artifactManager.storeArtifact('code', 'test', {});
      
      const artifacts = artifactManager.listArtifacts();
      const manifest = artifacts[0];
      
      assert.exists(manifest.artifactId);
      assert.exists(manifest.type);
      assert.exists(manifest.checksum);
      assert.exists(manifest.location);
      assert.exists(manifest.timestamp);
    });

    it('should support filtering by type', () => {
      artifactManager.storeArtifact('code', 'code artifact', {});
      artifactManager.storeArtifact('documentation', 'doc artifact', {});
      artifactManager.storeArtifact('code', 'code artifact 2', {});
      
      const codeArtifacts = artifactManager.listArtifacts({ type: 'code' });
      
      assert.equal(codeArtifacts.length, 2);
      codeArtifacts.forEach(artifact => {
        assert.equal(artifact.type, 'code');
      });
    });
  });

  describe('deleteArtifact()', () => {
    it('should delete artifact by ID', () => {
      const manifest = artifactManager.storeArtifact('code', 'test', {});
      
      const deleted = artifactManager.deleteArtifact(manifest.artifactId);
      
      assert.isTrue(deleted);
    });

    it('should remove artifact from manifest index', () => {
      const manifest = artifactManager.storeArtifact('code', 'test', {});
      artifactManager.deleteArtifact(manifest.artifactId);
      
      const artifacts = artifactManager.listArtifacts();
      assert.equal(artifacts.length, 0);
    });

    it('should remove artifact file from disk', () => {
      const manifest = artifactManager.storeArtifact('code', 'test', {});
      const location = manifest.location.replace('file://', '');
      
      artifactManager.deleteArtifact(manifest.artifactId);
      
      assert.isFalse(fs.existsSync(location));
    });

    it('should return false for non-existent artifact', () => {
      const deleted = artifactManager.deleteArtifact('non-existent-id');
      assert.isFalse(deleted);
    });
  });

  describe('getStatistics()', () => {
    it('should return statistics object', () => {
      const stats = artifactManager.getStatistics();
      
      assert.exists(stats);
      assert.exists(stats.totalArtifacts);
      assert.exists(stats.totalSize);
    });

    it('should show zero statistics for empty manager', () => {
      const stats = artifactManager.getStatistics();
      
      assert.equal(stats.totalArtifacts, 0);
      assert.equal(stats.totalSize, 0);
    });

    it('should calculate correct artifact count', () => {
      artifactManager.storeArtifact('code', 'artifact 1', {});
      artifactManager.storeArtifact('code', 'artifact 2', {});
      
      const stats = artifactManager.getStatistics();
      
      assert.equal(stats.totalArtifacts, 2);
    });

    it('should calculate total size', () => {
      artifactManager.storeArtifact('code', 'small', {});
      
      const stats = artifactManager.getStatistics();
      
      assert.isAbove(stats.totalSize, 0);
    });
  });

  describe('isInitialized()', () => {
    it('should return true when properly initialized', () => {
      assert.isTrue(artifactManager.isInitialized());
    });

    it('should return true after storing artifacts', () => {
      artifactManager.storeArtifact('code', 'test', {});
      assert.isTrue(artifactManager.isInitialized());
    });
  });
});
