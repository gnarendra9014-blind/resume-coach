"use client";
import { useState, useEffect } from "react";
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

const ROLES = [
  "Software Engineer", "Frontend Developer", "Backend Developer",
  "Full Stack Developer", "Data Analyst", "Data Scientist",
  "ML Engineer", "DevOps Engineer", "HR", "Product Manager",
];

const COMPANIES = [
  "Google", "Amazon", "Microsoft", "Meta", "Apple",
  "Flipkart", "Swiggy", "Zomato", "Infosys", "TCS",
  "Wipro", "Accenture", "Startup", "Other",
];

const TOPIC_ICONS: Record<string, string> = {
  "DSA": "🧮", "OOP": "📦", "System Design": "🏗️",
  "Database": "🗄️", "OS": "💻", "Networking": "🌐",
  "Frontend": "🎨", "Backend": "⚙️", "Behavioural": "🤝",
  "Company Specific": "🏢", "Projects": "🚀", "Resume Tips": "📄",
  "ML & Statistics": "🤖", "HR Processes": "👥", "Product Thinking": "💡",
  "DevOps & Cloud": "☁️", "Data & Analytics": "📊",
};

interface Question { title: string; difficulty: string; leetcode: string; youtube: string; }
interface Pattern { name: string; description: string; questions: Question[]; }
interface SectionData { patterns: Pattern[]; tips: string[]; resources: string[]; }
interface Section { title: string; topics: string[]; resources: string[]; difficulty: string; }
interface Roadmap { overview: string; timeline: string; sections: Section[]; tips: string[]; }

const inputStyle = {
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: 12,
  padding: "14px 18px",
  color: "white",
  fontSize: 14,
  fontFamily: "var(--font-body)",
  outline: "none",
  width: "100%",
  transition: "border-color 0.2s",
};

const labelStyle = {
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: "0.12em",
  textTransform: "uppercase" as const,
  color: "rgba(255,255,255,0.35)",
  marginBottom: 10,
  display: "block",
};

