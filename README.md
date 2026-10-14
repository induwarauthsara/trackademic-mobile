# Trackademic Mobile

Trackademic is an academic planning and study-support product for students, with an original **Next.js web application** and this **Expo mobile companion**. The final submission is based on the original web application; this repository is its mobile academic planning client.

- **Primary web source:** [induwarauthsara/Trackademic](https://github.com/induwarauthsara/Trackademic). Currently private as checked on 15 October 2026; public access is still required for submission.
- **Advertised web deployment:** [trackademic.com](https://trackademic.com). Availability and authenticated flows must be verified before submission.
- **Submission materials:** the web repository's `docs/final-submission/` directory contains the business case, project presentation, AI usage report and submission checklist. The video is excluded from this preparation.
- **Mobile source:** [induwarauthsara/trackademic-mobile](https://github.com/induwarauthsara/trackademic-mobile), publicly accessible. No release APK is included.

## Original web product

The web application implements academic records, weighted grade calculations, attendance risk and focus scoring, AI coaching, study planning, PDF-based quizzes, community features, gamification and English/Sinhala/Tamil interfaces. Its stack is Next.js 16, React 18, TypeScript, Tailwind CSS, Supabase Auth/PostgreSQL, OpenRouter and Google Gemini embeddings, with Google Calendar and Stripe integrations.

The current web source selects `openrouter/owl-alpha` for chat and related generation and `text-embedding-004` for embeddings. These are configured identifiers, not a claim that either provider is currently available. AI, calendar and billing require valid server-side configuration. They are **web features**, not implemented mobile features. The AI usage report draws on the original web project's saved Cursor plans, Antigravity references and source integrations.

## Mobile technology stack

Expo SDK 57, React Native 0.86, React 19, TypeScript, Expo Router, TanStack Query, Supabase JS and Expo SecureStore. The mobile app shares the web project's Supabase schema and user accounts.

## Functional scope and mocks

The mobile screens read and write real Supabase records; they do not substitute fabricated academic data. Version 0.2 implements the core academic planning flows below. It requires the shared Supabase configuration, applied web migrations and live verification. AI, PDF quizzes, billing, community, calendar integration and automatic rewards remain web features. This is not full parity with the broader web product.

## Mobile 0.2

Expo / React Native / TypeScript client for the existing Trackademic Supabase project.

## Implemented

- Google OAuth with PKCE, native callback validation, persistent native sessions, foreground refresh, and sign-out.
- Native session credentials stored in small OS-protected SecureStore entries; web preview uses sessionStorage.
- Native setup with profile name, semester dates and custom subjects. Existing accounts retain their identity, subjects, rewards and preferences.
- Home with active semester and pending/overdue assignments; searchable subjects and subject creation/editing, targets, credits, component weights and attendance thresholds.
- Subject archiving and restoration retain records while removing them from the active dashboard and Progress.
- Add, edit and confirmed deletion for assignment results, class attendance/topic coverage, study sessions, personal tasks and exam schedules. Save confirmation requires a returned database row; stable IDs prevent duplicate network retries.
- Progress with assignment averages, separate class/lecture attendance, configured attendance risk, explicit missing evidence, study totals and exam target feasibility. Account XP/streak values are displayed without client-side reward writes.
- Study with a 15/25/45-minute focus timer, pause/resume, background elapsed-time reconciliation, completed-session saving, weekly study goals, tasks, recent study sessions and upcoming exams.
- Account editing, semester creation/selection, study goals, light/dark/system appearance and saved English/Sinhala/Tamil preference. New controls have Sinhala/Tamil translations; extended explanations and validation errors currently fall back to English.
- Native blue/mint light/dark theme, safe areas, labeled controls, pull-to-refresh, error/retry and missing-data states.
- Account-scoped query keys; cache clearing and screen remounting when identity changes. Mutations use the signed-in user's public Supabase client and existing row-level security. Academic records are paginated for complete metrics.
- Explicit device draft saving/restoration for new records, isolated by account and entry point. Drafts are stored securely on native and in sessionStorage on web, and never affect analytics before submission.
- GitHub Actions runs type checking, tests and production bundle exports on pushes and pull requests. EAS profiles support Android preview APK / production AAB and iOS simulator previews.

Home, Subjects, Progress and Study tabs are active with a persistent labeled Add record action. Setup saves one step at a time and marks onboarding complete only after a subject is confirmed. Interrupted setup can resume from the existing active semester. Semester activation uses two RLS-protected updates with best-effort restoration on failure; it is not a cross-device transaction. The database's one-active-semester constraint remains authoritative. If an interruption leaves no active semester, select one in Manage semesters.

The focus timer survives backgrounding while the app process remains alive; process termination discards an unsaved timer. Use manual study logging to recover that time. Mobile writes do not award XP, trigger Google Calendar sync or invoke web server actions. See [release checklist](docs/RELEASE_CHECKLIST.md) for the remaining production requirements.

## Install and run

Use Node 22.13 or later.

```powershell
npm ci
Copy-Item .env.example .env.local
# Fill .env.local with the web project's Supabase URL and PUBLIC anon/publishable key.
npm run start
```

`EXPO_PUBLIC_SUPABASE_ANON_KEY` accepts the existing public anon key or a publishable key. Never add service-role, Google Calendar, AI, Stripe, or other secrets to a public variable. No credentials are included in this repository. The app displays connection instructions when public configuration is missing.

Optional `EXPO_PUBLIC_WEB_APP_URL` defaults to `https://trackademic.com`; it controls the setup/settings links. Opening web does not transfer the native session into the browser; sign in there if needed.

## Enable Google sign-in

1. Use the existing Supabase project with Google enabled.
2. Add `trackademic:///auth/callback` to Supabase Auth's allowed redirect URLs alongside the existing web redirects. Keep the web Google/Supabase provider callback configuration.
3. Create a native development build, for example `npx expo run:android` after installing the Android SDK/emulator, or follow Expo's development-build workflow. iOS builds require macOS/Xcode or a configured build service. This repository does not invent production application IDs or publishing credentials.
4. Run the development server and open that build. Google sign-in uses the app's `trackademic` scheme. Expo Go cannot perform this app-scheme OAuth flow; the app disables that action there and explains why.
5. Verify existing web account → same profile/semester/subjects. Also verify cancellation, session restoration, expired callbacks and account switching on a device.

For browser preview use `npm run web`. Add the preview callback (normally `http://localhost:8081/auth/callback`) to allowed redirects if testing Google auth there. Browser sessions are development previews rather than native secure storage. Supabase providers, permissions, and applied migrations were not changed by this increment.

Official references: [Expo authentication](https://docs.expo.dev/guides/authentication/), [Supabase native deep linking](https://supabase.com/docs/guides/auth/native-mobile-deep-linking), [Expo Supabase](https://docs.expo.dev/guides/using-supabase/).

## Verification

```powershell
npm run check
npm run export:web
```

The 17 tests cover large/multilingual credential storage, partial write failure, account isolation, OAuth callback validation, missing/zero evidence, attendance scopes, predictor feasibility, local calendar dates, numeric/record validation, background timer deadlines, pagination, denied updates, ownership checks and retry IDs. Type checking covers all routes/components.

Bundle exports verify compilation, not installed-device behavior or live database permissions. Google sign-in and all authenticated reads/writes still require public configuration and physical-device or emulator testing. No database migrations or privileged keys are added by the mobile client; the web repository remains the schema authority.

The latest [verification report](docs/VERIFICATION.md) records successful type checking, all 17 tests, three-platform production exports and the browser smoke check. After project restoration, Supabase Auth, Google provider configuration and all eight required table/column checks succeeded. Authenticated account and record-write verification still requires a signed-in test account.

For all platforms run `npm run export:all`. Native local installation uses `npm run build:android` with the Android SDK or `npm run build:ios` on macOS with Xcode. For hosted builds, link your Expo account/project and use `eas build --platform android --profile preview`; set the public environment variables in that build environment. `com.trackademic.mobile` is the configured app identifier; confirm ownership before store submission. An Expo project ID, signing credentials and store publishing are not configured or included.

The initial dependency audit reports 28 advisories (18 high, 10 moderate), primarily in the Expo/React Native toolchain and its transitive dependencies. Some affected packages have no published patch; suggested automatic fixes also replace compatible Expo/React Native versions. No forced dependency changes were applied. Review these advisories and compatible upstream updates before a production release.

## Shared web resources

`src/types/database.ts` and `src/messages/en.json`, `si.json`, `ta.json` are snapshots of web revision `ba3ca6c`. Native screens select the existing `trackademic_profiles`, `trackademic_semesters`, `trackademic_subjects`, `trackademic_assignments`, and `trackademic_sessions` entities. Update these snapshots when the authoritative web/backend schema or translations change; do not maintain an independent database migration history here.

The broader roadmap is in [MOBILE_APP_PLAN.md](MOBILE_APP_PLAN.md), with its current implementation status at the top. The core mobile implementation uses the existing schema; shared server-side reward/calendar orchestration and transactional multi-step onboarding remain separate backend work. Metrics here use descriptive assignment averages rather than claiming an institution-specific GPA or weighted final grade.
