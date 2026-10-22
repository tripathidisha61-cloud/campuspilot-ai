# CampusPilot AI — 3-Minute Demo Video Script

> **Video Duration Target:** 2 minutes 50 seconds (Under the 3-minute official hackathon limit)
> **Pacing:** Clear, confident, technical, and outcome-oriented.

---

### [0:00 – 0:20] The Problem
- **Visual:** Open on the CampusPilot AI Dashboard showing urgent pending tasks:
  - *"Complete DSA assignment"* — Due Tonight (in 4 hours)
  - *"DBMS Exam Revision"* — Due Tomorrow
  - *"Operating Systems Presentation"* — Due in 2 days
- **Audio / Voiceover:**
  > "Meet Alex, a computer science student with a classic academic dilemma. He has a DSA assignment due tonight, a DBMS exam tomorrow morning, and an OS presentation due in 48 hours. But right now, he only has four hours to study and no idea what to tackle first. Traditional todo apps just list the tasks—they force students to guess priorities and waste time. CampusPilot AI turns this academic chaos into a clear plan of action."

---

### [0:20 – 0:45] One Natural-Language Request
- **Visual:** Click into the **AI Workspace (Alexa+ Assistant)**. Either click the microphone or paste the primary benchmark prompt:
  > *"Plan my next four hours. My DSA assignment is due tonight and my DBMS exam is tomorrow. Then quiz me on normalization."*
- **Visual:** The agent executes instantly. Alexa+ speech synthesis reads the answer:
  > *"I have organized your four hours. I scheduled your DSA assignment first because it is due tonight, followed by a break and your DBMS exam revision. I also prepared a practice quiz on database normalization for you."*
- **Audio / Voiceover:**
  > "With a single natural-language command, Alex triggers a complete multi-intent agent workflow. Notice how CampusPilot doesn't just give text advice—it executes real, persistent actions."

---

### [0:45 – 1:30] Technical Implementation: MCP Streamable HTTP
- **Visual:** Scroll down to the **MCP Protocol Tool Execution** accordion in the chat message or click into the **MCP Inspector** tab.
- **Visual:** Click on `get_tasks`, `plan_day`, and `generate_quiz` to show expandable JSON inputs, latency (ms), and server responses over Streamable HTTP.
- **Audio / Voiceover:**
  > "Behind the scenes, CampusPilot communicates through the official Model Context Protocol TypeScript SDK over Streamable HTTP, adhering to the 2025-11-25 specification. The agent invoked three MCP tools in sequence: `get_tasks` to inspect deadlines, `plan_day` to run our deterministic constraint engine, and `generate_quiz` to build a customized active recall test."

---

### [1:30 – 2:15] Product Experience: Timetable & Active Recall Quiz
- **Visual:** Click on **Study Planner (Timetable)**.
  - Show the 4-hour breakdown:
    - 0–90 min: Focused DSA assignment
    - 90–105 min: Cognitive reset break
    - 105–240 min: DBMS exam revision
  - Highlight the **Constraint Overload Notice** explaining why the OS presentation was deferred to protect Alex's sleep and focus.
- **Visual:** Click on **Quiz Mode**.
  - Show the 5 questions on Database Normalization.
  - Select options for 1NF, 2NF, 3NF, and BCNF.
  - Click **Submit Quiz**.
  - Show the score (e.g. 5/5 or 4/5) and reveal the detailed explanations for each question.
- **Audio / Voiceover:**
  > "Here in the Study Planner, Alex sees a feasible timetable with scheduled breaks to prevent burnout. Because 4 hours wasn't enough to do everything, our constraint engine deferred the lower-priority presentation rather than inventing an impossible schedule. Next, Alex heads into Quiz Mode. Notice that answer keys were completely concealed during the quiz, unlocking only upon submission to guarantee genuine active retrieval."

---

### [2:15 – 2:45] Architecture & AWS Bedrock Integration
- **Visual:** Click the **AWS Bedrock** badge on the top right to open the architecture modal. Show the AWS Bedrock SDK client configuration and the terminal running the live backend server.
- **Audio / Voiceover:**
  > "CampusPilot is built on a modern MERN architecture paired with enterprise AI: React and Tailwind on the frontend, Node and Express on the backend, persistent storage, MCP tools, and Amazon Bedrock using Claude 3 Haiku for high-speed quiz generation and NLP. Crucially, time planning is computed deterministically using our formula: S = 0.5D + 0.3I + 0.2E, guaranteeing zero AI hallucination of hours."

---

### [2:45 – 3:00] Conclusion
- **Visual:** Return to the **Dashboard** showing the updated task board with DSA marked as completed.
- **Audio / Voiceover:**
  > "From feeling overwhelmed to having a step-by-step timetable and practice test in under 10 seconds. CampusPilot AI: turning academic chaos into a clear plan of action. Thank you."
