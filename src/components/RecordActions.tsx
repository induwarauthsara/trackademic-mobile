import { useState } from 'react';
import { router } from 'expo-router';
import { Button, Label } from './ui';
import { SaveError } from './forms';
import { confirmed, ownedSubject, useSave } from '@/features/academics/data';
import type { RecordKind } from '@/features/academics/records';
import { usePreferences } from '@/providers/PreferencesProvider';

const tables = { assignment: 'trackademic_assignments', attendance: 'trackademic_sessions', study: 'trackademic_study_sessions', task: 'trackademic_user_tasks', exam: 'trackademic_exams' } as const;
export function RecordActions({ kind, id, subject }: { kind: RecordKind; id: string; subject?: string | null }) {
  const { t } = usePreferences();
  const [confirm, setConfirm] = useState(false);
  const remove = useSave(async (userId, db) => {
    if (subject) await ownedSubject(db, userId, subject);
    if (kind === 'study') confirmed(await db.from('trackademic_study_sessions').delete().eq('id', id).eq('user_id', userId).select('id').single());
    else if (kind === 'task') confirmed(await db.from('trackademic_user_tasks').delete().eq('id', id).eq('user_id', userId).select('id').single());
    else {
      if (!subject) throw new Error('Choose a subject.');
      confirmed(await db.from(tables[kind]).delete().eq('id', id).eq('subject_id', subject).select('id').single());
    }
  });
  return <>
    {!confirm && <Button secondary label={t('mobile.edit')} onPress={() => router.push({ pathname: '/add', params: { kind, id, subject: subject || '' } })} />}
    <SaveError error={remove.error} />
    {confirm ? <><Label>{t('mobile.deleteImpact')}</Label><Button label={t(remove.isPending ? 'common.loading' : 'mobile.confirmDelete')} disabled={remove.isPending} onPress={() => remove.mutate(undefined)} /><Button secondary label={t('mobile.cancel')} disabled={remove.isPending} onPress={() => setConfirm(false)} /></> : <Button secondary label={t('mobile.delete')} onPress={() => setConfirm(true)} />}
  </>;
}
