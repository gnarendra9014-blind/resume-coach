"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";

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

export default function ResumeReviewer() {
  const [scrolled, setScrolled] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [pasteText, setPasteText] = useState("");
  const [showPaste, setShowPaste] = useState(false);
  const [loading, setLoading] = useState(false);
  const [review, setReview] = useState("");
  const [rewritten, setRewritten] = useState("");
  const [activeTab, setActiveTab] = useState<"review" | "rewritten">("review");
  const fileInputRef = useRef<HTMLInputElement>(null);
  useReveal();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) setFile(dropped);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) setFile(e.target.files[0]);
  };

  const handleSubmit = async () => {
    if (!file && !pasteText.trim()) return;
    setLoading(true);
    setReview("");
    setRewritten("");
    try {
      const formData = new FormData();
      if (file) formData.append("file", file);
      if (pasteText) formData.append("text", pasteText);
      const res = await fetch("/api/reviewer", { method: "POST", body: formData });
      const data = await res.json();
      setReview(data.review || "");
      setRewritten(data.rewritten || "");
      setActiveTab("review");
    } catch {
      setReview("Error reviewing resume. Please try again.");
    }
    setLoading(false);
  };

  const boxStyle = {
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 16,
    padding: "32px 36px",
    fontSize: 14,
    color: "rgba(255,255,255,0.75)",
    lineHeight: 1.85,
    whiteSpace: "pre-wrap" as const,
    maxHeight: "60vh",
    overflowY: "auto" as const,
  };

  return (
    <div style={{ background: "#000", color: "#fff", minHeight: "100vh", fontFamily: "var(--font-body)" }}>
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} } @keyframes spin { to{transform:rotate(360deg)} }`}</style>

      {/* Grid */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, backgroundImage: "linear-gradient(rgba(255,255,255,0.025) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.025) 1px,transparent 1px)", backgroundSize: "64px 64px" }} />

      {/* Orb */}
      <div style={{ position: "fixed", bottom: "20%", left: "5%", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,255,255,0.04) 0%, transparent 70%)", filter: "blur(40px)", pointerEvents: "none", zIndex: 0 }} />

      {/* NAV */}
      <nav className={`rc-nav ${scrolled ? "scrolled" : ""}`} style={{ zIndex: 100 }}>
        <Link href="/" className="rc-nav-logo">Resume Coach</Link>
        <div className="rc-nav-links">
          <Link href="/resume-builder" className="rc-nav-link">Resume Builder</Link>
          <Link href="/interview" className="rc-nav-link">Mock Interview</Link>
          <Link href="/resume-reviewer" className="rc-nav-link" style={{ color: "white" }}>Reviewer</Link>
          <Link href="/interview-tips" className="rc-nav-link">Tips</Link>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ position: "relative", zIndex: 1, padding: "160px 48px 80px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div className="section-label reveal" style={{ marginBottom: 24 }}>AI Resume Reviewer</div>
          <h1 className="letter-reveal" style={{ fontFamily: "var(--font-display)", fontSize: "clamp(48px,8vw,100px)", fontWeight: 900, letterSpacing: "-4px", lineHeight: 0.95, marginBottom: 32 }}>
            {splitLetters("Expert feedback,")}
            <br />
            {splitLetters("instantly.")}
          </h1>
          <p className="reveal" style={{ fontSize: 17, color: "rgba(255,255,255,0.4)", maxWidth: 520, lineHeight: 1.75 }}>
            Upload your resume and get detailed AI feedback — plus a fully rewritten improved version you can download as PDF.
          </p>

          {/* Feature pills */}
          <div className="reveal" style={{ display: "flex", gap: 10, marginTop: 32, flexWrap: "wrap" }}>
            {["ATS Optimization", "Grammar Fix", "Rewritten Resume", "PDF Download"].map(f => (
              <span key={f} style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.4)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 100, padding: "6px 16px", letterSpacing: "0.03em" }}>{f}</span>
            ))}
          </div>
        </div>
      </section>

      <div className="rc-divider" style={{ position: "relative", zIndex: 1 }} />

      {/* UPLOAD SECTION */}
      {!review && (
        <section style={{ position: "relative", zIndex: 1, padding: "64px 48px", maxWidth: 900, margin: "0 auto" }}>
          <div className="section-label reveal" style={{ marginBottom: 32 }}>Upload Resume</div>

          {/* Drop zone */}
          <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={e => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            className="reveal"
            style={{
              border: `2px dashed ${dragging ? "rgba(255,255,255,0.4)" : file ? "rgba(255,255,255,0.25)" : "rgba(255,255,255,0.1)"}`,
              borderRadius: 20, padding: "64px 40px", textAlign: "center", cursor: "pointer",
              background: dragging ? "rgba(255,255,255,0.03)" : "transparent",
              transition: "all 0.3s var(--ease)",
            }}
          >
            <input ref={fileInputRef} type="file" accept=".pdf,.docx,.txt" style={{ display: "none" }} onChange={handleFileChange} />

            {file ? (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
                <div style={{ width: 56, height: 56, borderRadius: 14, background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>📄</div>
                <div>
                  <div style={{ fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 700, color: "white" }}>{file.name}</div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", marginTop: 4 }}>{(file.size / 1024).toFixed(1)} KB · Click to change</div>
                </div>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
                <div style={{ width: 56, height: 56, borderRadius: 14, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>📁</div>
                <div>
                  <div style={{ fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 700, color: "rgba(255,255,255,0.7)" }}>Drop your resume here</div>
                  <div style={{ fontSize: 13, color: "rgba(255,255,255,0.3)", marginTop: 6 }}>or click to browse files</div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.2)", marginTop: 10, letterSpacing: "0.05em" }}>PDF • DOCX • TXT</div>
                </div>
              </div>
            )}
          </div>

          {/* Paste toggle */}
          <div style={{ marginTop: 20, display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.06)" }} />
            <button onClick={() => setShowPaste(p => !p)} style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", background: "transparent", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 100, padding: "6px 16px", cursor: "pointer", transition: "all 0.2s" }}>
              {showPaste ? "Hide text input" : "Or paste resume text instead"}
            </button>
            <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.06)" }} />
          </div>

          {showPaste && (
            <div style={{ marginTop: 16 }}>
              <textarea
                value={pasteText}
                onChange={e => setPasteText(e.target.value)}
                placeholder="Paste your resume text here..."
                rows={8}
                style={{ width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 16, padding: "20px 24px", color: "white", fontSize: 14, fontFamily: "var(--font-body)", outline: "none", resize: "vertical", lineHeight: 1.7 }}
                onFocus={e => (e.target as HTMLTextAreaElement).style.borderColor = "rgba(255,255,255,0.3)"}
                onBlur={e => (e.target as HTMLTextAreaElement).style.borderColor = "rgba(255,255,255,0.1)"}
              />
            </div>
          )}

          <div style={{ marginTop: 32, display: "flex", justifyContent: "flex-end" }}>
            <button
              onClick={handleSubmit}
              disabled={!file && !pasteText.trim()}
              className="mag-btn mag-btn-filled"
              style={{ opacity: !file && !pasteText.trim() ? 0.4 : 1 }}
            >
              <span>Review & Rewrite My Resume</span><span>→</span>
            </button>
          </div>
        </section>
      )}

      {/* RESULTS */}
      {review && (
        <section style={{ position: "relative", zIndex: 1, padding: "64px 48px", maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 40, flexWrap: "wrap", gap: 16 }}>
            <div className="section-label">Results</div>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => { setReview(""); setRewritten(""); setFile(null); setPasteText(""); }} className="mag-btn" style={{ padding: "10px 20px", fontSize: 13 }}>
                <span>← Review Another</span>
              </button>
              {rewritten && (
                <button
                  onClick={async () => {
                    const { jsPDF } = await import("jspdf");
                    const doc = new jsPDF();
                    const allLines = rewritten.split("\n");
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
                    const link = document.createElement("a");
                    link.href = blobUrl;
                    link.download = "improved-resume.pdf";
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
                  }}
                  className="mag-btn mag-btn-filled"
                  style={{ padding: "10px 20px", fontSize: 13 }}
                >
                  <span>Download PDF</span><span>↓</span>
                </button>
              )}
            </div>
          </div>

          {/* Tabs */}
          <div style={{ display: "flex", gap: 2, marginBottom: 24 }}>
            {[
              { id: "review" as const, label: "AI Feedback" },
              { id: "rewritten" as const, label: "Improved Resume" },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  padding: "12px 28px", border: "1px solid",
                  borderColor: activeTab === tab.id ? "rgba(255,255,255,0.4)" : "rgba(255,255,255,0.08)",
                  background: activeTab === tab.id ? "rgba(255,255,255,0.07)" : "transparent",
                  color: activeTab === tab.id ? "white" : "rgba(255,255,255,0.35)",
                  borderRadius: 100, cursor: "pointer", fontSize: 13,
                  fontFamily: "var(--font-display)", fontWeight: 700,
                  transition: "all 0.25s",
                }}
              >
                {tab.label}
                {tab.id === "rewritten" && <span style={{ marginLeft: 8, fontSize: 10, background: "rgba(52,211,153,0.2)", color: "#34d399", padding: "2px 8px", borderRadius: 100 }}>New</span>}
              </button>
            ))}
          </div>

          {/* Content */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 24, alignItems: "start" }}>
            <div style={boxStyle}>
              {activeTab === "review" ? review : rewritten}
            </div>

            {/* Sidebar */}
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ padding: "24px", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, background: "rgba(255,255,255,0.02)" }}>
                <div className="section-label" style={{ marginBottom: 16 }}>What was checked</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {["ATS Keyword Density", "Grammar & Spelling", "Action Verbs Usage", "Quantified Achievements", "Format & Structure", "Skills Alignment"].map(item => (
                    <div key={item} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 12, color: "rgba(255,255,255,0.45)" }}>
                      <span style={{ color: "#34d399", fontSize: 10 }}>✓</span>
                      {item}
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ padding: "24px", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, background: "rgba(255,255,255,0.02)" }}>
                <div className="section-label" style={{ marginBottom: 16 }}>Next Steps</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {[
                    ["Build Resume", "/resume-builder"],
                    ["Mock Interview", "/interview"],
                    ["Study Roadmap", "/interview-tips"],
                  ].map(([label, href]) => (
                    <Link key={label} href={href} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 10, textDecoration: "none", color: "rgba(255,255,255,0.45)", fontSize: 13, transition: "all 0.2s" }}
                      onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(255,255,255,0.2)"; (e.currentTarget as HTMLAnchorElement).style.color = "white"; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(255,255,255,0.06)"; (e.currentTarget as HTMLAnchorElement).style.color = "rgba(255,255,255,0.45)"; }}
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
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.9)", backdropFilter: "blur(10px)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 24 }}>
          <div style={{ position: "relative", width: 80, height: 80 }}>
            <div style={{ width: 80, height: 80, borderRadius: "50%", border: "2px solid rgba(255,255,255,0.1)", borderTopColor: "white", animation: "spin 1s linear infinite" }} />
          </div>
          <div style={{ fontFamily: "var(--font-display)", fontSize: "clamp(28px,4vw,48px)", fontWeight: 900, letterSpacing: "-2px", color: "white" }}>
            Reviewing...
          </div>
          <div style={{ fontSize: 14, color: "rgba(255,255,255,0.3)" }}>Analyzing your resume with AI</div>
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
