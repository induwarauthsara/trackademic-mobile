import { useState } from 'react';
import { router } from 'expo-router';
import { Button, Card, Label, Screen } from '@/components/ui';
import { LanguagePicker } from '@/components/LanguagePicker';
import { useAuth } from '@/providers/AuthProvider';
import { usePreferences } from '@/providers/PreferencesProvider';
import { useStudent } from '@/features/academics/queries';

export default function Account() {
  const { session, signOut } = useAuth();
  const { t, theme } = usePreferences();
  const student = useStudent();
  const [pending, setPending] = useState(false);
  const [failed, setFailed] = useState(false);
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
    <Card><Label style={{ fontWeight: '700' }}>{t('mobile.language')}</Label><LanguagePicker /><Label muted>{t('mobile.languageNote')}</Label></Card>
    {failed && <Label accessibilityRole="alert" style={{ color: theme.danger }}>{t('mobile.signOutError')}</Label>}
    <Button label={pending ? t('common.loading') : t('mobile.signOut')} disabled={pending} onPress={() => void logout()} secondary />
  </Screen>;
}
