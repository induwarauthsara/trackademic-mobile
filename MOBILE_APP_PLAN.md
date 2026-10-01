# Trackademic mobile app — plan aligned with the implemented web app

Updated: 7 October 2026. Reviewed web revision: `ba3ca6c`.
Status: first mobile increment implemented; later phases remain planned. No database or web application changes performed.

## Implementation checkpoint — first increment

The mobile workspace now contains an Expo/React Native client with Google PKCE authentication, protected native session storage, Home, searchable Subjects, existing assignment/class details, Account/sign-out, and English/Sinhala/Tamil support. It reads the existing Supabase entities. New-user academic setup currently opens the web onboarding flow. Quick Add, native onboarding, mutations, charts, dashboard personalization, and rewards are not implemented yet.

Type checking and eight focused tests pass; web, Android, and iOS production bundle exports and welcome language switching were verified. Live authentication/data checks need public Supabase configuration and a native development build. See [README.md](README.md) for setup, verification limitations, dependency advisories, and the next increment.

## 1. Review outcome

The cloned source is now readable. This plan replaces the earlier assumptions with findings from code, migrations, types, requirements, and historical design plans. These findings establish code behavior, not successful production operation: no live Supabase inspection, authenticated browser review, build, or device test was performed.

The web app uses Next.js 16, React, TypeScript, Supabase, cookie-authenticated server actions, and Recharts. Important existing capabilities:

- **Google sign-in:** the login form offers Continue with Google. There is no email/password registration UI in that form. The initial migration creates profiles through an Auth-user trigger.
- **School/campus onboarding:** language, country, institution/year, preset subjects, timetable preview, and custom subjects. English, Sinhala, and Tamil resources exist.
- **Academic hierarchy:** profile → semesters → subjects → sessions, assignments, exam timetables, past papers, and documents. Actual entities have the `trackademic_` prefix.
- **Results:** assignment rows store percentage marks; sessions store attendance and topic progress. Exam rows store date/time/venue, not scores. The exam-results screen stores a single final letter grade in `trackademic_subjects.achieved_grade`.
- **Dashboard:** today’s agenda/classes, tasks, goals, XP/streak, activity calendar, quick actions, weekly AI report, weekly activity bars, subjects at a glance, and quiz suggestions.
- **Analytics:** fixed subject-performance polar chart, assignment-mark trajectory by due month, and lecture-attendance comparison. Home’s weekly bars represent active days (0/1), not study hours or marks.
- **Personalization:** persisted locale, theme, goal display mode, daily target, active study plan, and mobile-web navigation slot. Searches did not find a general saved-chart builder or dashboard card-order persistence.
- **Study/motivation:** focus timer, study logs, goals, ordinary tasks, saved/generated study plans, XP, badges, streak calculations, and mascot messages.
- **Additional modules:** AI coach, PDFs/quizzes/flashcards, schedules, Google Calendar, community, and premium features.

### What changes from the first plan

Google sign-in replaces assumed password registration. Actual school/campus presets replace generic setup. Mobile records become a unified view over existing entities, with distinct assignment-result, final-grade, and exam-scheduling actions. Existing study/reward features are reused. General dashboard customization and saved charts are new extensions. Native-compatible backend transport and shared calculation corrections are prerequisites.

## 2. Product direction and release scope

The core loop is **log an academic activity/result → see meaningful progress → understand what needs attention → take one useful study action**.

Home answers “What should I do today?” Progress answers “Am I improving, and where should I focus?” Easy entry is the highest priority. Charts and motivation support that loop.

Recommended first public release:

- Same Google account, profile, semesters, subjects, and history as web.
- School/campus onboarding using existing packs.
- Fast attendance, assignment creation/grading, final course-grade entry, and study logging.
- Numeric exam/test history through a coordinated additive backend change; the current model cannot hold repeated scored exams.
- Personalized Home presets, trustworthy progress charts, targets/predictor, evidence-based attention, goals, and achievements.
- Study timer, basic tasks, and optional reminders.

