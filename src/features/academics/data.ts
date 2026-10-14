import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/providers/AuthProvider';
import { useStudent } from './queries';
import type { Database } from '@/types/database';
import { pages } from './client';
export { pages, confirmed, ownedSubject } from './client';

export type Tables = Database['public']['Tables'];
export type Assignment = Tables['trackademic_assignments']['Row'];
export type ClassSession = Tables['trackademic_sessions']['Row'];
export type StudySession = Tables['trackademic_study_sessions']['Row'];
export type Task = Tables['trackademic_user_tasks']['Row'];
export type Exam = Tables['trackademic_exams']['Row'];

export function useAcademicRecords() {
  const student = useStudent();
  const { session } = useAuth();
  const userId = session?.user.id;
  const ids = student.data?.subjects.map(s => s.id).sort() ?? [];
  return useQuery({
    queryKey: ['academic-records', userId, student.data?.semester?.id, ids],
    enabled: !!supabase && !!userId && !!student.data,
    queryFn: async () => {
      if (!supabase || !userId) throw new Error('Sign-in required.');
      const db = supabase;
      const [assignments, sessions, study, exams] = await Promise.all([
        ids.length ? pages<Assignment>((from, to) => db.from('trackademic_assignments').select('*').in('subject_id', ids).order('id').range(from, to)) : [],
        ids.length ? pages<ClassSession>((from, to) => db.from('trackademic_sessions').select('*').in('subject_id', ids).order('id').range(from, to)) : [],
        ids.length ? pages<StudySession>((from, to) => db.from('trackademic_study_sessions').select('*').eq('user_id', userId).in('subject_id', ids).order('id').range(from, to)) : [],
        ids.length ? pages<Exam>((from, to) => db.from('trackademic_exams').select('*').in('subject_id', ids).order('id').range(from, to)) : [],
      ]);
      return { assignments, sessions, study, exams };
    },
  });
}

export function useTasks() {
  const { session } = useAuth();
  const userId = session?.user.id;
  return useQuery({ queryKey: ['tasks', userId], enabled: !!userId && !!supabase, queryFn: async () => {
    if (!supabase || !userId) throw new Error('Sign-in required.');
    const db = supabase;
    return pages<Task>((from, to) => db.from('trackademic_user_tasks').select('*').eq('user_id', userId).order('created_at', { ascending: false }).order('id').range(from, to));
  } });
}

export function useSave<T>(action: (userId: string, db: NonNullable<typeof supabase>, input: T) => Promise<void>) {
  const { session } = useAuth();
  const queries = useQueryClient();
  const userId = session?.user.id;
  return useMutation({ retry: false, mutationFn: async (input: T) => {
    if (!userId || !supabase) throw new Error('Sign-in required.');
    // RLS is authoritative; never use a privileged key in this app.
    await action(userId, supabase, input);
  }, onSettled: async () => {
    await queries.invalidateQueries({ predicate: q => q.queryKey[1] === userId });
  } });
}
