import { useState } from 'react';
import { router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { TextInput } from 'react-native';
import { Busy, Button, Card, Failure, Label, Screen } from '@/components/ui';
import { SetupCard } from '@/components/forms';
import { SaveError } from '@/components/forms';
import { confirmed, pages, useSave } from '@/features/academics/data';
import type { Subject } from '@/features/academics/queries';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/providers/AuthProvider';
import { SubjectCard } from '@/components/SubjectCard';
import { useStudent } from '@/features/academics/queries';
import { usePreferences } from '@/providers/PreferencesProvider';

export default function Subjects() {
  const student = useStudent();
  const { theme, t } = usePreferences();
  const [search, setSearch] = useState('');
  const [showArchived, setShowArchived] = useState(false);
  const { session } = useAuth();
  const userId = session?.user.id;
  const semesterId = student.data?.semester?.id;
  const archived = useQuery({ queryKey: ['archived-subjects', userId, semesterId], enabled: showArchived && !!userId && !!semesterId && !!supabase, queryFn: () => {
    if (!supabase || !userId || !semesterId) throw new Error('Choose a semester.');
    const db = supabase;
    return pages<Subject>((from, to) => db.from('trackademic_subjects').select('*').eq('user_id', userId).eq('semester_id', semesterId).eq('is_archived', true).order('name').order('id').range(from, to));
  } });
  const restore = useSave(async (uid, db, id: string) => {
    confirmed(await db.from('trackademic_subjects').update({ is_archived: false }).eq('id', id).eq('user_id', uid).eq('semester_id', semesterId!).select('id').single());
  });
  const filter = search.trim().toLocaleLowerCase();
  const subjects = student.data?.subjects.filter(s => `${s.name} ${s.code} ${s.short_name ?? ''}`.toLocaleLowerCase().includes(filter)) ?? [];
  return <Screen refresh={() => void student.refetch()} refreshing={student.isRefetching}>
    <Label heading>{t('nav.subjects')}</Label>
    <Button label={t('mobile.addSubject')} onPress={() => router.push('/subject-form')} />
    {student.data?.semester && <Label muted>{student.data.semester.name}</Label>}
    <TextInput accessibilityLabel={t('mobile.search')} placeholder={t('mobile.search')} placeholderTextColor={theme.secondary}
      value={search} onChangeText={setSearch} autoCorrect={false} clearButtonMode="while-editing"
      style={{ minHeight: 52, padding: 16, borderRadius: 14, borderWidth: 1, borderColor: theme.border, backgroundColor: theme.surface, color: theme.text, fontSize: 16 }} />
    {student.isPending ? <Busy /> : student.isError ? <Failure retry={() => void student.refetch()} /> : !student.data?.semester ?
      <SetupCard /> : !student.data.subjects.length ?
      <SetupCard /> : subjects.length ?
        subjects.map(subject => <SubjectCard key={subject.id} subject={subject} />) : <Card><Label muted>{t('mobile.noMatch')}</Label></Card>}
    {!!semesterId && <Button secondary label={t(showArchived ? 'mobile.hideArchived' : 'mobile.showArchived')} onPress={() => setShowArchived(v => !v)} />}
    {showArchived && <><SaveError error={restore.error} />{archived.isPending ? <Busy /> : archived.isError ? <Failure retry={() => void archived.refetch()} /> : archived.data.length ? archived.data.map(subject => <Card key={subject.id}><Label>{subject.name} · {subject.code}</Label><Button label={t('mobile.restore')} disabled={restore.isPending} onPress={() => restore.mutate(subject.id)} /></Card>) : <Label muted>{t('mobile.noArchived')}</Label>}</>}
  </Screen>;
}
