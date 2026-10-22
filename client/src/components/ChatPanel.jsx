import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Mic,
  MicOff,
  Sparkles,
  Bot,
  User,
  CheckCircle,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Volume2,
  Calendar,
  HelpCircle,
  Clock,
  Layers,
  Activity,
} from 'lucide-react';
import { speech } from '../utils/speech.js';

export default function ChatPanel({
  messages = [],
  onSendMessage,
  isLoading = false,
  voiceEnabled = true,
  onNavigate,
  onSelectPrompt,
}) {
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [expandedTools, setExpandedTools] = useState({});
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;
    const msg = input.trim();
    setInput('');
    onSendMessage(msg);
  };

  const toggleVoiceListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    if (!speech.isRecognitionSupported()) {
      alert('Speech recognition is not supported in this browser. You can type your request directly.');
      return;
    }

    const recognizer = speech.createRecognizer(
      (transcript) => {
        setInput(transcript);
        setIsListening(false);
      },
      () => setIsListening(false),
      () => setIsListening(false)
    );

    if (recognizer) {
      recognitionRef.current = recognizer;
      recognizer.start();
      setIsListening(true);
    }
  };

  const toggleToolExpand = (toolId) => {
    setExpandedTools((prev) => ({
      ...prev,
      [toolId]: !prev[toolId],
    }));
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8.5rem)] rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-md overflow-hidden">
      {/* Alexa+ Assistant Header */}
      <div className="flex items-center justify-between border-b border-slate-800 bg-slate-950/70 px-5 py-3">
        <div className="flex items-center gap-3">
          <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 p-0.5">
            <div className="flex h-full w-full items-center justify-center rounded-[10px] bg-slate-950">
              <Bot className="h-5 w-5 text-cyan-400" />
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-white">CampusPilot Agent</h2>
              <span className="rounded-full bg-cyan-500/10 px-2 py-0.5 text-[10px] font-mono text-cyan-400 border border-cyan-500/30">
                Alexa+ MCP Session
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Streamable HTTP • Deterministic Urgency • Bedrock Ready</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {voiceEnabled && (
            <div className="flex items-center gap-1.5 text-xs text-cyan-300 bg-cyan-950/40 px-2.5 py-1 rounded-full border border-cyan-500/30">
              <Volume2 className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Voice Audio Active</span>
            </div>
          )}
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center max-w-md mx-auto space-y-4 my-auto py-12">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shadow-xl alexa-ring-pulse">
              <Sparkles className="h-8 w-8 text-cyan-400" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-white">How can CampusPilot help today?</h3>
              <p className="text-xs text-slate-400">
                Describe your academic deadlines, ask for a study schedule, or request active recall practice quizzes.
              </p>
            </div>

            {/* Suggested Starter Chips */}
            <div className="w-full space-y-2 pt-2">
              <button
                onClick={() =>
                  onSendMessage(
                    'Plan my next four hours. My DSA assignment is due tonight and my DBMS exam is tomorrow. Then quiz me on normalization.'
                  )
                }
                className="w-full text-left p-3 rounded-xl border border-indigo-500/30 bg-indigo-950/30 hover:bg-indigo-900/40 hover:border-indigo-400/50 text-xs text-slate-200 transition"
              >
                <span className="font-semibold text-indigo-300 block mb-0.5">🌟 Primary Hackathon Benchmark:</span>
                "Plan my next four hours. My DSA assignment is due tonight and my DBMS exam is tomorrow. Then quiz me on normalization."
              </button>

              <button
                onClick={() => onSendMessage('What are my urgent academic deadlines?')}
                className="w-full text-left p-2.5 rounded-lg border border-slate-800 bg-slate-900/40 hover:bg-slate-800/60 text-xs text-slate-300 transition"
              >
                "What are my urgent academic deadlines?"
              </button>

              <button
                onClick={() => onSendMessage('Generate a 5-question quiz on database normalization')}
                className="w-full text-left p-2.5 rounded-lg border border-slate-800 bg-slate-900/40 hover:bg-slate-800/60 text-xs text-slate-300 transition"
              >
                "Generate a 5-question quiz on database normalization"
              </button>
            </div>
          </div>
        ) : (
          messages.map((msg, index) => {
            const isUser = msg.role === 'user';

            return (
              <div
                key={index}
                className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="flex-shrink-0 h-8 w-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center p-0.5 mt-1 shadow-md">
                    <div className="flex h-full w-full items-center justify-center rounded-[10px] bg-slate-950">
                      <Bot className="h-4 w-4 text-cyan-400" />
                    </div>
                  </div>
                )}

                <div className={`max-w-2xl space-y-3 ${isUser ? 'items-end' : 'items-start'}`}>
                  {/* Message Bubble */}
                  <div
                    className={`rounded-2xl p-4 text-sm leading-relaxed ${
                      isUser
                        ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white rounded-tr-none shadow-lg shadow-indigo-600/20'
                        : 'bg-slate-950/80 border border-slate-800 text-slate-200 rounded-tl-none'
                    }`}
                  >
                    <div className="whitespace-pre-wrap">{msg.content}</div>

                    {/* Speech Playback Trigger */}
                    {!isUser && msg.speechText && (
                      <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                        <span className="flex items-center gap-1.5 text-cyan-400 font-medium">
                          <Volume2 className="h-3 w-3" /> Alexa+ Voice
                        </span>
                        <button
                          onClick={() => speech.speak(msg.speechText)}
                          className="text-[11px] hover:text-cyan-300 underline"
                        >
                          Replay voice
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Render MCP Tool Invocations for Assistant Responses */}
                  {!isUser && msg.toolCalls && msg.toolCalls.length > 0 && (
                    <div className="space-y-2 w-full">
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                        <Activity className="h-3.5 w-3.5 text-cyan-400" />
                        MCP Protocol Tool Execution ({msg.toolCalls.length})
                      </p>

                      <div className="space-y-1.5">
                        {msg.toolCalls.map((t, tIdx) => {
                          const toolId = `${index}-${tIdx}`;
                          const isExpanded = !!expandedTools[toolId];

                          return (
                            <div
                              key={tIdx}
                              className="rounded-xl border border-slate-800 bg-slate-950/60 text-xs overflow-hidden"
                            >
                              <button
                                onClick={() => toggleToolExpand(toolId)}
                                className="w-full flex items-center justify-between px-3 py-2 hover:bg-slate-800/40 transition text-left"
                              >
                                <div className="flex items-center gap-2">
                                  <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
                                  <span className="font-mono font-bold text-cyan-300">{t.name}</span>
                                  <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[10px] text-slate-400">
                                    {t.durationMs}ms
                                  </span>
                                </div>
                                <div className="flex items-center gap-1.5 text-slate-400">
                                  <span className="text-[10px]">Inspect</span>
                                  {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                                </div>
                              </button>

                              {isExpanded && (
                                <div className="border-t border-slate-800 bg-slate-950 p-3 space-y-2 font-mono text-[11px]">
                                  <div>
                                    <span className="text-slate-400 font-bold block mb-1">MCP Input Parameters:</span>
                                    <pre className="p-2 rounded bg-slate-900 text-indigo-300 overflow-x-auto">
                                      {JSON.stringify(t.input, null, 2)}
                                    </pre>
                                  </div>
                                  <div>
                                    <span className="text-slate-400 font-bold block mb-1">Server Response (Streamable HTTP):</span>
                                    <pre className="p-2 rounded bg-slate-900 text-emerald-300 overflow-x-auto max-h-48">
                                      {JSON.stringify(t.output, null, 2)}
                                    </pre>
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Direct Shortcuts to Result Panels */}
                  {!isUser && msg.data && (
                    <div className="flex flex-wrap gap-2 pt-1">
                      {msg.data.plan && (
                        <button
                          onClick={() => onNavigate('planner')}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-500/40 bg-indigo-500/10 px-3 py-1.5 text-xs font-semibold text-indigo-300 hover:bg-indigo-500/20 transition"
                        >
                          <Calendar className="h-3.5 w-3.5 text-indigo-400" />
                          <span>Open Full Schedule View</span>
                        </button>
                      )}
                      {msg.data.quiz && (
                        <button
                          onClick={() => onNavigate('quiz')}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-cyan-500/40 bg-cyan-500/10 px-3 py-1.5 text-xs font-semibold text-cyan-300 hover:bg-cyan-500/20 transition"
                        >
                          <HelpCircle className="h-3.5 w-3.5 text-cyan-400" />
                          <span>Take "{msg.data.quiz.topic}" Quiz</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {isUser && (
                  <div className="flex-shrink-0 h-8 w-8 rounded-xl bg-slate-800 flex items-center justify-center mt-1 border border-slate-700">
                    <User className="h-4 w-4 text-slate-300" />
                  </div>
                )}
              </div>
            );
          })
        )}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex gap-3 items-center">
            <div className="h-8 w-8 rounded-xl bg-slate-900 flex items-center justify-center p-0.5 border border-slate-800">
              <Bot className="h-4 w-4 text-cyan-400 animate-spin" />
            </div>
            <div className="rounded-2xl rounded-tl-none bg-slate-950/80 border border-slate-800 p-3.5 text-xs text-slate-300 flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-cyan-400 animate-pulse"></span>
              Executing MCP tools & synthesizing schedule...
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-slate-800 bg-slate-950/90 p-3 sm:p-4">
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          {/* Voice Input Microphone Button */}
          <button
            type="button"
            onClick={toggleVoiceListening}
            className={`p-2.5 rounded-xl border transition ${
              isListening
                ? 'bg-red-500/20 text-red-400 border-red-500/50 animate-pulse'
                : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700'
            }`}
            title={isListening ? 'Listening... click to stop' : 'Click to speak (Voice Input)'}
          >
            {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
          </button>

          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              isListening
                ? 'Listening to your voice...'
                : 'E.g., "Plan my next 4 hours with DSA and DBMS, then quiz me..."'
            }
            className="flex-1 rounded-xl border border-slate-800 bg-slate-900/80 px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />

          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/30 hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed transition flex items-center gap-2"
          >
            <Send className="h-4 w-4" />
            <span className="hidden sm:inline">Send</span>
          </button>
        </form>
      </div>
    </div>
  );
}
