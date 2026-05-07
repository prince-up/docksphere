import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useApi, apiEndpoints } from '@/lib/api';
import { Badge } from '@/components/ui/Badge';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { 
  Rocket, 
  Settings, 
  Github, 
  ExternalLink, 
  Clock, 
  Activity, 
  Terminal as TerminalIcon, 
  Cpu, 
  Database,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Globe,
  GitBranch,
  Box,
  Copy,
  ChevronDown
} from 'lucide-react';
import Link from 'next/link';
import { formatDate, cn } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function AppDetails() {
  const router = useRouter();
  const { id } = router.query;
  const [app, setApp] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [deploying, setDeploying] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [mounted, setMounted] = useState(false);
  const { get, post } = useApi();

  useEffect(() => {
    setMounted(true);
    if (!id) return;

    const fetchApp = async () => {
      try {
        const response = await get(apiEndpoints.apps.get(id as string));
        setApp(response.data);
      } catch (error) {
        console.error('Failed to fetch app:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchApp();
  }, [id, get]);

  const handleDeploy = async () => {
    setDeploying(true);
    try {
      await post(apiEndpoints.apps.deploy(id as string));
      toast.success('Deployment triggered successfully!');
      const response = await get(apiEndpoints.apps.get(id as string));
      setApp(response.data);
    } catch (error) {
      toast.error('Deployment failed to trigger');
    } finally {
      setTimeout(() => setDeploying(false), 2000);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  if (!mounted) return null;
  if (loading) return <div className="flex items-center justify-center h-screen bg-black"><div className="h-10 w-10 border-4 border-zinc-800 border-t-white rounded-full animate-spin" /></div>;
  if (!app) return <div className="text-center p-20 bg-black text-white"><h2 className="text-2xl font-black">App not found</h2></div>;

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-1000 bg-black text-white min-h-screen">
      {/* Dark Navigation Header */}
      <div className="sticky top-0 z-30 bg-black/60 backdrop-blur-2xl border-b border-zinc-800 -mx-8 px-8 py-8 flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div className="flex items-center gap-8">
          <div className="h-20 w-20 rounded-[2rem] bg-white flex items-center justify-center text-black text-3xl font-black shadow-[0_0_50px_-10px_rgba(255,255,255,0.3)]">
            {app.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-4">
              <h1 className="text-4xl font-black tracking-tighter text-white italic">{app.name}</h1>
              <Badge variant={app.status === 'Running' ? 'success' : 'warning'} className="rounded-full px-4 py-1 uppercase tracking-[0.2em] text-[10px] font-black bg-zinc-900 border border-zinc-800 text-zinc-400">
                <span className={cn('h-1.5 w-1.5 rounded-full mr-2 inline-block', app.status === 'Running' ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)] animate-pulse' : 'bg-amber-500')} />
                {app.status}
              </Badge>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-6 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">
              <span className="flex items-center gap-2 bg-zinc-900 px-3 py-1.5 rounded-lg border border-zinc-800 text-zinc-300">
                <GitBranch className="h-4 w-4" />
                main
              </span>
              <span className="flex items-center gap-2">
                 <Clock className="h-4 w-4" />
                 Deployed {formatDate(app.last_deployment || app.created_at)}
              </span>
              <span className="flex items-center gap-2 text-indigo-400">
                 <Globe className="h-4 w-4" />
                 {app.name.toLowerCase()}.docksphere.dev
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Button variant="outline" className="rounded-2xl border-zinc-800 px-8 font-black h-14 text-[10px] uppercase tracking-widest bg-zinc-900 text-white hover:bg-zinc-800 hover:border-zinc-700 transition-all">
             <ExternalLink className="h-5 w-5 mr-2" />
             Visit Site
          </Button>
          <Button onClick={handleDeploy} disabled={deploying} className="rounded-2xl px-12 font-black h-14 bg-white text-black hover:bg-zinc-200 shadow-[0_0_30px_-5px_rgba(255,255,255,0.2)] active:scale-95 transition-all uppercase tracking-widest text-[10px]">
            {deploying ? (
              <div className="flex items-center gap-2">
                <div className="h-5 w-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                Running...
              </div>
            ) : (
              <>
                <Rocket className="h-5 w-5 mr-2" />
                Redeploy
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Tabs - Glass Dark */}
      <div className="flex items-center gap-12 border-b border-zinc-900 relative">
        {[
          { id: 'overview', label: 'Dashboard' },
          { id: 'logs', label: 'Build Logs' },
          { id: 'metrics', label: 'Resource Monitor' },
          { id: 'settings', label: 'App Settings' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'pb-6 text-[10px] font-black uppercase tracking-[0.3em] transition-all relative',
              activeTab === tab.id 
                ? 'text-white' 
                : 'text-zinc-600 hover:text-zinc-400'
            )}
          >
            {tab.label}
            {activeTab === tab.id && (
               <div className="absolute bottom-0 left-0 right-0 h-1 bg-white shadow-[0_-4px_12px_rgba(255,255,255,0.5)] rounded-t-full" />
            )}
          </button>
        ))}
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-12">
        <div className="space-y-12">
          {activeTab === 'overview' && (
            <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
               {/* URL & Endpoint Card */}
               <div className="bg-zinc-900/30 border border-zinc-800 rounded-[3rem] p-10 flex flex-col md:flex-row md:items-center justify-between gap-8 group hover:border-zinc-700 transition-all backdrop-blur-sm">
                  <div className="flex items-center gap-6">
                     <div className="h-16 w-16 rounded-3xl bg-zinc-800 flex items-center justify-center border border-zinc-700 shadow-2xl group-hover:bg-white group-hover:text-black transition-all">
                        <Globe className="h-8 w-8 text-indigo-400 group-hover:text-black" />
                     </div>
                     <div>
                        <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-2">Production Deployment</p>
                        <a href={`https://${app.name.toLowerCase()}.docksphere.dev`} target="_blank" rel="noreferrer" className="text-xl font-black text-white hover:text-indigo-400 transition-colors flex items-center gap-3 tracking-tight">
                           {app.name.toLowerCase()}.docksphere.dev
                           <ExternalLink className="h-5 w-5" />
                        </a>
                     </div>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => copyToClipboard(`${app.name.toLowerCase()}.docksphere.dev`)} className="rounded-xl border-zinc-800 text-[10px] font-black uppercase tracking-widest gap-2 bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700">
                     <Copy className="h-4 w-4" />
                     Copy URL
                  </Button>
               </div>

               {/* Metrics Bento */}
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="bg-zinc-900/40 border border-zinc-800 rounded-[3rem] p-10 space-y-8 hover:bg-zinc-900/60 hover:border-zinc-700 transition-all duration-500 relative overflow-hidden group">
                     <div className="flex items-center justify-between">
                        <h4 className="font-black text-white flex items-center gap-3 text-[11px] uppercase tracking-widest">
                           <Cpu className="h-5 w-5 text-indigo-500" />
                           Core CPU Load
                        </h4>
                        <span className="text-[9px] font-black text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-full uppercase tracking-[0.2em]">Live Stream</span>
                     </div>
                     <div className="h-32 flex items-end gap-1.5 px-1 relative z-10">
                        {[30, 45, 32, 67, 54, 34, 45, 89, 76, 54, 43, 34, 56, 45, 32, 23, 45, 34, 21, 45, 67, 89, 45, 32].map((h, i) => (
                          <div key={i} className="flex-1 bg-zinc-800 rounded-full hover:bg-indigo-500 transition-all cursor-help relative group/bar" style={{ height: `${h}%` }}>
                             <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-white text-black px-2 py-1 rounded text-[9px] font-black opacity-0 group-hover/bar:opacity-100 transition-opacity">{h}%</div>
                          </div>
                        ))}
                     </div>
                  </div>
                  <div className="bg-zinc-900/40 border border-zinc-800 rounded-[3rem] p-10 space-y-8 hover:bg-zinc-900/60 hover:border-zinc-700 transition-all duration-500 relative overflow-hidden group">
                     <div className="flex items-center justify-between">
                        <h4 className="font-black text-white flex items-center gap-3 text-[11px] uppercase tracking-widest">
                           <Database className="h-5 w-5 text-emerald-500" />
                           Cluster Memory
                        </h4>
                        <span className="text-[9px] font-black text-zinc-500 bg-zinc-800 px-3 py-1 rounded-full uppercase tracking-[0.2em]">340 MB Used</span>
                     </div>
                     <div className="h-32 flex items-end gap-1.5 px-1 relative z-10">
                        {[70, 72, 71, 74, 75, 74, 73, 76, 75, 77, 76, 75, 78, 77, 76, 75, 76, 75, 74, 75, 76, 77, 78, 76].map((h, i) => (
                          <div key={i} className="flex-1 bg-zinc-800 rounded-full hover:bg-emerald-500 transition-all cursor-help relative group/bar" style={{ height: `${h}%` }}>
                             <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-white text-black px-2 py-1 rounded text-[9px] font-black opacity-0 group-hover/bar:opacity-100 transition-opacity">{h}%</div>
                          </div>
                        ))}
                     </div>
                  </div>
               </div>

               {/* Log Preview */}
               <div className="bg-zinc-950 border border-zinc-800 rounded-[3rem] overflow-hidden shadow-2xl">
                  <div className="border-b border-zinc-900 px-10 py-6 flex items-center justify-between bg-zinc-900/20">
                     <div className="flex items-center gap-4">
                        <TerminalIcon className="h-5 w-5 text-indigo-500" />
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 italic">Runtime Engine — Output</span>
                     </div>
                     <button onClick={() => setActiveTab('logs')} className="text-[10px] font-black text-white hover:underline uppercase tracking-widest">Open Full Console</button>
                  </div>
                  <div className="p-10 font-mono text-xs leading-relaxed text-zinc-500 space-y-2">
                     <p><span className="text-zinc-800 mr-4">12:46:01</span> [DOCKSPHERE] Container initialized successfully</p>
                     <p><span className="text-zinc-800 mr-4">12:46:05</span> [SYSTEM] Health check passed (HTTP 200)</p>
                     <p><span className="text-zinc-800 mr-4">12:46:08</span> [RUNTIME] Listening on <span className="text-indigo-500">0.0.0.0:3000</span></p>
                     <div className="pt-4 flex items-center gap-3">
                        <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-emerald-500/50 italic">Listening for requests...</span>
                     </div>
                  </div>
               </div>
            </div>
          )}

          {activeTab === 'logs' && (
            <div className="animate-in fade-in slide-in-from-top-6 duration-500">
               <div className="bg-black rounded-[3rem] overflow-hidden shadow-2xl border border-zinc-800">
                  <div className="border-b border-zinc-800 px-10 py-6 flex items-center justify-between bg-zinc-900/30">
                     <div className="flex items-center gap-6">
                        <div className="flex gap-2.5">
                           <div className="h-3 w-3 rounded-full bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]" />
                           <div className="h-3 w-3 rounded-full bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]" />
                           <div className="h-3 w-3 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                        </div>
                        <div className="h-5 w-px bg-zinc-800" />
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white">PROD CONSOLE v1.0.4</span>
                     </div>
                     <div className="flex items-center gap-4">
                        <Button variant="outline" className="h-10 rounded-xl border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 text-[10px] uppercase font-black px-6">
                           Search Logs
                        </Button>
                        <Button variant="outline" className="h-10 rounded-xl border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 text-[10px] uppercase font-black px-6">
                           Export .txt
                        </Button>
                     </div>
                  </div>
                  <div className="p-12 font-mono text-xs leading-loose text-zinc-500 h-[650px] overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-800">
                     <div className="space-y-2">
                        <p className="flex gap-6"><span className="text-zinc-800 w-20 text-right">12:45:01</span> <span><span className="text-indigo-500 font-black">[INF]</span> Initializing build pipeline... <span className="text-zinc-300">COMPLETED</span></span></p>
                        <p className="flex gap-6"><span className="text-zinc-800 w-20 text-right">12:45:03</span> <span><span className="text-indigo-500 font-black">[INF]</span> Pulling GitHub HEAD: <span className="text-white italic underline underline-offset-4">main</span></span></p>
                        <p className="flex gap-6"><span className="text-zinc-800 w-20 text-right">12:45:12</span> <span><span className="text-indigo-500 font-black">[INF]</span> Base Image detected: <span className="text-amber-500 font-bold">Node.js 18.x Alpine</span></span></p>
                        <p className="flex gap-6"><span className="text-zinc-800 w-20 text-right">12:45:15</span> <span><span className="text-indigo-500 font-black">[INF]</span> Triggering build script: <span className="text-zinc-100 bg-zinc-900 px-2 py-0.5 rounded">npm run build</span></span></p>
                        <div className="py-6 space-y-1.5 pl-24 border-l border-zinc-900 ml-10 my-4">
                           <p className="text-zinc-600 italic">Creating an optimized production build...</p>
                           <p className="text-zinc-600 italic">Injecting environment variables (4 defined)...</p>
                           <p className="text-emerald-500 font-black">✓ Successfully compiled in 14.2s</p>
                        </div>
                        <p className="flex gap-6"><span className="text-zinc-800 w-20 text-right">12:46:01</span> <span><span className="text-emerald-500 font-black">[SUCCESS]</span> Deployment artifact generated: <span className="text-white italic">ds_v104_build.tar.gz</span></span></p>
                        <p className="flex gap-6"><span className="text-zinc-800 w-20 text-right">12:46:05</span> <span><span className="text-indigo-500 font-black">[INF]</span> Routing traffic to cluster: <span className="text-sky-400 font-bold">aws-use1-node-04</span></span></p>
                        <p className="flex gap-6"><span className="text-zinc-800 w-20 text-right">12:46:08</span> <span><span className="text-emerald-500 font-black">[LIVE]</span> App is reachable at <span className="text-white font-black underline underline-offset-4">{app.name.toLowerCase()}.docksphere.dev</span></span></p>
                        <p className="flex gap-6 mt-8 animate-pulse italic"><span className="text-zinc-800 w-20 text-right">--:--:--</span> <span className="text-zinc-700">Waiting for next infrastructure event...</span></p>
                     </div>
                  </div>
               </div>
            </div>
          )}
        </div>

        <div className="space-y-12">
           {/* Repo Details Card */}
           <div className="bg-zinc-900/20 border border-zinc-800 rounded-[3rem] p-10 space-y-10 group hover:border-zinc-700 transition-all shadow-2xl">
              <h3 className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em] italic">Deployment Source</h3>
              <div className="flex items-center justify-between">
                 <div className="flex items-center gap-5">
                    <div className="h-12 w-12 rounded-2xl bg-white flex items-center justify-center text-black">
                       <Github className="h-6 w-6" />
                    </div>
                    <div>
                       <p className="text-sm font-black text-white truncate max-w-[150px] tracking-tight">{app.github_repo_url.split('/').pop()}</p>
                       <p className="text-[10px] text-zinc-600 font-black uppercase mt-1 tracking-widest">Public Repo</p>
                    </div>
                 </div>
              </div>
              <button className="w-full py-4 bg-zinc-900 rounded-2xl text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-white hover:bg-zinc-800 transition-all flex items-center justify-center gap-3 border border-zinc-800">
                 <Settings className="h-4 w-4" />
                 View Repository Settings
              </button>
           </div>

           {/* Environment Configuration */}
           <div className="bg-zinc-900/20 border border-zinc-800 rounded-[3rem] p-10 space-y-10 group hover:border-zinc-700 transition-all shadow-2xl">
              <div className="flex items-center justify-between">
                 <h3 className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em] italic">Variables</h3>
                 <Badge variant="outline" className="rounded-lg text-[9px] font-black border-zinc-800 bg-zinc-900 text-indigo-400">4 DEFINED</Badge>
              </div>
              <div className="space-y-4">
                 {['NODE_ENV', 'DB_CLUSTER_URL'].map((env) => (
                    <div key={env} className="flex items-center justify-between p-4 bg-black/40 border border-zinc-900 rounded-2xl group/item hover:border-zinc-700 transition-all">
                       <span className="text-[10px] font-mono font-black text-zinc-500">{env}</span>
                       <span className="text-xs text-zinc-800 tracking-widest">••••••••</span>
                    </div>
                 ))}
              </div>
              <button className="w-full py-4 bg-white rounded-2xl text-[10px] font-black uppercase tracking-widest text-black hover:bg-zinc-200 transition-all flex items-center justify-center gap-3 shadow-2xl shadow-white/5">
                 <Plus className="h-4 w-4" />
                 Update Configuration
              </button>
           </div>

           {/* Maintenance / Control */}
           <div className="p-10 bg-zinc-950/50 border border-zinc-800 rounded-[3rem] space-y-8">
              <h3 className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em] italic">Infrastructure Controls</h3>
              <div className="grid grid-cols-1 gap-4">
                 <Button variant="outline" className="w-full rounded-2xl h-14 text-[10px] font-black uppercase tracking-widest gap-4 border-zinc-800 bg-zinc-900 text-white hover:bg-zinc-800">
                    <RotateCcw className="h-5 w-5 text-indigo-500" />
                    Restart Instance
                 </Button>
                 <Button variant="outline" className="w-full rounded-2xl h-14 text-[10px] font-black uppercase tracking-widest gap-4 border-rose-900/30 text-rose-500 bg-rose-500/5 hover:bg-rose-500/10 hover:border-rose-500/50 transition-all">
                    <AlertCircle className="h-5 w-5" />
                    Terminate Service
                 </Button>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
