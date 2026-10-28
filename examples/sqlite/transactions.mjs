import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { mkdirSync, rmSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { randomUUID } from 'node:crypto';
import path from 'node:path';

const cache = fileURLToPath(new URL('../../.cache/sqlite/', import.meta.url));
mkdirSync(cache, { recursive: true });
const filename = path.join(cache, `${randomUUID()}.db`);
const db = new DatabaseSync(filename);
let second;
let passed = 0;
function check(name, action) {
  action();
  console.log(`PASS: ${name}`);
  passed++;
}
try {
  console.log(`SQLite ${db.prepare('SELECT sqlite_version() AS version').get().version}`);
  db.exec(`PRAGMA journal_mode=WAL;
    CREATE TABLE runs (
      id TEXT PRIMARY KEY,
      started_utc TEXT NOT NULL,
      status TEXT NOT NULL CHECK(status IN ('Succeeded','Failed','Cancelled')),
      file_count INTEGER,
      total_bytes INTEGER
    );
    CREATE INDEX runs_by_started ON runs(started_utc DESC);
    PRAGMA user_version=1;`);
  check('WAL enabled on this connection', () => {
    assert.equal(db.prepare('PRAGMA journal_mode').get().journal_mode, 'wal');
  });
  const insert = db.prepare('INSERT INTO runs VALUES (?, ?, ?, ?, ?)');
  check('bound value cannot become SQL structure', () => {
    const id = "demo'); DROP TABLE runs; --";
    insert.run(id, '2026-10-28T00:00:00Z', 'Succeeded', 2, 7);
    assert.equal(db.prepare('SELECT total_bytes FROM runs WHERE id=?').get(id).total_bytes, 7);
  });
  check('rollback discards the whole transaction', () => {
    db.exec('BEGIN IMMEDIATE');
    insert.run('rolled-back', '2026-10-28T00:00:01Z', 'Cancelled', null, null);
    db.exec('ROLLBACK');
    assert.equal(db.prepare('SELECT count(*) AS n FROM runs').get().n, 1);
  });
  check('second writer is rejected while first holds write transaction', () => {
    second = new DatabaseSync(filename);
    second.exec('PRAGMA busy_timeout=0');
    db.exec('BEGIN IMMEDIATE');
    try {
      assert.throws(() => second.exec('BEGIN IMMEDIATE'), /locked|busy/i);
    } finally { db.exec('ROLLBACK'); }
  });
  check('failed schema migration restores schema and version', () => {
    db.exec('BEGIN IMMEDIATE');
    assert.throws(() => {
      db.exec('ALTER TABLE runs ADD COLUMN duration_ms INTEGER NOT NULL DEFAULT 0');
      db.exec('INSERT INTO missing_table VALUES (1)');
    }, /missing_table/);
    db.exec('ROLLBACK');
    assert.equal(db.prepare('PRAGMA user_version').get().user_version, 1);
    assert.equal(db.prepare('PRAGMA table_info(runs)').all().some(c => c.name === 'duration_ms'), false);
  });
  check('successful migration preserves old records', () => {
    db.exec(`BEGIN IMMEDIATE;
      ALTER TABLE runs ADD COLUMN duration_ms INTEGER NOT NULL DEFAULT 0;
      PRAGMA user_version=2;
      COMMIT;`);
    assert.equal(db.prepare('PRAGMA user_version').get().user_version, 2);
    assert.equal(db.prepare('SELECT duration_ms FROM runs').get().duration_ms, 0);
  });
  console.log(`PASS: ${passed} SQLite checks. No power-loss or installation test was performed.`);
} finally {
  second?.close();
  db.close();
  // Only delete the three known files created for this UUID; no recursive delete.
  for (const suffix of ['', '-wal', '-shm']) rmSync(filename + suffix, { force: true });
}
