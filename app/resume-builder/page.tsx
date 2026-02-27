"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export default function ResumeBuilder() {
  const [form, setForm] = useState({
    name: "", email: "", phone: "", role: "",
    skills: "", education: "", projects: "", experience: "",
  });
  const [resume, setResume] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const generateResume = async () => {
    setLoading(true);
    setSaved(false);
    const res = await fetch("/api/resume", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setResume(data.result);
    setLoading(false);
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
              <button
                onClick={() => { setResume(""); setSaved(false); }}
                className="text-sm text-gray-400 hover:text-white border border-gray-700 px-3 py-1 rounded-lg"
              >
                ← Edit Details
              </button>
            </div>
            <pre className="whitespace-pre-wrap text-gray-200 leading-relaxed font-mono text-sm mb-6">{resume}</pre>

            {saved ? (
              <div className="text-center text-green-400 font-semibold py-3">
                ✅ Resume saved successfully!
              </div>
            ) : (
              <button
                onClick={saveResume}
                disabled={saving}
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