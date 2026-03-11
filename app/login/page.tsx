"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [visible, setVisible] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  useEffect(() => {
    setTimeout(() => setVisible(true), 100);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setMessage(error.message);
    else window.location.href = "/";
    setLoading(false);
  };

  const ease = "cubic-bezier(0.16,1,0.3,1)";

  return (
    <div style={{ background: "#000", color: "#fff", minHeight: "100vh", fontFamily: "var(--font-body)", overflowX: "hidden", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>

      <style jsx global>{`
        @keyframes floatA { 0%,100%{transform:translateY(0) rotate(0deg)} 50%{transform:translateY(-20px) rotate(2deg)} }
        @keyframes floatB { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-14px)} }
        @keyframes shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
        @keyframes borderGlow { 0%,100%{opacity:0.3} 50%{opacity:0.8} }
        @keyframes inputSlide { from{opacity:0;transform:translateX(-20px)} to{opacity:1;transform:translateX(0)} }
        .float-a { animation: floatA 8s ease-in-out infinite; }
        .float-b { animation: floatB 6s ease-in-out infinite; }
        .auth-input {
          width: 100%;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 12px;
          padding: 16px 20px;
          color: white;
          font-family: var(--font-body);
          font-size: 15px;
          outline: none;
          transition: all 0.4s cubic-bezier(0.16,1,0.3,1);
          backdrop-filter: blur(10px);
        }
        .auth-input::placeholder { color: rgba(255,255,255,0.2); }
        .auth-input:focus {
          border-color: rgba(255,255,255,0.25);
          background: rgba(255,255,255,0.05);
          box-shadow: 0 0 0 4px rgba(255,255,255,0.03), 0 8px 32px rgba(0,0,0,0.3);
        }
        .auth-submit {
          width: 100%;
          padding: 16px 32px;
          font-family: var(--font-display);
          font-weight: 700;
          font-size: 15px;
          border: none;
          border-radius: 12px;
          cursor: pointer;
          position: relative;
          overflow: hidden;
          transition: all 0.4s cubic-bezier(0.16,1,0.3,1);
          background: white;
          color: black;
        }
        .auth-submit:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 12px 40px rgba(255,255,255,0.15);
        }
        .auth-submit:active:not(:disabled) {
          transform: translateY(0);
        }
        .auth-submit:disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }
        .auth-card {
          position: relative;
          z-index: 10;
          width: 100%;
          max-width: 440px;
          padding: 48px 44px;
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 24px;
          background: rgba(255,255,255,0.02);
          backdrop-filter: blur(40px);
          box-shadow: 0 32px 80px rgba(0,0,0,0.5);
        }
        .auth-link {
          color: rgba(255,255,255,0.5);
          text-decoration: none;
          font-weight: 600;
          transition: color 0.2s;
          position: relative;
        }
        .auth-link:hover { color: white; }
        .auth-link::after {
          content: '';
          position: absolute;
          bottom: -2px;
          left: 0;
          width: 0;
          height: 1px;
          background: white;
          transition: width 0.35s cubic-bezier(0.16,1,0.3,1);
        }
        .auth-link:hover::after { width: 100%; }
        .field-label {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.25);
          margin-bottom: 10px;
          display: block;
          transition: color 0.3s;
        }
        .field-label.active { color: rgba(255,255,255,0.6); }
      `}</style>

      {/* Grid lines */}
      <div style={{
        position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0,
        backgroundImage: "linear-gradient(rgba(255,255,255,0.025) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.025) 1px,transparent 1px)",
        backgroundSize: "64px 64px",
      }} />

      {/* Glow orbs */}
      <div style={{ position: "fixed", inset: 0, overflow: "hidden", pointerEvents: "none", zIndex: 0 }}>
        <div className="float-a" style={{ position: "absolute", top: "10%", left: "15%", width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,255,255,0.04) 0%, transparent 70%)", filter: "blur(40px)" }} />
        <div className="float-b" style={{ position: "absolute", bottom: "10%", right: "10%", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,255,255,0.03) 0%, transparent 70%)", filter: "blur(40px)" }} />
      </div>

      {/* Big BG text */}
      <div style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%,-50%)", fontFamily: "var(--font-display)", fontSize: "clamp(80px,20vw,280px)", fontWeight: 900, color: "rgba(255,255,255,0.015)", letterSpacing: "-8px", whiteSpace: "nowrap", pointerEvents: "none", userSelect: "none", lineHeight: 1, zIndex: 0 }}>
        LOGIN
      </div>

      {/* Back to home */}
      <Link href="/" style={{
        position: "fixed", top: 32, left: 48, zIndex: 100,
        fontFamily: "var(--font-display)", fontWeight: 900, fontSize: 18,
        color: "white", textDecoration: "none", letterSpacing: "-0.5px",
        opacity: visible ? 1 : 0,
        transition: `opacity 0.8s ${ease}`,
      }}>
        Resume Coach
      </Link>

      <Link href="/signup" style={{
        position: "fixed", top: 32, right: 48, zIndex: 100,
        opacity: visible ? 1 : 0,
        transition: `opacity 0.8s ${ease}`,
        transitionDelay: "200ms",
      }}>
        <span className="rc-nav-btn" style={{ fontSize: 13, fontWeight: 700, color: "black", background: "white", textDecoration: "none", padding: "10px 22px", borderRadius: 100 }}>
          Sign Up →
        </span>
      </Link>

      {/* Auth Card */}
      <div className="auth-card" style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(30px)",
        transition: `opacity 0.9s ${ease}, transform 0.9s ${ease}`,
        transitionDelay: "200ms",
      }}>
        {/* Decorative corner accents */}
        <div style={{ position: "absolute", top: -1, left: 40, right: 40, height: 1, background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)" }} />

        <div style={{ marginBottom: 40 }}>
          <div style={{
            fontSize: 11, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase" as const,
            color: "rgba(255,255,255,0.3)", display: "flex", alignItems: "center", gap: 12, marginBottom: 20,
          }}>
            <span style={{ display: "inline-block", width: 24, height: 1, background: "rgba(255,255,255,0.3)" }} />
            Welcome back
          </div>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: 36, fontWeight: 900, letterSpacing: "-1.5px", lineHeight: 1, marginBottom: 12 }}>
            Sign in.
          </h1>
          <p style={{ fontSize: 15, color: "rgba(255,255,255,0.35)", lineHeight: 1.6 }}>
            Access your saved resumes, interviews, and career tools.
          </p>
        </div>

        <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "translateX(0)" : "translateX(-20px)",
            transition: `all 0.7s ${ease}`,
            transitionDelay: "400ms",
          }}>
            <label className={`field-label ${focusedField === "email" ? "active" : ""}`}>Email Address</label>
            <input
              id="login-email"
              type="email"
              className="auth-input"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onFocus={() => setFocusedField("email")}
              onBlur={() => setFocusedField(null)}
              autoComplete="email"
            />
          </div>

          <div style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "translateX(0)" : "translateX(-20px)",
            transition: `all 0.7s ${ease}`,
            transitionDelay: "500ms",
          }}>
            <label className={`field-label ${focusedField === "password" ? "active" : ""}`}>Password</label>
            <input
              id="login-password"
              type="password"
              className="auth-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onFocus={() => setFocusedField("password")}
              onBlur={() => setFocusedField(null)}
              autoComplete="current-password"
            />
          </div>

          {message && (
            <div style={{
              padding: "14px 18px",
              borderRadius: 12,
              border: "1px solid rgba(255,100,100,0.15)",
              background: "rgba(255,100,100,0.05)",
              fontSize: 13,
              color: "rgba(255,150,150,0.9)",
              lineHeight: 1.5,
              animation: "fadeUp 0.4s cubic-bezier(0.16,1,0.3,1)",
            }}>
              {message}
            </div>
          )}

          <div style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(10px)",
            transition: `all 0.7s ${ease}`,
            transitionDelay: "600ms",
          }}>
            <button
              id="login-submit"
              type="submit"
              className="auth-submit"
              disabled={loading || !email || !password}
            >
              {loading ? (
                <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
                  <span style={{
                    width: 16, height: 16, border: "2px solid rgba(0,0,0,0.2)",
                    borderTopColor: "black", borderRadius: "50%",
                    animation: "spin-slow 0.6s linear infinite", display: "inline-block",
                  }} />
                  Signing in...
                </span>
              ) : (
                <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
                  Sign In <span>→</span>
                </span>
              )}
            </button>
          </div>
        </form>

        <div style={{
          marginTop: 32,
          paddingTop: 24,
          borderTop: "1px solid rgba(255,255,255,0.06)",
          textAlign: "center" as const,
          fontSize: 14,
          color: "rgba(255,255,255,0.3)",
          opacity: visible ? 1 : 0,
          transition: `opacity 0.7s ${ease}`,
          transitionDelay: "700ms",
        }}>
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="auth-link">
            Create one
          </Link>
        </div>
      </div>
    </div>
  );
}