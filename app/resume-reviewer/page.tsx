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
    <main className="min-h-screen bg-gray-950 text-white">
      <div className="bg-gray-900 border-b border-gray-800 px-6 py-4">
        <h1 className="text-2xl font-bold text-purple-400">🔍 Resume Reviewer</h1>
        <p className="text-gray-400 text-sm">Get detailed AI feedback on your resume</p>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-12">
        {!feedback ? (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8">
            <h2 className="text-xl font-bold mb-4">Paste your resume below</h2>
            <textarea
              rows={12}
              placeholder="Paste your entire resume text here..."
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 mb-4"
              value={resume}
              onChange={(e) => setResume(e.target.value)}
            />
            <button
              onClick={reviewResume}
              disabled={loading || !resume}
              className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 text-white py-3 rounded-lg font-semibold transition"
            >
              {loading ? "Reviewing your resume..." : "Review My Resume →"}
            </button>
          </div>
        ) : (
          <div className="bg-gray-900 border border-purple-800 rounded-2xl p-8">
            <p className="text-purple-400 font-bold text-sm mb-4">✅ AI FEEDBACK ON YOUR RESUME</p>
            <pre className="whitespace-pre-wrap text-gray-200 leading-relaxed text-sm">{feedback}</pre>
            <button
              onClick={() => { setFeedback(""); setResume(""); }}
              className="mt-6 w-full border border-gray-700 hover:border-purple-500 text-gray-400 hover:text-white py-2 rounded-lg text-sm transition"
            >
              Review Another Resume
            </button>
          </div>
        )}
      </div>
    </main>
  );
}