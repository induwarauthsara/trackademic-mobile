import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createChunkedStorage, type KeyValueStore } from '../src/lib/storage-core';

function memoryStore() {
  const values = new Map<string, string>();
  const store: KeyValueStore = {
    async getItem(key) { return values.get(key) ?? null; },
    async setItem(key, value) { assert.ok(Buffer.byteLength(value, 'utf8') <= 2048); values.set(key, value); },
    async removeItem(key) { values.delete(key); },
  };
  let version = 0;
  return { values, store, storage: createChunkedStorage(store, () => `generation-${++version}`) };
}

test('large sessions including Sinhala/Tamil metadata round-trip within native entry limits', async () => {
  const { storage } = memoryStore();
  const session = JSON.stringify({ token: 'a'.repeat(6000), name: 'සිංහල தமிழ்'.repeat(200) });
  await storage.setItem('sb-project-auth-token', session);
  assert.equal(await storage.getItem('sb-project-auth-token'), session);
});

test('overwrites remove old chunks and sign-out removes the complete session', async () => {
  const { storage, values } = memoryStore();
  await storage.setItem('account', 'a'.repeat(6000));
  await storage.setItem('account', 'new');
  assert.equal(await storage.getItem('account'), 'new');
  assert.equal(values.size, 2);
  await storage.removeItem('account');
  assert.equal(await storage.getItem('account'), null);
  assert.equal(values.size, 0);
});

test('failed credential write preserves the previously committed session', async () => {
  const { storage, store } = memoryStore();
  await storage.setItem('account', 'previous');
  const original = store.setItem;
  store.setItem = async (key, value) => { if (key.includes('generation-2.1')) throw new Error('Disk full'); await original(key, value); };
  await assert.rejects(storage.setItem('account', 'new'.repeat(400)), /Disk full/);
  assert.equal(await storage.getItem('account'), 'previous');
});

test('a partially missing session is rejected rather than concatenated into credentials', async () => {
  const { storage, values } = memoryStore();
  await storage.setItem('account', 'a'.repeat(1000));
  values.delete([...values.keys()].find(key => key.endsWith('.1'))!);
  assert.equal(await storage.getItem('account'), null);
});

test('concurrent writes commit in order and keep different accounts isolated', async () => {
  const { storage } = memoryStore();
  await Promise.all([storage.setItem('a:b', 'first'), storage.setItem('a:b', 'second'), storage.setItem('a_b', 'other')]);
  assert.equal(await storage.getItem('a:b'), 'second');
  assert.equal(await storage.getItem('a_b'), 'other');
});
