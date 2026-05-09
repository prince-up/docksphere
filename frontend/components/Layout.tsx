import React, { ReactNode, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '@/hooks/useAuth';
import {
  LayoutDashboard, Settings, LogOut, Terminal,
  Layers, Monitor, Bell, Search, Database, Cloud,
  ChevronDown, Globe, Plus, BarChart3, HelpCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const AUTH_ROUTES   = new Set(['/', '/login', '/signup']);
const PROTECTED_ROUTES = ['/dashboard', '/apps', '/deployments', '/logs', '/monitoring'];

const NAV = [
  { name: 'Projects',    href: '/dashboard',   icon: LayoutDashboard },
  { name: 'Deployments', href: '/deployments', icon: Layers },
  { name: 'Logs',        href: '/logs',         icon: Terminal },
  { name: 'Monitoring',  href: '/monitoring',   icon: Monitor },
];
const SETTINGS_NAV = [
  { name: 'Domains',     icon: Globe },
  { name: 'Environment', icon: Cloud },
  { name: 'Analytics',   icon: BarChart3 },
  { name: 'Settings',    icon: Settings },
];

export default function Layout({ children }: { children: ReactNode }) {
  const { user, logout, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const redirecting = useRef(false); // prevent double redirects

  /* ── Single redirect effect ──────────────────────────────────
     Only depends on auth state — NOT on pathname.
     We read router.pathname via a ref inside the effect so we
     don't re-subscribe every time the route changes.
  ─────────────────────────────────────────────────────────── */
  useEffect(() => {
    if (isLoading) return; // wait until we know auth state
    if (redirecting.current) return; // already navigating

    const path = router.pathname;
    const isAuth = AUTH_ROUTES.has(path);
    const isProtected = PROTECTED_ROUTES.some(p => path.startsWith(p));

    if (isAuthenticated && isAuth && path !== '/') {
      // Logged-in user on login/signup → go to dashboard ONCE
      redirecting.current = true;
      router.replace('/dashboard').finally(() => { redirecting.current = false; });
    } else if (!isAuthenticated && isProtected) {
      // Not logged in on protected page → go to login ONCE
      redirecting.current = true;
      router.replace('/login').finally(() => { redirecting.current = false; });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading, isAuthenticated]); 
  // ↑ intentionally OMIT router.pathname so this only fires when auth state changes,
  //   NOT on every navigation. We read pathname directly inside the effect.

  /* ── What to render ─────────────────────────────────────────── */

  // 1. Auth pages always render as bare pages (no sidebar)
  if (AUTH_ROUTES.has(router.pathname)) {
    return <>{children}</>;
  }

  // 2. While auth is resolving → show a black splash screen
  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 border-2 border-zinc-800 border-t-indigo-500 rounded-full animate-spin" />
          <p className="text-zinc-700 text-[12px] font-bold uppercase tracking-widest">Loading...</p>
        </div>
      </div>
    );
  }

  // 3. Not authenticated on a protected page → blank while redirect fires
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black" />
    );
  }

  // 4. Authenticated protected page → full layout
  return (
    <div className="flex h-screen bg-black text-white overflow-hidden font-sans">

      {/* ─── SIDEBAR ─── */}
      <aside className="w-[250px] flex-shrink-0 flex flex-col border-r border-zinc-800/50 bg-[#050505]">

        {/* Logo */}
        <Link href="/dashboard" className="flex items-center gap-3 px-5 h-[68px] border-b border-zinc-800/40 flex-shrink-0 group">
          <div className="h-8 w-8 bg-white rounded-xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-300">
            <Database className="h-5 w-5 text-black" />
          </div>
          <div>
            <p className="text-[14px] font-black tracking-tighter text-white uppercase italic leading-none">DockSphere</p>
            <p className="text-[9px] font-black tracking-[0.2em] text-zinc-600 uppercase mt-0.5">Infrastructure</p>
          </div>
        </Link>

        {/* Workspace Switcher */}
        <div className="px-3 py-3 border-b border-zinc-800/40 flex-shrink-0">
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-zinc-900/50 transition-colors cursor-pointer group">
            <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-indigo-600 to-purple-700 flex items-center justify-center text-[12px] font-black text-white shadow-md">
              {user?.username?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-bold text-white truncate leading-tight">{user?.username || 'User'}</p>
              <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest">Hobby</p>
            </div>
            <ChevronDown className="h-3.5 w-3.5 text-zinc-700 flex-shrink-0" />
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 overflow-y-auto scrollbar-hide">
          <p className="px-3 text-[9px] font-black uppercase tracking-[0.25em] text-zinc-700 mb-2">Platform</p>
          <div className="space-y-0.5">
            {NAV.map((item) => {
              const isActive = router.pathname === item.href ||
                (item.href !== '/dashboard' && router.pathname.startsWith(item.href));
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-bold transition-all relative',
                    isActive
                      ? 'bg-zinc-900 text-white'
                      : 'text-zinc-500 hover:text-zinc-200 hover:bg-zinc-900/40'
                  )}
                >
                  {isActive && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-indigo-500 rounded-r-full" />
                  )}
                  <item.icon className={cn('h-4 w-4 flex-shrink-0', isActive ? 'text-indigo-400' : 'text-zinc-600')} />
                  {item.name}
                </Link>
              );
            })}
          </div>

          <div className="mt-6 pt-6 border-t border-zinc-800/40">
            <p className="px-3 text-[9px] font-black uppercase tracking-[0.25em] text-zinc-700 mb-2">Configuration</p>
            <div className="space-y-0.5">
              {SETTINGS_NAV.map((item) => (
                <button
                  key={item.name}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-bold text-zinc-500 hover:text-zinc-200 hover:bg-zinc-900/40 transition-all"
                >
                  <item.icon className="h-4 w-4 flex-shrink-0 text-zinc-700" />
                  {item.name}
                </button>
              ))}
            </div>
          </div>
        </nav>

        {/* Footer */}
        <div className="px-3 py-3 border-t border-zinc-800/40 flex-shrink-0">
          <div className="flex items-center gap-1">
            <button className="flex-1 flex items-center gap-2 px-3 py-2 rounded-xl text-zinc-500 hover:text-white hover:bg-zinc-900/40 transition-all text-[12px] font-bold">
              <HelpCircle className="h-4 w-4" /> Support
            </button>
            <button
              onClick={logout}
              className="p-2 rounded-xl text-zinc-600 hover:text-rose-400 hover:bg-rose-500/10 transition-all"
              title="Sign out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* ─── MAIN AREA ─── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Header */}
        <header className="h-[68px] flex-shrink-0 border-b border-zinc-800/50 flex items-center justify-between px-8 bg-black/80 backdrop-blur-xl">
          <div className="flex items-center gap-2 text-[14px] font-bold">
            <span className="text-zinc-600">Projects</span>
            <span className="text-zinc-800 mx-1">/</span>
            <span className="text-white capitalize">
              {router.pathname === '/dashboard'      ? 'Overview'
               : router.pathname === '/deployments'  ? 'Deployments'
               : router.pathname === '/logs'         ? 'Logs'
               : router.pathname === '/monitoring'   ? 'Monitoring'
               : router.pathname.startsWith('/apps/') ? 'Project'
               : 'Console'}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 px-3 py-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-300">
              <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[12px] font-black uppercase tracking-[0.18em]">Signed in</span>
              <span className="text-[12px] font-semibold text-white/90 max-w-[160px] truncate">{user?.email || user?.username || 'User'}</span>
            </div>
            <div className="relative hidden lg:block">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-700" />
              <input
                type="text"
                placeholder="Search..."
                className="w-52 pl-10 pr-4 py-2 bg-zinc-900/50 border border-zinc-800 rounded-xl text-[13px] outline-none focus:border-zinc-600 transition-all text-white placeholder:text-zinc-700 font-medium"
              />
            </div>
            <button className="h-9 w-9 flex items-center justify-center rounded-xl bg-zinc-900/50 border border-zinc-800 text-zinc-500 hover:text-white transition-all">
              <Bell className="h-4 w-4" />
            </button>
            <Link href="/apps/new">
              <button className="flex items-center gap-2 px-4 h-9 bg-white text-black text-[13px] font-bold rounded-xl hover:bg-zinc-100 transition-all active:scale-95 shadow-lg shadow-white/5">
                <Plus className="h-4 w-4" /> Deploy
              </button>
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto scrollbar-hide bg-black">
          <div className="max-w-[1280px] mx-auto px-8 py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}