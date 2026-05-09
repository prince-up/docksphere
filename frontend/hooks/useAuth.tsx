import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { User as SupabaseUser, Session } from '@supabase/supabase-js';

interface User {
  id: string;
  email: string;
  username: string;
  full_name?: string;
  avatar_url?: string;
  role: string;
  identities?: any[];
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  token: string | null;
  signInWithEmail: (email: string, password: string) => Promise<any>;
  signUpWithEmail: (email: string, password: string, metadata?: any) => Promise<any>;
  signInWithGithub: () => Promise<any>;
  logout: () => Promise<void>;
  isLoading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  // Start as true — we don't know auth state yet
  const [isLoading, setIsLoading] = useState(true);

  const mapUser = useCallback((sbUser: SupabaseUser): User => ({
    id: sbUser.id,
    email: sbUser.email || '',
    username:
      sbUser.user_metadata?.user_name ||
      sbUser.user_metadata?.username ||
      sbUser.email?.split('@')[0] || 'user',
    full_name: sbUser.user_metadata?.full_name,
    avatar_url: sbUser.user_metadata?.avatar_url,
    role: sbUser.user_metadata?.role || 'user',
    identities: sbUser.identities || [],
  }), []);

  useEffect(() => {
    let mounted = true;

    // Fetch initial session ONCE
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;
      setSession(session);
      setUser(session?.user ? mapUser(session.user) : null);
      setIsLoading(false);
    });

    // Only listen for REAL auth events (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;
      // Ignore the initial session event — already handled above
      if (event === 'INITIAL_SESSION') return;
      setSession(session);
      setUser(session?.user ? mapUser(session.user) : null);
      setIsLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [mapUser]);

  const signInWithEmail = (email: string, password: string) =>
    supabase.auth.signInWithPassword({ email, password });

  const signUpWithEmail = (email: string, password: string, metadata: any = {}) =>
    supabase.auth.signUp({ email, password, options: { data: metadata } });

  const signInWithGithub = () =>
    supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: typeof window !== 'undefined'
          ? `${process.env.NEXT_PUBLIC_SITE_URL || window.location.origin}/auth/callback`
          : '/auth/callback',
      },
    });

  const logout = async (): Promise<void> => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{
      user, session,
      token: session?.access_token ?? null,
      signInWithEmail, signUpWithEmail, signInWithGithub, logout,
      isLoading,
      isAuthenticated: !!user,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}