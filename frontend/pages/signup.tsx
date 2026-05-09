import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '@/hooks/useAuth';
import { Github, Mail, Lock, Database, Loader2, User, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

export default function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [githubLoading, setGithubLoading] = useState(false);
  const [done, setDone] = useState(false);
  const { signUpWithEmail, signInWithGithub } = useAuth();
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !username) return toast.error('Please fill all fields');
    if (password.length < 6) return toast.error('Password must be at least 6 characters');
    setLoading(true);
    try {
      const { error } = await signUpWithEmail(email, password, { username, full_name: username });
      if (error) throw error;
      setDone(true);
    } catch (error: any) {
      toast.error(error.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGithubLogin = async () => {
    setGithubLoading(true);
    try {
      const { error } = await signInWithGithub();
      if (error) throw error;
    } catch (error: any) {
      toast.error(error.message || 'GitHub login failed');
      setGithubLoading(false);
    }
  };

  if (done) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center space-y-6 max-w-md px-8 animate-in fade-in zoom-in duration-500">
          <div className="h-20 w-20 bg-emerald-500/10 border border-emerald-500/30 rounded-3xl flex items-center justify-center mx-auto">
            <CheckCircle2 className="h-10 w-10 text-emerald-500" />
          </div>
          <div className="space-y-2">
            <h2 className="text-3xl font-black tracking-tighter">Check your inbox</h2>
            <p className="text-zinc-500 text-[15px] font-medium leading-relaxed">
              We sent a confirmation link to <span className="text-white font-bold">{email}</span>. Click it to activate your account.
            </p>
          </div>
          <Link href="/login" className="inline-flex items-center gap-2 px-8 py-4 bg-white text-black font-bold text-[14px] rounded-2xl hover:bg-zinc-100 transition-all">
            Back to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <Toaster position="top-center" toastOptions={{ style: { background: '#111', color: '#fff', border: '1px solid #333' } }} />
      <div className="min-h-screen bg-black text-white flex overflow-hidden font-sans">

        {/* Left Panel — Branding */}
        <div className="hidden lg:flex flex-col justify-between w-[45%] bg-zinc-950 border-r border-zinc-800/50 p-16 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-950/20 via-black to-black pointer-events-none" />
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-emerald-600/8 blur-[120px] rounded-full pointer-events-none" />

          <Link href="/" className="flex items-center gap-3 relative z-10">
            <div className="h-10 w-10 bg-white rounded-xl flex items-center justify-center">
              <Database className="h-6 w-6 text-black" />
            </div>
            <span className="text-[18px] font-black tracking-tighter uppercase italic text-white">DockSphere</span>
          </Link>

          <div className="space-y-10 relative z-10">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                <div className="h-2 w-2 rounded-full bg-emerald-500" />
                <span className="text-[12px] font-black text-emerald-400 uppercase tracking-widest">Free to Start</span>
              </div>
              <h1 className="text-5xl font-black tracking-tighter leading-none">
                Build, deploy,<br />
                <span className="text-zinc-600">and ship.</span>
              </h1>
              <p className="text-zinc-500 font-medium text-[16px] leading-relaxed max-w-xs">
                Connect your GitHub. Pick a repo. Deploy in one click. No DevOps knowledge required.
              </p>
            </div>

            <div className="space-y-4">
              {[
                'GitHub repository import',
                'Auto framework detection',
                'Docker container management',
                'Live deployment URLs',
                'Real-time build logs',
              ].map((feature) => (
                <div key={feature} className="flex items-center gap-3">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                  <span className="text-[14px] font-medium text-zinc-400">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          <p className="text-[12px] font-bold text-zinc-700 relative z-10">© 2026 DockSphere. All rights reserved.</p>
        </div>

        {/* Right Panel — Signup Form */}
        <div className="flex-1 flex items-center justify-center p-8 relative overflow-y-auto">
          <div className="absolute top-1/2 right-0 w-[600px] h-[600px] bg-emerald-500/5 blur-[120px] rounded-full pointer-events-none -translate-y-1/2" />

          <div className="w-full max-w-[420px] space-y-8 relative z-10 py-8">
            {/* Mobile Logo */}
            <div className="lg:hidden flex items-center gap-3">
              <div className="h-10 w-10 bg-white rounded-xl flex items-center justify-center">
                <Database className="h-6 w-6 text-black" />
              </div>
              <span className="text-[18px] font-black tracking-tighter uppercase italic">DockSphere</span>
            </div>

            <div className="space-y-2">
              <h2 className="text-3xl font-black tracking-tighter">Create your account</h2>
              <p className="text-zinc-500 text-[15px] font-medium">Start deploying in minutes. Free forever.</p>
            </div>

            <div className="space-y-4">
              <button
                onClick={handleGithubLogin}
                disabled={githubLoading}
                className="w-full h-14 bg-white text-black font-bold text-[15px] rounded-2xl hover:bg-zinc-100 transition-all flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-70 shadow-xl shadow-white/5"
              >
                {githubLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Github className="h-5 w-5" />}
                Continue with GitHub
              </button>

              <div className="relative py-3">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-zinc-800" />
                </div>
                <div className="relative flex justify-center">
                  <span className="px-4 bg-black text-[11px] font-black uppercase tracking-[0.3em] text-zinc-700">Or email</span>
                </div>
              </div>

              <form onSubmit={handleSignup} className="space-y-4">
                <div className="space-y-2">
                  <label className="block text-[12px] font-black uppercase tracking-widest text-zinc-500">Username</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-600" />
                    <input
                      type="text"
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                      placeholder="johndoe"
                      className="w-full pl-11 pr-4 py-4 bg-zinc-900/50 border border-zinc-800 rounded-2xl text-[15px] font-medium text-white placeholder:text-zinc-700 outline-none focus:border-zinc-600 focus:bg-zinc-900 transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-[12px] font-black uppercase tracking-widest text-zinc-500">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-600" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@company.com"
                      className="w-full pl-11 pr-4 py-4 bg-zinc-900/50 border border-zinc-800 rounded-2xl text-[15px] font-medium text-white placeholder:text-zinc-700 outline-none focus:border-zinc-600 focus:bg-zinc-900 transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-[12px] font-black uppercase tracking-widest text-zinc-500">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-600" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Min. 6 characters"
                      className="w-full pl-11 pr-12 py-4 bg-zinc-900/50 border border-zinc-800 rounded-2xl text-[15px] font-medium text-white placeholder:text-zinc-700 outline-none focus:border-zinc-600 focus:bg-zinc-900 transition-all"
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
                  className="w-full h-14 bg-zinc-900 border border-zinc-700 text-white font-bold text-[15px] rounded-2xl hover:bg-zinc-800 hover:border-zinc-600 transition-all flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-50 mt-2"
                >
                  {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Create Account'}
                </button>
              </form>

              <p className="text-center text-[12px] text-zinc-700 leading-relaxed">
                By signing up, you agree to our{' '}
                <span className="text-zinc-500 hover:text-white cursor-pointer transition-colors">Terms</span> and{' '}
                <span className="text-zinc-500 hover:text-white cursor-pointer transition-colors">Privacy Policy</span>.
              </p>
            </div>

            <p className="text-center text-[14px] text-zinc-600 font-medium">
              Already have an account?{' '}
              <Link href="/login" className="text-white font-bold hover:underline underline-offset-4 decoration-emerald-500 decoration-2">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}