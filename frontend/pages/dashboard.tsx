import React, { useEffect, useState } from 'react';
import { useApi, apiEndpoints } from '@/lib/api';
import { Badge } from '@/components/ui/Badge';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { 
  Github, 
  ExternalLink, 
  Clock, 
  MoreVertical, 
  GitBranch,
  Search,
  Plus,
  ArrowUpRight,
  Filter,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Info,
  ChevronDown
} from 'lucide-react';
import Link from 'next/link';
import { formatDate, cn } from '@/lib/utils';

interface Application {
  id: string;
  name: string;
  status: string;
  github_repo_url: string;
  created_at: string;
  last_deployment?: string;
  domain?: string;
}

export default function Dashboard() {
  const [apps, setApps] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const { get } = useApi();

  useEffect(() => {
    setMounted(true);
    const fetchApps = async () => {
      try {
        const response = await get(apiEndpoints.apps.list);
        setApps(response.data.items || []);
      } catch (error) {
        console.error('Failed to fetch apps:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchApps();
  }, [get]);

  if (!mounted) return null;

  return (
    <div className="space-y-12 animate-in fade-in duration-500 bg-[#000] text-zinc-100 pb-20">
      <div className="grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-12">
        
        {/* Left Column: Usage & Alerts - Larger Text */}
        <div className="space-y-12">
          <div className="space-y-6">
            <h3 className="text-[16px] font-black uppercase tracking-[0.2em] text-zinc-400">Resource Usage</h3>
            <div className="bg-zinc-900/30 border border-zinc-800 rounded-2xl overflow-hidden backdrop-blur-sm">
              <div className="p-6 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/40">
                <p className="text-[15px] font-bold text-zinc-100 italic">Global Stats</p>
                <button className="px-4 py-1.5 bg-white text-black text-[12px] font-black rounded-lg hover:bg-zinc-200 transition-all uppercase tracking-widest shadow-xl shadow-white/5">Upgrade</button>
              </div>
              <div className="p-8 space-y-6">
                {[
                  { label: 'Image Assets', value: '15 / 5K', info: true },
                  { label: 'Edge Network', value: '1.2k / 1M', info: true },
                  { label: 'Cloud Bandwidth', value: '0.4 GB / 100 GB', info: false },
                ].map((stat, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-[14px] text-zinc-400 font-semibold">
                      <div className="h-5 w-5 rounded-full border-2 border-zinc-800 flex items-center justify-center">
                         <div className="h-1.5 w-1.5 rounded-full bg-zinc-700" />
                      </div>
                      {stat.label}
                      {stat.info && <Info className="h-3.5 w-3.5 text-zinc-600" />}
                    </div>
                    <span className="text-zinc-100 font-mono text-[14px] font-bold">{stat.value}</span>
                  </div>
                ))}
              </div>
              <div className="p-3 flex justify-center border-t border-zinc-800 bg-zinc-900/20">
                <ChevronDown className="h-5 w-5 text-zinc-700" />
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-[16px] font-black uppercase tracking-[0.2em] text-zinc-400">System Alerts</h3>
            <div className="bg-zinc-900/20 border border-zinc-800 rounded-2xl p-12 flex flex-col items-center text-center space-y-6">
               <div className="space-y-3">
                  <p className="text-[18px] font-black text-white italic tracking-tight">Active Monitoring</p>
                  <p className="text-[14px] text-zinc-500 max-w-[280px] leading-relaxed font-medium">Automatic anomaly detection for all your active services.</p>
               </div>
               <button className="w-full py-3 border-2 border-zinc-800 rounded-xl text-[12px] font-black text-white hover:bg-zinc-900 hover:border-zinc-700 transition-all uppercase tracking-widest">
                  Enable Pro Guard
               </button>
            </div>
          </div>
        </div>

        {/* Right Column: Projects List - Larger Text */}
        <div className="space-y-8">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-[18px] font-black text-white uppercase tracking-tighter italic">Active Projects</h3>
            <span className="text-[12px] font-black text-zinc-700 bg-zinc-900 px-3 py-1 rounded-md uppercase tracking-widest">{apps.length} Online</span>
          </div>

          {loading ? (
            <div className="space-y-6">
              {[1, 2, 3].map((n) => (
                <div key={n} className="h-32 bg-zinc-900/30 rounded-2xl border border-zinc-800 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="space-y-6">
              {apps.map((app) => (
                <div key={app.id} className="group bg-zinc-900/10 border border-zinc-800/80 rounded-2xl hover:bg-zinc-900/30 hover:border-zinc-600 transition-all overflow-hidden cursor-pointer backdrop-blur-sm">
                   <Link href={`/apps/${app.id}`}>
                      <div className="p-8 flex items-center gap-8">
                        {/* Project Logo/Icon */}
                        <div className="h-14 w-14 rounded-2xl bg-white flex items-center justify-center text-[22px] font-black text-black group-hover:scale-110 transition-transform duration-300 shadow-2xl shadow-white/5">
                          {app.name.charAt(0).toUpperCase()}
                        </div>

                        {/* Project Name & Link */}
                        <div className="flex-1 min-w-0">
                           <h4 className="text-[18px] font-black text-white truncate tracking-tight group-hover:text-indigo-400 transition-colors">{app.name}</h4>
                           <div className="flex items-center gap-2 mt-2">
                              <Globe className="h-3.5 w-3.5 text-indigo-500" />
                              <p className="text-[14px] text-zinc-500 font-bold truncate group-hover:text-zinc-400 transition-colors">
                                 {app.name.toLowerCase()}.docksphere.dev
                              </p>
                           </div>
                        </div>

                        {/* Commit Info */}
                        <div className="hidden md:block flex-1 min-w-0 px-4">
                           <p className="text-[14px] font-bold text-zinc-300 truncate">Production build DS-492a successful</p>
                           <div className="flex items-center gap-3 mt-2">
                              <span className="text-[12px] text-zinc-600 font-bold uppercase tracking-widest">{formatDate(app.last_deployment || app.created_at)}</span>
                              <div className="h-1 w-1 rounded-full bg-zinc-800" />
                              <span className="flex items-center gap-1.5 text-[12px] text-zinc-500 font-mono font-bold">
                                 <GitBranch className="h-3.5 w-3.5" />
                                 main
                              </span>
                           </div>
                        </div>

                        {/* Repo Info */}
                        <div className="hidden lg:flex items-center gap-3 text-zinc-500 group-hover:text-zinc-200 transition-all border border-zinc-800 bg-black/40 px-4 py-2 rounded-xl">
                           <Github className="h-5 w-5 text-zinc-600" />
                           <span className="text-[13px] font-black truncate max-w-[150px] uppercase tracking-widest">{app.github_repo_url.split('/').pop()}</span>
                        </div>

                        {/* Status & Actions */}
                        <div className="flex items-center gap-8 pl-4">
                           <div className={cn(
                              'h-10 w-10 rounded-full flex items-center justify-center border-2 transition-all',
                              app.status === 'Running' 
                                ? 'border-emerald-500/20 text-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.2)] bg-emerald-500/5' 
                                : 'border-amber-500/20 text-amber-500 bg-amber-500/5'
                           )}>
                              <CheckCircle2 className="h-5 w-5" />
                           </div>
                           <MoreVertical className="h-5 w-5 text-zinc-800 hover:text-white transition-colors" />
                        </div>
                      </div>
                   </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}