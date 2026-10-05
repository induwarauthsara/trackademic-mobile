import { Pressable, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Card, Label } from './ui';
import { usePreferences } from '@/providers/PreferencesProvider';
import type { Subject } from '@/features/academics/queries';

export function SubjectCard({ subject }: { subject: Subject }) {
  const { theme, t } = usePreferences();
  return <Pressable accessibilityRole="button" accessibilityLabel={`${subject.code}, ${subject.name}`} onPress={() => router.push({ pathname: '/subjects/[id]', params: { id: subject.id } })}>
    <Card style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
      <View style={{ width: 5, minHeight: 64, borderRadius: 4, backgroundColor: /^#[0-9a-f]{6}$/i.test(subject.color) ? subject.color : theme.primary }} />
      <View style={{ flex: 1, gap: 4 }}><Label style={{ fontWeight: '700', color: theme.primary }}>{subject.short_name || subject.code}</Label>
        <Label>{subject.name}</Label><Label muted style={{ fontSize: 13 }}>{t('mobile.target', { grade: subject.target_grade })}{subject.is_credit_subject ? ` · ${t('mobile.credits', { count: subject.credits })}` : ''}</Label>
      </View><Ionicons name="chevron-forward" size={20} color={theme.secondary} />
    </Card>
  </Pressable>;
}
