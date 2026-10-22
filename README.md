# CampusPilot AI

> **Turn academic chaos into a clear plan of action.**

CampusPilot AI is an intelligent academic productivity assistant that helps students manage assignments, prepare for exams, organize their time, and learn more efficiently through a conversational AI agent.

[![Hackathon Track: Alexa+](https://img.shields.io/badge/Primary%20Track-Alexa%2B%20(MCP%20Streamable%20HTTP)-00CAFF?style=flat-square&logo=amazon-alexa)](https://modelcontextprotocol.io)
[![Hackathon Track: AWS Builder](https://img.shields.io/badge/Mini%20Track-AWS%20Builder%20(Amazon%20Bedrock)-FF9900?style=flat-square&logo=amazon-aws)](https://aws.amazon.com/bedrock)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square)](LICENSE)

---

## 1. Problem Statement

Students in higher education frequently juggle concurrent deadlines, unexpected exam schedules, project milestones, and heavy coursework. Existing task management applications act as passive todo lists: they require students to manually estimate effort, resolve calendar conflicts, make revision timetables, and find practice questions.

When a student has only four hours before a deadline tonight, an exam tomorrow, and an upcoming presentation, manual planning creates cognitive friction and decision fatigue.

## 2. Proposed Solution

CampusPilot AI transforms natural-language workload descriptions into **real, executed actions**:

- Interprets multi-intent student inputs (e.g., *"Plan my next four hours. My DSA assignment is due tonight and my DBMS exam is tomorrow. Then quiz me on normalization."*).
- Queries persistent academic records and deadlines through **Model Context Protocol (MCP)** tools.
- Executes a **deterministic, constraint-aware planner algorithm** ($S = 0.5D + 0.3I + 0.2E$) that guarantees study blocks fit within real student availability without AI hallucination of hours.
- Handles **workload overloads gracefully**, explicitly warning the student and ranking deferred lower-priority tasks.
- Generates topic-specific active recall quizzes powered by **Amazon Bedrock**, keeping answer keys concealed until student submission.
- Simulates an **Alexa+ voice-first assistant experience** with speech synthesis audio and speech recognition.

---

## 3. System Architecture

```text
       ┌────────────────────────────────────────────────────────┐
       │                Student Interface                       │
       │    React + Vite + Tailwind CSS + Lucide Icons         │
       │  (Alexa+ Voice Simulation, Timetable, Tasks, Quizzes)  │
       └──────────────────────────┬─────────────────────────────┘
                                  │ JSON / REST / Audio
                                  ▼
       ┌────────────────────────────────────────────────────────┐
       │                   Express Backend                      │
       │             AI Orchestrator & Controller               │
       └──────────────┬───────────────────────────┬─────────────┘
                      │                           │
                      ▼                           ▼
       ┌───────────────────────────┐ ┌──────────────────────────┐
       │     MCP Server (v1.32)    │ │   Amazon Bedrock Client  │
       │  Streamable HTTP (/mcp)   │ │  @aws-sdk/client-bedrock │
       │    Spec 2025-11-25        │ │ Claude 3 Haiku / Titan   │
       └──────────────┬────────────┘ └────────────┬─────────────┘
                      │                           │
                      ▼                           ▼
       ┌───────────────────────────┐ ┌──────────────────────────┐
       │   Deterministic Planner   │ │     Persistent Store     │
       │    S = 0.5D+0.3I+0.2E     │ │ MongoDB Atlas + Mongoose │
       │  Constraint-Aware Packing │ │ (Resilient Local Sync)   │
       └───────────────────────────┘ └──────────────────────────┘
```

---

## 4. Model Context Protocol (MCP) Tools

CampusPilot AI exposes real academic tools compliant with the official **MCP TypeScript SDK** and the **Streamable HTTP transport (Specification 2025-11-25)**:

| Tool Name | Input Parameters | Output Description |
| :--- | :--- | :--- |
| `get_tasks` | `status?: string`, `subject?: string` | Filtered list of academic tasks and deadlines |
| `create_task` | `title`, `subject`, `dueAt`, `estimatedMinutes`, `priority`, `description` | Newly created persistent task record |
| `update_task` | `id`, permitted updates (`title`, `priority`, `dueAt`, etc.) | Updated task record |
| `complete_task` | `id` | Task marked as `completed` with audit timestamp |
| `plan_day` | `availableMinutes`, `breakIntervalMinutes`, `breakDurationMinutes` | Feasible study schedule, breaks, and overload warnings |
| `generate_quiz` | `topic`, `questionCount`, `difficulty` | 5-question active recall quiz with concealed answers |
| `submit_quiz` | `quizId`, `answers: number[]` | Evaluated score, percentage, and verified explanations |

The live MCP Server endpoint is exposed at `http://localhost:5000/mcp` and documented via `/api/mcp/tools`.

---

## 5. Intelligent Planner Algorithm

Rather than allowing an LLM to invent an impossible schedule, CampusPilot AI computes time allocation **deterministically**:

### Urgency Formula
$$S = 0.5D + 0.3I + 0.2E$$

- **$D$ (Deadline Urgency, 0–100):** Continuous scale based on remaining hours:
  - Overdue or due within 12 hours (Tonight): $100$
  - Due within 24 hours (Tomorrow): $85$
  - Due within 48 hours: $65$
  - Due within 72 hours: $45$
  - Later: $25$
- **$I$ (Importance Score, 0–100):** $95$ for High, $65$ for Medium, $35$ for Low priority.
- **$E$ (Effort & Exam Relevance, 0–100):** Proportional to estimated effort, with $+25$ boost for tasks containing keywords like *Exam*, *Quiz*, *Midterm*, or *Revision*.

### Constraint Recovery
If a student has 6 hours of work but only 4 hours available:
1. Allocates the most urgent assignments first (e.g. DSA assignment due tonight and DBMS exam revision).
2. Inserts mandatory 15-minute cognitive reset breaks between intense study blocks.
3. Generates a visible **Constraint Overload Notice** explaining the exact time deficit and lists deferred tasks with clear rationale.

---

## 6. AWS Bedrock Integration (AWS Builder Mini-Track)

- **Service:** Amazon Bedrock Runtime via `@aws-sdk/client-bedrock-runtime` (`BedrockRuntimeClient`, `InvokeModelCommand`).
- **Target Model:** `anthropic.claude-3-haiku-20240307-v1:0` (also supports Amazon Titan `amazon.titan-text-express-v1` and Meta Llama 3).
- **Features Powered:**
  1. **Topic-Specific Quiz Generation:** Synthesizes multiple-choice questions on academic subjects with four options, single correct answers, and thorough conceptual explanations.
  2. **Multi-Intent Request Interpretation:** Maps conversational queries into appropriate MCP tool executions.
- **Resilient Fallback Guarantee:** When deployed in evaluation environments without live AWS credentials, the application automatically activates high-yield domain knowledge sets so the demo runs seamlessly with 0 configuration barriers.

---

## 7. Tech Stack

- **Frontend:** React 18, Vite, Tailwind CSS, Lucide Icons, Web Speech API (Alexa+ voice synthesis and recognition).
- **Backend:** Node.js LTS, Express 5, Zod Schema Validation, CORS, Dotenv.
- **Agent & Protocol:** `@modelcontextprotocol/sdk` (v1.32.1), `StreamableHTTPServerTransport`.
- **Cloud & AI:** AWS SDK v3 Bedrock Runtime (`@aws-sdk/client-bedrock-runtime`).
- **Database:** MongoDB Atlas via Mongoose with embedded resilient JSON fallback.

---

## 8. Quickstart & Local Setup

### Prerequisites
- Node.js LTS (v20.x or later)
- Git

### 1. Clone & Install
```bash
git clone https://github.com/your-username/campuspilot-ai.git
cd campuspilot-ai

# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install
```

### 2. Environment Variables (Optional)
In `server/.env`:
```env
PORT=5000
CLIENT_ORIGIN=http://localhost:5173
MONGODB_URI=
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
BEDROCK_MODEL_ID=anthropic.claude-3-haiku-20240307-v1:0
```
*(If left blank, CampusPilot AI runs in Zero-Setup Mode with embedded persistent storage and curated active recall engines!)*

### 3. Run Automated Tests
```bash
npm run test --prefix server
```

### 4. Start Application
In terminal 1 (Backend & MCP Server):
```bash
npm run start --prefix server
```
*Server runs on `http://localhost:5000` (MCP endpoint at `/mcp`)*

In terminal 2 (Frontend Client):
```bash
npm run dev --prefix client
```
*Frontend opens at `http://localhost:5173`*

---

## 9. Verification & Hackathon Benchmark Prompt

Enter this single conversational prompt in the AI Workspace:

> *"Plan my next four hours. My DSA assignment is due tonight and my DBMS exam is tomorrow. Then quiz me on normalization."*

### What Happens:
1. Agent queries `get_tasks` via MCP to find pending workload.
2. Agent invokes `plan_day` with `availableMinutes: 240`.
3. Agent invokes `generate_quiz` for `topic: "Database normalization"`.
4. Agent speaks the response via Alexa+ voice audio.
5. The UI displays the sequential schedule blocks, break slots, constraint warnings, and renders the 5-question active recall quiz.
6. The MCP Inspector logs all tool calls with execution durations and parameter schemas.

---

## 10. License

Released under the [MIT License](LICENSE).
