import express from 'express';
import cors from 'cors';
import { config } from './config.js';
import { connectDB } from './db/connection.js';
import { createAndStartMcpServer, handleStreamableHttpRequest, getMcpMetadata } from './mcp/server.js';

import tasksRouter from './routes/tasks.js';
import plansRouter from './routes/plans.js';
import quizzesRouter from './routes/quizzes.js';
import agentRouter from './routes/agent.js';

const app = express();

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-mcp-session-id', 'accept'],
}));
app.use(express.json());

// 1. MCP Streamable HTTP Endpoint (Specification 2025-11-25 or later)
app.all('/mcp', async (req, res) => {
  await handleStreamableHttpRequest(req, res);
});

// MCP Metadata discovery endpoint
app.get('/api/mcp/tools', (req, res) => {
  res.json({ success: true, ...getMcpMetadata() });
});

// 2. Application REST API Routes
app.use('/api/tasks', tasksRouter);
app.use('/api/plans', plansRouter);
app.use('/api/quizzes', quizzesRouter);
app.use('/api/agent', agentRouter);

// Root information endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'CampusPilot AI Server',
    tagline: 'Turn academic chaos into a clear plan of action',
    tracks: {
      primary: 'Alexa+ (MCP Server over Streamable HTTP)',
      mini: 'AWS Builder (Amazon Bedrock Runtime)',
    },
    endpoints: {
      mcp: '/mcp',
      mcpTools: '/api/mcp/tools',
      tasks: '/api/tasks',
      plans: '/api/plans',
      quizzes: '/api/quizzes',
      agentChat: '/api/agent/chat',
      agentHealth: '/api/agent/health',
      agentRuns: '/api/agent/runs',
    },
    version: '1.0.0',
  });
});

// Start Server
async function bootstrap() {
  await connectDB();
  await createAndStartMcpServer();

  app.listen(config.port, () => {
    console.log(`\n======================================================`);
    console.log(`🚀 CampusPilot AI Server running on port ${config.port}`);
    console.log(`📡 MCP Streamable HTTP endpoint: http://localhost:${config.port}/mcp`);
    console.log(`🤖 Agent Chat API: http://localhost:${config.port}/api/agent/chat`);
    console.log(`🏥 Health Status: http://localhost:${config.port}/api/agent/health`);
    console.log(`======================================================\n`);
  });
}

bootstrap().catch((err) => {
  console.error('Fatal initialization error:', err);
  process.exit(1);
});
