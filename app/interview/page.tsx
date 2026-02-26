"use client";
import { useState } from "react";

export default function InterviewPage() {
  const [role, setRole] = useState("");
  const [started, setStarted] = useState(false);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(false);

  const startInterview = async () => {
    if (!role) return;
    setLoading(true);
    const res = await fetch("/api/interview", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role }),
    });
    const data = await res.json();
    setQuestion(data.result);
    setStarted(true);
    setLoading(false);
  };

  const submitAnswer = async () => {
    if (!answer) return;
    setLoading(true);
    const res = await fetch("/api/interview", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role, question, answer }),
    });
    const data = await res.json();
    setFeedback(data.result);
    setLoading(false);
  };

  const nextQuestion = () => {
    setAnswer("");
    setFeedback("");
    startInterview();
  };

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-800 px-6 py-4">
        <h1 className="text-2xl font-bold text-green-400">🎤 Mock Interview</h1>
        <p className="text-gray-400 text-sm">Practice with AI and get instant feedback</p>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-12">
        {!started ? (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8">
            <h2 className="text-2xl font-bold mb-6">What role are you applying for?</h2>
            <input
              type="text"
              placeholder="e.g. Software Developer, Data Analyst, Marketing..."
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-green-500 mb-4"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            />
            <button
              onClick={startInterview}
              disabled={loading || !role}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-700 text-white py-3 rounded-lg font-semibold transition"
            >
              {loading ? "Generating question..." : "Start Interview →"}
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Question */}
            <div className="bg-gray-900 border border-green-800 rounded-2xl p-6">
              <p className="text-green-400 text-sm font-semibold mb-2">INTERVIEW QUESTION</p>
              <p className="text-lg">{question}</p>
            </div>

            {/* Answer */}
            {!feedback && (
              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                <p className="text-gray-400 text-sm font-semibold mb-2">YOUR ANSWER</p>
                <textarea
                  rows={5}
                  placeholder="Type your answer here..."
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-green-500 mb-4"
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                />
                <button
                  onClick={submitAnswer}
                  disabled={loading || !answer}
                  className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-700 text-white py-3 rounded-lg font-semibold transition"
                >
                  {loading ? "Getting feedback..." : "Submit Answer →"}
                </button>
              </div>
            )}

            {/* Feedback */}
            {feedback && (
              <div className="bg-gray-900 border border-blue-800 rounded-2xl p-6">
                <p className="text-blue-400 text-sm font-semibold mb-2">AI FEEDBACK</p>
                <p className="text-gray-200 leading-relaxed">{feedback}</p>
                <button
                  onClick={nextQuestion}
                  className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition"
                >
                  Next Question →
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}