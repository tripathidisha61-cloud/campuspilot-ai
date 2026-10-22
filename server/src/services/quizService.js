import { store } from '../db/store.js';
import { invokeBedrock } from './bedrockService.js';

// High-yield domain question banks for academic topics
const TOPIC_PRESETS = {
  normalization: [
    {
      id: 'q1',
      question: 'Which Normal Form guarantees that every non-prime attribute is fully functionally dependent on every candidate key (no partial dependencies)?',
      options: ['First Normal Form (1NF)', 'Second Normal Form (2NF)', 'Third Normal Form (3NF)', 'Boyce-Codd Normal Form (BCNF)'],
      correctAnswerIndex: 1,
      explanation: '2NF eliminates partial dependencies by ensuring that every non-prime attribute is fully dependent on the whole candidate key, not just a subset.',
    },
    {
      id: 'q2',
      question: 'A relation R(A, B, C) has functional dependency A -> B and B -> C. Which normal form is violated, and why?',
      options: [
        '1NF because values are not atomic',
        '2NF because there is a partial dependency',
        '3NF because of transitive dependency A -> B -> C',
        'BCNF only, 3NF is fully satisfied'
      ],
      correctAnswerIndex: 2,
      explanation: 'Transitive dependency (A determines B, and non-key B determines non-key C) violates 3NF, which requires all transitive dependencies to be removed.',
    },
    {
      id: 'q3',
      question: 'How does Boyce-Codd Normal Form (BCNF) differ from Third Normal Form (3NF)?',
      options: [
        'BCNF allows multi-valued dependencies whereas 3NF does not',
        'In BCNF, for every functional dependency X -> Y, X MUST be a superkey without exception',
        '3NF is strictly stronger than BCNF',
        'BCNF always preserves functional dependencies whereas 3NF does not'
      ],
      correctAnswerIndex: 1,
      explanation: 'BCNF removes 3NF\'s exception where Y could be a prime attribute. In BCNF, the determinant X must strictly be a superkey.',
    },
    {
      id: 'q4',
      question: 'A decomposition of relation R into R1 and R2 is said to be lossless-join if and only if:',
      options: [
        'R1 ∩ R2 = ∅',
        '(R1 ∩ R2) -> R1 or (R1 ∩ R2) -> R2',
        'R1 and R2 have the same number of attributes',
        'Both R1 and R2 are in 1NF'
      ],
      correctAnswerIndex: 1,
      explanation: 'A decomposition is lossless if the intersection of attributes forms a superkey for at least one of the decomposed relations.',
    },
    {
      id: 'q5',
      question: 'Which anomaly occurs when deleting one piece of information accidentally removes unrelated essential information?',
      options: ['Insertion anomaly', 'Deletion anomaly', 'Update anomaly', 'Concurrency anomaly'],
      correctAnswerIndex: 1,
      explanation: 'A deletion anomaly occurs when data loss happens inadvertently because records combine distinct entities into one un-normalized table.',
    },
  ],
  dsa: [
    {
      id: 'q1',
      question: 'What is the time complexity of topological sorting on a Directed Acyclic Graph (DAG) with V vertices and E edges using Kahn’s Algorithm?',
      options: ['O(V^2)', 'O(V + E)', 'O(E log V)', 'O(V * E)'],
      correctAnswerIndex: 1,
      explanation: 'Kahn\'s algorithm processes each vertex and each incident edge exactly once using an in-degree array and queue, giving O(V + E) complexity.',
    },
    {
      id: 'q2',
      question: 'Can Topological Sort be performed on a directed graph containing a cycle?',
      options: [
        'Yes, any directed graph has a topological ordering',
        'No, a topological order exists if and only if the graph is a Directed Acyclic Graph (DAG)',
        'Yes, but only using Depth First Search',
        'Only if the cycle has even length'
      ],
      correctAnswerIndex: 1,
      explanation: 'A cycle introduces cyclic dependencies where no vertex can be placed before another, making a linear topological ordering mathematically impossible.',
    },
    {
      id: 'q3',
      question: 'In Dijkstra’s Shortest Path algorithm with a Min-Heap (priority queue), what is the optimal time complexity?',
      options: ['O(V^2)', 'O((V + E) log V)', 'O(V log E)', 'O(E^2)'],
      correctAnswerIndex: 1,
      explanation: 'Using an adjacency list and min-heap, extract-min is called V times and decrease-key is called at most E times, yielding O((V + E) log V).',
    },
    {
      id: 'q4',
      question: 'What is the best average-case space complexity of an in-place QuickSort algorithm implemented with recursive calls?',
      options: ['O(1)', 'O(log N)', 'O(N)', 'O(N log N)'],
      correctAnswerIndex: 1,
      explanation: 'Although QuickSort does not allocate extra arrays, the call stack on average takes O(log N) space due to recursion.',
    },
  ],
  os: [
    {
      id: 'q1',
      question: 'What is "thrashing" in an operating system virtual memory subsystem?',
      options: [
        'When multiple processes experience deadlock simultaneously',
        'When the CPU spends more time swapping pages in and out of disk than executing instructions',
        'When a page table exceeds physical memory capacity',
        'When an interrupt handler gets stuck in an infinite loop'
      ],
      correctAnswerIndex: 1,
      explanation: 'Thrashing occurs when total working set sizes exceed physical RAM, forcing high-frequency page faults and disk I/O.',
    },
    {
      id: 'q2',
      question: 'Which page replacement algorithm suffers from Belady’s Anomaly (where increasing page frames increases page faults)?',
      options: ['Least Recently Used (LRU)', 'First-In First-Out (FIFO)', 'Optimal Page Replacement (OPT)', 'Clock Algorithm'],
      correctAnswerIndex: 1,
      explanation: 'FIFO is not a stack algorithm, so adding more physical frames can paradoxically increase the number of page faults.',
    },
    {
      id: 'q3',
      question: 'What hardware component accelerates virtual-to-physical address translation in the MMU?',
      options: ['Translation Lookaside Buffer (TLB)', 'DMA Controller', 'APIC', 'Instruction Pipeline Cache'],
      correctAnswerIndex: 0,
      explanation: 'The TLB is a high-speed associative hardware cache that stores recent virtual-to-physical page frame translations.',
    },
  ],
};

