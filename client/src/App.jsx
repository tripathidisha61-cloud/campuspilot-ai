import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar.jsx';
import Sidebar from './components/Sidebar.jsx';
import Dashboard from './components/Dashboard.jsx';
import ChatPanel from './components/ChatPanel.jsx';
import ScheduleView from './components/ScheduleView.jsx';
import TaskBoard from './components/TaskBoard.jsx';
import QuizPanel from './components/QuizPanel.jsx';
import ToolTimeline from './components/ToolTimeline.jsx';
import BedrockModal from './components/BedrockModal.jsx';
import { api } from './services/api.js';
import { speech } from './utils/speech.js';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [tasks, setTasks] = useState([]);
  const [plans, setPlans] = useState([]);
  const [currentPlan, setCurrentPlan] = useState(null);
  const [currentQuiz, setCurrentQuiz] = useState(null);
  const [quizResult, setQuizResult] = useState(null);
  const [agentRuns, setAgentRuns] = useState([]);
  const [health, setHealth] = useState(null);
  const [mcpMetadata, setMcpMetadata] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [isBedrockModalOpen, setIsBedrockModalOpen] = useState(false);

  // Chat conversation state
  const [messages, setMessages] = useState([]);

  // Load initial application data
  const loadInitialData = async () => {
    try {
      const [tasksRes, plansRes, runsRes, healthRes, toolsRes] = await Promise.allSettled([
        api.getTasks(),
        api.getPlans(),
        api.getAgentRuns(),
        api.getHealth(),
        api.getMcpTools(),
      ]);

      if (tasksRes.status === 'fulfilled') setTasks(tasksRes.value.tasks || []);
      if (plansRes.status === 'fulfilled') {
        const fetchedPlans = plansRes.value.plans || [];
        setPlans(fetchedPlans);
        if (fetchedPlans.length > 0) setCurrentPlan(fetchedPlans[0]);
      }
      if (runsRes.status === 'fulfilled') setAgentRuns(runsRes.value.runs || []);
      if (healthRes.status === 'fulfilled') setHealth(healthRes.value);
      if (toolsRes.status === 'fulfilled') setMcpMetadata(toolsRes.value);
    } catch (err) {
      console.warn('Initial data load warning:', err);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  // Handle conversational agent message (Simulating Alexa+ & MCP)
  const handleSendMessage = async (text) => {
    const userMessage = { role: 'user', content: text, createdAt: new Date() };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await api.sendAgentMessage(text, messages);

      const assistantMessage = {
        role: 'assistant',
        content: response.summary,
        speechText: response.speechText,
        toolCalls: response.toolCalls || [],
        data: response.data || {},
        createdAt: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);

      // Speak answer with Alexa+ voice if enabled
      if (voiceEnabled && response.speechText) {
        speech.speak(response.speechText);
      }

      // Update state based on data mutations returned
      if (response.data?.plan) {
        setCurrentPlan(response.data.plan);
        setPlans((prev) => [response.data.plan, ...prev]);
      }
      if (response.data?.quiz) {
        setCurrentQuiz(response.data.quiz);
        setQuizResult(null);
      }

      // Refresh task lists & audit runs
      const [updatedTasks, updatedRuns] = await Promise.all([api.getTasks(), api.getAgentRuns()]);
      setTasks(updatedTasks.tasks || []);
      setAgentRuns(updatedRuns.runs || []);
    } catch (error) {
      const errorMessage = {
        role: 'assistant',
        content: `⚠️ Error executing request: ${error.message}. Please check that the server is running on port 5000.`,
        createdAt: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Quick prompt selection (e.g. from Dashboard)
  const handleSelectPrompt = (promptText) => {
    setActiveTab('chat');
    handleSendMessage(promptText);
  };

  // Task actions
  const handleCreateTask = async (taskData) => {
    try {
      const res = await api.createTask(taskData);
      setTasks((prev) => [res.task, ...prev]);
    } catch (err) {
      alert(`Failed to create task: ${err.message}`);
    }
  };

  const handleCompleteTask = async (taskId) => {
    try {
      const res = await api.completeTask(taskId);
      setTasks((prev) => prev.map((t) => (t.id === taskId ? res.task : t)));
    } catch (err) {
      alert(`Failed to complete task: ${err.message}`);
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await api.deleteTask(taskId);
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
    } catch (err) {
      alert(`Failed to delete task: ${err.message}`);
    }
  };

  // Plan generation
  const handleGeneratePlan = async (params) => {
    setIsLoading(true);
    try {
      const res = await api.generatePlan(params);
      setCurrentPlan(res.plan);
      setPlans((prev) => [res.plan, ...prev]);
      const updatedRuns = await api.getAgentRuns();
      setAgentRuns(updatedRuns.runs || []);
    } catch (err) {
      alert(`Failed to generate study plan: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Quiz actions
  const handleGenerateQuiz = async (params) => {
    setIsLoading(true);
    try {
      const res = await api.generateQuiz(params);
      setCurrentQuiz(res.quiz);
      setQuizResult(null);
    } catch (err) {
      alert(`Failed to generate quiz: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitQuiz = async (quizId, answers) => {
    setIsLoading(true);
    try {
      const res = await api.submitQuiz(quizId, answers);
      setQuizResult(res.result);
    } catch (err) {
      alert(`Failed to submit quiz: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Reset to initial hackathon seed data
  const handleResetData = async () => {
    try {
      await api.resetSeedData();
      await loadInitialData();
      alert('Seeded academic tasks successfully restored!');
    } catch (err) {
      alert(`Failed to reset: ${err.message}`);
    }
  };

  const pendingCount = tasks.filter((t) => t.status === 'pending').length;

  return (
    <div className="min-h-screen bg-[#0B0F19] text-slate-100 flex flex-col font-sans">
      {/* Top Navbar */}
      <Navbar
        health={health}
        onResetData={handleResetData}
        onOpenBedrockInfo={() => setIsBedrockModalOpen(true)}
      />

      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {/* Left Sidebar */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          voiceEnabled={voiceEnabled}
          setVoiceEnabled={setVoiceEnabled}
          pendingTasksCount={pendingCount}
        />

        {/* Mobile Navigation Bar */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0F172A]/95 border-t border-slate-800 p-2 flex justify-around backdrop-blur-md">
          {['dashboard', 'chat', 'planner', 'tasks', 'quiz', 'mcp'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`text-xs capitalize px-2 py-1.5 rounded-lg ${
                activeTab === tab ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Main Workspace Area */}
        <main className="flex-1 p-4 sm:p-6 pb-20 md:pb-6 overflow-x-hidden">
          {activeTab === 'dashboard' && (
            <Dashboard
              tasks={tasks}
              plans={plans}
              onSelectPrompt={handleSelectPrompt}
              onNavigate={(tab) => setActiveTab(tab)}
              onCompleteTask={handleCompleteTask}
            />
          )}

          {activeTab === 'chat' && (
            <ChatPanel
              messages={messages}
              onSendMessage={handleSendMessage}
              isLoading={isLoading}
              voiceEnabled={voiceEnabled}
              onNavigate={(tab) => setActiveTab(tab)}
              onSelectPrompt={handleSelectPrompt}
            />
          )}

          {activeTab === 'planner' && (
            <ScheduleView
              currentPlan={currentPlan}
              onGeneratePlan={handleGeneratePlan}
              isLoading={isLoading}
            />
          )}

          {activeTab === 'tasks' && (
            <TaskBoard
              tasks={tasks}
              onCreateTask={handleCreateTask}
              onCompleteTask={handleCompleteTask}
              onDeleteTask={handleDeleteTask}
            />
          )}

          {activeTab === 'quiz' && (
            <QuizPanel
              currentQuiz={currentQuiz}
              onGenerateQuiz={handleGenerateQuiz}
              onSubmitQuiz={handleSubmitQuiz}
              quizResult={quizResult}
              isLoading={isLoading}
            />
          )}

          {activeTab === 'mcp' && (
            <ToolTimeline
              agentRuns={agentRuns}
              mcpMetadata={mcpMetadata}
            />
          )}
        </main>
      </div>

      {/* Bedrock Architecture Modal */}
      <BedrockModal
        isOpen={isBedrockModalOpen}
        onClose={() => setIsBedrockModalOpen(false)}
        health={health}
      />
    </div>
  );
}
