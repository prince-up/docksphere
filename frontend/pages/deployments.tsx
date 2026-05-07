import React from 'react';
import Layout from '@/components/Layout';
import { Layers, Rocket, Clock, Github, GitBranch } from 'lucide-react';
import { formatDate } from '@/lib/utils';

export default function Deployments() {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-20">
      <div className="space-y-2">
        <h1 className="text-3xl font-black italic">Deployments</h1>
        <p className="text-zinc-500 font-medium">History of all deployments across your infrastructure.</p>
      </div>

      <div className="bg-zinc-900/20 border border-zinc-800 rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-zinc-800 bg-zinc-900/40 grid grid-cols-[1fr_200px_200px_150px] gap-4 text-[12px] font-black uppercase tracking-widest text-zinc-500">
          <div>Deployment</div>
          <div>Status</div>
          <div>Created</div>
          <div className="text-right">Environment</div>
        </div>
        
        <div className="divide-y divide-zinc-800/50">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="p-6 grid grid-cols-[1fr_200px_200px_150px] gap-4 items-center hover:bg-zinc-900/30 transition-all cursor-pointer group">
              <div className="flex items-center gap-4">
                 <div className="h-10 w-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center group-hover:bg-white group-hover:text-black transition-all">
                    <Rocket className="h-5 w-5" />
                 </div>
                 <div className="min-w-0">
                    <p className="text-[14px] font-bold text-white truncate">Manual deployment from CLI</p>
                    <div className="flex items-center gap-2 mt-1">
                       <span className="text-[12px] text-zinc-500 font-mono">ds_v104_0{i}a</span>
                       <div className="h-1 w-1 rounded-full bg-zinc-800" />
                       <span className="flex items-center gap-1 text-[12px] text-zinc-500 font-mono">
                          <GitBranch className="h-3 w-3" />
                          main
                       </span>
                    </div>
                 </div>
              </div>
              <div>
                 <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                    <span className="text-[13px] font-bold text-zinc-300">Ready</span>
                 </div>
              </div>
              <div className="text-[13px] text-zinc-500 font-medium">
                 {formatDate(new Date())}
              </div>
              <div className="text-right">
                 <span className="px-3 py-1 bg-zinc-900 text-zinc-400 text-[10px] font-black uppercase tracking-widest rounded-md border border-zinc-800">Production</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="p-12 border-2 border-dashed border-zinc-800 rounded-[3rem] flex flex-col items-center text-center space-y-4">
         <div className="h-16 w-16 bg-zinc-900/50 rounded-2xl flex items-center justify-center">
            <Clock className="h-8 w-8 text-zinc-700" />
         </div>
         <p className="text-zinc-500 font-medium max-w-xs">Older deployments are automatically archived to optimize performance.</p>
      </div>
    </div>
  );
}
