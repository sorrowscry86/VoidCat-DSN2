/**
 * EvidenceCollector Retention Tests
 */

import { describe, it, beforeEach, afterEach } from 'mocha';
import { assert } from 'chai';
import EvidenceCollector from '../../../../src/infrastructure/evidence/EvidenceCollector.js';
import fs from 'fs/promises';
import path from 'path';

function fmt(d) {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

describe('EvidenceCollector retention', () => {
  let auditDir;
  let collector;

  beforeEach(async () => {
    auditDir = path.join(process.cwd(), 'test-audit-retention');
    await fs.rm(auditDir, { recursive: true, force: true });
    await fs.mkdir(auditDir, { recursive: true });
    collector = new EvidenceCollector({ auditDir, retentionDays: 30 });
  });

  afterEach(async () => {
    await fs.rm(auditDir, { recursive: true, force: true });
  });

  it('should delete logs older than retention and keep recent and non-log files', async () => {
    const now = new Date();
    const oldDate = new Date(now.getTime() - 31 * 24 * 60 * 60 * 1000);
    const withinDate = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);

    const oldFile = path.join(auditDir, `${fmt(oldDate)}-audit.log`);
    const recentFile = path.join(auditDir, `${fmt(withinDate)}-audit.log`);
    const todayFile = path.join(auditDir, `${fmt(now)}-audit.log`);
    const ignoredFile = path.join(auditDir, `README.txt`);

    await fs.writeFile(oldFile, 'old\n');
    await fs.writeFile(recentFile, 'recent\n');
    await fs.writeFile(ignoredFile, 'keep me\n');

    // Trigger retention via a write
    const rec = collector.record({ operation: 'retention_trigger', execution: 'real' });
    await collector.writeToAuditLog(rec); // will write to todayFile and enforce retention

    const exists = async p => await fs.access(p).then(() => true).catch(() => false);
    assert.isFalse(await exists(oldFile), 'old log should be deleted');
    assert.isTrue(await exists(recentFile), 'recent log should remain');
    assert.isTrue(await exists(todayFile), 'today log should exist');
    assert.isTrue(await exists(ignoredFile), 'non-log files should be ignored by retention');
  });
});
