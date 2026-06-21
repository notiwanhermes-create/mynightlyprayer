"use client";

import { useState } from "react";

const TIMEZONES = [
  { value: "America/New_York",    label: "Eastern Time (ET)" },
  { value: "America/Chicago",     label: "Central Time (CT)" },
  { value: "America/Denver",      label: "Mountain Time (MT)" },
  { value: "America/Los_Angeles", label: "Pacific Time (PT)" },
  { value: "America/Phoenix",     label: "Arizona (AZ)" },
  { value: "America/Anchorage",   label: "Alaska (AK)" },
  { value: "Pacific/Honolulu",    label: "Hawaii (HI)" },
  { value: "America/Toronto",     label: "Toronto / EST" },
  { value: "America/Vancouver",   label: "Vancouver / PST" },
  { value: "Europe/London",       label: "London (GMT/BST)" },
  { value: "Europe/Paris",        label: "Paris / Berlin (CET)" },
  { value: "Australia/Sydney",    label: "Sydney (AEST)" },
] as const;

const PLAN_CONFIG = {
  email: {
    label: "Email Prayer",
    price: "$5.99",
    bullets: [
      "Delivered to your inbox",
      "Best for longer prayers",
      "Easy to save and reread",
      "Cancel anytime",
    ],
  },
  sms: {
    label: "SMS Prayer",
    price: "$9.99",
    bullets: [
      "Delivered to your phone",
      "Short peaceful nightly prayer",
      "Perfect right before sleep",
      "Cancel anytime",
    ],
  },
} as const;

const TIMES = [
  { value: "20:00", label: "8:00 PM" },
  { value: "20:30", label: "8:30 PM" },
  { value: "21:00", label: "9:00 PM" },
  { value: "21:30", label: "9:30 PM" },
  { value: "22:00", label: "10:00 PM" },
  { value: "22:30", label: "10:30 PM" },
  { value: "23:00", label: "11:00 PM" },
];

const TONES = [
  { value: "gentle",       label: "Gentle & Peaceful" },
  { value: "traditional",  label: "Traditional" },
  { value: "contemporary", label: "Contemporary" },
  { value: "scripture",    label: "Scripture-based" },
];

type Plan = keyof typeof PLAN_CONFIG;

