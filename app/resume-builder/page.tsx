"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import MagneticButton from "../components/MagneticButton";

const LANGUAGES = ["English", "Hindi", "French", "German", "Spanish"];
const TEMPLATES = ["Modern", "Classic", "Minimal", "Creative"];

function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll(".reveal, .letter-reveal");
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          setTimeout(() => entry.target.classList.add("visible"), i * 60);
        }
      });
    }, { threshold: 0.1 });
    els.forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);
}

function splitLetters(text: string) {
  return text.split("").map((char, i) => (
    <span key={i} style={{ transitionDelay: `${i * 0.03}s` }}>
      {char === " " ? "\u00A0" : char}
    </span>
  ));
}

export default function ResumeBuilder() {
  const [scrolled, setScrolled] = useState(false);
  const [step, setStep] = useState(1);
  const [language, setLanguage] = useState("English");
  const [template, setTemplate] = useState("Modern");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");
  const [atsScore, setAtsScore] = useState<number | null>(null);
  const [form, setForm] = useState({
    name: "", email: "", phone: "", location: "",
    role: "", experience: "", skills: "",
    education: "", projects: "", achievements: "",
    jobDescription: "",
  });
  const [parsing, setParsing] = useState(false);
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState<string | null>(null);
  
  // Cover Letter States
  const [coverLetter, setCoverLetter] = useState<string | null>(null);
  const [generatingCL, setGeneratingCL] = useState(false);
  const [clPreviewUrl, setClPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  useReveal();

  useEffect(() => {
    if (!result) return;
    const renderPDF = async () => {
      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF();
      const allLines = result.split("\n");
      let y = 20;
      const ph = doc.internal.pageSize.getHeight();
      allLines.forEach((line: string) => {
        const t = line.trim();
        if (!t) { y += 4; return; }
        const isHead = t === t.toUpperCase() && t.length > 2 && t.length < 50;
        if (isHead) {
          y += 4;
          doc.setFont("helvetica", "bold").setFontSize(13);
          doc.text(t, 15, y);
          y += 2;
          doc.setDrawColor(180);
          doc.line(15, y, 195, y);
          y += 6;
        } else {
          doc.setFont("helvetica", "normal").setFontSize(10);
          const wrapped = doc.splitTextToSize(t, 175);
          wrapped.forEach((wl: string) => {
            if (y > ph - 20) { doc.addPage(); y = 20; }
            doc.text(wl, 18, y);
            y += 5;
          });
        }
        if (y > ph - 20) { doc.addPage(); y = 20; }
      });
      const pdfBlob = doc.output("blob");
      const blobUrl = URL.createObjectURL(pdfBlob);
      setPdfPreviewUrl(blobUrl);
    };
    renderPDF();
  }, [result]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleGenerate = async () => {
    setLoading(true);
    setResult("");
    setAtsScore(null);
    setPdfPreviewUrl(null);
    setStep(3);
    
    try {
      const res = await fetch("/api/resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, language, template }),
      });
      const data = await res.json();
      const resumeText = data.result || data.resume || "";
      setResult(resumeText);
      const scoreRes = await fetch("/api/ats-score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resume: resumeText, role: form.role }),
      });
      const scoreData = await scoreRes.json();
      setAtsScore(scoreData.score ?? null);
    } catch {
      setResult("Error generating resume. Please try again.");
    }
    setLoading(false);
  };

  const handleParse = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setParsing(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/parse-resume", { method: "POST", body: formData });
      const data = await res.json();
      if (data && !data.error) {
        // Only override fields the AI actually found, to not destroy existing manual input
        const updated = { ...form };
        Object.keys(data).forEach(k => {
          if (data[k]) updated[k as keyof typeof form] = data[k];
        });
        setForm(updated);
      }
    } catch {
      console.error("Failed to parse resume");
    }
    setParsing(false);
  };

  const inputStyle = {
    width: "100%", background: "rgba(255,255,255,0.015)",
    border: "1px solid rgba(255,255,255,0.12)", borderRadius: 12,
    padding: "16px 20px", color: "white", fontSize: 14,
    fontFamily: "var(--font-body)", outline: "none",
    boxShadow: "inset 0 2px 4px rgba(0,0,0,0.3)",
    transition: "border-color 0.3s, box-shadow 0.3s, background 0.3s",
  };

  const labelStyle = {
    fontSize: 11, fontWeight: 800, letterSpacing: "0.15em",
    textTransform: "uppercase" as const, color: "rgba(255,255,255,0.45)",
    marginBottom: 10, display: "block",
  };

  useEffect(() => {
    if (!coverLetter) return;
    const renderCLPDF = async () => {
      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF();
      let y = 30;
      doc.setFont("helvetica", "normal").setFontSize(11);
      const lines = doc.splitTextToSize(coverLetter, 170);
      lines.forEach((l: string) => {
        if (y > 270) { doc.addPage(); y = 20; }
        doc.text(l, 20, y);
        y += 6;
      });
      const blob = doc.output("blob");
      setClPreviewUrl(URL.createObjectURL(blob));
    };
    renderCLPDF();
  }, [coverLetter]);

  const handleGenerateCoverLetter = async () => {
    if (!result) return;
    setGeneratingCL(true);
    try {
      const res = await fetch("/api/cover-letter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resume: result, role: form.role, jobDescription: form.jobDescription }),
      });
      const data = await res.json();
      setCoverLetter(data.coverLetter);
    } catch {
      alert("Failed to generate Cover Letter.");
    }
    setGeneratingCL(false);
  };

  const checklist = [
    { label: "Contact Information", passed: form.email.includes("@") && form.phone.length > 5 },
    { label: "Skills added (3+)", passed: form.skills.split(",").filter(s => s.trim().length > 0).length >= 3 },
    { label: "Experience or Projects details", passed: form.experience.length > 5 || form.projects.length > 20 },
    { label: "Action Verbs used", passed: /\b(managed|led|developed|designed|built|optimized|spearheaded|created|increased|improved|resolved|architected)\b/i.test(form.projects + " " + form.achievements + " " + form.experience) },
    { label: "Quantified Achievements (Numbers/%)", passed: /\d+/.test(form.achievements + " " + form.projects + " " + form.experience) },
  ];
  const checklistScore = Math.round((checklist.filter(c => c.passed).length / checklist.length) * 100);

  return (
    <div style={{ color: "#fff", minHeight: "100vh", fontFamily: "var(--font-body)", position: "relative" }}>

      {/* Grid */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, backgroundImage: "linear-gradient(rgba(255,255,255,0.025) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.025) 1px,transparent 1px)", backgroundSize: "64px 64px" }} />

      {/* Orb */}
      <div style={{ position: "fixed", top: "20%", right: "10%", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,255,255,0.04) 0%, transparent 70%)", filter: "blur(40px)", pointerEvents: "none", zIndex: 0 }} />

      {/* NAV */}
      <nav className={`rc-nav ${scrolled ? "scrolled" : ""}`} style={{ zIndex: 100 }}>
        <Link href="/" className="rc-nav-logo">Resume Coach</Link>
        <div className="rc-nav-links">
          <Link href="/" className="rc-nav-link" style={{ marginRight: 16 }}>← Home</Link>
          <Link href="/resume-builder" className="rc-nav-link" style={{ color: "white" }}>Resume Builder</Link>
          <Link href="/interview" className="rc-nav-link">Mock Interview</Link>
          <Link href="/resume-reviewer" className="rc-nav-link">Reviewer</Link>
          <Link href="/interview-tips" className="rc-nav-link">Tips</Link>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ position: "relative", zIndex: 1, padding: "160px 48px 80px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div className="section-label reveal" style={{ marginBottom: 24 }}>AI Resume Builder</div>
          <h1 className="letter-reveal text-gradient-animated" style={{ fontFamily: "var(--font-display)", fontSize: "clamp(48px,8vw,100px)", fontWeight: 900, letterSpacing: "-4px", lineHeight: 0.95, marginBottom: 32 }}>
            {splitLetters("Build your")}
            <br />
            {splitLetters("resume.")}
          </h1>
          <p className="reveal" style={{ fontSize: 17, color: "rgba(255,255,255,0.4)", maxWidth: 480, lineHeight: 1.75 }}>
            ATS-optimized resumes generated in seconds. Pick a template, fill in your details, get hired.
          </p>
        </div>
      </section>

      <div className="rc-divider" style={{ position: "relative", zIndex: 1 }} />

      {/* STEP INDICATOR */}
      <div style={{ position: "relative", zIndex: 1, padding: "32px 48px", maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ display: "flex", gap: 0 }}>
          {["Preferences", "Your Details", "Your Resume"].map((s, i) => (
            <div key={s} style={{ display: "flex", alignItems: "center", gap: 0 }}>
              <div style={{
                display: "flex", alignItems: "center", gap: 12, padding: "12px 24px",
                borderRadius: 100,
                background: step === i + 1 ? "white" : "transparent",
                border: "1px solid",
                borderColor: step === i + 1 ? "white" : step > i + 1 ? "rgba(255,255,255,0.4)" : "rgba(255,255,255,0.1)",
                transition: "all 0.4s var(--ease)",
              }}>
                <span style={{ fontFamily: "var(--font-display)", fontSize: 11, fontWeight: 900, color: step === i + 1 ? "black" : step > i + 1 ? "rgba(255,255,255,0.6)" : "rgba(255,255,255,0.2)", letterSpacing: "0.05em" }}>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span style={{ fontSize: 13, fontWeight: 600, color: step === i + 1 ? "black" : step > i + 1 ? "rgba(255,255,255,0.5)" : "rgba(255,255,255,0.2)" }}>{s}</span>
                {step > i + 1 && <span style={{ color: "#34d399", fontSize: 12 }}>✓</span>}
              </div>
              {i < 2 && <div style={{ width: 32, height: 1, background: "rgba(255,255,255,0.1)" }} />}
            </div>
          ))}
        </div>
      </div>

      <div className="rc-divider" style={{ position: "relative", zIndex: 1 }} />

      {/* STEP 1 — Preferences */}
      {step === 1 && (
        <section style={{ position: "relative", zIndex: 1, padding: "64px 48px", maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 64 }}>

            {/* Language */}
            <div className="reveal">
              <div className="section-label" style={{ marginBottom: 32 }}>Language</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {LANGUAGES.map((l) => (
                  <div key={l}
                    onClick={() => setLanguage(l)}
                    style={{
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                      padding: "20px 24px", border: "1px solid",
                      borderColor: language === l ? "rgba(255,255,255,0.4)" : "rgba(255,255,255,0.06)",
                      background: language === l ? "rgba(255,255,255,0.05)" : "transparent",
                      borderRadius: 12, cursor: "pointer", transition: "all 0.25s",
                    }}
                    onMouseEnter={e => { if (language !== l) (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(255,255,255,0.15)"; }}
                    onMouseLeave={e => { if (language !== l) (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(255,255,255,0.06)"; }}
                  >
                    <span style={{ fontFamily: "var(--font-display)", fontSize: 15, fontWeight: 600, color: language === l ? "white" : "rgba(255,255,255,0.4)" }}>{l}</span>
                    {language === l && <span style={{ width: 8, height: 8, borderRadius: "50%", background: "white", display: "block" }} />}
                  </div>
                ))}
              </div>
            </div>

            {/* Template */}
            <div className="reveal" style={{ transitionDelay: "0.1s" }}>
              <div className="section-label" style={{ marginBottom: 32 }}>Template</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                {TEMPLATES.map((t) => (
                  <div key={t}
                    onClick={() => setTemplate(t)}
                    style={{
                      padding: "28px 24px", border: "1px solid",
                      borderColor: template === t ? "rgba(255,255,255,0.5)" : "rgba(255,255,255,0.06)",
                      background: template === t ? "rgba(255,255,255,0.05)" : "transparent",
                      borderRadius: 16, cursor: "pointer", transition: "all 0.25s", position: "relative",
                    }}
                  >
                    {/* Mini resume preview lines */}
                    <div style={{ marginBottom: 16 }}>
                      {[80, 55, 40, 65, 45].map((w, i) => (
                        <div key={i} style={{ height: i === 0 ? 3 : 1.5, width: `${w}%`, background: template === t ? "rgba(255,255,255,0.5)" : "rgba(255,255,255,0.15)", borderRadius: 2, marginBottom: i === 0 ? 8 : 5 }} />
                      ))}
                    </div>
                    <span style={{ fontFamily: "var(--font-display)", fontSize: 13, fontWeight: 700, color: template === t ? "white" : "rgba(255,255,255,0.3)" }}>{t}</span>
                    {template === t && (
                      <div style={{ position: "absolute", top: 12, right: 12, width: 20, height: 20, borderRadius: "50%", background: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: "black", fontWeight: 900 }}>✓</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div style={{ marginTop: 64, display: "flex", justifyContent: "flex-end" }}>
            <MagneticButton><button onClick={() => setStep(2)} className="mag-btn mag-btn-filled">
              <span>Continue</span><span>→</span>
            </button></MagneticButton>
          </div>
        </section>
      )}

      {/* STEP 2 — Details */}
      {step === 2 && (
        <section style={{ position: "relative", zIndex: 1, padding: "64px 48px", maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 32, alignItems: "start" }}>
            
            {/* LEFT COLUMN - FORM */}
            <div>
              {/* UPLOAD AUTO-FILL STRIP */}
          <div className="reveal glass-panel" style={{ padding: "24px 32px", borderRadius: 16, marginBottom: 40, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ fontSize: 28, filter: "drop-shadow(0 0 10px rgba(255,255,255,0.2))" }}>✨</div>
              <div>
                <div style={{ fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 700, color: "white" }}>Auto-Fill Details</div>
                <div style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginTop: 4 }}>Upload an existing resume to automatically extract your info.</div>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <input ref={fileInputRef} type="file" accept=".pdf,.txt" style={{ display: "none" }} onChange={handleParse} />
              <button 
                onClick={() => fileInputRef.current?.click()} 
                disabled={parsing} 
                className="mag-btn" 
                style={{ fontSize: 13, padding: "10px 24px", opacity: parsing ? 0.6 : 1, cursor: parsing ? "not-allowed" : "pointer" }}
              >
                {parsing ? <span style={{ animation: "pulse 1s infinite" }}>Extracting...</span> : <span>Upload Resume PDF ↗</span>}
              </button>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
            {[
              { key: "name", label: "Full Name", placeholder: "John Doe" },
              { key: "email", label: "Email", placeholder: "john@email.com" },
              { key: "phone", label: "Phone", placeholder: "+91 98765 43210" },
              { key: "location", label: "Location", placeholder: "Bangalore, India" },
              { key: "role", label: "Target Role", placeholder: "Software Engineer" },
              { key: "experience", label: "Years of Experience", placeholder: "3 years" },
            ].map(({ key, label, placeholder }) => (
              <div key={key}>
                <label style={labelStyle}>{label}</label>
                <input
                  value={form[key as keyof typeof form]}
                  onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                  placeholder={placeholder}
                  style={inputStyle}
                  onFocus={e => (e.target as HTMLInputElement).style.borderColor = "rgba(255,255,255,0.4)"}
                  onBlur={e => (e.target as HTMLInputElement).style.borderColor = "rgba(255,255,255,0.1)"}
                />
              </div>
            ))}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 24, marginTop: 24 }}>
            {[
              { key: "skills", label: "Skills", placeholder: "React, Node.js, Python, AWS, Docker..." },
              { key: "education", label: "Education", placeholder: "B.Tech Computer Science, VTU, 2022 — CGPA 8.5" },
              { key: "projects", label: "Projects", placeholder: "E-commerce platform with React & Node, deployed on AWS..." },
              { key: "achievements", label: "Achievements", placeholder: "Won national hackathon, Published research paper..." },
            ].map(({ key, label, placeholder }) => (
              <div key={key}>
                <label style={labelStyle}>{label}</label>
                <textarea
                  value={form[key as keyof typeof form]}
                  onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                  placeholder={placeholder}
                  rows={3}
                  style={{ ...inputStyle, resize: "vertical" }}
                  onFocus={e => (e.target as HTMLTextAreaElement).style.borderColor = "rgba(255,255,255,0.4)"}
                  onBlur={e => (e.target as HTMLTextAreaElement).style.borderColor = "rgba(255,255,255,0.1)"}
                />
              </div>
            ))}
          </div>

              <div style={{ marginTop: 48, display: "flex", justifyContent: "space-between" }}>
                <MagneticButton><button onClick={() => setStep(1)} className="mag-btn">
                  <span>←</span><span>Back</span>
                </button></MagneticButton>
                <MagneticButton><button onClick={handleGenerate} disabled={loading} className="mag-btn mag-btn-filled">
                  <span>{loading ? "Generating..." : "Generate Resume"}</span>
                  <span>{loading ? "⏳" : "→"}</span>
                </button></MagneticButton>
              </div>
            </div>

            {/* RIGHT COLUMN - ATS CHECKLIST */}
            <div style={{ position: "sticky", top: 120 }}>
              <div className="glass-panel text-gradient-animated" style={{ padding: "2px", borderRadius: 16, marginBottom: 16 }}>
                <div style={{ background: "rgba(0,0,0,0.8)", backdropFilter: "blur(10px)", padding: "24px", borderRadius: 15 }}>
                  <div className="section-label" style={{ marginBottom: 16 }}>Live ATS Check</div>
                  
                  {/* Score Dial */}
                  <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
                    <div style={{ width: 64, height: 64, borderRadius: "50%", background: "rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "center", border: `2px solid ${checklistScore === 100 ? "#34d399" : checklistScore > 50 ? "#fbbf24" : "rgba(255,255,255,0.1)"}`, transition: "border-color 0.5s var(--ease)" }}>
                      <span style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 900, color: checklistScore === 100 ? "#34d399" : "white" }}>{checklistScore}%</span>
                    </div>
                    <div style={{ fontSize: 13, color: "rgba(255,255,255,0.4)" }}>
                      {checklistScore === 100 ? "Looking great! Ready to generate." : "Add more details to boost your score."}
                    </div>
                  </div>

                  {/* Checklist Items */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {checklist.map((item, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 12, transition: "all 0.3s" }}>
                        <div style={{ 
                          width: 18, height: 18, borderRadius: "50%", 
                          background: item.passed ? "#34d399" : "rgba(255,255,255,0.05)", 
                          display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                          transition: "background 0.3s",
                          marginTop: 2
                        }}>
                          {item.passed && <span style={{ color: "black", fontSize: 10, fontWeight: 900 }}>✓</span>}
                        </div>
                        <span style={{ fontSize: 13, color: item.passed ? "rgba(255,255,255,0.8)" : "rgba(255,255,255,0.3)", transition: "color 0.3s", lineHeight: 1.4 }}>
                          {item.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

          </div>
        </section>
      )}

      {/* STEP 3 — Result */}
      {step === 3 && (
        <section style={{ position: "relative", zIndex: 1, padding: "64px 48px", maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 32, alignItems: "start" }}>

            {/* Resume output */}
            <div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
                <div className="section-label">Your Resume</div>
                <div style={{ display: "flex", gap: 12 }}>
                  <MagneticButton><button onClick={() => setStep(2)} className="mag-btn" style={{ padding: "10px 20px", fontSize: 13 }}>
                    <span>Edit</span>
                  </button></MagneticButton>
                  <MagneticButton><button
                    onClick={() => {
                      if (!pdfPreviewUrl) return;
                      const pdfName = `${form.name || "resume"}.pdf`;
                      const link = document.createElement("a");
                      link.href = pdfPreviewUrl;
                      link.download = pdfName;
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                    }}
                    className="mag-btn mag-btn-filled" style={{ padding: "10px 20px", fontSize: 13 }}>
                    <span>Download PDF</span><span>↓</span>
                  </button></MagneticButton>
                  
                  {/* GENERATE DOCX STUB (For future actual docx gen) */}
                  <MagneticButton><button
                    onClick={() => alert("We will implement genuine .docx generation later via docx npm!")}
                    className="mag-btn" style={{ padding: "10px 20px", fontSize: 13, borderColor: "rgba(255,255,255,0.2)" }}>
                    <span>Word (.docx)</span>
                  </button></MagneticButton>
                </div>
              </div>
              <div className="glass-panel" style={{
                borderRadius: 16, padding: "12px",
                height: "75vh", overflow: "hidden",
                position: "relative"
              }}>
                {pdfPreviewUrl ? (
                  <iframe 
                    src={`${pdfPreviewUrl}#toolbar=0&navpanes=0`} 
                    style={{ width: "100%", height: "100%", border: "none", borderRadius: 8, background: "white" }}
                  />
                ) : (
                  <div style={{ padding: "40px", height: "100%", background: "rgba(255,255,255,0.02)" }}>
                    <div style={{ height: 40, width: "40%", background: "rgba(255,255,255,0.1)", borderRadius: 8, animation: "pulse 1.5s infinite", marginBottom: 20 }} />
                    <div style={{ height: 2, width: "100%", background: "rgba(255,255,255,0.05)", marginBottom: 40 }} />
                    {[1, 2, 3].map(i => (
                      <div key={i} style={{ marginBottom: 40 }}>
                        <div style={{ height: 20, width: "25%", background: "rgba(255,255,255,0.1)", borderRadius: 4, animation: "pulse 1.5s infinite", animationDelay: `${i * 0.2}s`, marginBottom: 16 }} />
                        <div style={{ height: 12, width: "90%", background: "rgba(255,255,255,0.05)", borderRadius: 4, animation: "pulse 1.5s infinite", animationDelay: `${i * 0.2 + 0.1}s`, marginBottom: 12 }} />
                        <div style={{ height: 12, width: "70%", background: "rgba(255,255,255,0.05)", borderRadius: 4, animation: "pulse 1.5s infinite", animationDelay: `${i * 0.2 + 0.2}s`, marginBottom: 12 }} />
                        <div style={{ height: 12, width: "85%", background: "rgba(255,255,255,0.05)", borderRadius: 4, animation: "pulse 1.5s infinite", animationDelay: `${i * 0.2 + 0.3}s` }} />
                      </div>
                    ))}
                    <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", textAlign: "center", backdropFilter: "blur(10px)", padding: "20px 40px", borderRadius: 100, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(0,0,0,0.5)" }}>
                       <span className="text-gradient-animated" style={{ fontWeight: 800 }}>Generating AI Resume...</span>
                    </div>
                  </div>
                )}
              </div>
              
              {/* COVER LETTER SECTION */}
              {coverLetter && clPreviewUrl && (
                <div style={{ marginTop: 40 }}>
                  <div className="section-label" style={{ marginBottom: 24 }}>Your 1-Click Cover Letter</div>
                  <div className="glass-panel" style={{
                    borderRadius: 16, padding: "12px",
                    height: "75vh", overflow: "hidden",
                    position: "relative"
                  }}>
                    <iframe 
                      src={`${clPreviewUrl}#toolbar=0&navpanes=0`} 
                      style={{ width: "100%", height: "100%", border: "none", borderRadius: 8, background: "white" }}
                    />
                  </div>
                  <div style={{ marginTop: 24, display: "flex", justifyContent: "flex-end" }}>
                    <MagneticButton><button
                      onClick={() => {
                        const clName = `CoverLetter_${form.name || "Role"}.pdf`;
                        const link = document.createElement("a");
                        link.href = clPreviewUrl;
                        link.download = clName;
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                      }}
                      className="mag-btn mag-btn-filled" style={{ padding: "10px 20px" }}>
                      <span>Download Cover Letter (PDF)</span><span>↓</span>
                    </button></MagneticButton>
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

              {/* ATS Score */}
              {loading ? (
                <div className="glass-panel" style={{ padding: "32px", borderRadius: 16 }}>
                  <div style={{ height: 15, width: 80, background: "rgba(255,255,255,0.1)", borderRadius: 4, animation: "pulse 1.5s infinite", marginBottom: 24 }} />
                  <div style={{ height: 60, width: 100, background: "rgba(255,255,255,0.05)", borderRadius: 8, animation: "pulse 1.5s infinite 0.2s", marginBottom: 24 }} />
                  <div style={{ height: 4, width: "100%", background: "rgba(255,255,255,0.05)", borderRadius: 2, animation: "pulse 1.5s infinite 0.4s" }} />
                </div>
              ) : atsScore !== null ? (
                <div className="glass-panel" style={{ padding: "32px", borderRadius: 16 }}>
                  <div className="section-label" style={{ marginBottom: 20 }}>ATS Score</div>
                  <div style={{ fontFamily: "var(--font-display)", fontSize: 64, fontWeight: 900, letterSpacing: "-3px", color: atsScore >= 80 ? "#34d399" : atsScore >= 60 ? "#fbbf24" : "#f87171", lineHeight: 1 }}>
                    {atsScore}
                  </div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", marginTop: 8 }}>out of 100</div>
                  <div style={{ marginTop: 20, height: 4, background: "rgba(255,255,255,0.08)", borderRadius: 2 }}>
                    <div style={{ height: "100%", width: `${atsScore}%`, background: atsScore >= 80 ? "#34d399" : atsScore >= 60 ? "#fbbf24" : "#f87171", borderRadius: 2, transition: "width 1s var(--ease)" }} />
                  </div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", marginTop: 12, lineHeight: 1.6 }}>
                    {atsScore >= 80 ? "✓ Excellent — highly likely to pass ATS filters" : atsScore >= 60 ? "⚠ Good — minor improvements recommended" : "✗ Needs work — improve keyword density"}
                  </div>
                </div>
              ) : null}

              {/* Info */}
              <div className="glass-panel" style={{ padding: "24px", borderRadius: 16 }}>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", lineHeight: 1.7 }}>
                  <div style={{ marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" }}>Template</span>
                    <span style={{ marginLeft: "auto", color: "white", fontWeight: 600 }}>{template}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" }}>Language</span>
                    <span style={{ marginLeft: "auto", color: "white", fontWeight: 600 }}>{language}</span>
                  </div>
                </div>
              </div>

              {/* Next steps */}
              <div className="glass-panel" style={{ padding: "24px", borderRadius: 16 }}>
                <div className="section-label" style={{ marginBottom: 16 }}>AI Suite</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {!coverLetter && (
                    <MagneticButton><button onClick={handleGenerateCoverLetter} disabled={generatingCL} style={{
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                      padding: "16px 16px", background: "rgba(52, 211, 153, 0.05)", border: "1px solid rgba(52, 211, 153, 0.2)",
                      borderRadius: 10, color: "white", fontSize: 13, width: "100%", cursor: "pointer", transition: "all 0.2s"
                    }}>
                      <span>{generatingCL ? "Generating Letter..." : "Generate Cover Letter"}</span>
                      {generatingCL ? <span style={{ animation: "pulse 1s infinite" }}>⏳</span> : <span>→</span>}
                    </button></MagneticButton>
                  )}
                  {[
                    ["Practice Interview", "/interview"],
                    ["LinkedIn Optimizer", "#"],
                  ].map(([label, href]) => (
                    <Link key={label} href={href} style={{
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                      padding: "12px 16px", border: "1px solid rgba(255,255,255,0.06)",
                      borderRadius: 10, textDecoration: "none", color: "rgba(255,255,255,0.5)",
                      fontSize: 13, transition: "all 0.2s",
                    }}
                      onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(255,255,255,0.2)"; (e.currentTarget as HTMLAnchorElement).style.color = "white"; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(255,255,255,0.06)"; (e.currentTarget as HTMLAnchorElement).style.color = "rgba(255,255,255,0.5)"; }}
                    >
                      <span>{label}</span><span>→</span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

    </div>
  );
}