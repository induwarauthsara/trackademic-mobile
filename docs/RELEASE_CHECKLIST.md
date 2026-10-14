# Mobile release verification

## Implemented and checked in source

- Four protected tabs, account settings, native semester setup and custom subject management.
- Assignments/results, attendance/topics, study logs, tasks and exam timetable: create, edit and confirmed delete.
- Progress calculations distinguish absent evidence from zero and retain impossible exam requirements.
- Account ownership checks plus authoritative Supabase RLS; no service-role key, remote schema changes or reward-field writes.
- Stable IDs for retryable creates, returned-row confirmation, account-scoped cache invalidation, account-change screen remounting and explicit local drafts.
- TypeScript and 17 automated tests. See GitHub Actions for checks against each published commit.

## Required before calling this a production release

1. Supply `EXPO_PUBLIC_SUPABASE_URL` and the public `EXPO_PUBLIC_SUPABASE_ANON_KEY` in each build environment. The supplied values are installed in ignored local `.env.local`. Following project restoration on 15 October 2026, Auth and all eight required tables/column checks succeeded; Google sign-in is enabled. Verify the authoritative web migrations and authenticated ownership/write policies before release.
2. Allow `trackademic:///auth/callback` in Supabase Auth redirects. Test Google sign-in in an installed native build: cold/warm callback, cancellation, expired callback, restore, sign-out and account switching. Expo Go cannot test this app-scheme flow.
3. Using a test account, check native setup, retries after interrupted setup, subject editing, semester selection, and each record's create/edit/delete lifecycle. Compare records with the web app. Use a second account to verify isolation and denied writes.
4. Test background timer, pause/resume, unsaved process termination, failed-save retry and device draft restoration. Drafts must not change Progress. Native drafts persist on-device under the account's ID; web drafts last only for that browser session.
5. Verify Sinhala/Tamil controls and English fallback explanations, small screens, keyboard visibility, accessibility, dark/light/system mode and pull-to-refresh on Android/iOS.
6. Test datasets over 1,000 records, future class dates, 0% marks, missing marks, non-credit subjects, zero exam weights and targets requiring over 100%. The average is unweighted; the exam estimate is provisional when coursework is incomplete. No GPA is calculated.
7. Review existing dependency audit advisories against compatible Expo updates. The prior 0.1 audit reported 28 advisories; that count is historical and not a new 0.2 audit.
8. Link an Expo project, confirm `com.trackademic.mobile`, provide signing credentials, build/install the preview APK and iOS simulator build, and perform release testing. Bundle exports are not installable APK/IPA artifacts. Store release requires physical-device testing, privacy information and store credentials.

## Known scope boundaries

Mobile writes operate directly through the public, user-authenticated Supabase client. Web action side effects (automatic XP/badges/streak awards, Google Calendar updates, server-generated study plans) do not run. Existing reward values are preserved and displayed. No provider secrets belong in this repository.

Setup is resumable across separate writes; it does not promise an atomic shared preset-pack wizard. Semester switching is protected by the existing unique active-semester index but is a two-write operation; interruption/concurrent activation can leave no selection. Refresh Manage semesters and choose the intended semester to recover.

AI coaching, PDF ingestion/quizzes, community, billing, notifications, preset packs, advanced dashboard personalization and full web parity remain broader roadmap work. They require shared authenticated server interfaces, provider configuration and separate validation. This source completion is a core academic mobile client, not an assertion that those integrations are finished.
