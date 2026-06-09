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
// Values are 24h (HH:mm) so the cron can compare directly
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
  { value:"America/New_York",    label:"Eastern (ET)"   },
  { value:"America/Chicago",     label:"Central (CT)"   },
  { value:"America/Denver",      label:"Mountain (MT)"  },
  { value:"America/Los_Angeles", label:"Pacific (PT)"   },
  { value:"America/Anchorage",   label:"Alaska (AKT)"   },
  { value:"Pacific/Honolulu",    label:"Hawaii (HT)"    },
  { value:"Europe/London",       label:"London (GMT)"   },
  { value:"Europe/Paris",        label:"Paris (CET)"    },
  { value:"Australia/Sydney",    label:"Sydney (AEST)"  },
  { value:"Asia/Tokyo",          label:"Tokyo (JST)"    },
  { value:"Asia/Dubai",          label:"Dubai (GST)"    },
];

const PRAYER_FOCUS = [
  { value:"peace",       label:"Peace & Calm"     },
  { value:"protection",  label:"Protection"       },
  { value:"gratitude",   label:"Gratitude"        },
  { value:"healing",     label:"Healing"          },
  { value:"forgiveness", label:"Forgiveness"      },
  { value:"strength",    label:"Strength & Hope"  },
];

const TONES = [
  { value:"gentle",       label:"Gentle & Soft"     },
  { value:"traditional",  label:"Traditional"       },
  { value:"contemporary", label:"Contemporary"      },
  { value:"poetic",       label:"Poetic & Literary" },
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
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");

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
          minHeight:      "100vh",
          display:        "flex",
          flexDirection:  "column",
          justifyContent: "center",
          paddingTop:     96,
          paddingBottom:  80,
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
                <span style={{ display:"inline-block", width:24, height:1, background:"rgba(201,169,110,0.5)", flexShrink:0 }} />
                A prayer for every night
                <span style={{ display:"inline-block", width:24, height:1, background:"rgba(201,169,110,0.5)", flexShrink:0 }} />
              </p>

              <h1
                className="font-display fade-up d2"
                style={{
                  fontSize:      "clamp(2.4rem, 7vw, 3.8rem)",
                  fontWeight:    400,
                  fontStyle:     "italic",
                  lineHeight:    1.18,
                  color:         "var(--cream)",
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
                  color:        "rgba(240,232,216,0.6)",
                  maxWidth:     420,
                  marginBottom: 36,
                }}
              >
                Receive a personal prayer in your inbox every night — written
                for you, delivered at the bedtime you choose.
              </p>

              <div className="fade-up d4 hero-cta" style={{ marginBottom: 18 }}>
                <button onClick={scrollToSignup} className="btn-gold">
                  Start My Nightly Prayer
                </button>
              </div>

              <p
                className="fade-up d5 hero-price"
                style={{ fontSize:"0.78rem", fontWeight:300, color:"var(--muted)", letterSpacing:"0.04em" }}
              >
                $5.99/month · Delivered at your chosen bedtime · Cancel anytime
              </p>
            </div>

            {/* ── Right: prayer card ── */}
            <div
              className="fade-up d6 hero-card"
              style={{ display:"flex", justifyContent:"flex-end" }}
            >
              <PrayerPreviewCard />
            </div>
          </div>
        </div>

        {/* Scroll hint */}
        <div
          className="scroll-hint fade-up d7"
          style={{
            position:  "absolute",
            bottom:    32,
            left:      "50%",
            transform: "translateX(-50%)",
            display:   "flex",
            flexDirection: "column",
            alignItems:    "center",
            gap:       6,
            opacity:   0.45,
          }}
        >
          <span style={{ fontSize:"0.58rem", letterSpacing:"0.16em", textTransform:"uppercase", color:"var(--muted)" }}>
            Scroll
          </span>
          <div style={{ width:1, height:30, background:"linear-gradient(to bottom, var(--muted), transparent)" }} />
        </div>
      </section>

      {/* ═══════════════════════════════════════ SIGNUP + CHECKOUT */}
      <section
        ref={signupRef}
        id="signup"
        style={{ padding:"100px 0 120px", position:"relative", zIndex:1 }}
      >
        <div className="container">
          <div style={{ maxWidth:680, margin:"0 auto" }}>

            {/* ── Section header ── */}
            <div className="reveal" style={{ textAlign:"center", marginBottom:52 }}>
              <p
                style={{
                  fontSize:      "0.65rem",
                  fontWeight:    400,
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  color:         "var(--gold)",
                  marginBottom:  16,
                }}
              >
                Begin tonight
              </p>
              <h2
                className="font-display"
                style={{
                  fontSize:     "clamp(1.9rem, 4vw, 2.8rem)",
                  fontWeight:   400,
                  fontStyle:    "italic",
                  color:        "var(--cream)",
                  lineHeight:   1.2,
                  marginBottom: 14,
                }}
              >
                Set up your nightly prayer
              </h2>
              <p
                style={{
                  fontSize:   "0.9rem",
                  fontWeight: 300,
                  lineHeight: 1.7,
                  color:      "rgba(240,232,216,0.5)",
                }}
              >
                Takes 30 seconds. Your first prayer arrives tonight.
              </p>
            </div>

            {/* ── Mini how-it-works ── */}
            <div className="reveal mini-how-wrap" style={{ marginBottom:52 }}>
              <div className="mini-how">

                <div className="mini-step">
                  <div className="mini-step-circle">
                    <span className="font-display" style={{ fontSize:"0.88rem", fontStyle:"italic", color:"var(--gold)" }}>1</span>
                  </div>
                  <span className="mini-step-label">Choose your bedtime</span>
                </div>

                <div className="mini-step-line" />

                <div className="mini-step">
                  <div className="mini-step-circle">
                    <span className="font-display" style={{ fontSize:"0.88rem", fontStyle:"italic", color:"var(--gold)" }}>2</span>
                  </div>
                  <span className="mini-step-label">Pick your prayer style</span>
                </div>

                <div className="mini-step-line" />

                <div className="mini-step">
                  <div className="mini-step-circle">
                    <span className="font-display" style={{ fontSize:"0.88rem", fontStyle:"italic", color:"var(--gold)" }}>3</span>
                  </div>
                  <span className="mini-step-label">Your prayer arrives tonight</span>
                </div>

              </div>
            </div>

            {/* ── Divider ── */}
            <div className="divider reveal" style={{ marginBottom:48 }} />

            {/* ── Form ── */}
            <form onSubmit={handleSubmit} className="reveal">

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

                <div className="form-field">
                  <label htmlFor="np-deliveryTime" className="form-label">Delivery time</label>
                  <select
                    id="np-deliveryTime"
                    className="form-input"
                    value={form.deliveryTime}
                    onChange={set("deliveryTime")}
                  >
                    {DELIVERY_TIMES.map((t) => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>

                <div className="form-field">
                  <label htmlFor="np-timezone" className="form-label">Timezone</label>
                  <select
                    id="np-timezone"
                    className="form-input"
                    value={form.timezone}
                    onChange={set("timezone")}
                  >
                    {TIMEZONES.map((tz) => (
                      <option key={tz.value} value={tz.value}>{tz.label}</option>
                    ))}
                  </select>
                </div>

                <div className="form-field">
                  <label htmlFor="np-prayerFocus" className="form-label">Prayer focus</label>
                  <select
                    id="np-prayerFocus"
                    className="form-input"
                    value={form.prayerFocus}
                    onChange={set("prayerFocus")}
                  >
                    {PRAYER_FOCUS.map((f) => (
                      <option key={f.value} value={f.value}>{f.label}</option>
                    ))}
                  </select>
                </div>

                <div className="form-field">
                  <label htmlFor="np-tone" className="form-label">Prayer tone</label>
                  <select
                    id="np-tone"
                    className="form-input"
                    value={form.tone}
                    onChange={set("tone")}
                  >
                    {TONES.map((t) => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>

              </div>

              {/* ── Checkout area ── */}
              <div style={{ textAlign:"center", marginTop:52 }}>

                {/* Price */}
                <div style={{ marginBottom:28 }}>
                  <div
                    style={{
                      display:        "flex",
                      alignItems:     "flex-start",
                      justifyContent: "center",
                      gap:            4,
                      marginBottom:   6,
                    }}
                  >
                    <span
                      className="font-display"
                      style={{ fontSize:"1rem", color:"var(--cream)", marginTop:8 }}
                    >
                      $
                    </span>
                    <span
                      className="font-display text-gold"
                      style={{ fontSize:"4rem", fontWeight:400, lineHeight:1 }}
                    >
                      5.99
                    </span>
                    <span
                      style={{
                        fontSize:    "0.82rem",
                        color:       "var(--muted)",
                        fontWeight:  300,
                        alignSelf:   "flex-end",
                        marginBottom: 10,
                      }}
                    >
                      /month
                    </span>
                  </div>
                  <p
                    style={{
                      fontSize:      "0.75rem",
                      fontWeight:    300,
                      color:         "rgba(240,232,216,0.3)",
                      letterSpacing: "0.04em",
                    }}
                  >
                    Billed monthly · Cancel anytime
                  </p>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  className="btn-gold submit-btn"
                  disabled={loading}
                  style={{ opacity: loading ? 0.7 : 1, cursor: loading ? "default" : "pointer" }}
                >
                  {loading ? "Opening checkout…" : "Continue to Secure Checkout →"}
                </button>

                {/* Security note */}
                <p
                  style={{
                    marginTop:      14,
                    fontSize:       "0.7rem",
                    fontWeight:     300,
                    color:          "rgba(240,232,216,0.25)",
                    display:        "flex",
                    alignItems:     "center",
                    justifyContent: "center",
                    gap:            5,
                  }}
                >
                  <span>🔒</span> Secure checkout powered by Stripe
                </p>

                {/* Error */}
                {error && (
                  <p style={{ marginTop:16, fontSize:"0.82rem", color:"#e07070", fontWeight:300 }}>
                    {error}
                  </p>
                )}
              </div>

            </form>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════ STYLES */}
      <style>{`
        /* ── Hero mobile ── */
        @media (max-width: 768px) {
          .hero-grid  { grid-template-columns: 1fr !important; gap: 40px !important; }
          .hero-text  { text-align: center; }
          .hero-eyebrow { justify-content: center; }
          .hero-cta   { display: flex; justify-content: center; }
          .hero-price { text-align: center; }
          .hero-card  { justify-content: center !important; order: -1; }
          .scroll-hint { display: none !important; }
        }
        @media (max-width: 390px) {
          .hero-text h1 { font-size: 2.2rem !important; }
        }

        /* ── Mini how-it-works ── */
        .mini-how {
          display:         flex;
          align-items:     flex-start;
          justify-content: center;
        }
        .mini-step {
          flex:            1;
          display:         flex;
          flex-direction:  column;
          align-items:     center;
          gap:             10px;
          text-align:      center;
          padding:         0 12px;
          max-width:       180px;
        }
        .mini-step-circle {
          width:           36px;
          height:          36px;
          border-radius:   50%;
          border:          1px solid rgba(201,169,110,0.3);
          background:      rgba(201,169,110,0.06);
          display:         flex;
          align-items:     center;
          justify-content: center;
          flex-shrink:     0;
        }
        .mini-step-label {
          font-size:   0.78rem;
          font-weight: 300;
          color:       rgba(240,232,216,0.5);
          line-height: 1.4;
        }
        .mini-step-line {
          width:       40px;
          height:      1px;
          background:  rgba(201,169,110,0.18);
          margin-top:  18px;
          flex-shrink: 0;
        }
        @media (max-width: 520px) {
          .mini-step { padding: 0 4px; }
          .mini-step-label { font-size: 0.68rem; }
          .mini-step-circle { width: 30px; height: 30px; }
          .mini-step-line { width: 16px; margin-top: 15px; }
        }

        /* ── Form grid ── */
        .form-grid {
          display:               grid;
          grid-template-columns: 1fr 1fr;
          gap:                   20px;
        }
        @media (max-width: 600px) {
          .form-grid { grid-template-columns: 1fr; }
        }

        /* ── Form fields ── */
        .form-field {
          display:        flex;
          flex-direction: column;
          gap:            8px;
        }
        .form-label {
          font-size:      0.63rem;
          font-weight:    400;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color:          rgba(201,169,110,0.6);
        }
        .form-input {
          background:         rgba(9, 21, 37, 0.8);
          border:             1px solid rgba(201,169,110,0.18);
          border-radius:      4px;
          color:              var(--cream);
          font-family:        var(--font-jost), sans-serif;
          font-size:          1rem;
          font-weight:        300;
          padding:            14px 16px;
          width:              100%;
          outline:            none;
          transition:         border-color 0.2s, background 0.2s;
          -webkit-appearance: none;
          appearance:         none;
        }
        .form-input:focus {
          border-color: rgba(201,169,110,0.4);
          background:   rgba(14,28,50,0.9);
        }
        .form-input::placeholder { color: rgba(240,232,216,0.2); }
        .form-input option        { background: #0d1b2a; color: var(--cream); }

        /* Custom select arrow */
        select.form-input {
          background-image:    url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='7' fill='none'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%23c9a96e' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
          background-repeat:   no-repeat;
          background-position: right 14px center;
          padding-right:       40px;
          cursor:              pointer;
        }

        /* ── Submit button ── */
        .submit-btn {
          width:    100%;
          max-width: 380px;
          padding:  17px 40px;
          font-size: 0.78rem;
        }
        @media (max-width: 600px) {
          .submit-btn { max-width: 100%; }
        }
      `}</style>
    </>
  );
}
