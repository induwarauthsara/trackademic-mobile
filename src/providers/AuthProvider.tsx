import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { AppState, Platform } from 'react-native';
import { makeRedirectUri } from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import Constants from 'expo-constants';
import type { Session } from '@supabase/supabase-js';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { getOAuthCode } from '@/lib/oauth';

WebBrowser.maybeCompleteAuthSession();

export const authRedirect = () => makeRedirectUri({ scheme: 'trackademic', path: 'auth/callback', isTripleSlashed: true });
export const needsDevelopmentBuild = Platform.OS !== 'web' && Constants.executionEnvironment === 'storeClient';

type AuthContextValue = {
  session: Session | null; loading: boolean; error: boolean;
  restore: () => Promise<void>; signIn: () => Promise<void>;
  completeSignIn: (url: string) => Promise<void>; signOut: () => Promise<void>;
};
const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(!!supabase);
  const [error, setError] = useState(false);
  const queries = useQueryClient();
  const userId = useRef<string | null>(null);
  const revision = useRef(0);
  const callback = useRef<{ code: string; promise: Promise<void> } | null>(null);

  const applySession = useCallback((next: Session | null) => {
    if (userId.current !== (next?.user.id ?? null)) {
      queries.clear();
      userId.current = next?.user.id ?? null;
    }
    setSession(next);
    setError(false);
    setLoading(false);
  }, [queries]);

  const restore = useCallback(async () => {
    if (!supabase) return;
    setLoading(true);
    setError(false);
    const requestRevision = revision.current;
    try {
      const { data, error: failure } = await supabase.auth.getSession();
      if (failure) throw failure;
      if (requestRevision === revision.current) applySession(data.session);
    } catch {
      if (requestRevision === revision.current) { setError(true); setLoading(false); }
    }
  }, [applySession]);

  useEffect(() => {
    if (!supabase) return;
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, next) => {
      revision.current++;
      applySession(next);
    });
    void restore();
    const appState = AppState.addEventListener('change', state => {
      if (state === 'active') supabase?.auth.startAutoRefresh();
      else supabase?.auth.stopAutoRefresh();
    });
    if (Platform.OS !== 'web' && AppState.currentState === 'active') supabase.auth.startAutoRefresh();
    return () => { subscription.unsubscribe(); appState.remove(); supabase?.auth.stopAutoRefresh(); };
  }, [applySession, restore]);

  const completeSignIn = useCallback((url: string) => {
    if (!supabase) return Promise.reject(new Error('Supabase is not configured.'));
    const code = getOAuthCode(url, authRedirect());
    if (callback.current?.code === code) return callback.current.promise;
    const promise = (async () => {
      const { data, error: failure } = await supabase.auth.exchangeCodeForSession(code);
      if (failure || !data.session) throw failure ?? new Error('No session returned.');
      applySession(data.session);
    })();
    callback.current = { code, promise };
    return promise;
  }, [applySession]);

  const signIn = useCallback(async () => {
    if (!supabase || needsDevelopmentBuild) throw new Error('A configured development build is required.');
    const redirectTo = authRedirect();
    const { data, error: failure } = await supabase.auth.signInWithOAuth({
      provider: 'google', options: { redirectTo, skipBrowserRedirect: true },
    });
    if (failure || !data.url) throw failure ?? new Error('No authorization URL returned.');
    if (Platform.OS === 'web') { window.location.assign(data.url); return; }
    const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
    if (result.type === 'success') await completeSignIn(result.url);
    // Closing the browser is normal cancellation and keeps the welcome screen.
  }, [completeSignIn]);

  const signOut = useCallback(async () => {
    if (!supabase) return;
    const { error: failure } = await supabase.auth.signOut({ scope: 'local' });
    if (failure) throw failure;
    callback.current = null;
    applySession(null);
  }, [applySession]);

  return <AuthContext.Provider value={{ session, loading, error, restore, signIn, completeSignIn, signOut }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('AuthProvider is required.');
  return context;
}
