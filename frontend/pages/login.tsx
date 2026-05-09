import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '@/hooks/useAuth';
import { Github, Mail, Lock, Database, Loader2, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [githubLoading, setGithubLoading] = useState(false);
  const { signInWithEmail, signInWithGithub } = useAuth();
  const router = useRouter();

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return toast.error('Please fill all fields');
    setLoading(true);
    try {
      const { error } = await signInWithEmail(email, password);
      if (error) throw error;
      toast.success('Welcome back!');
      router.push('/dashboard');
    } catch (error: any) {
      toast.error(error.message || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGithubLogin = async () => {
    setGithubLoading(true);
    try {
      const { error } = await signInWithGithub();
      if (error) throw error;
      // Supabase handles the redirect automatically for OAuth
    } catch (error: any) {
      toast.error(error.message || 'GitHub login failed');
      setGithubLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex overflow-hidden font-sans">

      {/* ── Left Panel: Branding ── */}
      <div className="hidden lg:flex flex-col justify-between w-[45%] bg-zinc-950 border-r border-zinc-800/50 p-14 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/30 via-black to-black pointer-events-none" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-600/8 blur-[130px] rounded-full pointer-events-none" />

        <Link href="/" className="flex items-center gap-3 relative z-10">
          <div className="h-10 w-10 bg-white rounded-xl flex items-center justify-center">
            <Database className="h-6 w-6 text-black" />
          </div>
          <span className="text-[16px] font-black tracking-tighter uppercase italic">DockSphere</span>
        </Link>

        <div className="space-y-8 relative z-10">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-full">
              <div className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse" />
              <span className="text-[11px] font-black text-indigo-400 uppercase tracking-widest">Live Platform</span>
            </div>
            <h1 className="text-5xl font-black tracking-tighter leading-none">
              Deploy fast.<br />
              <span className="text-zinc-600">Scale globally.</span>
            </h1>
            <p className="text-zinc-500 text-[15px] font-medium leading-relaxed max-w-xs">
              From GitHub push to live URL in seconds. Real containers, real infrastructure.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {[
              { value: '< 30s',  label: 'Deploy Time' },
              { value: '99.9%',  label: 'Uptime SLA' },
              { value: '5+',     label: 'Frameworks' },
              { value: 'Docker', label: 'Engine' },
            ].map((s) => (
              <div key={s.label} className="bg-white/5 border border-white/10 rounded-2xl p-4">
                <p className="text-2xl font-black text-white">{s.value}</p>
                <p className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="text-[11px] font-bold text-zinc-700 relative z-10">© 2026 DockSphere. All rights reserved.</p>
      </div>

      {/* ── Right Panel: Login Form ── */}
      <div className="flex-1 flex items-center justify-center p-8 relative">
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-500/5 blur-[120px] rounded-full pointer-events-none" />

        <div className="w-full max-w-[400px] space-y-8 relative z-10">

          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3">
            <div className="h-9 w-9 bg-white rounded-xl flex items-center justify-center">
              <Database className="h-5 w-5 text-black" />
            </div>
            <span className="text-[16px] font-black tracking-tighter uppercase italic">DockSphere</span>
          </div>

          <div className="space-y-1">
            <h2 className="text-3xl font-black tracking-tight">Welcome back</h2>
            <p className="text-zinc-500 text-[14px] font-medium">Sign in to your DockSphere account.</p>
          </div>

          {/* GitHub Button */}
          <button
            onClick={handleGithubLogin}
            disabled={githubLoading}
            className="w-full h-13 py-3.5 bg-white text-black font-bold text-[14px] rounded-2xl hover:bg-zinc-100 transition-all flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-70 shadow-xl shadow-white/5"
          >
            {githubLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Github className="h-5 w-5" />}
            Continue with GitHub
          </button>

          <div className="relative py-1">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-zinc-800" />
            </div>
            <div className="relative flex justify-center">
              <span className="px-4 bg-black text-[11px] font-black uppercase tracking-[0.3em] text-zinc-700">Or email</span>
            </div>
          </div>

          {/* Email Form */}
          <form onSubmit={handleEmailLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-[11px] font-black uppercase tracking-widest text-zinc-500">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-600" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  className="w-full pl-11 pr-4 py-3.5 bg-zinc-900/50 border border-zinc-800 rounded-2xl text-[14px] font-medium text-white placeholder:text-zinc-700 outline-none focus:border-zinc-600 focus:bg-zinc-900 transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="block text-[11px] font-black uppercase tracking-widest text-zinc-500">Password</label>
                <button type="button" className="text-[11px] font-bold text-zinc-600 hover:text-white transition-colors">Forgot?</button>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-600" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••"
                  className="w-full pl-11 pr-12 py-3.5 bg-zinc-900/50 border border-zinc-800 rounded-2xl text-[14px] font-medium text-white placeholder:text-zinc-700 outline-none focus:border-zinc-600 focus:bg-zinc-900 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-zinc-900 border border-zinc-700 text-white font-bold text-[14px] rounded-2xl hover:bg-zinc-800 hover:border-zinc-600 transition-all flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-[13px] text-zinc-600 font-medium">
            No account?{' '}
            <Link href="/signup" className="text-white font-bold hover:underline underline-offset-4 decoration-indigo-500 decoration-2">
              Sign up free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}