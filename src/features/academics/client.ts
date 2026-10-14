import type { supabase } from '@/lib/supabase';

export async function pages<T>(fetch: (from: number, to: number) => PromiseLike<{ data: T[] | null; error: { message: string } | null }>) {
  const rows: T[] = [];
  for (let offset = 0; ; offset += 500) {
    const result = await fetch(offset, offset + 499);
    if (result.error) throw new Error(result.error.message);
    const batch = result.data ?? [];
    rows.push(...batch);
    if (batch.length < 500) return rows;
  }
}

export function confirmed(result: { error: { message: string } | null; data: unknown }) {
  if (result.error) throw new Error(result.error.message);
  if (!result.data || (Array.isArray(result.data) && !result.data.length)) throw new Error('No record was saved. Check your account permissions and retry.');
}

export async function ownedSubject(db: NonNullable<typeof supabase>, userId: string, id: string) {
  const result = await db.from('trackademic_subjects').select('id,semester_id').eq('id', id).eq('user_id', userId).single();
  confirmed(result);
  return result.data!;
}
