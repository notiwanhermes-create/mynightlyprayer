"use client";

import { useState } from "react";

/* ── Delivery time options (24-hour values) ── */
const DELIVERY_TIMES = [
  { value: "06:00", label: "6:00 AM" },
  { value: "07:00", label: "7:00 AM" },
  { value: "08:00", label: "8:00 AM" },
  { value: "09:00", label: "9:00 AM" },
  { value: "18:00", label: "6:00 PM" },
  { value: "19:00", label: "7:00 PM" },
  { value: "20:00", label: "8:00 PM" },
  { value: "21:00", label: "9:00 PM" },
  { value: "21:30", label: "9:30 PM" },
  { value: "22:00", label: "10:00 PM" },
  { value: "22:30", label: "10:30 PM" },
  { value: "23:00", label: "11:00 PM" },
] as const;

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

const FOCUS_OPTIONS = [
  { value: "peace",       label: "Peace" },
  { value: "protection",  label: "Protection" },
  { value: "gratitude",   label: "Gratitude" },
  { value: "healing",     label: "Healing" },
  { value: "forgiveness", label: "Forgiveness" },
  { value: "family",      label: "Family" },
  { value: "strength",    label: "Strength" },
] as const;

const TONE_OPTIONS = [
  { value: "gentle",   label: "Gentle and hopeful" },
  { value: "peaceful", label: "Short and peaceful" },
  { value: "emotional", label: "Deep and emotional" },
  { value: "faith",    label: "Faith-filled" },
] as const;

interface ManageClientProps {
  token:         string;
  firstName:     string;
  deliveryTime:  string;
  timezone:      string;
  prayerFocus:   string;
  tone:          string;
  prayerRequest: string;
  isActive:      boolean;
  portalError:   boolean;
}