export default function HomeClient() {
  const [plan, setPlan] = useState<Plan>("email");
  const [form, setForm] = useState({
    firstName: "",
    email: "",
    phoneNumber: "",
    deliveryTime: "22:00",
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "America/New_York",
    prayerFocus: "",
    tone: "gentle",
    smsConsent: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const set = (k: string, v: string | boolean) =>
    setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (plan === "sms" && !form.smsConsent) {
      setError("Please agree to receive SMS messages to continue.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan,
          firstName: form.firstName,
          email: plan === "email" ? form.email : "",
          phoneNumber: plan === "sms" ? form.phoneNumber : "",
          deliveryTime: form.deliveryTime,
          timezone: form.timezone,
          prayerFocus: form.prayerFocus,
          tone: form.tone,
          smsConsent: form.smsConsent,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.url) throw new Error(data.error || "Something went wrong.");
      window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        html, body { background: #EEEEF6 !important; }
        .stars { display: none !important; }

        /* ── page wrapper ── */
        .np-page { background: #EEEEF6; min-height: 100vh; }

        /* ── container ── */
        .np-con {
          max-width: 1160px;
          margin: 0 auto;
          padding: 0 48px;
        }
        @media (max-width: 768px) { .np-con { padding: 0 20px; } }

        /* ──────────────────────────────────────────
           HERO
        ────────────────────────────────────────── */
        .np-hero {
          padding: 96px 0 56px;
        }
        @media (max-width: 900px) { .np-hero { padding: 80px 0 40px; } }

        .np-hero-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 56px;
          align-items: center;
        }
        @media (max-width: 900px) {
          .np-hero-grid { grid-template-columns: 1fr; gap: 40px; }
        }

        /* badge */
        .np-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          border: 1px solid rgba(108,142,245,0.32);
          border-radius: 100px;
          padding: 5px 14px;
          font-size: 0.68rem;
          font-weight: 500;
          letter-spacing: 0.1em;
          color: #5573D4;
          margin-bottom: 20px;
          background: rgba(108,142,245,0.07);
        }

        /* headline */
        .np-h1 {
          font-family: var(--font-jost), 'Jost', sans-serif;
          font-size: clamp(2.6rem, 5vw, 3.9rem);
          font-weight: 700;
          line-height: 1.1;
          color: #111827;
          letter-spacing: -0.025em;
          margin-bottom: 18px;
        }
        .np-h1-accent {
          font-family: var(--font-display), 'Playfair Display', serif;
          font-style: italic;
          font-weight: 400;
          background: linear-gradient(135deg, #6C8EF5 0%, #9B7FEA 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        /* sub */
        .np-sub {
          font-size: 0.98rem;
          font-weight: 300;
          color: #6B7280;
          line-height: 1.7;
          max-width: 400px;
          margin-bottom: 36px;
        }

        /* features grid */
        .np-features {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 18px 28px;
        }
        .np-feat {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .np-feat-icon {
          width: 34px;
          height: 34px;
          border-radius: 9px;
          background: rgba(108,142,245,0.1);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 2px;
          color: #6C8EF5;
          font-size: 0.9rem;
        }
        .np-feat-label {
          font-size: 0.8rem;
          font-weight: 400;
          color: #6B7280;
          line-height: 1.4;
        }

        /* ──────────────────────────────────────────
           DARK PRAYER CARD
        ────────────────────────────────────────── */
        .np-dark-card {
          background: linear-gradient(155deg, #0E1D4A 0%, #060D28 100%);
          border-radius: 22px;
          padding: 28px 28px 0;
          position: relative;
          overflow: hidden;
          box-shadow:
            0 32px 80px rgba(6,13,40,0.36),
            0 0 0 1px rgba(108,142,245,0.14);
        }

        .np-card-hdr {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 22px;
        }
        .np-card-hdr-left {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .np-card-logo {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: linear-gradient(135deg, #6C8EF5, #9B7FEA);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.75rem;
          color: #fff;
          flex-shrink: 0;
        }
        .np-card-brand {
          font-size: 0.6rem;
          font-weight: 700;
          letter-spacing: 0.14em;
          color: rgba(255,255,255,0.88);
        }
        .np-card-meta {
          font-size: 0.7rem;
          color: rgba(255,255,255,0.42);
          margin-top: 2px;
        }
        .np-card-tonight {
          font-size: 0.72rem;
          color: rgba(255,255,255,0.42);
        }

        .np-card-title {
          font-family: var(--font-display), 'Playfair Display', serif;
          font-size: 1.45rem;
          font-weight: 400;
          color: rgba(255,255,255,0.95);
          margin-bottom: 10px;
          position: relative;
          z-index: 1;
        }
        .np-card-rule {
          width: 44px;
          height: 1px;
          background: rgba(108,142,245,0.5);
          margin-bottom: 14px;
        }
        .np-card-prayer {
          font-family: var(--font-display), 'Playfair Display', serif;
          font-style: italic;
          font-size: 0.94rem;
          color: rgba(255,255,255,0.78);
          line-height: 1.78;
          margin-bottom: 20px;
          position: relative;
          z-index: 1;
        }
        .np-card-tags {
          display: flex;
          gap: 8px;
          margin-bottom: 0;
          position: relative;
          z-index: 1;
          padding-bottom: 120px;
        }
        .np-card-tag {
          font-size: 0.6rem;
          font-weight: 600;
          letter-spacing: 0.1em;
          color: rgba(255,255,255,0.55);
          border: 1px solid rgba(255,255,255,0.16);
          border-radius: 100px;
          padding: 4px 10px;
        }

        /* aurora glow at card bottom */
        .np-card-glow {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 150px;
          background: radial-gradient(ellipse 100% 80% at 50% 100%,
            rgba(80,120,255,0.65) 0%,
            rgba(108,142,245,0.4) 35%,
            transparent 80%);
          pointer-events: none;
        }
        .np-card-star-br {
          position: absolute;
          bottom: 18px;
          right: 22px;
          font-size: 1.1rem;
          color: rgba(108,142,245,0.65);
          z-index: 2;
        }

        /* ──────────────────────────────────────────
           SIGNUP SECTION
        ────────────────────────────────────────── */
        .np-signup { padding: 0 0 80px; }

        .np-signup-box {
          background: #fff;
          border-radius: 24px;
          padding: 44px 48px 48px;
          box-shadow:
            0 4px 32px rgba(108,142,245,0.07),
            0 1px 4px rgba(0,0,0,0.04);
        }
        @media (max-width: 768px) {
          .np-signup-box { padding: 28px 20px 32px; border-radius: 18px; }
        }

        .np-signup-hdr {
          text-align: center;
          margin-bottom: 36px;
        }
        .np-signup-hdr h2 {
          font-family: var(--font-jost), sans-serif;
          font-size: 1.45rem;
          font-weight: 600;
          color: #111827;
          margin-bottom: 4px;
        }
        .np-signup-hdr p {
          font-size: 0.86rem;
          color: #9CA3AF;
        }
        .np-blue {
          background: linear-gradient(135deg, #6C8EF5 0%, #9B7FEA 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .np-signup-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 36px;
          align-items: start;
        }
        @media (max-width: 860px) {
          .np-signup-grid { grid-template-columns: 1fr; gap: 28px; }
        }

        /* plan cards */
        .np-plans {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }
        @media (max-width: 480px) {
          .np-plans { grid-template-columns: 1fr; }
        }

        .np-plan {
          background: #fff;
          border: 1.5px solid #E5E7EB;
          border-radius: 14px;
          padding: 18px;
          cursor: pointer;
          text-align: left;
          transition: all 0.16s ease;
          position: relative;
          width: 100%;
        }
        .np-plan:hover {
          border-color: rgba(108,142,245,0.5);
          background: rgba(108,142,245,0.02);
        }
        .np-plan.on {
          border-color: #6C8EF5;
          box-shadow: 0 0 0 3px rgba(108,142,245,0.1);
        }
        .np-plan-chk {
          position: absolute;
          top: 12px; right: 12px;
          width: 20px; height: 20px;
          border-radius: 50%;
          background: linear-gradient(135deg, #6C8EF5, #9B7FEA);
          color: #fff;
          font-size: 0.6rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .np-plan-ico {
          width: 40px; height: 40px;
          border-radius: 11px;
          background: rgba(108,142,245,0.1);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1rem;
          margin-bottom: 10px;
          color: #6C8EF5;
        }
        .np-plan-name {
          font-size: 0.88rem;
          font-weight: 600;
          color: #111827;
          margin-bottom: 2px;
        }
        .np-plan-price {
          font-size: 1.05rem;
          font-weight: 700;
          color: #111827;
          margin-bottom: 8px;
        }
        .np-plan-price span {
          font-size: 0.72rem;
          font-weight: 400;
          color: #9CA3AF;
        }
        .np-plan-trial {
          display: inline-block;
          font-size: 0.57rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          color: #6C8EF5;
          background: rgba(108,142,245,0.1);
          border: 1px solid rgba(108,142,245,0.22);
          border-radius: 4px;
          padding: 2px 6px;
          margin-bottom: 10px;
        }
        .np-plan-list {
          list-style: none;
          padding: 0; margin: 0;
          display: flex;
          flex-direction: column;
          gap: 5px;
        }
        .np-plan-list li {
          display: flex;
          align-items: flex-start;
          gap: 6px;
          font-size: 0.74rem;
          color: #6B7280;
          line-height: 1.4;
        }
        .np-li-chk {
          color: #6C8EF5;
          font-size: 0.62rem;
          margin-top: 1px;
          flex-shrink: 0;
        }

        /* form */
        .np-form {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .np-field { display: flex; flex-direction: column; gap: 5px; }

        .np-lbl {
          font-size: 0.6rem;
          font-weight: 600;
          letter-spacing: 0.1em;
          color: #9CA3AF;
        }
        .np-lbl-opt { color: #D1D5DB; font-weight: 400; }

        .np-iw { position: relative; }
        .np-ii {
          position: absolute;
          left: 13px; top: 50%;
          transform: translateY(-50%);
          font-size: 0.82rem;
          color: #C4C9D8;
          pointer-events: none;
          display: flex;
          align-items: center;
          line-height: 1;
        }

        .np-input {
          width: 100%;
          background: #F9FAFB;
          border: 1.5px solid #E5E7EB;
          border-radius: 10px;
          color: #111827;
          font-family: var(--font-jost), 'Jost', sans-serif;
          font-size: 0.88rem;
          font-weight: 400;
          padding: 13px 14px;
          outline: none;
          transition: border-color 0.18s, background 0.18s, box-shadow 0.18s;
          -webkit-appearance: none;
          appearance: none;
        }
        .np-input.has-icon { padding-left: 38px; }
        .np-input:focus {
          border-color: #6C8EF5;
          background: #fff;
          box-shadow: 0 0 0 3px rgba(108,142,245,0.1);
        }
        .np-input::placeholder { color: #D1D5DB; }
        .np-input option { background: #fff; color: #111827; }
        select.np-input {
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='7' fill='none'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%23C4C9D8' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 13px center;
          padding-right: 34px;
          cursor: pointer;
        }
        select.np-input.has-icon { padding-left: 38px; }

        .np-row2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }
        @media (max-width: 480px) { .np-row2 { grid-template-columns: 1fr; } }

        /* consent */
        .np-consent {
          display: flex;
          align-items: flex-start;
          gap: 9px;
          padding: 12px;
          background: rgba(108,142,245,0.05);
          border: 1px solid rgba(108,142,245,0.14);
          border-radius: 8px;
          cursor: pointer;
          font-size: 0.74rem;
          color: #6B7280;
          line-height: 1.5;
        }
        .np-consent input {
          margin-top: 1px;
          accent-color: #6C8EF5;
          flex-shrink: 0;
          cursor: pointer;
        }

        /* CTA */
        .np-cta {
          width: 100%;
          padding: 16px 20px;
          background: linear-gradient(135deg, #6C8EF5 0%, #9B7FEA 100%);
          color: #fff;
          font-family: var(--font-jost), sans-serif;
          font-size: 0.8rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          border: none;
          border-radius: 12px;
          cursor: pointer;
          transition: opacity 0.18s, transform 0.18s, box-shadow 0.18s;
          box-shadow: 0 6px 28px rgba(108,142,245,0.4);
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
        }
        .np-cta:hover:not(:disabled) {
          opacity: 0.92;
          transform: translateY(-1px);
          box-shadow: 0 10px 36px rgba(108,142,245,0.5);
        }
        .np-cta:disabled { opacity: 0.65; cursor: not-allowed; }
        .np-cta-label {
          display: flex;
          align-items: center;
          gap: 8px;
          justify-content: center;
          flex: 1;
        }

        /* error */
        .np-err {
          padding: 11px 13px;
          background: rgba(239,68,68,0.07);
          border: 1px solid rgba(239,68,68,0.2);
          border-radius: 8px;
          font-size: 0.78rem;
          color: #DC2626;
        }

        /* trust */
        .np-trust {
          display: flex;
          flex-wrap: wrap;
          gap: 8px 16px;
          justify-content: center;
        }
        .np-trust-it {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 0.68rem;
          color: #9CA3AF;
        }
        .np-trust-it svg { opacity: 0.6; }
        .np-trust-stripe {
          text-align: center;
          font-size: 0.66rem;
          color: #C4C9D8;
        }

        /* enter animations */
        .np-hero-left > * { animation: npUp 0.65s ease both; }
        .np-hero-left > *:nth-child(1) { animation-delay: 0.04s; }
        .np-hero-left > *:nth-child(2) { animation-delay: 0.12s; }
        .np-hero-left > *:nth-child(3) { animation-delay: 0.20s; }
        .np-hero-left > *:nth-child(4) { animation-delay: 0.28s; }
        .np-dark-card   { animation: npUp 0.65s 0.14s ease both; }
        .np-signup-box  { animation: npUp 0.65s 0.28s ease both; }

        @keyframes npUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div className="np-page">

        {/* ── HERO ─────────────────────────────────────────────── */}
        <section className="np-hero">
          <div className="np-con">
            <div className="np-hero-grid">

              {/* left: copy */}
              <div className="np-hero-left">
                <div className="np-badge">+ A PRAYER FOR EVERY NIGHT</div>

                <h1 className="np-h1">
                  End your day with{" "}
                  <em className="np-h1-accent">peace.</em>
                </h1>

                <p className="np-sub">
                  Receive a personal prayer every night — written for you and
                  delivered at the bedtime you choose.
                </p>

                <div className="np-features">
                  {([
                    { icon: "✉", label: "Personal &\nmeaningful" },
                    { icon: "🌙", label: "Arrives at your\nbedtime" },
                    { icon: "✓",  label: "Private &\nsecure" },
                    { icon: "♡", label: "Peace for your\nmind & heart" },
                  ] as const).map((f) => (
                    <div key={f.label} className="np-feat">
                      <div className="np-feat-icon">{f.icon}</div>
                      <span className="np-feat-label">{f.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* right: dark prayer card */}
              <div className="np-dark-card">
                <div className="np-card-hdr">
                  <div className="np-card-hdr-left">
                    <div className="np-card-logo">✦</div>
                    <div>
                      <div className="np-card-brand">NIGHTLY PRAYER</div>
                      <div className="np-card-meta">Delivered to you • 9:30 PM</div>
                    </div>
                  </div>
                  <span className="np-card-tonight">Tonight</span>
                </div>

                <h2 className="np-card-title">Tonight&apos;s Prayer</h2>
                <div className="np-card-rule" />

                <p className="np-card-prayer">
                  &ldquo;Lord, quiet my mind tonight. Remove the weight I carried
                  today, protect my heart, and help me rest in peace. Let tomorrow
                  bring clarity, strength, and blessings. Amen.&rdquo;
                </p>

                <div className="np-card-tags">
                  {["PEACE", "PROTECTION", "HOPE"].map((t) => (
                    <span key={t} className="np-card-tag">{t}</span>
                  ))}
                </div>

                <div className="np-card-glow" />
                <div className="np-card-star-br">✦</div>
              </div>

            </div>
          </div>
        </section>

        {/* ── SIGNUP ───────────────────────────────────────────── */}
        <section className="np-signup">
          <div className="np-con">
            <div className="np-signup-box">

              <div className="np-signup-hdr">
                <h2>
                  Start your{" "}
                  <span className="np-blue">7-night free trial</span>
                </h2>
                <p>No charge today. Cancel anytime.</p>
              </div>

              <div className="np-signup-grid">

                {/* plan cards */}
                <div className="np-plans">
                  {(["email", "sms"] as Plan[]).map((p) => {
                    const c = PLAN_CONFIG[p];
                    const on = plan === p;
                    return (
                      <button
                        key={p}
                        type="button"
                        className={`np-plan${on ? " on" : ""}`}
                        onClick={() => setPlan(p)}
                      >
                        {on && <div className="np-plan-chk">✓</div>}
                        <div className="np-plan-ico">
                          {p === "email" ? "✉" : "💬"}
                        </div>
                        <div className="np-plan-name">{c.label}</div>
                        <div className="np-plan-price">
                          {c.price} <span>/ month</span>
                        </div>
                        <div className="np-plan-trial">7 NIGHTS FREE</div>
                        <ul className="np-plan-list">
                          {c.bullets.map((b) => (
                            <li key={b}>
                              <span className="np-li-chk">✓</span>
                              {b}
                            </li>
                          ))}
                        </ul>
                      </button>
                    );
                  })}
                </div>

                {/* form */}
                <form className="np-form" onSubmit={handleSubmit} noValidate>

                  {/* email / phone */}
                  <div className="np-field">
                    <label className="np-lbl">
                      {plan === "email" ? "EMAIL ADDRESS" : "MOBILE NUMBER"}
                    </label>
                    <div className="np-iw">
                      <span className="np-ii">
                        {plan === "email" ? "✉" : "📱"}
                      </span>
                      {plan === "email" ? (
                        <input
                          className="np-input has-icon"
                          type="email"
                          placeholder="you@example.com"
                          value={form.email}
                          onChange={(e) => set("email", e.target.value)}
                          required
                          autoComplete="email"
                        />
                      ) : (
                        <input
                          className="np-input has-icon"
                          type="tel"
                          placeholder="+1 (555) 000-0000"
                          value={form.phoneNumber}
                          onChange={(e) => set("phoneNumber", e.target.value)}
                          required
                          autoComplete="tel"
                        />
                      )}
                    </div>
                  </div>

                  {/* name + bedtime */}
                  <div className="np-row2">
                    <div className="np-field">
                      <label className="np-lbl">FIRST NAME</label>
                      <div className="np-iw">
                        <span className="np-ii" style={{ fontSize: "0.72rem" }}>👤</span>
                        <input
                          className="np-input has-icon"
                          type="text"
                          placeholder="Grace"
                          value={form.firstName}
                          onChange={(e) => set("firstName", e.target.value)}
                          required
                          autoComplete="given-name"
                        />
                      </div>
                    </div>
                    <div className="np-field">
                      <label className="np-lbl">PRAYER BEDTIME</label>
                      <div className="np-iw">
                        <span className="np-ii" style={{ fontSize: "0.78rem" }}>🕐</span>
                        <select
                          className="np-input has-icon"
                          value={form.deliveryTime}
                          onChange={(e) => set("deliveryTime", e.target.value)}
                        >
                          {TIMES.map((t) => (
                            <option key={t.value} value={t.value}>{t.label}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* timezone */}
                  <div className="np-field">
                    <label className="np-lbl">TIMEZONE</label>
                    <select
                      className="np-input"
                      value={form.timezone}
                      onChange={(e) => set("timezone", e.target.value)}
                    >
                      {TIMEZONES.map((tz) => (
                        <option key={tz.value} value={tz.value}>{tz.label}</option>
                      ))}
                    </select>
                  </div>

                  {/* prayer style / focus */}
                  <div className="np-field">
                    <label className="np-lbl">
                      PRAYER STYLE / FOCUS{" "}
                      <span className="np-lbl-opt">(OPTIONAL)</span>
                    </label>
                    <div className="np-iw">
                      <span className="np-ii" style={{ fontSize: "0.7rem" }}>✦</span>
                      <select
                        className="np-input has-icon"
                        value={form.tone}
                        onChange={(e) => set("tone", e.target.value)}
                      >
                        {TONES.map((t) => (
                          <option key={t.value} value={t.value}>{t.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* SMS consent */}
                  {plan === "sms" && (
                    <label className="np-consent">
                      <input
                        type="checkbox"
                        checked={form.smsConsent}
                        onChange={(e) => set("smsConsent", e.target.checked)}
                      />
                      <span>
                        I agree to receive nightly prayer SMS messages from Nightly Prayer.
                        Standard message &amp; data rates may apply. Reply STOP to cancel anytime.
                      </span>
                    </label>
                  )}

                  {/* CTA */}
                  <button type="submit" className="np-cta" disabled={loading}>
                    <span style={{ fontSize: "0.78rem", opacity: 0.9 }}>✦</span>
                    <span className="np-cta-label">
                      {loading ? "Preparing your trial…" : "START MY FREE 7-NIGHT TRIAL"}
                    </span>
                    <span style={{ fontSize: "1rem" }}>→</span>
                  </button>

                  {error && <div className="np-err">{error}</div>}

                  {/* trust row */}
                  <div className="np-trust">
                    <span className="np-trust-it">
                      <svg width="11" height="13" viewBox="0 0 11 13" fill="none"><path d="M5.5 1L1 3v4c0 2.5 1.9 4.8 4.5 5.5C8.1 11.8 10 9.5 10 7V3L5.5 1Z" stroke="#9CA3AF" strokeWidth="1.2" strokeLinejoin="round"/></svg>
                      No charge today
                    </span>
                    <span className="np-trust-it">
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M6 1v5l3 2" stroke="#9CA3AF" strokeWidth="1.2" strokeLinecap="round"/><circle cx="6" cy="6" r="5" stroke="#9CA3AF" strokeWidth="1.2"/></svg>
                      Cancel anytime
                    </span>
                    <span className="np-trust-it">
                      <svg width="13" height="12" viewBox="0 0 13 12" fill="none"><path d="M1.5 6.5l3 3 7-7" stroke="#9CA3AF" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      7 nights free
                    </span>
                    <span className="np-trust-it">
                      <svg width="11" height="13" viewBox="0 0 11 13" fill="none"><rect x="1" y="5" width="9" height="7" rx="1.5" stroke="#9CA3AF" strokeWidth="1.2"/><path d="M3.5 5V3.5a2 2 0 014 0V5" stroke="#9CA3AF" strokeWidth="1.2" strokeLinecap="round"/></svg>
                      No app needed
                    </span>
                  </div>
                  <div className="np-trust-stripe">
                    🔒 Secure checkout powered by Stripe
                  </div>

                </form>
              </div>

            </div>
          </div>
        </section>

      </div>
    </>
  );
}
