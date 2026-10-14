import assert from 'node:assert/strict';
import { test } from 'node:test';
import { attendance, average, date, examPrediction, number, remainingSeconds, today } from '../src/features/academics/domain';
import { confirmed, pages } from '../src/features/academics/client';
import { validateRecord, saveRecord, type RecordFields } from '../src/features/academics/records';
import type { supabase } from '../src/lib/supabase';

const fields: RecordFields = { subject: 'subject-1', title: 'Test', date: '2026-10-15', mark: '', weight: '20', type: 'lecture', attended: 'present', status: 'not_started', minutes: '25', note: '', time: '09:00' };

test('marks exclude missing evidence while preserving real zeros', () => {
  assert.equal(average([]), null);
  assert.equal(average([{ mark: null }]), null);
  assert.equal(average([{ mark: 0 }, { mark: null }, { mark: 80 }]), 40);
});
test('attendance separates lecture scope, ignores future dates, and exposes no evidence', () => {
  const sessions = [
    { attended: 'present', type: 'lecture', date: '2026-10-14' },
    { attended: 'late', type: 'lab', date: '2026-10-14' },
    { attended: 'medical', type: 'lecture', date: '2026-10-14' },
    { attended: 'absent', type: 'lecture', date: '2026-10-16' },
  ];
  assert.equal(attendance(sessions, false, '2026-10-15').count, 3);
  assert.equal(attendance(sessions, true, '2026-10-15').percentage, 50);
  assert.equal(attendance([], true).percentage, null);
});
test('predictor exposes feasibility instead of clamping impossible targets', () => {
  assert.deepEqual(examPrediction(null, 65, 40, 60), { state: 'unknown', score: null });
  assert.equal(examPrediction(0, 75, 40, 60).state, 'unreachable');
  assert.equal(examPrediction(90, 65, 100, 0).state, 'secured');
  assert.equal(examPrediction(50, 65, 100, 0).state, 'noExam');
  assert.equal(examPrediction(50, 65, 20, 70).state, 'invalid');
  assert.equal(examPrediction(50, 65, 20, 80).score, 68.75);
  assert.equal(examPrediction(null, 65, 0, 100).score, 65);
});
test('numeric and calendar validation rejects blank, invalid and impossible inputs', () => {
  for (const value of ['', 'NaN', 'Infinity', '-1', '101']) assert.throws(() => number(value, 'Mark', 0, 100));
  assert.throws(() => number('1.5', 'Minutes', 1, 600, true));
  for (const value of ['2026-02-29', '2026-04-31', '2026-13-01', '15/10/2026']) assert.throws(() => date(value));
  assert.equal(date('2028-02-29'), '2028-02-29');
  const local = new Date(2026, 9, 15, 0, 1);
  assert.equal(today(local), '2026-10-15');
});
test('record validation enforces mark/status consistency and valid classes', () => {
  assert.throws(() => validateRecord('assignment', { ...fields, status: 'graded' }));
  assert.throws(() => validateRecord('assignment', { ...fields, mark: '60' }));
  assert.equal(validateRecord('assignment', { ...fields, mark: '0', status: 'graded' }).mark, 0);
  assert.throws(() => validateRecord('attendance', { ...fields, attended: 'invented' }));
  assert.throws(() => validateRecord('study', { ...fields, minutes: '601' }));
  assert.throws(() => validateRecord('exam', { ...fields, time: '24:00' }));
  assert.equal(validateRecord('task', { ...fields, subject: '', date: '' }).due_at, null);
});
test('background timer uses an absolute deadline and never returns negative seconds', () => {
  assert.equal(remainingSeconds(10000, 7001), 3);
  assert.equal(remainingSeconds(10000, 11000), 0);
});
test('pagination retrieves all rows and fails rather than returning partial metrics', async () => {
  const input = Array.from({ length: 1101 }, (_, id) => ({ id }));
  const result = await pages(async (from, to) => ({ data: input.slice(from, to + 1), error: null }));
  assert.equal(result.length, 1101);
  await assert.rejects(pages(async from => ({ data: from === 0 ? input.slice(0, 500) : null, error: from === 0 ? null : { message: 'Network failure' } })), /Network/);
});
test('writes require a confirmed row; permission-filtered updates are not success', () => {
  assert.throws(() => confirmed({ data: null, error: null }));
  assert.throws(() => confirmed({ data: [], error: null }));
  assert.throws(() => confirmed({ data: null, error: { message: 'Denied' } }), /Denied/);
});
test('record retries reuse one ID and ownership is checked before writing', async () => {
  const writes: Record<string, unknown>[] = [];
  const filters: string[][] = [];
  let denied = false;
  const db = { from: (table: string) => {
    const chain = {
      select: () => chain,
      eq: (key: string, value: string) => { filters.push([key, value]); return chain; },
      upsert: (payload: Record<string, unknown>) => { writes.push(payload); return chain; },
      single: async () => table === 'trackademic_subjects' && denied ? { data: null, error: { message: 'Subject not found' } } : { data: { id: 'one-id' }, error: null },
    };
    return chain;
  } } as unknown as NonNullable<typeof supabase>;
  for (let i = 0; i < 2; i++) await saveRecord(db, 'user-1', 'assignment', 'one-id', fields, false, '2026-10-15T00:00:00Z');
  assert.equal(writes.length, 2);
  assert.equal(writes[0].id, writes[1].id);
  assert.ok(filters.some(([key, value]) => key === 'user_id' && value === 'user-1'));
  denied = true;
  await assert.rejects(saveRecord(db, 'user-2', 'assignment', 'one-id', fields, false, '2026-10-15T00:00:00Z'), /Subject not found/);
  assert.equal(writes.length, 2);
});
