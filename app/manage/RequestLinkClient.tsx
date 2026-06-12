"use client";

import { useState } from "react";

/**
 * Shown when /manage is opened without a (valid) token.
 * Lets the subscriber request their private manage link by email.
 */
export default function RequestLinkClient({ expired = false }: { expired?: boolean }) {
  const [email,   setEmail]   = useState("");
  const [loading, setLoading] = useState(false);
  const [sent,    setSent]    = useState(false);
  const [error,   setError]   = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res  = await fetch("/api/send-manage-link", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong.");
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ textAlign: "center", maxWidth: 520, width: "100%" }}>
      <p
        style={{
          fontSize:      "0.68rem",
          fontWeight:    400,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          color:         "var(--gold)",
          marginBottom:  20,
        }}
      >
        Manage Subscription
      </p>

      {sent ? (
        <>
          <h1 className="font-display" style={headingStyle}>Check your inbox.</h1>
          <p style={bodyStyle}>
            If <strong style={{ color: "var(--navy-text)", fontWeight: 400 }}>{email}</strong>{" "}
            has a subscription, we&rsquo;ve sent your private manage link. It usually arrives
            within a minute — check spam if you don&rsquo;t see it.
          </p>
        </>
      ) : (
        <>
          <h1 className="font-display" style={headingStyle}>
            {expired ? "That link has expired." : "Manage your subscription."}
          </h1>
          <p style={{ ...bodyStyle, marginBottom: 36 }}>
            Enter the email you subscribed with and we&rsquo;ll send you a private link to change
            your prayer settings, pause emails, or cancel.
          </p>

          <form onSubmit={handleSubmit} style={{ maxWidth: 400, margin: "0 auto" }}>
            <input
              className="form-input"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              aria-label="Email address"
              style={{
                background:    "rgba(255,255,255,0.82)",
                border:        "1px solid rgba(16,42,67,0.12)",
                borderRadius:  4,
                color:         "var(--navy-text)",
                fontSize:      "1rem",
                fontWeight:    300,
                padding:       "14px 16px",
                width:         "100%",
                outline:       "none",
                marginBottom:  16,
              }}
            />
            <button
              type="submit"
              className="btn-gold"
              disabled={loading}
              style={{
                width:   "100%",
                border:  "none",
                cursor:  loading ? "default" : "pointer",
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? "Sending…" : "Email Me My Manage Link"}
            </button>
            {error && (
              <p style={{ marginTop: 14, fontSize: "0.82rem", color: "#e07070", fontWeight: 300 }}>
                {error}
              </p>
            )}
          </form>
        </>
      )}
    </div>
  );
}

const headingStyle: React.CSSProperties = {
  fontSize:     "clamp(1.6rem, 4vw, 2.4rem)",
  fontWeight:   400,
  fontStyle:    "italic",
  color:        "var(--navy-text)",
  lineHeight:   1.2,
  marginBottom: 20,
};

const bodyStyle: React.CSSProperties = {
  fontSize:   "1rem",
  fontWeight: 300,
  lineHeight: 1.85,
  color:      "var(--secondary-text)",
};
