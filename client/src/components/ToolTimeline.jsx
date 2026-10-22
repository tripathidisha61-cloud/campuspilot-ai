import React, { useState } from 'react';
import {
  Activity,
  Layers,
  Clock,
  CheckCircle2,
  AlertCircle,
  Code,
  Terminal,
  ExternalLink,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

export default function ToolTimeline({ agentRuns = [], mcpMetadata }) {
  const [activeTab, setActiveTab] = useState('runs');
  const [expandedRunId, setExpandedRunId] = useState(null);

  const tools = mcpMetadata?.tools || [];

  const toggleRun = (runId) => {
    setExpandedRunId(expandedRunId === runId ? null : runId);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <Activity className="h-5 w-5 text-cyan-400" />
              MCP Protocol & Tool Inspector
            </h1>
            <span className="rounded-full bg-cyan-500/10 px-2 py-0.5 text-xs font-mono text-cyan-300 border border-cyan-500/30">
              Streamable HTTP • Spec 2025-11-25
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time audit record of agent tool invocations, execution duration, and schema definitions.
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('runs')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'runs'
                ? 'bg-indigo-600 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Activity Runs ({agentRuns.length})
          </button>
          <button
            onClick={() => setActiveTab('tools')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'tools'
                ? 'bg-indigo-600 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Registered MCP Tools ({tools.length})
          </button>
        </div>
      </div>

      {/* Content based on tab */}
      {activeTab === 'runs' ? (
        <div className="space-y-3">
          {agentRuns.length === 0 ? (
            <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-12 text-center text-sm text-slate-400">
              No tool executions recorded yet. Submit a conversational request in the AI Workspace.
            </div>
          ) : (
            agentRuns.map((run) => {
              const isExpanded = expandedRunId === run.id;

              return (
                <div
                  key={run.id}
                  className="rounded-xl border border-slate-800 bg-slate-900/70 p-4 space-y-3 shadow-sm hover:border-slate-700 transition"
                >
                  <div
                    onClick={() => toggleRun(run.id)}
                    className="flex items-center justify-between gap-3 cursor-pointer"
                  >
                    <div className="space-y-1 overflow-hidden">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 font-semibold">
                          {run.provider || 'Streamable HTTP'}
                        </span>
                        <span className="text-xs text-slate-400 font-mono">
                          {new Date(run.createdAt).toLocaleTimeString()}
                        </span>
                        <span className="text-xs text-slate-400">• {run.durationMs || 45}ms</span>
                      </div>
                      <p className="text-sm font-semibold text-white truncate">
                        "{run.request}"
                      </p>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <span className="rounded bg-slate-800 px-2 py-0.5 text-[11px] font-mono text-slate-300">
                        {run.toolCalls?.length || 0} tools
                      </span>
                      {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </div>
                  </div>

                  {/* Expandable Details */}
                  {isExpanded && (
                    <div className="mt-3 pt-3 border-t border-slate-800 space-y-3 text-xs">
                      <div>
                        <span className="text-slate-400 font-bold block mb-1">Agent Outcome:</span>
                        <p className="text-slate-300 bg-slate-950 p-2.5 rounded-lg border border-slate-800/80">
                          {run.outcome}
                        </p>
                      </div>

                      {run.toolCalls && run.toolCalls.length > 0 && (
                        <div className="space-y-2">
                          <span className="text-slate-400 font-bold block">
                            Invoked MCP Tools:
                          </span>
                          {run.toolCalls.map((t, idx) => (
                            <div
                              key={idx}
                              className="rounded-lg border border-slate-800 bg-slate-950 p-3 space-y-2 font-mono text-[11px]"
                            >
                              <div className="flex items-center justify-between text-xs">
                                <span className="font-bold text-cyan-300">{t.name}</span>
                                <span className="text-emerald-400">{t.durationMs}ms</span>
                              </div>
                              <div>
                                <span className="text-slate-400 text-[10px] block">Input Parameters:</span>
                                <pre className="text-indigo-300 overflow-x-auto p-1.5 bg-slate-900 rounded">
                                  {JSON.stringify(t.input, null, 2)}
                                </pre>
                              </div>
                              <div>
                                <span className="text-slate-400 text-[10px] block">Result Output:</span>
                                <pre className="text-emerald-300 overflow-x-auto p-1.5 bg-slate-900 rounded max-h-36">
                                  {JSON.stringify(t.output, null, 2)}
                                </pre>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      ) : (
        /* Registered Tools Tab */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tools.map((tool) => (
            <div
              key={tool.name}
              className="rounded-xl border border-slate-800 bg-slate-900/70 p-4 space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-cyan-300 bg-cyan-950/40 border border-cyan-500/30 px-2 py-0.5 rounded">
                  {tool.name}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">Streamable HTTP</span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">{tool.description}</p>

              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Parameters Schema:
                </span>
                <pre className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-[11px] font-mono text-indigo-300 overflow-x-auto max-h-40">
                  {JSON.stringify(tool.inputSchema, null, 2)}
                </pre>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
