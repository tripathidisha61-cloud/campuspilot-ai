import React, { useState } from 'react';
import {
  Plus,
  CheckCircle2,
  Clock,
  AlertCircle,
  Trash2,
  Filter,
  CheckSquare,
  BookOpen,
} from 'lucide-react';

export default function TaskBoard({
  tasks = [],
  onCreateTask,
  onCompleteTask,
  onDeleteTask,
}) {
  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New task form state
  const [newTitle, setNewTitle] = useState('');
  const [newSubject, setNewSubject] = useState('DSA');
  const [newDueAt, setNewDueAt] = useState('');
  const [newMinutes, setNewMinutes] = useState(60);
  const [newPriority, setNewPriority] = useState('medium');
  const [newDescription, setNewDescription] = useState('');

  const subjects = ['all', 'DSA', 'DBMS', 'OS', 'Algorithms'];

  const filteredTasks = tasks.filter((t) => {
    if (activeFilter !== 'all' && t.status !== activeFilter) return false;
    if (selectedSubject !== 'all' && t.subject.toLowerCase() !== selectedSubject.toLowerCase())
      return false;
    return true;
  });

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    onCreateTask({
      title: newTitle.trim(),
      subject: newSubject,
      dueAt: newDueAt || new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
      estimatedMinutes: Number(newMinutes) || 60,
      priority: newPriority,
      description: newDescription.trim(),
    });

    setNewTitle('');
    setNewDescription('');
    setIsAddModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-md">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <CheckSquare className="h-5 w-5 text-indigo-400" />
            Academic Task Board
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Persistent academic assignments, exam dates, and priority scores.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 px-4 py-2.5 text-xs font-semibold text-white shadow-lg shadow-indigo-600/30 hover:brightness-110 transition self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>Add Academic Task</span>
        </button>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
        {/* Status Filter */}
        <div className="flex items-center gap-1">
          {['all', 'pending', 'completed'].map((status) => (
            <button
              key={status}
              onClick={() => setActiveFilter(status)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition ${
                activeFilter === status
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-850'
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        {/* Subject Filter */}
        <div className="flex items-center gap-1.5 overflow-x-auto">
          <span className="text-xs text-slate-500 font-medium">Subject:</span>
          {subjects.map((sub) => (
            <button
              key={sub}
              onClick={() => setSelectedSubject(sub)}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition ${
                selectedSubject === sub
                  ? 'bg-slate-800 text-cyan-300 border border-cyan-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {sub.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Task Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredTasks.length === 0 ? (
          <div className="col-span-full rounded-2xl border border-slate-800 bg-slate-900/40 p-12 text-center text-sm text-slate-400">
            No matching tasks found.
          </div>
        ) : (
          filteredTasks.map((task) => {
            const isCompleted = task.status === 'completed';
            const dueHours = (new Date(task.dueAt).getTime() - Date.now()) / (1000 * 60 * 60);

            return (
              <div
                key={task.id}
                className={`flex flex-col justify-between p-4 rounded-xl border transition ${
                  isCompleted
                    ? 'border-slate-800/60 bg-slate-950/30 opacity-75'
                    : 'border-slate-800 bg-slate-900/70 hover:border-slate-700 shadow-md'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="rounded bg-indigo-500/20 border border-indigo-500/30 px-2 py-0.5 text-xs font-bold text-indigo-300">
                        {task.subject}
                      </span>
                      <span
                        className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full border ${
                          task.priority === 'high'
                            ? 'bg-red-500/10 text-red-400 border-red-500/30'
                            : task.priority === 'medium'
                            ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                            : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                        }`}
                      >
                        {task.priority}
                      </span>
                    </div>

                    <button
                      onClick={() => onDeleteTask(task.id)}
                      className="text-slate-500 hover:text-red-400 transition p-1"
                      title="Delete task"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <div>
                    <h3
                      className={`text-sm font-semibold ${
                        isCompleted ? 'line-through text-slate-500' : 'text-white'
                      }`}
                    >
                      {task.title}
                    </h3>
                    {task.description && (
                      <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                        {task.description}
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                  <div className="flex items-center gap-2 font-mono">
                    <Clock className="h-3.5 w-3.5 text-amber-400" />
                    <span>
                      {dueHours <= 0
                        ? 'Overdue'
                        : dueHours <= 12
                        ? `Due in ${Math.round(dueHours)}h (Tonight)`
                        : dueHours <= 24
                        ? 'Due tomorrow'
                        : `Due in ${Math.round(dueHours / 24)} days`}
                    </span>
                    <span>• {task.estimatedMinutes}m</span>
                  </div>

                  {!isCompleted ? (
                    <button
                      onClick={() => onCompleteTask(task.id)}
                      className="px-2.5 py-1 rounded-md border border-slate-700 bg-slate-800 text-xs font-semibold text-slate-200 hover:border-emerald-500/50 hover:bg-emerald-500/20 hover:text-emerald-300 transition"
                    >
                      Mark Complete
                    </button>
                  ) : (
                    <span className="text-emerald-400 flex items-center gap-1 text-[11px] font-semibold">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Completed
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add Task Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-[#0F172A] p-6 shadow-2xl space-y-4">
            <h2 className="text-base font-bold text-white">Add New Academic Task</h2>

            <form onSubmit={handleCreateSubmit} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 font-medium block mb-1">Task Title *</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g., Complete Graph Cycle Algorithm Lab"
                  className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-medium block mb-1">Subject</label>
                  <select
                    value={newSubject}
                    onChange={(e) => setNewSubject(e.target.value)}
                    className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-white focus:border-indigo-500 focus:outline-none"
                  >
                    <option value="DSA">DSA</option>
                    <option value="DBMS">DBMS</option>
                    <option value="OS">OS</option>
                    <option value="Algorithms">Algorithms</option>
                    <option value="General">General</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-300 font-medium block mb-1">Priority</label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value)}
                    className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-white focus:border-indigo-500 focus:outline-none"
                  >
                    <option value="high">High (Urgent)</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-medium block mb-1">Estimated Minutes</label>
                  <input
                    type="number"
                    min="15"
                    step="15"
                    value={newMinutes}
                    onChange={(e) => setNewMinutes(e.target.value)}
                    className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-white focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-medium block mb-1">Due Date</label>
                  <input
                    type="datetime-local"
                    value={newDueAt}
                    onChange={(e) => setNewDueAt(e.target.value)}
                    className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-white focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-medium block mb-1">Description / Notes</label>
                <textarea
                  rows="2"
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Subtopics, problem numbers, or exam topics"
                  className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
                ></textarea>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="rounded-lg px-4 py-2 text-xs font-medium text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-500 transition"
                >
                  Save Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
