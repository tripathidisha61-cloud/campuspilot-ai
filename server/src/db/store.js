import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const isVercel = !!process.env.VERCEL;
const DATA_DIR = isVercel ? '/tmp' : path.resolve(__dirname, '../../data');
const DATA_FILE = path.join(DATA_DIR, 'campuspilot_store.json');

// Ensure data directory exists
try {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
} catch (e) {
  console.warn('[Store] Notice: running with in-memory persistence fallback:', e.message);
}

function loadInitialData() {
  const now = new Date();
  const tonight = new Date(now);
  tonight.setHours(20, 0, 0, 0);

  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(10, 0, 0, 0);

  const inTwoDays = new Date(now);
  inTwoDays.setDate(inTwoDays.getDate() + 2);
  inTwoDays.setHours(14, 0, 0, 0);

  const inThreeDays = new Date(now);
  inThreeDays.setDate(inThreeDays.getDate() + 3);
  inThreeDays.setHours(18, 0, 0, 0);

  return {
    tasks: [
      {
        id: 'task_dsa_01',
        title: 'Complete DSA assignment',
        subject: 'DSA',
        description: 'Solve and test five topological sort and graph cycle problems',
        dueAt: tonight.toISOString(),
        estimatedMinutes: 90,
        priority: 'high',
        status: 'pending',
        createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 2).toISOString(),
      },
      {
        id: 'task_dbms_02',
        title: 'DBMS Exam Revision',
        subject: 'DBMS',
        description: 'Comprehensive review of 1NF, 2NF, 3NF, BCNF normalization, ACID properties and serializability',
        dueAt: tomorrow.toISOString(),
        estimatedMinutes: 120,
        priority: 'high',
        status: 'pending',
        createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 5).toISOString(),
      },
      {
        id: 'task_os_03',
        title: 'Operating Systems Presentation',
        subject: 'OS',
        description: 'Design slide deck on virtual memory paging and LRU page replacement algorithm',
        dueAt: inTwoDays.toISOString(),
        estimatedMinutes: 60,
        priority: 'medium',
        status: 'pending',
        createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 24).toISOString(),
      },
      {
        id: 'task_algo_04',
        title: 'Algorithm Problem Set 4',
        subject: 'Algorithms',
        description: 'Practice dynamic programming: 0/1 Knapsack and Longest Common Subsequence',
        dueAt: inThreeDays.toISOString(),
        estimatedMinutes: 75,
        priority: 'low',
        status: 'pending',
        createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 36).toISOString(),
      }
    ],
    studyPlans: [],
    quizAttempts: [],
    agentRuns: []
  };
}

class CampusPilotStore {
  constructor() {
    this.data = this.read();
  }

  read() {
    try {
      if (fs.existsSync(DATA_FILE)) {
        const raw = fs.readFileSync(DATA_FILE, 'utf-8');
        return JSON.parse(raw);
      }
    } catch (e) {
      console.warn('[Store] Could not read existing store file, resetting to initial demo data:', e.message);
    }
    const initial = loadInitialData();
    this.write(initial);
    return initial;
  }

  write(data = this.data) {
    try {
      fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } catch (e) {
      console.error('[Store] Failed writing data file:', e.message);
    }
  }

  // --- Task Operations ---
  getTasks(filter = {}) {
    let result = [...this.data.tasks];
    if (filter.status) {
      result = result.filter(t => t.status === filter.status);
    }
    if (filter.subject) {
      result = result.filter(t => t.subject.toLowerCase() === filter.subject.toLowerCase());
    }
    return result;
  }

  getTaskById(id) {
    return this.data.tasks.find(t => t.id === id || t._id === id);
  }

  createTask(taskData) {
    const newTask = {
      id: 'task_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      title: taskData.title,
      subject: taskData.subject || 'General',
      description: taskData.description || '',
      dueAt: new Date(taskData.dueAt || Date.now() + 24 * 3600 * 1000).toISOString(),
      estimatedMinutes: Number(taskData.estimatedMinutes) || 60,
      priority: taskData.priority || 'medium',
      status: taskData.status || 'pending',
      createdAt: new Date().toISOString(),
    };
    this.data.tasks.unshift(newTask);
    this.write();
    return newTask;
  }

