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

type Mode = "text" | "voice" | "video";
type Message = { role: "ai" | "user"; text: string };

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

export default function Interview() {
  const [scrolled, setScrolled] = useState(false);
  const [mode, setMode] = useState<Mode | null>(null);
  const [role, setRole] = useState("");
  const [company, setCompany] = useState("");
  const [level, setLevel] = useState("Mid");
  const [started, setStarted] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [videoOn, setVideoOn] = useState(false);
  const [micOn, setMicOn] = useState(true);
  const [callTime, setCallTime] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  useReveal();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (started && mode === "video") {
      timerRef.current = setInterval(() => setCallTime(t => t + 1), 1000);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [started, mode]);

  const formatTime = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  const startInterview = async () => {
    if (!role || !mode) return;
    setStarted(true);
    if (mode === "video") {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
        setVideoOn(true);
      } catch {
        setVideoOn(false);
      }
    }
    setLoading(true);
    try {
      const res = await fetch("/api/interview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [], role, company, level, mode }),
      });
      const data = await res.json();
      const aiText = data.message || "Tell me about yourself.";
      setMessages([{ role: "ai", text: aiText }]);
      if (mode === "voice" || mode === "video") speak(aiText);
    } catch {
      setMessages([{ role: "ai", text: "Hello! Tell me about yourself." }]);
    }
    setLoading(false);
  };

  const speak = (text: string) => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.rate = 0.95;
      u.pitch = 1;
      window.speechSynthesis.speak(u);
    }
  };

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;
    const newMessages: Message[] = [...messages, { role: "user", text }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch("/api/interview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages, role, company, level, mode }),
      });
      const data = await res.json();
      const aiText = data.message || "Interesting. Tell me more.";
      setMessages(m => [...m, { role: "ai", text: aiText }]);
      if (mode === "voice" || mode === "video") speak(aiText);
    } catch {
      setMessages(m => [...m, { role: "ai", text: "Please continue." }]);
    }
    setLoading(false);
  };

  const startVoice = () => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return;
    const recognition = new SR();
    recognition.lang = "en-US";
    recognition.onstart = () => setListening(true);
    recognition.onend = () => setListening(false);
    recognition.onresult = (e: any) => {
      const text = e.results[0][0].transcript;
      sendMessage(text);
    };
    recognition.start();
  };

  const endCall = () => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    window.speechSynthesis?.cancel();
    if (timerRef.current) clearInterval(timerRef.current);
    setStarted(false);
    setMessages([]);
    setMode(null);
    setCallTime(0);
    setVideoOn(false);
  };

  // VIDEO CALL UI
  if (started && mode === "video") {
    return (
      <div style={{ background: "#0a0a0a", height: "100vh", display: "flex", flexDirection: "column", fontFamily: "var(--font-body)", overflow: "hidden" }}>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } } @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }`}</style>

        <div style={{ padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#34d399", animation: "pulse 2s infinite" }} />
            <span style={{ fontFamily: "var(--font-display)", fontSize: 14, fontWeight: 700, color: "white" }}>
              {company ? `${company} Interview` : "Mock Interview"}
            </span>
            <span style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", background: "rgba(255,255,255,0.06)", padding: "4px 12px", borderRadius: 100 }}>{formatTime(callTime)}</span>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <span style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", background: "rgba(255,255,255,0.04)", padding: "4px 12px", borderRadius: 100, border: "1px solid rgba(255,255,255,0.08)" }}>{role}</span>
            <span style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", background: "rgba(255,255,255,0.04)", padding: "4px 12px", borderRadius: 100, border: "1px solid rgba(255,255,255,0.08)" }}>{level}</span>
          </div>
        </div>

        <div style={{ flex: 1, display: "grid", gridTemplateColumns: "1fr 380px", overflow: "hidden" }}>
          <div style={{ position: "relative", background: "#050505", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 24 }}>
              <div style={{ position: "relative", width: 120, height: 120 }}>
                <div style={{ width: 120, height: 120, borderRadius: "50%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ fontFamily: "var(--font-display)", fontSize: 36, fontWeight: 900, color: "rgba(255,255,255,0.6)" }}>AI</span>
                </div>
                {loading && (
                  <div style={{ position: "absolute", inset: -8, borderRadius: "50%", border: "2px solid rgba(255,255,255,0.2)", borderTopColor: "white", animation: "spin 1s linear infinite" }} />
                )}
              </div>
              <div>
                <div style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 800, color: "white", textAlign: "center" }}>AI Interviewer</div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", textAlign: "center", marginTop: 4 }}>{loading ? "Thinking..." : "Listening"}</div>
              </div>
              {messages.filter(m => m.role === "ai").slice(-1).map((m, i) => (
                <div key={i} style={{ maxWidth: 420, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: "16px 20px", fontSize: 14, color: "rgba(255,255,255,0.7)", lineHeight: 1.7, textAlign: "center" }}>
                  {m.text}
                </div>
              ))}
            </div>
            <div style={{ position: "absolute", bottom: 24, right: 24, width: 160, height: 100, borderRadius: 12, overflow: "hidden", border: "1px solid rgba(255,255,255,0.1)", background: "#111" }}>
              {videoOn ? (
                <video ref={videoRef} muted style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>Camera off</span>
                </div>
              )}
            </div>
          </div>

          <div style={{ borderLeft: "1px solid rgba(255,255,255,0.06)", display: "flex", flexDirection: "column", background: "#050505" }}>
            <div style={{ padding: "16px 20px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" as const, color: "rgba(255,255,255,0.3)" }}>Live Transcript</span>
            </div>
            <div style={{ flex: 1, overflowY: "auto", padding: "20px", display: "flex", flexDirection: "column", gap: 12 }}>
              {messages.map((m, i) => (
                <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: m.role === "user" ? "flex-end" : "flex-start", gap: 4 }}>
                  <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", color: "rgba(255,255,255,0.2)", textTransform: "uppercase" as const }}>{m.role === "ai" ? "Interviewer" : "You"}</span>
                  <div style={{ maxWidth: "85%", padding: "10px 14px", borderRadius: 12, background: m.role === "ai" ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.08)", fontSize: 13, color: "rgba(255,255,255,0.7)", lineHeight: 1.6 }}>
                    {m.text}
                  </div>
                </div>
              ))}
              {loading && (
                <div style={{ display: "flex", gap: 4, padding: "10px 14px" }}>
                  {[0,1,2].map(i => <div key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: "rgba(255,255,255,0.3)", animation: `pulse 1s ${i * 0.2}s infinite` }} />)}
                </div>
              )}
              <div ref={bottomRef} />
            </div>
            <div style={{ padding: "16px 20px", borderTop: "1px solid rgba(255,255,255,0.06)", display: "flex", gap: 10 }}>
              <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && sendMessage(input)} placeholder="Type your answer..." style={{ ...inputStyle, flex: 1 }} />
              <button onClick={() => sendMessage(input)} style={{ padding: "12px 16px", background: "white", border: "none", borderRadius: 10, cursor: "pointer", color: "black", fontWeight: 700, fontSize: 14 }}>→</button>
            </div>
          </div>
        </div>

        <div style={{ padding: "20px 24px", borderTop: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "center", gap: 16 }}>
          <button onClick={() => setMicOn(m => !m)} style={{ width: 48, height: 48, borderRadius: "50%", background: micOn ? "rgba(255,255,255,0.08)" : "rgba(239,68,68,0.2)", border: `1px solid ${micOn ? "rgba(255,255,255,0.15)" : "rgba(239,68,68,0.5)"}`, cursor: "pointer", fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center" }}>
            {micOn ? "🎙️" : "🔇"}
          </button>
          <button onClick={() => setVideoOn(v => !v)} style={{ width: 48, height: 48, borderRadius: "50%", background: videoOn ? "rgba(255,255,255,0.08)" : "rgba(239,68,68,0.2)", border: `1px solid ${videoOn ? "rgba(255,255,255,0.15)" : "rgba(239,68,68,0.5)"}`, cursor: "pointer", fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center" }}>
            {videoOn ? "📹" : "📵"}
          </button>
          <button onClick={startVoice} style={{ width: 48, height: 48, borderRadius: "50%", background: listening ? "rgba(59,130,246,0.3)" : "rgba(255,255,255,0.08)", border: `1px solid ${listening ? "rgba(59,130,246,0.6)" : "rgba(255,255,255,0.15)"}`, cursor: "pointer", fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center" }}>
            🎤
          </button>
          <button onClick={endCall} style={{ padding: "12px 28px", borderRadius: 100, background: "#ef4444", border: "none", cursor: "pointer", color: "white", fontFamily: "var(--font-display)", fontSize: 13, fontWeight: 700, letterSpacing: "0.05em" }}>
            End Interview
          </button>
        </div>
      </div>
    );
  }

  // TEXT / VOICE CHAT UI
  if (started && (mode === "text" || mode === "voice")) {
    return (
      <div style={{ background: "#000", height: "100vh", display: "flex", flexDirection: "column", fontFamily: "var(--font-body)", overflow: "hidden" }}>
        <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }`}</style>
        <div style={{ position: "fixed", inset: 0, pointerEvents: "none", backgroundImage: "linear-gradient(rgba(255,255,255,0.025) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.025) 1px,transparent 1px)", backgroundSize: "64px 64px" }} />

        <div style={{ position: "relative", zIndex: 1, padding: "20px 40px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <Link href="/" className="rc-nav-logo" style={{ fontSize: 15 }}>Resume Coach</Link>
            <div style={{ width: 1, height: 20, background: "rgba(255,255,255,0.1)" }} />
            <span style={{ fontSize: 13, color: "rgba(255,255,255,0.4)" }}>
              {role} {company ? `@ ${company}` : ""} · {level}
            </span>
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <span style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", background: "rgba(255,255,255,0.04)", padding: "4px 12px", borderRadius: 100, border: "1px solid rgba(255,255,255,0.08)", textTransform: "capitalize" as const }}>{mode} mode</span>
            <button onClick={endCall} style={{ padding: "8px 20px", borderRadius: 100, background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)", cursor: "pointer", color: "#f87171", fontSize: 12, fontWeight: 700 }}>End</button>
          </div>
        </div>

        <div style={{ position: "relative", zIndex: 1, flex: 1, overflowY: "auto", padding: "32px 40px", display: "flex", flexDirection: "column", gap: 20, maxWidth: 800, margin: "0 auto", width: "100%" }}>
          {messages.map((m, i) => (
            <div key={i} style={{ display: "flex", gap: 14, flexDirection: m.role === "user" ? "row-reverse" : "row" }}>
              <div style={{ width: 36, height: 36, borderRadius: "50%", background: m.role === "ai" ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.12)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, color: "white", flexShrink: 0 }}>
                {m.role === "ai" ? "AI" : "U"}
              </div>
              <div style={{ maxWidth: "75%", padding: "16px 20px", borderRadius: 16, background: m.role === "ai" ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.08)", fontSize: 15, color: "rgba(255,255,255,0.8)", lineHeight: 1.75 }}>
                {m.text}
              </div>
            </div>
          ))}
          {loading && (
            <div style={{ display: "flex", gap: 14 }}>
              <div style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800 }}>AI</div>
              <div style={{ padding: "16px 20px", borderRadius: 16, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", display: "flex", gap: 6, alignItems: "center" }}>
                {[0,1,2].map(i => <div key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: "rgba(255,255,255,0.4)", animation: `pulse 1s ${i * 0.2}s infinite` }} />)}
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        <div style={{ position: "relative", zIndex: 1, padding: "20px 40px", borderTop: "1px solid rgba(255,255,255,0.06)", maxWidth: 800, margin: "0 auto", width: "100%" }}>
          <div style={{ display: "flex", gap: 12 }}>
            <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && !loading && sendMessage(input)} placeholder="Type your answer..." disabled={loading} style={{ ...inputStyle, flex: 1 }} />
            {mode === "voice" && (
              <button onClick={startVoice} style={{ width: 48, height: 48, borderRadius: 12, background: listening ? "rgba(59,130,246,0.2)" : "rgba(255,255,255,0.06)", border: `1px solid ${listening ? "rgba(59,130,246,0.5)" : "rgba(255,255,255,0.1)"}`, cursor: "pointer", fontSize: 18, flexShrink: 0 }}>
                🎤
              </button>
            )}
            <button onClick={() => sendMessage(input)} disabled={loading || !input.trim()} style={{ padding: "0 24px", height: 48, borderRadius: 12, background: "white", border: "none", cursor: "pointer", color: "black", fontWeight: 700, fontSize: 15, flexShrink: 0, opacity: loading || !input.trim() ? 0.4 : 1 }}>→</button>
          </div>
        </div>
      </div>
    );
  }

  // SETUP PAGE
  return (
    <div style={{ background: "#000", color: "#fff", minHeight: "100vh", fontFamily: "var(--font-body)" }}>
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }`}</style>
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, backgroundImage: "linear-gradient(rgba(255,255,255,0.025) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.025) 1px,transparent 1px)", backgroundSize: "64px 64px" }} />
      <div style={{ position: "fixed", top: "30%", left: "5%", width: 350, height: 350, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,255,255,0.04) 0%, transparent 70%)", filter: "blur(40px)", pointerEvents: "none", zIndex: 0 }} />

      <nav className={`rc-nav ${scrolled ? "scrolled" : ""}`} style={{ zIndex: 100 }}>
        <Link href="/" className="rc-nav-logo">Resume Coach</Link>
        <div className="rc-nav-links">
          <Link href="/resume-builder" className="rc-nav-link">Resume Builder</Link>
          <Link href="/interview" className="rc-nav-link" style={{ color: "white" }}>Mock Interview</Link>
          <Link href="/resume-reviewer" className="rc-nav-link">Reviewer</Link>
          <Link href="/interview-tips" className="rc-nav-link">Tips</Link>
        </div>
      </nav>

      <section style={{ position: "relative", zIndex: 1, padding: "160px 48px 80px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div className="section-label reveal" style={{ marginBottom: 24 }}>AI Mock Interview</div>
          <h1 className="letter-reveal" style={{ fontFamily: "var(--font-display)", fontSize: "clamp(48px,8vw,100px)", fontWeight: 900, letterSpacing: "-4px", lineHeight: 0.95, marginBottom: 32 }}>
            {splitLetters("Practice until")}
            <br />
            {splitLetters("perfect.")}
          </h1>
          <p className="reveal" style={{ fontSize: 17, color: "rgba(255,255,255,0.4)", maxWidth: 480, lineHeight: 1.75 }}>
            A strict AI interviewer that challenges you — text, voice, or full video call mode.
          </p>
        </div>
      </section>

      <div className="rc-divider" style={{ position: "relative", zIndex: 1 }} />

      <section style={{ position: "relative", zIndex: 1, padding: "64px 48px", maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 64 }}>

          <div className="reveal" style={{ display: "flex", flexDirection: "column", gap: 28 }}>
            <div className="section-label" style={{ marginBottom: 8 }}>Setup</div>

            <div>
              <label style={labelStyle}>Target Role *</label>
              <input value={role} onChange={e => setRole(e.target.value)} placeholder="Software Engineer, PM, Data Analyst..." style={inputStyle}
                onFocus={e => (e.target as HTMLInputElement).style.borderColor = "rgba(255,255,255,0.4)"}
                onBlur={e => (e.target as HTMLInputElement).style.borderColor = "rgba(255,255,255,0.1)"} />
            </div>

            <div>
              <label style={labelStyle}>Company (optional)</label>
              <input value={company} onChange={e => setCompany(e.target.value)} placeholder="Google, Amazon, Startup..." style={inputStyle}
                onFocus={e => (e.target as HTMLInputElement).style.borderColor = "rgba(255,255,255,0.4)"}
                onBlur={e => (e.target as HTMLInputElement).style.borderColor = "rgba(255,255,255,0.1)"} />
            </div>

            <div>
              <label style={labelStyle}>Experience Level</label>
              <div style={{ display: "flex", gap: 2 }}>
                {["Junior", "Mid", "Senior"].map(l => (
                  <button key={l} onClick={() => setLevel(l)} style={{ flex: 1, padding: "12px 0", border: "1px solid", borderColor: level === l ? "rgba(255,255,255,0.4)" : "rgba(255,255,255,0.08)", background: level === l ? "rgba(255,255,255,0.08)" : "transparent", color: level === l ? "white" : "rgba(255,255,255,0.35)", fontSize: 13, fontWeight: 600, borderRadius: 10, cursor: "pointer", transition: "all 0.2s" }}>
                    {l}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="reveal" style={{ transitionDelay: "0.1s" }}>
            <div className="section-label" style={{ marginBottom: 24 }}>Interview Mode</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[
                { id: "text" as Mode, icon: "💬", title: "Text Mode", desc: "Type your answers — best for practicing phrasing and structure." },
                { id: "voice" as Mode, icon: "🎙️", title: "Voice Mode", desc: "Speak your answers aloud — AI speaks questions back to you." },
                { id: "video" as Mode, icon: "📹", title: "Video Mode", desc: "Full video call simulation — camera + mic + live transcript." },
              ].map(m => (
                <div key={m.id} onClick={() => setMode(m.id)} style={{ padding: "24px", border: "1px solid", borderColor: mode === m.id ? "rgba(255,255,255,0.4)" : "rgba(255,255,255,0.06)", background: mode === m.id ? "rgba(255,255,255,0.05)" : "transparent", borderRadius: 16, cursor: "pointer", transition: "all 0.25s", display: "flex", gap: 20, alignItems: "flex-start" }}>
                  <span style={{ fontSize: 28, lineHeight: 1 }}>{m.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 800, color: mode === m.id ? "white" : "rgba(255,255,255,0.6)", marginBottom: 6 }}>{m.title}</div>
                    <div style={{ fontSize: 13, color: "rgba(255,255,255,0.35)", lineHeight: 1.6 }}>{m.desc}</div>
                  </div>
                  {mode === m.id && <div style={{ width: 20, height: 20, borderRadius: "50%", background: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: "black", fontWeight: 900, flexShrink: 0 }}>✓</div>}
                </div>
              ))}
            </div>

            <div style={{ marginTop: 32 }}>
              <button onClick={startInterview} disabled={!role || !mode} className="mag-btn mag-btn-filled" style={{ width: "100%", justifyContent: "center", opacity: !role || !mode ? 0.4 : 1 }}>
                <span>Start Interview</span><span>→</span>
              </button>
              {(!role || !mode) && <p style={{ fontSize: 12, color: "rgba(255,255,255,0.25)", marginTop: 10, textAlign: "center" }}>Enter your role and select a mode to begin</p>}
            </div>
          </div>
        </div>
      </section>

      <div className="rc-divider" style={{ position: "relative", zIndex: 1 }} />

      <section style={{ position: "relative", zIndex: 1, padding: "64px 48px", maxWidth: 1200, margin: "0 auto" }}>
        <div className="section-label reveal" style={{ marginBottom: 32 }}>Tips</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 2 }}>
          {[
            { n: "01", tip: "Use the STAR method — Situation, Task, Action, Result." },
            { n: "02", tip: "Keep answers to 2 minutes. Be concise and specific." },
            { n: "03", tip: "Research the company before starting video mode." },
            { n: "04", tip: "Practice voice mode daily to build confidence." },
          ].map((t, i) => (
            <div key={t.n} className="reveal" style={{ padding: "28px 24px", border: "1px solid rgba(255,255,255,0.06)", borderRight: i < 3 ? "none" : "1px solid rgba(255,255,255,0.06)", transitionDelay: `${i * 0.1}s` }}>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.2)", letterSpacing: "0.12em", marginBottom: 16 }}>{t.n}</div>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", lineHeight: 1.7 }}>{t.tip}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
