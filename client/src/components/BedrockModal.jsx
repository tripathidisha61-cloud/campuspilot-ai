import React from 'react';
import { X, Cpu, CheckCircle2, ShieldCheck, Key, Zap, Layers } from 'lucide-react';

export default function BedrockModal({ isOpen, onClose, health }) {
  if (!isOpen) return null;

  const isConfigured = health?.miniTrack?.configured;
  const modelId = health?.miniTrack?.modelId || 'anthropic.claude-3-haiku-20240307-v1:0';
  const region = health?.miniTrack?.region || 'us-east-1';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-2xl border border-slate-700 bg-[#0F172A] p-6 shadow-2xl space-y-5 my-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30">
              <Cpu className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                AWS Builder Mini-Track Architecture
                <span className="rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-mono px-2 py-0.5 border border-amber-500/40">
                  Amazon Bedrock
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Official Hackathon Qualifying AWS Service Integration
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Integration Status Card */}
        <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Bedrock Runtime Status
            </span>
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold border ${
                isConfigured
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
              }`}
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              {isConfigured ? 'Live AWS Bedrock Connection' : 'Bedrock-Ready (Resilient Fallback Mode)'}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
            <div className="rounded-lg bg-slate-900 p-2.5 border border-slate-800">
              <span className="text-slate-400 text-[10px] block">Service</span>
              <span className="font-semibold text-white">Bedrock Runtime SDK v3</span>
            </div>
            <div className="rounded-lg bg-slate-900 p-2.5 border border-slate-800">
              <span className="text-slate-400 text-[10px] block">Target Model</span>
              <span className="font-semibold text-amber-300 font-mono text-[11px] truncate block">
                {modelId.split('.')[1] || modelId}
              </span>
            </div>
            <div className="rounded-lg bg-slate-900 p-2.5 border border-slate-800 col-span-2 sm:col-span-1">
              <span className="text-slate-400 text-[10px] block">AWS Region</span>
              <span className="font-semibold text-white font-mono">{region}</span>
            </div>
          </div>
        </div>

        {/* What Bedrock Powers in CampusPilot */}
        <div className="space-y-2 text-xs">
          <h3 className="font-bold text-white text-sm">How CampusPilot AI Uses Amazon Bedrock</h3>
          <ul className="space-y-2 text-slate-300 list-disc list-inside">
            <li>
              <strong className="text-indigo-300">Active Recall Quiz Generation:</strong> Generates rigorous, domain-specific multiple choice questions on university computer science subjects (DBMS Normalization, Topological Sort, Virtual Memory).
            </li>
            <li>
              <strong className="text-cyan-300">Intent & Workload Interpretation:</strong> Parses multi-intent natural language inputs and extracts constraints (deadlines, study hours).
            </li>
            <li>
              <strong className="text-emerald-300">Deterministic Safety Separation:</strong> While Bedrock handles natural language and quiz content, study timetables are computed deterministically (S = 0.5D + 0.3I + 0.2E) to prevent AI hallucination of hours.
            </li>
          </ul>
        </div>

        {/* Configuration Guide */}
        <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-2 text-xs font-mono">
          <span className="text-slate-400 font-bold block text-[11px] uppercase tracking-wider">
            Backend Environment Variables (.env)
          </span>
          <pre className="text-amber-300/90 overflow-x-auto p-2 bg-slate-900 rounded">
{`AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
BEDROCK_MODEL_ID=anthropic.claude-3-haiku-20240307-v1:0`}
          </pre>
          <p className="text-[11px] text-slate-400 font-sans">
            Credentials are safe server-side only and never exposed to the browser. If credentials are omitted, the app gracefully falls back to domain-curated active recall sets without interrupting user experience.
          </p>
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="rounded-xl bg-indigo-600 px-5 py-2 text-xs font-semibold text-white hover:bg-indigo-500 transition"
          >
            Close Documentation
          </button>
        </div>
      </div>
    </div>
  );
}
