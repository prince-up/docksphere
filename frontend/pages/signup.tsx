import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/Card';
import { Mail, Lock, User, Loader2, Github, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username: username,
            full_name: username,
          },
        },
      });

      if (error) throw error;
      
      toast.success('Account created! Please check your email for verification.');
      // router.push('/login');
    } catch (error: any) {
      toast.error(error.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary-100 via-slate-50 to-white">
      <div className="w-full max-w-md space-y-8 animate-in fade-in zoom-in duration-500">
        <div className="text-center space-y-2">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-white font-bold text-xl shadow-xl shadow-slate-200 mb-4">
            D
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Join DockSphere</h1>
          <p className="text-slate-500">The modern deployment platform for developers</p>
        </div>

        <Card className="border-slate-100 shadow-2xl shadow-slate-200/50 rounded-[2.5rem] overflow-hidden bg-white/80 backdrop-blur-sm">
          <CardHeader className="space-y-1 p-8 pb-4">
            <CardTitle className="text-xl">Create Account</CardTitle>
            <CardDescription>Start deploying your projects today</CardDescription>
          </CardHeader>
          <CardContent className="p-8 pt-4 space-y-6">
            <form onSubmit={handleSignup} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 ml-1">Username</label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-primary-500 transition-colors" />
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="johndoe"
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-primary-100 focus:border-primary-400 transition-all"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 ml-1">Email</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-primary-500 transition-colors" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-primary-100 focus:border-primary-400 transition-all"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 ml-1">Password</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-primary-500 transition-colors" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-primary-100 focus:border-primary-400 transition-all"
                  />
                </div>
              </div>

              <div className="py-2 space-y-2">
                {[
                  'Automated Deployments',
                  'SSL by Default',
                  'Edge Global Network'
                ].map((feature) => (
                  <div key={feature} className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                    {feature}
                  </div>
                ))}
              </div>

              <Button 
                type="submit" 
                className="w-full h-12 rounded-2xl bg-slate-950 text-white hover:bg-slate-800 transition-all font-bold text-md mt-2 shadow-lg shadow-slate-200 gap-2"
                disabled={loading}
              >
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Create Account'}
              </Button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-slate-100" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-4 text-slate-400 font-bold tracking-widest">Or sign up with</span>
              </div>
            </div>

            <Button 
              variant="outline" 
              className="w-full h-12 rounded-2xl border-slate-200 hover:bg-slate-50 transition-all font-semibold gap-3"
            >
              <Github className="h-5 w-5" />
              Continue with GitHub
            </Button>
          </CardContent>
          <CardFooter className="p-8 pt-0 flex justify-center border-t border-slate-50 mt-4">
            <p className="text-sm text-slate-500 mt-6">
              Already have an account?{' '}
              <Link href="/login" className="font-bold text-primary-600 hover:underline">
                Sign In
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}