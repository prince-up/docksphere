import React, { ReactNode } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '@/hooks/useAuth';
import { 
  LayoutDashboard, 
  Github, 
  Settings, 
  LogOut, 
  Activity, 
  Layers,
  ChevronRight,
  Bell,
  Search,
  Command,
  Database,
  Cloud,
  ChevronDown,
  Monitor,
  Terminal,
  Globe,
  Zap,
  BarChart3
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { user, logout, isAuthenticated } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const navigation = [
    { name: 'Projects', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Deployments', href: '/deployments', icon: Layers },
    { name: 'Logs', href: '/logs', icon: Terminal },
    { name: 'Analytics', href: '/analytics', icon: BarChart3 },
    { name: 'Speed Insights', href: '/speed', icon: Zap },
    { name: 'Monitoring', href: '/monitoring', icon: Monitor },
  ];

  if (!mounted) return <div className="h-screen bg-[#000]" />;

  const isAuthPage = ['/login', '/signup', '/'].includes(router.pathname);

  if (isAuthPage || !isAuthenticated) {
    return <div className="bg-[#000] text-zinc-100 min-h-screen font-sans">{children}</div>;
  }

  return (
    <div className="flex h-screen bg-[#000] text-zinc-100 overflow-hidden font-sans selection:bg-indigo-500/30">
      {/* Vercel Sidebar Style - Larger Text */}
      <aside className="w-[260px] flex-shrink-0 border-r border-zinc-800 flex flex-col bg-[#000] transition-all duration-300">
        <div className="h-16 flex items-center px-4 mb-2">
          <div className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-zinc-900 cursor-pointer transition-all w-full group">
            <div className="h-7 w-7 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-[12px] font-bold text-white shadow-lg shadow-indigo-500/20">
              {user?.username?.charAt(0).toUpperCase() || 'U'}
            </div>
            <span className="text-[14px] font-semibold text-zinc-100 truncate flex-1">{user?.username || 'User'}&apos;s Projects</span>
            <ChevronDown className="h-4 w-4 text-zinc-500 group-hover:text-zinc-300" />
          </div>
        </div>

        <nav className="flex-1 px-3 space-y-1 overflow-y-auto scrollbar-hide">
          <div className="px-1 mb-4">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
              <input 
                type="text" 
                placeholder="Search..." 
                className="w-full pl-10 pr-4 py-2 bg-zinc-900/50 border border-zinc-800 rounded-lg text-[14px] outline-none focus:border-zinc-600 transition-all text-zinc-200"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 px-1.5 py-0.5 rounded bg-zinc-800 text-[10px] font-bold text-zinc-500 border border-zinc-700">F</div>
            </div>
          </div>

          {navigation.map((item) => {
            const isActive = router.pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 text-[14px] font-medium rounded-lg transition-all duration-150',
                  isActive 
                    ? 'bg-zinc-900 text-white' 
                    : 'text-zinc-400 hover:bg-zinc-900/50 hover:text-zinc-100'
                )}
              >
                <item.icon className={cn('h-4.5 w-4.5', isActive ? 'text-white' : 'text-zinc-500')} />
                {item.name}
              </Link>
            );
          })}

          <div className="pt-6 mt-6 border-t border-zinc-800/50 space-y-1">
            <p className="px-3 text-[11px] font-black uppercase tracking-[0.2em] text-zinc-600 mb-2">Settings</p>
            {[
              { name: 'Environment Variables', icon: Cloud },
              { name: 'Domains', icon: Globe },
              { name: 'Integrations', icon: Layers },
              { name: 'Settings', icon: Settings },
            ].map((item) => (
              <button
                key={item.name}
                className="w-full flex items-center gap-3 px-3 py-2.5 text-[14px] font-medium text-zinc-400 hover:bg-zinc-900/50 hover:text-zinc-100 rounded-lg transition-all"
              >
                <item.icon className="h-4.5 w-4.5 text-zinc-500" />
                {item.name}
              </button>
            ))}
          </div>
        </nav>

        <div className="p-5 border-t border-zinc-800 space-y-5 bg-black">
          <div className="flex items-center justify-between group cursor-pointer p-1">
             <div className="space-y-1.5">
                <p className="text-[15px] font-bold text-white tracking-tight">Ship <span className="px-1.5 py-0.5 bg-indigo-500 text-white rounded text-[10px] font-black ml-1">26</span></p>
                <p className="text-[12px] text-zinc-500 leading-normal">Coming to five cities worldwide.</p>
             </div>
             <ChevronRight className="h-4 w-4 text-zinc-700 group-hover:translate-x-1 transition-transform" />
          </div>
          <button className="w-full py-2.5 bg-white text-black text-[13px] font-bold rounded-lg hover:bg-zinc-200 transition-all shadow-lg shadow-white/5">
             Get your ticket
          </button>
          
          <div className="flex items-center justify-between pt-2 px-1">
            <div className="flex items-center gap-2">
               <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
               <span className="text-[12px] font-bold text-zinc-500 uppercase tracking-widest">Stable</span>
            </div>
            <button onClick={logout} className="p-2 bg-zinc-900 rounded-lg text-zinc-600 hover:text-rose-500 hover:bg-rose-500/10 transition-all">
               <LogOut className="h-4.5 w-4.5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#000]">
        {/* Modern Header - Larger Text */}
        <header className="h-16 border-b border-zinc-800 flex items-center justify-between px-8 bg-black/50 backdrop-blur-xl sticky top-0 z-20">
          <div className="flex items-center gap-5 text-[14px] font-medium text-zinc-400">
             <span className="hover:text-white cursor-pointer transition-colors">All Projects</span>
             <ChevronRight className="h-4 w-4 opacity-20" />
             <span className="text-white font-semibold">Overview</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2.5 px-4 py-2 bg-zinc-900/50 border border-zinc-800 rounded-lg text-zinc-400 text-[14px] cursor-pointer hover:bg-zinc-800 transition-all">
               <Search className="h-4 w-4" />
               <span className="pr-16">Search...</span>
            </div>
            <div className="h-6 w-px bg-zinc-800 mx-1" />
            <Link href="/apps/new">
              <button className="px-5 py-2 bg-white text-black text-[14px] font-bold rounded-lg hover:bg-zinc-200 transition-all shadow-xl shadow-white/5">
                Add New...
              </button>
            </Link>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto bg-[#000] p-10 scrollbar-hide">
          <div className="max-w-[1200px] mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}