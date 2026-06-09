"use client";

import { useState } from "react";

const prayerStyles = [
  { id: "peace",      label: "Peace & Calm",       icon: "🌙" },
  { id: "protection", label: "Protection",          icon: "🛡" },
  { id: "gratitude",  label: "Gratitude",           icon: "✦" },
  { id: "healing",    label: "Healing",             icon: "🕊" },
  { id: "strength",   label: "Strength & Courage",  icon: "⚡" },
  { id: "family",     label: "Family & Loved Ones", icon: "♡" },
];

const tones = [
  { id: "gentle",     label: "Gentle & Soft"    },
  { id: "hopeful",    label: "Hopeful & Uplifting" },
  { id: "scriptural", label: "Scriptural"        },
  { id: "simple",     label: "Short & Simple"    },
];

const bedtimes = [
  "7:00 PM","7:30 PM","8:00 PM","8:30 PM",
  "9:00 PM","9:30 PM","10:00 PM","10:30 PM","11:00 PM",
];

const timezones = [
  "Eastern Time (ET)",
  "Central Time (CT)",
  "Mountain Time (MT)",
  "Pacific Time (PT)",
  "GMT / UTC",
  "Central European Time (CET)",
  "Other",
];

const features = [
  "One personal prayer every night",
  "Delivered at your chosen bedtime",
  "Choose your prayer theme",
  "Peaceful, elegant email design",
  "Cancel anytime",
];

function fmtCard(v: string) {
  return v.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();
}
function fmtExpiry(v: string) {
  const d = v.replace(/\D/g, "").slice(0, 4);
  return d.length >= 3 ? d.slice(0, 2) + " / " + d.slice(2) : d;
}

