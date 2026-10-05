import { useEffect } from 'react';
import { AppState, Platform } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { QueryClient, QueryClientProvider, focusManager } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider, useAuth } from '@/providers/AuthProvider';
import { PreferencesProvider, usePreferences } from '@/providers/PreferencesProvider';

const queries = new QueryClient({ defaultOptions: { queries: { staleTime: 30_000, retry: 1 } } });

function Navigation() {
  const { session } = useAuth();
  const { theme, dark } = usePreferences();
  useEffect(() => {
    if (Platform.OS === 'web') return;
    const listener = AppState.addEventListener('change', state => focusManager.setFocused(state === 'active'));
    return () => listener.remove();
  }, []);
  return <>
    <StatusBar style={dark ? 'light' : 'dark'} />
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: theme.background } }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="auth/callback" />
      <Stack.Protected guard={!session}><Stack.Screen name="welcome" /></Stack.Protected>
      <Stack.Protected guard={!!session}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="account" />
        <Stack.Screen name="subjects/[id]" />
      </Stack.Protected>
    </Stack>
  </>;
}

export default function RootLayout() {
  return <SafeAreaProvider><QueryClientProvider client={queries}><AuthProvider><PreferencesProvider><Navigation /></PreferencesProvider></AuthProvider></QueryClientProvider></SafeAreaProvider>;
}
