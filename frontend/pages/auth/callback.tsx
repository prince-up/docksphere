import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '@/lib/supabase';

export default function AuthCallback() {
  const router = useRouter();
  const [message, setMessage] = useState('Completing sign in...');

  useEffect(() => {
    let active = true;

    const finishAuth = async () => {
      const { data, error } = await supabase.auth.getSession();

      if (!active) {
        return;
      }

      if (error) {
        setMessage(error.message || 'Authentication failed');
        await router.replace('/login');
        return;
      }

      if (data.session) {
        await router.replace('/dashboard');
        return;
      }

      setMessage('No active session found. Redirecting to login...');
      await router.replace('/login');
    };

    void finishAuth();

    return () => {
      active = false;
    };
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white px-6">
      <div className="max-w-md w-full rounded-3xl border border-zinc-800 bg-zinc-950/80 p-8 text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-zinc-500">DockSphere</p>
        <h1 className="mt-4 text-3xl font-black tracking-tight">GitHub sign-in</h1>
        <p className="mt-3 text-sm text-zinc-400">{message}</p>
      </div>
    </div>
  );
}