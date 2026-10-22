import { z } from 'zod';
import { store } from '../db/store.js';
import { generateStudyPlan } from '../services/plannerService.js';
import { generateQuiz, submitQuiz } from '../services/quizService.js';

/**
 * Register all 7 core MCP tools with an McpServer instance
 */
export function registerMcpTools(mcpServer) {
  // 1. get_tasks
  mcpServer.tool(
    'get_tasks',
    {
      status: z.enum(['pending', 'in_progress', 'completed', 'all']).optional().describe('Filter tasks by status'),
      subject: z.string().optional().describe('Filter tasks by academic subject (e.g., DSA, DBMS, OS)'),
    },
    async ({ status, subject }) => {
      const filter = {};
      if (status && status !== 'all') filter.status = status;
      if (subject) filter.subject = subject;
      const tasks = store.getTasks(filter);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({ count: tasks.length, tasks }, null, 2),
          },
        ],
      };
    }
  );

  // 2. create_task
  mcpServer.tool(
    'create_task',
    {
      title: z.string().describe('Title or name of the academic assignment/exam'),
      subject: z.string().optional().default('General').describe('Academic course or subject code'),
      dueAt: z.string().optional().describe('ISO timestamp or relative deadline date for the task'),
      estimatedMinutes: z.number().positive().optional().default(60).describe('Estimated effort in minutes'),
      priority: z.enum(['low', 'medium', 'high']).optional().default('medium').describe('Academic urgency/priority'),
      description: z.string().optional().default('').describe('Detailed instructions or subtopics'),
    },
    async (taskData) => {
      const task = store.createTask(taskData);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({ message: 'Task created successfully', task }, null, 2),
          },
        ],
      };
    }
  );

  // 3. update_task
  mcpServer.tool(
    'update_task',
    {
      id: z.string().describe('ID of the task to update'),
      title: z.string().optional(),
      subject: z.string().optional(),
      dueAt: z.string().optional(),
      estimatedMinutes: z.number().positive().optional(),
      priority: z.enum(['low', 'medium', 'high']).optional(),
      status: z.enum(['pending', 'in_progress', 'completed']).optional(),
      description: z.string().optional(),
    },
    async ({ id, ...updates }) => {
      const task = store.updateTask(id, updates);
      if (!task) {
        throw new Error(`Task with ID ${id} not found.`);
      }
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({ message: 'Task updated successfully', task }, null, 2),
          },
        ],
      };
    }
  );

  // 4. complete_task
  mcpServer.tool(
    'complete_task',
    {
      id: z.string().describe('ID of the task to mark as completed'),
    },
    async ({ id }) => {
      const task = store.completeTask(id);
      if (!task) {
        throw new Error(`Task with ID ${id} not found.`);
      }
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({ message: 'Task marked as completed', task }, null, 2),
          },
        ],
      };
    }
  );

  // 5. plan_day
  mcpServer.tool(
    'plan_day',
    {
      availableMinutes: z.number().positive().optional().default(240).describe('Total study window in minutes (e.g. 240 for 4 hours)'),
      breakIntervalMinutes: z.number().positive().optional().default(75).describe('Continuous study minutes before a break'),
      breakDurationMinutes: z.number().positive().optional().default(15).describe('Rest break length in minutes'),
      filterSubject: z.string().optional().describe('Optionally focus exclusively on one subject'),
    },
    async (planParams) => {
      const plan = generateStudyPlan(planParams);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(plan, null, 2),
          },
        ],
      };
    }
  );

  // 6. generate_quiz
  mcpServer.tool(
    'generate_quiz',
    {
      topic: z.string().describe('Academic topic (e.g., "Database normalization", "Kahn\'s Algorithm", "Virtual Memory")'),
      questionCount: z.number().int().min(1).max(10).optional().default(5).describe('Number of practice questions'),
      difficulty: z.enum(['easy', 'medium', 'hard']).optional().default('medium').describe('Target cognitive difficulty level'),
    },
    async (quizParams) => {
      const quiz = await generateQuiz(quizParams);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(quiz, null, 2),
          },
        ],
      };
    }
  );

  // 7. submit_quiz
  mcpServer.tool(
    'submit_quiz',
    {
      quizId: z.string().describe('The ID of the quiz being completed'),
      answers: z.array(z.number().int()).describe('Array of chosen option indices corresponding to questions'),
    },
    async ({ quizId, answers }) => {
      const result = submitQuiz(quizId, answers);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    }
  );
}

// Tool metadata array for frontend inspector and agent planning
export const MCP_TOOLS_METADATA = [
  {
    name: 'get_tasks',
    description: 'Retrieve pending or completed academic tasks filtered by status and subject.',
    inputSchema: {
      type: 'object',
      properties: {
        status: { type: 'string', enum: ['pending', 'in_progress', 'completed', 'all'], description: 'Task status' },
        subject: { type: 'string', description: 'Academic subject code' }
      }
    }
  },
  {
    name: 'create_task',
    description: 'Add a new academic assignment, project, or exam with deadline and estimated effort.',
    inputSchema: {
      type: 'object',
      required: ['title'],
      properties: {
        title: { type: 'string', description: 'Assignment title' },
        subject: { type: 'string', description: 'Subject or course' },
        dueAt: { type: 'string', description: 'Due date / deadline timestamp' },
        estimatedMinutes: { type: 'number', description: 'Estimated study duration in minutes' },
        priority: { type: 'string', enum: ['low', 'medium', 'high'] },
        description: { type: 'string' }
      }
    }
  },
  {
    name: 'update_task',
    description: 'Update deadline, priority, effort, or title for an existing academic task.',
    inputSchema: {
      type: 'object',
      required: ['id'],
      properties: {
        id: { type: 'string' },
        title: { type: 'string' },
        priority: { type: 'string', enum: ['low', 'medium', 'high'] },
        estimatedMinutes: { type: 'number' }
      }
    }
  },
  {
    name: 'complete_task',
    description: 'Mark an academic task as completed.',
    inputSchema: {
      type: 'object',
      required: ['id'],
      properties: {
        id: { type: 'string', description: 'Task ID' }
      }
    }
  },
  {
    name: 'plan_day',
    description: 'Deterministic academic planner allocating available study time, breaks, and overload warnings using S = 0.5D + 0.3I + 0.2E.',
    inputSchema: {
      type: 'object',
      properties: {
        availableMinutes: { type: 'number', description: 'Available study window in minutes' },
        breakIntervalMinutes: { type: 'number', description: 'Minutes before break' },
        breakDurationMinutes: { type: 'number', description: 'Break duration in minutes' }
      }
    }
  },
  {
    name: 'generate_quiz',
    description: 'Generate an active recall multiple-choice practice quiz with concealed answer keys (AWS Bedrock-powered).',
    inputSchema: {
      type: 'object',
      required: ['topic'],
      properties: {
        topic: { type: 'string', description: 'Subject or topic to test' },
        questionCount: { type: 'number', description: 'Number of questions' },
        difficulty: { type: 'string', enum: ['easy', 'medium', 'hard'] }
      }
    }
  },
  {
    name: 'submit_quiz',
    description: 'Submit answers for evaluation, calculate score, and reveal detailed rationales.',
    inputSchema: {
      type: 'object',
      required: ['quizId', 'answers'],
      properties: {
        quizId: { type: 'string' },
        answers: { type: 'array', items: { type: 'number' } }
      }
    }
  }
];
