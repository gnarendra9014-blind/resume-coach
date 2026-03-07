"use client";
import { useState, useRef } from "react";

export default function ResumeReviewer() {
  const [resume, setResume] = useState("");
  const [review, setReview] = useState("");
  const [rewritten, setRewritten] = useState("");
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [fileName, setFileName] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) {
      setFile(f);
      setFileName(f.name);
      setResume("");
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) { setFile(f); setFileName(f.name); setResume(""); }
  };

const reviewResume = async () => {
    if (!file && !resume) return;
    setLoading(true);

    try {
      let resumeText = resume;

      if (file) {
        if (file.type === "application/pdf" || file.name.endsWith(".pdf")) {
          const formData = new FormData();
          formData.append("file", file);
          const res = await fetch("/api/reviewer", { method: "POST", body: formData });
          const data = await res.json();
          setReview(data.review);
          setRewritten(data.rewritten);
          setLoading(false);
          return;
        } else {
          resumeText = await file.text();
        }
      }

      const formData = new FormData();
      formData.append("text", resumeText);
      const res = await fetch("/api/reviewer", { method: "POST", body: formData });
      const data = await res.json();
      setReview(data.review);
      setRewritten(data.rewritten);
    } catch (err) {
      console.error(err);
    }

    setLoading(false);
  };

  const downloadPDF = async () => {
    setDownloading(true);
    const res = await fetch("/api/download-resume", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ resumeText: rewritten }),
    });
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "improved-resume.pdf";
    a.click();
    URL.revokeObjectURL(url);
    setDownloading(false);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
      <nav className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between shadow-sm">
        <a href="/" className="flex items-center gap-2">
          <div className="bg-blue-600 text-white font-bold text-lg px-3 py-1 rounded-md">RC</div>
          <span className="text-xl font-bold text-gray-800">Resume Coach</span>
        </a>
        <a href="/" className="text-sm text-gray-500 hover:text-gray-800 transition">← Back to Home</a>
      </nav>

      {!review ? (
        <>
          {/* Hero */}
          <div className="max-w-6xl mx-auto px-8 py-16 flex flex-col md:flex-row items-center gap-12">
            <div className="flex-1">
              <div className="inline-block bg-purple-100 text-purple-700 text-sm font-semibold px-4 py-1 rounded-full mb-6">
                🔍 AI Resume Reviewer
              </div>
              <h1 className="text-5xl font-extrabold text-gray-900 leading-tight mb-6">
                Get Expert<br />Feedback on Your <span className="text-purple-600">Resume</span>
              </h1>
              <p className="text-gray-500 text-lg mb-8 max-w-md">
                Drop your resume and get detailed AI feedback — plus a fully rewritten improved version you can download as PDF!
              </p>
              <div className="flex flex-wrap gap-3">
                {["ATS Optimization", "Grammar Fix", "Rewritten Resume", "PDF Download"].map((f) => (
                  <span key={f} className="bg-white border border-gray-200 text-gray-600 text-sm px-4 py-2 rounded-full shadow-sm">{f}</span>
                ))}
              </div>
            </div>

            <div className="flex-1 flex justify-center">
              <div className="bg-white rounded-2xl shadow-2xl p-6 w-80 border border-gray-100 relative">
                <div className="absolute -top-3 -right-3 bg-purple-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow">
                  🔍 + ✍️ Rewrite
                </div>
                <div className="border-2 border-dashed border-purple-200 rounded-xl p-6 flex flex-col items-center justify-center mb-4 bg-purple-50">
                  <span className="text-4xl mb-2">📄</span>
                  <span className="text-purple-600 text-sm font-semibold">Drop resume here</span>
                  <span className="text-gray-400 text-xs mt-1">PDF, DOCX, TXT</span>
                </div>
                <div className="bg-purple-50 border border-purple-200 rounded-xl p-3">
                  <p className="text-purple-700 text-xs font-bold mb-2">✍️ IMPROVED RESUME</p>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-green-500 text-xs">✓</span>
                    <div className="h-2 bg-green-200 rounded w-4/5"></div>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-green-500 text-xs">✓</span>
                    <div className="h-2 bg-green-200 rounded w-3/5"></div>
                  </div>
                  <div className="w-full bg-purple-600 text-white text-xs text-center py-1 rounded-lg">⬇ Download PDF</div>
                </div>
              </div>
            </div>
          </div>

          {/* Upload Card */}
          <div className="max-w-2xl mx-auto px-6 pb-20">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Upload Your Resume</h2>
              <p className="text-gray-400 text-sm mb-6">Drag & drop or click to browse — PDF, DOCX, TXT supported</p>

              <div
                onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`rounded-2xl p-12 flex flex-col items-center justify-center cursor-pointer transition-all ${
                  dragging
                    ? "border-4 border-dashed border-purple-500 bg-purple-50 scale-105"
                    : fileName
                    ? "border-4 border-dashed border-green-400 bg-green-50"
                    : "border-4 border-dashed border-gray-200 hover:border-purple-400 hover:bg-purple-50"
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.docx,.txt"
                  className="hidden"
                  onChange={handleFileInput}
                />
                {fileName ? (
                  <>
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-3xl mb-4">✅</div>
                    <p className="text-green-600 font-bold text-lg">{fileName}</p>
                    <p className="text-gray-400 text-sm mt-1">Ready to review!</p>
                    <button
                      onClick={(e) => { e.stopPropagation(); setFileName(""); setFile(null); }}
                      className="mt-3 text-xs text-red-400 hover:text-red-600 underline"
                    >
                      Remove file
                    </button>
                  </>
                ) : dragging ? (
                  <>
                    <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center text-3xl mb-4 animate-bounce">📄</div>
                    <p className="text-purple-600 font-bold text-lg">Drop it here!</p>
                  </>
                ) : (
                  <>
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-3xl mb-4">📂</div>
                    <p className="text-gray-600 font-semibold text-lg">Drag & drop your resume</p>
                    <p className="text-gray-400 text-sm mt-1">or click to browse files</p>
                    <p className="text-gray-300 text-xs mt-3">PDF • DOCX • TXT</p>
                  </>
                )}
              </div>

              <details className="mt-4 group">
                <summary className="text-gray-400 text-sm cursor-pointer hover:text-purple-600 transition list-none flex items-center gap-2">
                  <span className="group-open:hidden">▶ Or paste resume text instead</span>
                  <span className="hidden group-open:inline">▼ Or paste resume text instead</span>
                </summary>
                <textarea
                  rows={6}
                  placeholder="Paste your entire resume text here..."
                  className="w-full mt-3 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800 placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:bg-white transition"
                  value={resume}
                  onChange={(e) => { setResume(e.target.value); setFileName(""); setFile(null); }}
                />
              </details>

              <button
                onClick={reviewResume}
                disabled={loading || (!file && !resume)}
                className="w-full mt-6 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-200 disabled:text-gray-400 text-white py-4 rounded-full font-bold text-lg transition shadow-lg"
              >
                {loading ? "✨ Reviewing & Rewriting..." : "Review & Rewrite My Resume →"}
              </button>
            </div>
          </div>
        </>
      ) : (
        <div className="max-w-4xl mx-auto px-6 py-12 space-y-6">
          <div className="text-center mb-8">
            <span className="bg-purple-100 text-purple-700 text-sm font-semibold px-4 py-1 rounded-full">
              ✅ Review Complete — {fileName || "Pasted Resume"}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Review Feedback */}
            <div className="bg-white border-2 border-purple-200 rounded-2xl p-6 shadow-sm">
              <p className="text-purple-600 text-xs font-bold mb-4 uppercase tracking-wide">🔍 AI Feedback</p>
              <pre className="whitespace-pre-wrap text-gray-700 leading-relaxed text-sm bg-gray-50 rounded-xl p-4 max-h-96 overflow-y-auto">{review}</pre>
            </div>

            {/* Rewritten Resume */}
            <div className="bg-white border-2 border-green-200 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <p className="text-green-600 text-xs font-bold uppercase tracking-wide">✍️ Improved Resume</p>
                <button
                  onClick={downloadPDF}
                  disabled={downloading}
                  className="bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white text-xs font-bold px-4 py-2 rounded-full transition flex items-center gap-2 shadow-md"
                >
                  {downloading ? "⏳ Generating..." : "⬇ Download PDF"}
                </button>
              </div>
              <pre className="whitespace-pre-wrap text-gray-700 leading-relaxed text-sm bg-gray-50 rounded-xl p-4 max-h-96 overflow-y-auto">{rewritten}</pre>
            </div>
          </div>

          <div className="flex gap-4 justify-center mt-6">
            <button
              onClick={downloadPDF}
              disabled={downloading}
              className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 text-white font-bold px-8 py-4 rounded-full transition shadow-lg text-lg flex items-center gap-2"
            >
              {downloading ? "⏳ Generating PDF..." : "⬇ Download Improved Resume as PDF"}
            </button>
            <button
              onClick={() => { setReview(""); setRewritten(""); setResume(""); setFileName(""); setFile(null); }}
              className="border-2 border-purple-200 hover:bg-purple-50 text-purple-600 font-bold px-8 py-4 rounded-full transition"
            >
              Review Another
            </button>
          </div>
        </div>
      )}
    </main>
  );
}