A smaller internal beta may initially support existing assignment marks and final grades only. It must state that numeric exam history is not yet supported. Later releases add full AI generation, custom chart building, quizzes/documents, Calendar/community, imports, and durable offline submission.

Proposed usability targets: one-tap access to Add, roughly 30 seconds for simple result entry with existing subjects, no duplicate profiles/records after retries, and a clear next action beside every attention insight.

## 3. Registration and onboarding

### Existing web users

Welcome → Continue with Google → Supabase native session → existing profile → active semester → Home.

Do not repeat setup for `onboarding_completed` users. The web onboarding page also accepts existing subjects as setup evidence; adopt a shared recovery policy for legacy profiles. Preserve identity, subject IDs, XP, badges, and preferences. Missing active semester opens a select/create-semester screen instead of repeatedly redirecting an already-onboarded user back to setup.

### New users

1. **Welcome:** short benefit statement, Continue with Google, loading/cancellation/offline/retry states. One sign-in action handles both new and returning students.
2. **Your context:** English/Sinhala/Tamil, country, then School/Campus. Sri Lankan campus users choose university/faculty/degree/year; international campus users enter institution/program/year; school users choose the existing grade band. Reveal dependent fields progressively and make long pickers searchable.
3. **Your subjects:** load the matching pack, select/remove subjects, preview timetable, add custom name/code. Preserve uppercase code handling, duplicate-code validation, and the existing 1–20 setup-subject limit.
4. **Ready:** review semester/subjects, optional campus GPA goal, Start tracking. School users receive suitable subject/study goals rather than a GPA slider. Do not display calculated GPA until a supported conversion scheme is verified.

After setup, suggest one first action—mark a class, add an assignment result, or log study time—with Skip. Reuse setup milestones as guidance; do not require attendance before allowing academic-result entry.

### Required shared onboarding work

`completeOnboarding` performs separate writes, inserts an active semester before deactivating older ones, and sets starter XP/badges. The schema has a unique active-semester index. Retrying or completing setup when an active semester exists can therefore fail or create partial setup.

Replace this flow with one authenticated, transactional, idempotent operation used by web and native. Preserve existing rewards; prevent duplicate semesters/subjects; validate relationships; check every write. Persist complete resume state: `onboarding_step` alone does not restore the wizard’s selected subjects and all choices. Keep the existing Auth profile trigger as the profile-creation authority.

## 4. Navigation, UI, and interactions

Native bottom tabs: **Home · Subjects · Progress · Study**, with persistent labeled **+ Add**. Profile/settings opens from the Home avatar. Achievements sits in Progress; schedule/tasks/timer/planner sit in Study.

This retains familiar web terminology with fewer native tab targets. Web currently has four fixed entries, a swappable fifth, and Add. Preserve its `mobile_nav_slot`; if native customization is added, use a separate native preference so it does not unexpectedly change mobile-web navigation.

### Home — personalized daily dashboard

Screen order:

1. Greeting, semester selector, avatar.
2. Today: next class, nearest deadline/task, or active study-plan action.
3. Quick actions: Add result, Mark class, Log study.
4. One Needs attention card with evidence, or a first-record invitation when evidence is missing.
5. One compact chart selected by the user: assignment progress, lecture attendance, or study minutes.
6. Goal progress using existing goal display mode/active plan.
7. Collapsible XP/streak/achievement summary and recent records.

Use a brief mascot message without blocking entry. Open AI weekly reports on demand. Preserve saved layout order; do not reshuffle cards after every record. No invented GPA, fake results, or zero-score charts for new users.

### Subjects

Searchable cards show icon/color/code, target, assignment average, attendance with explicit scope, and attention explanation. Provide semester/archive filters and Add subject.

