import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  Coffee,
  AlertTriangle,
  CheckCircle,
  Sparkles,
  Zap,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';

export default function ScheduleView({ currentPlan, onGeneratePlan, isLoading = false }) {
  const [selectedHours, setSelectedHours] = useState(4);

  const handleReplan = (hours) => {
    setSelectedHours(hours);
    onGeneratePlan({ availableMinutes: hours * 60 });
  };

  const plan = currentPlan;
  const blocks = plan?.blocks || [];
  const warnings = plan?.warnings || [];
  const deferred = plan?.deferredTasks || [];
  const metrics = plan?.metrics || {};

  return (
    <div className="space-y-6">
      {/* Header & Quick Re-Plan Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <Calendar className="h-5 w-5 text-indigo-400" />
              Deterministic Study Planner
            </h1>
            <span className="rounded-full bg-indigo-500/10 px-2 py-0.5 text-xs font-mono text-indigo-300 border border-indigo-500/30">
              S = 0.5D+0.3I+0.2E
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Allocates deep focus blocks and cognitive reset breaks strictly within your available time window.
          </p>
        </div>

        {/* Available Hours Selector */}
        <div className="flex items-center gap-1.5 bg-slate-950 p-1.5 rounded-xl border border-slate-800 self-start sm:self-auto">
          <span className="text-xs text-slate-400 px-2 font-medium">Study Window:</span>
          {[2, 3, 4, 6].map((h) => (
            <button
              key={h}
              disabled={isLoading}
              onClick={() => handleReplan(h)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                selectedHours === h
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-300 hover:bg-slate-850 hover:text-white'
              }`}
            >
              {h}h
            </button>
          ))}
        </div>
      </div>

      {/* Capacity & Constraint Overload Warnings */}
      {warnings.length > 0 && (
        <div className="rounded-xl border border-amber-500/40 bg-amber-950/20 p-4 backdrop-blur-sm">
          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-amber-500/20 p-1.5 text-amber-400 border border-amber-500/30 mt-0.5">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-amber-200">Constraint Conflict Handled Gracefully</h3>
              <p className="text-xs text-amber-300/90 leading-relaxed">{warnings[0]}</p>
            </div>
          </div>
        </div>
      )}

      {/* Plan Metrics Bar */}
      {plan && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-3">
            <span className="text-[11px] text-slate-400">Total Window</span>
            <p className="text-lg font-bold text-white mt-1">{plan.availableMinutes} mins</p>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-3">
            <span className="text-[11px] text-slate-400">Focused Study Time</span>
            <p className="text-lg font-bold text-indigo-400 mt-1">{metrics.totalStudyMinutes || 0} mins</p>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-3">
            <span className="text-[11px] text-slate-400">Break Intervals</span>
            <p className="text-lg font-bold text-emerald-400 mt-1">{metrics.totalBreakMinutes || 0} mins</p>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-3">
            <span className="text-[11px] text-slate-400">Time Capacity Used</span>
            <p className="text-lg font-bold text-cyan-400 mt-1">{metrics.capacityUtilization || 0}%</p>
          </div>
        </div>
      )}

      {/* Main Schedule Timeline */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider text-slate-400">
          Planned Time Blocks
        </h2>

        {blocks.length === 0 ? (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-12 text-center space-y-3">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-slate-800 text-slate-400">
              <Clock className="h-6 w-6" />
            </div>
            <p className="text-sm font-medium text-slate-300">No active plan generated yet.</p>
            <button
              onClick={() => handleReplan(4)}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-500 transition"
            >
              <Sparkles className="h-3.5 w-3.5" />
              Generate 4-Hour Academic Plan
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {blocks.map((block, idx) => {
              const isBreak = block.type === 'break';

              return (
                <div
                  key={idx}
                  className={`relative flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border transition ${
                    isBreak
                      ? 'border-emerald-500/30 bg-emerald-950/20 text-emerald-200'
                      : 'border-indigo-500/30 bg-slate-900/80 hover:border-indigo-500/50 shadow-md'
                  }`}
                >
                  <div className="flex items-start sm:items-center gap-3.5">
                    {/* Time Slot Badge */}
                    <div
                      className={`flex flex-col items-center justify-center rounded-lg px-2.5 py-1.5 font-mono text-xs font-bold border ${
                        isBreak
                          ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                          : 'bg-indigo-500/20 border-indigo-500/40 text-indigo-300'
                      }`}
                    >
                      <span>{block.startMinute}m</span>
                      <span className="text-[10px] opacity-70">to</span>
                      <span>{block.endMinute}m</span>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        {isBreak ? (
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-400">
                            <Coffee className="h-3.5 w-3.5" />
                            {block.title}
                          </span>
                        ) : (
                          <>
                            <span className="rounded bg-indigo-500/20 border border-indigo-500/40 px-1.5 py-0.5 text-[11px] font-bold text-indigo-300">
                              {block.subject}
                            </span>
                            <span className="text-sm font-semibold text-white">{block.title}</span>
                          </>
                        )}
                        <span className="text-xs text-slate-400">({block.durationMinutes} mins)</span>
                      </div>
                      <p className="text-xs text-slate-400">{block.reason}</p>
                    </div>
                  </div>

                  {!isBreak && block.urgencyScore && (
                    <div className="mt-2 sm:mt-0 flex items-center gap-2 self-end sm:self-auto">
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 uppercase font-semibold block">Urgency</span>
                        <span className="text-xs font-mono font-bold text-cyan-400">
                          {block.urgencyScore}/100
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Deferred Tasks Section (Constraint Recovery Feature) */}
      {deferred.length > 0 && (
        <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <ShieldAlert className="h-3.5 w-3.5 text-amber-400" />
              Deferred Tasks (Constraint Conflict Recovery)
            </h3>
            <span className="text-xs text-slate-400">{deferred.length} deferred</span>
          </div>

          <div className="space-y-2">
            {deferred.map((d, dIdx) => (
              <div
                key={dIdx}
                className="flex items-center justify-between p-2.5 rounded-lg border border-slate-800 bg-slate-900/40 text-xs"
              >
                <div>
                  <span className="font-semibold text-slate-200">{d.title}</span>
                  <p className="text-slate-400 text-[11px] mt-0.5">{d.reason}</p>
                </div>
                {d.urgencyScore && (
                  <span className="font-mono text-slate-400 text-[11px]">{d.urgencyScore}/100</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
