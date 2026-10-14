import { useEffect, useRef, useState } from 'react';
import { useLocalSearchParams, router } from 'expo-router';
import * as Crypto from 'expo-crypto';
import { Back, Choices, Field, SaveError, SetupCard } from '@/components/forms';
import { Busy, Button, Card, Failure, Label, Screen } from '@/components/ui';
import { useStudent } from '@/features/academics/queries';
import { useAcademicRecords, useSave, useTasks } from '@/features/academics/data';
import { today } from '@/features/academics/domain';
import { saveRecord, type RecordFields, type RecordKind } from '@/features/academics/records';
import { usePreferences } from '@/providers/PreferencesProvider';
import { useAuth } from '@/providers/AuthProvider';
import { sessionStorage } from '@/lib/storage';

const kinds: RecordKind[] = ['assignment', 'attendance', 'study', 'task', 'exam'];

export default function Add() {
  const params = useLocalSearchParams<{ subject?: string; kind?: string; id?: string; minutes?: string }>();
  const student = useStudent();
  const records = useAcademicRecords();
  const tasks = useTasks();
  const { t } = usePreferences();
  const { session } = useAuth();
  const editing = !!params.id;
  const [kind, setKind] = useState<RecordKind>(kinds.includes(params.kind as RecordKind) ? params.kind as RecordKind : 'assignment');
  const [id, setId] = useState(() => params.id || Crypto.randomUUID());
  const [startedAt, setStartedAt] = useState(() => new Date(Date.now() - Number(params.minutes || 25) * 60000).toISOString());
  const [fields, setFields] = useState<RecordFields>({ subject: params.subject || '', title: '', date: today(), mark: '', weight: '0', type: 'lecture', attended: 'present', status: 'not_started', minutes: params.minutes || '25', note: '', time: '09:00' });
  const [loaded, setLoaded] = useState(!editing);
  const [draftReady, setDraftReady] = useState(editing);
  const [draftStatus, setDraftStatus] = useState('');
  const [draftError, setDraftError] = useState<Error | null>(null);
  const draftKey = `mobile-draft.${session?.user.id}.${params.subject || 'general'}.${params.kind || 'assignment'}`;
  useEffect(() => {
    if (editing) return;
    let active = true;
    void sessionStorage.getItem(draftKey).then(raw => {
      if (!active || !raw) return;
      const draft = JSON.parse(raw) as { id: string; kind: RecordKind; fields: RecordFields; startedAt: string };
      if (!kinds.includes(draft.kind) || !/^[a-f0-9-]{36}$/i.test(draft.id) || !draft.fields || !Number.isFinite(Date.parse(draft.startedAt)) || !Object.keys(fields).every(key => typeof draft.fields[key as keyof RecordFields] === 'string')) throw new Error('Stored draft is invalid.');
      setId(draft.id); setKind(draft.kind); setFields(draft.fields); setStartedAt(draft.startedAt); setDraftStatus('mobile.draftRestored');
    }).catch(error => { if (active) setDraftError(error instanceof Error ? error : new Error('Could not restore draft.')); }).finally(() => { if (active) setDraftReady(true); });
    return () => { active = false; };
  }, [draftKey, editing]);
  const lock = useRef(false);
  const save = useSave(async (userId, db, input: RecordFields) => saveRecord(db, userId, kind, id, input, editing, startedAt));
  const change = (key: keyof RecordFields) => (value: string) => setFields(old => ({ ...old, [key]: value }));
  const existing = kind === 'assignment' ? records.data?.assignments.find(r => r.id === params.id) : kind === 'attendance' ? records.data?.sessions.find(r => r.id === params.id) : kind === 'study' ? records.data?.study.find(r => r.id === params.id) : kind === 'exam' ? records.data?.exams.find(r => r.id === params.id) : tasks.data?.find(r => r.id === params.id);
  // Hydrate an edit once, preserving all entered values across refetches.
  if (!loaded && existing) {
    setFields(old => 'due_date' in existing ? { ...old, subject: existing.subject_id, title: existing.title, date: existing.due_date, mark: existing.mark === null ? '' : String(existing.mark), weight: String(existing.weight), status: existing.status, note: existing.description || '' }
      : 'topic' in existing ? { ...old, subject: existing.subject_id, title: existing.topic, date: existing.date, type: existing.type, attended: existing.attended, status: existing.status, note: existing.notes || '' }
      : 'duration_minutes' in existing ? { ...old, subject: existing.subject_id || '', minutes: String(existing.duration_minutes), note: existing.note || '' }
      : 'due_at' in existing ? { ...old, subject: existing.subject_id || '', title: existing.title, date: existing.due_at ? today(new Date(existing.due_at)) : '', note: existing.notes || '' }
      : { ...old, subject: existing.subject_id, date: existing.date, time: existing.time.slice(0, 5), title: existing.venue || '' });
    if ('started_at' in existing) setStartedAt(existing.started_at);
    setLoaded(true);
  }
  async function submit() {
    if (lock.current) return;
    lock.current = true;
    try { await save.mutateAsync(fields); if (!editing) await sessionStorage.removeItem(draftKey).catch(() => {}); router.canGoBack() ? router.back() : router.replace('/(tabs)'); } catch { /* Keep input and show the server error. */ } finally { lock.current = false; }
  }
  return <Screen><Back /><Label heading>{t(editing ? 'mobile.edit' : 'mobile.quickAdd')}</Label>
    {student.isPending || !draftReady || (editing && (kind === 'task' ? tasks.isPending : records.isPending)) ? <Busy /> : student.isError || (editing && (kind === 'task' ? tasks.isError : records.isError)) ? <Failure retry={() => { void student.refetch(); void records.refetch(); void tasks.refetch(); }} /> : editing && !existing ? <Label>{t('mobile.unavailable')}</Label> : !student.data?.semester ? <SetupCard /> : <>
      {!editing && <Choices label={t('mobile.recordType')} value={kind} options={kinds.map(value => ({ value, label: t(`mobile.kind_${value}`) }))} onChange={v => { setKind(v as RecordKind); change('status')('not_started'); save.reset(); }} />}
      <Card>
        <Choices label={t('nav.subjects')} value={fields.subject} options={[...(kind === 'task' ? [{ value: '', label: t('mobile.general') }] : []), ...(student.data?.subjects.map(s => ({ value: s.id, label: s.code })) || [])]} onChange={editing ? () => {} : change('subject')} />
        {!student.data?.subjects.length && kind !== 'task' ? <SetupCard /> : <>
          {kind !== 'study' && <Field label={t(kind === 'attendance' ? 'mobile.topic' : kind === 'exam' ? 'mobile.venue' : 'mobile.title')} value={fields.title} onChange={change('title')} />}
          {kind !== 'study' && <Field label={t('mobile.date')} value={fields.date} onChange={change('date')} placeholder="YYYY-MM-DD" />}
          {kind === 'exam' && <Field label={t('mobile.time')} value={fields.time} onChange={change('time')} placeholder="HH:mm" />}
          {kind === 'assignment' && <>
            <Field label={t('mobile.weight')} numeric value={fields.weight} onChange={change('weight')} />
            <Field label={t('mobile.mark')} numeric value={fields.mark} onChange={v => setFields(f => ({ ...f, mark: v, status: v.trim() ? 'graded' : f.status === 'graded' ? 'not_started' : f.status }))} />
            <Choices label={t('mobile.status')} value={fields.status} options={['not_started', 'in_progress', 'submitted', 'graded'].map(value => ({ value, label: t(`mobile.status_${value}`) }))} onChange={change('status')} />
          </>}
          {kind === 'attendance' && <>
            <Choices label={t('mobile.classType')} value={fields.type} options={['lecture', 'practical', 'lab', 'tutorial'].map(value => ({ value, label: t(`quick_add.type_${value}`) }))} onChange={change('type')} />
            <Choices label={t('mobile.attendance')} value={fields.attended} options={['present', 'absent', 'late', 'medical'].map(value => ({ value, label: t(`mobile.status_${value}`) }))} onChange={change('attended')} />
            <Choices label={t('mobile.topicStatus')} value={fields.status} options={['not_started', 'in_progress', 'completed', 'mastered'].map(value => ({ value, label: t(`mobile.status_${value}`) }))} onChange={change('status')} />
          </>}
          {kind === 'study' && <Field label={t('mobile.minutes')} numeric value={fields.minutes} onChange={change('minutes')} />}
          {kind !== 'exam' && <Field label={t('mobile.notes')} multiline value={fields.note} onChange={change('note')} />}
          <SaveError error={save.error} />
          {!editing && <><SaveError error={draftError} />{draftStatus && <Label muted>{t(draftStatus)}</Label>}
            <Button label={t('mobile.saveDraft')} secondary disabled={save.isPending} onPress={() => { setDraftError(null); void sessionStorage.setItem(draftKey, JSON.stringify({ id, kind, fields, startedAt })).then(() => setDraftStatus('mobile.draftSaved')).catch(error => setDraftError(error)); }} />
          </>}
          <Button label={t(save.isPending ? 'common.loading' : 'mobile.save')} disabled={save.isPending || !loaded} onPress={() => void submit()} />
        </>}
      </Card>
    </>}
  </Screen>;
}
