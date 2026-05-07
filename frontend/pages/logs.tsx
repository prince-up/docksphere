import React from 'react';
import { Terminal as TerminalIcon, Search, Download, Trash2, Filter } from 'lucide-react';

export default function Logs() {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-black italic">Runtime Logs</h1>
          <p className="text-zinc-500 font-medium">Real-time event stream from your active clusters.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-[13px] font-bold text-zinc-400 hover:text-white transition-all">
             <Download className="h-4 w-4" />
             Export Logs
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-rose-500/10 border border-rose-500/20 rounded-lg text-[13px] font-bold text-rose-500 hover:bg-rose-500/20 transition-all">
             <Trash2 className="h-4 w-4" />
             Clear Console
          </button>
        </div>
      </div>

      <div className="bg-black border border-zinc-800 rounded-[2rem] overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-zinc-800 bg-zinc-900/30 flex items-center justify-between">
           <div className="flex items-center gap-4">
              <div className="flex gap-2">
                 <div className="h-3 w-3 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.4)]" />
                 <div className="h-3 w-3 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.4)]" />
                 <div className="h-3 w-3 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
              </div>
              <div className="h-4 w-px bg-zinc-800 mx-2" />
              <div className="relative group">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-600 group-focus-within:text-indigo-400 transition-colors" />
                 <input type="text" placeholder="Filter events..." className="pl-10 pr-4 py-1.5 bg-black border border-zinc-800 rounded-md text-[13px] outline-none focus:border-zinc-600 w-[300px] transition-all text-zinc-300" />
              </div>
           </div>
           <div className="flex items-center gap-3">
              <span className="text-[11px] font-black uppercase tracking-widest text-zinc-600">Autoscroll</span>
              <div className="h-5 w-10 bg-indigo-600 rounded-full flex items-center px-1">
                 <div className="h-3.5 w-3.5 bg-white rounded-full ml-auto shadow-sm" />
              </div>
           </div>
        </div>
        
        <div className="p-8 font-mono text-[13px] leading-relaxed text-zinc-500 h-[600px] overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-800">
           <div className="space-y-1.5">
              {[...Array(20)].map((_, i) => (
                <p key={i} className="flex gap-6 hover:bg-zinc-900/40 px-2 py-1 rounded transition-colors group">
                   <span className="text-zinc-800 w-20 text-right flex-shrink-0">12:4{i}:{10+i}</span>
                   <span className="flex-1">
                      <span className="text-indigo-500 font-bold mr-3">[RUNTIME]</span>
                      <span className="text-zinc-400 group-hover:text-zinc-200 transition-colors">Incoming request from <span className="text-white italic">192.168.1.{10+i}</span> - GET /api/v1/health</span>
                      <span className="ml-4 text-emerald-500 font-bold">200 OK</span>
                      <span className="ml-4 text-zinc-600 italic">({10+i}ms)</span>
                   </span>
                </p>
              ))}
              <div className="pt-6 flex items-center gap-4 animate-pulse">
                 <div className="h-2 w-2 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.8)]" />
                 <span className="text-indigo-500/50 italic text-[12px]">Connecting to live stream...</span>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
