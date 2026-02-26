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
    <main className="min-h-screen bg-gray-950 text-white">
      <div className="bg-gray-900 border-b border-gray-800 px-6 py-4">
        <h1 className="text-2xl font-bold text-yellow-400">💡 Interview Tips</h1>
        <p className="text-gray-400 text-sm">Get role-specific tips to crack your interview</p>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-12">
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 mb-6">
          <h2 className="text-xl font-bold mb-4">What role are you preparing for?</h2>
          <input
            type="text"
            placeholder="e.g. Software Developer, Data Analyst, HR..."
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500 mb-4"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          />
          <button
            onClick={getTips}
            disabled={loading || !role}
            className="w-full bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-700 text-white py-3 rounded-lg font-semibold transition"
          >
            {loading ? "Getting tips..." : "Get Interview Tips →"}
          </button>
        </div>

        {tips && (
          <div className="bg-gray-900 border border-yellow-800 rounded-2xl p-8">
            <p className="text-yellow-400 font-bold text-sm mb-4">✅ TIPS FOR {role.toUpperCase()}</p>
            <pre className="whitespace-pre-wrap text-gray-200 leading-relaxed text-sm">{tips}</pre>
            <button
              onClick={() => { setTips(""); setRole(""); }}
              className="mt-6 w-full border border-gray-700 hover:border-yellow-500 text-gray-400 hover:text-white py-2 rounded-lg text-sm transition"
            >
              Search Another Role
            </button>
          </div>
        )}
      </div>
    </main>
  );
}