Subject detail: **Overview, Records, Assignments, More**. Overview has target/predictor and topic coverage. Records contains class/result/study history and final course grade. Assignments provides deadline/status cards and direct Enter mark. More contains timetable, notes, past papers, materials, and later subject AI chat. Use native cards/lists rather than desktop tables and sidebars.

### Progress

Switch between **Performance, Attendance, Study, Goals**. Default to subject comparison and a subject-specific trend. Separate official assignments/exams from practice quizzes/past papers. Show takeaway, filters, record count, and View source records. Achievements/streak calendar open here.

One result is a point, not an improving trend. No matching filtered records offers a filter reset; no evidence offers useful entry guidance.

### Study

Today’s tasks, active/saved study plan, timer, upcoming schedule. A suggested action can create an ordinary `trackademic_user_tasks` row. Generated plan tasks remain in their existing plan-task table; do not automatically duplicate them into ordinary tasks.

Timer defaults match web: 25-minute focus, 5-minute short break, 15-minute long break. Completion reviews subject, focus minutes, and optional note. Do not log breaks as study time. Restore elapsed time using persisted timestamps after backgrounding/relaunch, rather than depending on a running JavaScript interval.

### Visual system and accessibility

Use the current companion theme from `src/styles/tokens.css`: blue primary, mint accent, pale light background, white surfaces, and navy dark surfaces. Older pitch documents describe a dark glass theme; current tokens are the implementation baseline.

Rounded cards, readable typography, generous spacing, 44–48 logical-pixel touch targets, large-font support, screen readers, reduced motion, and contrast-safe charts. Provide non-color status cues and a chart list/text alternative. Important actions cannot require swipe or drag. Reuse translations and profile locale/theme; validate Sinhala/Tamil layout and font support on devices.

## 5. Quick Add — easy academic entry

**+ Add** opens **Result · Attendance · Assignment · Study time · Plan**. Exam timetable is a planning action, clearly separated from recording a result. Subject screens prefill their subject; elsewhere offer recent subjects plus search.

### Assignment result

Subject → existing assignment → percentage or earned/max → live normalized preview → Save.

For a new graded assignment, require a title and valid due date with an explicit editable date suggestion; keep weight/description under Details. Create and grade in one shared operation to avoid half-saved records. Choose an existing assignment first to avoid duplication.

Store normalized percentage in `trackademic_assignments.mark`: 42/60 becomes 70.00, not 42. There are no current earned/max columns. Recommended additive nullable `marks_earned`/`marks_max` fields preserve original values, with corresponding web support. Without that extension, use percentage entry and explain that original raw marks are not retained.

Existing grading writes `submitted_at` at grading time. Preserve known submission timestamps and add explicit nullable `assessed_on`/`graded_at` fields for new records. Leave legacy unknown dates unknown. Do not present a due date as the date a mark was received.

Save returns the confirmed ID, percentage, updated summary, and actual reward. Add another retains subject but clears score. Weight suggestions are editable; practice records do not silently affect official grades.

### Numeric exam/test result

`trackademic_exams` is a timetable, and `subjects.achieved_grade` is one final course grade. Neither is repeated numeric result history.

Recommended additive `trackademic_assessment_results`: ID, subject ID, optional exam ID, title, kind, assessed date, earned/max or percentage, notes, timestamps, and revision/idempotency metadata. Validate subject/exam ownership and relation. Exact constraints are designed after inspecting the live schema.

Use it for non-assignment results. Do not copy assignment marks into it. A unified record read model identifies rows by `(source_type, source_id)`. Keep official/practice categories explicit; only include exam results in course totals when the actual assessment scheme supports it.

Flow: subject → Exam/Test → title/date → score → Save. Linking a scheduled exam is optional. Add web display/edit support before declaring this result type shared across both clients; preserve old tables for older clients.

### Final course grade

Subject → final grade → Save to `trackademic_subjects.achieved_grade`. Label it Final course grade because it updates one current value rather than appending exam history. Do not convert a letter grade into an invented numeric mark. Existing achieved grades allow short free text while targets are constrained; agree grade-picker options and legacy-value handling first.

