# Product Feedback & Developer Friction Log

> **CampusPilot AI — Hackathon Submission Friction Log**
> Submitted in compliance with Devpost Hackathon Rules (Section 18) for developer tooling evaluation and the 10% product feedback judging bonus.

---

## Friction Entry 1: MCP TypeScript SDK — Streamable HTTP Transport Integration

| Field | Detail |
| :--- | :--- |
| **Tool / API** | `@modelcontextprotocol/sdk` (v1.32.1) |
| **Task** | Configure an MCP server over Streamable HTTP (Specification 2025-11-25) in an existing Node.js + Express backend. |
| **Expected Behavior** | Clear documentation and a standardized Express middleware adapter to expose `/mcp` for discovery and tool calls. |
| **Observed Behavior** | Most official examples emphasize `StdioServerTransport` for local desktop clients (e.g. Claude Desktop). The `StreamableHTTPServerTransport` class exists in `@modelcontextprotocol/sdk/server/streamableHttp.js`, but its interaction with Express request handling and session lifecycle is minimally documented. |
| **Severity** | **Medium** |
| **Workaround Implemented** | Inspected the prototype of `StreamableHTTPServerTransport` to identify the `handleRequest(req, res, parsedBody)` method. Built an Express route handler wrapping `mcpTransportInstance.handleRequest(req, res, req.body)` alongside a companion metadata endpoint `/api/mcp/tools` for frontend discovery. |
| **Actionable Suggestion** | Add a first-class Express / Fastify middleware helper (e.g., `createMcpRouter(mcpServer)`) in `@modelcontextprotocol/sdk` with copy-pasteable snippets for production Node.js servers. |

---

## Friction Entry 2: AWS Bedrock Runtime — Disparate Model Request Payloads

| Field | Detail |
| :--- | :--- |
| **Tool / API** | `@aws-sdk/client-bedrock-runtime` (`BedrockRuntimeClient`, `InvokeModelCommand`) |
| **Task** | Invoke different foundation models (Anthropic Claude 3 Haiku vs Amazon Titan Text Express vs Meta Llama 3) for active recall quiz generation and request interpretation. |
| **Expected Behavior** | A consistent request format across models within the Bedrock Runtime JavaScript SDK. |
| **Observed Behavior** | Each model provider requires an entirely different JSON payload structure. Anthropic models expect `{ anthropic_version, messages: [{ role, content }] }`; Titan expects `{ inputText, textGenerationConfig: { maxTokenCount, temperature } }`; Llama expects formatted prompt text with special tokens `<|begin_of_text|>`. Parsing responses also requires different key extractions (`response.content[0].text` vs `response.results[0].outputText`). |
| **Severity** | **Medium** |
| **Workaround Implemented** | Constructed a normalization layer in `server/src/services/bedrockService.js` that checks `modelId` and formats payload bodies and decodes responses accordingly. |
| **Actionable Suggestion** | Promote the AWS Bedrock **Converse API** (`ConverseCommand`) as the default SDK interface in documentation, which standardizes messages across all model providers. |

---

## Friction Entry 3: Resilience in Uncredentialed Hackathon Evaluation Environments

| Field | Detail |
| :--- | :--- |
| **Tool / API** | Cloud-dependent AI Services & MongoDB Atlas |
| **Task** | Ensure judges and external reviewers can clone the repo and run the full conversational agent without mandatory AWS IAM configuration or MongoDB cluster provisioning. |
| **Expected Behavior** | Hackathon projects often fail during judge review if external API credentials or database connections are invalid or missing. |
| **Observed Behavior** | Applications that hardcode mandatory live cloud connections fail at boot when credentials are not supplied. |
| **Severity** | **High (Potential fatal failure for reviewers)** |
| **Workaround Implemented** | Designed a dual-mode persistence architecture (`server/src/db/connection.js` and `server/src/db/store.js`) and AI service (`server/src/services/bedrockService.js`). If `MONGODB_URI` or AWS keys are absent, CampusPilot seamlessly activates an embedded persistent store and high-yield domain knowledge sets. It clearly logs its active status and provides a documented Bedrock configuration modal in the UI. |
| **Actionable Suggestion** | Hackathon platforms should provide sandbox API credits or mock credentials for participants to verify cloud integrations prior to submission. |

---

## Summary Evaluation

- **Model Context Protocol (MCP):** 9/10. The protocol is exceptionally well-suited for structured agent actions. Exposing tools via schema validation makes agent decision-making deterministic and observable.
- **AWS Bedrock Runtime:** 8.5/10. Fast response times, enterprise-grade IAM integration, and reliable latency when using Claude 3 Haiku. Unifying message schemas via the Converse API will make onboarding even smoother.
