"use client";

import { useRef, useState } from "react";
import PrayerPreviewCard from "./PrayerPreviewCard";

/* ── Types ── */
interface FormState {
  firstName: string;
  email: string;
  deliveryTime: string;
  timezone: string;
  prayerFocus: string;
  tone: string;
}

/* ── Data ── */
const DELIVERY_TIMES = [
  { value: "20:00", label: "8:00 PM"  },
  { value: "20:30", label: "8:30 PM"  },
  { value: "21:00", label: "9:00 PM"  },
  { value: "21:30", label: "9:30 PM"  },
  { value: "22:00", label: "10:00 PM" },
  { value: "22:30", label: "10:30 PM" },
  { value: "23:00", label: "11:00 PM" },
  { value: "23:30", label: "11:30 PM" },
  { value: "00:00", label: "12:00 AM" },
];

const TIMEZONES = [
  { value: "America/New_York",    label: "Eastern (ET)"  },
  { value: "America/Chicago",     label: "Central (CT)"  },
  { value: "America/Denver",      label: "Mountain (MT)" },
  { value: "America/Los_Angeles", label: "Pacific (PT)"  },
  { value: "America/Anchorage",   label: "Alaska (AKT)"  },
  { value: "Pacific/Honolulu",    label: "Hawaii (HT)"   },
  { value: "Europe/London",       label: "London (GMT)"  },
  { value: "Europe/Paris",        label: "Paris (CET)"   },
  { value: "Australia/Sydney",    label: "Sydney (AEST)" },
  { value: "Asia/Tokyo",          label: "Tokyo (JST)"   },
  { value: "Asia/Dubai",          label: "Dubai (GST)"   },
];

const PRAYER_FOCUS = [
  { value: "peace",       label: "Peace & Calm"    },
  { value: "protection",  label: "Protection"      },
  { value: "gratitude",   label: "Gratitude"       },
  { value: "healing",     label: "Healing"         },
  { value: "forgiveness", label: "Forgiveness"     },
  { value: "strength",    label: "Strength & Hope" },
];

const TONES = [
  { value: "gentle",       label: "Gentle & Soft"     },
  { value: "traditional",  label: "Traditional"       },
  { value: "contemporary", label: "Contemporary"      },
  { value: "poetic",       label: "Poetic & Literary" },
];

const STEPS = [
  { n: "1", label: "Choose your bedtime"   },
  { n: "2", label: "Pick your prayer style" },
  { n: "3", label: "Prayer arrives tonight" },
];

