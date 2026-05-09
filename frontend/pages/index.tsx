import React from 'react';
import Link from 'next/link';
import { 
  Rocket, 
  Shield, 
  Zap, 
  Globe, 
  Github, 
  Database, 
  Cloud,
  ChevronRight,
  Monitor,
  Terminal,
  Activity,
  ArrowRight,
  Box,
  Layers
} from 'lucide-react';
import { useRouter } from 'next/router';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

export default function Landing() {
  const [mounted, setMounted] = React.useState(false);
   const { user, isAuthenticated, logout } = useAuth();
   const router = useRouter();

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div className="h-screen bg-black" />;

  return (
    <div className="min-h-screen bg-black text-white selection:bg-indigo-500/30 overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-black/50 backdrop-blur-xl border-b border-zinc-800/50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-10">
            <Link href="/" className="flex items-center gap-2.5">
               <div className="h-8 w-8 bg-white rounded-lg flex items-center justify-center">
                  <Database className="h-5 w-5 text-black" />
               </div>
               <span className="text-lg font-black tracking-tighter">DOCKSPHERE</span>
            </Link>
            <div className="hidden md:flex items-center gap-8 text-[14px] font-medium text-zinc-400">
               <a href="#features" className="hover:text-white transition-colors">Features</a>
               <a href="#infrastructure" className="hover:text-white transition-colors">Infrastructure</a>
               <a href="#docs" className="hover:text-white transition-colors">Docs</a>
            </div>
          </div>
          <div className="flex items-center gap-4">
                  {isAuthenticated ? (
                     <div className="flex items-center gap-3">
                        <div className="hidden sm:flex flex-col items-end leading-tight">
                           <span className="text-[11px] font-black uppercase tracking-[0.22em] text-emerald-400">Signed in</span>
                           <span className="text-[13px] font-bold text-white">{user?.username || 'User'}</span>
                        </div>
                        <Link href="/dashboard" className="px-5 py-2 bg-white text-black text-[14px] font-black rounded-lg hover:bg-zinc-200 transition-all shadow-xl shadow-white/5">
                           Dashboard
                        </Link>
                        <button
                           onClick={async () => {
                              await logout();
                              router.push('/');
                           }}
                           className="text-[14px] font-bold text-zinc-400 hover:text-white transition-all px-2"
                        >
                           Sign out
                        </button>
                     </div>
                  ) : (
                     <>
                        <Link href="/login" className="text-[14px] font-bold text-zinc-400 hover:text-white transition-all px-4">Log in</Link>
                        <Link href="/signup" className="px-6 py-2 bg-white text-black text-[14px] font-black rounded-lg hover:bg-zinc-200 transition-all shadow-xl shadow-white/5">
                              Sign Up
                        </Link>
                     </>
                  )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-40 pb-32 px-6">
         {/* Background Glows */}
         <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[1200px] h-[600px] bg-indigo-500/10 blur-[120px] rounded-full pointer-events-none" />
         
         <div className="max-w-5xl mx-auto text-center space-y-12 relative z-10">
                  {isAuthenticated && (
                     <div className="inline-flex items-center gap-3 px-4 py-3 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-left">
                        <div className="h-10 w-10 rounded-xl bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center">
                           <span className="text-emerald-400 font-black text-sm">{user?.username?.charAt(0).toUpperCase() || 'U'}</span>
                        </div>
                        <div>
                           <p className="text-[11px] font-black uppercase tracking-[0.22em] text-emerald-400">Logged in</p>
                           <p className="text-[14px] font-bold text-white">{user?.email || user?.username || 'Active session'}</p>
                        </div>
                     </div>
                  )}

            <div className="inline-flex items-center gap-3 px-4 py-1.5 bg-zinc-900/50 border border-zinc-800 rounded-full text-[12px] font-black uppercase tracking-[0.2em] text-indigo-400 animate-in fade-in slide-in-from-top-4 duration-700">
               <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
               </span>
               Infrastructure for the next generation
            </div>

            <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.9] italic animate-in fade-in slide-in-from-bottom-8 duration-1000">
               Deploy with <br />
               <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-zinc-200 to-zinc-600">Pure Intelligence.</span>
            </h1>

            <p className="text-lg md:text-xl text-zinc-500 max-w-2xl mx-auto font-medium leading-relaxed animate-in fade-in duration-1000 delay-300">
               Launch your containerized applications to our global edge network in seconds. 
               Zero configuration, infinite scale.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-8 animate-in fade-in zoom-in duration-1000 delay-500">
               {isAuthenticated ? (
                 <Link href="/dashboard">
                    <button className="px-10 py-4 bg-white text-black text-lg font-black rounded-xl hover:bg-zinc-200 transition-all shadow-2xl shadow-white/5 flex items-center gap-3 group">
                       Open Dashboard <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </button>
                 </Link>
               ) : (
                 <Link href="/signup">
                    <button className="px-10 py-4 bg-white text-black text-lg font-black rounded-xl hover:bg-zinc-200 transition-all shadow-2xl shadow-white/5 flex items-center gap-3 group">
                       Start Deploying <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </button>
                 </Link>
               )}
               <button className="px-10 py-4 bg-zinc-900/50 border border-zinc-800 text-lg font-black rounded-xl hover:bg-zinc-900 transition-all flex items-center gap-3">
                  Read Documentation
               </button>
            </div>
         </div>
      </section>

      {/* Feature Bento */}
      <section id="features" className="max-w-7xl mx-auto px-6 py-32 space-y-12">
         <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 bg-zinc-900/20 border border-zinc-800 rounded-[3rem] p-12 space-y-8 group hover:border-zinc-700 transition-all relative overflow-hidden backdrop-blur-sm">
               <div className="h-14 w-14 rounded-2xl bg-white flex items-center justify-center text-black">
                  <Rocket className="h-7 w-7" />
               </div>
               <div className="space-y-4">
                  <h3 className="text-3xl font-black italic tracking-tighter">Instant Edge Deployments</h3>
                  <p className="text-lg text-zinc-500 font-medium leading-relaxed max-w-md">
                     Your code is automatically containerized and pushed to 12 global regions within milliseconds of your git push.
                  </p>
               </div>
               {/* Background Mesh Overlay */}
               <div className="absolute top-0 right-0 h-full w-1/2 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-500/5 via-transparent to-transparent" />
            </div>

            <div className="bg-zinc-900/20 border border-zinc-800 rounded-[3rem] p-12 space-y-8 group hover:border-zinc-700 transition-all backdrop-blur-sm">
               <div className="h-14 w-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                  <Shield className="h-7 w-7 text-indigo-400" />
               </div>
               <div className="space-y-4">
                  <h3 className="text-2xl font-black italic tracking-tighter">L7 Security</h3>
                  <p className="text-zinc-500 font-medium">Built-in DDoS protection and SSL for every project.</p>
               </div>
            </div>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-zinc-950 border border-zinc-800 rounded-[3rem] p-12 space-y-8 flex flex-col justify-between group hover:border-zinc-700 transition-all">
               <div className="space-y-6">
                  <Zap className="h-10 w-10 text-amber-400" />
                  <h3 className="text-2xl font-black italic tracking-tighter">Turbo Builds</h3>
                  <p className="text-zinc-500 font-medium">Cached layers ensure your builds are 5x faster than conventional pipelines.</p>
               </div>
               <div className="h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden">
                  <div className="h-full w-3/4 bg-amber-400 rounded-full animate-pulse" />
               </div>
            </div>

            <div className="md:col-span-2 bg-zinc-950 border border-zinc-800 rounded-[3rem] p-12 space-y-12 group hover:border-zinc-700 transition-all relative overflow-hidden">
               <div className="flex items-center justify-between">
                  <div>
                     <h3 className="text-3xl font-black italic tracking-tighter">Global Infrastructure</h3>
                     <p className="text-zinc-500 mt-2 font-medium">Connect with users everywhere, with zero latency.</p>
                  </div>
                  <Globe className="h-12 w-12 text-zinc-800 group-hover:text-white transition-colors" />
               </div>
               <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-8 border-t border-zinc-900">
                  {['London', 'New York', 'Mumbai', 'Tokyo'].map(city => (
                     <div key={city} className="space-y-2">
                        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-600">{city}</p>
                        <p className="text-[14px] font-black text-emerald-500">Active</p>
                     </div>
                  ))}
               </div>
            </div>
         </div>
      </section>

      {/* Infrastructure CTA */}
      <section className="py-40 px-6 text-center space-y-10 border-t border-zinc-900">
         <h2 className="text-5xl md:text-7xl font-black tracking-tighter italic">Ready to ship?</h2>
         <p className="text-xl text-zinc-500 font-medium max-w-xl mx-auto">
            Join thousands of developers scaling their ideas on DockSphere.
         </p>
         <Link href="/signup">
            <button className="px-12 py-5 bg-white text-black text-xl font-black rounded-2xl hover:bg-zinc-200 transition-all shadow-2xl shadow-white/5 active:scale-95">
               Deploy Your First Project
            </button>
         </Link>
      </section>

      {/* Footer */}
      <footer className="py-20 border-t border-zinc-900 px-6">
         <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-10">
            <div className="flex items-center gap-3">
               <Database className="h-6 w-6 text-white" />
               <span className="text-lg font-black tracking-tighter">DOCKSPHERE</span>
            </div>
            <div className="flex gap-10 text-[14px] font-medium text-zinc-500">
               <a href="#" className="hover:text-white">Twitter</a>
               <a href="#" className="hover:text-white">GitHub</a>
               <a href="#" className="hover:text-white">Status</a>
               <a href="#" className="hover:text-white">Privacy</a>
            </div>
            <p className="text-[14px] text-zinc-700">© 2024 DockSphere Inc.</p>
         </div>
      </footer>
    </div>
  );
}
