"use client";
import { useState } from "react";

export default function ResumeBuilder() {
  const [form, setForm] = useState({
    name: "", email: "", phone: "", role: "",
    skills: "", education: "", projects: "", experience: "",
  });
  const [resume, setResume] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const generateResume = async () => {
    setLoading(true);
    const res = await fetch("/api/resume", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setResume(data.result);
    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      <div className="bg-gray-900 border-b border-gray-800 px-6 py-4">
        <h1 className="text-2xl font-bold text-blue-400">📄 Resume Builder</h1>
        <p className="text-gray-400 text-sm">Fill in your details and AI will craft your resume</p>
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
              { label: "Skills", name: "skills", placeholder: "e.g. Python, React, SQL, Communication..." },
              { label: "Education", name: "education", placeholder: "e.g. B.E Computer Science, VTU, 2024, 8.5 CGPA" },
              { label: "Projects", name: "projects", placeholder: "e.g. Built an e-commerce website using React and Node.js..." },
              { label: "Experience / Internships", name: "experience", placeholder: "e.g. 2 month internship at XYZ company as web developer... (write None if fresher)" },
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
                onClick={() => setResume("")}
                className="text-sm text-gray-400 hover:text-white border border-gray-700 px-3 py-1 rounded-lg"
              >
                ← Edit Details
              </button>
            </div>
            <pre className="whitespace-pre-wrap text-gray-200 leading-relaxed font-mono text-sm">{resume}</pre>
          </div>
        )}
      </div>
    </main>
  );
}