export async function generateQuiz({ topic, questionCount = 5, difficulty = 'medium' }) {
  const normalizedTopic = (topic || 'Database normalization').toLowerCase();
  let questions = [];
  let source = 'campus_pilot_knowledge_base';

  // 1. Attempt AWS Bedrock generation if configured
  const prompt = `Generate a rigorous ${questionCount}-question multiple-choice active recall quiz on the academic topic: "${topic}".
Difficulty: ${difficulty}.
Return ONLY a valid JSON array of objects with fields:
- "id": string (e.g. "q1")
- "question": string
- "options": array of exactly 4 strings
- "correctAnswerIndex": integer (0, 1, 2, or 3)
- "explanation": string explaining why the answer is correct and why other distractors are wrong.
DO NOT include markdown fences, backticks, or other text outside the JSON array.`;

  const bedrockResult = await invokeBedrock({
    prompt,
    systemPrompt: 'You are an academic computer science professor creating active recall practice questions for university students.',
  });

  if (bedrockResult.text) {
    try {
      const cleaned = bedrockResult.text.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleaned);
      if (Array.isArray(parsed) && parsed.length > 0) {
        questions = parsed.slice(0, questionCount);
        source = bedrockResult.provider;
      }
    } catch (e) {
      console.warn('[QuizService] Bedrock JSON parse failed, utilizing curated academic question bank:', e.message);
    }
  }

  // 2. Curated domain fallback matching the blueprint
  if (questions.length === 0) {
    let key = 'normalization';
    if (normalizedTopic.includes('dsa') || normalizedTopic.includes('graph') || normalizedTopic.includes('algo')) {
      key = 'dsa';
    } else if (normalizedTopic.includes('os') || normalizedTopic.includes('operat') || normalizedTopic.includes('memory')) {
      key = 'os';
    }
    const preset = TOPIC_PRESETS[key] || TOPIC_PRESETS.normalization;
    questions = preset.slice(0, questionCount);
    source = 'CampusPilot Curated Academic Bank (AWS Bedrock Ready)';
  }

  // Persist quiz attempt in store
  const saved = store.saveQuiz({
    topic,
    questions,
    source,
  });

  // Return quiz with answer keys concealed for the student
  const clientSafeQuestions = questions.map(q => ({
    id: q.id,
    question: q.question,
    options: q.options,
  }));

  return {
    quizId: saved.id,
    topic,
    totalQuestions: questions.length,
    questions: clientSafeQuestions,
    source,
  };
}

export function submitQuiz(quizId, answers) {
  const result = store.submitQuiz(quizId, answers);
  if (!result) {
    throw new Error(`Quiz with id ${quizId} not found.`);
  }

  // Now reveal questions WITH explanations and correct answers
  const feedback = result.questions.map((q, idx) => ({
    id: q.id,
    question: q.question,
    options: q.options,
    studentAnswerIndex: answers[idx] !== undefined ? answers[idx] : null,
    correctAnswerIndex: q.correctAnswerIndex,
    isCorrect: answers[idx] === q.correctAnswerIndex,
    explanation: q.explanation,
  }));

  return {
    quizId: result.id,
    topic: result.topic,
    score: result.score,
    totalQuestions: result.totalQuestions,
    percentage: Math.round((result.score / result.totalQuestions) * 100),
    feedback,
    submittedAt: result.submittedAt,
  };
}