  updateTask(id, updates) {
    const task = this.getTaskById(id);
    if (!task) return null;
    if (updates.title !== undefined) task.title = updates.title;
    if (updates.subject !== undefined) task.subject = updates.subject;
    if (updates.description !== undefined) task.description = updates.description;
    if (updates.dueAt !== undefined) task.dueAt = new Date(updates.dueAt).toISOString();
    if (updates.estimatedMinutes !== undefined) task.estimatedMinutes = Number(updates.estimatedMinutes);
    if (updates.priority !== undefined) task.priority = updates.priority;
    if (updates.status !== undefined) task.status = updates.status;
    this.write();
    return task;
  }

  completeTask(id) {
    return this.updateTask(id, { status: 'completed' });
  }

  deleteTask(id) {
    const idx = this.data.tasks.findIndex(t => t.id === id || t._id === id);
    if (idx === -1) return false;
    this.data.tasks.splice(idx, 1);
    this.write();
    return true;
  }

  // --- Study Plan Operations ---
  savePlan(planData) {
    const newPlan = {
      id: 'plan_' + Date.now(),
      date: planData.date || new Date().toISOString().split('T')[0],
      availableMinutes: planData.availableMinutes,
      blocks: planData.blocks || [],
      warnings: planData.warnings || [],
      deferredTasks: planData.deferredTasks || [],
      metrics: planData.metrics || {},
      createdAt: new Date().toISOString(),
    };
    this.data.studyPlans.unshift(newPlan);
    this.write();
    return newPlan;
  }

  getPlans(limit = 10) {
    return this.data.studyPlans.slice(0, limit);
  }

  getPlanById(id) {
    return this.data.studyPlans.find(p => p.id === id);
  }

  // --- Quiz Attempt Operations ---
  saveQuiz(quizData) {
    const newQuiz = {
      id: 'quiz_' + Date.now(),
      topic: quizData.topic,
      questions: quizData.questions || [],
      answers: quizData.answers || [],
      score: quizData.score || 0,
      totalQuestions: (quizData.questions || []).length,
      completed: !!quizData.completed,
      source: quizData.source || 'campus_pilot_ai',
      createdAt: new Date().toISOString(),
    };
    this.data.quizAttempts.unshift(newQuiz);
    this.write();
    return newQuiz;
  }

  getQuizById(id) {
    return this.data.quizAttempts.find(q => q.id === id);
  }

  getQuizzes(limit = 10) {
    return this.data.quizAttempts.slice(0, limit);
  }

  submitQuiz(id, answers) {
    const quiz = this.getQuizById(id);
    if (!quiz) return null;
    quiz.answers = answers;
    let score = 0;
    quiz.questions.forEach((q, idx) => {
      if (answers[idx] === q.correctAnswerIndex) {
        score++;
      }
    });
    quiz.score = score;
    quiz.completed = true;
    quiz.submittedAt = new Date().toISOString();
    this.write();
    return quiz;
  }

  // --- Agent Runs / MCP Audit Trail ---
  recordAgentRun(runData) {
    const run = {
      id: 'run_' + Date.now(),
      request: runData.request,
      toolCalls: runData.toolCalls || [],
      outcome: runData.outcome || '',
      provider: runData.provider || 'Bedrock/Deterministic',
      durationMs: runData.durationMs || 0,
      createdAt: new Date().toISOString(),
    };
    this.data.agentRuns.unshift(run);
    if (this.data.agentRuns.length > 50) {
      this.data.agentRuns = this.data.agentRuns.slice(0, 50);
    }
    this.write();
    return run;
  }

  getAgentRuns(limit = 20) {
    return this.data.agentRuns.slice(0, limit);
  }

  resetToSeed() {
    this.data = loadInitialData();
    this.write();
    return this.data;
  }
}

export const store = new CampusPilotStore();
