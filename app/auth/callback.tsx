import { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { useURL } from 'expo-linking';
import { router } from 'expo-router';
import { Busy, Button, Card, Label, Screen } from '@/components/ui';
import { useAuth } from '@/providers/AuthProvider';
import { usePreferences } from '@/providers/PreferencesProvider';

export default function AuthCallback() {
  const url = useURL();
  const { completeSignIn, session } = useAuth();
  const { t } = usePreferences();
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    if (session) { router.replace('/(tabs)'); return; }
    const callbackUrl = Platform.OS === 'web' ? window.location.href : url;
    if (!callbackUrl) return;
    let active = true;
    void (async () => {
      try { await completeSignIn(callbackUrl); if (active) router.replace('/(tabs)'); }
      catch { if (active) setFailed(true); }
    })();
    return () => { active = false; };
  }, [url, completeSignIn, session]);
  return <Screen>{failed ? <Card><Label>{t('mobile.callbackError')}</Label><Button label={t('mobile.google')} onPress={() => router.replace('/welcome')} /></Card> : <Busy />}</Screen>;
}
