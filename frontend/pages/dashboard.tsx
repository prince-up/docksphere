import React, { useEffect, useState } from 'react';
import { useApi, apiEndpoints } from '@/lib/api';
import {
  Github, Clock, MoreVertical, GitBranch,
  Plus, CheckCircle2, Info, ChevronDown,
  Globe, Rocket, RefreshCw, Zap, Activity,
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface Application {
  id: string;
  name: string;
  status: string;
  github_repo_url: string;
  created_at: string;
  last_deployment?: string;
  domain?: string;
}

function timeAgo(dateStr: string) {
  try {
    const diff = Date.now() - new Date(dateStr).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1) return 'just now';
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
  } catch { return '—'; }
}

export default function Dashboard() {
  const [apps, setApps] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const { get } = useApi();

  const fetchApps = async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await get(apiEndpoints.apps.list);
      setApps(res.data?.items || res.data || []);
    } catch {
      // Backend may not be running — show empty state gracefully
      setError(false); // Don't show error, just empty
      setApps([]);
    } finally {
      setLoading(false);
    }
  };

  // Only run once on mount — `get` is now stable so this is safe
  useEffect(() => { fetchApps(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const running = apps.filter(a => a.status === 'Running').length;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-16">

      {/* ── Page Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white">Overview</h1>
          <p className="text-zinc-500 text-[14px] font-medium mt-1">
            {loading ? 'Loading your projects...' : `${apps.length} project${apps.length !== 1 ? 's' : ''} · ${running} running`}
          </p>
        </div>
        <Link href="/apps/new">
          <button className="flex items-center gap-2 px-5 h-10 bg-white text-black text-[13px] font-bold rounded-xl hover:bg-zinc-100 transition-all active:scale-95 shadow-lg">
            <Plus className="h-4 w-4" /> New Project
          </button>
        </Link>
      </div>

      {/* ── Stats Strip ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Projects', value: loading ? '—' : String(apps.length), icon: Rocket, color: 'text-indigo-400' },
          { label: 'Running',        value: loading ? '—' : String(running),      icon: Activity, color: 'text-emerald-400' },
          { label: 'Deployments',    value: '—',   icon: Zap,        color: 'text-amber-400' },
          { label: 'Bandwidth',      value: '0.4 GB', icon: Globe,   color: 'text-purple-400' },
        ].map((stat) => (
          <div key={stat.label} className="bg-zinc-900/20 border border-zinc-800/60 rounded-2xl p-5 hover:bg-zinc-900/40 transition-colors">
            <div className="flex items-center gap-2 mb-3">
              <stat.icon className={cn('h-4 w-4', stat.color)} />
              <span className="text-[11px] font-black uppercase tracking-[0.2em] text-zinc-600">{stat.label}</span>
            </div>
            <p className="text-2xl font-black text-white">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* ── Main Content ── */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8">

        {/* Projects List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-[15px] font-black text-white uppercase tracking-tighter">Projects</h2>
            <div className="flex items-center gap-2">
              {!loading && (
                <button
                  onClick={fetchApps}
                  className="h-8 w-8 flex items-center justify-center rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-500 hover:text-white transition-all"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                </button>
              )}
              <span className="text-[11px] font-black text-zinc-700 bg-zinc-900 border border-zinc-800 px-3 py-1 rounded-lg uppercase tracking-widest">
                {running} Online
              </span>
            </div>
          </div>

          {/* Loading Skeleton */}
          {loading && (
            <div className="space-y-3">
              {[1, 2, 3].map((n) => (
                <div key={n} className="h-[88px] bg-zinc-900/30 rounded-2xl border border-zinc-800/40 animate-pulse" />
              ))}
            </div>
          )}

          {/* Apps List */}
          {!loading && apps.length > 0 && (
            <div className="space-y-3">
              {apps.map((app) => (
                <Link key={app.id} href={`/apps/${app.id}`}>
                  <div className="group bg-zinc-900/10 border border-zinc-800/60 rounded-2xl hover:bg-zinc-900/30 hover:border-zinc-700 transition-all cursor-pointer">
                    <div className="p-5 flex items-center gap-5">

                      {/* Icon */}
                      <div className="h-12 w-12 rounded-xl bg-white flex items-center justify-center text-[18px] font-black text-black group-hover:scale-105 transition-transform duration-300 flex-shrink-0 shadow-lg shadow-white/5">
                        {app.name.charAt(0).toUpperCase()}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-[15px] font-bold text-white truncate group-hover:text-indigo-400 transition-colors">
                          {app.name}
                        </p>
                        <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                          <span className="flex items-center gap-1.5 text-[12px] font-bold text-zinc-600">
                            <Globe className="h-3 w-3 text-indigo-500" />
                            {app.name.toLowerCase()}.docksphere.dev
                          </span>
                          <span className="text-zinc-800">·</span>
                          <span className="flex items-center gap-1 text-[12px] font-bold text-zinc-600">
                            <GitBranch className="h-3 w-3" /> main
                          </span>
                          <span className="text-zinc-800">·</span>
                          <span className="text-[12px] font-bold text-zinc-600">
                            {timeAgo(app.last_deployment || app.created_at)}
                          </span>
                        </div>
                      </div>

                      {/* GitHub */}
                      <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black/40 border border-zinc-800 text-zinc-500">
                        <Github className="h-3.5 w-3.5" />
                        <span className="text-[11px] font-bold truncate max-w-[100px]">
                          {app.github_repo_url?.split('/').pop() || 'repo'}
                        </span>
                      </div>

                      {/* Status */}
                      <div className="flex items-center gap-3 pl-3 flex-shrink-0">
                        <div className={cn(
                          'relative h-9 w-9 rounded-full flex items-center justify-center border-2',
                          app.status === 'Running'
                            ? 'border-emerald-500/20 text-emerald-500 bg-emerald-500/5'
                            : 'border-zinc-700 text-zinc-500 bg-zinc-900/50'
                        )}>
                          {app.status === 'Running' && (
                            <div className="absolute inset-0 rounded-full bg-emerald-500/10 animate-ping" />
                          )}
                          <CheckCircle2 className="h-4 w-4" />
                        </div>
                        <MoreVertical className="h-4 w-4 text-zinc-700 hover:text-white transition-colors" />
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* Empty State */}
          {!loading && apps.length === 0 && (
            <div className="py-20 flex flex-col items-center justify-center text-center space-y-6 border border-dashed border-zinc-800 rounded-2xl">
              <div className="h-16 w-16 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center">
                <Rocket className="h-8 w-8 text-zinc-700" />
              </div>
              <div className="space-y-2">
                <p className="text-[18px] font-black text-white">No projects yet</p>
                <p className="text-[14px] text-zinc-500 max-w-xs mx-auto leading-relaxed">
                  Import a GitHub repository and deploy your first app in seconds.
                </p>
              </div>
              <Link href="/apps/new">
                <button className="flex items-center gap-2 px-6 py-3 bg-white text-black text-[13px] font-bold rounded-xl hover:bg-zinc-100 transition-all shadow-xl">
                  <Plus className="h-4 w-4" /> Deploy First Project
                </button>
              </Link>
            </div>
          )}
        </div>

        {/* Right Sidebar: Stats & Alerts */}
        <div className="space-y-5">

          {/* Resource Usage */}
          <div className="bg-zinc-900/20 border border-zinc-800/60 rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-zinc-800/50 flex items-center justify-between bg-zinc-900/30">
              <p className="text-[13px] font-bold text-white">Resource Usage</p>
              <button className="px-3 py-1 bg-white text-black text-[11px] font-black rounded-lg hover:bg-zinc-200 transition-all uppercase tracking-widest">
                Upgrade
              </button>
            </div>
            <div className="p-5 space-y-5">
              {[
                { label: 'Image Assets',    value: '15 / 5K',          pct: 0.3 },
                { label: 'Edge Requests',   value: '1.2k / 1M',        pct: 0.12 },
                { label: 'Bandwidth',       value: '0.4 GB / 100 GB',  pct: 0.4 },
              ].map((s) => (
                <div key={s.label} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[12px] font-bold text-zinc-500">{s.label}</span>
                    <span className="text-[12px] font-bold text-white font-mono">{s.value}</span>
                  </div>
                  <div className="h-1.5 bg-zinc-900 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-500 rounded-full"
                      style={{ width: `${s.pct * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Activity */}
          <div className="bg-zinc-900/20 border border-zinc-800/60 rounded-2xl p-5 space-y-4">
            <p className="text-[13px] font-bold text-white">System Status</p>
            {[
              { name: 'Build Pipeline', status: 'Operational' },
              { name: 'Container Engine', status: 'Operational' },
              { name: 'Edge Network', status: 'Operational' },
            ].map((s) => (
              <div key={s.name} className="flex items-center justify-between">
                <span className="text-[12px] font-bold text-zinc-500">{s.name}</span>
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-400">
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  {s.status}
                </div>
              </div>
            ))}
          </div>

          {/* Quick Deploy CTA */}
          <div className="bg-indigo-500/5 border border-indigo-500/20 rounded-2xl p-5 space-y-3">
            <p className="text-[13px] font-black text-white">Deploy in one click</p>
            <p className="text-[12px] text-zinc-500 leading-relaxed">
              Connect GitHub and deploy any repo automatically.
            </p>
            <Link href="/apps/new">
              <button className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-[12px] font-bold rounded-xl transition-all mt-1">
                Import Repository →
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}