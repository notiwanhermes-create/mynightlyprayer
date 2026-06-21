"use client";

import { useRef, useState } from "react";
import PrayerPreviewCard from "./PrayerPreviewCard";

/* ── Types ── */
type Plan = "email" | "sms";

interface FormState {
  firstName:    string;
  email:        string;
  phoneNumber:  string;
  deliveryTime: string;
  timezone:     string;
  prayerFocus:  string;
  tone:         string;
  smsConsent:   boolean;
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

const TRUST_ITEMS = [
  "No charge today",
  "Cancel anytime",
  "7 nights free",
  "No app needed",
];

const PLAN_CONFIG = {
  email: {
    label:   "Email Prayer",
    icon:    "✉",
    price:   "$5.99",
    trial:   "7 nights free",
    bullets: [
      "Delivered to your inbox",
      "Best for longer prayers",
      "Easy to save and reread",
      "Cancel anytime",
    ],
    ctaText: "Start Email Prayer Free",
  },
  sms: {
    label:   "SMS Prayer",
    icon:    "💬",
    price:   "$9.99",
    trial:   "7 nights free",
    bullets: [
      "Delivered to your phone",
      "Short peaceful nightly prayer",
      "Perfect right before sleep",
      "Cancel anytime",
    ],
    ctaText: "Start SMS Prayer Free",
  },
};

/* ── Component ── */
export default function HomeClient({ smsPriceAvailable = false }: { smsPriceAvailable?: boolean }) {
  const signupRef = useRef<HTMLElement>(null);
  const [plan, setPlan] = useState<Plan>("email");

  const [form, setForm] = useState<FormState>({
    firstName:    "",
    email:        "",
    phoneNumber:  "",
    deliveryTime: "22:00",
    timezone:     "America/New_York",
    prayerFocus:  "peace",
    tone:         "gentle",
    smsConsent:   false,
  });
  const [loading,       setLoading]       = useState(false);
  const [error,         setError]         = useState("");
  const [showCustomize, setShowCustomize] = useState(false);

  const scrollToSignup = () =>
    signupRef.current?.scrollIntoView({ behavior: "smooth" });

  const set = (field: keyof Omit<FormState, "smsConsent">) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((p) => ({ ...p, [field]: e.target.value }));

  const selectPlan = (p: Plan) => {
    if (p === "sms" && !smsPriceAvailable) return;
    setPlan(p);
    setError("");
  };

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
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          plan,
          firstName:    form.firstName,
          email:        plan === "email" ? form.email       : "",
          phoneNumber:  plan === "sms"   ? form.phoneNumber : "",
          deliveryTime: form.deliveryTime,
          timezone:     form.timezone,
          prayerFocus:  form.prayerFocus,
          tone:         form.tone,
          smsConsent:   form.smsConsent,
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

  const cfg = PLAN_CONFIG[plan];

  return (
    <>
      {/* ═══════════════════════════════════════ HERO */}
      <section
        style={{
          display:        "flex",
          flexDirection:  "column",
          justifyContent: "flex-start",
          paddingTop:     100,
          paddingBottom:  60,
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
                  marginBottom: 18,
                }}
              >
                Receive a personal prayer every night — written
                for you, delivered at the bedtime you choose.
              </p>

              {/* Benefit pull-forward */}
              <p
                className="fade-up d4 font-display hero-benefit"
                style={{
                  fontSize:     "1.02rem",
                  fontWeight:   400,
                  fontStyle:    "italic",
                  color:        "var(--navy-text)",
                  opacity:      0.78,
                  marginBottom: 26,
                }}
              >
                Your first prayer can arrive tonight.
              </p>

              {/* Free-trial badge */}
              <div className="fade-up d5 hero-badge" style={{ marginBottom: 22 }}>
                <span className="trial-pill">
                  7 nights free&nbsp;·&nbsp;No charge today&nbsp;·&nbsp;Cancel anytime
                </span>
              </div>

              {/* Hero CTA */}
              <div className="fade-up d6 hero-cta" style={{ marginBottom: 18 }}>
                <button
                  type="button"
                  onClick={scrollToSignup}
                  className="btn-gold hero-btn"
                  style={{ border: "none", cursor: "pointer" }}
                >
                  Start Your Free 7-Day Trial
                </button>
              </div>

              {/* Trust checkmarks */}
              <div className="fade-up d7 hero-trust">
                {TRUST_ITEMS.map(t => (
                  <span key={t} className="trust-item">
                    <span className="trust-check">✓</span>{t}
                  </span>
                ))}
              </div>
            </div>

            {/* ── Right: prayer preview card ── */}
            <div className="fade-up d7 hero-card" style={{ display: "flex", justifyContent: "flex-end" }}>
              <PrayerPreviewCard />
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════ SIGNUP */}
      <section
        ref={signupRef}
        id="signup"
        style={{ padding: "56px 0 100px", position: "relative", zIndex: 1 }}
      >
        <div className="container">

          {/* Section header */}
          <div className="reveal" style={{ textAlign: "center", marginBottom: 48 }}>
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
              marginBottom: 12,
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

          {/* Premium signup card */}
          <div className="signup-card reveal">
            <form onSubmit={handleSubmit}>

              {/* ── STEP 1: Plan cards ── */}
              <p className="form-step-label">Choose how to receive your prayer</p>
              <div className="plan-grid">
                {(["email", "sms"] as Plan[]).map(p => {
                  const c          = PLAN_CONFIG[p];
                  const isSelected = plan === p;
                  const isDisabled = p === "sms" && !smsPriceAvailable;
                  return (
                    <div
                      key={p}
                      className={[
                        "plan-card",
                        isSelected && !isDisabled ? "plan-card-selected" : "",
                        isDisabled ? "plan-card-disabled" : "",
                      ].join(" ")}
                      onClick={() => selectPlan(p)}
                      role="radio"
                      aria-checked={isSelected && !isDisabled}
                      tabIndex={isDisabled ? -1 : 0}
                      onKeyDown={e => (e.key === "Enter" || e.key === " ") && selectPlan(p)}
                    >
                      {/* Selected checkmark badge */}
                      {isSelected && !isDisabled && (
                        <div className="plan-check-badge">✓</div>
                      )}

                      {/* Icon */}
                      <div className="plan-icon">{c.icon}</div>

                      {/* Title */}
                      <div className="plan-title">{c.label}</div>

                      {/* Price */}
                      <div className="plan-price">
                        {isDisabled
                          ? <span style={{ fontSize: "0.8rem", fontWeight: 300, color: "var(--secondary-text)" }}>Coming soon</span>
                          : <>{c.price}<span className="plan-price-period">/month</span></>
                        }
                      </div>

                      {/* Trial badge */}
                      {!isDisabled && (
                        <div className="plan-trial-badge">{c.trial}</div>
                      )}

                      {/* Bullets */}
                      <ul className="plan-bullets">
                        {c.bullets.map(b => (
                          <li key={b}>
                            <span className="plan-bullet-check">✓</span>
                            {b}
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </div>

              <div className="plan-form-divider" />

              {/* ── STEP 2: Contact field (changes based on plan) ── */}
              {plan === "email" ? (
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
              ) : (
                <>
                  <div className="form-field">
                    <label htmlFor="np-phone" className="form-label">Mobile number</label>
                    <input
                      id="np-phone"
                      className="form-input"
                      type="tel"
                      placeholder="+1 555 000 0000"
                      value={form.phoneNumber}
                      onChange={e => setForm(p => ({ ...p, phoneNumber: e.target.value }))}
                      required
                      autoComplete="tel"
                    />
                  </div>
                  <div className="sms-consent-wrap">
                    <label className="sms-consent-label">
                      <input
                        type="checkbox"
                        className="sms-consent-check"
                        checked={form.smsConsent}
                        onChange={e => setForm(p => ({ ...p, smsConsent: e.target.checked }))}
                        required
                      />
                      <span>
                        I agree to receive nightly prayer text messages from My Nightly Prayer.
                        Message and data rates may apply. Reply STOP to opt out at any time.
                      </span>
                    </label>
                  </div>
                </>
              )}

              {/* ── STEP 3: Prayer details ── */}
              <div className="form-grid" style={{ marginTop: 18 }}>
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
                  <label htmlFor="np-deliveryTime" className="form-label">Prayer bedtime</label>
                  <select
                    id="np-deliveryTime"
                    className="form-input"
                    value={form.deliveryTime}
                    onChange={set("deliveryTime")}
                  >
                    {DELIVERY_TIMES.map(t => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Customize toggle */}
              <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 22 }}>
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

              {/* Collapsible: timezone, prayer focus, tone */}
              <div style={{
                overflow:   "hidden",
                maxHeight:  showCustomize ? 500 : 0,
                opacity:    showCustomize ? 1 : 0,
                transition: "max-height 0.35s ease, opacity 0.25s ease",
                marginTop:  showCustomize ? 20 : 0,
              }}>
                <div className="form-field" style={{ marginBottom: 18 }}>
                  <label htmlFor="np-timezone" className="form-label">Timezone</label>
                  <select id="np-timezone" className="form-input" value={form.timezone} onChange={set("timezone")}>
                    {TIMEZONES.map(tz => <option key={tz.value} value={tz.value}>{tz.label}</option>)}
                  </select>
                </div>
                <div className="form-grid">
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

              {/* ── STEP 4: Trial summary ── */}
              <div className="plan-summary">
                <div className="plan-summary-row">
                  <span className="plan-summary-name">{cfg.label}</span>
                  <span className="plan-summary-trial">{cfg.trial}</span>
                </div>
                <div className="plan-summary-then">Then {cfg.price}/month</div>
                <div className="plan-summary-notes">No charge today · Cancel anytime</div>
              </div>

              {/* ── STEP 5: CTA ── */}
              <button
                type="submit"
                className="cta-submit"
                disabled={loading}
                style={{ opacity: loading ? 0.75 : 1, cursor: loading ? "default" : "pointer" }}
              >
                {loading ? "Opening checkout…" : `${cfg.ctaText} →`}
              </button>

              {/* Trust checkmarks below button */}
              <div className="form-trust-grid">
                {TRUST_ITEMS.map(t => (
                  <span key={t} className="trust-item">
                    <span className="trust-check">✓</span>{t}
                  </span>
                ))}
              </div>

              {/* Stripe lock note */}
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
        /* ── Hero responsive ── */
        @media (max-width: 768px) {
          .hero-grid    { grid-template-columns: 1fr !important; gap: 40px !important; }
          .hero-text    { text-align: center; }
          .hero-eyebrow { justify-content: center; }
          .hero-badge   { display: flex; justify-content: center; }
          .hero-cta     { display: flex; justify-content: center; }
          .hero-trust   { justify-content: center; }
          .hero-card    { justify-content: center !important; }
        }
        @media (max-width: 390px) {
          .hero-text h1 { font-size: 2.2rem !important; }
        }

        /* ── Free-trial badge pill ── */
        .trial-pill {
          display:        inline-flex;
          align-items:    center;
          padding:        7px 18px;
          background:     rgba(198,161,91,0.07);
          border:         1px solid rgba(198,161,91,0.3);
          border-radius:  100px;
          font-size:      0.64rem;
          font-weight:    400;
          color:          var(--gold);
          letter-spacing: 0.06em;
          white-space:    nowrap;
        }

        /* ── Hero CTA button ── */
        .hero-btn {
          display:        inline-flex !important;
          padding:        18px 44px !important;
          font-size:      0.82rem !important;
          letter-spacing: 0.10em !important;
          border-radius:  4px !important;
          box-shadow:     0 6px 36px rgba(198,161,91,0.42) !important;
          background:     linear-gradient(135deg, #C9A55C 0%, #A87D3A 100%) !important;
        }
        .hero-btn:hover {
          background: linear-gradient(135deg, #D4AF6A 0%, #B88A45 100%) !important;
          box-shadow: 0 10px 44px rgba(198,161,91,0.54) !important;
          transform:  translateY(-2px) !important;
        }
        @media (max-width: 640px) {
          .hero-btn { width: 100% !important; padding: 19px 32px !important; }
        }

        /* ── Hero trust row ── */
        .hero-trust { display: flex; flex-wrap: wrap; gap: 8px 22px; }

        /* ── Trust checkmark items (hero + form) ── */
        .trust-item {
          display:     inline-flex;
          align-items: center;
          gap:         5px;
          font-size:   0.72rem;
          font-weight: 300;
          color:       rgba(16,42,67,0.5);
        }
        .trust-check {
          color:       var(--gold);
          font-weight: 600;
          font-size:   0.72rem;
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

        /* ── Step label ── */
        .form-step-label {
          font-size:      0.59rem;
          font-weight:    400;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color:          rgba(16,42,67,0.42);
          margin-bottom:  14px;
        }

        /* ── Plan card grid ── */
        .plan-grid {
          display:               grid;
          grid-template-columns: 1fr 1fr;
          gap:                   14px;
          margin-bottom:         28px;
        }
        @media (max-width: 540px) {
          .plan-grid { grid-template-columns: 1fr; }
        }

        /* ── Plan card base ── */
        .plan-card {
          position:      relative;
          background:    rgba(255,255,255,0.88);
          border:        1.5px solid rgba(16,42,67,0.1);
          border-radius: 14px;
          padding:       22px 20px 18px;
          cursor:        pointer;
          transition:    border-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease, opacity 0.2s ease;
          user-select:   none;
          outline:       none;
        }
        .plan-card:focus-visible {
          box-shadow: 0 0 0 3px rgba(198,161,91,0.35);
        }
        .plan-card:hover:not(.plan-card-disabled):not(.plan-card-selected) {
          border-color: rgba(198,161,91,0.4);
        }

        /* ── Selected state ── */
        .plan-card-selected {
          border-color: var(--gold) !important;
          box-shadow:   0 0 0 1px rgba(198,161,91,0.25), 0 8px 28px rgba(198,161,91,0.13) !important;
          transform:    translateY(-2px);
        }

        /* ── Disabled (coming soon) state ── */
        .plan-card-disabled {
          opacity: 0.48;
          cursor:  not-allowed;
        }

        /* ── Gold checkmark badge on selected card ── */
        .plan-check-badge {
          position:        absolute;
          top:             -9px;
          right:           -9px;
          width:           22px;
          height:          22px;
          background:      var(--gold);
          border-radius:   50%;
          display:         flex;
          align-items:     center;
          justify-content: center;
          font-size:       0.62rem;
          font-weight:     700;
          color:           #102A43;
          box-shadow:      0 2px 8px rgba(198,161,91,0.5);
        }

        /* ── Card icon ── */
        .plan-icon { font-size: 1.3rem; line-height: 1; margin-bottom: 10px; }

        /* ── Card title ── */
        .plan-title {
          font-family:   var(--font-jost), sans-serif;
          font-size:     0.88rem;
          font-weight:   500;
          color:         var(--navy-text);
          margin-bottom: 4px;
        }

        /* ── Card price ── */
        .plan-price {
          font-family:   var(--font-jost), sans-serif;
          font-size:     1.25rem;
          font-weight:   600;
          color:         var(--navy-text);
          margin-bottom: 8px;
          line-height:   1;
        }
        .plan-price-period {
          font-size:   0.68rem;
          font-weight: 300;
          color:       var(--secondary-text);
        }

        /* ── Trial badge ── */
        .plan-trial-badge {
          display:        inline-flex;
          align-items:    center;
          padding:        3px 10px;
          background:     rgba(198,161,91,0.08);
          border:         1px solid rgba(198,161,91,0.28);
          border-radius:  20px;
          font-size:      0.58rem;
          font-weight:    500;
          color:          var(--gold);
          letter-spacing: 0.05em;
          text-transform: uppercase;
          margin-bottom:  14px;
        }

        /* ── Benefit bullets ── */
        .plan-bullets {
          list-style:     none;
          padding:        0;
          margin:         0;
          display:        flex;
          flex-direction: column;
          gap:            6px;
        }
        .plan-bullets li {
          display:     flex;
          align-items: flex-start;
          gap:         7px;
          font-size:   0.74rem;
          font-weight: 300;
          color:       var(--secondary-text);
          line-height: 1.45;
        }
        .plan-bullet-check {
          color:       var(--gold);
          font-size:   0.65rem;
          font-weight: 600;
          margin-top:  1px;
          flex-shrink: 0;
        }

        /* ── Divider after plan cards ── */
        .plan-form-divider {
          height:        1px;
          background:    linear-gradient(to right, transparent, rgba(198,161,91,0.2), transparent);
          margin-bottom: 24px;
        }

        /* ── SMS consent ── */
        .sms-consent-wrap {
          margin-top:    12px;
          padding:       14px 16px;
          background:    rgba(198,161,91,0.04);
          border:        1px solid rgba(198,161,91,0.16);
          border-radius: 8px;
        }
        .sms-consent-label {
          display:     flex;
          align-items: flex-start;
          gap:         10px;
          cursor:      pointer;
          font-size:   0.74rem;
          font-weight: 300;
          color:       var(--secondary-text);
          line-height: 1.55;
        }
        .sms-consent-check {
          margin-top:   2px;
          flex-shrink:  0;
          width:        15px;
          height:       15px;
          accent-color: var(--gold);
          cursor:       pointer;
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
        .form-field { display: flex; flex-direction: column; gap: 7px; }
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

        /* ── Plan summary box ── */
        .plan-summary {
          background:    rgba(198,161,91,0.05);
          border:        1px solid rgba(198,161,91,0.16);
          border-radius: 12px;
          padding:       18px 24px;
          margin:        26px 0 18px;
          text-align:    center;
        }
        .plan-summary-row {
          display:         flex;
          align-items:     center;
          justify-content: center;
          gap:             10px;
          margin-bottom:   5px;
          flex-wrap:       wrap;
        }
        .plan-summary-name {
          font-family: var(--font-jost), sans-serif;
          font-size:   0.95rem;
          font-weight: 400;
          color:       var(--navy-text);
        }
        .plan-summary-trial {
          display:        inline-flex;
          padding:        2px 10px;
          background:     rgba(198,161,91,0.1);
          border:         1px solid rgba(198,161,91,0.28);
          border-radius:  20px;
          font-size:      0.58rem;
          font-weight:    500;
          color:          var(--gold);
          letter-spacing: 0.05em;
          text-transform: uppercase;
        }
        .plan-summary-then {
          font-size:     0.8rem;
          font-weight:   300;
          color:         var(--secondary-text);
          margin-bottom: 3px;
        }
        .plan-summary-notes {
          font-size:      0.66rem;
          font-weight:    300;
          color:          rgba(16,42,67,0.4);
          letter-spacing: 0.02em;
        }

        /* ── CTA submit button ── */
        .cta-submit {
          display:        block;
          width:          100%;
          padding:        20px 40px;
          background:     linear-gradient(135deg, #C9A55C 0%, #A87D3A 100%);
          color:          #102a43;
          border:         none;
          border-radius:  8px;
          font-family:    var(--font-jost), sans-serif;
          font-size:      0.86rem;
          font-weight:    600;
          letter-spacing: 0.10em;
          text-transform: uppercase;
          transition:     background 0.2s, box-shadow 0.2s, transform 0.15s;
          box-shadow:     0 4px 28px rgba(198,161,91,0.38), 0 1px 4px rgba(168,125,58,0.18);
        }
        .cta-submit:hover {
          background: linear-gradient(135deg, #D4AF6A 0%, #B88A45 100%);
          box-shadow: 0 8px 36px rgba(198,161,91,0.52), 0 2px 8px rgba(168,125,58,0.22);
          transform:  translateY(-2px);
        }
        .cta-submit:active {
          transform:  translateY(0);
          box-shadow: 0 2px 8px rgba(198,161,91,0.22);
        }

        /* ── Trust grid below CTA ── */
        .form-trust-grid {
          display:         flex;
          flex-wrap:       wrap;
          justify-content: center;
          gap:             8px 20px;
          margin-top:      16px;
          margin-bottom:   4px;
        }

        /* ── Stripe lock note ── */
        .trust-note {
          display:         flex;
          align-items:     center;
          justify-content: center;
          gap:             6px;
          margin-top:      10px;
          font-size:       0.65rem;
          font-weight:     300;
          color:           rgba(16,42,67,0.36);
          letter-spacing:  0.03em;
        }
      `}</style>
    </>
  );
}