export default function ManageClient({
  token,
  firstName:     initFirstName,
  deliveryTime:  initDeliveryTime,
  timezone:      initTimezone,
  prayerFocus:   initPrayerFocus,
  tone:          initTone,
  prayerRequest: initPrayerRequest,
  isActive:      initIsActive,
  portalError,
}: ManageClientProps) {
  /* ── form state ── */
  const [firstName,     setFirstName]     = useState(initFirstName);
  const [deliveryTime,  setDeliveryTime]  = useState(initDeliveryTime);
  const [timezone,      setTimezone]      = useState(initTimezone);
  const [prayerFocus,   setPrayerFocus]   = useState(initPrayerFocus);
  const [tone,          setTone]          = useState(initTone);
  const [prayerRequest, setPrayerRequest] = useState(initPrayerRequest);
  const [isActive,      setIsActive]      = useState(initIsActive);

  /* ── ui state ── */
  const [saving,   setSaving]   = useState(false);
  const [toggling, setToggling] = useState(false);
  const [saveMsg,  setSaveMsg]  = useState<string | null>(null);
  const [saveErr,  setSaveErr]  = useState<string | null>(null);
  const [pauseMsg, setPauseMsg] = useState<string | null>(null);
  const [pauseErr, setPauseErr] = useState<string | null>(null);

  /* ── save settings ── */
  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaveMsg(null);
    setSaveErr(null);

    try {
      const res  = await fetch("/api/update-prayer-settings", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ token, firstName, deliveryTime, timezone, prayerFocus, tone, prayerRequest }),
      });
      const data = await res.json() as { success?: boolean; error?: string };
      if (!res.ok || data.error) {
        setSaveErr(data.error ?? "Something went wrong. Please try again.");
      } else {
        setSaveMsg("Settings saved.");
        setTimeout(() => setSaveMsg(null), 4000);
      }
    } catch {
      setSaveErr("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  /* ── pause / resume ── */
  async function handleToggleActive() {
    const action = isActive ? "pause" : "resume";
    setToggling(true);
    setPauseMsg(null);
    setPauseErr(null);

    try {
      const res  = await fetch("/api/pause-emails", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ token, action }),
      });
      const data = await res.json() as { success?: boolean; active?: boolean; error?: string };
      if (!res.ok || data.error) {
        setPauseErr(data.error ?? "Something went wrong. Please try again.");
      } else {
        setIsActive(data.active ?? !isActive);
        setPauseMsg(action === "pause" ? "Prayers paused. Resume any time." : "Prayers resumed.");
        setTimeout(() => setPauseMsg(null), 5000);
      }
    } catch {
      setPauseErr("Network error. Please try again.");
    } finally {
      setToggling(false);
    }
  }

  return (
    <div style={{ width: "100%", maxWidth: 560, margin: "0 auto" }}>

      {/* Eyebrow */}
      <p style={eyebrowStyle}>Prayer Settings</p>

      {/* Heading */}
      <h1 className="font-display" style={headingStyle}>
        Your nightly prayer,<br />your way.
      </h1>

      {/* Status badge */}
      <div style={{ marginBottom: 36, display: "flex", justifyContent: "center" }}>
        <span style={{
          display:       "inline-flex",
          alignItems:    "center",
          gap:           8,
          padding:       "5px 14px",
          borderRadius:  20,
          border:        `1px solid ${isActive ? "rgba(201,169,110,0.35)" : "rgba(240,232,216,0.15)"}`,
          background:    isActive ? "rgba(201,169,110,0.07)" : "rgba(240,232,216,0.04)",
          fontSize:      "0.7rem",
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color:         isActive ? "var(--gold)" : "rgba(240,232,216,0.35)",
        }}>
          <span style={{
            width:        6,
            height:       6,
            borderRadius: "50%",
            background:   isActive ? "var(--gold)" : "rgba(240,232,216,0.3)",
            flexShrink:   0,
          }} />
          {isActive ? "Active" : "Paused"}
        </span>
      </div>

      {/* Portal error notice */}
      {portalError && (
        <div style={noticeStyle("#c0392b", "rgba(192,57,43,0.12)")}>
          Could not open the billing portal. Please try again or contact support.
        </div>
      )}

      {/* ─── Settings Form ─── */}
      <form onSubmit={handleSave}>
        <div style={sectionCardStyle}>

          {/* First name */}
          <div style={{ marginBottom: 20 }}>
            <label htmlFor="m-firstName" className="form-label">First name</label>
            <input
              id="m-firstName"
              type="text"
              className="form-input"
              value={firstName}
              onChange={e => setFirstName(e.target.value)}
              required
            />
          </div>

          {/* Delivery time + timezone */}
          <div className="form-grid" style={{ marginBottom: 20 }}>
            <div>
              <label htmlFor="m-deliveryTime" className="form-label">Delivery time</label>
              <select
                id="m-deliveryTime"
                className="form-input"
                value={deliveryTime}
                onChange={e => setDeliveryTime(e.target.value)}
              >
                {DELIVERY_TIMES.map(t => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="m-timezone" className="form-label">Timezone</label>
              <select
                id="m-timezone"
                className="form-input"
                value={timezone}
                onChange={e => setTimezone(e.target.value)}
              >
                {TIMEZONES.map(tz => (
                  <option key={tz.value} value={tz.value}>{tz.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Prayer focus */}
          <div style={{ marginBottom: 20 }}>
            <label htmlFor="m-prayerFocus" className="form-label">Prayer focus</label>
            <select
              id="m-prayerFocus"
              className="form-input"
              value={prayerFocus}
              onChange={e => setPrayerFocus(e.target.value)}
            >
              {FOCUS_OPTIONS.map(f => (
                <option key={f.value} value={f.value}>{f.label}</option>
              ))}
            </select>
          </div>

          {/* Tone */}
          <div style={{ marginBottom: 20 }}>
            <label htmlFor="m-tone" className="form-label">Tone</label>
            <select
              id="m-tone"
              className="form-input"
              value={tone}
              onChange={e => setTone(e.target.value)}
            >
              {TONE_OPTIONS.map(t => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>

          {/* Personal prayer request */}
          <div style={{ marginBottom: 4 }}>
            <label htmlFor="m-prayerRequest" className="form-label">
              Personal prayer request{" "}
              <span style={{ color: "rgba(240,232,216,0.3)", fontWeight: 300, letterSpacing: 0 }}>
                (optional)
              </span>
            </label>
            <textarea
              id="m-prayerRequest"
              className="form-input"
              rows={3}
              placeholder="Anything specific you'd like prayer for tonight…"
              value={prayerRequest}
              onChange={e => setPrayerRequest(e.target.value)}
              style={{ resize: "vertical", minHeight: 80 }}
            />
          </div>

        </div>

        {/* Feedback */}
        {saveMsg && <p style={successMsgStyle}>{saveMsg}</p>}
        {saveErr && <p style={errorMsgStyle}>{saveErr}</p>}

        {/* Save button */}
        <button
          type="submit"
          className="btn-gold"
          disabled={saving}
          style={{ width: "100%", marginTop: 4, justifyContent: "center" }}
        >
          {saving ? "Saving…" : "Save changes"}
        </button>
      </form>

      {/* ─── Divider ─── */}
      <div style={dividerStyle} />

      {/* ─── Pause / Resume ─── */}
      <div style={sectionCardStyle}>
        <p style={{ margin: "0 0 6px", ...eyebrowStyle }}>
          {isActive ? "Pause prayers" : "Resume prayers"}
        </p>
        <p style={{ margin: "0 0 16px", fontSize: "0.88rem", color: "rgba(240,232,216,0.45)", lineHeight: 1.7 }}>
          {isActive
            ? "Need a break? Pause your emails and resume whenever you're ready."
            : "Ready to start again? Resume your nightly prayers now."}
        </p>

        {pauseMsg && <p style={{ ...successMsgStyle, marginBottom: 12 }}>{pauseMsg}</p>}
        {pauseErr && <p style={{ ...errorMsgStyle, marginBottom: 12 }}>{pauseErr}</p>}

        <button
          type="button"
          onClick={handleToggleActive}
          disabled={toggling}
          style={{
            display:      "inline-flex",
            alignItems:   "center",
            gap:          8,
            padding:      "11px 24px",
            borderRadius: 8,
            border:       "1px solid rgba(240,232,216,0.18)",
            background:   "transparent",
            color:        "rgba(240,232,216,0.6)",
            fontSize:     "0.85rem",
            letterSpacing: "0.04em",
            cursor:       toggling ? "not-allowed" : "pointer",
            opacity:      toggling ? 0.6 : 1,
            transition:   "border-color 0.2s, color 0.2s",
          }}
        >
          {toggling ? (isActive ? "Pausing…" : "Resuming…") : (isActive ? "Pause emails" : "Resume emails")}
        </button>
      </div>

      {/* ─── Divider ─── */}
      <div style={dividerStyle} />

      {/* ─── Cancel subscription ─── */}
      <div style={{ ...sectionCardStyle, textAlign: "center" }}>
        <p style={{ margin: "0 0 6px", fontSize: "0.68rem", letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(240,232,216,0.25)" }}>
          Cancel subscription
        </p>
        <p style={{ margin: "0 0 16px", fontSize: "0.88rem", color: "rgba(240,232,216,0.35)", lineHeight: 1.7 }}>
          You'll be taken to the Stripe billing portal to cancel your subscription.
        </p>
        <a
          href={`/api/create-customer-portal?token=${encodeURIComponent(token)}`}
          style={{
            display:      "inline-flex",
            alignItems:   "center",
            fontSize:     "0.82rem",
            color:        "rgba(240,232,216,0.3)",
            letterSpacing: "0.04em",
            textDecoration: "underline",
            textUnderlineOffset: 3,
            cursor:       "pointer",
          }}
        >
          Cancel subscription →
        </a>
      </div>

    </div>
  );
}

/* ── Local style helpers ── */
const eyebrowStyle: React.CSSProperties = {
  fontSize:      "0.68rem",
  fontWeight:    400,
  letterSpacing: "0.18em",
  textTransform: "uppercase",
  color:         "var(--gold)",
  marginBottom:  20,
  textAlign:     "center",
};

const headingStyle: React.CSSProperties = {
  fontSize:    "clamp(1.6rem, 4vw, 2.2rem)",
  fontWeight:  400,
  fontStyle:   "italic",
  color:       "var(--cream)",
  lineHeight:  1.25,
  marginBottom: 24,
  textAlign:   "center",
};

const sectionCardStyle: React.CSSProperties = {
  background:    "rgba(13,27,42,0.55)",
  border:        "1px solid rgba(201,169,110,0.12)",
  borderRadius:  12,
  padding:       "28px 28px 24px",
  marginBottom:  0,
};

const dividerStyle: React.CSSProperties = {
  height:     1,
  background: "linear-gradient(to right, transparent, rgba(201,169,110,0.15), transparent)",
  margin:     "24px 0",
};

const successMsgStyle: React.CSSProperties = {
  margin:        "12px 0 4px",
  fontSize:      "0.82rem",
  color:         "#a8d5a2",
  textAlign:     "center",
};

const errorMsgStyle: React.CSSProperties = {
  margin:        "12px 0 4px",
  fontSize:      "0.82rem",
  color:         "#e07878",
  textAlign:     "center",
};

function noticeStyle(borderColor: string, bgColor: string): React.CSSProperties {
  return {
    border:        `1px solid ${borderColor}`,
    background:    bgColor,
    borderRadius:  8,
    padding:       "12px 16px",
    marginBottom:  24,
    fontSize:      "0.85rem",
    color:         "rgba(240,232,216,0.7)",
    textAlign:     "center",
    lineHeight:    1.6,
  };
}
