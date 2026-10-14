import { Pressable, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Busy, Button, Card, Failure, Label, Screen } from '@/components/ui';
import { SetupCard } from '@/components/forms';
import { useAcademicRecords } from '@/features/academics/data';
import { today } from '@/features/academics/domain';
import { SubjectCard } from '@/components/SubjectCard';
import { useStudent } from '@/features/academics/queries';
import { usePreferences } from '@/providers/PreferencesProvider';

export default function Home() {
  const student = useStudent();
  const records = useAcademicRecords();
  const { theme, t } = usePreferences();
  const data = student.data;
  const name = data?.profile?.name?.trim().split(/\s+/)[0] || t('mobile.student');
  return <Screen refresh={() => { void student.refetch(); void records.refetch(); }} refreshing={student.isRefetching || records.isRefetching}>
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
      <View style={{ flex: 1 }}><Label muted>Trackademic</Label><Label heading>{t('mobile.hello', { name })}</Label></View>
      <Pressable accessibilityRole="button" accessibilityLabel={t('mobile.settings')} onPress={() => router.push('/account')}
        style={{ width: 48, height: 48, borderRadius: 16, backgroundColor: theme.muted, alignItems: 'center', justifyContent: 'center' }}>
        <Ionicons name="person-outline" size={23} color={theme.primary} />
      </Pressable>
    </View>
    <Label muted>{t('mobile.homeBody')}</Label>
    {student.isPending ? <Busy /> : student.isError ? <Failure retry={() => void student.refetch()} /> : !data?.profile ?
      <SetupCard /> : !data.semester ?
      <SetupCard /> : <>
        <Card style={{ backgroundColor: theme.muted }}><Label muted>{t('mobile.semester')}</Label>
          <Label heading>{data.semester.name}</Label><Label>{t('mobile.subjectCount', { count: data.subjects.length })}</Label>
          <Button label={t('mobile.browse')} onPress={() => router.push('/(tabs)/subjects')} />
        </Card>
        <Button label={t('mobile.quickAdd')} onPress={() => router.push('/add')} />
        <Label heading>{t('mobile.deadlines')}</Label>
        {records.isPending ? <Busy /> : records.isError ? <Failure retry={() => void records.refetch()} /> : records.data.assignments.filter(a => !['submitted', 'graded'].includes(a.status)).sort((a, b) => a.due_date.localeCompare(b.due_date)).slice(0, 5).map(a => <Card key={a.id}>
          <Label>{a.title}</Label><Label muted>{data.subjects.find(s => s.id === a.subject_id)?.name} · {a.due_date}</Label>
          {a.due_date < today() && <Label style={{ color: theme.danger }}>{t('mobile.overdue')}</Label>}
          <Button label={t('mobile.edit')} secondary onPress={() => router.push({ pathname: '/add', params: { kind: 'assignment', subject: a.subject_id, id: a.id } })} />
        </Card>)}
        {records.data && !records.data.assignments.some(a => !['submitted', 'graded'].includes(a.status)) && <Label muted>{t('mobile.noDeadlines')}</Label>}
        <Card><View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
          <Ionicons name="leaf-outline" size={26} color={theme.primary} /><Label style={{ flex: 1 }}>{t('mobile.motivation')}</Label>
        </View></Card>
        <Label heading>{t('nav.subjects')}</Label>
        {data.subjects.length ? data.subjects.slice(0, 3).map(subject => <SubjectCard key={subject.id} subject={subject} />) :
          <Button label={t('mobile.addSubject')} onPress={() => router.push('/subject-form')} />}
      </>}
  </Screen>;
}
