import { useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import * as Crypto from 'expo-crypto';
import { Back, Field, SaveError } from '@/components/forms';
import { Busy, Button, Card, Failure, Label, Screen } from '@/components/ui';
import { confirmed, pages, useSave, type Tables } from '@/features/academics/data';
import { date, text, today } from '@/features/academics/domain';
import { useAuth } from '@/providers/AuthProvider';
import { usePreferences } from '@/providers/PreferencesProvider';
import { supabase } from '@/lib/supabase';

export default function Semesters() {
  const { session } = useAuth();
  const { t } = usePreferences();
  const userId = session?.user.id;
  const [id, setId] = useState(Crypto.randomUUID);
  const [name, setName] = useState('');
  const [start, setStart] = useState(today());
  const [end, setEnd] = useState('');
  const [saved, setSaved] = useState(false);
  const lock = useRef(false);
  const list = useQuery({ queryKey: ['semesters', userId], enabled: !!userId && !!supabase, queryFn: () => {
    if (!supabase || !userId) throw new Error('Sign-in required.');
    const db = supabase;
    return pages<Tables['trackademic_semesters']['Row']>((from, to) => db.from('trackademic_semesters').select('*').eq('user_id', userId).order('start_date', { ascending: false }).order('id').range(from, to));
  } });
  const create = useSave(async (uid, db) => {
    const start_date = date(start), end_date = date(end);
    if (end_date < start_date) throw new Error('End date must be on or after start date.');
    confirmed(await db.from('trackademic_semesters').upsert({ id, user_id: uid, name: text(name, t('mobile.name')), start_date, end_date, is_active: false }).select('id').single());
  });
  const activate = useSave(async (uid, db, target: string) => {
    confirmed(await db.from('trackademic_semesters').select('id').eq('user_id', uid).eq('id', target).single());
    const active = await db.from('trackademic_semesters').select('id').eq('user_id', uid).eq('is_active', true).maybeSingle();
    if (active.error) throw new Error(active.error.message);
    if (active.data?.id === target) return;
    const previous = active.data?.id;
    if (previous) confirmed(await db.from('trackademic_semesters').update({ is_active: false }).eq('id', previous).eq('user_id', uid).select('id').single());
    const result = await db.from('trackademic_semesters').update({ is_active: true }).eq('id', target).eq('user_id', uid).select('id').single();
    if (result.error || !result.data) {
      // Recover the previous choice when possible; the UI also permits recovery after interruption.
      if (previous) await db.from('trackademic_semesters').update({ is_active: true }).eq('id', previous).eq('user_id', uid);
      confirmed(result);
    }
  });
  async function add() {
    if (lock.current) return;
    lock.current = true;
    try { await create.mutateAsync(undefined); setSaved(true); setId(Crypto.randomUUID()); setName(''); setEnd(''); } catch {} finally { lock.current = false; }
  }
  return <Screen refresh={() => void list.refetch()} refreshing={list.isRefetching}><Back /><Label heading>{t('mobile.semesters')}</Label>
    <SaveError error={activate.error} />
    {list.isPending ? <Busy /> : list.isError ? <Failure retry={() => void list.refetch()} /> : list.data.map(s => <Card key={s.id}>
      <Label heading>{s.name}</Label><Label muted>{s.start_date} – {s.end_date}</Label>
      <Button label={t(s.is_active ? 'mobile.active' : 'mobile.activate')} secondary={s.is_active} disabled={s.is_active || activate.isPending || create.isPending} onPress={() => activate.mutate(s.id)} />
    </Card>)}
    <Card><Label heading>{t('mobile.newSemester')}</Label><Field label={t('mobile.name')} value={name} onChange={v => { setName(v); setSaved(false); }} />
      <Field label={t('mobile.startDate')} value={start} onChange={setStart} placeholder="YYYY-MM-DD" /><Field label={t('mobile.endDate')} value={end} onChange={setEnd} placeholder="YYYY-MM-DD" />
      <SaveError error={create.error} />{saved && <Label>{t('mobile.saved')}</Label>}
      <Button label={t(create.isPending ? 'common.loading' : 'mobile.save')} disabled={create.isPending || activate.isPending} onPress={() => void add()} />
    </Card>
  </Screen>;
}
