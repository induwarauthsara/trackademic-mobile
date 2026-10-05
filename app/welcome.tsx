import { useState } from 'react';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button, Card, Label, Screen } from '@/components/ui';
import { useAuth, needsDevelopmentBuild } from '@/providers/AuthProvider';
import { usePreferences } from '@/providers/PreferencesProvider';
import { configurationReady } from '@/lib/config';
import { LanguagePicker } from '@/components/LanguagePicker';

export default function Welcome() {
  const { signIn } = useAuth();
  const { theme, t } = usePreferences();
  const [pending, setPending] = useState(false);
  const [failed, setFailed] = useState(false);
  async function login() {
    setFailed(false); setPending(true);
    try { await signIn(); } catch { setFailed(true); } finally { setPending(false); }
  }
  return <Screen>
    <View style={{ paddingTop: 16, gap: 10 }}><Label style={{ fontWeight: '800', color: theme.primary, fontSize: 21 }}>Trackademic</Label><LanguagePicker /></View>
    <View style={{ paddingVertical: 30, gap: 22 }}>
      <View style={{ width: 88, height: 88, borderRadius: 28, backgroundColor: theme.muted, alignItems: 'center', justifyContent: 'center' }}><Ionicons name="school-outline" size={46} color={theme.primary} /></View>
      <Label heading style={{ fontSize: 32, lineHeight: 42 }}>{t('mobile.welcome')}</Label>
      <Label muted style={{ fontSize: 17, lineHeight: 27 }}>{t('mobile.welcomeBody')}</Label>
    </View>
    <Card>
      {!configurationReady ? <><Label heading>{t('mobile.configure')}</Label><Label muted>{t('mobile.configureBody')}</Label></> : <>
        {needsDevelopmentBuild && <Label muted>{t('mobile.devBuild')}</Label>}
        {failed && <Label accessibilityRole="alert" style={{ color: theme.danger }}>{t('mobile.signInError')}</Label>}
        <Button label={pending ? t('common.loading') : t('mobile.google')} onPress={() => void login()} disabled={pending || needsDevelopmentBuild} />
        <Label muted>{t('mobile.existing')}</Label>
      </>}
    </Card>
    <Label muted style={{ textAlign: 'center' }}>{t('mobile.motivation')}</Label>
  </Screen>;
}
