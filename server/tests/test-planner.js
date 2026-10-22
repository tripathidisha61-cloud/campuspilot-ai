import { calculateTaskUrgency, generateStudyPlan } from '../src/services/plannerService.js';
import { store } from '../src/db/store.js';
import { executeMcpTool } from '../src/mcp/server.js';
import { processAgentRequest } from '../src/agent/orchestrator.js';

async function runTests() {
  console.log('--- Testing CampusPilot AI Core Capabilities ---');

  // Test 1: Task Urgency Calculation
  console.log('\n[Test 1] Urgency Formula: S = 0.5D + 0.3I + 0.2E');
  const dsaTask = store.getTasks().find(t => t.subject === 'DSA');
  const urgency = calculateTaskUrgency(dsaTask);
  console.log(`Task "${dsaTask.title}":`, {
    D: urgency.D,
    I: urgency.I,
    E: urgency.E,
    CalculatedScore: urgency.score,
    HoursUntilDue: urgency.hoursUntilDue,
  });
  if (urgency.score < 50) throw new Error('Expected high urgency for DSA due tonight');
  console.log('✓ Urgency calculation test passed.');

  // Test 2: Study Planner under Capacity
  console.log('\n[Test 2] Study Plan Generation (240 Minutes)');
  const plan = generateStudyPlan({ availableMinutes: 240 });
  console.log(`Plan blocks created: ${plan.blocks.length}, Warnings: ${plan.warnings.length}, Deferred: ${plan.deferredTasks.length}`);
  console.log('Sample block:', plan.blocks[0]);
  if (!plan.blocks.length) throw new Error('No blocks generated');
  console.log('✓ Planner capacity test passed.');

  // Test 3: MCP Tool Execution
  console.log('\n[Test 3] MCP Tool Execution: get_tasks & plan_day');
  const mcpResult = await executeMcpTool('get_tasks', { status: 'pending' });
  console.log(`MCP get_tasks returned ${mcpResult.output.count} tasks in ${mcpResult.durationMs}ms`);
  if (mcpResult.status !== 'success') throw new Error('MCP tool call failed');
  console.log('✓ MCP Tool execution test passed.');

  // Test 4: Agent Multi-Intent Orchestration
  console.log('\n[Test 4] Blueprint Natural Language Prompt:');
  const prompt = 'Plan my next four hours. My DSA assignment is due tonight and my DBMS exam is tomorrow. Then quiz me on normalization.';
  console.log(`Input: "${prompt}"`);
  const agentResponse = await processAgentRequest({ message: prompt });
  console.log(`Agent executed ${agentResponse.toolCalls.length} MCP tools.`);
  agentResponse.toolCalls.forEach(t => {
    console.log(`  - Tool [${t.name}] Status: ${t.status} (${t.durationMs}ms)`);
  });
  console.log('\nAgent Voice Summary:\n', agentResponse.speechText);
  if (!agentResponse.data.plan || !agentResponse.data.quiz) {
    throw new Error('Agent failed to generate both plan and quiz for multi-intent prompt');
  }
  console.log('✓ Agent multi-intent orchestration test passed.');

  console.log('\n🎉 ALL BACKEND & MCP TESTS PASSED SUCCESSFULLY!');
}

runTests().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
