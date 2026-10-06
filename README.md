# Trackademic Mobile — first increment

Expo / React Native / TypeScript client for the existing Trackademic Supabase project.

## Implemented

- Google OAuth with PKCE, native callback validation, persistent native sessions, foreground refresh, and sign-out.
- Native session credentials stored in small OS-protected SecureStore entries; web preview uses sessionStorage.
- Welcome/setup state; Home with existing profile and active semester; searchable subjects; subject detail with existing assignment marks and class/topic records.
- Account screen and English/Sinhala/Tamil language selection. Saved profile locale/theme is respected; manual language changes are session-only.
- Native blue/mint light/dark theme, safe areas, labeled controls, pull-to-refresh, error/retry and missing-data states.
- Account-scoped query keys; cache clearing when identity changes. Database access in this increment is read-only.

Only Home and Subjects tabs are active. Quick Add, native onboarding, record mutations, charts, XP updates, Progress/Study, and backend migrations are deliberately deferred. New users can finish setup in the web app and refresh mobile.

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

Tests cover large/multilingual credential storage, overwrite/delete, partial write failure, missing chunks, concurrent account-isolated writes, and invalid/unexpected OAuth callbacks. Type checking covers all routes/components.

Web export verifies bundling, not actual native Google sign-in or live database permissions. Those still need configured credentials and physical-device or emulator testing. No database schema, web source, XP, or academic records are modified by the app's read-only academic features.

Initial verification: TypeScript passed, all eight automated tests passed, and web, Android, and iOS production bundle exports passed (including native Hermes bytecode). The welcome screen and all three language choices were checked in the browser. Bundle exports are not installed-device tests; authentication and authenticated screens have not yet been verified against a live account.

The initial dependency audit reports 28 advisories (18 high, 10 moderate), primarily in the Expo/React Native toolchain and its transitive dependencies. Some affected packages have no published patch; suggested automatic fixes also replace compatible Expo/React Native versions. No forced dependency changes were applied. Review these advisories and compatible upstream updates before a production release.

## Shared web resources

`src/types/database.ts` and `src/messages/en.json`, `si.json`, `ta.json` are snapshots of web revision `ba3ca6c`. Native screens select the existing `trackademic_profiles`, `trackademic_semesters`, `trackademic_subjects`, `trackademic_assignments`, and `trackademic_sessions` entities. Update these snapshots when the authoritative web/backend schema or translations change; do not maintain an independent database migration history here.

The implementation roadmap is in [MOBILE_APP_PLAN.md](MOBILE_APP_PLAN.md). Next increment: authenticated shared mutation services and transactional/idempotent onboarding, then Quick Add attendance and assignment results. Resolve the plan's metrics contract before building performance charts.
