import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useApi, apiEndpoints } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { 
  Github, 
  ArrowLeft, 
  Search, 
  Terminal, 
  Globe, 
  Shield, 
  Rocket,
  Plus,
  ExternalLink,
  GitBranch,
  ChevronRight,
  Settings,
  Cpu,
  Lock,
  ChevronDown
} from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function NewProject() {
  const router = useRouter();
  const { post } = useApi();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: Select Repo, 2: Configure
  const [repos, setRepos] = useState<any[]>([]);
  const [fetchingRepos, setFetchingRepos] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    setMounted(true);
    
    const fetchGithubRepos = async () => {
      // Check if user has github identity
      const githubIdentity = user?.identities?.find((id: any) => id.provider === 'github');
      if (!githubIdentity) return;

      setFetchingRepos(true);
      try {
        // For now, we allow the user to search/input, 
        // but we can fetch public repos if we have a token or the user's github username
        const username = githubIdentity.identity_data.user_name;
        const response = await fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=10`);
        const data = await response.json();
        if (Array.isArray(data)) {
          setRepos(data.map(repo => ({
            name: repo.name,
            updated: new Date(repo.updated_at).toLocaleDateString(),
            language: repo.language || 'Unknown',
            url: repo.clone_url,
            color: repo.language === 'TypeScript' ? 'text-indigo-400' : 'text-zinc-400'
          })));
        }
      } catch (error) {
        console.error('Failed to fetch real GitHub repos:', error);
      } finally {
        setFetchingRepos(false);
      }
    };

    fetchGithubRepos();
  }, [user]);

  const handleImport = (repo: any) => {
    setStep(2);
    // Auto-fill form in next step
    setTimeout(() => {
      const form = document.querySelector('form') as HTMLFormElement;
      if (form) {
        (form.elements.namedItem('appName') as HTMLInputElement).value = repo.name;
        (form.elements.namedItem('repoUrl') as HTMLInputElement).value = repo.url;
      }
    }, 100);
  };

  const handleDeploy = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const name = (e.currentTarget as any).appName.value;
      const repo = (e.currentTarget as any).repoUrl.value;
      
      const response = await post(apiEndpoints.apps.create, {
        name,
        github_repo_url: repo,
        config: {
          runtime: 'docker',
          build_command: 'npm run build',
          start_command: 'npm start',
        }
      });
      
      toast.success('Project created!');
      router.push(`/apps/${response.data.id}`);
    } catch (error) {
       toast.error('Failed to create project.');
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) return null;

  return (
    <div className="max-w-[1100px] mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      
      {/* Header & Stepper */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="h-10 w-10 flex items-center justify-center rounded-lg bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 transition-all text-zinc-400 hover:text-white">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-black italic tracking-tight text-white">New Project</h1>
            <p className="text-zinc-500 font-medium text-[14px] mt-1">Select a repository to deploy it to the edge.</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4 bg-zinc-900/50 px-5 py-2 rounded-full border border-zinc-800/50">
           <div className={cn('text-[12px] font-black uppercase tracking-widest', step === 1 ? 'text-white' : 'text-zinc-600')}>1. Source</div>
           <ChevronRight className="h-4 w-4 text-zinc-800" />
           <div className={cn('text-[12px] font-black uppercase tracking-widest', step === 2 ? 'text-white' : 'text-zinc-600')}>2. Configure</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-12">
        <div className="space-y-8">
          {step === 1 ? (
            <div className="space-y-8 animate-in fade-in slide-in-from-left-4 duration-500">
              {/* Vercel Search Style */}
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 group-focus-within:text-white transition-colors" />
                <input 
                  type="text" 
                  placeholder="Search repositories..." 
                  className="w-full pl-12 pr-6 py-4 bg-zinc-900/30 border border-zinc-800 rounded-2xl text-[15px] font-medium outline-none focus:bg-zinc-900/50 focus:border-zinc-600 transition-all text-white placeholder:text-zinc-600"
                />
              </div>

              {/* Repo List Container */}
              <div className="bg-zinc-900/20 border border-zinc-800 rounded-[2.5rem] overflow-hidden backdrop-blur-sm">
                <div className="divide-y divide-zinc-800/50">
                  {fetchingRepos ? (
                    <div className="p-20 flex flex-col items-center justify-center text-center space-y-4">
                       <div className="h-10 w-10 border-4 border-zinc-800 border-t-white rounded-full animate-spin" />
                       <p className="text-zinc-500 font-bold uppercase tracking-widest text-[11px]">Synchronizing GitHub...</p>
                    </div>
                  ) : repos.length > 0 ? (
                    repos.map((repo) => (
                      <div key={repo.name} className="flex items-center justify-between p-8 hover:bg-zinc-900/40 transition-all group">
                        <div className="flex items-center gap-6">
                          <div className="h-12 w-12 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-center text-zinc-400 group-hover:bg-white group-hover:text-black transition-all">
                            <Github className="h-6 w-6" />
                          </div>
                          <div>
                            <p className="text-[16px] font-bold text-white tracking-tight">{repo.name}</p>
                            <div className="flex items-center gap-3 mt-1.5 text-[12px] font-bold text-zinc-500 uppercase tracking-widest">
                              <span className={cn('flex items-center gap-1.5', repo.color)}>
                                 <div className="h-1.5 w-1.5 rounded-full bg-current" />
                                 {repo.language}
                              </span>
                              <span>Updated {repo.updated}</span>
                            </div>
                          </div>
                        </div>
                        <button 
                          onClick={() => handleImport(repo)} 
                          className="rounded-lg px-6 h-10 font-bold text-[13px] bg-white text-black hover:bg-zinc-200 transition-all"
                        >
                          Import
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="p-20 flex flex-col items-center justify-center text-center space-y-6">
                       <div className="h-16 w-16 bg-zinc-900 rounded-2xl flex items-center justify-center border border-zinc-800">
                          <Github className="h-8 w-8 text-zinc-700" />
                       </div>
                       <div className="space-y-2">
                          <p className="text-[16px] font-bold text-white">No GitHub Integration found</p>
                          <p className="text-[14px] text-zinc-500 max-w-xs mx-auto leading-relaxed">Login with GitHub to instantly import and deploy your private repositories.</p>
                       </div>
                       <button 
                         onClick={() => router.push('/login')}
                         className="px-8 py-3 bg-white text-black text-[13px] font-black uppercase tracking-widest rounded-xl hover:bg-zinc-200 transition-all shadow-2xl shadow-white/5"
                       >
                         Connect GitHub Account
                       </button>
                    </div>
                  )}
                </div>
                {repos.length > 0 && (
                  <div className="p-6 bg-zinc-950/50 flex items-center justify-center border-t border-zinc-800/50">
                    <button className="text-[12px] font-black uppercase tracking-widest text-zinc-600 hover:text-zinc-300 transition-colors flex items-center gap-2">
                        <Plus className="h-4 w-4" />
                        Configure a custom source
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="animate-in fade-in slide-in-from-right-4 duration-500">
               <div className="bg-zinc-900/20 border border-zinc-800 rounded-[3rem] p-12 space-y-12 backdrop-blur-sm shadow-2xl">
                  <div className="space-y-3">
                     <h2 className="text-2xl font-black text-white italic">Configure Deployment</h2>
                     <p className="text-zinc-500 font-medium text-[14px]">Refine your build and runtime environment.</p>
                  </div>

                  <form onSubmit={handleDeploy} className="space-y-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                       <div className="space-y-3">
                          <label className="text-[11px] font-black uppercase tracking-widest text-zinc-600 ml-1">Project Name</label>
                          <input 
                            name="appName"
                            type="text" 
                            defaultValue="my-awesome-service"
                            className="w-full px-5 py-3.5 bg-black/40 border border-zinc-800 rounded-xl font-bold text-white outline-none focus:border-zinc-600 focus:bg-zinc-900/50 transition-all text-[15px]"
                          />
                       </div>
                       <div className="space-y-3">
                          <label className="text-[11px] font-black uppercase tracking-widest text-zinc-600 ml-1">Framework Preset</label>
                          <div className="w-full px-5 py-3.5 bg-black/40 border border-zinc-800 rounded-xl font-bold text-zinc-400 flex items-center justify-between cursor-pointer hover:bg-zinc-900/50 transition-all">
                             <div className="flex items-center gap-3">
                                <Rocket className="h-4 w-4 text-indigo-500" />
                                <span className="text-[15px]">Detected: Next.js</span>
                             </div>
                             <ChevronDown className="h-4 w-4 text-zinc-700" />
                          </div>
                       </div>
                    </div>

                    <div className="p-10 bg-black/40 border border-zinc-800 rounded-[2rem] space-y-8">
                       <h4 className="text-[11px] font-black uppercase tracking-widest text-zinc-600 italic">Build & Development Settings</h4>
                       <div className="grid grid-cols-1 gap-6">
                          <div className="flex flex-col gap-2">
                             <span className="text-[13px] font-bold text-zinc-400">Build Command</span>
                             <input type="text" placeholder="npm run build" className="bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-[14px] w-full outline-none focus:border-zinc-600 text-white font-mono" />
                          </div>
                          <div className="flex flex-col gap-2">
                             <span className="text-[13px] font-bold text-zinc-400">Output Directory</span>
                             <input type="text" placeholder=".next" className="bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-[14px] w-full outline-none focus:border-zinc-600 text-white font-mono" />
                          </div>
                       </div>
                    </div>

                    <div className="hidden">
                      <input name="repoUrl" value="https://github.com/user/my-awesome-service" readOnly />
                    </div>

                    <div className="flex items-center justify-between pt-8">
                       <button type="button" onClick={() => setStep(1)} className="text-[12px] font-black uppercase tracking-widest text-zinc-600 hover:text-white transition-colors">
                          Back to Source
                       </button>
                       <Button type="submit" disabled={loading} className="rounded-xl px-12 h-14 bg-white text-black hover:bg-zinc-200 transition-all shadow-2xl shadow-white/5 font-black uppercase tracking-[0.2em] text-[12px]">
                          {loading ? <div className="h-5 w-5 border-2 border-black/30 border-t-black rounded-full animate-spin" /> : 'Deploy Project'}
                       </Button>
                    </div>
                  </form>
               </div>
            </div>
          )}
        </div>

        {/* Sidebar Info Cards */}
        <div className="space-y-10">
           <div className="bg-zinc-950 border border-zinc-800 rounded-[2.5rem] p-10 space-y-10 relative overflow-hidden group shadow-2xl shadow-black">
              <div className="h-14 w-14 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl flex items-center justify-center">
                 <Shield className="h-7 w-7 text-indigo-400" />
              </div>
              <div className="space-y-3">
                 <h3 className="text-xl font-black italic text-white">Smart Detection</h3>
                 <p className="text-zinc-500 text-[14px] font-medium leading-relaxed">
                    We automatically analyze your repository to determine the best build configuration and environment presets.
                 </p>
              </div>
              <div className="space-y-5 pt-4">
                 {[
                    { icon: Globe, label: 'Global Edge Network' },
                    { icon: Lock, label: 'L7 Security Guard' },
                    { icon: Cpu, label: 'Dedicated Build Pods' }
                 ].map((item, i) => (
                    <div key={i} className="flex items-center gap-4 text-[12px] font-black uppercase tracking-widest text-zinc-400">
                       <item.icon className="h-4.5 w-4.5 text-indigo-500" />
                       {item.label}
                    </div>
                 ))}
              </div>
              
              {/* Subtle Gradient Glow */}
              <div className="absolute -right-16 -bottom-16 h-64 w-64 bg-indigo-500/5 blur-[80px] rounded-full pointer-events-none" />
           </div>

           <div className="p-10 bg-zinc-900/10 border border-zinc-800 rounded-[2.5rem] space-y-5">
              <p className="text-[11px] font-black uppercase tracking-widest text-zinc-600">Documentation</p>
              <p className="text-[15px] font-bold text-white leading-relaxed">
                 Using a custom build pipeline or Dockerfile?
              </p>
              <button className="text-[12px] font-black uppercase tracking-widest text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-2">
                 Read Advanced Guide <ExternalLink className="h-4 w-4" />
              </button>
           </div>
        </div>
      </div>
    </div>
  );
}