### Attendance and topic progress

From Today: existing class → Present/Absent, with Late/Medical available → update that same session. Never create another row for an already-scheduled class.

Unscheduled class: subject → date/type → short topic → attendance → Save. Reuse scheduled topics when available; notes are optional. Topic state values are exactly `not_started`, `in_progress`, `completed`, `mastered`. Present/late count as attended currently; settle medical/eligibility handling in the shared metric contract.

### Study time and planning

Study time: subject → 15/25/45-minute shortcut or custom 1–600 minutes → optional note → Save to existing study sessions. Class sessions and study sessions remain distinct.

Plan creates the correct assignment, exam timetable, schedule event, or ordinary task. Make clear whether the user is logging history or planning future activity.

### Common behavior

Numeric keyboards, visible labels, inline errors, live score previews, duplicate warnings, one submission at a time, input retained on failure, account-isolated local drafts, and keyboard-safe Save placement. Saved draft and server-confirmed Saved are distinct. Confirm deletion, explain chart impact, and refresh dependent metrics after edits/deletes.

## 6. Performance, weaknesses, and improvements

### Existing calculations

`src/lib/utils.ts` defines A=75, B+=65, B=55, C=45, D=35. These are app defaults, not universal institution rules.

Dashboard/subject/analytics use the arithmetic mean of non-null assignment marks. Stored per-assignment `weight` does not affect those averages. Label it Average assignment mark, not weighted course grade.

Predictor: `(target - assignmentAverage × assignmentWeight/100) / (examWeight/100)`. Read the stored subject weights: onboarding creates 40/60; manual subject creation defaults to 20/80. Never replace existing subjects with one native default.

Focus score: `credits × risk multiplier × max(0, target - average)`, with low/medium/high multipliers 1/2/3. Current risk combines marks more than 10 points below target and attendance below hardcoded 75%/80% credit/non-credit thresholds.

### Shared corrections required before release

1. **Attendance scope:** dashboard/subject headline includes all session types; analytics/monthly view includes lectures. Expose separate All class and Lecture attendance metrics, settle eligibility scope, and use configured subject thresholds consistently.
2. **Missing evidence:** dashboard overall attendance substitutes zero for subjects with no sessions; missing marks produce a focus gap, while risk defaults low. Use unknown/insufficient-evidence states, exclude unknown values from averages, and never interpret no data as weakness or safety.
3. **Grade bands:** `performance-tiers.ts` labels B+ as 55–65 while the target threshold is 65. Consolidate definitions; initially display percentages rather than contradictory letter bands.
4. **Predictor feasibility:** current function clamps to 0–100 and does not explicitly handle zero exam weight. Return required score, already secured, unreachable under current weights, or no exam component. Do not disguise a requirement above 100 as attainable.
5. **Dates:** legacy mark trajectory groups by due month. Label that honestly. New date-based result trends use explicit assessment dates, without fabricating legacy dates.
6. **Weight meaning:** agree whether assignment weights describe coursework share or total course share before weighted totals. Keep simple descriptive averages separate.
7. **GPA:** a goal exists, but the reviewed core metrics do not establish a complete institution-specific final-grade conversion contract. Verify grade scales/credit handling before displaying computed GPA.
8. **Timezone:** web mixes local date formatting and UTC slicing. Agree academic timezone/date-only semantics across clients; test midnight/week/month boundaries in Asia/Colombo and other supported zones.

These are planned changes, not fixes applied to web. Release corrected metric definitions on both clients together. Extract pure shared calculations with parity fixtures; screens must not independently reimplement formulas.

### Explainable insights

Separate **below target**, **attendance risk**, **unrevised topics**, and **declining comparable scores**. Show marks/counts, threshold, target gap, and a useful next action. Credits can prioritize campus subjects; school/zero-credit subjects need a fallback based on gaps/deadlines/coverage.

