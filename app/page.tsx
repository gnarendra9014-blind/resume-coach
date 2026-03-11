"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import MagneticButton from "./components/MagneticButton";

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

function CountUp({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);
  useEffect(() => {
    const observer = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !started.current) {
        started.current = true;
        let s = 0;
        const step = target / (1500 / 16);
        const t = setInterval(() => {
          s += step;
          if (s >= target) { setCount(target); clearInterval(t); }
          else setCount(Math.floor(s));
        }, 16);
      }
    });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);
  return <span ref={ref}>{count}{suffix}</span>;
}

function ResumeIcon() {
  return (
    <svg viewBox="0 0 220 280" fill="none" xmlns="http://www.w3.org/2000/svg"
      style={{ width: "100%", height: "100%" }}>
      <style>{`
        .la { stroke-dasharray: 200; stroke-dashoffset: 200; animation: drawL 1.8s cubic-bezier(0.16,1,0.3,1) forwards; }
        .la2{animation-delay:0.15s} .la3{animation-delay:0.3s} .la4{animation-delay:0.45s}
        .la5{animation-delay:0.6s} .la6{animation-delay:0.75s} .la7{animation-delay:0.9s} .la8{animation-delay:1.05s}
        .pa { stroke-dasharray: 800; stroke-dashoffset: 800; animation: drawL 1s cubic-bezier(0.16,1,0.3,1) forwards; }
        @keyframes drawL { to { stroke-dashoffset: 0; } }
        .pencil-g { animation: pfloat 4s ease-in-out infinite; transform-origin: 175px 55px; }
        @keyframes pfloat {
          0%,100% { transform: translate(0,0) rotate(-35deg); }
          50% { transform: translate(-4px,-8px) rotate(-35deg); }
        }
        .da { animation: dpop 0.4s cubic-bezier(0.34,1.56,0.64,1) forwards; opacity:0; }
        @keyframes dpop { to { opacity:1; transform:scale(1); } }
        .gp { animation: gpulse 3s ease-in-out infinite; }
        @keyframes gpulse { 0%,100%{opacity:0.15} 50%{opacity:0.4} }
        .wglow { animation: gpulse 1.5s ease-in-out infinite; }
      `}</style>

      <ellipse cx="100" cy="150" rx="90" ry="110" fill="rgba(255,255,255,0.03)" className="gp" />

      <rect x="20" y="10" width="150" height="200" rx="10"
        stroke="rgba(255,255,255,0.15)" strokeWidth="1.5"
        fill="rgba(255,255,255,0.02)" className="pa" />
      <path d="M 150 10 L 170 30 L 150 30 Z"
        stroke="rgba(255,255,255,0.08)" strokeWidth="1"
        fill="rgba(255,255,255,0.02)" className="pa" />

      <circle cx="52" cy="55" r="18"
        stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" fill="rgba(255,255,255,0.03)"
        strokeDasharray="120" strokeDashoffset="120"
        style={{ animation: "drawL 1s 0.3s cubic-bezier(0.16,1,0.3,1) forwards" }} />
      <circle cx="52" cy="51" r="7"
        stroke="rgba(255,255,255,0.2)" strokeWidth="1" fill="none"
        strokeDasharray="50" strokeDashoffset="50"
        style={{ animation: "drawL 0.8s 0.6s forwards" }} />
      <path d="M 36 68 Q 52 60 68 68"
        stroke="rgba(255,255,255,0.2)" strokeWidth="1" fill="none"
        strokeDasharray="40" strokeDashoffset="40"
        style={{ animation: "drawL 0.6s 0.8s forwards" }} />

      <line x1="78" y1="45" x2="148" y2="45" stroke="rgba(255,255,255,0.5)" strokeWidth="2" strokeLinecap="round" className="la" style={{ animationDelay: "0.5s" }} />
      <line x1="78" y1="58" x2="130" y2="58" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" strokeLinecap="round" className="la" style={{ animationDelay: "0.65s" }} />
      <line x1="78" y1="68" x2="140" y2="68" stroke="rgba(255,255,255,0.15)" strokeWidth="1" strokeLinecap="round" className="la" style={{ animationDelay: "0.75s" }} />

      <line x1="30" y1="92" x2="80" y2="92" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" strokeLinecap="round" className="la la2" />
      <line x1="30" y1="108" x2="155" y2="108" stroke="rgba(255,255,255,0.12)" strokeWidth="1" strokeLinecap="round" className="la la3" />
      <line x1="30" y1="120" x2="140" y2="120" stroke="rgba(255,255,255,0.1)" strokeWidth="1" strokeLinecap="round" className="la la4" />
      <line x1="30" y1="132" x2="150" y2="132" stroke="rgba(255,255,255,0.08)" strokeWidth="1" strokeLinecap="round" className="la la5" />

      <line x1="30" y1="150" x2="72" y2="150" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" strokeLinecap="round" className="la la6" />
      <line x1="30" y1="165" x2="148" y2="165" stroke="rgba(255,255,255,0.1)" strokeWidth="1" strokeLinecap="round" className="la la7" />
      <line x1="30" y1="177" x2="120" y2="177" stroke="rgba(255,255,255,0.08)" strokeWidth="1" strokeLinecap="round" className="la la8" />

      {[0,1,2,3,4].map((i) => (
        <circle key={i} cx={30 + i * 20} cy={196} r={5}
          fill={i < 4 ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.06)"}
          stroke={i < 4 ? "rgba(255,255,255,0.6)" : "rgba(255,255,255,0.1)"}
          strokeWidth="1" className="da"
          style={{ animationDelay: `${1.2 + i * 0.1}s`, transform: "scale(0)" }} />
      ))}

      <g className="pencil-g" style={{ transform: "rotate(-35deg)", transformOrigin: "175px 55px" }}>
        <rect x="168" y="20" width="14" height="55" rx="2"
          fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.4)" strokeWidth="1.2" />
        <path d="M 168 75 L 175 92 L 182 75 Z"
          fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
        <path d="M 172 85 L 175 92 L 178 85"
          fill="rgba(255,255,255,0.2)" stroke="rgba(255,255,255,0.5)" strokeWidth="0.8" />
        <rect x="168" y="14" width="14" height="8" rx="2"
          fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
        <line x1="175" y1="22" x2="175" y2="73"
          stroke="rgba(255,255,255,0.15)" strokeWidth="0.8" />
        <circle cx="175" cy="92" r="4"
          fill="rgba(255,255,255,0.3)" className="wglow" />
      </g>
    </svg>
  );
}

