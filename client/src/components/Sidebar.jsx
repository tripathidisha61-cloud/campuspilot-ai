import React from 'react';
import {
  LayoutDashboard,
  MessageSquare,
  CalendarDays,
  CheckSquare,
  HelpCircle,
  Activity,
  GraduationCap,
  Volume2,
  VolumeX,
} from 'lucide-react';

export default function Sidebar({
  activeTab,
  setActiveTab,
  voiceEnabled,
  setVoiceEnabled,
  pendingTasksCount = 0,
}) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'chat', label: 'AI Workspace', icon: MessageSquare, badge: 'Alexa+' },
    { id: 'planner', label: 'Study Planner', icon: CalendarDays },
    {
      id: 'tasks',
      label: 'Task Board',
      icon: CheckSquare,
      badge: pendingTasksCount > 0 ? `${pendingTasksCount}` : null,
      badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
    },
    { id: 'quiz', label: 'Quiz Mode', icon: HelpCircle },
    { id: 'mcp', label: 'MCP Inspector', icon: Activity, badge: 'Live' },
  ];

  return (
    <aside className="w-64 flex-shrink-0 border-r border-slate-800 bg-[#0F172A]/70 backdrop-blur-md flex flex-col justify-between p-4 hidden md:flex min-h-[calc(100vh-4rem)]">
      <div className="space-y-6">
        {/* Navigation Links */}
        <div className="space-y-1">
          <p className="px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Workspace
          </p>
          <nav className="mt-2 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-lg shadow-indigo-600/20 font-semibold'
                      : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`h-4 w-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                        isActive
                          ? 'bg-white/20 text-white border-white/30'
                          : item.badgeColor || 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Alexa+ Voice Toggle Simulation */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3.5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-cyan-400"></span>
              Alexa+ Voice Audio
            </span>
            <button
              onClick={() => setVoiceEnabled(!voiceEnabled)}
              className={`p-1.5 rounded-lg border text-xs transition ${
                voiceEnabled
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                  : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}
              title={voiceEnabled ? 'Alexa voice responses enabled' : 'Voice audio muted'}
            >
              {voiceEnabled ? <Volume2 className="h-4 w-4 text-cyan-400" /> : <VolumeX className="h-4 w-4" />}
            </button>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            {voiceEnabled ? 'Assistant will read answers with speech synthesis.' : 'Voice muted. Text response mode active.'}
          </p>
        </div>
      </div>

      {/* Student Profile Card */}
      <div className="pt-4 border-t border-slate-800">
        <div className="flex items-center gap-3 rounded-xl bg-slate-900/50 p-2.5 border border-slate-800/80">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
            <GraduationCap className="h-5 w-5" />
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-semibold text-white truncate">Alex Johnson</p>
            <p className="text-xs text-slate-400 truncate">CS Senior • Fall 2026</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
