import React, { useState } from 'react';
import {
  HelpCircle,
  CheckCircle2,
  XCircle,
  Sparkles,
  ArrowRight,
  RotateCcw,
  BookOpen,
  Award,
} from 'lucide-react';

export default function QuizPanel({
  currentQuiz,
  onGenerateQuiz,
  onSubmitQuiz,
  quizResult,
  isLoading = false,
}) {
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [customTopic, setCustomTopic] = useState('');
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);

  const questions = currentQuiz?.questions || [];
  const topic = currentQuiz?.topic || 'Database normalization';
  const totalQuestions = questions.length;

  const handleOptionSelect = (qIdx, optIdx) => {
    if (quizResult) return; // Locked once submitted
    setSelectedAnswers((prev) => ({
      ...prev,
      [qIdx]: optIdx,
    }));
  };

  const handleSubmit = () => {
    if (!currentQuiz?.quizId) return;
    const answersArray = questions.map((_, idx) =>
      selectedAnswers[idx] !== undefined ? selectedAnswers[idx] : -1
    );
    onSubmitQuiz(currentQuiz.quizId, answersArray);
  };

  const handleStartNewQuiz = (presetTopic) => {
    setSelectedAnswers({});
    setCurrentQuestionIdx(0);
    onGenerateQuiz({ topic: presetTopic || customTopic || 'Database normalization' });
  };

  return (
    <div className="space-y-6">
      {/* Quiz Header & Quick Launch Topics */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <HelpCircle className="h-5 w-5 text-cyan-400" />
              Active Recall Quiz Mode
            </h1>
            <span className="rounded-full bg-cyan-500/10 px-2 py-0.5 text-xs font-mono text-cyan-300 border border-cyan-500/30">
              AWS Bedrock Powered
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Conceals answers to promote active cognitive retrieval before revealing verified explanations.
          </p>
        </div>

        {/* Quick Topic Chips */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => handleStartNewQuiz('Database normalization')}
            className="rounded-lg border border-indigo-500/30 bg-indigo-500/10 px-3 py-1.5 text-xs font-semibold text-indigo-300 hover:bg-indigo-500/20 transition"
          >
            DBMS Normalization
          </button>
          <button
            onClick={() => handleStartNewQuiz('DSA Graph Algorithms')}
            className="rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-3 py-1.5 text-xs font-semibold text-cyan-300 hover:bg-cyan-500/20 transition"
          >
            DSA Graphs & Kahn
          </button>
          <button
            onClick={() => handleStartNewQuiz('OS Virtual Memory')}
            className="rounded-lg border border-purple-500/30 bg-purple-500/10 px-3 py-1.5 text-xs font-semibold text-purple-300 hover:bg-purple-500/20 transition"
          >
            OS Paging & TLB
          </button>
        </div>
      </div>

      {/* Main Quiz Area */}
      {questions.length === 0 ? (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-12 text-center space-y-4">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <Sparkles className="h-7 w-7" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-white">No active quiz session</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Launch an active recall quiz on your academic courses to solidify exam preparation.
            </p>
          </div>
          <button
            onClick={() => handleStartNewQuiz('Database normalization')}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 px-5 py-2.5 text-xs font-semibold text-white shadow-lg hover:brightness-110 transition"
          >
            Start DBMS Normalization Practice
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Quiz Score Summary Banner (When Submitted) */}
          {quizResult && (
            <div className="rounded-2xl border border-indigo-500/40 bg-gradient-to-r from-indigo-950/70 via-slate-900 to-cyan-950/40 p-6 shadow-xl backdrop-blur-md">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-bold text-emerald-300 border border-emerald-500/40">
                    <Award className="h-4 w-4" />
                    Quiz Complete
                  </div>
                  <h2 className="text-xl font-bold text-white">
                    Score: {quizResult.score} / {quizResult.totalQuestions} ({quizResult.percentage}%)
                  </h2>
                  <p className="text-xs text-slate-300">
                    Topic: <span className="font-semibold text-cyan-300">{quizResult.topic}</span> • Verified answer rationales unlocked below.
                  </p>
                </div>

                <button
                  onClick={() => handleStartNewQuiz(topic)}
                  className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-indigo-500 transition self-start sm:self-auto"
                >
                  <RotateCcw className="h-4 w-4" />
                  Try Again or Change Topic
                </button>
              </div>
            </div>
          )}

          {/* Active Question Cards */}
          <div className="space-y-4">
            {questions.map((q, qIdx) => {
              const feedback = quizResult?.feedback?.[qIdx];
              const isSelectedAny = selectedAnswers[qIdx] !== undefined;

              return (
                <div
                  key={q.id || qIdx}
                  className="rounded-xl border border-slate-800 bg-slate-900/70 p-5 space-y-4 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-800 text-cyan-400 border border-slate-700">
                      Question {qIdx + 1} of {totalQuestions}
                    </span>
                    {feedback && (
                      <span
                        className={`text-xs font-bold flex items-center gap-1 px-2.5 py-0.5 rounded-full border ${
                          feedback.isCorrect
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                            : 'bg-red-500/20 text-red-300 border-red-500/40'
                        }`}
                      >
                        {feedback.isCorrect ? (
                          <>
                            <CheckCircle2 className="h-3.5 w-3.5" /> Correct
                          </>
                        ) : (
                          <>
                            <XCircle className="h-3.5 w-3.5" /> Incorrect
                          </>
                        )}
                      </span>
                    )}
                  </div>

                  <h3 className="text-sm sm:text-base font-semibold text-white leading-relaxed">
                    {q.question}
                  </h3>

                  {/* Multiple Choice Options */}
                  <div className="space-y-2">
                    {q.options.map((opt, optIdx) => {
                      const isSelected = selectedAnswers[qIdx] === optIdx;
                      const isCorrectAnswer = feedback && feedback.correctAnswerIndex === optIdx;
                      const isWrongSelection = feedback && isSelected && !feedback.isCorrect;

                      let optionStyle =
                        'border-slate-800 bg-slate-950/60 text-slate-300 hover:border-slate-700 hover:bg-slate-900';
                      if (isSelected && !quizResult) {
                        optionStyle = 'border-cyan-500/60 bg-cyan-950/30 text-cyan-200 font-semibold';
                      } else if (isCorrectAnswer) {
                        optionStyle =
                          'border-emerald-500/60 bg-emerald-950/40 text-emerald-200 font-semibold ring-1 ring-emerald-500/30';
                      } else if (isWrongSelection) {
                        optionStyle =
                          'border-red-500/60 bg-red-950/40 text-red-200 font-semibold';
                      }

                      return (
                        <button
                          key={optIdx}
                          disabled={!!quizResult}
                          onClick={() => handleOptionSelect(qIdx, optIdx)}
                          className={`w-full text-left p-3.5 rounded-xl border text-xs sm:text-sm transition flex items-center justify-between ${optionStyle}`}
                        >
                          <div className="flex items-center gap-3">
                            <span className="font-mono text-xs font-bold text-slate-500">
                              {String.fromCharCode(65 + optIdx)}.
                            </span>
                            <span>{opt}</span>
                          </div>
                          {isCorrectAnswer && (
                            <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0" />
                          )}
                          {isWrongSelection && (
                            <XCircle className="h-4 w-4 text-red-400 flex-shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Verified Explanation (Revealed after submission) */}
                  {feedback && feedback.explanation && (
                    <div className="mt-3 p-3.5 rounded-xl border border-indigo-500/30 bg-indigo-950/20 text-xs text-indigo-200 leading-relaxed">
                      <span className="font-bold text-indigo-300 block mb-1">
                        Active Recall Explanation:
                      </span>
                      {feedback.explanation}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Submission Bar */}
          {!quizResult && (
            <div className="sticky bottom-4 z-30 flex items-center justify-between p-4 rounded-xl border border-slate-700 bg-slate-950/90 shadow-2xl backdrop-blur-md">
              <span className="text-xs text-slate-300">
                Answered {Object.keys(selectedAnswers).length} of {totalQuestions} questions
              </span>

              <button
                disabled={Object.keys(selectedAnswers).length === 0 || isLoading}
                onClick={handleSubmit}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 px-5 py-2.5 text-xs font-bold text-white shadow-lg hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                <span>Submit Quiz & View Explanations</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