Topic progress is self-reported coverage. Topic-specific weaknesses require recorded topic or question evidence; overall marks alone cannot establish them. Study minutes indicate effort, not mastery or proven cause of score improvement.

Initially require three recent and three earlier comparable results in the same subject/type before claiming decline/improvement. This is a product heuristic to validate, not statistical proof. Report change in percentage points.

Reuse weakness/weekly AI services later through native-compatible authenticated APIs. AI assists advice, while deterministic metrics stay authoritative and available offline/from cache. Existing weakness cache uses user/type without an explicit semester filter; scope cache by semester, locale, and data revision and invalidate after changes.

## 7. Personalized dashboard and charts

### Existing idea found in the repository

`.req.md` proposes attention widgets, grade trajectories, attendance health, a priority queue, and mastery charts. The companion redesign plan proposes friendly daily guidance, progressive disclosure, school/campus experiences, quick actions, weekly activity, and mascot support. Current code implements substantial daily guidance and fixed analytics charts. General saved charts/card-order persistence were not found.

### Dashboard editor

Edit Home offers live preview, show/hide optional cards, pinned subjects, default period/chart, Move up/Move down ordering, and Restore defaults. Drag is optional. Core Add/profile navigation remains available.

Card catalog: Today, Attention, Assignment progress, Lecture attendance, Study minutes, Goals, XP/streak, Recent records, Upcoming deadlines, Weekly report. Render evidence-based cards; give first-action guidance where evidence is unavailable. Education tier chooses defaults, never overwrites saved order.

Proposed shared `trackademic_dashboard_preferences`: owner ID, configuration version, shared filters/pinned subjects, and separate web/native layouts. Existing locale/theme/goal fields remain authoritative on profile. Ignore unsupported card IDs safely. This is a new proposed entity, not existing schema.

### Chart presets and builder

Presets:

- Assignment progress: date versus percentage with target, using labeled legacy due dates or actual new assessment dates.
- Subjects versus targets: horizontal percentage bars, target markers, sample counts.
- Lecture attendance: percentage versus configured threshold, attended/total counts, month filter.
- Study minutes: date/week versus focus minutes from existing study logs.
- Topic coverage: counts by the four recorded states, labeled self-reported.
- Exam/test progress: scored history after the shared numeric-result extension is enabled.

Bars/lines are phone defaults. Retain optional polar detail after grade-band corrections; the current polar component is labeled Radar despite using radial bars.

Later guided builder: **question → metric → subjects → date range → supported chart → title → save**. Offer valid combinations only; do not mix minutes/marks/XP on one scale.

Proposed `trackademic_saved_charts` stores owner, title, version, allowed metric ID, filters, aggregation, chart type, order, timestamps. Store definitions rather than arbitrary SQL or image blobs. Both clients share metric IDs/configuration while rendering with platform-specific components. Refresh must reveal edits from the other client.

Tap point/bar → value/date/count → View records. Every chart includes title, axes/units, legend where relevant, source/period/aggregation, and a list/text alternative. Full-screen details, clear filter reset, and distinct unknown/zero states. Archived/deleted subject references get an explanation, not silent substitution.

## 8. Motivation and study support

Reuse Sithara for welcome/guidance, Kiri for encouragement, Sinha for achievements, Deepa for celebration, and existing localized messages. One brief dismissible message per moment; respectful campus tone and simpler school tone. Keep encouragement specific to evidence and achievable actions.

Backend controls XP, levels, badges, and streaks. Show returned awarded values; native must not write authoritative XP/admin/premium fields. Existing level/XP helpers can support display, not client-authorized rewards.

Retries, regrading, repeated Save, and simultaneous web/native activity must not duplicate rewards. A record can be saved while reward processing is pending; do not tell the user to re-add it.

