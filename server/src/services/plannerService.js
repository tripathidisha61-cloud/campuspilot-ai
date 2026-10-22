import { store } from '../db/store.js';

/**
 * Deterministic Constraint-Aware Academic Planner
 * Implements S = 0.5D + 0.3I + 0.2E
 * Where:
 *  - D: Deadline urgency (0 - 100)
 *  - I: Importance (0 - 100)
 *  - E: Effort/Relevance (0 - 100)
 */

export function calculateTaskUrgency(task, referenceTime = new Date()) {
  const now = new Date(referenceTime).getTime();
  const due = new Date(task.dueAt).getTime();
  const hoursUntilDue = (due - now) / (1000 * 60 * 60);

  // 1. Deadline Proximity Score (D: 0 - 100)
  let D = 20;
  if (hoursUntilDue <= 0) {
    D = 100; // Overdue
  } else if (hoursUntilDue <= 12) {
    D = 100; // Due tonight / within 12 hours
  } else if (hoursUntilDue <= 24) {
    D = 85; // Due tomorrow
  } else if (hoursUntilDue <= 48) {
    D = 65; // Due in 2 days
  } else if (hoursUntilDue <= 72) {
    D = 45; // Due in 3 days
  } else {
    D = 25;
  }

  // 2. Importance Score (I: 0 - 100)
  let I = 50;
  switch (task.priority?.toLowerCase()) {
    case 'high':
      I = 95;
      break;
    case 'medium':
      I = 65;
      break;
    case 'low':
      I = 35;
      break;
    default:
      I = 50;
  }

  // 3. Effort & Exam Relevance (E: 0 - 100)
  const isExamOrQuiz = /exam|quiz|test|midterm|final|revision/i.test(
    `${task.title} ${task.description} ${task.subject}`
  );
  let E = Math.min(80, (task.estimatedMinutes || 60) * 0.7);
  if (isExamOrQuiz) {
    E = Math.min(100, E + 25);
  }

  // Weighted formula: S = 0.5D + 0.3I + 0.2E
  const score = Math.round(0.5 * D + 0.3 * I + 0.2 * E);

  return {
    score,
    D,
    I,
    E,
    hoursUntilDue: Math.max(0, Math.round(hoursUntilDue * 10) / 10),
  };
}

