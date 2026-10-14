import { useRef, useState } from 'react';
import * as Crypto from 'expo-crypto';
import { router } from 'expo-router';
import { Back, Field, SaveError } from '@/components/forms';
import { Busy, Button, Card, Failure, Label, Screen } from '@/components/ui';
import { useStudent } from '@/features/academics/queries';
import { confirmed, useSave } from '@/features/academics/data';
import { date, text, today } from '@/features/academics/domain';
import { usePreferences } from '@/providers/PreferencesProvider';

export default function Setup() {
  const student = useStudent();
  const { t, locale } = usePreferences();
  const [semesterId] = useState(Crypto.randomUUID);
  const [name, setName] = useState('');
  const [semester, setSemester] = useState('');
  const [start, setStart] = useState(today());
  const [end, setEnd] = useState('');
  const lock = useRef(false);
  const save = useSave(async (userId, db) => {
    const displayName = text(name || student.data?.profile?.name || '', t('mobile.name'));
    // Existing profile is created by the shared Auth trigger. Preserve rewards and identity.
    if (!student.data?.profile) throw new Error('Your profile is missing. Refresh or check the Supabase profile trigger.');
    if (!student.data.semester) {
      const semesterName = text(semester, t('mobile.semester'));
      const startDate = date(start), endDate = date(end);
      if (endDate < startDate) throw new Error('End date must be on or after start date.');
      const active = await db.from('trackademic_semesters').select('id').eq('user_id', userId).eq('is_active', true).maybeSingle();
      if (active.error) throw new Error(active.error.message);
      if (!active.data) confirmed(await db.from('trackademic_semesters').upsert({ id: semesterId, user_id: userId, name: semesterName, start_date: startDate, end_date: endDate, is_active: true }).select('id').single());
    }
    confirmed(await db.from('trackademic_profiles').update({ name: displayName, locale, updated_at: new Date().toISOString() }).eq('id', userId).select('id').single());
  });
  async function submit() {
    if (lock.current) return;
    lock.current = true;
    try { await save.mutateAsync(undefined); router.replace('/subject-form'); } catch {} finally { lock.current = false; }
  }
  return <Screen><Back /><Label heading>{t('mobile.setupTitle')}</Label><Label muted>{t('mobile.setupNative')}</Label>
    {student.isPending ? <Busy /> : student.isError ? <Failure retry={() => void student.refetch()} /> : <Card>
      <Field label={t('mobile.name')} value={name} onChange={setName} placeholder={student.data?.profile?.name || ''} />
      {student.data?.semester ? <Label>{student.data.semester.name}</Label> : <>
        <Field label={t('mobile.semester')} value={semester} onChange={setSemester} />
        <Field label={t('mobile.startDate')} value={start} onChange={setStart} placeholder="YYYY-MM-DD" />
        <Field label={t('mobile.endDate')} value={end} onChange={setEnd} placeholder="YYYY-MM-DD" />
      </>}
      <SaveError error={save.error} /><Button label={t(save.isPending ? 'common.loading' : 'mobile.continue')} disabled={save.isPending} onPress={() => void submit()} />
    </Card>}
  </Screen>;
}
