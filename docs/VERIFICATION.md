# Verification — 15 October 2026

Mobile source version: 0.2.0.

- `npm run check`: TypeScript passed and all 17 tests passed.
- `npm run export:all`: web production JavaScript and Android/iOS Hermes bytecode exported successfully. On this Windows host, TEMP/TMP were redirected to `.expo/build-temp` to avoid a sandbox temporary-directory write error.
- Browser smoke check: English, Sinhala and Tamil welcome screens rendered; a signed-out visit to `/add` redirected to `/welcome`; the browser reported no console errors for that check.
- Public Supabase configuration was supplied and saved in ignored `.env.local`. No key or environment file is committed.
- After the project was restored, Supabase Auth responded successfully and reported Google sign-in enabled. All eight app tables returned HTTP 200 for anonymous reads, with zero records returned; checks for the required mobile columns also succeeded. These empty anonymous responses do not by themselves prove authenticated ownership policies or write permissions.
- The earlier DNS failure is resolved. Initial REST requests briefly returned 404 while restoration was taking effect; subsequent table and column checks succeeded.
- No live academic records were created, changed or deleted during verification. Authenticated reads/writes, Google OAuth, installed-device behavior and native signing remain unverified.

See [release checklist](RELEASE_CHECKLIST.md) for recovery and device testing. GitHub Actions verifies the committed source independently; its bundle artifact contains no configured backend unless build environment variables are provided.
