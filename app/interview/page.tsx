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
    <main className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between shadow-sm">
        <a href="/" className="flex items-center gap-2">
          <div className="bg-blue-600 text-white font-bold text-lg px-3 py-1 rounded-md">RC</div>
          <span className="text-xl font-bold text-gray-800">Resume Coach</span>
        </a>
        <a href="/" className="text-sm text-gray-500 hover:text-gray-800 transition">← Back to Home</a>
      </nav>

      {!started ? (
        <>
          {/* Hero */}
          <div className="max-w-6xl mx-auto px-8 py-20 flex flex-col md:flex-row items-center gap-12">
            <div className="flex-1">
              <div className="inline-block bg-green-100 text-green-700 text-sm font-semibold px-4 py-1 rounded-full mb-6">
                🎤 AI Mock Interview
              </div>
              <h1 className="text-5xl font-extrabold text-gray-900 leading-tight mb-6">
                Practice Interviews<br />Like a <span className="text-green-600">Pro</span>
              </h1>
              <p className="text-gray-500 text-lg mb-8 max-w-md">
                Get real interview questions for your target role and receive instant AI feedback on your answers. Build confidence before the big day!
              </p>
            </div>

            {/* Mockup */}
            <div className="flex-1 flex justify-center">
              <div className="bg-white rounded-2xl shadow-2xl p-6 w-80 border border-gray-100">
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-4">
                  <p className="text-green-700 text-xs font-bold mb-1">INTERVIEW QUESTION</p>
                  <p className="text-gray-700 text-sm">Tell me about a challenging project you worked on and how you handled it.</p>
                </div>
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-4">
                  <p className="text-gray-500 text-xs font-bold mb-1">YOUR ANSWER</p>
                  <div className="h-2 bg-gray-200 rounded w-full mb-1"></div>
                  <div className="h-2 bg-gray-200 rounded w-4/5 mb-1"></div>
                  <div className="h-2 bg-gray-200 rounded w-3/5"></div>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <p className="text-blue-700 text-xs font-bold mb-1">AI FEEDBACK</p>
                  <div className="h-2 bg-blue-200 rounded w-full mb-1"></div>
                  <div className="h-2 bg-blue-200 rounded w-5/6"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Input Card */}
          <div className="max-w-xl mx-auto px-6 pb-20">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">What role are you applying for?</h2>
              <p className="text-gray-400 text-sm mb-6">We'll generate role-specific questions for you</p>
              <input
                type="text"
                placeholder="e.g. Software Developer, Data Analyst, Marketing..."
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800 placeholder-gray-400 focus:outline-none focus:border-green-500 focus:bg-white transition mb-4"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              />
              <button
                onClick={startInterview}
                disabled={loading || !role}
                className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-200 disabled:text-gray-400 text-white py-4 rounded-full font-bold text-lg transition shadow-lg hover:shadow-xl"
              >
                {loading ? "Generating question..." : "Start Interview →"}
              </button>
            </div>

            {/* Feature pills */}
            <div className="flex flex-wrap gap-3 justify-center mt-8">
              {["Role-specific questions", "Instant AI feedback", "Unlimited practice", "Build confidence"].map((f) => (
                <span key={f} className="bg-white border border-gray-200 text-gray-600 text-sm px-4 py-2 rounded-full shadow-sm">{f}</span>
              ))}
            </div>
          </div>
        </>
      ) : (
        <div className="max-w-2xl mx-auto px-6 py-12 space-y-6">
          <div className="text-center mb-4">
            <span className="bg-green-100 text-green-700 text-sm font-semibold px-4 py-1 rounded-full">
              🎤 Mock Interview — {role}
            </span>
          </div>

          {/* Question */}
          <div className="bg-white border-2 border-green-200 rounded-2xl p-6 shadow-sm">
            <p className="text-green-600 text-xs font-bold mb-3 uppercase tracking-wide">Interview Question</p>
            <p className="text-gray-800 text-lg font-medium leading-relaxed">{question}</p>
          </div>

          {/* Answer */}
          {!feedback && (
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
              <p className="text-gray-500 text-xs font-bold mb-3 uppercase tracking-wide">Your Answer</p>
              <textarea
                rows={5}
                placeholder="Type your answer here..."
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800 placeholder-gray-400 focus:outline-none focus:border-green-500 transition mb-4"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
              />
              <button
                onClick={submitAnswer}
                disabled={loading || !answer}
                className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-200 disabled:text-gray-400 text-white py-3 rounded-full font-bold transition shadow-md"
              >
                {loading ? "Getting feedback..." : "Submit Answer →"}
              </button>
            </div>
          )}

          {/* Feedback */}
          {feedback && (
            <div className="bg-white border-2 border-blue-200 rounded-2xl p-6 shadow-sm">
              <p className="text-blue-600 text-xs font-bold mb-3 uppercase tracking-wide">AI Feedback</p>
              <p className="text-gray-700 leading-relaxed">{feedback}</p>
              <button
                onClick={nextQuestion}
                className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-full font-bold transition shadow-md"
              >
                Next Question →
              </button>
            </div>
          )}

          <button
            onClick={() => { setStarted(false); setAnswer(""); setFeedback(""); setQuestion(""); }}
            className="w-full text-gray-400 hover:text-gray-600 text-sm transition text-center"
          >
            ← Change Role
          </button>
        </div>
      )}
    </main>
  );
}