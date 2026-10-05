import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/providers/AuthProvider';
import type { Database } from '@/types/database';

export type Subject = Database['public']['Tables']['trackademic_subjects']['Row'];

export function useStudent() {
  const { session } = useAuth();
  const userId = session?.user.id;
  return useQuery({
    queryKey: ['student', userId], enabled: !!userId && !!supabase,
    queryFn: async () => {
      if (!supabase || !userId) throw new Error('Sign-in required.');
      const [profileResult, semesterResult] = await Promise.all([
        supabase.from('trackademic_profiles').select('id,name,university,degree,locale,theme_preference,onboarding_completed,experience_tier,xp').eq('id', userId).maybeSingle(),
        supabase.from('trackademic_semesters').select('*').eq('user_id', userId).eq('is_active', true).maybeSingle(),
      ]);
      if (profileResult.error) throw profileResult.error;
      if (semesterResult.error) throw semesterResult.error;
      const semester = semesterResult.data;
      let subjects: Subject[] = [];
      if (semester) {
        const result = await supabase.from('trackademic_subjects').select('*').eq('user_id', userId).eq('semester_id', semester.id).eq('is_archived', false).order('name');
        if (result.error) throw result.error;
        subjects = result.data;
      }
      return { profile: profileResult.data, semester, subjects };
    },
  });
}

export function useSubjectRecords(subjectId: string) {
  const student = useStudent();
  const { session } = useAuth();
  const subject = student.data?.subjects.find(s => s.id === subjectId);
  const query = useQuery({
    queryKey: ['subject-records', session?.user.id, subjectId], enabled: !!subject && !!supabase,
    queryFn: async () => {
      if (!supabase || !subject) throw new Error('Subject unavailable.');
      const [assignments, sessions] = await Promise.all([
        supabase.from('trackademic_assignments').select('id,title,mark,status,due_date').eq('subject_id', subject.id).order('due_date', { ascending: false }),
        supabase.from('trackademic_sessions').select('id,date,topic,type,attended,status').eq('subject_id', subject.id).order('date', { ascending: false }),
      ]);
      if (assignments.error) throw assignments.error;
      if (sessions.error) throw sessions.error;
      return { assignments: assignments.data, sessions: sessions.data };
    },
  });
  return { student, subject, query };
}
