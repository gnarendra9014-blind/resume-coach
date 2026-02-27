"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

const LANGUAGES = [
  { code: "english", label: "English" },
  { code: "hindi", label: "Hindi" },
  { code: "telugu", label: "Telugu" },
  { code: "tamil", label: "Tamil" },
  { code: "kannada", label: "Kannada" },
];

const TEMPLATES = [
  { code: "classic", label: "📄 Classic", desc: "Traditional format with ALL CAPS headers" },
  { code: "modern", label: "✨ Modern", desc: "Sleek with bold headers and separators" },
  { code: "minimal", label: "🎯 Minimal", desc: "Short, clean and to the point" },
  { code: "creative", label: "🎨 Creative", desc: "Unique structure that stands out" },
];

export default function ResumeBuilder() {
  const [form, setForm] = useState({
    name: "", email: "", phone: "", role: "",
    skills: "", education: "", projects: "", experience: "",
  });
  const [language, setLanguage] = useState("english");
  const [template, setTemplate] = useState("classic");
  const [resume, setResume] = useState("");
  const [loading, setLoading] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [atsScore, setAtsScore] = useState<number | null>(null);
  const [atsTips, setAtsTips] = useState<string[]>([]);
  const [atsLoading, setAtsLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const generateResume = async () => {
    setLoading(true);
    setSaved(false);
    setAtsScore(null);
    setAtsTips([]);
    const res = await fetch("/api/resume", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, language, template }),
    });
    const data = await res.json();
    setResume(data.result);
    setLoading(false);
  };

  const regenerateResume = async () => {
    setRegenerating(true);
    setSaved(false);
    setAtsScore(null);
    setAtsTips([]);
    const res = await fetch("/api/resume", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, language, template }),
    });
    const data = await res.json();
    setResume(data.result);
    setRegenerating(false);
  };

  const checkATS = async () => {
    setAtsLoading(true);
    const res = await fetch("/api/ats-score", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ resume }),
    });
    const data = await res.json();
    const text = data.result;

    const scoreMatch = text.match(/SCORE:\s*(\d+)/);
    const tipsMatch = text.split("TIPS:")[1];

    if (scoreMatch) setAtsScore(parseInt(scoreMatch[1]));
    if (tipsMatch) {
      const tips = tipsMatch.split("\n").filter((t: string) => t.trim().startsWith("-")).map((t: string) => t.replace("-", "").trim());
      setAtsTips(tips);
    }
    setAtsLoading(false);
  };

  const saveResume = async () => {
    if (!user) {
      window.location.href = "/login";
      return;
    }
    setSaving(true);
    const { error } = await supabase.from("resumes").insert({
      user_id: user.id,
      name: form.name + " - " + form.role,
      content: resume,
    });
    if (!error) setSaved(true);
    setSaving(false);
  };

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      <div className="bg-gray-900 border-b border-gray-800 px-6 py-4 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-blue-400">📄 Resume Builder</h1>
          <p className="text-gray-400 text-sm">Fill in your details and AI will craft your resume</p>
        </div>
        {user ? (
          <a href="/my-resumes" className="text-sm text-blue-400 hover:underline">My Saved Resumes →</a>
        ) : (
          <a href="/login" className="text-sm text-gray-400 hover:text-white border border-gray-700 px-3 py-1 rounded-lg">Login to Save</a>
        )}
      </div>

      <div className="max-w-3xl mx-auto px-6 py-10 space-y-6">
        {!resume ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { label: "Full Name", name: "name", placeholder: "e.g. Rahul Sharma" },
                { label: "Email", name: "email", placeholder: "e.g. rahul@gmail.com" },
                { label: "Phone", name: "phone", placeholder: "e.g. 9876543210" },
                { label: "Target Role", name: "role", placeholder: "e.g. Software Developer" },
              ].map((field) => (
                <div key={field.name}>
                  <label className="text-gray-400 text-sm mb-1 block">{field.label}</label>
                  <input
                    type="text"
                    name={field.name}
                    placeholder={field.placeholder}
                    value={form[field.name as keyof typeof form]}
                    onChange={handleChange}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                  />
                </div>
              ))}
            </div>

            {[
              { label: "Skills", name: "skills", placeholder: "e.g. Python, React, SQL..." },
              { label: "Education", name: "education", placeholder: "e.g. B.E Computer Science, VTU, 2024, 8.5 CGPA" },
              { label: "Projects", name: "projects", placeholder: "e.g. Built an e-commerce website using React..." },
              { label: "Experience / Internships", name: "experience", placeholder: "e.g. None (Fresher)" },
            ].map((field) => (
              <div key={field.name}>
                <label className="text-gray-400 text-sm mb-1 block">{field.label}</label>
                <textarea
                  rows={3}
                  name={field.name}
                  placeholder={field.placeholder}
                  value={form[field.name as keyof typeof form]}
                  onChange={handleChange}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                />
              </div>
            ))}

            {/* Template Selector */}
            <div>
              <label className="text-gray-400 text-sm mb-2 block">🎨 Resume Template</label>
              <div className="grid grid-cols-2 gap-3">
                {TEMPLATES.map((t) => (
                  <button
                    key={t.code}
                    onClick={() => setTemplate(t.code)}
                    className={`px-4 py-3 rounded-lg border text-left transition ${
                      template === t.code
                        ? "bg-blue-600 border-blue-500 text-white"
                        : "bg-gray-800 border-gray-700 text-gray-300 hover:border-blue-500"
                    }`}
                  >
                    <div className="font-semibold text-sm">{t.label}</div>
                    <div className="text-xs opacity-70 mt-1">{t.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Language Selector */}
            <div>
              <label className="text-gray-400 text-sm mb-2 block">🌐 Resume Language</label>
              <div className="flex flex-wrap gap-3">
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => setLanguage(lang.code)}
                    className={`px-4 py-2 rounded-lg border text-sm font-medium transition ${
                      language === lang.code
                        ? "bg-blue-600 border-blue-500 text-white"
                        : "bg-gray-800 border-gray-700 text-gray-300 hover:border-blue-500"
                    }`}
                  >
                    {lang.label}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={generateResume}
              disabled={loading || !form.name || !form.role}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 text-white py-3 rounded-lg font-semibold transition"
            >
              {loading ? "Generating your resume..." : "Generate Resume with AI →"}
            </button>
          </>
        ) : (
          <div className="bg-gray-900 border border-blue-800 rounded-2xl p-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-blue-400 font-bold text-lg">✅ Your AI Generated Resume</h2>
              <div className="flex gap-2">
                <button
                  onClick={regenerateResume}
                  disabled={regenerating}
                  className="text-sm text-yellow-400 hover:text-white border border-yellow-700 hover:border-yellow-400 px-3 py-1 rounded-lg transition"
                >
                  {regenerating ? "Regenerating..." : "🔁 Regenerate"}
                </button>
                <button
                  onClick={() => { setResume(""); setSaved(false); setAtsScore(null); setAtsTips([]); }}
                  className="text-sm text-gray-400 hover:text-white border border-gray-700 px-3 py-1 rounded-lg"
                >
                  ← Edit Details
                </button>
              </div>
            </div>

            {regenerating ? (
              <div className="text-center py-10 text-gray-400">🔁 Generating a fresh resume...</div>
            ) : (
              <pre className="whitespace-pre-wrap text-gray-200 leading-relaxed font-mono text-sm mb-6">{resume}</pre>
            )}

            {/* ATS Score Section */}
            <div className="mb-6">
              <button
                onClick={checkATS}
                disabled={atsLoading || regenerating}
                className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 text-white py-3 rounded-lg font-semibold transition"
              >
                {atsLoading ? "Analyzing..." : "📊 Check ATS Score"}
              </button>

              {atsScore !== null && (
                <div className="mt-4 bg-gray-800 rounded-xl p-5">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-gray-300 font-semibold">ATS Score</span>
                    <span className={`text-2xl font-bold ${atsScore >= 80 ? "text-green-400" : atsScore >= 60 ? "text-yellow-400" : "text-red-400"}`}>
                      {atsScore}/100
                    </span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-3 mb-4">
                    <div
                      className={`h-3 rounded-full transition-all ${atsScore >= 80 ? "bg-green-500" : atsScore >= 60 ? "bg-yellow-500" : "bg-red-500"}`}
                      style={{ width: `${atsScore}%` }}
                    />
                  </div>
                  {atsTips.length > 0 && (
                    <div>
                      <p className="text-gray-400 text-sm font-semibold mb-2">💡 Tips to Improve:</p>
                      <ul className="space-y-1">
                        {atsTips.map((tip, i) => (
                          <li key={i} className="text-gray-300 text-sm flex gap-2">
                            <span className="text-purple-400">→</span> {tip}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>

            {saved ? (
              <div className="text-center text-green-400 font-semibold py-3">
                ✅ Resume saved successfully!
              </div>
            ) : (
              <button
                onClick={saveResume}
                disabled={saving || regenerating}
                className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-700 text-white py-3 rounded-lg font-semibold transition"
              >
                {saving ? "Saving..." : "💾 Save Resume"}
              </button>
            )}
          </div>
        )}
      </div>
    </main>
  );
}