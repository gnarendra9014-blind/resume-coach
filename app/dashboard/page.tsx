"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useDashboardStore } from "../store/dashboardStore";

export default function Dashboard() {
  const { resumes, updateStatus, deleteResume } = useDashboardStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const columns = [
    { title: "Draft", value: "draft", color: "#9ca3af" },
    { title: "Applied", value: "applied", color: "#60a5fa" },
    { title: "Interviewing", value: "interviewing", color: "#fbbf24" },
    { title: "Offer", value: "offer", color: "#34d399" },
    { title: "Rejected", value: "rejected", color: "#f87171" },
  ] as const;

  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData("resumeId", id);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, status: any) => {
    const id = e.dataTransfer.getData("resumeId");
    if (id) updateStatus(id, status);
  };

  if (!mounted) return <div style={{ minHeight: "100vh" }} />;

  return (
    <div style={{ color: "#fff", minHeight: "100vh", fontFamily: "var(--font-body)", position: "relative" }}>
      {/* Grid */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, backgroundImage: "linear-gradient(rgba(255,255,255,0.025) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.025) 1px,transparent 1px)", backgroundSize: "64px 64px" }} />

      {/* NAV */}
      <nav className="rc-nav" style={{ zIndex: 100, position: "relative" }}>
        <Link href="/" className="rc-nav-logo">Resume Coach</Link>
        <div className="rc-nav-links">
          <Link href="/" className="rc-nav-link" style={{ marginRight: 16 }}>← Home</Link>
          <Link href="/resume-builder" className="rc-nav-link">Builder</Link>
        </div>
      </nav>

      <div style={{ position: "relative", zIndex: 1, padding: "48px", maxWidth: 1600, margin: "0 auto" }}>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: 48, fontWeight: 900, marginBottom: 16, letterSpacing: "-1.5px" }}>Job Hunt Dashboard</h1>
        <p style={{ color: "rgba(255,255,255,0.5)", marginBottom: 48 }}>Drag and drop your generated resumes to track your application lifecycle.</p>

        <div style={{ display: "flex", gap: 24, overflowX: "auto", paddingBottom: 32 }}>
          {columns.map((col) => (
            <div
              key={col.value}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, col.value)}
              style={{
                flex: "0 0 300px",
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,255,255,0.05)",
                borderRadius: 16,
                padding: 16,
                minHeight: "60vh",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: col.color }} />
                <h3 style={{ fontWeight: 600, color: "white" }}>{col.title}</h3>
                <span style={{ marginLeft: "auto", background: "rgba(255,255,255,0.1)", padding: "2px 8px", borderRadius: 100, fontSize: 12, fontWeight: 700 }}>
                  {resumes.filter(r => r.status === col.value).length}
                </span>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {resumes.filter(r => r.status === col.value).map(resume => (
                  <div
                    key={resume.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, resume.id)}
                    className="glass-panel"
                    style={{ padding: 16, borderRadius: 12, cursor: "grab", border: "1px solid rgba(255,255,255,0.08)" }}
                  >
                    <div style={{ fontSize: 14, fontWeight: 700, color: "white", marginBottom: 4 }}>{resume.role}</div>
                    <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginBottom: 12 }}>{resume.name}</div>
                    
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 11 }}>
                      <span style={{ color: resume.atsScore && resume.atsScore >= 80 ? "#34d399" : "#fbbf24", fontWeight: 700 }}>
                        {resume.atsScore ? `ATS: ${resume.atsScore}%` : "No ATS Run"}
                      </span>
                      <button onClick={() => deleteResume(resume.id)} style={{ background: "transparent", border: "none", color: "rgba(255,255,255,0.3)", cursor: "pointer", fontSize: 14 }}>&times;</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
