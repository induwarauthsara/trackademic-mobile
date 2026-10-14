import { date, number, text } from './domain';
import { confirmed, ownedSubject } from './client';
import type { supabase } from '@/lib/supabase';

export type RecordKind = 'assignment' | 'attendance' | 'study' | 'task' | 'exam';
export type RecordFields = { subject: string; title: string; date: string; mark: string; weight: string; type: string; attended: string; status: string; minutes: string; note: string; time: string };

export function validateRecord(kind: RecordKind, f: RecordFields) {
  const note = f.note.trim() || null;
  if (note && note.length > 2000) throw new Error('Notes: maximum 2000 characters.');
  if (kind !== 'task' && !f.subject) throw new Error('Choose a subject.');
  if (kind === 'assignment') {
    if (!['not_started', 'in_progress', 'submitted', 'graded'].includes(f.status)) throw new Error('Choose an assignment status.');
    const mark = f.mark.trim() ? number(f.mark, 'Mark', 0, 100) : null;
    if ((f.status === 'graded') !== (mark !== null)) throw new Error('Graded assignments need a mark; choose Graded when entering a result.');
    return { title: text(f.title, 'Title'), due_date: date(f.date), weight: number(f.weight, 'Weight', 0, 100), mark, status: f.status, description: note };
  }
  if (kind === 'attendance') {
    if (!['lecture', 'practical', 'lab', 'tutorial'].includes(f.type) || !['present', 'absent', 'late', 'medical'].includes(f.attended) || !['not_started', 'in_progress', 'completed', 'mastered'].includes(f.status)) throw new Error('Choose valid class, attendance and topic statuses.');
    return { topic: text(f.title, 'Topic'), date: date(f.date), type: f.type, attended: f.attended, status: f.status, notes: note };
  }
  if (kind === 'study') return { duration_minutes: number(f.minutes, 'Minutes', 1, 600, true), note };
  if (kind === 'task') return { title: text(f.title, 'Title'), due_at: f.date.trim() ? new Date(`${date(f.date)}T23:59:00`).toISOString() : null, notes: note };
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(f.time)) throw new Error('Enter time as HH:mm (24-hour).');
  return { date: date(f.date), time: f.time, venue: f.title.trim() || null };
}

export async function saveRecord(db: NonNullable<typeof supabase>, userId: string, kind: RecordKind, id: string, fields: RecordFields, editing: boolean, startedAt: string) {
  validateRecord(kind, fields);
  if (fields.subject) await ownedSubject(db, userId, fields.subject);
  const base = { id, subject_id: fields.subject || null };
  // Stable client IDs make network retries update the same row rather than duplicate it.
  if (kind === 'assignment') {
    const payload = { id, subject_id: fields.subject, title: text(fields.title, 'Title'), due_date: date(fields.date), weight: number(fields.weight, 'Weight', 0, 100), mark: fields.mark.trim() ? number(fields.mark, 'Mark', 0, 100) : null,
      status: fields.status as 'not_started' | 'in_progress' | 'submitted' | 'graded', description: fields.note.trim() || null };
    const { id: _id, subject_id: _subject, ...update } = payload;
    confirmed(editing ? await db.from('trackademic_assignments').update(update).eq('id', id).eq('subject_id', fields.subject).select('id').single() : await db.from('trackademic_assignments').upsert(payload).select('id').single());
  } else if (kind === 'attendance') {
    const payload = { id, subject_id: fields.subject, topic: text(fields.title, 'Topic'), date: date(fields.date), type: fields.type as 'lecture' | 'practical' | 'lab' | 'tutorial', attended: fields.attended as 'present' | 'absent' | 'late' | 'medical', status: fields.status as 'not_started' | 'in_progress' | 'completed' | 'mastered', notes: fields.note.trim() || null };
    const { id: _id, subject_id: _subject, ...update } = payload;
    confirmed(editing ? await db.from('trackademic_sessions').update(update).eq('id', id).eq('subject_id', fields.subject).select('id').single() : await db.from('trackademic_sessions').upsert(payload).select('id').single());
  } else if (kind === 'study') {
    const minutes = number(fields.minutes, 'Minutes', 1, 600, true);
    const payload = { ...base, user_id: userId, duration_minutes: minutes, note: fields.note.trim() || null, started_at: startedAt };
    confirmed(editing ? await db.from('trackademic_study_sessions').update({ duration_minutes: minutes, note: payload.note }).eq('id', id).eq('user_id', userId).eq('subject_id', fields.subject).select('id').single() : await db.from('trackademic_study_sessions').upsert(payload).select('id').single());
  } else if (kind === 'task') {
    const payload = { ...base, user_id: userId, title: text(fields.title, 'Title'), notes: fields.note.trim() || null, due_at: fields.date.trim() ? new Date(`${date(fields.date)}T23:59:00`).toISOString() : null, updated_at: new Date().toISOString() };
    confirmed(editing ? await db.from('trackademic_user_tasks').update({ title: payload.title, notes: payload.notes, due_at: payload.due_at, updated_at: payload.updated_at }).eq('id', id).eq('user_id', userId).select('id').single() : await db.from('trackademic_user_tasks').upsert(payload).select('id').single());
  } else {
    const payload = { id, subject_id: fields.subject, date: date(fields.date), time: fields.time, venue: fields.title.trim() || null };
    confirmed(editing ? await db.from('trackademic_exams').update({ date: payload.date, time: payload.time, venue: payload.venue }).eq('id', id).eq('subject_id', fields.subject).select('id').single() : await db.from('trackademic_exams').upsert(payload).select('id').single());
  }
}
