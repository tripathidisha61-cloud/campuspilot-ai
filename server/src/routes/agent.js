import { Router } from 'express';
import { processAgentRequest } from '../agent/orchestrator.js';
import { store } from '../db/store.js';
import { isConnected } from '../db/connection.js';
import { isBedrockConfigured } from '../services/bedrockService.js';
import { getMcpMetadata } from '../mcp/server.js';
import { config } from '../config.js';

const router = Router();

// POST /api/agent/chat
router.post('/chat', async (req, res) => {
  try {
    const { message, conversationHistory } = req.body;
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ success: false, error: 'Message string is required' });
    }

    const result = await processAgentRequest({
      message,
      conversationHistory: conversationHistory || [],
    });

    res.json({ success: true, ...result });
  } catch (error) {
    console.error('[Agent Error]', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/agent/runs (Audit Trail)
router.get('/runs', (req, res) => {
  const runs = store.getAgentRuns(30);
  res.json({ success: true, count: runs.length, runs });
});

// GET /api/agent/health (System status & Track Compliance)
router.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    primaryTrack: {
      name: 'Alexa+',
      mcpServer: 'Active (Streamable HTTP)',
      specVersion: '2025-11-25',
      endpoint: '/mcp',
      voiceSimulation: 'Supported',
    },
    miniTrack: {
      name: 'AWS Builder',
      service: 'Amazon Bedrock Runtime',
      configured: isBedrockConfigured(),
      region: config.aws.region,
      modelId: config.aws.bedrockModelId,
      status: isBedrockConfigured() ? 'Live Bedrock Connection' : 'Bedrock-Ready Fallback Active',
    },
    database: {
      mongoAtlasConnected: isConnected(),
      mode: isConnected() ? 'MongoDB Atlas' : 'Embedded High-Performance JSON Store',
      tasksCount: store.getTasks().length,
    },
    mcp: getMcpMetadata(),
  });
});

// POST /api/agent/reset (Quick Demo Reset)
router.post('/reset', (req, res) => {
  store.resetToSeed();
  res.json({ success: true, message: 'Seeded academic tasks successfully restored.' });
});

export default router;
