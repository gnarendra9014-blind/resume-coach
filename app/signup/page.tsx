"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function SignUpPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const [visible, setVisible] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  useEffect(() => {
    setTimeout(() => setVisible(true), 100);
  }, []);

  const passwordStrength = (() => {
    if (!password) return { level: 0, label: "", color: "transparent" };
    let score = 0;
    if (password.length >= 6) score++;
    if (password.length >= 10) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    if (score <= 1) return { level: 1, label: "Weak", color: "rgba(255,100,100,0.7)" };
    if (score <= 3) return { level: 2, label: "Fair", color: "rgba(255,200,100,0.7)" };
    return { level: 3, label: "Strong", color: "rgba(100,255,150,0.7)" };
  })();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setMessage("Passwords don't match.");
      return;
    }
    if (password.length < 6) {
      setMessage("Password must be at least 6 characters.");
      return;
    }
    setLoading(true);
    setMessage("");

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name } },
    });
    if (error) {
      setMessage(error.message);
    } else {
      setSuccess(true);
      setMessage("Account created! Check your email to confirm.");
    }
    setLoading(false);
  };

  const ease = "cubic-bezier(0.16,1,0.3,1)";

  return (
    <div style={{ background: "#000", color: "#fff", minHeight: "100vh", fontFamily: "var(--font-body)", overflowX: "hidden", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>

      <style jsx global>{`
        @keyframes floatA { 0%,100%{transform:translateY(0) rotate(0deg)} 50%{transform:translateY(-20px) rotate(2deg)} }
        @keyframes floatB { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-14px)} }
        @keyframes spin-slow { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes checkPop { 0%{transform:scale(0);opacity:0} 60%{transform:scale(1.2)} 100%{transform:scale(1);opacity:1} }
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
        .auth-submit:active:not(:disabled) { transform: translateY(0); }
        .auth-submit:disabled { opacity: 0.3; cursor: not-allowed; }
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
          bottom: -2px; left: 0;
          width: 0; height: 1px;
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
        .strength-bar {
          height: 3px;
          border-radius: 3px;
          transition: all 0.5s cubic-bezier(0.16,1,0.3,1);
        }
      `}</style>

      {/* Grid lines */}
      <div style={{
        position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0,
        backgroundImage: "linear-gradient(rgba(255,255,255,0.025) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.025) 1px,transparent 1px)",
        backgroundSize: "64px 64px",
      }} />

      {/* Glow orbs */}
      <div style={{ position: "fixed", inset: 0, overflow: "hidden", pointerEvents: "none", zIndex: 0 }}>
        <div className="float-a" style={{ position: "absolute", top: "5%", right: "15%", width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,255,255,0.04) 0%, transparent 70%)", filter: "blur(40px)" }} />
        <div className="float-b" style={{ position: "absolute", bottom: "15%", left: "10%", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,255,255,0.03) 0%, transparent 70%)", filter: "blur(40px)" }} />
      </div>

      {/* Big BG text */}
      <div style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%,-50%)", fontFamily: "var(--font-display)", fontSize: "clamp(80px,20vw,280px)", fontWeight: 900, color: "rgba(255,255,255,0.015)", letterSpacing: "-8px", whiteSpace: "nowrap", pointerEvents: "none", userSelect: "none", lineHeight: 1, zIndex: 0 }}>
        JOIN
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

      <Link href="/login" style={{
        position: "fixed", top: 32, right: 48, zIndex: 100,
        fontSize: 13, fontWeight: 500, color: "rgba(255,255,255,0.45)",
        textDecoration: "none", letterSpacing: "0.05em",
        opacity: visible ? 1 : 0,
        transition: `opacity 0.8s ${ease}`,
        transitionDelay: "200ms",
      }}>
        Already have an account? <span style={{ color: "white", fontWeight: 700 }}>Sign In →</span>
      </Link>

      {/* Auth Card */}
      <div className="auth-card" style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(30px)",
        transition: `opacity 0.9s ${ease}, transform 0.9s ${ease}`,
        transitionDelay: "200ms",
        margin: "40px 20px",
      }}>
        {/* Top light bar */}
        <div style={{ position: "absolute", top: -1, left: 40, right: 40, height: 1, background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)" }} />

        {!success ? (
          <>
            <div style={{ marginBottom: 36 }}>
              <div style={{
                fontSize: 11, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase" as const,
                color: "rgba(255,255,255,0.3)", display: "flex", alignItems: "center", gap: 12, marginBottom: 20,
              }}>
                <span style={{ display: "inline-block", width: 24, height: 1, background: "rgba(255,255,255,0.3)" }} />
                Get started
              </div>
              <h1 style={{ fontFamily: "var(--font-display)", fontSize: 36, fontWeight: 900, letterSpacing: "-1.5px", lineHeight: 1, marginBottom: 12 }}>
                Create account.
              </h1>
              <p style={{ fontSize: 15, color: "rgba(255,255,255,0.35)", lineHeight: 1.6 }}>
                Build resumes, practice interviews, and land your dream job.
              </p>
            </div>

            <form onSubmit={handleSignUp} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <div style={{
                opacity: visible ? 1 : 0,
                transform: visible ? "translateX(0)" : "translateX(-20px)",
                transition: `all 0.7s ${ease}`,
                transitionDelay: "350ms",
              }}>
                <label className={`field-label ${focusedField === "name" ? "active" : ""}`}>Full Name</label>
                <input
                  id="signup-name"
                  type="text"
                  className="auth-input"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onFocus={() => setFocusedField("name")}
                  onBlur={() => setFocusedField(null)}
                  autoComplete="name"
                />
              </div>

              <div style={{
                opacity: visible ? 1 : 0,
                transform: visible ? "translateX(0)" : "translateX(-20px)",
                transition: `all 0.7s ${ease}`,
                transitionDelay: "450ms",
              }}>
                <label className={`field-label ${focusedField === "email" ? "active" : ""}`}>Email Address</label>
                <input
                  id="signup-email"
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
                transitionDelay: "550ms",
              }}>
                <label className={`field-label ${focusedField === "password" ? "active" : ""}`}>Password</label>
                <input
                  id="signup-password"
                  type="password"
                  className="auth-input"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocusedField("password")}
                  onBlur={() => setFocusedField(null)}
                  autoComplete="new-password"
                />
                {/* Password strength indicator */}
                {password && (
                  <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ flex: 1, display: "flex", gap: 4 }}>
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="strength-bar" style={{
                          flex: 1,
                          background: i <= passwordStrength.level ? passwordStrength.color : "rgba(255,255,255,0.06)",
                        }} />
                      ))}
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 600, color: passwordStrength.color, letterSpacing: "0.05em" }}>
                      {passwordStrength.label}
                    </span>
                  </div>
                )}
              </div>

              <div style={{
                opacity: visible ? 1 : 0,
                transform: visible ? "translateX(0)" : "translateX(-20px)",
                transition: `all 0.7s ${ease}`,
                transitionDelay: "650ms",
              }}>
                <label className={`field-label ${focusedField === "confirm" ? "active" : ""}`}>Confirm Password</label>
                <input
                  id="signup-confirm"
                  type="password"
                  className="auth-input"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  onFocus={() => setFocusedField("confirm")}
                  onBlur={() => setFocusedField(null)}
                  autoComplete="new-password"
                  style={confirmPassword && confirmPassword !== password ? { borderColor: "rgba(255,100,100,0.3)" } : {}}
                />
                {confirmPassword && confirmPassword !== password && (
                  <p style={{ fontSize: 12, color: "rgba(255,100,100,0.7)", marginTop: 6 }}>Passwords don&apos;t match</p>
                )}
              </div>

              {message && !success && (
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
                transitionDelay: "750ms",
              }}>
                <button
                  id="signup-submit"
                  type="submit"
                  className="auth-submit"
                  disabled={loading || !email || !password || !confirmPassword || password !== confirmPassword}
                >
                  {loading ? (
                    <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
                      <span style={{
                        width: 16, height: 16, border: "2px solid rgba(0,0,0,0.2)",
                        borderTopColor: "black", borderRadius: "50%",
                        animation: "spin-slow 0.6s linear infinite", display: "inline-block",
                      }} />
                      Creating account...
                    </span>
                  ) : (
                    <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
                      Create Account <span>→</span>
                    </span>
                  )}
                </button>
              </div>
            </form>

            <div style={{
              marginTop: 28,
              paddingTop: 20,
              borderTop: "1px solid rgba(255,255,255,0.06)",
              textAlign: "center" as const,
              fontSize: 14,
              color: "rgba(255,255,255,0.3)",
              opacity: visible ? 1 : 0,
              transition: `opacity 0.7s ${ease}`,
              transitionDelay: "800ms",
            }}>
              Already have an account?{" "}
              <Link href="/login" className="auth-link">
                Sign in
              </Link>
            </div>
          </>
        ) : (
          /* Success state */
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <div style={{
              width: 80, height: 80,
              borderRadius: "50%",
              border: "2px solid rgba(100,255,150,0.3)",
              background: "rgba(100,255,150,0.05)",
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 28px",
              animation: "checkPop 0.6s cubic-bezier(0.34,1.56,0.64,1) forwards",
            }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="rgba(100,255,150,0.8)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 900, letterSpacing: "-1px", marginBottom: 12 }}>
              You&apos;re in!
            </h2>
            <p style={{ fontSize: 15, color: "rgba(255,255,255,0.4)", lineHeight: 1.7, marginBottom: 32 }}>
              Check your email to confirm your account,<br />then sign in to get started.
            </p>
            <Link href="/login" className="mag-btn mag-btn-filled" style={{ display: "inline-flex" }}>
              <span>Go to Sign In</span>
              <span>→</span>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
