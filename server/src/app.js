import express from 'express';
import cors from 'cors';
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
app.get('/api', (req, res) => {
  res.json({
    name: 'CampusPilot AI Server',
    tagline: 'Turn academic chaos into a clear plan of action',
    tracks: {
      primary: 'Alexa+ (MCP Server over Streamable HTTP)',
      mini: 'AWS Builder (Amazon Bedrock Runtime)',
    },
    version: '1.0.0',
  });
});

let initPromise = null;

export async function init() {
  if (!initPromise) {
    initPromise = (async () => {
      await connectDB();
      await createAndStartMcpServer();
    })();
  }
  return initPromise;
}

export { app };
export default app;
