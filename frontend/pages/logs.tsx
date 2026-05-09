import React, { useState, useEffect, useRef } from 'react';
import { Search, Download, Trash2 } from 'lucide-react';

const LOG_TEMPLATES = [
  '[RUNTIME] Request {id} — GET /api/v1/health — 200 OK ({ms}ms)',
  '[DOCKER]  Container docksphere-{id} heartbeat — healthy',
  '[NETWORK] Edge routing resolved — region: ap-south-1 ({ms}ms)',
  '[BUILD]   Cache hit for layer sha256:{id} — skipping',
  '[RUNTIME] Request {id} — POST /api/v1/apps — 201 Created ({ms}ms)',
  '[STORAGE] Volume /data/docksphere-{id} — read {ms}KB',
  '[RUNTIME] Request {id} — GET /api/v1/metrics — 200 OK ({ms}ms)',
  '[NETWORK] TLS handshake completed — cert valid for 89d',
];

function makeLog() {
  const template = LOG_TEMPLATES[Math.floor(Math.random() * LOG_TEMPLATES.length)];
  const id = Math.random().toString(36).substring(2, 8);
  const ms = Math.floor(Math.random() * 80) + 8;
  return template.replace(/{id}/g, id).replace(/{ms}/g, String(ms));
}

function getTag(log: string) {
  if (log.includes('[RUNTIME]')) return { label: 'Runtime', color: 'text-indigo-400' };
  if (log.includes('[BUILD]'))   return { label: 'Build',   color: 'text-amber-400' };
  if (log.includes('[DOCKER]'))  return { label: 'Docker',  color: 'text-sky-400' };
  if (log.includes('[NETWORK]')) return { label: 'Network', color: 'text-purple-400' };
  if (log.includes('[STORAGE]')) return { label: 'Storage', color: 'text-rose-400' };
  return { label: 'Info', color: 'text-zinc-400' };
}

interface LogEntry {
  id: number;
  text: string;
  time: string;
}

export default function Logs() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [filter, setFilter] = useState('');
  const [autoscroll, setAutoscroll] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);
  const counterRef = useRef(0);

  useEffect(() => {
    // Seed with initial logs
    const initial: LogEntry[] = [
      '[RUNTIME] Platform initialized — DockSphere v1.0.0',
      '[DOCKER]  Container engine connected — Docker 24.0.5',
      '[NETWORK] Anycast DNS propagated — 12 global regions',
      '[STORAGE] Volume mount /data successful — NVMe SSD',
      '[BUILD]   Build cache warmed — 1.2GB ready',
    ].map((text) => ({
      id: counterRef.current++,
      text,
      time: new Date().toLocaleTimeString('en-US', { hour12: false }),
    }));
    setLogs(initial);

    // Stream new logs every 3s
    const interval = setInterval(() => {
      const entry: LogEntry = {
        id: counterRef.current++,
        text: makeLog(),
        time: new Date().toLocaleTimeString('en-US', { hour12: false }),
      };
      setLogs((prev) => [...prev.slice(-80), entry]);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // Auto-scroll
  useEffect(() => {
    if (autoscroll) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, autoscroll]);

  const filtered = filter
    ? logs.filter((l) => l.text.toLowerCase().includes(filter.toLowerCase()))
    : logs;

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-16">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white">Runtime Logs</h1>
          <p className="text-zinc-500 text-[14px] font-medium mt-1">
            Live event stream from your active infrastructure clusters.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-4 h-9 bg-zinc-900 border border-zinc-800 rounded-xl text-[12px] font-bold uppercase tracking-widest text-zinc-400 hover:text-white transition-all">
            <Download className="h-3.5 w-3.5" /> Export
          </button>
          <button
            onClick={() => setLogs([])}
            className="flex items-center gap-2 px-4 h-9 bg-rose-500/10 border border-rose-500/20 rounded-xl text-[12px] font-bold uppercase tracking-widest text-rose-400 hover:bg-rose-500/20 transition-all"
          >
            <Trash2 className="h-3.5 w-3.5" /> Clear
          </button>
        </div>
      </div>

      {/* Terminal */}
      <div className="bg-[#050505] border border-zinc-800/60 rounded-2xl overflow-hidden shadow-2xl">

        {/* Terminal Toolbar */}
        <div className="px-5 py-3.5 border-b border-zinc-800/60 bg-zinc-950 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {/* macOS dots */}
            <div className="flex gap-2">
              <div className="h-3 w-3 rounded-full bg-rose-500/60" />
              <div className="h-3 w-3 rounded-full bg-amber-500/60" />
              <div className="h-3 w-3 rounded-full bg-emerald-500/60" />
            </div>
            {/* Filter input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-700" />
              <input
                type="text"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                placeholder="Filter logs..."
                className="pl-9 pr-4 py-1.5 bg-zinc-900/60 border border-zinc-800 rounded-lg text-[12px] font-medium outline-none focus:border-zinc-600 transition-all text-zinc-300 placeholder:text-zinc-700 w-52"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[11px] font-black uppercase tracking-widest text-zinc-600">Autoscroll</span>
            <button
              onClick={() => setAutoscroll(!autoscroll)}
              className={`h-5 w-9 rounded-full flex items-center transition-colors px-0.5 ${
                autoscroll ? 'bg-indigo-600' : 'bg-zinc-800'
              }`}
            >
              <div className={`h-4 w-4 bg-white rounded-full shadow transition-transform ${autoscroll ? 'translate-x-4' : 'translate-x-0'}`} />
            </button>
            <div className="flex items-center gap-1.5 text-[11px] font-black text-emerald-400 uppercase tracking-widest">
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live
            </div>
          </div>
        </div>

        {/* Log Lines */}
        <div className="h-[560px] overflow-y-auto scrollbar-hide p-4 font-mono text-[13px] leading-relaxed">
          {filtered.length === 0 ? (
            <div className="flex items-center justify-center h-full text-zinc-700 text-[13px] font-bold">
              No logs matching filter.
            </div>
          ) : (
            <div className="space-y-0.5">
              {filtered.map((entry) => {
                const tag = getTag(entry.text);
                const message = entry.text.replace(/\[\w+\]\s*/, '');
                return (
                  <div
                    key={entry.id}
                    className="flex gap-4 px-2 py-1 rounded-lg hover:bg-zinc-900/40 transition-colors group"
                  >
                    <span className="text-zinc-700 w-20 flex-shrink-0 text-right font-bold text-[11px] mt-0.5">
                      {entry.time}
                    </span>
                    <span className={`font-black text-[11px] uppercase tracking-wider flex-shrink-0 w-16 mt-0.5 ${tag.color}`}>
                      {tag.label}
                    </span>
                    <span className="text-zinc-400 group-hover:text-zinc-200 transition-colors flex-1">
                      {message}
                    </span>
                  </div>
                );
              })}
              {/* Cursor */}
              <div className="flex items-center gap-3 pt-4 pl-2 animate-pulse">
                <div className="h-2 w-2 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.6)]" />
                <span className="text-indigo-500/50 text-[12px] font-bold italic">Streaming live pulses...</span>
              </div>
              <div ref={bottomRef} />
            </div>
          )}
        </div>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Events / min', value: '20' },
          { label: 'Error rate',   value: '0.0%' },
          { label: 'Total events', value: String(logs.length) },
        ].map((s) => (
          <div key={s.label} className="bg-zinc-900/20 border border-zinc-800/60 rounded-xl px-5 py-4">
            <p className="text-[11px] font-black uppercase tracking-widest text-zinc-600 mb-1">{s.label}</p>
            <p className="text-xl font-black text-white">{s.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
