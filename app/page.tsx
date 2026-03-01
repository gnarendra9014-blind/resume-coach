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
  { code: "classic", label: "📄 Classic", desc: "Traditional ALL CAPS headers" },
  { code: "modern", label: "✨ Modern", desc: "Sleek with bold separators" },
  { code: "minimal", label: "🎯 Minimal", desc: "Short and to the point" },
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
  const [started, setStarted] = useState(false);

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
    if (!user) { window.location.href = "/login"; return; }
    setSaving(true);
    const { error } = await supabase.from("resumes").insert({
      user_id: user.id,
      name: form.name + " - " + form.role,
      content: resume,
    });
    if (!error) setSaved(true);
    setSaving(false);
  };

  // HERO PAGE
  if (!started && !resume) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        {/* Navbar */}
        <nav className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between shadow-sm">
          <a href="/" className="flex items-center gap-2">
            <div className="bg-blue-600 text-white font-bold text-lg px-3 py-1 rounded-md">RC</div>
            <span className="text-xl font-bold text-gray-800">Resume Coach</span>
          </a>
          <div className="flex items-center gap-3">
            {user ? (
              <a href="/my-resumes" className="text-sm text-blue-600 font-semibold border border-blue-600 px-4 py-1.5 rounded-full hover:bg-blue-50 transition">My Resumes</a>
            ) : (
              <a href="/login" className="text-sm text-blue-600 font-semibold border border-blue-600 px-4 py-1.5 rounded-full hover:bg-blue-50 transition">Sign In</a>
            )}
          </div>
        </nav>

        {/* Hero */}
        <div className="max-w-6xl mx-auto px-8 py-20 flex flex-col md:flex-row items-center gap-12">
          {/* Left */}
          <div className="flex-1">
            <div className="inline-block bg-blue-100 text-blue-700 text-sm font-semibold px-4 py-1 rounded-full mb-6">
              ✨ AI-Powered Resume Builder
            </div>
            <h1 className="text-5xl font-extrabold text-gray-900 leading-tight mb-6">
              Build a Resume<br />That Gets You <span className="text-blue-600">Hired</span>
            </h1>
            <p className="text-gray-500 text-lg mb-8 max-w-md">
              Fill in your details and our AI will craft a professional, ATS-friendly resume in seconds. Choose from 4 templates and 5 languages.
            </p>
            <div className="flex gap-4 flex-wrap">
              <button
                onClick={() => setStarted(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-4 rounded-full text-lg transition shadow-lg hover:shadow-xl"
              >
                Create My Resume →
              </button>
              <a href="/resume-reviewer">
                <button className="border-2 border-gray-300 hover:border-blue-400 text-gray-700 font-bold px-8 py-4 rounded-full text-lg transition">
                  Review Existing Resume
                </button>
              </a>
            </div>
          </div>

          {/* Right - Resume Mockup */}
          <div className="flex-1 flex justify-center">
            <div className="bg-white rounded-2xl shadow-2xl p-6 w-80 border border-gray-100 relative">
              <div className="absolute -top-3 -right-3 bg-yellow-400 text-gray-900 text-xs font-bold px-3 py-1 rounded-full shadow">
                ✨ AI Generated
              </div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-lg">R</div>
                <div>
                  <div className="font-bold text-gray-800">Rahul Sharma</div>
                  <div className="text-gray-400 text-xs">Software Developer</div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-2 bg-gray-100 rounded-full w-full"></div>
                <div className="h-2 bg-gray-100 rounded-full w-4/5"></div>
                <div className="h-2 bg-blue-100 rounded-full w-3/5 mt-3"></div>
                <div className="h-2 bg-gray-100 rounded-full w-full"></div>
                <div className="h-2 bg-gray-100 rounded-full w-5/6"></div>
                <div className="h-2 bg-blue-100 rounded-full w-3/5 mt-3"></div>
                <div className="h-2 bg-gray-100 rounded-full w-full"></div>
                <div className="h-2 bg-gray-100 rounded-full w-4/5"></div>
              </div>
              <div className="mt-4 flex gap-2">
                <div className="w-6 h-6 rounded-full bg-red-400"></div>
                <div className="w-6 h-6 rounded-full bg-green-400"></div>
                <div className="w-6 h-6 rounded-full bg-blue-600 ring-2 ring-blue-300"></div>
                <div className="w-6 h-6 rounded-full bg-purple-400"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="max-w-6xl mx-auto px-8 pb-20">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-10">Everything you need to land the job</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: "📄", title: "4 Templates", desc: "Classic, Modern, Minimal and Creative resume formats", color: "bg-blue-50" },
              { icon: "🌐", title: "5 Languages", desc: "Generate resumes in English, Hindi, Telugu, Tamil, Kannada", color: "bg-purple-50" },
              { icon: "📊", title: "ATS Score", desc: "Check how well your resume performs with ATS systems", color: "bg-green-50" },
              { icon: "🔁", title: "Regenerate", desc: "Not happy? Regenerate your resume with one click", color: "bg-yellow-50" },
              { icon: "💾", title: "Save Resumes", desc: "Save and access all your resumes anytime", color: "bg-pink-50" },
              { icon: "⚡", title: "Instant AI", desc: "Powered by Groq's blazing fast LLaMA AI model", color: "bg-indigo-50" },
            ].map((f) => (
              <div key={f.title} className={`${f.color} rounded-2xl p-6 border border-white shadow-sm hover:shadow-md transition`}>
                <div className="text-3xl mb-3">{f.icon}</div>
                <h3 className="font-bold text-gray-800 mb-1">{f.title}</h3>
                <p className="text-gray-500 text-sm">{f.desc}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <button
              onClick={() => setStarted(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-10 py-4 rounded-full text-lg transition shadow-lg"
            >
              Build My Resume Now →
            </button>
          </div>
        </div>
      </main>
    );
  }

  // FORM PAGE
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <nav className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between shadow-sm">
        <a href="/" className="flex items-center gap-2">
          <div className="bg-blue-600 text-white font-bold text-lg px-3 py-1 rounded-md">RC</div>
          <span className="text-xl font-bold text-gray-800">Resume Coach</span>
        </a>
        {user ? (
          <a href="/my-resumes" className="text-sm text-blue-600 font-semibold border border-blue-600 px-4 py-1.5 rounded-full hover:bg-blue-50 transition">My Resumes</a>
        ) : (
          <a href="/login" className="text-sm text-blue-600 font-semibold border border-blue-600 px-4 py-1.5 rounded-full hover:bg-blue-50 transition">Sign In</a>
        )}
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-10 space-y-6">
        {!resume ? (
          <>
            <div className="text-center mb-8">
              <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Fill in Your Details</h2>
              <p className="text-gray-500">AI will generate your resume instantly</p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { label: "Full Name", name: "name", placeholder: "e.g. Rahul Sharma" },
                  { label: "Email", name: "email", placeholder: "e.g. rahul@gmail.com" },
                  { label: "Phone", name: "phone", placeholder: "e.g. 9876543210" },
                  { label: "Target Role", name: "role", placeholder: "e.g. Software Developer" },
                ].map((field) => (
                  <div key={field.name}>
                    <label className="text-gray-600 text-sm font-medium mb-1 block">{field.label}</label>
                    <input
                      type="text"
                      name={field.name}
                      placeholder={field.placeholder}
                      value={form[field.name as keyof typeof form]}
                      onChange={handleChange}
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-gray-800 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:bg-white transition"
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
                  <label className="text-gray-600 text-sm font-medium mb-1 block">{field.label}</label>
                  <textarea
                    rows={3}
                    name={field.name}
                    placeholder={field.placeholder}
                    value={form[field.name as keyof typeof form]}
                    onChange={handleChange}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-gray-800 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:bg-white transition"
                  />
                </div>
              ))}
            </div>

            {/* Template Selector */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <label className="text-gray-700 font-semibold mb-3 block">🎨 Choose Template</label>
              <div className="grid grid-cols-2 gap-3">
                {TEMPLATES.map((t) => (
                  <button
                    key={t.code}
                    onClick={() => setTemplate(t.code)}
                    className={`px-4 py-3 rounded-xl border-2 text-left transition ${
                      template === t.code
                        ? "bg-blue-50 border-blue-500 text-blue-700"
                        : "bg-gray-50 border-gray-200 text-gray-600 hover:border-blue-300"
                    }`}
                  >
                    <div className="font-semibold text-sm">{t.label}</div>
                    <div className="text-xs opacity-70 mt-1">{t.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Language Selector */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <label className="text-gray-700 font-semibold mb-3 block">🌐 Resume Language</label>
              <div className="flex flex-wrap gap-3">
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => setLanguage(lang.code)}
                    className={`px-4 py-2 rounded-full border-2 text-sm font-medium transition ${
                      language === lang.code
                        ? "bg-blue-600 border-blue-600 text-white"
                        : "bg-white border-gray-200 text-gray-600 hover:border-blue-400"
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
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white py-4 rounded-full font-bold text-lg transition shadow-lg hover:shadow-xl"
            >
              {loading ? "✨ Generating your resume..." : "Generate Resume with AI →"}
            </button>

            <button
              onClick={() => setStarted(false)}
              className="w-full text-gray-400 hover:text-gray-600 text-sm transition"
            >
              ← Back
            </button>
          </>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-blue-600 font-bold text-xl">✅ Your AI Generated Resume</h2>
              <div className="flex gap-2">
                <button
                  onClick={regenerateResume}
                  disabled={regenerating}
                  className="text-sm text-yellow-600 font-semibold border-2 border-yellow-400 hover:bg-yellow-50 px-4 py-2 rounded-full transition"
                >
                  {regenerating ? "Regenerating..." : "🔁 Regenerate"}
                </button>
                <button
                  onClick={() => { setResume(""); setSaved(false); setAtsScore(null); setAtsTips([]); }}
                  className="text-sm text-gray-500 font-semibold border-2 border-gray-200 hover:bg-gray-50 px-4 py-2 rounded-full transition"
                >
                  ← Edit
                </button>
              </div>
            </div>

            {regenerating ? (
              <div className="text-center py-10 text-gray-400">🔁 Generating a fresh resume...</div>
            ) : (
              <pre className="whitespace-pre-wrap text-gray-700 leading-relaxed font-mono text-sm mb-6 bg-gray-50 rounded-xl p-6">{resume}</pre>
            )}

            {/* ATS Score */}
            <div className="mb-6">
              <button
                onClick={checkATS}
                disabled={atsLoading || regenerating}
                className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 text-white py-3 rounded-full font-bold transition shadow-md"
              >
                {atsLoading ? "Analyzing..." : "📊 Check ATS Score"}
              </button>

              {atsScore !== null && (
                <div className="mt-4 bg-gray-50 rounded-xl p-5">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-gray-700 font-semibold">ATS Score</span>
                    <span className={`text-2xl font-bold ${atsScore >= 80 ? "text-green-500" : atsScore >= 60 ? "text-yellow-500" : "text-red-500"}`}>
                      {atsScore}/100
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
                    <div
                      className={`h-3 rounded-full transition-all ${atsScore >= 80 ? "bg-green-500" : atsScore >= 60 ? "bg-yellow-500" : "bg-red-500"}`}
                      style={{ width: `${atsScore}%` }}
                    />
                  </div>
                  {atsTips.length > 0 && (
                    <div>
                      <p className="text-gray-600 text-sm font-semibold mb-2">💡 Tips to Improve:</p>
                      <ul className="space-y-1">
                        {atsTips.map((tip, i) => (
                          <li key={i} className="text-gray-600 text-sm flex gap-2">
                            <span className="text-purple-500">→</span> {tip}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>

            {saved ? (
              <div className="text-center text-green-500 font-bold py-3">
                ✅ Resume saved successfully!
              </div>
            ) : (
              <button
                onClick={saveResume}
                disabled={saving || regenerating}
                className="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white py-3 rounded-full font-bold transition shadow-md"
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