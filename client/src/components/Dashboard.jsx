import React from 'react';
import {
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  Calendar,
  BookOpen,
  Zap,
} from 'lucide-react';

export default function Dashboard({
  tasks = [],
  plans = [],
  onSelectPrompt,
  onNavigate,
  onCompleteTask,
}) {
  const pendingTasks = tasks.filter((t) => t.status === 'pending');
  const completedTasks = tasks.filter((t) => t.status === 'completed');

  // Sort pending by deadline
  const sortedPending = [...pendingTasks].sort(
    (a, b) => new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime()
  );

  const mostUrgentTask = sortedPending[0];
  const latestPlan = plans[0];

  const quickPrompts = [
    {
      title: 'Four-Hour Academic Sprint (Hackathon Scenario)',
      prompt: 'Plan my next four hours. My DSA assignment is due tonight and my DBMS exam is tomorrow. Then quiz me on normalization.',
      icon: Sparkles,
      color: 'from-indigo-500/20 to-purple-500/20 border-indigo-500/30 text-indigo-300',
    },
    {
      title: 'Practice Database Normalization',
      prompt: 'Generate a 5-question active recall quiz on Database normalization and Boyce-Codd Normal Form.',
      icon: BookOpen,
      color: 'from-cyan-500/20 to-blue-500/20 border-cyan-500/30 text-cyan-300',
    },
    {
      title: 'Review Upcoming Deadlines',
      prompt: 'What are my pending tasks and their urgency scores?',
      icon: Clock,
      color: 'from-amber-500/20 to-orange-500/20 border-amber-500/30 text-amber-300',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Hero / Next Recommended Action */}
      <div className="relative overflow-hidden rounded-2xl border border-indigo-500/30 bg-gradient-to-r from-indigo-950/60 via-slate-900/80 to-purple-950/40 p-6 shadow-xl backdrop-blur-md">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-indigo-500/20 px-3 py-1 text-xs font-semibold text-indigo-300 border border-indigo-500/40">
              <Zap className="h-3.5 w-3.5 text-indigo-400" />
              Next Recommended Action
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              {mostUrgentTask
                ? `Prioritize: "${mostUrgentTask.title}" (${mostUrgentTask.subject})`
                : 'All caught up! Generate a study plan or test your memory.'}
            </h1>
            <p className="text-sm text-slate-300">
              {mostUrgentTask
                ? `Due ${new Date(mostUrgentTask.dueAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • Estimated ${mostUrgentTask.estimatedMinutes} mins • High Priority`
                : 'No pending deadlines detected. You can add new tasks or practice with active recall quizzes.'}
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5">
            <button
              onClick={() => onSelectPrompt('Plan my next four hours. My DSA assignment is due tonight and my DBMS exam is tomorrow. Then quiz me on normalization.')}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/30 hover:brightness-110 transition"
            >
              <Sparkles className="h-4 w-4" />
              <span>Run Smart Plan & Quiz</span>
            </button>
            <button
              onClick={() => onNavigate('tasks')}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-2.5 text-sm font-semibold text-slate-200 hover:bg-slate-700 transition"
            >
              <span>View Task Board</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Pending Deadlines</span>
            <Clock className="h-4 w-4 text-amber-400" />
          </div>
          <p className="mt-2 text-2xl font-bold text-white">{pendingTasks.length}</p>
          <p className="text-xs text-slate-400 mt-1">
            {pendingTasks.filter((t) => t.priority === 'high').length} high priority
          </p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Tasks Completed</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          </div>
          <p className="mt-2 text-2xl font-bold text-white">{completedTasks.length}</p>
          <p className="text-xs text-slate-400 mt-1">Persistent audit record</p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Study Windows Planned</span>
            <Calendar className="h-4 w-4 text-indigo-400" />
          </div>
          <p className="mt-2 text-2xl font-bold text-white">{plans.length}</p>
          <p className="text-xs text-slate-400 mt-1">
            {latestPlan ? `${latestPlan.availableMinutes}m last session` : 'Deterministic allocation'}
          </p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Urgency Algorithm</span>
            <Zap className="h-4 w-4 text-cyan-400" />
          </div>
          <p className="mt-2 text-xl font-bold text-cyan-400 font-mono">S = 0.5D+0.3I+0.2E</p>
          <p className="text-xs text-slate-400 mt-1">Constraint-aware scoring</p>
        </div>
      </div>

      {/* Two Column Layout: Urgent Tasks & Quick Voice Prompts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Urgent Deadlines Board */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Clock className="h-4 w-4 text-amber-400" />
              Immediate Academic Workload
            </h2>
            <button
              onClick={() => onNavigate('tasks')}
              className="text-xs font-medium text-indigo-400 hover:text-indigo-300"
            >
              All Tasks →
            </button>
          </div>

          <div className="space-y-2.5">
            {sortedPending.length === 0 ? (
              <p className="text-sm text-slate-400 py-6 text-center">No pending tasks remaining!</p>
            ) : (
              sortedPending.slice(0, 4).map((task) => {
                const dueHours = (new Date(task.dueAt).getTime() - Date.now()) / (1000 * 60 * 60);
                const isVeryUrgent = dueHours <= 12;

                return (
                  <div
                    key={task.id}
                    className="flex items-center justify-between p-3 rounded-lg border border-slate-800/80 bg-slate-950/40 hover:border-slate-700 transition"
                  >
                    <div className="space-y-1 overflow-hidden pr-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                          {task.subject}
                        </span>
                        <p className="text-sm font-medium text-white truncate">{task.title}</p>
                      </div>
                      <p className="text-xs text-slate-400">
                        {isVeryUrgent ? (
                          <span className="text-red-400 font-semibold flex items-center gap-1 inline-flex">
                            <AlertTriangle className="h-3 w-3" /> Due in {Math.max(1, Math.round(dueHours))}h
                          </span>
                        ) : (
                          <span>Due in {Math.round(dueHours)}h</span>
                        )}{' '}
                        • {task.estimatedMinutes}m effort
                      </p>
                    </div>

                    <button
                      onClick={() => onCompleteTask(task.id)}
                      className="px-2.5 py-1 text-xs font-semibold rounded-md border border-slate-700 bg-slate-800/80 text-slate-300 hover:border-emerald-500/50 hover:bg-emerald-500/20 hover:text-emerald-300 transition"
                      title="Mark task completed"
                    >
                      Done
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Quick Conversational Prompts */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-cyan-400" />
              One-Click Agent Requests
            </h2>
            <span className="text-xs text-slate-400">Alexa+ Assistant</span>
          </div>

          <div className="space-y-3">
            {quickPrompts.map((qp, idx) => {
              const Icon = qp.icon;
              return (
                <button
                  key={idx}
                  onClick={() => onSelectPrompt(qp.prompt)}
                  className={`w-full text-left p-3.5 rounded-xl border bg-gradient-to-r ${qp.color} hover:brightness-110 transition group`}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 rounded-lg bg-slate-900/60 p-1.5 border border-white/10">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <p className="text-sm font-semibold text-white group-hover:text-cyan-200 transition">
                        {qp.title}
                      </p>
                      <p className="text-xs text-slate-300 mt-1 line-clamp-2">
                        "{qp.prompt}"
                      </p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-white group-hover:translate-x-0.5 transition" />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
