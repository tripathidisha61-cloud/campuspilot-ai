import { config } from './config.js';
import { app, init } from './app.js';

async function start() {
  await init();

  app.listen(config.port, () => {
    console.log(`\n======================================================`);
    console.log(`🚀 CampusPilot AI Server running on port ${config.port}`);
    console.log(`📡 MCP Streamable HTTP endpoint: http://localhost:${config.port}/mcp`);
    console.log(`🤖 Agent Chat API: http://localhost:${config.port}/api/agent/chat`);
    console.log(`🏥 Health Status: http://localhost:${config.port}/api/agent/health`);
    console.log(`======================================================\n`);
  });
}

start().catch((err) => {
  console.error('Fatal initialization error:', err);
  process.exit(1);
});
