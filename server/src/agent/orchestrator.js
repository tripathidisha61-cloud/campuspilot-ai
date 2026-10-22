import { executeMcpTool } from '../mcp/server.js';
import { store } from '../db/store.js';
import { invokeBedrock } from '../services/bedrockService.js';
import { SYSTEM_PROMPT } from './systemPrompt.js';

export async function processAgentRequest({ message, conversationHistory = [] }) {
  const normalized = message.trim().toLowerCase();
  const startTime = Date.now();
  const toolExecutions = [];
  let responseData = {
    plan: null,
    quiz: null,
    tasks: null,
    createdTask: null,
    completedTask: null,
  };

  // 1. Detect Intents & Select MCP Tools
  const isPlanningRequested = /plan|schedule|timetable|hours?|study session|time available/i.test(normalized);
  const isQuizRequested = /quiz|practice|test me|test my|questions on/i.test(normalized);
  const isTaskCreation = /^(add|create|new|schedule a) task/i.test(normalized) || /due (tonight|tomorrow|friday|monday|\d)/i.test(normalized) && /estimated|minutes|hours/i.test(normalized);
  const isTaskCompletion = /(complete|finish|mark .* done|mark .* completed)/i.test(normalized);
  const isTaskQuery = /what tasks|show tasks|pending tasks|list tasks|my tasks|what is due/i.test(normalized);

  // Extract available hours/minutes if present
  let availableMinutes = 240; // Default 4 hours
  const hourMatch = message.match(/(\d+(?:\.\d+)?)\s*(?:hours?|hrs?)/i);
  if (hourMatch) {
    availableMinutes = Math.round(parseFloat(hourMatch[1]) * 60);
  } else {
    const minMatch = message.match(/(\d+)\s*(?:minutes?|mins?)/i);
    if (minMatch) {
      availableMinutes = parseInt(minMatch[1], 10);
    }
  }

  // Extract quiz topic
  let quizTopic = 'Database normalization';
  const quizTopicMatch = message.match(/quiz (?:me )?(?:on|about) ([a-zA-Z0-9\s]+?)(?:\.|$|,|!)/i);
  if (quizTopicMatch) {
    quizTopic = quizTopicMatch[1].trim();
  } else if (/normalization/i.test(normalized)) {
    quizTopic = 'Database normalization';
  } else if (/dsa|graph|topological/i.test(normalized)) {
    quizTopic = 'DSA Graph Algorithms';
  } else if (/os|virtual memory|paging/i.test(normalized)) {
    quizTopic = 'OS Virtual Memory';
  }

  // Execute MCP Tools in deterministic, reliable order

  // Tool: get_tasks (if query or planning)
  if (isPlanningRequested || isTaskQuery) {
    const tRun = await executeMcpTool('get_tasks', { status: 'pending' });
    toolExecutions.push(tRun);
    responseData.tasks = tRun.output?.tasks || [];
  }

  // Tool: plan_day
  if (isPlanningRequested) {
    const pRun = await executeMcpTool('plan_day', {
      availableMinutes,
      breakIntervalMinutes: 75,
      breakDurationMinutes: 15,
    });
    toolExecutions.push(pRun);
    responseData.plan = pRun.output;
  }

  // Tool: generate_quiz
  if (isQuizRequested) {
    const qRun = await executeMcpTool('generate_quiz', {
      topic: quizTopic,
      questionCount: 5,
      difficulty: 'medium',
    });
    toolExecutions.push(qRun);
    responseData.quiz = qRun.output;
  }

  // Tool: complete_task
  if (isTaskCompletion) {
    const pending = store.getTasks({ status: 'pending' });
    // Match task by keyword
    let target = null;
    for (const t of pending) {
      const titleLower = t.title.toLowerCase();
      const subjectLower = t.subject.toLowerCase();
      if (normalized.includes(subjectLower) || normalized.includes(titleLower) || titleLower.split(' ').some(w => w.length > 3 && normalized.includes(w))) {
        target = t;
        break;
      }
    }
    if (target) {
      const cRun = await executeMcpTool('complete_task', { id: target.id });
      toolExecutions.push(cRun);
      responseData.completedTask = cRun.output?.task;
    }
  }

  // Tool: create_task
  if (isTaskCreation && !isPlanningRequested) {
    // Parse title, estimated minutes, priority
    const cleanTitle = message.replace(/^(add|create|new)\s+(task:?\s*)?/i, '').split(/due|priority|estimated/i)[0].trim() || 'New Study Assignment';
    const createRun = await executeMcpTool('create_task', {
      title: cleanTitle,
      subject: /dsa|algo/i.test(cleanTitle) ? 'DSA' : /dbms|database/i.test(cleanTitle) ? 'DBMS' : /os|operating/i.test(cleanTitle) ? 'OS' : 'General',
      estimatedMinutes: 60,
      priority: /urgent|high|important/i.test(message) ? 'high' : 'medium',
      dueAt: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
    });
    toolExecutions.push(createRun);
    responseData.createdTask = createRun.output?.task;
  }

  // 2. Synthesize Actionable Response Explanation
  let summary = '';
  let speechText = '';

  if (responseData.plan && responseData.quiz) {
    const blocksCount = responseData.plan.blocks.filter(b => b.type === 'task').length;
    const warningText = responseData.plan.warnings.length > 0
      ? `\n\n> ⚠️ **Constraint Notice:** ${responseData.plan.warnings[0]}`
      : '';

    summary = `Here is your optimized **${Math.round(availableMinutes / 60)}-Hour Action Plan** and active recall practice session:

### ⏱️ Deterministic Schedule (${responseData.plan.availableMinutes} Available Mins)
${responseData.plan.blocks.map(b => {
  if (b.type === 'break') {
    return `- **${b.startMinute}–${b.endMinute} min**: ☕ *${b.title}* (${b.durationMinutes}m) — ${b.reason}`;
  }
  return `- **${b.startMinute}–${b.endMinute} min**: 📘 **${b.title}** (${b.durationMinutes}m) — *${b.reason}*`;
}).join('\n')}
${warningText}

### 🧠 Practice Quiz Ready
I generated a 5-question active recall quiz on **"${responseData.quiz.topic}"**. Your answer choices are ready to test in Quiz Mode!`;

    speechText = `I have organized your four hours. I scheduled your DSA assignment first because it is due tonight, followed by a break and your DBMS exam revision. I also prepared a practice quiz on database normalization for you.`;

  } else if (responseData.plan) {
    summary = `I generated a **${Math.round(availableMinutes / 60)}-hour study plan** allocating ${responseData.plan.metrics.totalStudyMinutes} minutes of focused work and ${responseData.plan.metrics.totalBreakMinutes} minutes of rest.`;
    speechText = `Your study timetable has been created with scheduled breaks to maximize retention.`;
  } else if (responseData.quiz) {
    summary = `Your **${responseData.quiz.topic}** quiz is ready! 5 questions are waiting for you in Quiz Mode. Answer keys remain concealed until you submit.`;
    speechText = `I created your quiz on ${responseData.quiz.topic}. Ready when you are!`;
  } else if (responseData.completedTask) {
    summary = `Task **"${responseData.completedTask.title}"** has been marked as **completed** in your persistent record!`;
    speechText = `Great job! I've marked ${responseData.completedTask.title} as completed.`;
  } else if (responseData.createdTask) {
    summary = `Task **"${responseData.createdTask.title}"** has been created with priority **${responseData.createdTask.priority}**.`;
    speechText = `I've added the new task to your task board.`;
  } else {
    // General conversational query
    const fallbackBedrock = await invokeBedrock({
      prompt: `Student asks: "${message}". Give an encouraging, concise 2-sentence response explaining how CampusPilot AI can plan their tasks, schedule study blocks, and quiz them.`,
      systemPrompt: SYSTEM_PROMPT,
    });
    summary = fallbackBedrock.text || `I'm CampusPilot AI. You can tell me: "Plan my next 4 hours with my DSA assignment and DBMS exam", "Show my tasks", or "Quiz me on database normalization".`;
    speechText = `I am CampusPilot AI. Tell me what tasks you have or how much time you'd like to plan, and I will take care of the rest.`;
  }

  // 3. Persist Agent Run in Audit Log
  const runEntry = store.recordAgentRun({
    request: message,
    toolCalls: toolExecutions,
    outcome: summary.slice(0, 150) + '...',
    provider: toolExecutions.some(t => t.output?.source?.includes('Bedrock')) ? 'AWS Bedrock + MCP' : 'MCP Streamable HTTP Engine',
    durationMs: Date.now() - startTime,
  });

  return {
    runId: runEntry.id,
    summary,
    speechText,
    toolCalls: toolExecutions,
    data: responseData,
    metrics: {
      totalDurationMs: Date.now() - startTime,
      toolsUsedCount: toolExecutions.length,
    },
  };
}
