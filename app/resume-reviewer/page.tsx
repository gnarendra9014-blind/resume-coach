"use client";
import { useState } from "react";

export default function ResumeReviewer() {
  const [resume, setResume] = useState("");
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(false);

  const reviewResume = async () => {
    if (!resume) return;
    setLoading(true);
    const res = await fetch("/api/reviewer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ resume }),
    });
    const data = await res.json();
    setFeedback(data.result);
    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between shadow-sm">
        <a href="/" className="flex items-center gap-2">
          <div className="bg-blue-600 text-white font-bold text-lg px-3 py-1 rounded-md">RC</div>
          <span className="text-xl font-bold text-gray-800">Resume Coach</span>
        </a>
        <a href="/" className="text-sm text-gray-500 hover:text-gray-800 transition">← Back to Home</a>
      </nav>

      {!feedback ? (
        <>
          {/* Hero */}
          <div className="max-w-6xl mx-auto px-8 py-20 flex flex-col md:flex-row items-center gap-12">
            <div className="flex-1">
              <div className="inline-block bg-purple-100 text-purple-700 text-sm font-semibold px-4 py-1 rounded-full mb-6">
                🔍 AI Resume Reviewer
              </div>
              <h1 className="text-5xl font-extrabold text-gray-900 leading-tight mb-6">
                Get Expert<br />Feedback on Your <span className="text-purple-600">Resume</span>
              </h1>
              <p className="text-gray-500 text-lg mb-8 max-w-md">
                Paste your existing resume and our AI will give you detailed, actionable feedback to make it stand out to recruiters.
              </p>
              <div className="flex flex-wrap gap-3">
                {["ATS Optimization", "Grammar Check", "Content Feedback", "Structure Review"].map((f) => (
                  <span key={f} className="bg-white border border-gray-200 text-gray-600 text-sm px-4 py-2 rounded-full shadow-sm">{f}</span>
                ))}
              </div>
            </div>

            {/* Mockup */}
            <div className="flex-1 flex justify-center">
              <div className="bg-white rounded-2xl shadow-2xl p-6 w-80 border border-gray-100 relative">
                <div className="absolute -top-3 -right-3 bg-purple-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow">
                  🔍 Reviewing...
                </div>
                <div className="space-y-2 mb-4">
                  <div className="h-3 bg-gray-800 rounded w-2/5"></div>
                  <div className="h-2 bg-gray-200 rounded w-full"></div>
                  <div className="h-2 bg-gray-200 rounded w-4/5"></div>
                  <div className="h-2 bg-purple-100 rounded w-3/5 mt-3"></div>
                  <div className="h-2 bg-gray-200 rounded w-full"></div>
                  <div className="h-2 bg-gray-200 rounded w-5/6"></div>
                </div>
                <div className="bg-purple-50 border border-purple-200 rounded-xl p-3">
                  <p className="text-purple-700 text-xs font-bold mb-2">AI SUGGESTIONS</p>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-green-500 text-xs">✓</span>
                    <div className="h-2 bg-green-200 rounded w-4/5"></div>
                  </div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-yellow-500 text-xs">!</span>
                    <div className="h-2 bg-yellow-200 rounded w-3/5"></div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-red-500 text-xs">✗</span>
                    <div className="h-2 bg-red-200 rounded w-4/5"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Input Card */}
          <div className="max-w-2xl mx-auto px-6 pb-20">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Paste your resume below</h2>
              <p className="text-gray-400 text-sm mb-6">Copy and paste your entire resume text for a detailed review</p>
              <textarea
                rows={12}
                placeholder="Paste your entire resume text here..."
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800 placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:bg-white transition mb-4"
                value={resume}
                onChange={(e) => setResume(e.target.value)}
              />
              <button
                onClick={reviewResume}
                disabled={loading || !resume}
                className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-200 disabled:text-gray-400 text-white py-4 rounded-full font-bold text-lg transition shadow-lg hover:shadow-xl"
              >
                {loading ? "Reviewing your resume..." : "Review My Resume →"}
              </button>
            </div>
          </div>
        </>
      ) : (
        <div className="max-w-2xl mx-auto px-6 py-12">
          <div className="text-center mb-8">
            <span className="bg-purple-100 text-purple-700 text-sm font-semibold px-4 py-1 rounded-full">
              🔍 Resume Review Complete
            </span>
          </div>

          <div className="bg-white border-2 border-purple-200 rounded-2xl p-8 shadow-sm">
            <p className="text-purple-600 text-xs font-bold mb-4 uppercase tracking-wide">✅ AI Feedback on Your Resume</p>
            <pre className="whitespace-pre-wrap text-gray-700 leading-relaxed text-sm bg-gray-50 rounded-xl p-6">{feedback}</pre>
            <button
              onClick={() => { setFeedback(""); setResume(""); }}
              className="mt-6 w-full border-2 border-purple-200 hover:bg-purple-50 text-purple-600 font-bold py-3 rounded-full text-sm transition"
            >
              Review Another Resume
            </button>
          </div>
        </div>
      )}
    </main>
  );
}