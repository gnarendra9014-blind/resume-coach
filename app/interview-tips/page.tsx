"use client";
import { useState } from "react";

export default function InterviewTips() {
  const [role, setRole] = useState("");
  const [tips, setTips] = useState("");
  const [loading, setLoading] = useState(false);

  const getTips = async () => {
    if (!role) return;
    setLoading(true);
    const res = await fetch("/api/tips", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role }),
    });
    const data = await res.json();
    setTips(data.result);
    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-orange-50">
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between shadow-sm">
        <a href="/" className="flex items-center gap-2">
          <div className="bg-blue-600 text-white font-bold text-lg px-3 py-1 rounded-md">RC</div>
          <span className="text-xl font-bold text-gray-800">Resume Coach</span>
        </a>
        <a href="/" className="text-sm text-gray-500 hover:text-gray-800 transition">← Back to Home</a>
      </nav>

      {!tips ? (
        <>
          {/* Hero */}
          <div className="max-w-6xl mx-auto px-8 py-20 flex flex-col md:flex-row items-center gap-12">
            <div className="flex-1">
              <div className="inline-block bg-yellow-100 text-yellow-700 text-sm font-semibold px-4 py-1 rounded-full mb-6">
                💡 AI Interview Tips
              </div>
              <h1 className="text-5xl font-extrabold text-gray-900 leading-tight mb-6">
                Crack Any Interview<br />With <span className="text-yellow-500">Smart Tips</span>
              </h1>
              <p className="text-gray-500 text-lg mb-8 max-w-md">
                Get role-specific interview tips, common questions, and preparation strategies curated by AI — tailored just for your target role.
              </p>
              <div className="flex flex-wrap gap-3">
                {["Role-specific tips", "Common questions", "Do's & Don'ts", "Preparation strategy"].map((f) => (
                  <span key={f} className="bg-white border border-gray-200 text-gray-600 text-sm px-4 py-2 rounded-full shadow-sm">{f}</span>
                ))}
              </div>
            </div>

            {/* Mockup */}
            <div className="flex-1 flex justify-center">
              <div className="bg-white rounded-2xl shadow-2xl p-6 w-80 border border-gray-100">
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-3">
                  <p className="text-yellow-700 text-xs font-bold mb-2">💡 TOP TIPS</p>
                  {["Research the company well", "Prepare STAR answers", "Ask smart questions"].map((tip) => (
                    <div key={tip} className="flex items-center gap-2 mb-2">
                      <span className="text-yellow-500 text-sm">→</span>
                      <p className="text-gray-600 text-xs">{tip}</p>
                    </div>
                  ))}
                </div>
                <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
                  <p className="text-orange-700 text-xs font-bold mb-2">❓ COMMON QUESTIONS</p>
                  <div className="h-2 bg-orange-200 rounded w-full mb-1"></div>
                  <div className="h-2 bg-orange-200 rounded w-4/5 mb-1"></div>
                  <div className="h-2 bg-orange-200 rounded w-3/5"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Input Card */}
          <div className="max-w-xl mx-auto px-6 pb-20">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">What role are you preparing for?</h2>
              <p className="text-gray-400 text-sm mb-6">We'll generate tailored tips just for your role</p>
              <input
                type="text"
                placeholder="e.g. Software Developer, Data Analyst, HR..."
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800 placeholder-gray-400 focus:outline-none focus:border-yellow-500 focus:bg-white transition mb-4"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              />
              <button
                onClick={getTips}
                disabled={loading || !role}
                className="w-full bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-200 disabled:text-gray-400 text-white py-4 rounded-full font-bold text-lg transition shadow-lg hover:shadow-xl"
              >
                {loading ? "Getting tips..." : "Get Interview Tips →"}
              </button>
            </div>

            <div className="flex flex-wrap gap-3 justify-center mt-8">
              {["Free forever", "AI powered", "Role specific", "Instant results"].map((f) => (
                <span key={f} className="bg-white border border-gray-200 text-gray-600 text-sm px-4 py-2 rounded-full shadow-sm">{f}</span>
              ))}
            </div>
          </div>
        </>
      ) : (
        <div className="max-w-2xl mx-auto px-6 py-12">
          <div className="text-center mb-8">
            <span className="bg-yellow-100 text-yellow-700 text-sm font-semibold px-4 py-1 rounded-full">
              💡 Tips for {role}
            </span>
          </div>

          <div className="bg-white border-2 border-yellow-200 rounded-2xl p-8 shadow-sm">
            <p className="text-yellow-600 text-xs font-bold mb-4 uppercase tracking-wide">✅ Tips for {role.toUpperCase()}</p>
            <pre className="whitespace-pre-wrap text-gray-700 leading-relaxed text-sm bg-gray-50 rounded-xl p-6">{tips}</pre>
            <button
              onClick={() => { setTips(""); setRole(""); }}
              className="mt-6 w-full border-2 border-yellow-200 hover:bg-yellow-50 text-yellow-600 font-bold py-3 rounded-full text-sm transition"
            >
              Search Another Role
            </button>
          </div>
        </div>
      )}
    </main>
  );
}