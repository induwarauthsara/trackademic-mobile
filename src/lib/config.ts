const projectUrl = process.env.EXPO_PUBLIC_SUPABASE_URL?.trim() ?? '';
const publicKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY?.trim() ?? '';
const webAppUrl = process.env.EXPO_PUBLIC_WEB_APP_URL?.trim() || 'https://trackademic.com';

export function isHttpUrl(value: string) {
  try { const u = new URL(value); return ['https:', 'http:'].includes(u.protocol) && !u.username && !u.password; }
  catch { return false; }
}

export const configurationReady = isHttpUrl(projectUrl) && !!publicKey && !publicKey.startsWith('sb_secret_');
export const config = { projectUrl, publicKey, webAppUrl: isHttpUrl(webAppUrl) ? webAppUrl : 'https://trackademic.com' };
