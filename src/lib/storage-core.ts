export interface KeyValueStore {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
}

type Manifest = { generation: string; count: number };

/** Small SecureStore entries avoid platform size limits for complete JWT sessions.
 * Commit the pointer last so a failed write leaves the previous session readable.
 */
export function createChunkedStorage(store: KeyValueStore, generationId: () => string): KeyValueStore {
  let queue: Promise<unknown> = Promise.resolve();
  const run = <T>(operation: () => Promise<T>): Promise<T> => {
    const result = queue.then(operation);
    queue = result.catch(() => undefined);
    return result;
  };
  const prefix = (key: string) => `trackademic.${Array.from(key).map(c => c.codePointAt(0)!.toString(16)).join('_')}`;
  const readManifest = async (key: string): Promise<Manifest | null> => {
    const raw = await store.getItem(key);
    if (!raw) return null;
    try {
      const value: unknown = JSON.parse(raw);
      if (typeof value !== 'object' || value === null) return null;
      const m = value as Manifest;
      return typeof m.generation === 'string' && /^[a-zA-Z0-9-]+$/.test(m.generation)
        && Number.isInteger(m.count) && m.count > 0 && m.count <= 256 ? m : null;
    } catch { return null; }
  };
  const clean = async (key: string, m: Manifest | null) => {
    if (m) await Promise.all(Array.from({ length: m.count }, (_, i) =>
      store.removeItem(`${key}.${m.generation}.${i}`).catch(() => undefined)));
  };
  return {
    getItem: key => run(async () => {
      const p = prefix(key);
      const m = await readManifest(p);
      if (!m) return null;
      const chunks = await Promise.all(Array.from({ length: m.count }, (_, i) => store.getItem(`${p}.${m.generation}.${i}`)));
      return chunks.some(c => c === null) ? null : chunks.join('');
    }),
    setItem: (key, value) => run(async () => {
      const p = prefix(key);
      const old = await readManifest(p);
      // At most 1600 UTF-8 bytes per entry, including non-ASCII profile metadata.
      const chunks = value.match(/[\s\S]{1,400}/g) ?? [''];
      if (chunks.length > 256) throw new Error('Session is too large to store securely.');
      const m = { generation: generationId(), count: chunks.length };
      if (!/^[a-zA-Z0-9-]+$/.test(m.generation)) throw new Error('Invalid storage generation.');
      try {
        for (let i = 0; i < chunks.length; i++) await store.setItem(`${p}.${m.generation}.${i}`, chunks[i]);
        await store.setItem(p, JSON.stringify(m));
      } catch (error) {
        await clean(p, m);
        throw error;
      }
      await clean(p, old);
    }),
    removeItem: key => run(async () => {
      const p = prefix(key);
      const m = await readManifest(p);
      await store.removeItem(p);
      await clean(p, m);
    }),
  };
}
