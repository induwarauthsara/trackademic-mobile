import { useLocalSearchParams, router } from 'expo-router';
import { Busy, Button, Card, Failure, Label, Screen } from '@/components/ui';
import { useStudent } from '@/features/academics/queries';
import { useAcademicRecords } from '@/features/academics/data';
import { RecordActions } from '@/components/RecordActions';
import { ArchiveSubject } from '@/components/ArchiveSubject';
import { usePreferences } from '@/providers/PreferencesProvider';

export default function SubjectDetail() {
  const params = useLocalSearchParams<{ id: string }>();
  const id = typeof params.id === 'string' ? params.id : '';
  const student = useStudent();
  const subject = student.data?.subjects.find(s => s.id === id);
  const query = useAcademicRecords();
  const { theme, t } = usePreferences();
  const refresh = () => { void student.refetch(); void query.refetch(); };
  return <Screen refresh={refresh} refreshing={student.isRefetching || query.isRefetching}>
    <Button label={t('mobile.back')} secondary onPress={() => router.canGoBack() ? router.back() : router.replace('/(tabs)/subjects')} />
    {student.isPending ? <Busy /> : student.isError ? <Failure retry={refresh} /> : !subject ? <Card><Label>{t('mobile.unavailable')}</Label></Card> : <>
      <Label style={{ color: theme.primary, fontWeight: '700' }}>{subject.code}</Label><Label heading>{subject.name}</Label>
      <Button label={t('mobile.editSubject')} secondary onPress={() => router.push({ pathname: '/subject-form', params: { id } })} />
      <Button label={t('mobile.quickAdd')} onPress={() => router.push({ pathname: '/add', params: { subject: id } })} />
      <Card><Label>{t('mobile.target', { grade: subject.target_grade })}</Label>
        {subject.is_credit_subject && <Label muted>{t('mobile.credits', { count: subject.credits })}</Label>}
        {!!subject.achieved_grade && <Label>{t('mobile.finalGrade')}: {subject.achieved_grade}</Label>}
        {!!subject.additional_notes && <Label muted>{subject.additional_notes}</Label>}
      </Card>
      {query.isPending ? <Busy /> : query.isError ? <Failure retry={refresh} /> : <>
        <Label heading>{t('mobile.assignments')}</Label>
        {query.data?.assignments.some(a => a.subject_id === id) ? query.data.assignments.filter(a => a.subject_id === id).sort((a, b) => b.due_date.localeCompare(a.due_date)).map(assignment => <Card key={assignment.id}>
          <Label style={{ fontWeight: '600' }}>{assignment.title}</Label>
          <Label style={{ color: theme.primary, fontSize: 21, fontWeight: '700' }}>{assignment.mark === null ? t('mobile.noMark') : `${assignment.mark}%`}</Label>
          <Label muted>{t(`mobile.status_${assignment.status}`)}</Label><Label muted>{t('mobile.due', { date: assignment.due_date })}</Label>
          <RecordActions kind="assignment" id={assignment.id} subject={id} />
        </Card>) : <Label muted>{t('mobile.noAssignments')}</Label>}
        <Label heading>{t('mobile.classes')}</Label>
        {query.data?.sessions.some(s => s.subject_id === id) ? query.data.sessions.filter(s => s.subject_id === id).sort((a, b) => b.date.localeCompare(a.date)).map(classSession => <Card key={classSession.id}>
          <Label style={{ fontWeight: '600' }}>{classSession.topic}</Label><Label muted>{classSession.date} · {t(`quick_add.type_${classSession.type}`)}</Label>
          <Label>{t(`mobile.status_${classSession.attended}`)} · {t(`mobile.status_${classSession.status}`)}</Label>
          <RecordActions kind="attendance" id={classSession.id} subject={id} />
        </Card>) : <Label muted>{t('mobile.noClasses')}</Label>}
        <Label heading>{t('mobile.exams')}</Label>
        {query.data?.exams.filter(e => e.subject_id === id).sort((a, b) => a.date.localeCompare(b.date)).map(exam => <Card key={exam.id}><Label>{exam.date} · {exam.time}</Label><Label muted>{exam.venue}</Label><RecordActions kind="exam" id={exam.id} subject={id} /></Card>)}
      </>}
      <ArchiveSubject id={id} />
    </>}
  </Screen>;
}
