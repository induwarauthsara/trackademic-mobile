import { Pressable, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Busy, Button, Card, Failure, Label, Screen, WebSetup } from '@/components/ui';
import { SubjectCard } from '@/components/SubjectCard';
import { useStudent } from '@/features/academics/queries';
import { usePreferences } from '@/providers/PreferencesProvider';

export default function Home() {
  const student = useStudent();
  const { theme, t } = usePreferences();
  const data = student.data;
  const name = data?.profile?.name?.trim().split(/\s+/)[0] || t('mobile.student');
  return <Screen refresh={() => void student.refetch()} refreshing={student.isRefetching}>
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
      <View style={{ flex: 1 }}><Label muted>Trackademic</Label><Label heading>{t('mobile.hello', { name })}</Label></View>
      <Pressable accessibilityRole="button" accessibilityLabel={t('mobile.settings')} onPress={() => router.push('/account')}
        style={{ width: 48, height: 48, borderRadius: 16, backgroundColor: theme.muted, alignItems: 'center', justifyContent: 'center' }}>
        <Ionicons name="person-outline" size={23} color={theme.primary} />
      </Pressable>
    </View>
    <Label muted>{t('mobile.homeBody')}</Label>
    {student.isPending ? <Busy /> : student.isError ? <Failure retry={() => void student.refetch()} /> : !data?.profile ?
      <WebSetup title={t('mobile.setupTitle')} body={t('mobile.profileMissing')} path="/settings" /> : !data.profile.onboarding_completed && data.subjects.length === 0 ?
      <WebSetup title={t('mobile.setupTitle')} body={t('mobile.setupBody')} /> : !data.semester ?
      <WebSetup title={t('mobile.noSemester')} body={t('mobile.noSemesterBody')} path="/settings" /> : <>
        <Card style={{ backgroundColor: theme.muted }}><Label muted>{t('mobile.semester')}</Label>
          <Label heading>{data.semester.name}</Label><Label>{t('mobile.subjectCount', { count: data.subjects.length })}</Label>
          <Button label={t('mobile.browse')} onPress={() => router.push('/(tabs)/subjects')} />
        </Card>
        <Card><View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
          <Ionicons name="leaf-outline" size={26} color={theme.primary} /><Label style={{ flex: 1 }}>{t('mobile.motivation')}</Label>
        </View></Card>
        <Label heading>{t('nav.subjects')}</Label>
        {data.subjects.length ? data.subjects.slice(0, 3).map(subject => <SubjectCard key={subject.id} subject={subject} />) :
          <WebSetup title={t('mobile.noSubjects')} body={t('mobile.noSubjectsBody')} path="/subjects" />}
      </>}
    <Label muted style={{ fontSize: 13 }}>{t('mobile.readOnly')}</Label>
  </Screen>;
}
