import React from 'react';
import { Sparkles, Mic, Server, Database, RefreshCw, Cpu } from 'lucide-react';

export default function Navbar({ health, onResetData, onOpenBedrockInfo }) {
  const isMcpActive = !!health?.primaryTrack;
  const isBedrock = health?.miniTrack?.configured;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-[#0B0F19]/90 backdrop-blur-md">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6">
        {/* Brand & Tagline */}
        <div className="flex items-center gap-3">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 p-0.5 shadow-lg shadow-indigo-500/20">
            <div className="flex h-full w-full items-center justify-center rounded-[10px] bg-slate-950">
              <Sparkles className="h-5 w-5 text-indigo-400" />
            </div>
            <div className="absolute -inset-0.5 rounded-xl bg-gradient-to-tr from-indigo-500 to-cyan-400 opacity-30 blur-sm"></div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg tracking-tight text-white">CampusPilot<span className="text-cyan-400 font-extrabold">.AI</span></span>
              <span className="rounded-full bg-indigo-500/10 px-2 py-0.5 text-[11px] font-semibold text-indigo-300 border border-indigo-500/30">
                Hackathon Edition
              </span>
            </div>
            <p className="hidden text-xs text-slate-400 sm:block">Turn academic chaos into a clear plan of action</p>
          </div>
        </div>

        {/* Hackathon Track Badges & Status */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Alexa+ MCP Track Badge */}
          <div className="flex items-center gap-1.5 rounded-full bg-slate-900/90 border border-cyan-500/30 px-3 py-1 text-xs text-slate-300 shadow-sm" title="Primary Track: Alexa+ (MCP Server over Streamable HTTP)">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
            </span>
            <Mic className="h-3.5 w-3.5 text-cyan-400" />
            <span className="hidden md:inline font-medium text-cyan-200">Alexa+ Track:</span>
            <span className="font-mono text-cyan-400 font-semibold text-[11px]">MCP HTTP</span>
          </div>

          {/* AWS Bedrock Mini Track Badge */}
          <button
            onClick={onOpenBedrockInfo}
            className="flex items-center gap-1.5 rounded-full bg-slate-900/90 border border-amber-500/30 px-3 py-1 text-xs text-slate-300 hover:border-amber-400/60 transition shadow-sm"
            title="Mini Track: AWS Builder (Amazon Bedrock Integration)"
          >
            <Cpu className="h-3.5 w-3.5 text-amber-400" />
            <span className="hidden md:inline font-medium text-amber-200">AWS Bedrock:</span>
            <span className="font-mono text-amber-400 font-semibold text-[11px]">
              {isBedrock ? 'Active' : 'Bedrock Ready'}
            </span>
          </button>

          {/* Reset Demo State Button */}
          <button
            onClick={onResetData}
            className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800/60 px-2.5 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-700/80 hover:text-white transition"
            title="Reset tasks to initial demo seed"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Reset Demo</span>
          </button>
        </div>
      </div>
    </header>
  );
}
