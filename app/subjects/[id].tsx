import { useLocalSearchParams, router } from 'expo-router';
import { Busy, Button, Card, Failure, Label, Screen } from '@/components/ui';
import { useSubjectRecords } from '@/features/academics/queries';
import { usePreferences } from '@/providers/PreferencesProvider';

export default function SubjectDetail() {
  const params = useLocalSearchParams<{ id: string }>();
  const id = typeof params.id === 'string' ? params.id : '';
  const { student, subject, query } = useSubjectRecords(id);
  const { theme, t } = usePreferences();
  const refresh = () => { void student.refetch(); void query.refetch(); };
  return <Screen refresh={refresh} refreshing={student.isRefetching || query.isRefetching}>
    <Button label={t('mobile.back')} secondary onPress={() => router.canGoBack() ? router.back() : router.replace('/(tabs)/subjects')} />
    {student.isPending ? <Busy /> : student.isError ? <Failure retry={refresh} /> : !subject ? <Card><Label>{t('mobile.unavailable')}</Label></Card> : <>
      <Label style={{ color: theme.primary, fontWeight: '700' }}>{subject.code}</Label><Label heading>{subject.name}</Label>
      <Card><Label>{t('mobile.target', { grade: subject.target_grade })}</Label>
        {subject.is_credit_subject && <Label muted>{t('mobile.credits', { count: subject.credits })}</Label>}
        {!!subject.achieved_grade && <Label>{t('mobile.finalGrade')}: {subject.achieved_grade}</Label>}
        {!!subject.additional_notes && <Label muted>{subject.additional_notes}</Label>}
      </Card>
      {query.isPending ? <Busy /> : query.isError ? <Failure retry={refresh} /> : <>
        <Label heading>{t('mobile.assignments')}</Label>
        {query.data?.assignments.length ? query.data.assignments.map(assignment => <Card key={assignment.id}>
          <Label style={{ fontWeight: '600' }}>{assignment.title}</Label>
          <Label style={{ color: theme.primary, fontSize: 21, fontWeight: '700' }}>{assignment.mark === null ? t('mobile.noMark') : `${assignment.mark}%`}</Label>
          <Label muted>{t(`mobile.status_${assignment.status}`)}</Label><Label muted>{t('mobile.due', { date: assignment.due_date })}</Label>
        </Card>) : <Label muted>{t('mobile.noAssignments')}</Label>}
        <Label heading>{t('mobile.classes')}</Label>
        {query.data?.sessions.length ? query.data.sessions.map(classSession => <Card key={classSession.id}>
          <Label style={{ fontWeight: '600' }}>{classSession.topic}</Label><Label muted>{classSession.date} · {t(`quick_add.type_${classSession.type}`)}</Label>
          <Label>{t(`mobile.status_${classSession.attended}`)} · {t(`mobile.status_${classSession.status}`)}</Label>
        </Card>) : <Label muted>{t('mobile.noClasses')}</Label>}
      </>}
    </>}
  </Screen>;
}