export function generateStudyPlan({
  availableMinutes = 240, // default 4 hours
  breakIntervalMinutes = 75,
  breakDurationMinutes = 15,
  date = new Date().toISOString().split('T')[0],
  filterSubject = null,
} = {}) {
  const allTasks = store.getTasks({ status: 'pending' });
  const eligibleTasks = filterSubject
    ? allTasks.filter(t => t.subject.toLowerCase() === filterSubject.toLowerCase())
    : allTasks;

  if (eligibleTasks.length === 0) {
    return {
      date,
      availableMinutes,
      blocks: [],
      warnings: ['No pending tasks found. All caught up!'],
      deferredTasks: [],
      metrics: { totalStudyMinutes: 0, totalBreakMinutes: 0, capacityUtilization: 0 },
    };
  }

  // Calculate scores and sort descending
  const scoredTasks = eligibleTasks.map(task => {
    const analysis = calculateTaskUrgency(task);
    return {
      ...task,
      urgencyScore: analysis.score,
      analysis,
    };
  });

  scoredTasks.sort((a, b) => b.urgencyScore - a.urgencyScore);

  const blocks = [];
  const deferredTasks = [];
  const warnings = [];

  let currentMinute = 0;
  let minutesSinceLastBreak = 0;
  let totalStudyMinutes = 0;
  let totalBreakMinutes = 0;

  for (const task of scoredTasks) {
    const taskMinutes = task.estimatedMinutes || 60;

    // Check if inserting a break is needed before this task
    if (
      minutesSinceLastBreak >= breakIntervalMinutes &&
      currentMinute + breakDurationMinutes + 30 <= availableMinutes
    ) {
      blocks.push({
        type: 'break',
        title: 'Cognitive Reset & Hydration Break',
        durationMinutes: breakDurationMinutes,
        startMinute: currentMinute,
        endMinute: currentMinute + breakDurationMinutes,
        reason: 'Recommended rest interval to maintain active recall retention and prevent cognitive fatigue.',
      });
      currentMinute += breakDurationMinutes;
      totalBreakMinutes += breakDurationMinutes;
      minutesSinceLastBreak = 0;
    }

    const remainingTime = availableMinutes - currentMinute;

    if (taskMinutes <= remainingTime) {
      // Task fits completely
      blocks.push({
        type: 'task',
        taskId: task.id,
        title: task.title,
        subject: task.subject,
        durationMinutes: taskMinutes,
        startMinute: currentMinute,
        endMinute: currentMinute + taskMinutes,
        urgencyScore: task.urgencyScore,
        priority: task.priority,
        reason: `Urgency score ${task.urgencyScore}/100. Due in ${task.analysis.hoursUntilDue}h (${task.priority} priority).`,
      });
      currentMinute += taskMinutes;
      totalStudyMinutes += taskMinutes;
      minutesSinceLastBreak += taskMinutes;
    } else if (remainingTime >= 30) {
      // Task partially fits (allocated partial chunk)
      const allocatedChunk = remainingTime;
      blocks.push({
        type: 'task',
        taskId: task.id,
        title: `${task.title} (Part 1 - Priority Block)`,
        subject: task.subject,
        durationMinutes: allocatedChunk,
        startMinute: currentMinute,
        endMinute: currentMinute + allocatedChunk,
        urgencyScore: task.urgencyScore,
        priority: task.priority,
        reason: `Partial study block: allocated ${allocatedChunk} mins of ${taskMinutes} mins estimated. Urgency score ${task.urgencyScore}.`,
      });
      currentMinute += allocatedChunk;
      totalStudyMinutes += allocatedChunk;
      minutesSinceLastBreak += allocatedChunk;

      deferredTasks.push({
        taskId: task.id,
        title: `${task.title} (Remaining ${taskMinutes - allocatedChunk} mins)`,
        reason: `Workload exceeds available study window by ${taskMinutes - allocatedChunk} minutes.`,
        urgencyScore: task.urgencyScore,
      });
    } else {
      // Task cannot fit at all
      deferredTasks.push({
        taskId: task.id,
        title: task.title,
        subject: task.subject,
        reason: `Deferred due to time constraint (${availableMinutes} min limit reached). Scheduled for next available session.`,
        urgencyScore: task.urgencyScore,
      });
    }
  }

  // Check for capacity overload and generate constraint warning
  const totalWorkloadNeeded = scoredTasks.reduce((sum, t) => sum + (t.estimatedMinutes || 60), 0);
  if (totalWorkloadNeeded > availableMinutes) {
    const deficitMinutes = totalWorkloadNeeded - availableMinutes;
    const hours = Math.floor(deficitMinutes / 60);
    const mins = deficitMinutes % 60;
    const deficitStr = hours > 0 ? `${hours}h ${mins}m` : `${mins} mins`;

    warnings.push(
      `Constraint Overload Detected: Total workload (${Math.round(totalWorkloadNeeded / 60 * 10) / 10}h) exceeds your ${Math.round(availableMinutes / 60)}h available window by ${deficitStr}. Priority algorithm allocated the most urgent assignments first and deferred ${deferredTasks.length} lower-urgency tasks.`
    );
  }

  const plan = {
    date,
    availableMinutes,
    blocks,
    warnings,
    deferredTasks,
    metrics: {
      totalStudyMinutes,
      totalBreakMinutes,
      totalAllocatedMinutes: currentMinute,
      capacityUtilization: Math.min(100, Math.round((currentMinute / availableMinutes) * 100)),
      totalPendingWorkloadMinutes: totalWorkloadNeeded,
    },
  };

  // Persist plan in store
  const savedPlan = store.savePlan(plan);
  return savedPlan;
}