/* ── Component ── */
export default function HomeClient() {
  const signupRef = useRef<HTMLElement>(null);

  const [form, setForm] = useState<FormState>({
    firstName:    "",
    email:        "",
    deliveryTime: "22:00",
    timezone:     "America/New_York",
    prayerFocus:  "peace",
    tone:         "gentle",
  });
  const [loading,       setLoading]       = useState(false);
  const [error,         setError]         = useState("");
  const [showCustomize, setShowCustomize] = useState(false);

  const scrollToSignup = () =>
    signupRef.current?.scrollIntoView({ behavior: "smooth" });

  const set = (field: keyof FormState) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((p) => ({ ...p, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res  = await fetch("/api/create-checkout-session", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(form),
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
      {/* ═══════════════════════════════════════ HERO */}
      <section
        style={{
          display:        "flex",
          flexDirection:  "column",
          justifyContent: "flex-start",
          paddingTop:     140,
          paddingBottom:  120,
          position:       "relative",
          zIndex:         1,
        }}
      >
        <div className="container">
          <div
            className="hero-grid"
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 64, alignItems: "center" }}
          >
            {/* ── Left: text ── */}
            <div className="hero-text">
              <p
                className="fade-up d1 hero-eyebrow"
                style={{
                  fontSize:      "0.68rem",
                  fontWeight:    400,
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  color:         "var(--gold)",
                  marginBottom:  24,
                  display:       "flex",
                  alignItems:    "center",
                  gap:           10,
                }}
              >
                <span style={{ display: "inline-block", width: 24, height: 1, background: "rgba(201,169,110,0.5)", flexShrink: 0 }} />
                A prayer for every night
                <span style={{ display: "inline-block", width: 24, height: 1, background: "rgba(201,169,110,0.5)", flexShrink: 0 }} />
              </p>

              <h1
                className="font-display fade-up d2"
                style={{
                  fontSize:      "clamp(2.4rem, 7vw, 3.8rem)",
                  fontWeight:    400,
                  fontStyle:     "italic",
                  lineHeight:    1.18,
                  color:         "var(--navy-text)",
                  marginBottom:  24,
                  letterSpacing: "-0.01em",
                }}
              >
                End your day<br />
                with{" "}<span className="text-gold">peace.</span>
              </h1>

              <p
                className="fade-up d3"
                style={{
                  fontSize:     "1rem",
                  fontWeight:   300,
                  lineHeight:   1.85,
                  color:        "var(--secondary-text)",
                  maxWidth:     420,
                  marginBottom: 36,
                }}
              >
                Receive a personal prayer in your inbox every night — written
                for you, delivered at the bedtime you choose.
              </p>

              <div className="fade-up d4 hero-cta" style={{ marginBottom: 20 }}>
                <button
                  type="button"
                  onClick={scrollToSignup}
                  className="btn-gold"
                  style={{ display: "inline-flex", border: "none", cursor: "pointer" }}
                >
                  Start My 7 Free Nights
                </button>
              </div>

              <p
                className="fade-up d5 hero-price"
                style={{ fontSize: "0.78rem", fontWeight: 300, color: "var(--muted)", letterSpacing: "0.04em" }}
              >
                First 7 nights free · Then $5.99/month · Cancel anytime
              </p>
            </div>

            {/* ── Right: prayer card ── */}
            <div className="fade-up d6 hero-card" style={{ display: "flex", justifyContent: "flex-end" }}>
              <PrayerPreviewCard />
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════ SIGNUP */}
      <section
        ref={signupRef}
        id="signup"
        style={{ padding: "100px 0 120px", position: "relative", zIndex: 1 }}
      >
        <div className="container">

          {/* ── Section header ── */}
          <div className="reveal" style={{ textAlign: "center", marginBottom: 52 }}>
            <p style={{
              fontSize:      "0.61rem",
              fontWeight:    400,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color:         "var(--gold)",
              marginBottom:  16,
            }}>
              Begin tonight
            </p>
            <h2 className="font-display" style={{
              fontSize:     "clamp(2rem, 4vw, 2.9rem)",
              fontWeight:   400,
              fontStyle:    "italic",
              color:        "var(--navy-text)",
              lineHeight:   1.2,
              marginBottom: 14,
            }}>
              Set up your nightly prayer
            </h2>
            <p style={{
              fontSize:   "0.9rem",
              fontWeight: 300,
              color:      "var(--secondary-text)",
              lineHeight: 1.7,
              maxWidth:   380,
              margin:     "0 auto",
            }}>
              Takes less than 30 seconds. Your first prayer arrives tonight — free.
            </p>
          </div>

          {/* ── Premium card ── */}
          <div className="signup-card reveal">

            {/* ── Step indicators ── */}
            <div className="signup-steps">
              {STEPS.map((step, i) => (
                <div key={step.n} className="signup-step-group">
                  <div className="signup-step">
                    <span className="signup-step-num">{step.n}</span>
                    <span className="signup-step-label">{step.label}</span>
                  </div>
                  {i < 2 && <div className="signup-step-connector" />}
                </div>
              ))}
            </div>

            {/* ── Form ── */}
            <form onSubmit={handleSubmit}>

              {/* Name + Email */}
              <div className="form-grid">
                <div className="form-field">
                  <label htmlFor="np-firstName" className="form-label">First name</label>
                  <input
                    id="np-firstName"
                    className="form-input"
                    type="text"
                    placeholder="Grace"
                    value={form.firstName}
                    onChange={set("firstName")}
                    required
                    autoComplete="given-name"
                  />
                </div>
                <div className="form-field">
                  <label htmlFor="np-email" className="form-label">Email address</label>
                  <input
                    id="np-email"
                    className="form-input"
                    type="email"
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={set("email")}
                    required
                    autoComplete="email"
                  />
                </div>
              </div>

              {/* ── Customize toggle ── */}
              <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 24 }}>
                <div style={{ flex: 1, height: 1, background: "rgba(16,42,67,0.07)" }} />
                <button
                  type="button"
                  onClick={() => setShowCustomize(v => !v)}
                  style={{
                    background:    showCustomize ? "rgba(198,161,91,0.09)" : "transparent",
                    border:        "1px solid rgba(198,161,91,0.38)",
                    borderRadius:  100,
                    cursor:        "pointer",
                    fontSize:      "0.63rem",
                    fontWeight:    400,
                    color:         "var(--secondary-text)",
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    display:       "inline-flex",
                    alignItems:    "center",
                    gap:           8,
                    padding:       "9px 20px",
                    transition:    "background 0.2s, border-color 0.2s",
                    whiteSpace:    "nowrap",
                  }}
                >
                  {showCustomize ? "Hide options" : "Customise prayer"}
                  <svg
                    width="10" height="6" viewBox="0 0 10 6" fill="none"
                    style={{
                      transition: "transform 0.25s ease",
                      transform:  showCustomize ? "rotate(180deg)" : "rotate(0deg)",
                      flexShrink: 0,
                    }}
                  >
                    <path d="M1 1l4 4 4-4" stroke="var(--gold)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                <div style={{ flex: 1, height: 1, background: "rgba(16,42,67,0.07)" }} />
              </div>

              {/* ── Collapsible preferences ── */}
              <div style={{
                overflow:   "hidden",
                maxHeight:  showCustomize ? 500 : 0,
                opacity:    showCustomize ? 1 : 0,
                transition: "max-height 0.35s ease, opacity 0.25s ease",
                marginTop:  showCustomize ? 20 : 0,
              }}>
                <div className="form-grid">
                  <div className="form-field">
                    <label htmlFor="np-deliveryTime" className="form-label">Delivery time</label>
                    <select id="np-deliveryTime" className="form-input" value={form.deliveryTime} onChange={set("deliveryTime")}>
                      {DELIVERY_TIMES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                    </select>
                  </div>
                  <div className="form-field">
                    <label htmlFor="np-timezone" className="form-label">Timezone</label>
                    <select id="np-timezone" className="form-input" value={form.timezone} onChange={set("timezone")}>
                      {TIMEZONES.map(tz => <option key={tz.value} value={tz.value}>{tz.label}</option>)}
                    </select>
                  </div>
                  <div className="form-field">
                    <label htmlFor="np-prayerFocus" className="form-label">Prayer focus</label>
                    <select id="np-prayerFocus" className="form-input" value={form.prayerFocus} onChange={set("prayerFocus")}>
                      {PRAYER_FOCUS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                    </select>
                  </div>
                  <div className="form-field">
                    <label htmlFor="np-tone" className="form-label">Prayer tone</label>
                    <select id="np-tone" className="form-input" value={form.tone} onChange={set("tone")}>
                      {TONES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              {/* ── Offer block ── */}
              <div className="offer-block">
                <p className="font-display offer-headline">Your first 7 nights are free</p>
                <p className="offer-sub">Then $5.99/month · No charge today · Cancel anytime</p>
              </div>

              {/* ── CTA ── */}
              <button
                type="submit"
                className="cta-submit"
                disabled={loading}
                style={{ opacity: loading ? 0.75 : 1, cursor: loading ? "default" : "pointer" }}
              >
                {loading ? "Opening checkout…" : "Start My 7 Free Nights →"}
              </button>

              {/* ── Trust ── */}
              <p className="trust-note">
                <svg width="11" height="14" viewBox="0 0 11 14" fill="none" style={{ flexShrink: 0 }}>
                  <rect x="1" y="5" width="9" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.2" />
                  <path d="M3 5V3.5a2.5 2.5 0 015 0V5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                </svg>
                Secure checkout powered by Stripe
              </p>

              {error && (
                <p style={{ marginTop: 14, textAlign: "center", fontSize: "0.82rem", color: "#d97070", fontWeight: 300 }}>
                  {error}
                </p>
              )}

            </form>
          </div>

        </div>
      </section>

      {/* ══════════════════════════════════════════════ STYLES */}
      <style>{`
        /* ── Hero mobile ── */
        @media (max-width: 768px) {
          .hero-grid    { grid-template-columns: 1fr !important; gap: 40px !important; }
          .hero-text    { text-align: center; }
          .hero-eyebrow { justify-content: center; }
          .hero-cta     { display: flex; justify-content: center; }
          .hero-price   { text-align: center; }
          .hero-card    { justify-content: center !important; }
        }
        @media (max-width: 390px) {
          .hero-text h1 { font-size: 2.2rem !important; }
        }

        /* ── Premium signup card ── */
        .signup-card {
          background:      rgba(255,255,255,0.86);
          border:          1px solid rgba(16,42,67,0.07);
          border-radius:   20px;
          box-shadow:      0 8px 60px rgba(16,42,67,0.09), 0 1px 8px rgba(16,42,67,0.05);
          max-width:       780px;
          margin:          0 auto;
          padding:         52px 60px 56px;
          backdrop-filter: blur(10px);
        }
        @media (max-width: 700px) {
          .signup-card { padding: 36px 24px 40px; border-radius: 16px; }
        }

        /* ── Step indicators ── */
        .signup-steps {
          display:         flex;
          align-items:     flex-start;
          justify-content: center;
          margin-bottom:   44px;
        }
        .signup-step-group {
          display:     flex;
          align-items: center;
        }
        .signup-step {
          display:        flex;
          flex-direction: column;
          align-items:    center;
          gap:            10px;
          padding:        0 10px;
          max-width:      130px;
        }
        .signup-step-num {
          width:           46px;
          height:          46px;
          border-radius:   50%;
          background:      rgba(198,161,91,0.1);
          border:          1px solid rgba(198,161,91,0.3);
          display:         flex;
          align-items:     center;
          justify-content: center;
          font-family:     var(--font-display);
          font-style:      italic;
          font-size:       1.1rem;
          color:           var(--gold);
          flex-shrink:     0;
        }
        .signup-step-label {
          font-size:   0.8rem;
          font-weight: 300;
          color:       rgba(16,42,67,0.52);
          text-align:  center;
          line-height: 1.4;
        }
        .signup-step-connector {
          width:       52px;
          height:      1px;
          background:  rgba(198,161,91,0.22);
          flex-shrink: 0;
          margin-top:  -24px;
        }
        @media (max-width: 480px) {
          .signup-step           { padding: 0 4px; max-width: 88px; }
          .signup-step-label     { font-size: 0.7rem; }
          .signup-step-num       { width: 36px; height: 36px; font-size: 0.9rem; }
          .signup-step-connector { width: 24px; }
        }

        /* ── Form grid ── */
        .form-grid {
          display:               grid;
          grid-template-columns: 1fr 1fr;
          gap:                   18px;
        }
        @media (max-width: 580px) {
          .form-grid { grid-template-columns: 1fr; }
        }

        /* ── Form fields ── */
        .form-field {
          display:        flex;
          flex-direction: column;
          gap:            7px;
        }
        .form-label {
          font-size:      0.59rem;
          font-weight:    400;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color:          rgba(16,42,67,0.48);
        }
        .form-input {
          background:         rgba(247,244,240,0.9);
          border:             1px solid rgba(16,42,67,0.1);
          border-radius:      8px;
          color:              var(--navy-text);
          font-family:        var(--font-jost), sans-serif;
          font-size:          0.95rem;
          font-weight:        300;
          padding:            13px 15px;
          width:              100%;
          outline:            none;
          transition:         border-color 0.2s, background 0.2s, box-shadow 0.2s;
          -webkit-appearance: none;
          appearance:         none;
        }
        .form-input:focus {
          border-color: rgba(198,161,91,0.55);
          background:   #ffffff;
          box-shadow:   0 0 0 3px rgba(198,161,91,0.1);
        }
        .form-input::placeholder { color: rgba(16,42,67,0.28); }
        .form-input option        { background: #ffffff; color: var(--navy-text); }

        select.form-input {
          background-image:    url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='7' fill='none'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%23102A43' stroke-opacity='0.35' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
          background-repeat:   no-repeat;
          background-position: right 14px center;
          padding-right:       40px;
          cursor:              pointer;
        }

        /* ── Offer block ── */
        .offer-block {
          background:    rgba(198,161,91,0.06);
          border:        1px solid rgba(198,161,91,0.18);
          border-radius: 12px;
          padding:       30px 32px 26px;
          text-align:    center;
          margin:        36px 0 24px;
        }
        .offer-headline {
          font-family:   var(--font-jost), sans-serif;
          font-size:     clamp(1.6rem, 3.8vw, 2.15rem);
          font-weight:   300;
          font-style:    normal;
          letter-spacing: 0.01em;
          color:         var(--gold);
          line-height:   1.2;
          margin-bottom: 8px;
        }
        .offer-sub {
          font-size:      0.76rem;
          font-weight:    300;
          color:          var(--secondary-text);
          letter-spacing: 0.02em;
        }

        /* ── CTA button ── */
        .cta-submit {
          display:        block;
          width:          100%;
          padding:        17px 40px;
          background:     var(--gold);
          color:          #102a43;
          border:         none;
          border-radius:  8px;
          font-family:    var(--font-jost), sans-serif;
          font-size:      0.76rem;
          font-weight:    500;
          letter-spacing: 0.11em;
          text-transform: uppercase;
          transition:     background 0.2s, box-shadow 0.2s, transform 0.15s;
          box-shadow:     0 2px 20px rgba(198,161,91,0.3);
        }
        .cta-submit:hover {
          background:  #d4a845;
          box-shadow:  0 6px 30px rgba(198,161,91,0.42);
          transform:   translateY(-1px);
        }
        .cta-submit:active {
          transform:  translateY(0);
          box-shadow: 0 2px 8px rgba(198,161,91,0.22);
        }

        /* ── Trust note ── */
        .trust-note {
          display:         flex;
          align-items:     center;
          justify-content: center;
          gap:             6px;
          margin-top:      13px;
          font-size:       0.65rem;
          font-weight:     300;
          color:           rgba(16,42,67,0.36);
          letter-spacing:  0.03em;
        }
      `}</style>
    </>
  );
}