export default function CheckoutForm() {
  const [step, setStep]         = useState<1 | 2>(1);
  const [loading, setLoading]   = useState(false);
  const [apiError, setApiError] = useState("");

  const [form, setForm] = useState({
    firstName:    "",
    email:        "",
    deliveryTime: "9:00 PM",
    timezone:     "Eastern Time (ET)",
    prayerFocus:  "peace",
    tone:         "gentle",
  });

  // Card state (UI only — Stripe handles real card capture)
  const [payMethod, setPayMethod] = useState<"card" | "apple" | "google" | null>(null);
  const [card, setCard] = useState({ number: "", expiry: "", cvv: "", holder: "" });

  const set  = (k: keyof typeof form, v: string) => setForm(f => ({ ...f, [k]: v }));
  const setC = (k: keyof typeof card, v: string) => setCard(c => ({ ...c, [k]: v }));

  const cardReady =
    card.number.replace(/\s/g, "").length === 16 &&
    card.expiry.length >= 7 &&
    card.cvv.length >= 3 &&
    card.holder.trim().length > 1;

  const canSubmit =
    payMethod === "apple" ||
    payMethod === "google" ||
    (payMethod === "card" && cardReady);

  // ── Step 1 submit ──────────────────────────────────
  const handleStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(2);
  };

  // ── Step 2 submit → call API → redirect to Stripe ──
  const handleStep2 = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    setLoading(true);
    setApiError("");

    try {
      const res = await fetch("/api/create-checkout-session", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName:    form.firstName,
          email:        form.email,
          deliveryTime: form.deliveryTime,
          timezone:     form.timezone,
          prayerFocus:  form.prayerFocus,
          tone:         form.tone,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.url) {
        throw new Error(data.error || "Something went wrong.");
      }

      window.location.href = data.url;
    } catch (err: unknown) {
      setApiError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: 1000 }}>

      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: 52 }}>
        <p style={{ fontSize: "0.68rem", fontWeight: 400, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--gold)", marginBottom: 16 }}>
          {step === 1 ? "Step 1 of 2 — Your details" : "Step 2 of 2 — Prayer & payment"}
        </p>
        <h1
          className="font-display"
          style={{ fontSize: "clamp(1.8rem, 3.5vw, 2.6rem)", fontWeight: 400, fontStyle: "italic", color: "var(--cream)", lineHeight: 1.2 }}
        >
          {step === 1 ? "Begin your nightly peace." : "Personalise & pay."}
        </h1>

        {/* Progress bar */}
        <div style={{ maxWidth: 280, margin: "28px auto 0", height: 1, background: "rgba(201,169,110,0.12)", borderRadius: 1 }}>
          <div style={{ width: step === 1 ? "50%" : "100%", height: "100%", background: "linear-gradient(to right, var(--gold-dim), var(--gold))", borderRadius: 1, transition: "width 0.5s ease" }} />
        </div>
      </div>

      <div className="checkout-grid">

        {/* ── Left: Form ── */}
        {step === 1 ? (
          <form onSubmit={handleStep1} style={{ display: "flex", flexDirection: "column", gap: 22 }}>
            <Field label="First name">
              <input
                type="text" required
                placeholder="Your first name"
                value={form.firstName}
                onChange={e => set("firstName", e.target.value)}
              />
            </Field>

            <Field label="Email address">
              <input
                type="email" required
                placeholder="your@email.com"
                value={form.email}
                onChange={e => set("email", e.target.value)}
              />
            </Field>

            <div className="time-grid">
              <Field label="Deliver my prayer at">
                <select value={form.deliveryTime} onChange={e => set("deliveryTime", e.target.value)}>
                  {bedtimes.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </Field>

              <Field label="Timezone">
                <select value={form.timezone} onChange={e => set("timezone", e.target.value)}>
                  {timezones.map(tz => <option key={tz} value={tz}>{tz}</option>)}
                </select>
              </Field>
            </div>

            <button
              type="submit"
              className="btn-gold"
              style={{ marginTop: 8, width: "100%", justifyContent: "center" }}
            >
              Continue →
            </button>

            <p style={{ textAlign: "center", fontSize: "0.75rem", color: "var(--muted)", fontWeight: 300 }}>
              No payment required yet.
            </p>
          </form>

        ) : (
          <form onSubmit={handleStep2} style={{ display: "flex", flexDirection: "column", gap: 24 }}>

            {/* Prayer focus */}
            <div>
              <p style={{ fontSize: "0.72rem", fontWeight: 400, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--gold)", marginBottom: 14 }}>
                Prayer focus
              </p>
              <div className="style-grid">
                {prayerStyles.map(s => (
                  <button
                    type="button" key={s.id}
                    onClick={() => set("prayerFocus", s.id)}
                    style={{ padding: "15px 10px", border: form.prayerFocus === s.id ? "1px solid rgba(201,169,110,0.55)" : "1px solid rgba(201,169,110,0.12)", borderRadius: 10, background: form.prayerFocus === s.id ? "rgba(201,169,110,0.09)" : "rgba(14,28,50,0.5)", cursor: "pointer", textAlign: "center", transition: "all 0.2s", display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}
                  >
                    <span style={{ fontSize: "1.1rem", lineHeight: 1 }}>{s.icon}</span>
                    <span style={{ fontSize: "0.74rem", fontWeight: form.prayerFocus === s.id ? 400 : 300, color: form.prayerFocus === s.id ? "var(--gold)" : "rgba(240,232,216,0.5)", lineHeight: 1.3 }}>{s.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Tone */}
            <div>
              <p style={{ fontSize: "0.72rem", fontWeight: 400, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--gold)", marginBottom: 14 }}>
                Prayer tone
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {tones.map(t => (
                  <button
                    type="button" key={t.id}
                    onClick={() => set("tone", t.id)}
                    style={{ padding: "13px 16px", border: form.tone === t.id ? "1px solid rgba(201,169,110,0.55)" : "1px solid rgba(201,169,110,0.12)", borderRadius: 8, background: form.tone === t.id ? "rgba(201,169,110,0.09)" : "rgba(14,28,50,0.5)", cursor: "pointer", transition: "all 0.2s", textAlign: "left" }}
                  >
                    <span style={{ fontSize: "0.82rem", fontWeight: form.tone === t.id ? 400 : 300, color: form.tone === t.id ? "var(--gold)" : "rgba(240,232,216,0.5)" }}>{t.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div style={{ height: 1, background: "rgba(201,169,110,0.1)" }} />

            {/* Payment */}
            <div>
              <p style={{ fontSize: "0.72rem", fontWeight: 400, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--gold)", marginBottom: 14 }}>
                Payment method
              </p>

              {/* Express options */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
                {[
                  { id: "apple",  label: " Apple Pay" },
                  { id: "google", label: "G  Google Pay" },
                ].map(p => (
                  <button
                    type="button" key={p.id}
                    onClick={() => setPayMethod(p.id as "apple" | "google")}
                    style={{ padding: "12px", borderRadius: 8, border: payMethod === p.id ? "1px solid rgba(201,169,110,0.55)" : "1px solid rgba(255,255,255,0.1)", background: payMethod === p.id ? "rgba(201,169,110,0.09)" : "rgba(255,255,255,0.04)", cursor: "pointer", color: payMethod === p.id ? "var(--cream)" : "rgba(240,232,216,0.5)", fontSize: "0.82rem", fontWeight: 400, letterSpacing: "0.02em", transition: "all 0.2s", fontFamily: "var(--font-jost), sans-serif" }}
                  >
                    {p.label}
                  </button>
                ))}
              </div>

              {/* Or divider */}
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
                <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.07)" }} />
                <span style={{ fontSize: "0.72rem", color: "var(--muted)", fontWeight: 300 }}>or pay with card</span>
                <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.07)" }} />
              </div>

              {/* Card fields */}
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }} onClick={() => { if (payMethod !== "card") setPayMethod("card"); }}>
                <div style={{ position: "relative" }}>
                  <input
                    placeholder="Card number"
                    value={card.number}
                    onChange={e => { setC("number", fmtCard(e.target.value)); setPayMethod("card"); }}
                    inputMode="numeric"
                    style={{ letterSpacing: card.number ? "0.1em" : "normal", paddingRight: 48 }}
                  />
                  <span style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", fontSize: "1rem", opacity: 0.4 }}>💳</span>
                </div>
                <div className="card-row">
                  <input placeholder="MM / YY" value={card.expiry} onChange={e => { setC("expiry", fmtExpiry(e.target.value)); setPayMethod("card"); }} inputMode="numeric" />
                  <input placeholder="CVV" value={card.cvv} onChange={e => { setC("cvv", e.target.value.replace(/\D/g,"").slice(0,4)); setPayMethod("card"); }} inputMode="numeric" type="password" />
                </div>
                <input placeholder="Name on card" value={card.holder} onChange={e => { setC("holder", e.target.value); setPayMethod("card"); }} />
              </div>
            </div>

            {/* Order summary */}
            <div style={{ padding: "18px 22px", background: "rgba(14,28,50,0.6)", border: "1px solid rgba(201,169,110,0.12)", borderRadius: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <span style={{ fontSize: "0.88rem", color: "rgba(240,232,216,0.7)", fontWeight: 300 }}>Nightly Prayer</span>
                <span className="font-display" style={{ fontSize: "1.05rem", color: "var(--cream)", fontWeight: 500 }}>$5.99<span style={{ fontSize: "0.72rem", color: "var(--muted)", fontWeight: 300 }}>/mo</span></span>
              </div>
              <div style={{ height: 1, background: "rgba(201,169,110,0.08)", margin: "10px 0" }} />
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: "0.78rem", color: "var(--muted)", fontWeight: 300 }}>Delivered at</span>
                <span style={{ fontSize: "0.78rem", color: "rgba(240,232,216,0.6)", fontWeight: 300 }}>{form.deliveryTime} · {prayerStyles.find(s => s.id === form.prayerFocus)?.label}</span>
              </div>
            </div>

            {/* Error */}
            {apiError && (
              <p style={{ textAlign: "center", fontSize: "0.82rem", color: "#e08080", fontWeight: 300, padding: "12px 16px", background: "rgba(200,80,80,0.08)", border: "1px solid rgba(200,80,80,0.2)", borderRadius: 8 }}>
                {apiError}
              </p>
            )}

            {/* Actions */}
            <div className="action-row">
              <button
                type="button"
                onClick={() => { setStep(1); setApiError(""); }}
                className="back-btn"
                style={{ padding: "15px 22px", background: "transparent", border: "1px solid rgba(201,169,110,0.18)", borderRadius: 2, cursor: "pointer", color: "var(--muted)", fontSize: "0.78rem", letterSpacing: "0.06em", flexShrink: 0, fontFamily: "var(--font-jost), sans-serif" }}
              >
                ← Back
              </button>

              <button
                type="submit"
                disabled={!canSubmit || loading}
                style={{
                  flex: 1, padding: "15px", border: "none", borderRadius: 2,
                  cursor: canSubmit && !loading ? "pointer" : "not-allowed",
                  fontFamily: "var(--font-jost), sans-serif",
                  fontSize: "0.75rem", fontWeight: 500, letterSpacing: "0.12em", textTransform: "uppercase",
                  transition: "all 0.35s ease",
                  background: canSubmit && !loading
                    ? "linear-gradient(135deg, #c9a96e 0%, #a07840 100%)"
                    : "rgba(255,255,255,0.06)",
                  color: canSubmit && !loading ? "#0d1b2a" : "rgba(240,232,216,0.2)",
                  boxShadow: canSubmit && !loading ? "0 4px 24px rgba(201,169,110,0.35)" : "none",
                }}
              >
                {loading ? "Opening checkout…" : canSubmit ? "Start My Nightly Prayer" : "Enter payment to continue"}
              </button>
            </div>

            <p style={{ textAlign: "center", fontSize: "0.73rem", color: "var(--muted)", fontWeight: 300 }}>
              🔒 Secure & encrypted · Powered by Stripe · Cancel anytime
            </p>
          </form>
        )}

        {/* ── Right: Plan summary ── */}
        <aside>
          <div className="pricing-card" style={{ padding: "32px 28px" }}>
            <p style={{ fontSize: "0.68rem", fontWeight: 400, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--gold)", marginBottom: 20 }}>
              What you'll receive
            </p>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 4, marginBottom: 6 }}>
              <span className="font-display" style={{ fontSize: "0.95rem", color: "var(--cream)", alignSelf: "flex-start", marginTop: 6 }}>$</span>
              <span className="font-display text-gold" style={{ fontSize: "3.6rem", fontWeight: 500, lineHeight: 1 }}>5.99</span>
              <span style={{ fontSize: "0.82rem", color: "var(--muted)", fontWeight: 300, marginBottom: 8 }}>/month</span>
            </div>
            <p style={{ fontSize: "0.78rem", color: "rgba(240,232,216,0.35)", fontWeight: 300, marginBottom: 28 }}>
              Billed monthly · Cancel anytime
            </p>
            <div style={{ height: 1, background: "rgba(201,169,110,0.1)", marginBottom: 24 }} />
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {features.map(f => (
                <div key={f} className="check-row">
                  <span className="check-icon">✓</span>
                  {f}
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>

      <style>{`
        /* ── Layout ── */
        .checkout-grid {
          display: grid;
          grid-template-columns: 1fr 320px;
          gap: 48px;
          align-items: start;
        }
        @media (max-width: 860px) {
          .checkout-grid { grid-template-columns: 1fr; gap: 32px; }
        }

        /* ── Inputs — font-size 16px prevents iOS zoom-in on focus ── */
        input, select {
          width: 100%;
          padding: 14px 18px;
          background: rgba(14,28,50,0.7);
          border: 1px solid rgba(201,169,110,0.18);
          border-radius: 6px;
          color: var(--cream);
          font-family: var(--font-jost), sans-serif;
          font-size: 1rem;
          font-weight: 300;
          outline: none;
          transition: border-color 0.2s, background 0.2s;
          appearance: none;
          -webkit-appearance: none;
        }
        input::placeholder { color: rgba(90,122,150,0.5); }
        input:focus, select:focus { border-color: rgba(201,169,110,0.45); background: rgba(14,28,50,0.95); }
        select {
          cursor: pointer;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%23c9a96e' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 16px center;
          padding-right: 40px;
        }
        option { background: #0c1c32; color: #f0e8d8; }

        /* ── Grids ── */
        .style-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
        .tone-grid  { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
        .time-grid  { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        .card-row   { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
        .action-row { display: flex; gap: 12px; }

        /* ── Mobile ── */
        @media (max-width: 500px) {
          .style-grid { grid-template-columns: 1fr 1fr; }
          .time-grid  { grid-template-columns: 1fr; gap: 14px; }
          .action-row { flex-direction: column; }
          .back-btn   { width: 100% !important; text-align: center; }
        }
      `}</style>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <label style={{ fontSize: "0.72rem", fontWeight: 400, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(201,169,110,0.7)" }}>
        {label}
      </label>
      {children}
    </div>
  );
}