Reminders are opt-in at task/session planning, with quiet hours, snooze, local timezone, and discreet lock-screen copy. Start locally; coordinate later push with existing reminder jobs to prevent duplicate alerts. Denied permission never blocks study features.

Rest days/recovery would change current continuous-streak semantics. Introduce such rules through a shared backend/product change rather than a native-only streak calculation. Avoid guilt when a streak ends.

## 9. Shared Supabase architecture and data mapping

### Stack and reuse

Recommended Expo + React Native + TypeScript, Expo Router, TanStack Query, React Hook Form/Zod, and a native chart library selected by device/accessibility testing. Share types, presets, translation dictionaries, metric functions, and validated configurations.

Do not import Recharts, DOM/Radix UI, Next.js server actions, cookie helpers, or browser localStorage into native. Convert theme tokens and abstract storage. Use a tested Supabase session-storage adapter that handles full session size and lifecycle.

References: [Expo Supabase integration](https://docs.expo.dev/guides/using-supabase/), [React Native Auth](https://supabase.com/docs/guides/auth/quickstarts/react-native), [native auth deep linking](https://supabase.com/docs/guides/auth/native-mobile-deep-linking).

### Identity and API transport

Both released apps use the same production Supabase project. Use controlled development/staging projects for implementation tests. Public project key plus signed-in native session; never ship service, AI, Calendar, or payment secrets.

Register native Google redirects alongside web redirects, with cold/already-open-app handling. Calendar authorization is separate from Google sign-in.

Direct Supabase reads are appropriate under verified RLS. Mutations with rewards, Calendar, plans, AI, or other side effects use shared authenticated services. Refactor server actions into reusable services with existing web-action adapters and documented bearer-token HTTP adapters; suggested `/api/mobile/v1/...` routes are proposals only. Verify token, derive identity server-side, check ownership/validation, return structured outcomes.

Existing `/api/chat` checks cookie-authenticated users, so bearer-token support requires adaptation. Browser `revalidatePath` does not invalidate native query caches. Return confirmed IDs plus reward/integration status and invalidate native query keys after mutations.

### Reuse map

- Account/preferences: `trackademic_profiles` and profile actions.
- Academic setup: `trackademic_semesters`, `trackademic_subjects`, preset data and onboarding actions.
- Attendance/topics: `trackademic_sessions` and session actions.
- Assignment results: `trackademic_assignments` and assignment actions.
- Exam scheduling: `trackademic_exams` and exam actions.
- Final course grade: `trackademic_subjects.achieved_grade`.
- Practice: `trackademic_past_papers`; quiz attempts stay separate.
- Study time: `trackademic_study_sessions` and study-timer actions.
- Goals: `trackademic_goals`. Quiz-score goals have synchronization code; do not assume every goal value updates automatically.
- Ordinary tasks/schedule: `trackademic_user_tasks` and existing schedule services/entities.
- Plans: `trackademic_study_plans`, `trackademic_study_plan_days`, `trackademic_study_plan_tasks` and completion services.
- AI: `trackademic_ai_insights`, chat history/conversations and authenticated AI services.
- Proposed extensions: numeric result history, original-mark/date fields, dashboard preferences, saved chart definitions.

### Migration, authorization, and integrity gates

Maintain one migration authority in the web/backend repository. Several files share numeric prefixes (`012`, `016`); inspect actual applied files and establish an ordered unique migration manifest/version convention. Do not blindly rename/rerun live migrations. Regenerate complete types; some mutation clients are untyped and goals use separate interfaces.

Verify live schema/grants match migrations. Enforce parent-child ownership: a subject's `user_id` policy alone does not prove its referenced semester belongs to the same user. Apply equivalent checks to results/exams, optional study subjects, plans, and attachments.

The monthly attendance view is created without `security_invoker` in the reviewed migration. Inspect live owner/grants and row visibility before exposing aggregates to native. Client user filters are not authorization. Profile row ownership is also insufficient protection for privileged fields; restrict writable fields and rewards/entitlements server-side.

Reference: [Supabase RLS guidance](https://supabase.com/docs/guides/database/postgres/row-level-security).

### Offline, partial success, and concurrent edits

MVP: cached recent reads, Last refreshed, pull-to-refresh/focus refresh, account-isolated drafts, and online confirmed saves. Drafts never affect analytics. Clear/isolate data on sign-out/account switch.

Mutations accept idempotency keys and return stable outcomes on retry. Transactions/version checks handle coupled writes and concurrent edits. Current study logging inserts before updating rewards and can report a subsequent reward error: preserve the successful inserted ID/status so retry cannot double-log.

Later durable queue: stable per-user IDs, retry backoff, pending/failed/conflicted states, version checks and conflict review. Do not claim instant synchronization; refresh is baseline and Realtime invalidation is an optional enhancement.

## 10. Components and module organization

Feature modules: auth, onboarding, subjects, records, dashboard, progress, study, settings; later coach/quizzes/community. Shared layers: domain metrics/types/validation, database/API data access, themes/translations, session/draft storage, notifications, query keys/cache invalidation.

Native reusable components:

- AppScreen, ScreenHeader, SemesterPicker, TabBar, QuickAddLauncher.
- SubjectPicker, SubjectCard, SubjectGlyph, RecordTypeChooser.
- PercentageInput, EarnedMaxInput, GradePicker, AssignmentPicker, AttendanceControls, TopicStatusPicker, StudyDurationPicker.
- RecordForm, DraftIndicator, SaveStatus, RecordRow, RecordDetail, RecordFilters.
- MetricSummary, AttentionCard, GoalProgress, ChartPanel, ChartDetail, ChartRecordList, DashboardEditor.
- TodayAgenda, TaskRow, TimerControls, SessionCompleteSheet, StudyPlanTask.
- Native XpBar, StreakBadge, StreakCalendar, AchievementBadge, MascotBubble.

Screens compose components; they do not own independent grading/auth/reward logic. Design loading, retry, no active semester, no subjects, insufficient evidence, stale report, offline, draft, and conflict states before coding.

## 11. Implementation phases and completion gates

### Phase 0 — compatibility and designs

Core source review is completed by this plan. Remaining: live applied-schema/auth inventory, metric contract, result-extension specification, shared API contract, and reviewable designs for onboarding/Home/Add/Subject/Progress/Study. No production migrations during planning.

Gate: no duplicate-data design, privileged-client dependency, or unresolved MVP grading semantics.

### Phase 1 — backend and native foundation

Shared services/bearer-token adapters; transactional/idempotent onboarding; reward-safe mutations; shared metric fixes; native OAuth/deep links; theme/localization/navigation; accounts/semesters/subjects.

Gate: existing identities/history/XP remain intact, ownership tests pass, expired/cancelled auth recovers, and web remains compatible.

### Phase 2 — easy record entry

Attendance, assignment create/grade, final grade, study logs, record browse/edit/delete, drafts, original-score/date fields, and numeric exam history with web support.

Gate: existing scheduled sessions update rather than duplicate; 42/60 is 70% on both clients; retries yield one record/reward; failed input survives; both apps can view/edit every supported shared result type.

### Phase 3 — personalized Home and Progress

Dashboard presets/preferences, charts, targets/predictor, evidence-based attention/improvement, goals/achievements, and source-record drill-down. Polar detail follows grade-label correction.

Gate: identical metrics for identical scope, unknown is not zero, impossible targets are explained, and shared preferences survive another-device login.

### Phase 4 — study and beta quality

Timer/background restoration, tasks/schedule, saved-plan following, mascot feedback, local reminders, accessibility/translations, and device beta. AI generation follows native-compatible API readiness.

Gate: no timer double-log, denied reminders do not block use, Sinhala/Tamil/large text fit, and representative users meet the quick-entry target.

### Phase 5 — broader web feature rollout

Saved-chart builder on both clients; AI coach/reports; richer plans; quizzes/flashcards/documents; Calendar; community; photo/CSV review/import; durable offline queue. Preserve shared feature flags/premium rules. Design native purchase flows separately before exposing checkout.

Gate features independently. No fixed date estimate until integration/device work is sized; reliable academic tracking takes priority over all-module parity.

## 12. Implementation verification

- Two-user ownership tests for records/parents, aggregates, privileged profile fields, and shared configurations.
- Metric fixtures for missing/zero marks, weights, letter-grade bands, configured thresholds, medical attendance, zero-credit subjects, impossible targets, zero exam component, rounding, and time boundaries.
- OAuth cold/warm launch, cancellation, restored/expired sessions, new/existing/legacy users, partial onboarding, missing active semester.
- Double Save, timeout after commit, reward failure after insert, repeated grading, simultaneous web/native actions, and active-semester changes.
- Chart provenance: due dates versus assessment dates, practice versus official, sparse samples, changed targets, archived/deleted references.
- Device QA: keyboard/small screen, one-handed entry, font scaling/readers, reduced motion, theme contrast, background timer, network loss, permission denial, account switching with drafts.
- Usability tasks: add result, mark existing class, explain chart, find an evidence-supported attention area, plan study, recover failed save. Measure aggregate completion without collecting private marks/notes in telemetry.

## 13. Evidence references and remaining unknowns

Source paths relative to the reviewed web repository:

- Auth/profile: `src/components/auth/LoginForm.tsx`, `src/app/auth/callback/route.ts`, `src/lib/supabase/middleware.ts`, `supabase/migrations/001_initial_schema.sql`.
- Setup: `src/components/onboarding/OnboardingWizard.tsx`, `src/app/onboarding/page.tsx`, `src/app/actions/onboarding.ts`, `src/lib/presets.ts`, `data/presets/`.
- Entities/results: `src/types/database.ts`, migrations `001`/`003`, `src/app/exam-results/page.tsx`, actions `subjects.ts`, `assignments.ts`, `exams.ts`, `sessions.ts`.
- Entry: `src/components/quick-add/`, `src/lib/quick-add.ts`, `src/lib/quick-add-tabs.ts`.
- Dashboard/charts: `src/app/dashboard/page.tsx`, `src/components/dashboard/DashboardClient.tsx`, `DashboardWeekChart.tsx`, `WeeklyProgressReportCard.tsx`, `src/app/analytics/page.tsx`, `src/components/analytics/AnalyticsClient.tsx`, `SubjectPerformancePolarChart.tsx`.
- Metrics/style: `src/lib/utils.ts`, `src/lib/performance-tiers.ts`, `src/styles/tokens.css`.
- Preferences: `src/app/actions/profile.ts`, settings components, `src/lib/navigation.ts`, `src/components/layout/MobileBottomNav.tsx`.
- Study/rewards: `src/app/actions/study-timer.ts`, `src/lib/pomodoro-config.ts`, `src/lib/gamification-config.ts`, `src/lib/xp-rewards.ts`, actions `streak.ts`, `goals.ts`; migrations `016_goals`, `016_study_plans`, `020_user_tasks`.
- AI/backend: `src/app/actions/ai.ts`, `src/app/api/chat/route.ts`, `src/lib/supabase/action-client.ts`, `src/lib/mascot-cast.ts`.
- Existing ideas: `.req.md`, `.cursor/plans/kid-friendly_gamified_redesign_d7ef68ee.plan.md`, `docs/SYSTEM_ARCHITECTURE.md`. Historical plans represent intent; source/migrations establish implemented capabilities.

Remaining unknowns: applied Supabase migrations/provider settings, production behavior, institution grading schemes, platform release priority, and device usability. The earlier source-access blocker is resolved. This document is ready to guide design and implementation after those operational contracts are verified.
