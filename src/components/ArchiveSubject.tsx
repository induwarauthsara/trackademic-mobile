import { useState } from 'react';
import { router } from 'expo-router';
import { Button, Label } from './ui';
import { SaveError } from './forms';
import { confirmed, ownedSubject, useSave } from '@/features/academics/data';
import { usePreferences } from '@/providers/PreferencesProvider';

export function ArchiveSubject({ id }: { id: string }) {
  const { t } = usePreferences();
  const [confirm, setConfirm] = useState(false);
  const save = useSave(async (userId, db) => {
    await ownedSubject(db, userId, id);
    confirmed(await db.from('trackademic_subjects').update({ is_archived: true }).eq('id', id).eq('user_id', userId).select('id').single());
  });
  return <><SaveError error={save.error} />{confirm ? <>
    <Label>{t('mobile.archiveImpact')}</Label>
    <Button disabled={save.isPending} label={t('mobile.archive')} onPress={() => { void save.mutateAsync(undefined).then(() => router.replace('/(tabs)/subjects')).catch(() => {}); }} />
    <Button disabled={save.isPending} secondary label={t('mobile.cancel')} onPress={() => setConfirm(false)} />
  </> : <Button secondary label={t('mobile.archive')} onPress={() => setConfirm(true)} />}</>;
}
