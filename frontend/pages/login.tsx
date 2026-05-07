import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '@/hooks/useAuth';
import { Github, Mail, Lock, Database, ArrowRight, Loader2, ChevronLeft } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signInWithEmail, signInWithGithub } = useAuth();
  const router = useRouter();

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await signInWithEmail(email, password);
      if (error) throw error;
      toast.success('Welcome back!');
      router.push('/dashboard');
    } catch (error: any) {
      toast.error(error.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGithubLogin = async () => {
    try {
      const { error } = await signInWithGithub();
      if (error) throw error;
    } catch (error: any) {
      toast.error(error.message || 'GitHub login failed');
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-6 relative overflow-hidden font-sans">
      {/* Background Decorative Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/10 blur-[150px] rounded-full pointer-events-none" />

      <div className="w-full max-w-[420px] space-y-10 relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-1000">
        <div className="text-center space-y-4">
          <Link href="/" className="inline-flex h-14 w-14 bg-white rounded-2xl items-center justify-center shadow-2xl shadow-white/5 group hover:scale-110 transition-transform">
             <Database className="h-8 w-8 text-black" />
          </Link>
          <div className="space-y-1">
             <h1 className="text-3xl font-black italic tracking-tighter">Welcome back.</h1>
             <p className="text-zinc-500 font-medium text-[15px]">Log in to your DockSphere account to continue.</p>
          </div>
        </div>

        <div className="space-y-4">
          <button 
            onClick={handleGithubLogin}
            className="w-full h-12 bg-white text-black font-black text-[14px] uppercase tracking-widest rounded-xl hover:bg-zinc-200 transition-all flex items-center justify-center gap-3 shadow-xl shadow-white/5 active:scale-95"
          >
            <Github className="h-5 w-5" />
            Continue with GitHub
          </button>
          
          <div className="relative py-4">
             <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-zinc-800"></div></div>
             <div className="relative flex justify-center text-[11px] uppercase font-black tracking-[0.3em] text-zinc-700 bg-black px-4 italic">Or continue with email</div>
          </div>

          <form onSubmit={handleEmailLogin} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[11px] font-black uppercase tracking-[0.2em] text-zinc-600 ml-1">Email Address</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-600 group-focus-within:text-white transition-colors" />
                  <input 
                    type="email" 
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.com" 
                    className="w-full pl-12 pr-4 py-3 bg-zinc-900/30 border border-zinc-800 rounded-xl text-[15px] font-medium outline-none focus:bg-zinc-900/50 focus:border-zinc-600 transition-all text-white placeholder:text-zinc-700"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center px-1">
                   <label className="text-[11px] font-black uppercase tracking-[0.2em] text-zinc-600">Password</label>
                   <Link href="#" className="text-[11px] font-black uppercase tracking-widest text-zinc-500 hover:text-white transition-colors">Forgot?</Link>
                </div>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-600 group-focus-within:text-white transition-colors" />
                  <input 
                    type="password" 
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••" 
                    className="w-full pl-12 pr-4 py-3 bg-zinc-900/30 border border-zinc-800 rounded-xl text-[15px] font-medium outline-none focus:bg-zinc-900/50 focus:border-zinc-600 transition-all text-white placeholder:text-zinc-700"
                  />
                </div>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full h-12 bg-zinc-900 border border-zinc-800 text-white font-black text-[14px] uppercase tracking-widest rounded-xl hover:bg-zinc-800 transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Sign In'}
            </button>
          </form>
        </div>

        <p className="text-center text-[14px] text-zinc-500 font-medium">
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="text-white font-bold hover:underline underline-offset-4 decoration-2 decoration-indigo-500">Sign up for free</Link>
        </p>
      </div>

      <Link href="/" className="absolute bottom-10 flex items-center gap-2 text-[12px] font-black uppercase tracking-widest text-zinc-700 hover:text-white transition-colors">
         <ChevronLeft className="h-4 w-4" /> Back to home
      </Link>
    </div>
  );
}