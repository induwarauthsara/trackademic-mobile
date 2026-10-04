import React from 'react';
import { ActivityIndicator, Linking, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View, type TextProps, type ViewProps } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { usePreferences } from '@/providers/PreferencesProvider';
import { config } from '@/lib/config';

export function Label({ muted, heading, style, ...props }: TextProps & { muted?: boolean; heading?: boolean }) {
  const { theme } = usePreferences();
  return <Text {...props} style={[{ color: muted ? theme.secondary : theme.text, fontSize: heading ? 24 : 15, lineHeight: heading ? 33 : 23, fontWeight: heading ? '700' : '400' }, style]} />;
}

export function Card({ style, ...props }: ViewProps) {
  const { theme } = usePreferences();
  return <View {...props} style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }, style]} />;
}

export function Button({ label, onPress, disabled, secondary }: { label: string; onPress: () => void; disabled?: boolean; secondary?: boolean }) {
  const { theme, dark } = usePreferences();
  return <Pressable accessibilityRole="button" accessibilityState={{ disabled: !!disabled }} disabled={disabled} onPress={onPress}
    style={({ pressed }) => [styles.button, { backgroundColor: secondary ? theme.muted : theme.primary, opacity: disabled ? 0.5 : pressed ? 0.8 : 1 }]}>
    <Text style={{ color: secondary ? theme.text : dark ? '#1a2744' : '#ffffff', fontWeight: '600', fontSize: 15, textAlign: 'center' }}>{label}</Text>
  </Pressable>;
}

export function Screen({ children, refresh, refreshing = false }: { children: React.ReactNode; refresh?: () => void; refreshing?: boolean }) {
  const { theme } = usePreferences();
  return <SafeAreaView edges={['top', 'left', 'right']} style={{ flex: 1, backgroundColor: theme.background }}>
    <ScrollView contentContainerStyle={styles.screen} keyboardShouldPersistTaps="handled"
      refreshControl={refresh ? <RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={theme.primary} /> : undefined}>
      {children}
    </ScrollView>
  </SafeAreaView>;
}

export function Busy() {
  const { theme, t } = usePreferences();
  return <View style={{ padding: 32, gap: 16 }}><ActivityIndicator color={theme.primary} /><Label style={{ textAlign: 'center' }} muted>{t('mobile.checking')}</Label></View>;
}

export function Failure({ retry }: { retry: () => void }) {
  const { t } = usePreferences();
  return <Card><Label>{t('mobile.loadError')}</Label><Button label={t('mobile.retry')} onPress={retry} /></Card>;
}

export function WebSetup({ title, body, path = '/onboarding' }: { title: string; body: string; path?: string }) {
  const { t } = usePreferences();
  const [failed, setFailed] = React.useState(false);
  return <Card><Label heading>{title}</Label><Label muted>{body}</Label>
    {failed && <Label>{t('mobile.loadError')}</Label>}
    <Button label={t('mobile.openWeb')} onPress={() => { setFailed(false); void Linking.openURL(new URL(path, config.webAppUrl).toString()).catch(() => setFailed(true)); }} />
  </Card>;
}

const styles = StyleSheet.create({
  screen: { padding: 24, paddingBottom: 40, gap: 20, width: '100%', maxWidth: 720, alignSelf: 'center' },
  card: { borderWidth: 1, borderRadius: 20, padding: 20, gap: 14 },
  button: { minHeight: 48, paddingHorizontal: 18, paddingVertical: 14, borderRadius: 14, justifyContent: 'center' },
});
