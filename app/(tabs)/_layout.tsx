import { Tabs, router } from 'expo-router';
import { Pressable, View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { usePreferences } from '@/providers/PreferencesProvider';

export default function TabsLayout() {
  const { theme, t } = usePreferences();
  return <View style={{ flex: 1 }}><Tabs screenOptions={{ headerShown: false, tabBarActiveTintColor: theme.primary, tabBarInactiveTintColor: theme.secondary,
    tabBarStyle: { backgroundColor: theme.surface, borderTopColor: theme.border }, tabBarLabelStyle: { fontSize: 12 } }}>
    <Tabs.Screen name="index" options={{ title: t('nav.home'), tabBarIcon: ({ color, size }) => <Ionicons name="home-outline" color={color} size={size} /> }} />
    <Tabs.Screen name="subjects" options={{ title: t('nav.subjects'), tabBarIcon: ({ color, size }) => <Ionicons name="book-outline" color={color} size={size} /> }} />
    <Tabs.Screen name="progress" options={{ title: t('mobile.progress'), tabBarIcon: ({ color, size }) => <Ionicons name="stats-chart-outline" color={color} size={size} /> }} />
    <Tabs.Screen name="study" options={{ title: t('mobile.study'), tabBarIcon: ({ color, size }) => <Ionicons name="timer-outline" color={color} size={size} /> }} />
  </Tabs><Pressable accessibilityRole="button" accessibilityLabel={t('mobile.quickAdd')} onPress={() => router.push('/add')}
    style={{ position: 'absolute', bottom: 88, right: 20, borderRadius: 28, backgroundColor: theme.primary, paddingVertical: 14, paddingHorizontal: 20, elevation: 5 }}>
    <Text style={{ color: theme.background, fontWeight: '700', fontSize: 16 }}>+ {t('mobile.quickAdd')}</Text>
  </Pressable></View>;
}
