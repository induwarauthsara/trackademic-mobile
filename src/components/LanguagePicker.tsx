import { Pressable, View } from 'react-native';
import { usePreferences, type Locale } from '@/providers/PreferencesProvider';
import { Label } from './ui';

export function LanguagePicker() {
  const { locale, setLocale, theme } = usePreferences();
  return <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
    {([['en', 'English'], ['si', 'සිංහල'], ['ta', 'தமிழ்']] as [Locale, string][]).map(([id, label]) =>
      <Pressable key={id} accessibilityRole="button" accessibilityLabel={label} accessibilityState={{ selected: locale === id }} onPress={() => setLocale(id)}
        style={{ minHeight: 44, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12, backgroundColor: locale === id ? theme.muted : theme.surface, borderWidth: 1, borderColor: locale === id ? theme.primary : theme.border }}>
        <Label style={{ color: locale === id ? theme.primary : theme.text, fontSize: 13 }}>{label}</Label>
      </Pressable>)}
  </View>;
}