const features = [
  { n: "01", title: "Resume Builder", sub: "AI Powered", desc: "Generate ATS-optimized resumes in seconds. Choose from 4 templates across 5 languages.", link: "/resume-builder" },
  { n: "02", title: "Mock Interview", sub: "Live Practice", desc: "Practice with a strict AI interviewer in text, voice, or full video call mode.", link: "/interview" },
  { n: "03", title: "Resume Reviewer", sub: "Smart Review", desc: "Upload your resume, get expert AI feedback plus a fully rewritten improved version.", link: "/resume-reviewer" },
  { n: "04", title: "Interview Tips", sub: "Study Roadmap", desc: "Personalized roadmap with DSA patterns, YouTube links, and company-specific tips.", link: "/interview-tips" },
];

const companies = [
  "Google", "Amazon", "Microsoft", "Meta", "Apple", "Netflix",
  "Flipkart", "Swiggy", "Zomato", "Infosys", "TCS", "Wipro", "Accenture", "Adobe",
];

export default function Home() {
  const [scrolled, setScrolled] = useState(false);
  const [visible, setVisible] = useState(false);
  useReveal();

  useEffect(() => {
    setTimeout(() => setVisible(true), 100);
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const ease = "cubic-bezier(0.16,1,0.3,1)";

  return (
    <div style={{ color: "#fff", minHeight: "100vh", fontFamily: "var(--font-body)", overflowX: "hidden", position: "relative" }}>

      <style jsx global>{`
        @keyframes floatA { 0%,100%{transform:translateY(0) rotate(0deg)} 50%{transform:translateY(-20px) rotate(2deg)} }
        @keyframes floatB { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-14px)} }
        @keyframes spin-slow { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        .float-a { animation: floatA 8s ease-in-out infinite; }
        .float-b { animation: floatB 6s ease-in-out infinite; }
      `}</style>

      {/* Grid lines */}
      <div style={{
        position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0,
        backgroundImage: "linear-gradient(rgba(255,255,255,0.025) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.025) 1px,transparent 1px)",
        backgroundSize: "64px 64px",
      }} />

      {/* Glow orbs */}
      <div style={{ position: "fixed", inset: 0, overflow: "hidden", pointerEvents: "none", zIndex: 0 }}>
        <div className="float-a" style={{ position: "absolute", top: "5%", left: "5%", width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,255,255,0.04) 0%, transparent 70%)", filter: "blur(40px)" }} />
        <div className="float-b" style={{ position: "absolute", top: "40%", right: "5%", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,255,255,0.03) 0%, transparent 70%)", filter: "blur(40px)" }} />
        <div className="float-a" style={{ position: "absolute", bottom: "10%", left: "35%", width: 350, height: 350, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,255,255,0.025) 0%, transparent 70%)", filter: "blur(40px)", animationDelay: "3s" }} />
      </div>

      {/* NAV */}
      <nav className={`rc-nav ${scrolled ? "scrolled" : ""}`} style={{ zIndex: 100 }}>
        <Link href="/" className="rc-nav-logo">Resume Coach</Link>
        <div className="rc-nav-links">
          <Link href="/" className="rc-nav-link" style={{ color: "white" }}>Home</Link>
          <a href="#features" className="rc-nav-link">Features</a>
          <a href="#how" className="rc-nav-link">How it works</a>
          <a href="#reviews" className="rc-nav-link">Reviews</a>
          <Link href="/dashboard" className="rc-nav-link" style={{ color: "#34d399", fontWeight: 700 }}>Dashboard</Link>
          <Link href="/login" className="rc-nav-link">Login</Link>
          <Link href="/signup" className="rc-nav-btn">Sign Up →</Link>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={{ position: "relative", zIndex: 1, minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "flex-end", padding: "0 48px 80px", overflow: "hidden" }}>

        {/* Big BG text */}
        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", fontFamily: "var(--font-display)", fontSize: "clamp(80px,18vw,220px)", fontWeight: 900, color: "rgba(255,255,255,0.018)", letterSpacing: "-8px", whiteSpace: "nowrap", pointerEvents: "none", userSelect: "none", lineHeight: 1, zIndex: 0 }}>
          CAREER
        </div>

        {/* Resume SVG — right side */}
        <div style={{
          position: "absolute", right: 48, top: "50%",
          transform: `translateY(-50%)`,
          width: "min(400px, 38vw)", height: "min(500px, 50vw)",
          opacity: visible ? 0.7 : 0,
          transition: `opacity 1.4s ${ease}`,
          transitionDelay: "400ms",
          pointerEvents: "none", zIndex: 1,
        }}>
          <div className="float-b" style={{ width: "100%", height: "100%" }}>
            <ResumeIcon />
          </div>
        </div>

        {/* Social proof */}
        <div style={{ position: "absolute", top: 140, right: 48, zIndex: 2 }}
          className="reveal">
          <div style={{ display: "flex", alignItems: "center", gap: 10, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 100, padding: "8px 16px", backdropFilter: "blur(10px)" }}>
            <div style={{ display: "flex" }}>
              {["#3b82f6","#8b5cf6","#10b981","#f59e0b"].map((c, i) => (
                <div key={c} style={{ width: 24, height: 24, borderRadius: "50%", background: c, border: "2px solid #000", marginLeft: i === 0 ? 0 : -6, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 700, color: "white", position: "relative", zIndex: 4 - i }}>
                  {["P","A","S","R"][i]}
                </div>
              ))}
            </div>
            <span style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.6)" }}>2,400+ active this week</span>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#34d399", display: "inline-block", animation: "pulse 2s infinite" }} />
          </div>
        </div>

        <div style={{ maxWidth: 1200, width: "100%", margin: "0 auto", position: "relative", zIndex: 2 }}>
          <div className="section-label reveal" style={{ marginBottom: 32 }}>
            AI-powered career tools
          </div>

          <h1 className="letter-reveal text-gradient-animated" style={{ fontFamily: "var(--font-display)", fontSize: "clamp(56px,9vw,120px)", fontWeight: 900, lineHeight: 0.95, letterSpacing: "-4px", marginBottom: 48, maxWidth: 700 }}>
            {splitLetters("Land your")}
            <br />
            {splitLetters("dream job.")}
          </h1>

          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: 32 }}>
            <p className="reveal" style={{ fontSize: 18, color: "rgba(255,255,255,0.45)", maxWidth: 440, lineHeight: 1.7, transitionDelay: "0.3s" }}>
              Build ATS-ready resumes, practice mock interviews, get expert feedback — all powered by AI.
            </p>
            <div className="reveal" style={{ display: "flex", gap: 14, transitionDelay: "0.5s" }}>
              <MagneticButton><Link href="/resume-builder" className="mag-btn mag-btn-filled"><span>Build My Resume</span><span>→</span></Link></MagneticButton>
              <MagneticButton><Link href="/interview" className="mag-btn"><span>Try Interview</span><span>↗</span></Link></MagneticButton>
            </div>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <div className="rc-divider" style={{ position: "relative", zIndex: 1 }} />
      <div style={{ position: "relative", zIndex: 1, padding: "32px 48px", maxWidth: 1200, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(4,1fr)" }}>
        {[
          { target: 50, suffix: "K+", label: "Resumes Built" },
          { target: 12, suffix: "K+", label: "Interviews Done" },
          { target: 94, suffix: "%", label: "Success Rate" },
          { target: 0, suffix: "4.9★", label: "User Rating" },
        ].map((s, i) => (
          <div key={s.label} className="reveal" style={{ padding: "24px 0", borderRight: i < 3 ? "1px solid rgba(255,255,255,0.08)" : "none", paddingLeft: i > 0 ? 32 : 0, transitionDelay: `${i * 0.1}s` }}>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 42, fontWeight: 900, letterSpacing: "-2px", color: "white" }}>
              {s.target === 0 ? s.suffix : <CountUp target={s.target} suffix={s.suffix} />}
            </div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", marginTop: 4, letterSpacing: "0.05em" }}>{s.label}</div>
          </div>
        ))}
      </div>
      <div className="rc-divider" style={{ position: "relative", zIndex: 1 }} />

      {/* ── MARQUEE ── */}
      <div style={{ position: "relative", zIndex: 1, padding: "20px 0", overflow: "hidden", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
        <div style={{ display: "flex", animation: "marquee 20s linear infinite", width: "max-content" }}>
          {[...Array(2)].map((_, rep) => (
            <div key={rep} style={{ display: "flex", alignItems: "center" }}>
              {companies.map((c) => (
                <div key={c + rep} style={{ display: "flex", alignItems: "center", gap: 10, padding: "0 40px" }}>
                  <span style={{ width: 4, height: 4, borderRadius: "50%", background: "rgba(255,255,255,0.3)", display: "inline-block" }} />
                  <span style={{ fontFamily: "var(--font-display)", fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.25)", letterSpacing: "0.08em", textTransform: "uppercase" }}>{c}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* ── FEATURES ── */}
      <section id="features" style={{ position: "relative", zIndex: 1, padding: "120px 48px", maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 80, flexWrap: "wrap", gap: 24 }}>
          <div>
            <div className="section-label reveal" style={{ marginBottom: 20 }}>What we offer</div>
            <h2 className="letter-reveal" style={{ fontFamily: "var(--font-display)", fontSize: "clamp(40px,5vw,72px)", fontWeight: 900, letterSpacing: "-2.5px", lineHeight: 0.95 }}>
              {splitLetters("Four tools,")}
              <br />
              {splitLetters("one mission.")}
            </h2>
          </div>
          <p className="reveal" style={{ fontSize: 16, color: "rgba(255,255,255,0.4)", maxWidth: 320, lineHeight: 1.7 }}>
            Everything you need to go from job application to offer letter.
          </p>
        </div>

        {features.map((f, i) => (
          <div key={f.n}>
            <div className="rc-divider" />
            <Link href={f.link} style={{ textDecoration: "none", display: "block" }}>
              <div className="reveal"
                style={{ display: "grid", gridTemplateColumns: "80px 1fr 1fr auto", alignItems: "center", gap: 32, padding: "40px 0", transition: "all 0.4s var(--ease)", transitionDelay: `${i * 0.08}s` }}
                onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.paddingLeft = "20px"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.paddingLeft = "0"; }}
              >
                <span style={{ fontFamily: "var(--font-display)", fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.2)", letterSpacing: "0.1em" }}>{f.n}</span>
                <h3 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(22px,3vw,36px)", fontWeight: 800, color: "white", letterSpacing: "-1px" }}>{f.title}</h3>
                <p style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", lineHeight: 1.65, maxWidth: 360 }}>{f.desc}</p>
                <div style={{ fontSize: 22, color: "rgba(255,255,255,0.3)", fontWeight: 300 }}>→</div>
              </div>
            </Link>
          </div>
        ))}
        <div className="rc-divider" />
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how" style={{ position: "relative", zIndex: 1, padding: "120px 48px", background: "rgba(255,255,255,0.012)", borderTop: "1px solid rgba(255,255,255,0.05)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div className="section-label reveal" style={{ marginBottom: 20 }}>Process</div>
          <h2 className="letter-reveal" style={{ fontFamily: "var(--font-display)", fontSize: "clamp(40px,5vw,72px)", fontWeight: 900, letterSpacing: "-2.5px", marginBottom: 80, lineHeight: 0.95 }}>
            {splitLetters("How it works.")}
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 2 }}>
            {[
              { n: "01", icon: "🎯", title: "Pick a tool", desc: "Choose the right tool for your goal." },
              { n: "02", icon: "✏️", title: "Enter details", desc: "Your role, company, experience level." },
              { n: "03", icon: "⚡", title: "Get AI output", desc: "Personalized results in seconds." },
              { n: "04", icon: "🚀", title: "Land the job", desc: "Apply with confidence." },
            ].map((s, i) => (
              <div key={s.n} className="reveal glass-panel" style={{ padding: "40px 32px", borderRight: i < 3 ? "none" : "1px solid rgba(255,255,255,0.06)", transitionDelay: `${i * 0.1}s`, borderRadius: "16px", margin: "4px" }}>
                <div style={{ fontSize: 32, marginBottom: 24 }}>{s.icon}</div>
                <div style={{ fontFamily: "var(--font-display)", fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.2)", letterSpacing: "0.12em", marginBottom: 16 }}>{s.n}</div>
                <h3 style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 800, color: "white", marginBottom: 12, letterSpacing: "-0.5px" }}>{s.title}</h3>
                <p style={{ fontSize: 13, color: "rgba(255,255,255,0.35)", lineHeight: 1.65 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section id="reviews" style={{ position: "relative", zIndex: 1, padding: "120px 48px", maxWidth: 1200, margin: "0 auto" }}>
        <div className="section-label reveal" style={{ marginBottom: 20 }}>Social proof</div>
        <h2 className="letter-reveal" style={{ fontFamily: "var(--font-display)", fontSize: "clamp(40px,5vw,72px)", fontWeight: 900, letterSpacing: "-2.5px", marginBottom: 80, lineHeight: 0.95 }}>
          {splitLetters("Real results.")}
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 2 }}>
          {[
            { name: "Priya S.", role: "SWE @ Google", text: "Resume Coach helped me land my dream job. The AI resume builder is incredible and saved me hours.", avatar: "P" },
            { name: "Arjun M.", role: "Frontend Dev @ Microsoft", text: "The mock interview feature is so realistic. I felt completely prepared walking into the actual interview.", avatar: "A" },
            { name: "Sneha R.", role: "Data Analyst @ Amazon", text: "The study roadmap showed me exactly what to study for my role. Best tool for interview prep.", avatar: "S" },
          ].map((t, i) => (
            <div key={t.name} className="reveal glass-panel" style={{ padding: "48px 40px", borderRight: i < 2 ? "none" : "1px solid rgba(255,255,255,0.06)", transitionDelay: `${i * 0.1}s`, borderRadius: "16px", margin: "4px" }}>
              <div style={{ display: "flex", gap: 2, marginBottom: 32 }}>
                {[...Array(5)].map((_,j) => <span key={j} style={{ color: "rgba(255,255,255,0.6)", fontSize: 12 }}>★</span>)}
              </div>
              <p style={{ fontSize: 16, color: "rgba(255,255,255,0.55)", lineHeight: 1.75, marginBottom: 40, fontStyle: "italic" }}>"{t.text}"</p>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: "50%", border: "1px solid rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.6)" }}>{t.avatar}</div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "white" }}>{t.name}</div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginTop: 2 }}>{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ position: "relative", zIndex: 1, padding: "120px 48px", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 40 }}>
          <h2 className="letter-reveal" style={{ fontFamily: "var(--font-display)", fontSize: "clamp(40px,6vw,80px)", fontWeight: 900, letterSpacing: "-3px", lineHeight: 0.95, maxWidth: 600 }}>
            {splitLetters("Ready to get")}
            <br />
            {splitLetters("hired?")}
          </h2>
          <div className="reveal" style={{ display: "flex", flexDirection: "column", gap: 16, alignItems: "flex-start" }}>
            <p style={{ fontSize: 16, color: "rgba(255,255,255,0.4)", maxWidth: 320, lineHeight: 1.7 }}>
              Join thousands of job seekers who used Resume Coach to land their dream jobs.
            </p>
            <div style={{ display: "flex", gap: 14 }}>
              <MagneticButton><Link href="/resume-builder" className="mag-btn mag-btn-filled"><span>Build My Resume</span><span>→</span></Link></MagneticButton>
              <MagneticButton><Link href="/interview" className="mag-btn"><span>Mock Interview</span><span>↗</span></Link></MagneticButton>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ position: "relative", zIndex: 1, padding: "32px 48px", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 20 }}>
          <Link href="/" style={{ fontFamily: "var(--font-display)", fontWeight: 900, fontSize: 16, color: "white", textDecoration: "none", letterSpacing: "-0.5px" }}>Resume Coach</Link>
          <div style={{ display: "flex", gap: 32 }}>
            {[["Resume Builder","/resume-builder"],["Mock Interview","/interview"],["Resume Reviewer","/resume-reviewer"],["Interview Tips","/interview-tips"]].map(([l,h]) => (
              <Link key={l} href={h} className="rc-nav-link" style={{ fontSize: 12 }}>{l}</Link>
            ))}
          </div>
          <p style={{ fontSize: 12, color: "rgba(255,255,255,0.2)" }}>© 2025 Resume Coach.</p>
        </div>
      </footer>
    </div>
  );
}