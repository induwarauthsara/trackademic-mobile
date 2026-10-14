import { useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';
import { router } from 'expo-router';
import * as Crypto from 'expo-crypto';
import { Busy, Button, Card, Failure, Label, Screen } from '@/components/ui';
import { Choices, Field, SaveError, SetupCard } from '@/components/forms';
import { useStudent } from '@/features/academics/queries';
import { confirmed, ownedSubject, useAcademicRecords, useSave, useTasks } from '@/features/academics/data';
import { remainingSeconds, today } from '@/features/academics/domain';
import { RecordActions } from '@/components/RecordActions';
import { usePreferences } from '@/providers/PreferencesProvider';

export default function Study() {
  const student = useStudent();
  const records = useAcademicRecords();
  const tasks = useTasks();
  const { t } = usePreferences();
  const [subject, setSubject] = useState('');
  const [duration, setDuration] = useState(25);
  const [seconds, setSeconds] = useState(25 * 60);
  const [endAt, setEndAt] = useState<number | null>(null);
  const [startedAt, setStartedAt] = useState<string | null>(null);
  const [note, setNote] = useState('');
  const [id, setId] = useState(Crypto.randomUUID);
  const [saved, setSaved] = useState(false);
  const lock = useRef(false);
  useEffect(() => {
    if (endAt === null) return;
    const tick = () => { const remaining = remainingSeconds(endAt); setSeconds(remaining); if (!remaining) setEndAt(null); };
    const interval = setInterval(tick, 500);
    const listener = AppState.addEventListener('change', state => { if (state === 'active') tick(); });
    tick();
    return () => { clearInterval(interval); listener.remove(); };
  }, [endAt]);
  const log = useSave(async (userId, db) => {
    if (!startedAt || seconds > 0 || endAt !== null) throw new Error('Complete the timer before saving.');
    await ownedSubject(db, userId, subject);
    confirmed(await db.from('trackademic_study_sessions').upsert({ id, user_id: userId, subject_id: subject, started_at: startedAt, duration_minutes: duration, note: note.trim() || null }).select('id').single());
  });
  const completeTask = useSave(async (userId, db, task: { id: string; completed_at: string | null }) => {
    confirmed(await db.from('trackademic_user_tasks').update({ completed_at: task.completed_at ? null : new Date().toISOString(), updated_at: new Date().toISOString() }).eq('id', task.id).eq('user_id', userId).select('id').single());
  });
  const refresh = () => { void student.refetch(); void records.refetch(); void tasks.refetch(); };
  const weekStart = new Date();
  weekStart.setHours(0, 0, 0, 0);
  weekStart.setDate(weekStart.getDate() - (weekStart.getDay() + 6) % 7);
  const minutesThisWeek = records.data?.study.filter(s => new Date(s.started_at) >= weekStart && new Date(s.started_at) <= new Date()).reduce((sum, s) => sum + s.duration_minutes, 0);
  const reset = (minutes = duration) => { setDuration(minutes); setSeconds(minutes * 60); setEndAt(null); setStartedAt(null); setId(Crypto.randomUUID()); setSaved(false); log.reset(); };
  async function saveTimer() {
    if (lock.current || saved) return;
    lock.current = true;
    try { await log.mutateAsync(undefined); setSaved(true); } catch {} finally { lock.current = false; }
  }
  return <Screen refresh={refresh} refreshing={student.isRefetching || records.isRefetching || tasks.isRefetching}>
    <Label heading>{t('mobile.study')}</Label>
    {minutesThisWeek !== undefined && <Card><Label heading>{t('mobile.weekGoal')}</Label><Label>{minutesThisWeek} / {(student.data?.profile?.study_hours_per_week ?? 8) * 60} {t('mobile.minutes')}</Label><Label muted>{t('mobile.weekNote')}</Label></Card>}
    {student.isPending ? <Busy /> : student.isError ? <Failure retry={refresh} /> : !student.data?.subjects.length ? <SetupCard /> : <Card>
      <Label heading>{t('mobile.focusTimer')}</Label>
      <Choices label={t('nav.subjects')} value={subject} options={student.data.subjects.map(s => ({ value: s.id, label: s.code }))} onChange={v => { if (!startedAt) setSubject(v); }} />
      {!startedAt && <Choices label={t('mobile.minutes')} value={String(duration)} options={[15, 25, 45].map(v => ({ value: String(v), label: String(v) }))} onChange={v => reset(Number(v))} />}
      <Label heading style={{ textAlign: 'center', fontSize: 48, lineHeight: 60 }}>{String(Math.floor(seconds / 60)).padStart(2, '0')}:{String(seconds % 60).padStart(2, '0')}</Label>
      <Label muted>{t('mobile.timerNote')}</Label>
      {seconds > 0 && <Button label={t(endAt === null ? 'mobile.start' : 'mobile.pause')} disabled={!subject} onPress={() => { if (endAt !== null) { setSeconds(remainingSeconds(endAt)); setEndAt(null); } else { setStartedAt(s => s || new Date().toISOString()); setEndAt(Date.now() + seconds * 1000); } }} />}
      {startedAt && !saved && <Button secondary label={t('mobile.reset')} disabled={log.isPending} onPress={() => reset()} />}
      {seconds === 0 && !saved && <><Field label={t('mobile.notes')} value={note} onChange={setNote} /><SaveError error={log.error} /><Button label={t(log.isPending ? 'common.loading' : 'mobile.saveStudy')} disabled={log.isPending} onPress={() => void saveTimer()} /></>}
      {saved && <><Label>{t('mobile.saved')}</Label><Button label={t('mobile.newSession')} onPress={() => reset()} /></>}
      <Button label={t('mobile.logStudy')} secondary onPress={() => router.push({ pathname: '/add', params: { kind: 'study', subject } })} />
    </Card>}
    <Label heading>{t('mobile.tasks')}</Label><Button label={t('mobile.addTask')} onPress={() => router.push({ pathname: '/add', params: { kind: 'task' } })} />
    <SaveError error={completeTask.error} />
    {tasks.isPending ? <Busy /> : tasks.isError ? <Failure retry={() => void tasks.refetch()} /> : tasks.data.length ? tasks.data.map(task => <Card key={task.id}>
      <Label style={{ textDecorationLine: task.completed_at ? 'line-through' : 'none' }}>{task.title}</Label>
      {task.notes && <Label muted>{task.notes}</Label>}{task.due_at && <Label muted>{new Date(task.due_at).toLocaleDateString()}</Label>}
      <Button secondary label={t(task.completed_at ? 'mobile.reopen' : 'mobile.complete')} disabled={completeTask.isPending} onPress={() => completeTask.mutate(task)} />
      <RecordActions kind="task" id={task.id} subject={task.subject_id} />
    </Card>) : <Label muted>{t('mobile.noTasks')}</Label>}
    <Label heading>{t('mobile.recentStudy')}</Label>
    {records.isError ? <Failure retry={() => void records.refetch()} /> : records.isPending && student.data?.subjects.length ? <Busy /> : records.data?.study.length ? [...records.data.study].sort((a, b) => b.started_at.localeCompare(a.started_at)).slice(0, 20).map(s => <Card key={s.id}>
      <Label>{student.data?.subjects.find(subject => subject.id === s.subject_id)?.name} · {s.duration_minutes} {t('mobile.minutes')}</Label><Label muted>{new Date(s.started_at).toLocaleString()}</Label>{s.note && <Label>{s.note}</Label>}
      <RecordActions kind="study" id={s.id} subject={s.subject_id} />
    </Card>) : <Label muted>{t('mobile.noStudy')}</Label>}
    <Label heading>{t('mobile.exams')}</Label>
    {records.data?.exams.filter(e => e.date >= today()).sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`)).map(e => <Card key={e.id}><Label>{student.data?.subjects.find(s => s.id === e.subject_id)?.name}</Label><Label muted>{e.date} · {e.time} · {e.venue || ''}</Label><RecordActions kind="exam" id={e.id} subject={e.subject_id} /></Card>)}
  </Screen>;
}
