"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";

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
  });
  useReveal();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleGenerate = async () => {
    setLoading(true);
    setResult("");
    setAtsScore(null);
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
      setStep(3);
    } catch {
      setResult("Error generating resume. Please try again.");
    }
    setLoading(false);
  };

  const inputStyle = {
    width: "100%", background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12,
    padding: "14px 18px", color: "white", fontSize: 14,
    fontFamily: "var(--font-body)", outline: "none",
    transition: "border-color 0.2s",
  };

  const labelStyle = {
    fontSize: 11, fontWeight: 700, letterSpacing: "0.12em",
    textTransform: "uppercase" as const, color: "rgba(255,255,255,0.35)",
    marginBottom: 8, display: "block",
  };

  return (
    <div style={{ background: "#000", color: "#fff", minHeight: "100vh", fontFamily: "var(--font-body)" }}>

      {/* Grid */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, backgroundImage: "linear-gradient(rgba(255,255,255,0.025) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.025) 1px,transparent 1px)", backgroundSize: "64px 64px" }} />

      {/* Orb */}
      <div style={{ position: "fixed", top: "20%", right: "10%", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,255,255,0.04) 0%, transparent 70%)", filter: "blur(40px)", pointerEvents: "none", zIndex: 0 }} />

      {/* NAV */}
      <nav className={`rc-nav ${scrolled ? "scrolled" : ""}`} style={{ zIndex: 100 }}>
        <Link href="/" className="rc-nav-logo">Resume Coach</Link>
        <div className="rc-nav-links">
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
          <h1 className="letter-reveal" style={{ fontFamily: "var(--font-display)", fontSize: "clamp(48px,8vw,100px)", fontWeight: 900, letterSpacing: "-4px", lineHeight: 0.95, marginBottom: 32 }}>
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
            <button onClick={() => setStep(2)} className="mag-btn mag-btn-filled">
              <span>Continue</span><span>→</span>
            </button>
          </div>
        </section>
      )}

      {/* STEP 2 — Details */}
      {step === 2 && (
        <section style={{ position: "relative", zIndex: 1, padding: "64px 48px", maxWidth: 900, margin: "0 auto" }}>
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
            <button onClick={() => setStep(1)} className="mag-btn">
              <span>←</span><span>Back</span>
            </button>
            <button onClick={handleGenerate} disabled={loading} className="mag-btn mag-btn-filled">
              <span>{loading ? "Generating..." : "Generate Resume"}</span>
              <span>{loading ? "⏳" : "→"}</span>
            </button>
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
                  <button onClick={() => setStep(2)} className="mag-btn" style={{ padding: "10px 20px", fontSize: 13 }}>
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={async () => {
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
                      const pdfName = `${form.name || "resume"}.pdf`;
                      const pdfBlob = doc.output("blob");
                      const blobUrl = URL.createObjectURL(pdfBlob);
                      const link = document.createElement("a");
                      link.href = blobUrl;
                      link.download = pdfName;
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                      setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
                    }}
                    className="mag-btn mag-btn-filled" style={{ padding: "10px 20px", fontSize: 13 }}>
                    <span>Download PDF</span><span>↓</span>
                  </button>
                </div>
              </div>
              <div style={{
                background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 16, padding: "40px 48px",
                fontFamily: "var(--font-body)", fontSize: 14, lineHeight: 1.8,
                color: "rgba(255,255,255,0.8)", whiteSpace: "pre-wrap",
                maxHeight: "70vh", overflowY: "auto",
              }}>
                {result}
              </div>
            </div>

            {/* Sidebar */}
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

              {/* ATS Score */}
              {atsScore !== null && (
                <div style={{ padding: "32px", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, background: "rgba(255,255,255,0.02)" }}>
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
              )}

              {/* Info */}
              <div style={{ padding: "24px", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, background: "rgba(255,255,255,0.02)" }}>
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
              <div style={{ padding: "24px", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, background: "rgba(255,255,255,0.02)" }}>
                <div className="section-label" style={{ marginBottom: 16 }}>Next Steps</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {[
                    ["Review Resume", "/resume-reviewer"],
                    ["Practice Interview", "/interview"],
                    ["Study Roadmap", "/interview-tips"],
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

      {/* Loading overlay */}
      {loading && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", backdropFilter: "blur(10px)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 24 }}>
          <div style={{ fontFamily: "var(--font-display)", fontSize: "clamp(32px,5vw,60px)", fontWeight: 900, letterSpacing: "-2px", color: "white", animation: "pulse 1.5s infinite" }}>
            Building...
          </div>
          <div style={{ fontSize: 14, color: "rgba(255,255,255,0.3)" }}>Crafting your perfect resume</div>
          <div style={{ display: "flex", gap: 8 }}>
            {[0,1,2].map(i => (
              <div key={i} style={{ width: 8, height: 8, borderRadius: "50%", background: "white", animation: `pulse 1s ${i * 0.2}s infinite` }} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}