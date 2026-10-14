import { useState } from 'react';
import { router } from 'expo-router';
import { Button, Card, Label, Screen } from '@/components/ui';
import { LanguagePicker } from '@/components/LanguagePicker';
import { useAuth } from '@/providers/AuthProvider';
import { usePreferences } from '@/providers/PreferencesProvider';
import { useStudent } from '@/features/academics/queries';
import { Choices, Field, SaveError } from '@/components/forms';
import { confirmed, useSave } from '@/features/academics/data';
import { number, text } from '@/features/academics/domain';

export default function Account() {
  const { session, signOut } = useAuth();
  const { t, theme, locale } = usePreferences();
  const student = useStudent();
  const [pending, setPending] = useState(false);
  const [failed, setFailed] = useState(false);
  const [form, setForm] = useState({ name: '', university: '', degree: '', hours: '8', theme: 'system' });
  const [loaded, setLoaded] = useState(false);
  const [saved, setSaved] = useState(false);
  if (!loaded && student.data?.profile) { const p = student.data.profile; setForm({ name: p.name || '', university: p.university || '', degree: p.degree || '', hours: String(p.study_hours_per_week ?? 8), theme: p.theme_preference || 'system' }); setLoaded(true); }
  const change = (key: keyof typeof form) => (value: string) => { setForm(f => ({ ...f, [key]: value })); setSaved(false); };
  const save = useSave(async (userId, db) => {
    confirmed(await db.from('trackademic_profiles').update({ name: text(form.name, t('mobile.name')), university: form.university.trim() || null, degree: form.degree.trim() || null, study_hours_per_week: number(form.hours, t('mobile.weeklyHours'), 0, 168, true), theme_preference: form.theme, locale, updated_at: new Date().toISOString() }).eq('id', userId).select('id').single());
  });
  async function logout() {
    setPending(true); setFailed(false);
    try { await signOut(); } catch { setFailed(true); } finally { setPending(false); }
  }
  return <Screen>
    <Button label={t('mobile.back')} secondary onPress={() => router.canGoBack() ? router.back() : router.replace('/(tabs)')} />
    <Label heading>{t('mobile.settings')}</Label>
    <Card><Label heading>{student.data?.profile?.name || t('mobile.student')}</Label><Label muted>{session?.user.email}</Label>
      {!!student.data?.profile?.university && <Label>{student.data.profile.university}</Label>}
      {!!student.data?.profile?.degree && <Label muted>{student.data.profile.degree}</Label>}
      <Label muted style={{ fontSize: 13 }}>{t('mobile.shared')}</Label>
    </Card>
    <Button label={t('mobile.semesters')} secondary onPress={() => router.push('/semesters')} />
    <Card><Label style={{ fontWeight: '700' }}>{t('mobile.language')}</Label><LanguagePicker /><Label muted>{t('mobile.preferencesNote')}</Label>
      <Field label={t('mobile.name')} value={form.name} onChange={change('name')} />
      <Field label={t('mobile.university')} value={form.university} onChange={change('university')} />
      <Field label={t('mobile.degree')} value={form.degree} onChange={change('degree')} />
      <Field label={t('mobile.weeklyHours')} numeric value={form.hours} onChange={change('hours')} />
      <Choices label={t('mobile.theme')} value={form.theme} options={['system', 'light', 'dark'].map(value => ({ value, label: t(`mobile.theme_${value}`) }))} onChange={change('theme')} />
      <SaveError error={save.error} />{saved && <Label>{t('mobile.saved')}</Label>}
      <Button label={t(save.isPending ? 'common.loading' : 'mobile.save')} disabled={save.isPending || !loaded} onPress={() => { void save.mutateAsync(undefined).then(() => setSaved(true)).catch(() => {}); }} />
    </Card>
    {failed && <Label accessibilityRole="alert" style={{ color: theme.danger }}>{t('mobile.signOutError')}</Label>}
    <Button label={pending ? t('common.loading') : t('mobile.signOut')} disabled={pending} onPress={() => void logout()} secondary />
  </Screen>;
}
