const API_BASE = (
  import.meta.env.VITE_API_URL !== undefined
    ? import.meta.env.VITE_API_URL
    : (import.meta.env.DEV ? 'http://localhost:5000' : '')
).replace(/\/$/, '');

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    if (!response.ok) {
      const errBody = await response.json().catch(() => ({}));
      throw new Error(errBody.error || `Request failed with status ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`API Error [${endpoint}]:`, error);
    throw error;
  }
}

export const api = {
  // Tasks
  getTasks: (filter = {}) => {
    const params = new URLSearchParams();
    if (filter.status) params.append('status', filter.status);
    if (filter.subject) params.append('subject', filter.subject);
    const qs = params.toString() ? `?${params.toString()}` : '';
    return request(`/api/tasks${qs}`);
  },
  createTask: (data) => request('/api/tasks', { method: 'POST', body: JSON.stringify(data) }),
  updateTask: (id, data) => request(`/api/tasks/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  completeTask: (id) => request(`/api/tasks/${id}/complete`, { method: 'POST' }),
  deleteTask: (id) => request(`/api/tasks/${id}`, { method: 'DELETE' }),

  // Planner
  generatePlan: (data) => request('/api/plans', { method: 'POST', body: JSON.stringify(data) }),
  getPlans: () => request('/api/plans'),

  // Quizzes
  generateQuiz: (data) => request('/api/quizzes', { method: 'POST', body: JSON.stringify(data) }),
  getQuizzes: () => request('/api/quizzes'),
  getQuizById: (id) => request(`/api/quizzes/${id}`),
  submitQuiz: (id, answers) => request(`/api/quizzes/${id}/submit`, { method: 'POST', body: JSON.stringify({ answers }) }),

  // Agent & MCP
  sendAgentMessage: (message, conversationHistory = []) =>
    request('/api/agent/chat', {
      method: 'POST',
      body: JSON.stringify({ message, conversationHistory }),
    }),
  getAgentRuns: () => request('/api/agent/runs'),
  getHealth: () => request('/api/agent/health'),
  getMcpTools: () => request('/api/mcp/tools'),
  resetSeedData: () => request('/api/agent/reset', { method: 'POST' }),
};
