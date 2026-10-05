import { Redirect } from 'expo-router';
import { useAuth } from '@/providers/AuthProvider';
import { usePreferences } from '@/providers/PreferencesProvider';
import { Busy, Button, Card, Label, Screen } from '@/components/ui';

export default function Index() {
  const auth = useAuth();
  const { t } = usePreferences();
  if (auth.loading) return <Screen><Busy /></Screen>;
  if (auth.error) return <Screen><Card><Label>{t('mobile.signInError')}</Label><Button label={t('mobile.retry')} onPress={() => void auth.restore()} /></Card></Screen>;
  return <Redirect href={auth.session ? '/(tabs)' : '/welcome'} />;
}
