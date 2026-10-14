import { useRef, useState } from 'react';
import { useLocalSearchParams, router } from 'expo-router';
import * as Crypto from 'expo-crypto';
import { Back, Choices, Field, SaveError, SetupCard } from '@/components/forms';
import { Busy, Button, Card, Failure, Label, Screen } from '@/components/ui';
import { useStudent } from '@/features/academics/queries';
import { confirmed, ownedSubject, useSave } from '@/features/academics/data';
import { number, text } from '@/features/academics/domain';
import type { TargetGrade } from '@/types/database';
import { usePreferences } from '@/providers/PreferencesProvider';

export default function SubjectForm() {
  const params = useLocalSearchParams<{ id?: string }>();
  const student = useStudent();
  const { t } = usePreferences();
  const existing = student.data?.subjects.find(s => s.id === params.id);
  const [id] = useState(() => params.id || Crypto.randomUUID());
  const [loaded, setLoaded] = useState(!params.id);
  const [form, setForm] = useState({ name: '', code: '', credits: '3', assignment: '20', attendance: '75', target: 'B+', notes: '' });
  const lock = useRef(false);
  if (!loaded && existing) { setForm({ name: existing.name, code: existing.code, credits: String(existing.credits), assignment: String(existing.assignment_weight), attendance: String(existing.attendance_threshold), target: existing.target_grade, notes: existing.additional_notes || '' }); setLoaded(true); }
  const change = (key: keyof typeof form) => (value: string) => setForm(f => ({ ...f, [key]: value }));
  const save = useSave(async (userId, db) => {
    const semesterId = student.data?.semester?.id;
    if (!semesterId) throw new Error('Set up a semester first.');
    const name = text(form.name, t('mobile.name')), code = text(form.code, t('mobile.code'), 30).toUpperCase();
    if (!/^[\p{L}\p{N}_.-]+$/u.test(code)) throw new Error('Subject code may contain letters, numbers, dots, underscores and hyphens.');
    const credits = number(form.credits, t('mobile.creditsLabel'), 0, 30, true);
    const assignment_weight = number(form.assignment, t('mobile.assignmentWeight'), 0, 100, true);
    const attendance_threshold = number(form.attendance, t('mobile.threshold'), 0, 100, true);
    const duplicate = await db.from('trackademic_subjects').select('id').eq('user_id', userId).eq('semester_id', semesterId).ilike('code', code).neq('id', id).limit(1);
    if (duplicate.error) throw new Error(duplicate.error.message);
    if (duplicate.data?.length) throw new Error('This subject code already exists in the semester.');
    if (params.id) await ownedSubject(db, userId, id);
    const payload = { code, name, credits, is_credit_subject: credits > 0, assignment_weight, exam_weight: 100 - assignment_weight, attendance_threshold, target_grade: form.target as TargetGrade, additional_notes: form.notes.trim() || null };
    confirmed(params.id ? await db.from('trackademic_subjects').update(payload).eq('id', id).eq('user_id', userId).select('id').single() : await db.from('trackademic_subjects').upsert({ ...payload, id, semester_id: semesterId, user_id: userId }).select('id').single());
    // Set completion only after a subject exists; never overwrite XP or badges.
    const profile = await db.from('trackademic_profiles').update({ onboarding_completed: true, onboarding_step: 3 }).eq('id', userId).select('id').single();
    confirmed(profile);
  });
  async function submit() {
    if (lock.current) return;
    lock.current = true;
    try { await save.mutateAsync(undefined); router.replace({ pathname: '/subjects/[id]', params: { id } }); } catch {} finally { lock.current = false; }
  }
  return <Screen><Back /><Label heading>{t(params.id ? 'mobile.editSubject' : 'mobile.addSubject')}</Label>
    {student.isPending ? <Busy /> : student.isError ? <Failure retry={() => void student.refetch()} /> : params.id && !existing ? <Label>{t('mobile.unavailable')}</Label> : !student.data?.semester ? <SetupCard /> : <Card>
      <Field label={t('mobile.name')} value={form.name} onChange={change('name')} />
      <Field label={t('mobile.code')} value={form.code} onChange={change('code')} />
      <Field label={t('mobile.creditsLabel')} numeric value={form.credits} onChange={change('credits')} />
      <Choices label={t('mobile.targetGrade')} value={form.target} options={['A', 'B+', 'B', 'C', 'D'].map(value => ({ value, label: value }))} onChange={change('target')} />
      <Field label={t('mobile.assignmentWeight')} numeric value={form.assignment} onChange={change('assignment')} />
      <Label muted>{t('mobile.examWeight')}: {Number.isFinite(Number(form.assignment)) ? 100 - Number(form.assignment) : '—'}%</Label>
      <Field label={t('mobile.threshold')} numeric value={form.attendance} onChange={change('attendance')} />
      <Field label={t('mobile.notes')} multiline value={form.notes} onChange={change('notes')} />
      <SaveError error={save.error} /><Button label={t(save.isPending ? 'common.loading' : 'mobile.save')} disabled={save.isPending || !loaded} onPress={() => void submit()} />
    </Card>}
  </Screen>;
}
