// Auto-generated type definitions for all trackademic_ tables
// Update this file as the schema evolves

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type TargetGrade = 'A' | 'B+' | 'B' | 'C' | 'D'
export type SessionType = 'lecture' | 'practical' | 'lab' | 'tutorial'
export type AttendanceStatus = 'present' | 'absent' | 'late' | 'medical'
export type TopicStatus = 'not_started' | 'in_progress' | 'completed' | 'mastered'
export type AssignmentStatus = 'not_started' | 'in_progress' | 'submitted' | 'graded'
export type AIInsightType = 'daily_brief' | 'weakness' | 'schedule' | 'report' | 'custom'
export type ChatRole = 'user' | 'assistant'

export interface Database {
  public: {
    Tables: {
      trackademic_profiles: {
        Row: {
          id: string
          name: string | null
          university: string | null
          degree: string | null
          gpa_goal: number | null
          study_hours_per_week: number | null
          monthly_lecture_attendance_goal: number
          avatar_url: string | null
          created_at: string
          updated_at: string
          is_premium: boolean
          stripe_customer_id: string | null
          current_streak: number | null
          longest_streak: number | null
          last_activity_date: string | null
          xp: number | null
          badges: Json | null
          experience_tier: string | null
          education_level: string | null
          institution_slug: string | null
          locale: string | null
          theme_preference: string | null
          onboarding_completed: boolean | null
          onboarding_step: number | null
          daily_goal_type: string | null
          daily_goal_target: number | null
          tour_completed: boolean | null
          schedule_checked_date: string | null
          last_same_day_xp_date: string | null
          last_daily_goal_xp_date: string | null
          locale_initial: string | null
          is_admin: boolean
          community_opted_in: boolean
          community_cohort_key: string | null
          country: string | null
          country_code: string | null
          active_study_plan_id: string | null
          goal_display_mode: string | null
          mobile_nav_slot: string
        }
        Insert: {
          id: string
          name?: string | null
          university?: string | null
          degree?: string | null
          gpa_goal?: number | null
          study_hours_per_week?: number | null
          monthly_lecture_attendance_goal?: number
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
          is_premium?: boolean
          stripe_customer_id?: string | null
          current_streak?: number | null
          longest_streak?: number | null
          last_activity_date?: string | null
          xp?: number | null
          badges?: Json | null
          experience_tier?: string | null
          education_level?: string | null
          institution_slug?: string | null
          locale?: string | null
          theme_preference?: string | null
          onboarding_completed?: boolean | null
          onboarding_step?: number | null
          daily_goal_type?: string | null
          daily_goal_target?: number | null
          tour_completed?: boolean | null
          schedule_checked_date?: string | null
          last_same_day_xp_date?: string | null
          last_daily_goal_xp_date?: string | null
          locale_initial?: string | null
          is_admin?: boolean
          community_opted_in?: boolean
          community_cohort_key?: string | null
          country?: string | null
          country_code?: string | null
          active_study_plan_id?: string | null
          goal_display_mode?: string | null
          mobile_nav_slot?: string
        }
        Update: {
          name?: string | null
          university?: string | null
          degree?: string | null
          gpa_goal?: number | null
          study_hours_per_week?: number | null
          monthly_lecture_attendance_goal?: number
          avatar_url?: string | null
          updated_at?: string
          is_premium?: boolean
          stripe_customer_id?: string | null
          current_streak?: number | null
          longest_streak?: number | null
          last_activity_date?: string | null
          xp?: number | null
          badges?: Json | null
          experience_tier?: string | null
          education_level?: string | null
          institution_slug?: string | null
          locale?: string | null
          theme_preference?: string | null
          onboarding_completed?: boolean | null
          onboarding_step?: number | null
          daily_goal_type?: string | null
          daily_goal_target?: number | null
          tour_completed?: boolean | null
          schedule_checked_date?: string | null
          last_same_day_xp_date?: string | null
          last_daily_goal_xp_date?: string | null
          locale_initial?: string | null
          is_admin?: boolean
          community_opted_in?: boolean
          community_cohort_key?: string | null
          country?: string | null
          country_code?: string | null
          active_study_plan_id?: string | null
          goal_display_mode?: string | null
          mobile_nav_slot?: string
        }
        Relationships: any[]
      }
      trackademic_beta_feedback: {
        Row: {
          id: string
          user_id: string
          category: 'bug' | 'feature' | 'general'
          rating: number | null
          message: string
          page_path: string | null
          user_email: string | null
          user_name: string | null
          user_locale: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          category: 'bug' | 'feature' | 'general'
          rating?: number | null
          message: string
          page_path?: string | null
          user_email?: string | null
          user_name?: string | null
          user_locale?: string | null
          created_at?: string
        }
        Update: {
          category?: 'bug' | 'feature' | 'general'
          rating?: number | null
          message?: string
          page_path?: string | null
        }
        Relationships: any[]
      }
      trackademic_community_members: {
        Row: {
          user_id: string
          cohort_key: string
          joined_at: string
          visibility: Json
        }
        Insert: {
          user_id: string
          cohort_key: string
          joined_at?: string
          visibility?: Json
        }
        Update: {
          cohort_key?: string
          visibility?: Json
        }
        Relationships: any[]
      }
      trackademic_community_posts: {
        Row: {
          id: string
          author_id: string
          cohort_key: string
          type: string
          body: string
          visibility: string
          document_id: string | null
          quiz_id: string | null
          poll_options: Json | null
          is_anonymous: boolean
          accepted_comment_id: string | null
          hidden_at: string | null
          reported_at: string | null
          tags: string[]
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          author_id: string
          cohort_key: string
          type: string
          body: string
          visibility?: string
          document_id?: string | null
          quiz_id?: string | null
          poll_options?: Json | null
          is_anonymous?: boolean
          tags?: string[]
        }
        Update: {
          body?: string
          reported_at?: string | null
          hidden_at?: string | null
          accepted_comment_id?: string | null
          updated_at?: string
        }
        Relationships: any[]
      }
      trackademic_community_comments: {
        Row: {
          id: string
          post_id: string
          author_id: string
          body: string
          created_at: string
        }
        Insert: {
          id?: string
          post_id: string
          author_id: string
          body: string
        }
        Update: Record<string, never>
        Relationships: any[]
      }
      trackademic_community_reactions: {
        Row: {
          post_id: string
          user_id: string
          reaction: string
          created_at: string
        }
        Insert: {
          post_id: string
          user_id: string
          reaction?: string
        }
        Update: {
          reaction?: string
        }
        Relationships: any[]
      }
      trackademic_community_post_reports: {
        Row: {
          id: string
          post_id: string
          reporter_id: string
          reason: string | null
          reason_code: string | null
          status: string
          reviewed_at: string | null
          reviewed_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          post_id: string
          reporter_id: string
          reason?: string | null
          reason_code?: string | null
          status?: string
        }
        Update: {
          status?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
        }
        Relationships: any[]
      }
      trackademic_friendships: {
        Row: {
          id: string
          requester_id: string
          addressee_id: string
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          requester_id: string
          addressee_id: string
          status?: string
        }
        Update: {
          status?: string
          updated_at?: string
        }
        Relationships: any[]
      }
      trackademic_challenges: {
        Row: {
          id: string
          creator_id: string
          title: string
          challenge_type: string
          starts_at: string
          ends_at: string
          status: string
          winner_id: string | null
          metadata: Json
          created_at: string
        }
        Insert: {
          id?: string
          creator_id: string
          title: string
          challenge_type: string
          starts_at: string
          ends_at: string
          status?: string
          metadata?: Json
        }
        Update: {
          status?: string
          winner_id?: string | null
          metadata?: Json
        }
        Relationships: any[]
      }
      trackademic_challenge_participants: {
        Row: {
          challenge_id: string
          user_id: string
          joined_at: string
          score: number
        }
        Insert: {
          challenge_id: string
          user_id: string
          score?: number
        }
        Update: {
          score?: number
        }
        Relationships: any[]
      }
      trackademic_challenge_snapshots: {
        Row: {
          id: string
          challenge_id: string
          user_id: string
          score: number
          captured_at: string
        }
        Insert: {
          id?: string
          challenge_id: string
          user_id: string
          score?: number
        }
        Update: Record<string, never>
        Relationships: any[]
      }
      trackademic_community_events: {
        Row: {
          id: string
          user_id: string | null
          cohort_key: string | null
          event_type: string
          metadata: Json
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          cohort_key?: string | null
          event_type: string
          metadata?: Json
        }
        Update: Record<string, never>
        Relationships: any[]
      }
      trackademic_notifications: {
        Row: {
          id: string
          user_id: string
          type: string
          title: string
          body: string | null
          link: string | null
          read_at: string | null
          metadata: Json
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: string
          title: string
          body?: string | null
          link?: string | null
          read_at?: string | null
          metadata?: Json
          created_at?: string
        }
        Update: {
          read_at?: string | null
        }
        Relationships: any[]
      }
      trackademic_platform_config: {
        Row: {
          id: string
          config: Json
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          id?: string
          config?: Json
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          config?: Json
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: any[]
      }
      trackademic_admin_audit_log: {
        Row: {
          id: string
          admin_id: string
          action: string
          target_type: string | null
          target_id: string | null
          details: Json
          created_at: string
        }
        Insert: {
          id?: string
          admin_id: string
          action: string
          target_type?: string | null
          target_id?: string | null
          details?: Json
          created_at?: string
        }
        Update: Record<string, never>
        Relationships: any[]
      }
      trackademic_admin_overrides: {
        Row: {
          user_id: string
          overrides: Json
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          user_id: string
          overrides?: Json
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          overrides?: Json
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: any[]
      }
      trackademic_mascot_impressions: {
        Row: {
          id: string
          user_id: string | null
          character_id: string
          message_key: string | null
          context_event: string | null
          locale: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          character_id: string
          message_key?: string | null
          context_event?: string | null
          locale?: string | null
          created_at?: string
        }
        Update: Record<string, never>
        Relationships: any[]
      }
      trackademic_university_presets: {
        Row: {
          id: string
          slug: string
          name_en: string
          name_si: string | null
          name_ta: string | null
          created_at: string
        }
        Insert: {
          id?: string
          slug: string
          name_en: string
          name_si?: string | null
          name_ta?: string | null
          created_at?: string
        }
        Update: {
          slug?: string
          name_en?: string
          name_si?: string | null
          name_ta?: string | null
        }
        Relationships: any[]
      }
      trackademic_degree_packs: {
        Row: {
          id: string
          university_slug: string
          faculty_en: string
          degree_en: string
          year_label: string
          subjects: Json
          status: string
          faculty_si: string | null
          faculty_ta: string | null
          degree_si: string | null
          degree_ta: string | null
          created_at: string
        }
        Insert: {
          id?: string
          university_slug: string
          faculty_en: string
          degree_en: string
          year_label: string
          subjects?: Json
          status?: string
          faculty_si?: string | null
          faculty_ta?: string | null
          degree_si?: string | null
          degree_ta?: string | null
          created_at?: string
        }
        Update: {
          university_slug?: string
          faculty_en?: string
          degree_en?: string
          year_label?: string
          subjects?: Json
          status?: string
          faculty_si?: string | null
          faculty_ta?: string | null
          degree_si?: string | null
          degree_ta?: string | null
        }
        Relationships: any[]
      }
      trackademic_achievement_defs: {
        Row: {
          id: string
          name_en: string
          description_en: string | null
          icon: string
          xp_reward: number
          enabled: boolean
          trigger_type: string
          threshold: number
          name_si: string | null
          name_ta: string | null
        }
        Insert: {
          id: string
          name_en: string
          description_en?: string | null
          icon?: string
          xp_reward?: number
          enabled?: boolean
          trigger_type?: string
          threshold?: number
          name_si?: string | null
          name_ta?: string | null
        }
        Update: {
          name_en?: string
          description_en?: string | null
          icon?: string
          xp_reward?: number
          enabled?: boolean
          trigger_type?: string
          threshold?: number
          name_si?: string | null
          name_ta?: string | null
        }
        Relationships: any[]
      }
      trackademic_semesters: {
        Row: {
          id: string
          user_id: string
          name: string
          start_date: string
          end_date: string
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          start_date: string
          end_date: string
          is_active?: boolean
          created_at?: string
        }
        Update: {
          name?: string
          start_date?: string
          end_date?: string
          is_active?: boolean
        }
        Relationships: any[]
      }
      trackademic_subjects: {
        Row: {
          id: string
          user_id: string
          semester_id: string
          code: string
          short_name: string | null
          icon: string
          name: string
          credits: number
          is_credit_subject: boolean
          color: string
          target_grade: TargetGrade
          assignment_weight: number
          exam_weight: number
          attendance_threshold: number
          is_archived: boolean
          additional_notes: string | null
          achieved_grade: string | null
          lecture_timetables: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          semester_id: string
          code: string
          short_name?: string | null
          icon?: string
          name: string
          credits?: number
          is_credit_subject?: boolean
          color?: string
          target_grade?: TargetGrade
          assignment_weight?: number
          exam_weight?: number
          attendance_threshold?: number
          is_archived?: boolean
          additional_notes?: string | null
          achieved_grade?: string | null
          lecture_timetables?: string | null
          created_at?: string
        }
        Update: {
          code?: string
          short_name?: string | null
          icon?: string
          name?: string
          credits?: number
          is_credit_subject?: boolean
          color?: string
          target_grade?: TargetGrade
          assignment_weight?: number
          exam_weight?: number
          attendance_threshold?: number
          is_archived?: boolean
          additional_notes?: string | null
          achieved_grade?: string | null
          lecture_timetables?: string | null
        }
        Relationships: any[]
      }
      trackademic_sessions: {
        Row: {
          id: string
          subject_id: string
          date: string
          topic: string
          type: SessionType
          attended: AttendanceStatus
          status: TopicStatus
          notes: string | null
          resource_url: string | null
          file_path: string | null
          rescheduled_from: string | null
          reschedule_reason: string | null
          gcal_event_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          subject_id: string
          date: string
          topic: string
          type: SessionType
          attended?: AttendanceStatus
          status?: TopicStatus
          notes?: string | null
          resource_url?: string | null
          file_path?: string | null
          rescheduled_from?: string | null
          reschedule_reason?: string | null
          gcal_event_id?: string | null
          created_at?: string
        }
        Update: {
          date?: string
          topic?: string
          type?: SessionType
          attended?: AttendanceStatus
          status?: TopicStatus
          notes?: string | null
          resource_url?: string | null
          file_path?: string | null
          rescheduled_from?: string | null
          reschedule_reason?: string | null
          gcal_event_id?: string | null
        }
        Relationships: any[]
      }
      trackademic_assignments: {
        Row: {
          id: string
          subject_id: string
          title: string
          weight: number
          due_date: string
          submitted_at: string | null
          mark: number | null
          status: AssignmentStatus
          description: string | null
          gcal_event_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          subject_id: string
          title: string
          weight: number
          due_date: string
          submitted_at?: string | null
          mark?: number | null
          status?: AssignmentStatus
          description?: string | null
          gcal_event_id?: string | null
          created_at?: string
        }
        Update: {
          title?: string
          weight?: number
          due_date?: string
          submitted_at?: string | null
          mark?: number | null
          status?: AssignmentStatus
          description?: string | null
          gcal_event_id?: string | null
        }
        Relationships: any[]
      }
      trackademic_exams: {
        Row: {
          id: string
          subject_id: string
          date: string
          time: string
          venue: string | null
          gcal_event_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          subject_id: string
          date: string
          time: string
          venue?: string | null
          gcal_event_id?: string | null
          created_at?: string
        }
        Update: {
          date?: string
          time?: string
          venue?: string | null
          gcal_event_id?: string | null
        }
        Relationships: any[]
      }
      trackademic_past_papers: {
        Row: {
          id: string
          subject_id: string
          year: number
          completed: boolean
          completed_at: string | null
          score: number | null
        }
        Insert: {
          id?: string
          subject_id: string
          year: number
          completed?: boolean
          completed_at?: string | null
          score?: number | null
        }
        Update: {
          completed?: boolean
          completed_at?: string | null
          score?: number | null
        }
        Relationships: any[]
      }
      trackademic_study_sessions: {
        Row: {
          id: string
          user_id: string
          subject_id: string | null
          started_at: string
          duration_minutes: number
          note: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          subject_id?: string | null
          started_at: string
          duration_minutes: number
          note?: string | null
          created_at?: string
        }
        Update: {
          subject_id?: string | null
          duration_minutes?: number
          note?: string | null
        }
        Relationships: any[]
      }
      trackademic_study_plans: {
        Row: {
          id: string
          user_id: string
          semester_id: string | null
          title: string
          status: string
          generation_options: Json
          days_count: number
          follow_started_at: string | null
          save_xp_granted: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          semester_id?: string | null
          title?: string
          status?: string
          generation_options?: Json
          days_count?: number
          follow_started_at?: string | null
          save_xp_granted?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          semester_id?: string | null
          title?: string
          status?: string
          generation_options?: Json
          days_count?: number
          follow_started_at?: string | null
          save_xp_granted?: boolean
          updated_at?: string
        }
        Relationships: any[]
      }
      trackademic_study_plan_days: {
        Row: {
          id: string
          plan_id: string
          sort_order: number
          day_label: string
          plan_date: string | null
          focus_subject: string
          subject_id: string | null
          hours: number
        }
        Insert: {
          id?: string
          plan_id: string
          sort_order?: number
          day_label: string
          plan_date?: string | null
          focus_subject?: string
          subject_id?: string | null
          hours?: number
        }
        Update: {
          sort_order?: number
          day_label?: string
          plan_date?: string | null
          focus_subject?: string
          subject_id?: string | null
          hours?: number
        }
        Relationships: any[]
      }
      trackademic_study_plan_tasks: {
        Row: {
          id: string
          day_id: string
          sort_order: number
          text: string
          completed_at: string | null
          day_complete_xp_granted: boolean
        }
        Insert: {
          id?: string
          day_id: string
          sort_order?: number
          text: string
          completed_at?: string | null
          day_complete_xp_granted?: boolean
        }
        Update: {
          sort_order?: number
          text?: string
          completed_at?: string | null
          day_complete_xp_granted?: boolean
        }
        Relationships: any[]
      }
      trackademic_user_tasks: {
        Row: {
          id: string
          user_id: string
          title: string
          notes: string | null
          subject_id: string | null
          due_at: string | null
          completed_at: string | null
          reminder_sent_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          notes?: string | null
          subject_id?: string | null
          due_at?: string | null
          completed_at?: string | null
          reminder_sent_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          title?: string
          notes?: string | null
          subject_id?: string | null
          due_at?: string | null
          completed_at?: string | null
          reminder_sent_at?: string | null
          updated_at?: string
        }
        Relationships: any[]
      }
      trackademic_documents: {
        Row: {
          id: string
          subject_id: string | null
          file_name: string
          file_path: string
          file_type: string
          extracted_text: string | null
          user_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          subject_id?: string | null
          file_name: string
          file_path: string
          file_type: string
          extracted_text?: string | null
          user_id?: string | null
          created_at?: string
        }
        Update: {
          extracted_text?: string | null
          user_id?: string | null
        }
        Relationships: any[]
      }
      trackademic_document_chunks: {
        Row: {
          id: string
          document_id: string
          chunk_index: number
          content: string
          embedding: number[] | null
          created_at: string
        }
        Insert: {
          id?: string
          document_id: string
          chunk_index: number
          content: string
          embedding?: number[] | null
          created_at?: string
        }
        Update: Record<string, never>
        Relationships: any[]
      }
      trackademic_ai_insights: {
        Row: {
          id: string
          user_id: string
          type: AIInsightType
          content: string
          generated_at: string
          expires_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: AIInsightType
          content: string
          generated_at?: string
          expires_at: string
        }
        Update: {
          content?: string
          expires_at?: string
        }
        Relationships: any[]
      }
      trackademic_schedule_plans: {
        Row: {
          id: string
          user_id: string
          semester_id: string | null
          subject_id: string | null
          kind: string
          title: string
          notes: string | null
          color: string
          start_date: string
          end_date: string | null
          start_time: string | null
          end_time: string | null
          recurrence: Json
          gcal_event_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          semester_id?: string | null
          subject_id?: string | null
          kind: string
          title: string
          notes?: string | null
          color?: string
          start_date: string
          end_date?: string | null
          start_time?: string | null
          end_time?: string | null
          recurrence?: Json
          gcal_event_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          semester_id?: string | null
          subject_id?: string | null
          kind?: string
          title?: string
          notes?: string | null
          color?: string
          start_date?: string
          end_date?: string | null
          start_time?: string | null
          end_time?: string | null
          recurrence?: Json
          gcal_event_id?: string | null
          updated_at?: string
        }
        Relationships: any[]
      }
      trackademic_schedule_occurrences: {
        Row: {
          id: string
          plan_id: string
          occurrence_date: string
          start_time: string | null
          end_time: string | null
          status: string
          linked_entity_type: string | null
          linked_entity_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          plan_id: string
          occurrence_date: string
          start_time?: string | null
          end_time?: string | null
          status?: string
          linked_entity_type?: string | null
          linked_entity_id?: string | null
          created_at?: string
        }
        Update: {
          occurrence_date?: string
          start_time?: string | null
          end_time?: string | null
          status?: string
          linked_entity_type?: string | null
          linked_entity_id?: string | null
        }
        Relationships: any[]
      }
      trackademic_gcal_imported_events: {
        Row: {
          id: string
          user_id: string
          gcal_event_id: string
          calendar_id: string
          summary: string
          description: string | null
          location: string | null
          start_at: string
          end_at: string
          all_day: boolean
          status: string
          linked_plan_id: string | null
          linked_subject_id: string | null
          gcal_etag: string | null
          gcal_updated: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          gcal_event_id: string
          calendar_id?: string
          summary: string
          description?: string | null
          location?: string | null
          start_at: string
          end_at: string
          all_day?: boolean
          status?: string
          linked_plan_id?: string | null
          linked_subject_id?: string | null
          gcal_etag?: string | null
          gcal_updated?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          summary?: string
          description?: string | null
          location?: string | null
          start_at?: string
          end_at?: string
          all_day?: boolean
          status?: string
          linked_plan_id?: string | null
          linked_subject_id?: string | null
          gcal_etag?: string | null
          gcal_updated?: string | null
          updated_at?: string
        }
        Relationships: any[]
      }
      trackademic_calendar_tokens: {
        Row: {
          user_id: string
          access_token: string
          refresh_token: string
          expires_at: string
          gcal_sync_token: string | null
          gcal_last_synced_at: string | null
        }
        Insert: {
          user_id: string
          access_token: string
          refresh_token: string
          expires_at: string
          gcal_sync_token?: string | null
          gcal_last_synced_at?: string | null
        }
        Update: {
          access_token?: string
          refresh_token?: string
          expires_at?: string
          gcal_sync_token?: string | null
          gcal_last_synced_at?: string | null
        }
        Relationships: any[]
      }
      trackademic_reschedule_log: {
        Row: {
          id: string
          session_id: string
          old_date: string
          new_date: string
          reason: string | null
          created_at: string
        }
        Insert: {
          id?: string
          session_id: string
          old_date: string
          new_date: string
          reason?: string | null
          created_at?: string
        }
        Update: Record<string, never>
        Relationships: any[]
      }
      trackademic_chat_history: {
        Row: {
          id: string
          user_id: string
          subject_id: string | null
          role: ChatRole
          content: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          subject_id?: string | null
          role: ChatRole
          content: string
          created_at?: string
        }
        Update: Record<string, never>
        Relationships: any[]
      }
      trackademic_quizzes: {
        Row: {
          id: string
          user_id: string
          subject_id: string | null
          document_id: string | null
          title: string
          description: string | null
          is_public: boolean
          subject_category: string | null
          area: string | null
          question_count: number
          total_points: number
          status: 'draft' | 'ready'
          play_count: number
          reported_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          subject_id?: string | null
          document_id?: string | null
          title: string
          description?: string | null
          is_public?: boolean
          subject_category?: string | null
          area?: string | null
          question_count?: number
          total_points?: number
          status?: 'draft' | 'ready'
          play_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          title?: string
          description?: string | null
          is_public?: boolean
          subject_category?: string | null
          area?: string | null
          question_count?: number
          total_points?: number
          status?: 'draft' | 'ready'
          play_count?: number
          reported_at?: string | null
          updated_at?: string
        }
        Relationships: any[]
      }
      trackademic_quiz_questions: {
        Row: {
          id: string
          quiz_id: string
          order_index: number
          type: 'mcq'
          prompt: string
          options: Json
          correct_option_id: string
          explanation: string | null
          points: number
          concept_tag: string | null
          source_chunk_index: number | null
          created_at: string
        }
        Insert: {
          id?: string
          quiz_id: string
          order_index: number
          type?: 'mcq'
          prompt: string
          options: Json
          correct_option_id: string
          explanation?: string | null
          points?: number
          concept_tag?: string | null
          source_chunk_index?: number | null
        }
        Update: Record<string, never>
        Relationships: any[]
      }
      trackademic_quiz_attempts: {
        Row: {
          id: string
          quiz_id: string
          user_id: string
          score: number
          max_score: number
          percentage: number
          time_seconds: number | null
          answers: Json
          started_at: string
          completed_at: string | null
          is_practice: boolean
        }
        Insert: {
          id?: string
          quiz_id: string
          user_id: string
          score?: number
          max_score?: number
          percentage?: number
          time_seconds?: number | null
          answers?: Json
          started_at?: string
          completed_at?: string | null
          is_practice?: boolean
        }
        Update: {
          score?: number
          max_score?: number
          percentage?: number
          time_seconds?: number | null
          answers?: Json
          completed_at?: string | null
          is_practice?: boolean
        }
        Relationships: any[]
      }
      trackademic_flashcard_decks: {
        Row: {
          id: string
          user_id: string
          document_id: string | null
          subject_id: string | null
          title: string
          card_count: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          document_id?: string | null
          subject_id?: string | null
          title: string
          card_count?: number
          created_at?: string
        }
        Update: {
          title?: string
          card_count?: number
        }
        Relationships: any[]
      }
      trackademic_flashcard_cards: {
        Row: {
          id: string
          deck_id: string
          order_index: number
          front: string
          back: string
          created_at: string
        }
        Insert: {
          id?: string
          deck_id: string
          order_index: number
          front: string
          back: string
          created_at?: string
        }
        Update: {
          front?: string
          back?: string
          order_index?: number
        }
        Relationships: any[]
      }
      trackademic_quiz_attempt_reviews: {
        Row: {
          id: string
          attempt_id: string
          wrong_items: Json
          priority_topics: Json
          study_recommendations: Json
          failed_concepts: Json
          summary: string | null
          encouragement: string | null
          next_steps: string | null
          created_at: string
        }
        Insert: {
          id?: string
          attempt_id: string
          wrong_items?: Json
          priority_topics?: Json
          study_recommendations?: Json
          failed_concepts?: Json
          summary?: string | null
          encouragement?: string | null
          next_steps?: string | null
        }
        Update: Record<string, never>
        Relationships: any[]
      }
      trackademic_quiz_generation_usage: {
        Row: {
          user_id: string
          period_month: string
          count: number
        }
        Insert: {
          user_id: string
          period_month: string
          count?: number
        }
        Update: {
          count?: number
        }
        Relationships: any[]
      }
    }
    Views: {
      trackademic_monthly_lecture_attendance: {
        Row: {
          user_id: string
          semester_id: string
          month: string
          subject_id: string
          subject_name: string
          total_lectures: number
          attended_lectures: number
          attendance_pct: number
        }
        Relationships: any[]
      }
    }
    Functions: {
      match_document_chunks: {
        Args: {
          query_embedding: number[]
          match_threshold: number
          match_count: number
          filter_subject_id?: string | null
          filter_user_id?: string
        }
        Returns: {
          id: string
          document_id: string
          content: string
          similarity: number
        }[]
      }
      get_quiz_leaderboard: {
        Args: {
          p_quiz_id: string
          p_limit?: number
        }
        Returns: {
          rank: number
          user_id: string
          display_name: string
          percentage: number
          time_seconds: number | null
          completed_at: string
        }[]
      }
      search_profiles_for_friend: {
        Args: {
          p_query: string
          p_limit?: number
        }
        Returns: {
          id: string
          name: string | null
          avatar_url: string | null
          university: string | null
          degree: string | null
          institution_slug: string | null
          community_cohort_key: string | null
        }[]
      }
      is_community_cohort_peer: {
        Args: {
          p_cohort_key: string
        }
        Returns: boolean
      }
      finalize_expired_challenges: {
        Args: Record<string, never>
        Returns: number
      }
    }
    Enums: Record<string, never>
  }
}
