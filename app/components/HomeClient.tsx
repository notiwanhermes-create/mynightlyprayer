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
      {/* ═══════════════════════════════════════ DARK HERO */}
      <section className="hn-hero">
        {/* Ambient gold glow behind the card */}
        <div className="hn-hero__glow" aria-hidden="true" />

        <div className="container hn-hero__inner">
          <div className="hn-hero__grid">

            {/* ── Left: copy ── */}
            <div className="hn-hero__copy">
              <p className="hn-hero__eyebrow fade-up d1">
                <span className="hn-hero__eyebrow-rule" />
                A prayer for every night
                <span className="hn-hero__eyebrow-rule" />
              </p>

              <h1 className="hn-hero__h1 font-display fade-up d2">
                End your day<br />
                with{" "}<em className="hn-hero__em">peace.</em>
              </h1>

              <p className="hn-hero__sub fade-up d3">
                Receive a personal prayer every night — written
                for you, delivered at the bedtime you choose.
              </p>

              <p className="hn-hero__pull font-display fade-up d4">
                Your first prayer can arrive tonight.
              </p>

              <div className="fade-up d5">
                <span className="hn-hero__pill">
                  7 nights free · No charge today · Cancel anytime
                </span>
              </div>

              <div className="fade-up d6 hn-hero__cta-wrap">
                <button
                  type="button"
                  onClick={scrollToSignup}
                  className="btn-gold hn-hero__cta"
                  style={{ border: "none", cursor: "pointer" }}
                >
                  Start Your Free 7-Day Trial
                </button>
              </div>

              <div className="hn-hero__trust fade-up d7">
                {TRUST_ITEMS.map(t => (
                  <span key={t} className="hn-hero__trust-item">
                    <span className="hn-hero__trust-check">✓</span>{t}
                  </span>
                ))}
              </div>
            </div>

            {/* ── Right: prayer preview card ── */}
            <div className="hn-hero__card fade-up d5">
              <PrayerPreviewCard />
            </div>

          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════ SIGNUP */}
      <section
        ref={signupRef}
        id="signup"
        className="hn-signup"
      >
        <div className="container">

          {/* Section header */}
          <div className="hn-signup__header reveal">
            <p className="hn-signup__eyebrow">Begin tonight</p>
            <h2 className="hn-signup__h2 font-display">
              Set up your nightly prayer
            </h2>
            <p className="hn-signup__sub">
              Takes less than 30 seconds. Your first prayer arrives tonight — free.
            </p>
          </div>

          {/* Panel */}
          <div className="hn-panel reveal">
            <form onSubmit={handleSubmit}>

              {/* ── Plan tiles ── */}
              <p className="hn-step-label">Choose how to receive your prayer</p>
              <div className="hn-tiles">
                {(["email", "sms"] as Plan[]).map(p => {
                  const c          = PLAN_CONFIG[p];
                  const isSelected = plan === p;
                  const isDisabled = p === "sms" && !smsPriceAvailable;
                  return (
                    <div
                      key={p}
                      className={[
                        "hn-tile",
                        isSelected && !isDisabled ? "hn-tile--on"  : "",
                        isDisabled                ? "hn-tile--off" : "",
                      ].join(" ")}
                      onClick={() => selectPlan(p)}
                      role="radio"
                      aria-checked={isSelected && !isDisabled}
                      tabIndex={isDisabled ? -1 : 0}
                      onKeyDown={e => (e.key === "Enter" || e.key === " ") && selectPlan(p)}
                    >
                      {/* Gold left accent bar — visible when selected */}
                      <span className="hn-tile__accent" aria-hidden="true" />

                      <div className="hn-tile__head">
                        <span className="hn-tile__icon">{c.icon}</span>
                        <div className="hn-tile__meta">
                          <div className="hn-tile__name">{c.label}</div>
                          <div className="hn-tile__price">
                            {isDisabled
                              ? <span className="hn-tile__soon">Coming soon</span>
                              : <>{c.price}<span className="hn-tile__per">/mo</span></>
                            }
                          </div>
                        </div>
                        {isSelected && !isDisabled && (
                          <div className="hn-tile__check">✓</div>
                        )}
                      </div>

                      {!isDisabled && (
                        <div className="hn-tile__trial">{c.trial}</div>
                      )}

                      <ul className="hn-tile__list">
                        {c.bullets.map(b => (
                          <li key={b}>
                            <span className="hn-tile__dot">✓</span>{b}
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </div>

              <div className="hn-rule" />

              {/* ── Contact field (changes by plan) ── */}
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
                      placeholder="+1 226 724 1954"
                      value={form.phoneNumber}
                      onChange={e => setForm(p => ({ ...p, phoneNumber: e.target.value }))}
                      required
                      autoComplete="tel"
                    />
                    <span className="hn-field-hint">
                      Include country code — e.g. +1 for US/Canada
                    </span>
                  </div>
                  <div className="hn-consent">
                    <label className="hn-consent__label">
                      <input
                        type="checkbox"
                        className="hn-consent__check"
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

              {/* ── Name + bedtime ── */}
              <div className="form-grid" style={{ marginTop: 20 }}>
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

              {/* ── Customise toggle ── */}
              <div className="hn-toggle-row">
                <span className="hn-toggle-line" />
                <button
                  type="button"
                  onClick={() => setShowCustomize(v => !v)}
                  className="hn-toggle-btn"
                >
                  {showCustomize ? "Hide options" : "Customise prayer"}
                  <svg
                    width="10" height="6" viewBox="0 0 10 6" fill="none"
                    style={{
                      transition: "transform 0.25s ease",
                      transform:  showCustomize ? "rotate(180deg)" : "rotate(0deg)",
                    }}
                  >
                    <path d="M1 1l4 4 4-4" stroke="var(--gold)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                <span className="hn-toggle-line" />
              </div>

              {/* ── Collapsible: timezone, focus, tone ── */}
              <div
                className="hn-customize"
                style={{
                  maxHeight:  showCustomize ? 500 : 0,
                  opacity:    showCustomize ? 1 : 0,
                  marginTop:  showCustomize ? 20 : 0,
                }}
              >
                <div className="form-field" style={{ marginBottom: 18 }}>
                  <label htmlFor="np-timezone" className="form-label">Timezone</label>
                  <select
                    id="np-timezone"
                    className="form-input"
                    value={form.timezone}
                    onChange={set("timezone")}
                  >
                    {TIMEZONES.map(tz => (
                      <option key={tz.value} value={tz.value}>{tz.label}</option>
                    ))}
                  </select>
                </div>
                <div className="form-grid">
                  <div className="form-field">
                    <label htmlFor="np-prayerFocus" className="form-label">Prayer focus</label>
                    <select
                      id="np-prayerFocus"
                      className="form-input"
                      value={form.prayerFocus}
                      onChange={set("prayerFocus")}
                    >
                      {PRAYER_FOCUS.map(f => (
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
                      {TONES.map(t => (
                        <option key={t.value} value={t.value}>{t.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* ── Plan summary ── */}
              <div className="hn-summary">
                <div className="hn-summary__row">
                  <span className="hn-summary__name">{cfg.label}</span>
                  <span className="hn-summary__badge">{cfg.trial}</span>
                </div>
                <p className="hn-summary__price">Then {cfg.price}/month</p>
                <p className="hn-summary__note">No charge today · Cancel anytime</p>
              </div>

              {/* ── CTA ── */}
              <button
                type="submit"
                className="hn-cta"
                disabled={loading}
                style={{ opacity: loading ? 0.75 : 1, cursor: loading ? "default" : "pointer" }}
              >
                {loading ? "Opening checkout…" : `${cfg.ctaText} →`}
              </button>

              {/* ── Trust row ── */}
              <div className="hn-trust-row">
                {TRUST_ITEMS.map(t => (
                  <span key={t} className="hn-trust-item">
                    <span className="hn-trust-check">✓</span>{t}
                  </span>
                ))}
              </div>

              {/* ── Stripe note ── */}
              <p className="hn-stripe-note">
                <svg width="11" height="14" viewBox="0 0 11 14" fill="none" style={{ flexShrink: 0 }}>
                  <rect x="1" y="5" width="9" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.2" />
                  <path d="M3 5V3.5a2.5 2.5 0 015 0V5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                </svg>
                Secure checkout powered by Stripe
              </p>

              {error && (
                <p className="hn-error">{error}</p>
              )}

            </form>
          </div>

        </div>
      </section>

      {/* ══════════════════════════════════════════════ STYLES */}
      <style>{`

        /* ═══════════════════════════════════
           DARK HERO — "Nocturne"
        ═══════════════════════════════════ */

        .hn-hero {
          position:   relative;
          background: linear-gradient(160deg, #09152A 0%, #0c1f3e 52%, #091525 100%);
          padding:    130px 0 100px;
          overflow:   hidden;
          z-index:    1;
        }

        /* Subtle star field — small bright dots */
        .hn-hero::before {
          content:          '';
          position:         absolute;
          inset:            0;
          z-index:          0;
          pointer-events:   none;
          background-image:
            radial-gradient(1.5px 1.5px at 10% 14%, rgba(255,252,245,0.58) 0%, transparent 100%),
            radial-gradient(1px   1px   at 22%  7%, rgba(255,252,245,0.36) 0%, transparent 100%),
            radial-gradient(2px   2px   at 37% 20%, rgba(201,165,92,0.62)  0%, transparent 100%),
            radial-gradient(1px   1px   at 53% 11%, rgba(255,252,245,0.40) 0%, transparent 100%),
            radial-gradient(1px   1px   at 66% 17%, rgba(255,252,245,0.28) 0%, transparent 100%),
            radial-gradient(1.5px 1.5px at 80%  6%, rgba(201,165,92,0.50)  0%, transparent 100%),
            radial-gradient(1px   1px   at 91% 26%, rgba(255,252,245,0.38) 0%, transparent 100%),
            radial-gradient(1px   1px   at  6% 40%, rgba(255,252,245,0.22) 0%, transparent 100%),
            radial-gradient(1px   1px   at 17% 53%, rgba(201,165,92,0.30)  0%, transparent 100%),
            radial-gradient(1px   1px   at 46% 46%, rgba(255,252,245,0.16) 0%, transparent 100%),
            radial-gradient(1px   1px   at 62% 59%, rgba(255,252,245,0.12) 0%, transparent 100%),
            radial-gradient(1.5px 1.5px at 84% 44%, rgba(201,165,92,0.26)  0%, transparent 100%),
            radial-gradient(1px   1px   at 95% 52%, rgba(255,252,245,0.18) 0%, transparent 100%),
            radial-gradient(1px   1px   at 29% 68%, rgba(255,252,245,0.10) 0%, transparent 100%),
            radial-gradient(1px   1px   at 55% 73%, rgba(201,165,92,0.17)  0%, transparent 100%),
            radial-gradient(1px   1px   at 74% 71%, rgba(255,252,245,0.12) 0%, transparent 100%);
          animation: hnStarGlow 20s ease-in-out infinite alternate;
        }

        @keyframes hnStarGlow {
          0%   { opacity: 0.5; }
          100% { opacity: 1;   }
        }

        /* Bottom cream fade — blends hero into signup */
        .hn-hero::after {
          content:        '';
          position:       absolute;
          bottom:         0;
          left:           0;
          right:          0;
          height:         120px;
          background:     linear-gradient(to bottom, rgba(247,241,232,0) 0%, rgba(247,241,232,1) 100%);
          pointer-events: none;
          z-index:        1;
        }

        /* Warm gold ambient glow (top-right, behind card) */
        .hn-hero__glow {
          position:       absolute;
          top:            -20%;
          right:          -8%;
          width:          65%;
          height:         90%;
          background:     radial-gradient(ellipse at 65% 25%, rgba(201,165,92,0.08) 0%, transparent 62%);
          pointer-events: none;
          z-index:        0;
        }

        .hn-hero__inner {
          position: relative;
          z-index:  2;
        }

        .hn-hero__grid {
          display:               grid;
          grid-template-columns: 1fr 1fr;
          gap:                   72px;
          align-items:           center;
        }

        @media (max-width: 840px) {
          .hn-hero { padding: 110px 0 90px; }
          .hn-hero__grid {
            grid-template-columns: 1fr;
            gap: 56px;
          }
          .hn-hero__copy { text-align: center; }
          .hn-hero__eyebrow { justify-content: center; }
          .hn-hero__trust { justify-content: center; }
          .hn-hero__card { display: flex; justify-content: center; }
          .hn-hero__cta-wrap { display: flex; justify-content: center; }
        }

        /* ── Eyebrow ── */
        .hn-hero__eyebrow {
          display:        flex;
          align-items:    center;
          gap:            12px;
          font-size:      0.58rem;
          font-weight:    400;
          letter-spacing: 0.24em;
          text-transform: uppercase;
          color:          rgba(201,165,92,0.72);
          margin-bottom:  28px;
        }
        .hn-hero__eyebrow-rule {
          display:    inline-block;
          width:      22px;
          height:     1px;
          background: rgba(201,165,92,0.28);
          flex-shrink: 0;
        }

        /* ── Headline ── */
        .hn-hero__h1 {
          font-size:      clamp(2.6rem, 6.5vw, 4.4rem);
          font-weight:    400;
          font-style:     italic;
          line-height:    1.11;
          letter-spacing: -0.02em;
          color:          rgba(255,252,245,0.96);
          margin-bottom:  26px;
        }
        .hn-hero__em {
          font-style:              italic;
          background:              linear-gradient(135deg, #DABC6E 0%, #C6A15B 55%, #a87c36 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip:         text;
        }
        @media (max-width: 400px) {
          .hn-hero__h1 { font-size: 2.4rem; }
        }

        /* ── Body copy ── */
        .hn-hero__sub {
          font-size:    1rem;
          font-weight:  300;
          line-height:  1.84;
          color:        rgba(255,252,245,0.46);
          max-width:    410px;
          margin-bottom: 16px;
        }
        @media (max-width: 840px) {
          .hn-hero__sub { margin: 0 auto 16px; }
        }

        .hn-hero__pull {
          font-size:    1rem;
          font-style:   italic;
          color:        rgba(255,252,245,0.58);
          margin-bottom: 28px;
        }

        /* ── Trial pill ── */
        .hn-hero__pill {
          display:        inline-flex;
          align-items:    center;
          padding:        8px 18px;
          border:         1px solid rgba(201,165,92,0.2);
          border-radius:  100px;
          font-size:      0.6rem;
          font-weight:    400;
          letter-spacing: 0.07em;
          color:          rgba(201,165,92,0.62);
          margin-bottom:  24px;
          white-space:    nowrap;
        }

        /* ── Hero CTA ── */
        .hn-hero__cta {
          font-size:      0.82rem !important;
          font-weight:    600 !important;
          padding:        18px 46px !important;
          letter-spacing: 0.12em !important;
          border-radius:  5px !important;
          box-shadow:     0 8px 44px rgba(198,161,91,0.42) !important;
          background:     linear-gradient(135deg, #C9A55C 0%, #A87D3A 100%) !important;
          margin-bottom:  26px;
        }
        .hn-hero__cta:hover {
          box-shadow: 0 12px 52px rgba(198,161,91,0.58) !important;
          transform:  translateY(-2px) !important;
        }
        @media (max-width: 640px) {
          .hn-hero__cta { width: 100% !important; padding: 19px 32px !important; }
        }

        /* ── Trust items (hero) ── */
        .hn-hero__trust {
          display:   flex;
          flex-wrap: wrap;
          gap:       6px 22px;
        }
        .hn-hero__trust-item {
          display:     inline-flex;
          align-items: center;
          gap:         6px;
          font-size:   0.7rem;
          font-weight: 300;
          color:       rgba(255,252,245,0.32);
        }
        .hn-hero__trust-check {
          color:       rgba(201,165,92,0.52);
          font-weight: 600;
          font-size:   0.64rem;
        }

        /* ── Card ── */
        .hn-hero__card {
          filter: drop-shadow(0 24px 72px rgba(201,165,92,0.09))
                  drop-shadow(0 8px 24px rgba(9,21,42,0.55));
        }

        /* ═══════════════════════════════════
           SIGNUP ZONE — warm cream
        ═══════════════════════════════════ */

        .hn-signup {
          background: #F7F1E8;
          padding:    72px 0 104px;
          position:   relative;
          z-index:    1;
        }

        .hn-signup__header {
          text-align:    center;
          margin-bottom: 48px;
        }
        .hn-signup__eyebrow {
          font-size:      0.58rem;
          font-weight:    400;
          letter-spacing: 0.26em;
          text-transform: uppercase;
          color:          var(--gold);
          margin-bottom:  16px;
        }
        .hn-signup__h2 {
          font-size:    clamp(1.9rem, 4vw, 2.8rem);
          font-weight:  400;
          font-style:   italic;
          color:        var(--navy-text);
          line-height:  1.2;
          margin-bottom: 12px;
        }
        .hn-signup__sub {
          font-size:  0.88rem;
          font-weight: 300;
          color:      var(--secondary-text);
          line-height: 1.72;
          max-width:  360px;
          margin:     0 auto;
        }

        /* ═══════════════════════════════════
           SIGNUP PANEL
        ═══════════════════════════════════ */

        .hn-panel {
          background:      rgba(255,255,255,0.9);
          border:          1px solid rgba(16,42,67,0.07);
          border-radius:   20px;
          box-shadow:
            0 1px 0 rgba(255,255,255,0.95) inset,
            0 12px 64px rgba(16,42,67,0.08),
            0 2px 10px rgba(16,42,67,0.04);
          max-width:       780px;
          margin:          0 auto;
          padding:         52px 60px 56px;
          backdrop-filter: blur(12px);
        }
        @media (max-width: 720px) {
          .hn-panel { padding: 38px 26px 44px; border-radius: 16px; }
        }

        /* ═══════════════════════════════════
           PLAN TILES
        ═══════════════════════════════════ */

        .hn-step-label {
          font-size:      0.57rem;
          font-weight:    400;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color:          rgba(16,42,67,0.34);
          margin-bottom:  14px;
        }

        .hn-tiles {
          display:               grid;
          grid-template-columns: 1fr 1fr;
          gap:                   12px;
          margin-bottom:         26px;
        }
        @media (max-width: 520px) {
          .hn-tiles { grid-template-columns: 1fr; }
        }

        /* Base tile */
        .hn-tile {
          position:      relative;
          background:    #ffffff;
          border:        1.5px solid rgba(16,42,67,0.08);
          border-radius: 12px;
          padding:       18px 16px 16px 20px;
          cursor:        pointer;
          transition:    border-color 0.2s, box-shadow 0.2s, background 0.2s;
          user-select:   none;
          outline:       none;
          overflow:      hidden;
        }
        /* Gold left accent bar */
        .hn-tile__accent {
          position:   absolute;
          left:       0;
          top:        0;
          bottom:     0;
          width:      3px;
          background: linear-gradient(to bottom, #D8B96C, #a87c36);
          opacity:    0;
          transition: opacity 0.22s;
          pointer-events: none;
        }
        .hn-tile:hover:not(.hn-tile--off):not(.hn-tile--on) {
          border-color: rgba(198,161,91,0.26);
        }
        .hn-tile--on {
          border-color: rgba(198,161,91,0.26);
          background:   #fffdf8;
          box-shadow:   0 3px 18px rgba(198,161,91,0.09);
        }
        .hn-tile--on .hn-tile__accent { opacity: 1; }
        .hn-tile--off {
          opacity: 0.44;
          cursor:  not-allowed;
        }
        .hn-tile:focus-visible {
          box-shadow: 0 0 0 3px rgba(198,161,91,0.28);
        }

        .hn-tile__head {
          display:       flex;
          align-items:   flex-start;
          gap:           10px;
          margin-bottom: 10px;
        }
        .hn-tile__icon {
          font-size:   1.1rem;
          line-height: 1;
          margin-top:  1px;
          flex-shrink: 0;
        }
        .hn-tile__meta { flex: 1; min-width: 0; }
        .hn-tile__name {
          font-size:     0.82rem;
          font-weight:   500;
          color:         var(--navy-text);
          margin-bottom: 3px;
        }
        .hn-tile__price {
          font-size:   1.15rem;
          font-weight: 600;
          color:       var(--navy-text);
          line-height: 1;
        }
        .hn-tile__per {
          font-size:   0.64rem;
          font-weight: 300;
          color:       var(--secondary-text);
        }
        .hn-tile__soon {
          font-size:   0.75rem;
          font-weight: 300;
          color:       var(--secondary-text);
        }
        .hn-tile__check {
          width:           20px;
          height:          20px;
          flex-shrink:     0;
          background:      linear-gradient(135deg, #C9A55C, #a87c36);
          border-radius:   50%;
          display:         flex;
          align-items:     center;
          justify-content: center;
          font-size:       0.58rem;
          font-weight:     700;
          color:           #102A43;
          box-shadow:      0 2px 8px rgba(198,161,91,0.4);
        }
        .hn-tile__trial {
          display:        inline-flex;
          padding:        2px 9px;
          background:     rgba(198,161,91,0.07);
          border:         1px solid rgba(198,161,91,0.2);
          border-radius:  20px;
          font-size:      0.55rem;
          font-weight:    500;
          color:          var(--gold);
          letter-spacing: 0.06em;
          text-transform: uppercase;
          margin-bottom:  11px;
        }
        .hn-tile__list {
          list-style:     none;
          padding:        0;
          margin:         0;
          display:        flex;
          flex-direction: column;
          gap:            5px;
        }
        .hn-tile__list li {
          display:     flex;
          align-items: flex-start;
          gap:         7px;
          font-size:   0.72rem;
          font-weight: 300;
          color:       var(--secondary-text);
          line-height: 1.44;
        }
        .hn-tile__dot {
          color:       var(--gold);
          font-size:   0.6rem;
          font-weight: 600;
          margin-top:  2px;
          flex-shrink: 0;
        }

        /* ═══════════════════════════════════
           FORM ELEMENTS
        ═══════════════════════════════════ */

        .hn-rule {
          height:        1px;
          background:    linear-gradient(to right, transparent, rgba(198,161,91,0.16), transparent);
          margin-bottom: 22px;
        }

        .hn-field-hint {
          font-size: 0.6rem;
          color:     rgba(16,42,67,0.35);
          margin-top: 2px;
        }

        /* SMS consent */
        .hn-consent {
          margin-top:    12px;
          padding:       13px 15px;
          background:    rgba(198,161,91,0.04);
          border:        1px solid rgba(198,161,91,0.14);
          border-radius: 8px;
        }
        .hn-consent__label {
          display:     flex;
          align-items: flex-start;
          gap:         10px;
          cursor:      pointer;
          font-size:   0.72rem;
          font-weight: 300;
          color:       var(--secondary-text);
          line-height: 1.55;
        }
        .hn-consent__check {
          margin-top:   2px;
          flex-shrink:  0;
          width:        14px;
          height:       14px;
          accent-color: var(--gold);
          cursor:       pointer;
        }

        /* Customise toggle */
        .hn-toggle-row {
          display:     flex;
          align-items: center;
          gap:         14px;
          margin-top:  22px;
        }
        .hn-toggle-line {
          flex:       1;
          height:     1px;
          background: rgba(16,42,67,0.06);
        }
        .hn-toggle-btn {
          background:     transparent;
          border:         1px solid rgba(198,161,91,0.26);
          border-radius:  100px;
          cursor:         pointer;
          font-size:      0.6rem;
          font-weight:    400;
          color:          var(--secondary-text);
          letter-spacing: 0.09em;
          text-transform: uppercase;
          display:        inline-flex;
          align-items:    center;
          gap:            8px;
          padding:        8px 18px;
          transition:     background 0.18s;
          white-space:    nowrap;
          outline:        none;
        }
        .hn-toggle-btn:hover { background: rgba(198,161,91,0.05); }

        .hn-customize {
          overflow:   hidden;
          transition: max-height 0.35s ease, opacity 0.25s ease;
        }

        /* Plan summary */
        .hn-summary {
          margin:        26px 0 18px;
          padding:       18px 22px;
          background:    rgba(198,161,91,0.04);
          border:        1px solid rgba(198,161,91,0.13);
          border-radius: 10px;
          text-align:    center;
        }
        .hn-summary__row {
          display:         flex;
          align-items:     center;
          justify-content: center;
          gap:             10px;
          flex-wrap:       wrap;
          margin-bottom:   5px;
        }
        .hn-summary__name {
          font-size:   0.92rem;
          font-weight: 400;
          color:       var(--navy-text);
        }
        .hn-summary__badge {
          display:        inline-flex;
          padding:        2px 10px;
          background:     rgba(198,161,91,0.08);
          border:         1px solid rgba(198,161,91,0.2);
          border-radius:  20px;
          font-size:      0.54rem;
          font-weight:    500;
          color:          var(--gold);
          letter-spacing: 0.07em;
          text-transform: uppercase;
        }
        .hn-summary__price {
          font-size:     0.78rem;
          font-weight:   300;
          color:         var(--secondary-text);
          margin-bottom: 3px;
        }
        .hn-summary__note {
          font-size:   0.63rem;
          font-weight: 300;
          color:       rgba(16,42,67,0.38);
        }

        /* CTA button */
        .hn-cta {
          display:        block;
          width:          100%;
          padding:        20px 40px;
          background:     linear-gradient(135deg, #C9A55C 0%, #A87D3A 100%);
          color:          #102A43;
          border:         none;
          border-radius:  7px;
          font-family:    var(--font-jost), sans-serif;
          font-size:      0.86rem;
          font-weight:    600;
          letter-spacing: 0.10em;
          text-transform: uppercase;
          transition:     box-shadow 0.2s, transform 0.15s;
          box-shadow:     0 4px 28px rgba(198,161,91,0.34);
        }
        .hn-cta:hover {
          box-shadow: 0 8px 42px rgba(198,161,91,0.52);
          transform:  translateY(-1px);
        }
        .hn-cta:active {
          transform:  translateY(0);
          box-shadow: 0 2px 10px rgba(198,161,91,0.22);
        }

        /* Trust row (below CTA) */
        .hn-trust-row {
          display:         flex;
          flex-wrap:       wrap;
          justify-content: center;
          gap:             8px 20px;
          margin-top:      16px;
          margin-bottom:   4px;
        }
        .hn-trust-item {
          display:     inline-flex;
          align-items: center;
          gap:         5px;
          font-size:   0.7rem;
          font-weight: 300;
          color:       rgba(16,42,67,0.42);
        }
        .hn-trust-check {
          color:       var(--gold);
          font-weight: 600;
          font-size:   0.68rem;
        }

        /* Stripe note */
        .hn-stripe-note {
          display:         flex;
          align-items:     center;
          justify-content: center;
          gap:             6px;
          margin-top:      10px;
          font-size:       0.62rem;
          font-weight:     300;
          color:           rgba(16,42,67,0.3);
          letter-spacing:  0.03em;
        }

        /* Error */
        .hn-error {
          margin-top:  14px;
          text-align:  center;
          font-size:   0.82rem;
          color:       #c05050;
          font-weight: 300;
        }

      `}</style>
    </>
  );
}