export default function InterviewTips() {
  const [scrolled, setScrolled] = useState(false);
  const [role, setRole] = useState("");
  const [company, setCompany] = useState("");
  const [experience, setExperience] = useState("fresher");
  const [customRole, setCustomRole] = useState("");
  const [customCompany, setCustomCompany] = useState("");
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null);
  const [rawTips, setRawTips] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeSection, setActiveSection] = useState(0);
  const [sectionData, setSectionData] = useState<Record<string, SectionData>>({});
  const [sectionLoading, setSectionLoading] = useState(false);
  useReveal();

  const finalRole = role === "Other" ? customRole : role;
  const finalCompany = company === "Other" ? customCompany : company;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const getTips = async () => {
    if (!finalRole || !finalCompany) return;
    setLoading(true);
    setRoadmap(null);
    setSectionData({});
    const res = await fetch("/api/tips", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: finalRole, company: finalCompany, experience }),
    });
    const data = await res.json();
    setRawTips(data.result);
    try {
      const parsed = parseRoadmap(data.result, finalRole, finalCompany);
      setRoadmap(parsed);
      if (parsed.sections.length > 0) {
        loadSectionData(parsed.sections[0].title, finalRole, finalCompany);
      }
    } catch {
      setRoadmap(null);
    }
    setLoading(false);
  };

  const loadSectionData = async (sectionTitle: string, r?: string, c?: string) => {
    const useRole = r || finalRole;
    const useCompany = c || finalCompany;
    if (sectionData[sectionTitle]) return;
    setSectionLoading(true);
    try {
      const res = await fetch("/api/tips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: useRole, company: useCompany, experience, section: sectionTitle }),
      });
      const data = await res.json();
      if (data.sectionData) {
        setSectionData(prev => ({ ...prev, [sectionTitle]: data.sectionData }));
      }
    } catch (e) {
      console.error(e);
    }
    setSectionLoading(false);
  };

  const handleSectionClick = (index: number, title: string) => {
    setActiveSection(index);
    loadSectionData(title);
  };

  const extractSection = (text: string, keywords: string[]): string[] => {
    const lines = text.toLowerCase().split("\n");
    const found: string[] = [];
    lines.forEach(line => {
      keywords.forEach(kw => {
        if (line.includes(kw) && line.length > 5 && line.length < 200) {
          const clean = line.replace(/[-•*#]/g, "").trim();
          if (clean && !found.includes(clean)) found.push(clean);
        }
      });
    });
    return found.slice(0, 6);
  };

  const extractTips = (text: string): string[] => {
    const lines = text.split("\n").filter(l =>
      l.trim().startsWith("-") || l.trim().startsWith("•") || l.trim().match(/^\d+\./)
    );
    return lines.slice(0, 8).map(l => l.replace(/^[-•*\d.]+/, "").trim()).filter(Boolean);
  };

  const parseRoadmap = (text: string, role: string, company: string): Roadmap => {
    const r = role.toLowerCase();
    const isHR = r.includes("hr") || r.includes("human resource");
    const isPM = r.includes("product manager");
    const isData = r.includes("data analyst") || r.includes("data scientist");
    const isML = r.includes("ml") || r.includes("machine learning") || r.includes("data scientist");
    const isFrontend = r.includes("frontend");
    const isDevOps = r.includes("devops");
    const isSWE = r.includes("software") || r.includes("backend") || r.includes("full stack");

    const allSections = [
      { show: !isHR && !isPM, title: "DSA", topics: extractSection(text, ["array", "string", "tree", "graph", "dp", "sorting", "linked list", "stack", "queue", "heap"]), resources: ["LeetCode", "GeeksForGeeks", "NeetCode.io"], difficulty: isSWE || isML ? "High" : "Medium" },
      { show: !isHR && !isPM && !isData, title: "OOP", topics: extractSection(text, ["class", "object", "inheritance", "polymorphism", "encapsulation", "abstraction", "design pattern"]), resources: ["Refactoring Guru", "Head First Design Patterns"], difficulty: "Medium" },
      { show: isSWE || isML || isDevOps, title: "System Design", topics: extractSection(text, ["scalability", "load balancer", "cache", "microservice", "api", "cdn", "sharding"]), resources: ["System Design Primer", "ByteByteGo"], difficulty: "High" },
      { show: !isHR && !isPM, title: "Database", topics: extractSection(text, ["sql", "nosql", "query", "index", "normalization", "transaction", "join", "mongodb"]), resources: ["SQLZoo", "MongoDB Docs"], difficulty: "Medium" },
      { show: isSWE || isML || isDevOps, title: "OS", topics: extractSection(text, ["process", "thread", "memory", "deadlock", "scheduling", "semaphore", "mutex"]), resources: ["OS by Galvin", "GeeksForGeeks OS"], difficulty: "Medium" },
      { show: isFrontend, title: "Frontend", topics: extractSection(text, ["html", "css", "javascript", "react", "typescript", "dom", "browser", "webpack"]), resources: ["MDN Docs", "Frontend Mentor", "JavaScript.info"], difficulty: "High" },
      { show: isML, title: "ML & Statistics", topics: extractSection(text, ["regression", "classification", "neural", "statistics", "python", "numpy", "pandas", "tensorflow"]), resources: ["Kaggle", "fast.ai", "Andrew Ng Coursera"], difficulty: "High" },
      { show: isHR, title: "HR Processes", topics: extractSection(text, ["recruitment", "onboarding", "payroll", "labour law", "conflict", "performance", "policy"]), resources: ["SHRM", "HR Bartender", "LinkedIn Learning"], difficulty: "Medium" },
      { show: isPM, title: "Product Thinking", topics: extractSection(text, ["product", "metrics", "roadmap", "stakeholder", "user research", "prioritization", "agile"]), resources: ["Lenny's Newsletter", "Reforge", "Intercom Blog"], difficulty: "High" },
      { show: isDevOps, title: "DevOps & Cloud", topics: extractSection(text, ["docker", "kubernetes", "ci/cd", "jenkins", "aws", "azure", "terraform", "monitoring"]), resources: ["AWS Docs", "Docker Docs", "DevOps Roadmap"], difficulty: "High" },
      { show: isData, title: "Data & Analytics", topics: extractSection(text, ["excel", "tableau", "power bi", "statistics", "visualization", "python", "pandas", "sql"]), resources: ["Kaggle", "Mode Analytics", "Tableau Public"], difficulty: "Medium" },
      { show: true, title: "Behavioural", topics: extractSection(text, ["leadership", "conflict", "teamwork", "challenge", "star method", "communication"]), resources: ["STAR Method Guide", "Glassdoor Reviews"], difficulty: "Low" },
      { show: true, title: "Company Specific", topics: extractSection(text, [company.toLowerCase(), "culture", "values", "interview process", "rounds"]), resources: [`${company} Engineering Blog`, "Glassdoor", "Blind App"], difficulty: "Medium" },
    ];

    return {
      overview: `Personalized interview preparation roadmap for ${role} at ${company}.`,
      timeline: "4-8 weeks",
      sections: allSections
        .filter(s => s.show)
        .map(({ show, ...rest }) => rest)
        .map(s => s.topics.length === 0 ? { ...s, topics: ["See full guide below"] } : s),
      tips: extractTips(text),
    };
  };

  const diffBadge = (d: string) => {
    if (d === "High") return { bg: "rgba(239,68,68,0.12)", border: "rgba(239,68,68,0.25)", color: "#f87171" };
    if (d === "Medium") return { bg: "rgba(250,204,21,0.1)", border: "rgba(250,204,21,0.2)", color: "#facc15" };
    return { bg: "rgba(52,211,153,0.1)", border: "rgba(52,211,153,0.2)", color: "#34d399" };
  };

  const qDiffBadge = (d: string) => {
    if (d === "Easy") return { bg: "rgba(52,211,153,0.12)", color: "#34d399" };
    if (d === "Medium") return { bg: "rgba(250,204,21,0.1)", color: "#facc15" };
    return { bg: "rgba(239,68,68,0.12)", color: "#f87171" };
  };

  // ── RENDER ──
  return (
    <div style={{ background: "#000", color: "#fff", minHeight: "100vh", fontFamily: "var(--font-body)", overflowX: "hidden" }}>
      <style>{`
        @keyframes floatA { 0%,100%{transform:translateY(0) rotate(0deg)} 50%{transform:translateY(-20px) rotate(2deg)} }
        @keyframes floatB { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-14px)} }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }
        @keyframes spin { to{transform:rotate(360deg)} }
        .float-a { animation: floatA 8s ease-in-out infinite; }
        .float-b { animation: floatB 6s ease-in-out infinite; }
      `}</style>

      {/* Grid lines */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, backgroundImage: "linear-gradient(rgba(255,255,255,0.025) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.025) 1px,transparent 1px)", backgroundSize: "64px 64px" }} />

      {/* Glow orbs */}
      <div style={{ position: "fixed", inset: 0, overflow: "hidden", pointerEvents: "none", zIndex: 0 }}>
        <div className="float-a" style={{ position: "absolute", top: "10%", right: "10%", width: 450, height: 450, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,255,255,0.04) 0%, transparent 70%)", filter: "blur(40px)" }} />
        <div className="float-b" style={{ position: "absolute", bottom: "20%", left: "5%", width: 350, height: 350, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,255,255,0.03) 0%, transparent 70%)", filter: "blur(40px)" }} />
      </div>

      {/* NAV */}
      <nav className={`rc-nav ${scrolled ? "scrolled" : ""}`} style={{ zIndex: 100 }}>
        <Link href="/" className="rc-nav-logo">Resume Coach</Link>
        <div className="rc-nav-links">
          <Link href="/resume-builder" className="rc-nav-link">Resume Builder</Link>
          <Link href="/interview" className="rc-nav-link">Mock Interview</Link>
          <Link href="/resume-reviewer" className="rc-nav-link">Reviewer</Link>
          <Link href="/interview-tips" className="rc-nav-link" style={{ color: "white" }}>Tips</Link>
        </div>
      </nav>

      {/* ── LOADING OVERLAY ── */}
      {loading && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.92)", backdropFilter: "blur(12px)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 24 }}>
          <div style={{ position: "relative", width: 80, height: 80 }}>
            <div style={{ width: 80, height: 80, borderRadius: "50%", border: "2px solid rgba(255,255,255,0.1)", borderTopColor: "white", animation: "spin 1s linear infinite" }} />
          </div>
          <div style={{ fontFamily: "var(--font-display)", fontSize: "clamp(28px,4vw,48px)", fontWeight: 900, letterSpacing: "-2px", color: "white" }}>
            Building roadmap...
          </div>
          <div style={{ fontSize: 14, color: "rgba(255,255,255,0.3)" }}>
            Analyzing {finalCompany}&apos;s interview patterns for {finalRole}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            {["Topics", "Patterns", "Resources", "Company Tips"].map((t, i) => (
              <span key={t} style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.4)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 100, padding: "6px 16px", animation: `pulse 1.5s ${i * 0.2}s infinite` }}>{t}</span>
            ))}
          </div>
        </div>
      )}

      {/* ── SETUP VIEW ── */}
      {!roadmap && !loading && (
        <>
          {/* HERO */}
          <section style={{ position: "relative", zIndex: 1, padding: "160px 48px 80px" }}>
            <div style={{ maxWidth: 1200, margin: "0 auto" }}>
              <div className="section-label reveal" style={{ marginBottom: 24 }}>Interview Prep Roadmap</div>
              <h1 className="letter-reveal" style={{ fontFamily: "var(--font-display)", fontSize: "clamp(48px,8vw,100px)", fontWeight: 900, letterSpacing: "-4px", lineHeight: 0.95, marginBottom: 32 }}>
                {splitLetters("Your study")}
                <br />
                {splitLetters("roadmap.")}
              </h1>
              <p className="reveal" style={{ fontSize: 17, color: "rgba(255,255,255,0.4)", maxWidth: 520, lineHeight: 1.75 }}>
                Select your target role and company — get a personalized roadmap with DSA patterns, YouTube links, and company-specific tips.
              </p>

              {/* Feature pills */}
              <div className="reveal" style={{ display: "flex", gap: 10, marginTop: 32, flexWrap: "wrap" }}>
                {["Role-Specific Topics", "YouTube Links", "LeetCode Problems", "Company Tips", "Resources"].map(f => (
                  <span key={f} style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.4)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 100, padding: "6px 16px", letterSpacing: "0.03em" }}>{f}</span>
                ))}
              </div>
            </div>
          </section>

          <div className="rc-divider" style={{ position: "relative", zIndex: 1 }} />

          {/* FORM */}
          <section style={{ position: "relative", zIndex: 1, padding: "64px 48px", maxWidth: 900, margin: "0 auto" }}>
            <div className="section-label reveal" style={{ marginBottom: 40 }}>Build Your Roadmap</div>

            {/* Role */}
            <div className="reveal" style={{ marginBottom: 36 }}>
              <label style={labelStyle}>🎯 Target Role</label>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
                {[...ROLES, "Other"].map(r => (
                  <button key={r} onClick={() => setRole(r)} style={{
                    padding: "12px 10px", borderRadius: 12, fontSize: 13, fontWeight: 600, cursor: "pointer",
                    background: role === r ? "rgba(255,255,255,0.08)" : "transparent",
                    border: `1px solid ${role === r ? "rgba(255,255,255,0.4)" : "rgba(255,255,255,0.06)"}`,
                    color: role === r ? "white" : "rgba(255,255,255,0.4)",
                    transition: "all 0.25s",
                    fontFamily: "var(--font-body)",
                  }}
                    onMouseEnter={e => { if (role !== r) { (e.currentTarget).style.borderColor = "rgba(255,255,255,0.2)"; (e.currentTarget).style.color = "rgba(255,255,255,0.7)"; } }}
                    onMouseLeave={e => { if (role !== r) { (e.currentTarget).style.borderColor = "rgba(255,255,255,0.06)"; (e.currentTarget).style.color = "rgba(255,255,255,0.4)"; } }}
                  >
                    {r}
                  </button>
                ))}
              </div>
              {role === "Other" && (
                <input type="text" placeholder="Enter your role..." value={customRole} onChange={e => setCustomRole(e.target.value)}
                  style={{ ...inputStyle, marginTop: 12 }}
                  onFocus={e => (e.target as HTMLInputElement).style.borderColor = "rgba(255,255,255,0.4)"}
                  onBlur={e => (e.target as HTMLInputElement).style.borderColor = "rgba(255,255,255,0.1)"} />
              )}
            </div>

            {/* Company */}
            <div className="reveal" style={{ marginBottom: 36, transitionDelay: "0.1s" }}>
              <label style={labelStyle}>🏢 Target Company</label>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 8 }}>
                {COMPANIES.map(c => (
                  <button key={c} onClick={() => setCompany(c)} style={{
                    padding: "12px 10px", borderRadius: 12, fontSize: 13, fontWeight: 600, cursor: "pointer",
                    background: company === c ? "rgba(255,255,255,0.08)" : "transparent",
                    border: `1px solid ${company === c ? "rgba(255,255,255,0.4)" : "rgba(255,255,255,0.06)"}`,
                    color: company === c ? "white" : "rgba(255,255,255,0.4)",
                    transition: "all 0.25s",
                    fontFamily: "var(--font-body)",
                  }}
                    onMouseEnter={e => { if (company !== c) { (e.currentTarget).style.borderColor = "rgba(255,255,255,0.2)"; (e.currentTarget).style.color = "rgba(255,255,255,0.7)"; } }}
                    onMouseLeave={e => { if (company !== c) { (e.currentTarget).style.borderColor = "rgba(255,255,255,0.06)"; (e.currentTarget).style.color = "rgba(255,255,255,0.4)"; } }}
                  >
                    {c}
                  </button>
                ))}
              </div>
              {company === "Other" && (
                <input type="text" placeholder="Enter company name..." value={customCompany} onChange={e => setCustomCompany(e.target.value)}
                  style={{ ...inputStyle, marginTop: 12 }}
                  onFocus={e => (e.target as HTMLInputElement).style.borderColor = "rgba(255,255,255,0.4)"}
                  onBlur={e => (e.target as HTMLInputElement).style.borderColor = "rgba(255,255,255,0.1)"} />
              )}
            </div>

            {/* Experience */}
            <div className="reveal" style={{ marginBottom: 40, transitionDelay: "0.2s" }}>
              <label style={labelStyle}>📊 Experience Level</label>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
                {[
                  { value: "fresher", icon: "🌱", label: "Fresher", desc: "0-1 years" },
                  { value: "mid", icon: "💼", label: "Mid Level", desc: "1-3 years" },
                  { value: "senior", icon: "🚀", label: "Senior", desc: "3+ years" },
                ].map(e => (
                  <button key={e.value} onClick={() => setExperience(e.value)} style={{
                    padding: "20px 16px", borderRadius: 16, cursor: "pointer", textAlign: "left",
                    background: experience === e.value ? "rgba(255,255,255,0.06)" : "transparent",
                    border: `1px solid ${experience === e.value ? "rgba(255,255,255,0.4)" : "rgba(255,255,255,0.06)"}`,
                    transition: "all 0.25s",
                  }}>
                    <div style={{ fontSize: 20, marginBottom: 8 }}>{e.icon}</div>
                    <div style={{ fontFamily: "var(--font-display)", fontSize: 15, fontWeight: 800, color: experience === e.value ? "white" : "rgba(255,255,255,0.6)", marginBottom: 4 }}>{e.label}</div>
                    <div style={{ fontSize: 12, color: "rgba(255,255,255,0.25)" }}>{e.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Submit */}
            <div className="reveal" style={{ transitionDelay: "0.3s" }}>
              <button
                onClick={getTips}
                disabled={!finalRole || !finalCompany}
                className="mag-btn mag-btn-filled"
                style={{ width: "100%", justifyContent: "center", opacity: !finalRole || !finalCompany ? 0.4 : 1 }}
              >
                <span>Generate My Roadmap</span><span>→</span>
              </button>
              {(!finalRole || !finalCompany) && (
                <p style={{ fontSize: 12, color: "rgba(255,255,255,0.25)", marginTop: 12, textAlign: "center" }}>Select a role and company to begin</p>
              )}
            </div>
          </section>

          <div className="rc-divider" style={{ position: "relative", zIndex: 1 }} />

          {/* PREVIEW CARDS */}
          <section style={{ position: "relative", zIndex: 1, padding: "64px 48px", maxWidth: 1200, margin: "0 auto" }}>
            <div className="section-label reveal" style={{ marginBottom: 32 }}>What you&apos;ll get</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 2 }}>
              {[
                { n: "01", icon: "🧮", title: "DSA Patterns", desc: "Curated problems organized by pattern — arrays, trees, graphs, DP, and more." },
                { n: "02", icon: "▶", title: "YouTube Links", desc: "Hand-picked video explanations for each topic and problem pattern." },
                { n: "03", icon: "🏢", title: "Company Tips", desc: "Specific advice on interview rounds, culture fit, and commonly asked questions." },
                { n: "04", icon: "📚", title: "Resources", desc: "Books, websites, and platforms to practice — organized by difficulty level." },
              ].map((card, i) => (
                <div key={card.n} className="reveal" style={{
                  padding: "36px 28px", border: "1px solid rgba(255,255,255,0.06)",
                  borderRight: i < 3 ? "none" : "1px solid rgba(255,255,255,0.06)",
                  transitionDelay: `${i * 0.1}s`,
                }}>
                  <div style={{ fontSize: 28, marginBottom: 20 }}>{card.icon}</div>
                  <div style={{ fontFamily: "var(--font-display)", fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.2)", letterSpacing: "0.12em", marginBottom: 16 }}>{card.n}</div>
                  <h3 style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 800, color: "white", marginBottom: 12, letterSpacing: "-0.5px" }}>{card.title}</h3>
                  <p style={{ fontSize: 13, color: "rgba(255,255,255,0.35)", lineHeight: 1.65 }}>{card.desc}</p>
                </div>
              ))}
            </div>
          </section>
        </>
      )}

      {/* ── RESULTS VIEW ── */}
      {roadmap && !loading && (
        <section style={{ position: "relative", zIndex: 1, padding: "140px 48px 80px", maxWidth: 1200, margin: "0 auto" }}>

          {/* Header bar */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 40, flexWrap: "wrap", gap: 16 }}>
            <div>
              <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.5)", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 100, padding: "4px 14px" }}>{finalCompany}</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.5)", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 100, padding: "4px 14px" }}>{finalRole}</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: "rgba(52,211,153,0.8)", background: "rgba(52,211,153,0.08)", border: "1px solid rgba(52,211,153,0.15)", borderRadius: 100, padding: "4px 14px", textTransform: "capitalize" }}>{experience}</span>
              </div>
              <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(28px,4vw,42px)", fontWeight: 900, letterSpacing: "-2px", color: "white" }}>Your Interview Roadmap</h2>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.3)", marginTop: 8 }}>⏱ {roadmap.timeline} — Click any section to load problems & YouTube links</p>
            </div>
            <button onClick={() => { setRoadmap(null); setRawTips(""); setSectionData({}); }} className="mag-btn" style={{ padding: "10px 24px", fontSize: 13 }}>
              <span>← New Roadmap</span>
            </button>
          </div>

          <div className="rc-divider" style={{ marginBottom: 40 }} />

          <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 32 }}>

            {/* Sidebar */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {roadmap.sections.map((section, i) => {
                const badge = diffBadge(section.difficulty);
                return (
                  <button key={i} onClick={() => handleSectionClick(i, section.title)} style={{
                    display: "flex", alignItems: "center", gap: 14, padding: "16px 18px", borderRadius: 14, cursor: "pointer", textAlign: "left",
                    background: activeSection === i ? "rgba(255,255,255,0.06)" : "transparent",
                    border: `1px solid ${activeSection === i ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.05)"}`,
                    transition: "all 0.25s",
                  }}
                    onMouseEnter={e => { if (activeSection !== i) (e.currentTarget).style.borderColor = "rgba(255,255,255,0.12)"; }}
                    onMouseLeave={e => { if (activeSection !== i) (e.currentTarget).style.borderColor = "rgba(255,255,255,0.05)"; }}
                  >
                    <span style={{ fontSize: 22, flexShrink: 0 }}>{TOPIC_ICONS[section.title] || "📌"}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontFamily: "var(--font-display)", fontSize: 14, fontWeight: 700, color: activeSection === i ? "white" : "rgba(255,255,255,0.6)", marginBottom: 4 }}>{section.title}</div>
                      <span style={{ fontSize: 10, fontWeight: 700, color: badge.color, background: badge.bg, border: `1px solid ${badge.border}`, borderRadius: 100, padding: "2px 10px" }}>{section.difficulty}</span>
                    </div>
                    {activeSection === i && <div style={{ width: 3, height: 24, borderRadius: 2, background: "white", flexShrink: 0 }} />}
                  </button>
                );
              })}

              {/* Quick Tips */}
              {roadmap.tips.length > 0 && (
                <div style={{ marginTop: 16, padding: "20px 18px", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 14, background: "rgba(255,255,255,0.02)" }}>
                  <div style={{ fontFamily: "var(--font-display)", fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.3)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 16 }}>⚡ Quick Tips</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {roadmap.tips.slice(0, 5).map((tip, i) => (
                      <div key={i} style={{ display: "flex", gap: 8, fontSize: 12, color: "rgba(255,255,255,0.4)", lineHeight: 1.6 }}>
                        <span style={{ color: "rgba(255,255,255,0.2)", flexShrink: 0 }}>→</span>
                        <span>{tip}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Main Content */}
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              {roadmap.sections[activeSection] && (
                <>
                  {/* Section header */}
                  <div style={{ padding: "32px 36px", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 20, background: "rgba(255,255,255,0.02)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
                      <div style={{ width: 52, height: 52, borderRadius: 14, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26 }}>
                        {TOPIC_ICONS[roadmap.sections[activeSection].title] || "📌"}
                      </div>
                      <div>
                        <h3 style={{ fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 900, color: "white", letterSpacing: "-1px" }}>{roadmap.sections[activeSection].title}</h3>
                        {(() => { const b = diffBadge(roadmap.sections[activeSection].difficulty); return (
                          <span style={{ fontSize: 11, fontWeight: 700, color: b.color, background: b.bg, border: `1px solid ${b.border}`, borderRadius: 100, padding: "3px 12px", marginTop: 6, display: "inline-block" }}>{roadmap.sections[activeSection].difficulty} Priority</span>
                        ); })()}
                      </div>
                    </div>

                    {sectionLoading ? (
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "48px 0", gap: 16 }}>
                        <div style={{ width: 48, height: 48, borderRadius: "50%", border: "2px solid rgba(255,255,255,0.1)", borderTopColor: "white", animation: "spin 1s linear infinite" }} />
                        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.3)" }}>Loading problems & YouTube links...</p>
                      </div>
                    ) : sectionData[roadmap.sections[activeSection].title] ? (
                      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                        {/* Resources */}
                        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                          {sectionData[roadmap.sections[activeSection].title].resources?.map((r, i) => (
                            <span key={i} style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.5)", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 100, padding: "6px 16px" }}>📚 {r}</span>
                          ))}
                        </div>

                        {/* Patterns */}
                        {sectionData[roadmap.sections[activeSection].title].patterns?.map((pattern, pi) => (
                          <div key={pi} style={{ border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, overflow: "hidden" }}>
                            <div style={{ padding: "16px 24px", background: "rgba(255,255,255,0.03)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                              <div style={{ fontFamily: "var(--font-display)", fontSize: 15, fontWeight: 800, color: "white" }}>{pattern.name}</div>
                              {pattern.description && <p style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", marginTop: 4 }}>{pattern.description}</p>}
                            </div>
                            <div>
                              {pattern.questions?.map((q, qi) => {
                                const qb = qDiffBadge(q.difficulty);
                                return (
                                  <div key={qi} style={{
                                    display: "flex", alignItems: "center", gap: 14, padding: "14px 24px",
                                    borderBottom: qi < pattern.questions.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
                                    transition: "background 0.15s",
                                  }}
                                    onMouseEnter={e => (e.currentTarget).style.background = "rgba(255,255,255,0.02)"}
                                    onMouseLeave={e => (e.currentTarget).style.background = "transparent"}
                                  >
                                    <span style={{ fontSize: 10, fontWeight: 700, color: qb.color, background: qb.bg, borderRadius: 100, padding: "3px 10px", flexShrink: 0 }}>{q.difficulty}</span>
                                    <span style={{ flex: 1, fontSize: 14, color: "rgba(255,255,255,0.7)", fontWeight: 500 }}>{q.title}</span>
                                    <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                                      {q.leetcode && q.leetcode.includes("leetcode") && (
                                        <a href={q.leetcode} target="_blank" rel="noopener noreferrer" style={{
                                          display: "inline-flex", alignItems: "center", gap: 6, fontSize: 11, fontWeight: 700,
                                          color: "#fb923c", background: "rgba(251,146,60,0.08)", border: "1px solid rgba(251,146,60,0.15)",
                                          borderRadius: 8, padding: "5px 12px", textDecoration: "none", transition: "all 0.2s",
                                        }}>🟠 LeetCode</a>
                                      )}
                                      {q.youtube && (
                                        <a href={q.youtube} target="_blank" rel="noopener noreferrer" style={{
                                          display: "inline-flex", alignItems: "center", gap: 6, fontSize: 11, fontWeight: 700,
                                          color: "#f87171", background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.15)",
                                          borderRadius: 8, padding: "5px 12px", textDecoration: "none", transition: "all 0.2s",
                                        }}>▶ YouTube</a>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        ))}

                        {/* Section Tips */}
                        {sectionData[roadmap.sections[activeSection].title].tips?.length > 0 && (
                          <div style={{ padding: "20px 24px", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, background: "rgba(255,255,255,0.02)" }}>
                            <div style={{ fontFamily: "var(--font-display)", fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.5)", marginBottom: 14 }}>💡 Pro Tips</div>
                            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                              {sectionData[roadmap.sections[activeSection].title].tips.map((tip, i) => (
                                <div key={i} style={{ display: "flex", gap: 8, fontSize: 13, color: "rgba(255,255,255,0.45)", lineHeight: 1.65 }}>
                                  <span style={{ color: "rgba(255,255,255,0.2)", flexShrink: 0 }}>→</span>
                                  <span>{tip}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div style={{ textAlign: "center", padding: "48px 0" }}>
                        <div style={{ fontSize: 32, marginBottom: 12, opacity: 0.5 }}>👆</div>
                        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.25)" }}>Click the section to load problems & YouTube links</p>
                      </div>
                    )}
                  </div>

                  {/* Full AI Guide */}
                  <div style={{ padding: "32px 36px", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 20, background: "rgba(255,255,255,0.02)" }}>
                    <div style={{ fontFamily: "var(--font-display)", fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.4)", letterSpacing: "0.05em", marginBottom: 20 }}>🤖 Full AI Preparation Guide</div>
                    <div style={{
                      background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 14,
                      padding: "24px 28px", maxHeight: "50vh", overflowY: "auto",
                      fontSize: 14, color: "rgba(255,255,255,0.55)", lineHeight: 1.85, whiteSpace: "pre-wrap",
                    }}>
                      {rawTips}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </section>
      )}

      {/* ── FOOTER ── */}
      <footer style={{ position: "relative", zIndex: 1, padding: "32px 48px", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 20 }}>
          <Link href="/" style={{ fontFamily: "var(--font-display)", fontWeight: 900, fontSize: 16, color: "white", textDecoration: "none", letterSpacing: "-0.5px" }}>Resume Coach</Link>
          <div style={{ display: "flex", gap: 32 }}>
            {[["Resume Builder", "/resume-builder"], ["Mock Interview", "/interview"], ["Resume Reviewer", "/resume-reviewer"], ["Interview Tips", "/interview-tips"]].map(([l, h]) => (
              <Link key={l} href={h} className="rc-nav-link" style={{ fontSize: 12 }}>{l}</Link>
            ))}
          </div>
          <p style={{ fontSize: 12, color: "rgba(255,255,255,0.2)" }}>© 2025 Resume Coach.</p>
        </div>
      </footer>
    </div>
  );
}