import { expect } from 'chai';
import fs from 'fs';
import fsp from 'fs/promises';
import os from 'os';
import path from 'path';
import { fileURLToPath } from 'url';
import ArtifactManager from '../../../../src/infrastructure/artifacts/ArtifactManager.js';

describe('ArtifactManager extra', () => {
  let tmpDir, artifactsDir, manifestsDir, manager;

  beforeEach(async () => {
    tmpDir = await fsp.mkdtemp(path.join(os.tmpdir(), 'artifact-test-'));
    artifactsDir = path.join(tmpDir, 'artifacts');
    manifestsDir = path.join(tmpDir, 'manifests');
    manager = new ArtifactManager(artifactsDir, manifestsDir);
    if (!manager.isInitialized()) await manager.initialize();
  });

  afterEach(async () => {
    try { await fsp.rm(tmpDir, { recursive: true, force: true }); } catch (_) {}
  });

  it('should return manifestOnly when requested', async () => {
    const manifest = await manager.storeArtifact('code', 'hello', { lang: 'text' });
    const res = await manager.retrieveArtifact(manifest.artifactId, { manifestOnly: true });
    expect(res).to.have.property('manifest');
    expect(res.manifest.artifactId).to.equal(manifest.artifactId);
  });

  it('should throw when manifest missing', async () => {
    try {
      await manager.retrieveArtifact('no-such-id');
      throw new Error('Expected error');
    } catch (err) {
      expect(err.message).to.match(/Artifact not found/);
    }
  });

  it('should support legacy path location fallback', async () => {
    const artifactId = 'legacy-' + Date.now();
    const content = 'legacy-content';
    await fsp.mkdir(artifactsDir, { recursive: true });
    const filePath = path.join(artifactsDir, `${artifactId}.artifact`);
    await fsp.writeFile(filePath, content, 'utf-8');

    const checksum = manager.calculateChecksum(content);
    const manifest = {
      artifactId,
      type: 'code',
      checksum,
      location: filePath, // raw path (legacy)
      timestamp: new Date().toISOString(),
      size: Buffer.byteLength(content, 'utf-8'),
      metadata: {}
    };

    await fsp.mkdir(manifestsDir, { recursive: true });
    await fsp.writeFile(path.join(manifestsDir, `${artifactId}.json`), JSON.stringify(manifest, null, 2), 'utf-8');

    await manager.initialize();
    const res = await manager.retrieveArtifact(artifactId);
    expect(res.manifest.artifactId).to.equal(artifactId);
    expect(res.content).to.equal(content);
  });

  it('deleteArtifact should succeed when file missing', async () => {
    const manifest = await manager.storeArtifact('code', 'to-delete');
    // remove artifact file
    const artifactPath = fileURLToPath(new URL(manifest.location));
    await fsp.unlink(artifactPath).catch(() => {});

    const result = await manager.deleteArtifact(manifest.artifactId);
    expect(result).to.equal(true);
    const list = manager.listArtifacts();
    expect(list.find(m => m.artifactId === manifest.artifactId)).to.be.undefined;
  });

  it('should throw checksum mismatch when file corrupted', async () => {
    const manifest = await manager.storeArtifact('code', 'original');
    const fp = fileURLToPath(new URL(manifest.location));
    await fsp.writeFile(fp, 'corrupted', 'utf-8');
    try {
      await manager.retrieveArtifact(manifest.artifactId);
      throw new Error('expected checksum error');
    } catch (err) {
      expect(err.message).to.match(/Checksum mismatch/);
    }
  });

});
