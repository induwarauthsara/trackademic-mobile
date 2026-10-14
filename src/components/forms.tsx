import { TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { Button, Label } from './ui';
import { usePreferences } from '@/providers/PreferencesProvider';

export function Field({ label, value, onChange, numeric, multiline, placeholder }: { label: string; value: string; onChange: (v: string) => void; numeric?: boolean; multiline?: boolean; placeholder?: string }) {
  const { theme } = usePreferences();
  return <View style={{ gap: 6 }}><Label>{label}</Label><TextInput accessibilityLabel={label} value={value} onChangeText={onChange}
    keyboardType={numeric ? 'decimal-pad' : 'default'} multiline={multiline} placeholder={placeholder} placeholderTextColor={theme.secondary}
    autoCapitalize="none" style={{ minHeight: multiline ? 90 : 50, padding: 14, borderRadius: 12, borderWidth: 1, borderColor: theme.border, backgroundColor: theme.surface, color: theme.text, fontSize: 16 }} /></View>;
}

export function Choices({ label, value, options, onChange }: { label: string; value: string; options: Array<{ value: string; label: string }>; onChange: (v: string) => void }) {
  return <View style={{ gap: 8 }}><Label>{label}</Label><View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
    {options.map(o => <Button key={o.value} label={`${value === o.value ? '✓ ' : ''}${o.label}`} secondary={value !== o.value} onPress={() => onChange(o.value)} />)}
  </View></View>;
}

export function Back() {
  const { t } = usePreferences();
  return <Button label={t('mobile.back')} secondary onPress={() => router.canGoBack() ? router.back() : router.replace('/(tabs)')} />;
}

export function SaveError({ error }: { error: Error | null }) {
  const { theme, t } = usePreferences();
  return error ? <Label accessibilityRole="alert" style={{ color: theme.danger }}>{t('mobile.saveFailed')} {error.message}</Label> : null;
}

export function SetupCard() {
  const { t } = usePreferences();
  return <View style={{ gap: 12 }}><Label>{t('mobile.setupNative')}</Label><Button label={t('mobile.setupTitle')} onPress={() => router.push('/setup')} /></View>;
}
