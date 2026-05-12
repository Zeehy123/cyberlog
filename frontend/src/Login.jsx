import { useState } from "react";

// Login.jsx
// Simple demo login screen used by the frontend. This component only
// simulates authentication (no backend call) and triggers `onLogin`
// when a non-empty email/password are submitted.

const MONO = "'JetBrains Mono', 'Fira Mono', monospace";

const SCAN_LINES = Array.from({ length: 6 }, (_, i) => i);

export default function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPass, setShowPass] = useState(false);

  // Simulated submit handler: waits briefly then calls `onLogin`
  // when credentials are present. Intended for UX/demo only.
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1400));
    if (email && password) {
      onLogin?.();
    } else {
      setError("ACCESS DENIED — invalid credentials");
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#000",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: MONO,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Grid background */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          backgroundImage:
            "linear-gradient(rgba(55,138,221,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(55,138,221,0.04) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* Corner accents */}
      {[
        {
          top: 24,
          left: 24,
          borderTop: "1px solid #222",
          borderLeft: "1px solid #222",
        },
        {
          top: 24,
          right: 24,
          borderTop: "1px solid #222",
          borderRight: "1px solid #222",
        },
        {
          bottom: 24,
          left: 24,
          borderBottom: "1px solid #222",
          borderLeft: "1px solid #222",
        },
        {
          bottom: 24,
          right: 24,
          borderBottom: "1px solid #222",
          borderRight: "1px solid #222",
        },
      ].map((s, i) => (
        <div
          key={i}
          style={{ position: "absolute", width: 32, height: 32, ...s }}
        />
      ))}

      {/* Scan line */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          height: 1,
          background: "rgba(55,138,221,0.12)",
          animation: "scanline 6s linear infinite",
          pointerEvents: "none",
        }}
      />

      {/* Card */}
      <div
        style={{
          width: 420,
          background: "#0a0a0a",
          border: "1px solid #1e1e1e",
          borderRadius: 20,
          padding: "40px 40px 36px",
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* Logo / brand */}
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: 52,
              height: 52,
              borderRadius: 14,
              background: "#0d1f33",
              border: "1px solid #185fa5",
              marginBottom: 18,
            }}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#378add"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              <path d="M9 12l2 2 4-4" />
            </svg>
          </div>
          <h1
            style={{
              fontSize: 22,
              fontWeight: 700,
              color: "#fff",
              margin: "0 0 4px",
              letterSpacing: "-0.3px",
            }}
          >
            CyberLog AI
          </h1>
          <p
            style={{
              fontSize: 10,
              color: "#444",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
            }}
          >
            Security Monitoring Platform
          </p>
        </div>

        {/* Status bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "#111",
            border: "1px solid #1a1a1a",
            borderRadius: 8,
            padding: "8px 14px",
            marginBottom: 28,
          }}
        >
          <span
            style={{ fontSize: 10, color: "#444", letterSpacing: "0.08em" }}
          >
            SYSTEM STATUS
          </span>
          <span
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              fontSize: 10,
              color: "#639922",
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: "#639922",
                display: "inline-block",
                animation: "pulse 2s ease-in-out infinite",
              }}
            />
            OPERATIONAL
          </span>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", flexDirection: "column", gap: 14 }}
        >
          {/* Email */}
          <div>
            <label
              style={{
                fontSize: 9,
                color: "#555",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                display: "block",
                marginBottom: 6,
              }}
            >
              Operator ID
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="operator@corp.internal"
              autoComplete="username"
              style={{
                width: "100%",
                background: "#111",
                border: "1px solid #222",
                borderRadius: 10,
                padding: "11px 14px",
                color: "#fff",
                fontFamily: MONO,
                fontSize: 12,
                outline: "none",
                transition: "border-color 0.15s",
              }}
              onFocus={(e) => (e.target.style.borderColor = "#185fa5")}
              onBlur={(e) => (e.target.style.borderColor = "#222")}
            />
          </div>

          {/* Password */}
          <div>
            <label
              style={{
                fontSize: 9,
                color: "#555",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                display: "block",
                marginBottom: 6,
              }}
            >
              Auth Token
            </label>
            <div style={{ position: "relative" }}>
              <input
                type={showPass ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                autoComplete="current-password"
                style={{
                  width: "100%",
                  background: "#111",
                  border: "1px solid #222",
                  borderRadius: 10,
                  padding: "11px 44px 11px 14px",
                  color: "#fff",
                  fontFamily: MONO,
                  fontSize: 12,
                  outline: "none",
                  transition: "border-color 0.15s",
                }}
                onFocus={(e) => (e.target.style.borderColor = "#185fa5")}
                onBlur={(e) => (e.target.style.borderColor = "#222")}
              />
              <button
                type="button"
                onClick={() => setShowPass((v) => !v)}
                style={{
                  position: "absolute",
                  right: 12,
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: 0,
                  color: "#444",
                }}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  {showPass ? (
                    <>
                      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" />
                      <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </>
                  ) : (
                    <>
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </>
                  )}
                </svg>
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div
              style={{
                background: "rgba(226,75,74,0.1)",
                border: "1px solid rgba(226,75,74,0.25)",
                borderRadius: 8,
                padding: "9px 12px",
                fontSize: 10,
                color: "#e24b4a",
                letterSpacing: "0.05em",
              }}
            >
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: 6,
              width: "100%",
              background: loading ? "#0d1f33" : "#0f3460",
              border: `1px solid ${loading ? "#185fa5" : "#185fa5"}`,
              borderRadius: 10,
              padding: "12px",
              color: loading ? "#378add" : "#85b7eb",
              fontFamily: MONO,
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              cursor: loading ? "not-allowed" : "pointer",
              transition: "background 0.15s, color 0.15s",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
            }}
            onMouseEnter={(e) => {
              if (!loading) e.currentTarget.style.background = "#12407a";
            }}
            onMouseLeave={(e) => {
              if (!loading) e.currentTarget.style.background = "#0f3460";
            }}
          >
            {loading ? (
              <>
                <span
                  style={{
                    width: 12,
                    height: 12,
                    border: "1.5px solid #378add",
                    borderTopColor: "transparent",
                    borderRadius: "50%",
                    display: "inline-block",
                    animation: "spin 0.7s linear infinite",
                  }}
                />
                Authenticating...
              </>
            ) : (
              "Authenticate →"
            )}
          </button>
        </form>

        {/* Footer */}
        <div
          style={{
            marginTop: 28,
            paddingTop: 20,
            borderTop: "1px solid #151515",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span style={{ fontSize: 9, color: "#333", letterSpacing: "0.06em" }}>
            CYBERLOG v2.4.1 — PROD
          </span>
          <span style={{ fontSize: 9, color: "#333", letterSpacing: "0.06em" }}>
            TLS 1.3 ENCRYPTED
          </span>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&display=swap');
        * { box-sizing: border-box; }
        body { margin: 0; background: #000; }
        input::placeholder { color: #333; }
        input:-webkit-autofill {
          -webkit-box-shadow: 0 0 0 100px #111 inset;
          -webkit-text-fill-color: #fff;
        }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes scanline {
          0%   { top: -2px; opacity: 0; }
          10%  { opacity: 1; }
          90%  { opacity: 1; }
          100% { top: 100vh; opacity: 0; }
        }
      `}</style>
    </div>
  );
}
