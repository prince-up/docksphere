import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useApi, apiEndpoints } from '@/lib/api';
import {
  ArrowLeft, ExternalLink, RefreshCw, Square, Trash2,
  Github, Globe, Clock, Terminal, Activity, Cpu, MemoryStick,
  CheckCircle2, AlertCircle, Loader2, GitBranch, Zap, Copy, Check
} from 'lucide-react';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

interface App {
  id: string;
  name: string;
  status: string;
  github_repo_url: string;
  github_branch?: string;
  created_at: string;
  last_deployment?: string;
  domain?: string;
  exposed_port?: number;
  build_logs?: Array<{ level: string; message: string; timestamp: string }>;
}

const STATUS_CONFIG: Record<string, { color: string; bg: string; icon: typeof CheckCircle2; pulse: boolean }> = {
  Running: { color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20', icon: CheckCircle2, pulse: true },
  Building: { color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20', icon: Loader2, pulse: true },
  Error:    { color: 'text-rose-400',   bg: 'bg-rose-500/10 border-rose-500/20',     icon: AlertCircle, pulse: false },
  Stopped:  { color: 'text-zinc-400',   bg: 'bg-zinc-500/10 border-zinc-500/20',     icon: Square, pulse: false },
};

export default function AppDetail() {
  const router = useRouter();
  const { id } = router.query;
  const { get, post, delete: del } = useApi();
  const [app, setApp] = useState<App | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState('');
  const [activeTab, setActiveTab] = useState<'logs' | 'metrics' | 'settings'>('logs');
  const [metrics, setMetrics] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const logsEndRef = useRef<HTMLDivElement>(null);
  const pollRef = useRef<NodeJS.Timeout>();

  const fetchApp = async () => {
    if (!id) return;
    try {
      const res = await get(apiEndpoints.apps.get(id as string));
      setApp(res.data);
    } catch {
      toast.error('Failed to load project');
    } finally {
      setLoading(false);
    }
  };

  const fetchMetrics = async () => {
    if (!id || !app) return;
    try {
      const res = await get(apiEndpoints.apps.metrics(id as string));
      setMetrics(res.data);
    } catch {}
  };

  useEffect(() => {
    fetchApp();
    // Poll every 5s if building
    pollRef.current = setInterval(() => {
      fetchApp();
      fetchMetrics();
    }, 5000);
    return () => clearInterval(pollRef.current);
  }, [id]);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [app?.build_logs]);

  const handleAction = async (action: 'deploy' | 'restart' | 'stop' | 'delete') => {
    if (!id) return;
    setActionLoading(action);
    try {
      if (action === 'delete') {
        await del(apiEndpoints.apps.delete(id as string));
        toast.success('Project deleted');
        router.push('/dashboard');
        return;
      }
      const endpoint = action === 'deploy' ? apiEndpoints.apps.deploy(id as string)
        : action === 'restart' ? apiEndpoints.apps.restart(id as string)
        : apiEndpoints.apps.stop(id as string);
      await post(endpoint);
      toast.success(`${action.charAt(0).toUpperCase() + action.slice(1)} triggered`);
      fetchApp();
    } catch {
      toast.error(`Action failed: ${action}`);
    } finally {
      setActionLoading('');
    }
  };

  const copyUrl = () => {
    const url = app?.domain || `localhost:${app?.exposed_port}`;
    navigator.clipboard.writeText(`https://${url}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="h-8 w-8 border-2 border-zinc-800 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!app) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <AlertCircle className="h-12 w-12 text-zinc-700" />
        <p className="text-zinc-500 font-bold">Project not found</p>
        <Link href="/dashboard" className="text-indigo-400 hover:text-indigo-300 text-[14px] font-bold">
          ← Back to Dashboard
        </Link>
      </div>
    );
  }

  const status = STATUS_CONFIG[app.status] || STATUS_CONFIG.Stopped;
  const StatusIcon = status.icon;
  const liveUrl = app.domain ? `https://${app.domain}` : app.exposed_port ? `http://localhost:${app.exposed_port}` : null;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-6 flex-wrap">
        <div className="flex items-center gap-5">
          <Link href="/dashboard" className="h-9 w-9 flex items-center justify-center rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-500 hover:text-white hover:bg-zinc-800 transition-all">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div className="h-12 w-12 rounded-2xl bg-white flex items-center justify-center text-xl font-black text-black shadow-xl shadow-white/5">
            {app.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-white">{app.name}</h1>
            <div className="flex items-center gap-3 mt-1">
              <a href={app.github_repo_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-[12px] font-bold text-zinc-500 hover:text-white transition-colors">
                <Github className="h-3.5 w-3.5" />
                {app.github_repo_url.replace('https://github.com/', '')}
              </a>
              <span className="text-zinc-800">·</span>
              <div className="flex items-center gap-1.5 text-[12px] font-bold text-zinc-500">
                <GitBranch className="h-3.5 w-3.5" />
                {app.github_branch || 'main'}
              </div>
            </div>
          </div>
        </div>

        {/* Status Badge + Actions */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className={cn('flex items-center gap-2 px-4 py-2 rounded-xl border text-[13px] font-bold', status.bg, status.color)}>
            <StatusIcon className={cn('h-4 w-4', app.status === 'Building' && 'animate-spin')} />
            {app.status}
            {status.pulse && <div className="h-2 w-2 rounded-full bg-current animate-pulse" />}
          </div>

          <button
            onClick={() => handleAction('deploy')}
            disabled={!!actionLoading}
            className="flex items-center gap-2 px-4 h-9 bg-indigo-600 hover:bg-indigo-500 text-white text-[13px] font-bold rounded-xl transition-all disabled:opacity-50 active:scale-95"
          >
            {actionLoading === 'deploy' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
            Redeploy
          </button>
          <button
            onClick={() => handleAction('restart')}
            disabled={!!actionLoading}
            className="flex items-center gap-2 px-4 h-9 bg-zinc-900 border border-zinc-700 text-zinc-300 hover:text-white text-[13px] font-bold rounded-xl transition-all disabled:opacity-50"
          >
            {actionLoading === 'restart' ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            Restart
          </button>
          <button
            onClick={() => handleAction('stop')}
            disabled={!!actionLoading}
            className="flex items-center gap-2 px-4 h-9 bg-zinc-900 border border-zinc-700 text-zinc-400 hover:text-white text-[13px] font-bold rounded-xl transition-all disabled:opacity-50"
          >
            {actionLoading === 'stop' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Square className="h-4 w-4" />}
            Stop
          </button>
          <button
            onClick={() => { if (confirm('Delete this project?')) handleAction('delete'); }}
            className="h-9 w-9 flex items-center justify-center bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:text-rose-300 hover:bg-rose-500/20 rounded-xl transition-all"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* ── Live URL Card ── */}
      {liveUrl && (
        <div className="bg-zinc-900/30 border border-zinc-800 rounded-2xl p-5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-8 w-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center flex-shrink-0">
              <Globe className="h-4 w-4 text-emerald-400" />
            </div>
            <div>
              <p className="text-[11px] font-black uppercase tracking-widest text-zinc-600 mb-0.5">Live URL</p>
              <p className="text-[14px] font-bold text-emerald-400 truncate">{liveUrl}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button onClick={copyUrl} className="flex items-center gap-2 px-3 h-8 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white text-[12px] font-bold transition-all">
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
            <a href={liveUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-3 h-8 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white text-[12px] font-bold transition-all">
              <ExternalLink className="h-3.5 w-3.5" /> Open
            </a>
          </div>
        </div>
      )}

      {/* ── Metrics Strip ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'CPU Usage', value: metrics ? `${metrics.cpu_percent}%` : '—', icon: Cpu, color: 'text-indigo-400' },
          { label: 'Memory', value: metrics ? `${metrics.memory_mb} MB` : '—', icon: MemoryStick, color: 'text-purple-400' },
          { label: 'Status', value: app.status, icon: Activity, color: status.color },
          { label: 'Last Deploy', value: app.last_deployment ? new Date(app.last_deployment).toLocaleDateString() : 'Never', icon: Clock, color: 'text-zinc-400' },
        ].map((m) => (
          <div key={m.label} className="bg-zinc-900/20 border border-zinc-800 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <m.icon className={cn('h-4 w-4', m.color)} />
              <span className="text-[11px] font-black uppercase tracking-widest text-zinc-600">{m.label}</span>
            </div>
            <p className="text-xl font-black text-white">{m.value}</p>
          </div>
        ))}
      </div>

      {/* ── Tabs ── */}
      <div>
        <div className="flex items-center gap-1 border-b border-zinc-800 mb-6">
          {(['logs', 'metrics', 'settings'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                'px-5 py-3 text-[13px] font-bold capitalize border-b-2 transition-all',
                activeTab === tab
                  ? 'border-white text-white'
                  : 'border-transparent text-zinc-500 hover:text-zinc-300'
              )}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Logs Tab */}
        {activeTab === 'logs' && (
          <div className="bg-black border border-zinc-800 rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-zinc-800 bg-zinc-950 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex gap-2">
                  <div className="h-3 w-3 rounded-full bg-rose-500/50" />
                  <div className="h-3 w-3 rounded-full bg-amber-500/50" />
                  <div className="h-3 w-3 rounded-full bg-emerald-500/50" />
                </div>
                <span className="text-[12px] font-black uppercase tracking-widest text-zinc-600">Build Log</span>
              </div>
              <div className="flex items-center gap-2">
                {app.status === 'Building' && (
                  <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-amber-500">
                    <div className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                    Live
                  </div>
                )}
              </div>
            </div>
            <div className="p-6 font-mono text-[13px] leading-relaxed min-h-[350px] max-h-[500px] overflow-y-auto">
              {app.build_logs && app.build_logs.length > 0 ? (
                <div className="space-y-1">
                  {app.build_logs.map((log, i) => (
                    <div key={i} className="flex gap-4 group hover:bg-zinc-900/30 px-2 py-0.5 rounded transition-colors">
                      <span className="text-zinc-800 text-[11px] flex-shrink-0 mt-0.5 font-bold">
                        {new Date(log.timestamp || Date.now()).toLocaleTimeString('en-US', { hour12: false })}
                      </span>
                      <span className={cn('flex-1', 
                        log.level === 'ERROR' ? 'text-rose-400' 
                        : log.level === 'WARN' ? 'text-amber-400' 
                        : 'text-zinc-300'
                      )}>
                        {log.message}
                      </span>
                    </div>
                  ))}
                  <div ref={logsEndRef} />
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-48 text-center space-y-3">
                  <Terminal className="h-10 w-10 text-zinc-800" />
                  <p className="text-zinc-600 font-bold text-[14px]">No logs yet</p>
                  <p className="text-zinc-700 text-[12px]">Logs will appear here once a deployment starts.</p>
                </div>
              )}
              {app.status === 'Building' && (
                <div className="flex items-center gap-3 mt-4 animate-pulse">
                  <div className="h-2 w-2 rounded-full bg-indigo-500" />
                  <span className="text-indigo-500/60 text-[12px] font-bold italic">Streaming build output...</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Metrics Tab */}
        {activeTab === 'metrics' && (
          <div className="bg-zinc-900/20 border border-zinc-800 rounded-2xl p-8 text-center space-y-4">
            <Activity className="h-12 w-12 text-zinc-700 mx-auto" />
            <p className="text-white font-black text-[18px]">Real-time Metrics</p>
            <p className="text-zinc-500 font-medium text-[14px] max-w-sm mx-auto">
              Connect Prometheus + Grafana for live CPU, memory, and network monitoring.
            </p>
            <a href="http://localhost:3001" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-6 py-3 bg-zinc-800 border border-zinc-700 text-white text-[13px] font-bold rounded-xl hover:bg-zinc-700 transition-all">
              <ExternalLink className="h-4 w-4" /> Open Grafana Dashboard
            </a>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="space-y-4">
            {[
              { label: 'Project Name', value: app.name },
              { label: 'Repository URL', value: app.github_repo_url },
              { label: 'Branch', value: app.github_branch || 'main' },
              { label: 'Created', value: new Date(app.created_at).toLocaleString() },
            ].map((s) => (
              <div key={s.label} className="flex items-center justify-between px-6 py-4 bg-zinc-900/20 border border-zinc-800 rounded-2xl">
                <span className="text-[13px] font-black uppercase tracking-widest text-zinc-500">{s.label}</span>
                <span className="text-[14px] font-bold text-white">{s.value}</span>
              </div>
            ))}
            <div className="pt-4">
              <button
                onClick={() => { if (confirm('Delete this project permanently?')) handleAction('delete'); }}
                className="flex items-center gap-2 px-5 py-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:text-rose-300 hover:bg-rose-500/20 text-[13px] font-bold rounded-xl transition-all"
              >
                <Trash2 className="h-4 w-4" /> Delete Project
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
