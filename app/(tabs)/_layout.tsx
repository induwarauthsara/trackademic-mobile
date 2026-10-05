import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { usePreferences } from '@/providers/PreferencesProvider';

export default function TabsLayout() {
  const { theme, t } = usePreferences();
  return <Tabs screenOptions={{ headerShown: false, tabBarActiveTintColor: theme.primary, tabBarInactiveTintColor: theme.secondary,
    tabBarStyle: { backgroundColor: theme.surface, borderTopColor: theme.border }, tabBarLabelStyle: { fontSize: 12 } }}>
    <Tabs.Screen name="index" options={{ title: t('nav.home'), tabBarIcon: ({ color, size }) => <Ionicons name="home-outline" color={color} size={size} /> }} />
    <Tabs.Screen name="subjects" options={{ title: t('nav.subjects'), tabBarIcon: ({ color, size }) => <Ionicons name="book-outline" color={color} size={size} /> }} />
  </Tabs>;
}
