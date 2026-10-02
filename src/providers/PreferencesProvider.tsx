import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import { useStudent } from '@/features/academics/queries';
import { useAuth } from './AuthProvider';
import en from '@/messages/en.json';
import si from '@/messages/si.json';
import ta from '@/messages/ta.json';
import { mobileMessages } from '@/messages/mobile';

export type Locale = 'en' | 'si' | 'ta';
const light = { background: '#f4f8fc', surface: '#ffffff', muted: '#e8f4ff', primary: '#2b7fd4', accent: '#6ddccf', text: '#1e293b', secondary: '#64748b', border: '#e2e8f0', danger: '#b91c1c' };
const dark: typeof light = { background: '#1a2744', surface: '#243352', muted: '#1e3a5f', primary: '#93c5fd', accent: '#6ddccf', text: '#f1f5f9', secondary: '#b7c6da', border: '#405574', danger: '#fca5a5' };
type Preferences = { locale: Locale; setLocale: (value: Locale) => void; theme: typeof light; dark: boolean; t: (key: string, values?: Record<string, string | number>) => string };
const Context = createContext<Preferences | null>(null);
function getText(source: unknown, path: string): string | undefined {
  let value: unknown = source;
  for (const part of path.split('.')) {
    if (!value || typeof value !== 'object') return undefined;
    value = (value as Record<string, unknown>)[part];
  }
  return typeof value === 'string' ? value : undefined;
}

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const { session } = useAuth();
  const student = useStudent();
  const systemTheme = useColorScheme();
  const [locale, setLocale] = useState<Locale>('en');
  useEffect(() => { setLocale('en'); }, [session?.user.id]);
  useEffect(() => {
    const value = student.data?.profile?.locale;
    if (value === 'en' || value === 'si' || value === 'ta') setLocale(value);
  }, [student.data?.profile?.locale, session?.user.id]);
  const isDark = student.data?.profile?.theme_preference
    ? student.data.profile.theme_preference === 'dark' : systemTheme === 'dark';
  const t: Preferences['t'] = (key, values) => {
    const source = { en, si, ta }[locale];
    const translated = key.startsWith('mobile.')
      ? getText(mobileMessages[locale], key.slice(7)) ?? getText(mobileMessages.en, key.slice(7))
      : getText(source, key) ?? getText(en, key);
    return (translated ?? key).replace(/\{(\w+)\}/g, (match, name: string) => String(values?.[name] ?? match));
  };
  return <Context.Provider value={{ locale, setLocale, theme: isDark ? dark : light, dark: isDark, t }}>{children}</Context.Provider>;
}

export function usePreferences() {
  const context = useContext(Context);
  if (!context) throw new Error('PreferencesProvider is required.');
  return context;
}
