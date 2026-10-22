import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { registerMcpTools, MCP_TOOLS_METADATA } from './tools.js';
import { store } from '../db/store.js';

let mcpServerInstance = null;
let mcpTransportInstance = null;

export async function createAndStartMcpServer() {
  if (mcpServerInstance) return { server: mcpServerInstance, transport: mcpTransportInstance };

  const server = new McpServer(
    {
      name: 'campuspilot-mcp-server',
      version: '1.0.0',
    },
    {
      capabilities: {
        tools: {},
        logging: {},
      },
    }
  );

  registerMcpTools(server);

  const transport = new StreamableHTTPServerTransport();
  await server.connect(transport);

  mcpServerInstance = server;
  mcpTransportInstance = transport;

  console.log('[MCP] CampusPilot MCP Server initialized with Streamable HTTP transport (Spec 2025-11-25)');
  return { server, transport };
}

/**
 * Handle incoming Streamable HTTP requests for /mcp
 */
export async function handleStreamableHttpRequest(req, res) {
  if (!mcpTransportInstance) {
    await createAndStartMcpServer();
  }

  try {
    await mcpTransportInstance.handleRequest(req, res, req.body);
  } catch (error) {
    console.error('[MCP Transport Error]', error);
    if (!res.headersSent) {
      res.status(500).json({ error: error.message });
    }
  }
}

/**
 * Directly execute an MCP tool with full audit trail logging
 */
export async function executeMcpTool(name, args = {}) {
  const startTime = Date.now();
  let status = 'success';
  let error = null;
  let result = null;

  try {
    switch (name) {
      case 'get_tasks': {
        const filter = {};
        if (args.status && args.status !== 'all') filter.status = args.status;
        if (args.subject) filter.subject = args.subject;
        const tasks = store.getTasks(filter);
        result = { count: tasks.length, tasks };
        break;
      }
      case 'create_task': {
        result = store.createTask(args);
        break;
      }
      case 'update_task': {
        const { id, ...updates } = args;
        const updated = store.updateTask(id, updates);
        if (!updated) throw new Error(`Task with id ${id} not found`);
        result = updated;
        break;
      }
      case 'complete_task': {
        const completed = store.completeTask(args.id);
        if (!completed) throw new Error(`Task with id ${args.id} not found`);
        result = completed;
        break;
      }
      case 'plan_day': {
        const { generateStudyPlan } = await import('../services/plannerService.js');
        result = generateStudyPlan(args);
        break;
      }
      case 'generate_quiz': {
        const { generateQuiz } = await import('../services/quizService.js');
        result = await generateQuiz(args);
        break;
      }
      case 'submit_quiz': {
        const { submitQuiz } = await import('../services/quizService.js');
        result = submitQuiz(args.quizId, args.answers);
        break;
      }
      default:
        throw new Error(`Unknown MCP Tool: ${name}`);
    }
  } catch (err) {
    status = 'error';
    error = err.message;
  }

  const durationMs = Date.now() - startTime;

  return {
    name,
    input: args,
    output: result,
    status,
    error,
    durationMs,
    protocol: 'mcp-streamable-http',
  };
}

export function getMcpMetadata() {
  return {
    server: 'campuspilot-mcp-server',
    version: '1.0.0',
    specification: '2025-11-25',
    transport: 'Streamable HTTP (/mcp)',
    tools: MCP_TOOLS_METADATA,
  };
}
