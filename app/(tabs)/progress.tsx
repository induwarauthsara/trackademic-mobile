import { router } from 'expo-router';
import { View } from 'react-native';
import { Busy, Button, Card, Failure, Label, Screen } from '@/components/ui';
import { SetupCard } from '@/components/forms';
import { useStudent } from '@/features/academics/queries';
import { useAcademicRecords } from '@/features/academics/data';
import { attendance, average, examPrediction, gradeTargets } from '@/features/academics/domain';
import { usePreferences } from '@/providers/PreferencesProvider';

export default function Progress() {
  const student = useStudent();
  const records = useAcademicRecords();
  const { theme, t } = usePreferences();
  const refresh = () => { void student.refetch(); void records.refetch(); };
  const percent = (v: number | null) => v === null ? t('mobile.noEvidence') : `${v.toFixed(1)}%`;
  return <Screen refresh={refresh} refreshing={student.isRefetching || records.isRefetching}>
    <Label heading>{t('mobile.progress')}</Label><Label muted>{t('mobile.metricsNote')}</Label>
    {student.data?.profile && <Card><Label heading>{t('mobile.achievements')}</Label><Label>{student.data.profile.xp ?? 0} XP · {student.data.profile.current_streak ?? 0} {t('mobile.streakDays')}</Label><Label muted>{t('mobile.rewardsNote')}</Label></Card>}
    {student.isPending ? <Busy /> : student.isError ? <Failure retry={refresh} /> : !student.data?.subjects.length ? <SetupCard /> : records.isPending ? <Busy /> : records.isError ? <Failure retry={refresh} /> : <>
      {student.data.subjects.map(subject => {
        const assignments = records.data.assignments.filter(a => a.subject_id === subject.id);
        const classes = records.data.sessions.filter(s => s.subject_id === subject.id);
        const mean = average(assignments);
        const all = attendance(classes), lectures = attendance(classes, true);
        const predictor = examPrediction(mean, gradeTargets[subject.target_grade], subject.assignment_weight, subject.exam_weight);
        const minutes = records.data.study.filter(s => s.subject_id === subject.id).reduce((sum, s) => sum + s.duration_minutes, 0);
        return <Card key={subject.id}>
          <Label heading>{subject.name}</Label><Label muted>{subject.code} · {t('mobile.target', { grade: subject.target_grade })}</Label>
          <Label>{t('mobile.averageMark')}: {percent(mean)}</Label>
          <Label muted>{t('mobile.markCount', { count: assignments.filter(a => a.mark !== null).length })}</Label>
          {mean !== null && <View accessibilityLabel={`${t('mobile.averageMark')} ${percent(mean)}`} style={{ height: 10, borderRadius: 5, backgroundColor: theme.muted, overflow: 'hidden' }}><View style={{ height: 10, width: `${Math.max(0, Math.min(100, mean))}%`, backgroundColor: theme.primary }} /></View>}
          <Label>{t('mobile.allAttendance')}: {percent(all.percentage)} ({all.attended}/{all.count})</Label>
          <Label>{t('mobile.lectureAttendance')}: {percent(lectures.percentage)} ({lectures.attended}/{lectures.count})</Label>
          {all.percentage !== null && all.percentage < subject.attendance_threshold && <Label style={{ color: theme.danger }}>{t('mobile.attendanceRisk', { threshold: subject.attendance_threshold })}</Label>}
          <Label>{t(`mobile.predict_${predictor.state}`, { score: predictor.score?.toFixed(1) || '—' })}</Label>
          <Label muted>{t('mobile.totalStudy', { minutes })}</Label>
          <Button label={t('mobile.sourceRecords')} secondary onPress={() => router.push({ pathname: '/subjects/[id]', params: { id: subject.id } })} />
        </Card>;
      })}
    </>}
    <Label muted>{t('mobile.attendanceNote')}</Label><Label muted>{t('mobile.predictionNote')}</Label>
  </Screen>;
}
