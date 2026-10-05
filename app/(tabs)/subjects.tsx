import { useState } from 'react';
import { TextInput } from 'react-native';
import { Busy, Card, Failure, Label, Screen, WebSetup } from '@/components/ui';
import { SubjectCard } from '@/components/SubjectCard';
import { useStudent } from '@/features/academics/queries';
import { usePreferences } from '@/providers/PreferencesProvider';

export default function Subjects() {
  const student = useStudent();
  const { theme, t } = usePreferences();
  const [search, setSearch] = useState('');
  const filter = search.trim().toLocaleLowerCase();
  const subjects = student.data?.subjects.filter(s => `${s.name} ${s.code} ${s.short_name ?? ''}`.toLocaleLowerCase().includes(filter)) ?? [];
  return <Screen refresh={() => void student.refetch()} refreshing={student.isRefetching}>
    <Label heading>{t('nav.subjects')}</Label>
    {student.data?.semester && <Label muted>{student.data.semester.name}</Label>}
    <TextInput accessibilityLabel={t('mobile.search')} placeholder={t('mobile.search')} placeholderTextColor={theme.secondary}
      value={search} onChangeText={setSearch} autoCorrect={false} clearButtonMode="while-editing"
      style={{ minHeight: 52, padding: 16, borderRadius: 14, borderWidth: 1, borderColor: theme.border, backgroundColor: theme.surface, color: theme.text, fontSize: 16 }} />
    {student.isPending ? <Busy /> : student.isError ? <Failure retry={() => void student.refetch()} /> : !student.data?.semester ?
      <WebSetup title={t('mobile.noSemester')} body={t('mobile.noSemesterBody')} path="/settings" /> : !student.data.subjects.length ?
      <WebSetup title={t('mobile.noSubjects')} body={t('mobile.noSubjectsBody')} path="/subjects" /> : subjects.length ?
        subjects.map(subject => <SubjectCard key={subject.id} subject={subject} />) : <Card><Label muted>{t('mobile.noMatch')}</Label></Card>}
  </Screen>;
}
