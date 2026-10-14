import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/providers/AuthProvider';
import type { Database } from '@/types/database';
import { pages } from './client';

export type Subject = Database['public']['Tables']['trackademic_subjects']['Row'];

export function useStudent() {
  const { session } = useAuth();
  const userId = session?.user.id;
  return useQuery({
    queryKey: ['student', userId], enabled: !!userId && !!supabase,
    queryFn: async () => {
      if (!supabase || !userId) throw new Error('Sign-in required.');
      const [profileResult, semesterResult] = await Promise.all([
        supabase.from('trackademic_profiles').select('*').eq('id', userId).maybeSingle(),
        supabase.from('trackademic_semesters').select('*').eq('user_id', userId).eq('is_active', true).maybeSingle(),
      ]);
      if (profileResult.error) throw profileResult.error;
      if (semesterResult.error) throw semesterResult.error;
      const semester = semesterResult.data;
      let subjects: Subject[] = [];
      if (semester) {
        const db = supabase;
        subjects = await pages<Subject>((from, to) => db.from('trackademic_subjects').select('*').eq('user_id', userId).eq('semester_id', semester.id).eq('is_archived', false).order('name').order('id').range(from, to));
      }
      return { profile: profileResult.data, semester, subjects };
    },
  });
}
