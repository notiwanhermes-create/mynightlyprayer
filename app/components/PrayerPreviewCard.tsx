export default function PrayerPreviewCard() {
  return (
    <div className="prayer-card" style={{ width: "100%", maxWidth: 420 }}>
      {/* Email header */}
      <div
        style={{
          padding: "20px 28px",
          borderBottom: "1px solid rgba(201,169,110,0.12)",
          display: "flex",
          alignItems: "center",
          gap: 12,
          background: "rgba(201,169,110,0.04)",
        }}
      >
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: "50%",
            background: "linear-gradient(135deg, #c9a96e, #7a6040)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            fontSize: "0.8rem",
            color: "#0d1b2a",
          }}
        >
          ✦
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p
            style={{
              fontSize: "0.7rem",
              fontWeight: 500,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "var(--gold)",
            }}
          >
            Nightly Prayer
          </p>
          <p style={{ fontSize: "0.72rem", color: "var(--muted)", fontWeight: 300, marginTop: 2 }}>
            Delivered to you · 9:30 PM
          </p>
        </div>
        <span style={{ fontSize: "0.72rem", color: "var(--muted)", fontWeight: 300, flexShrink: 0 }}>
          Tonight
        </span>
      </div>

      {/* Body */}
      <div style={{ padding: "32px 28px 28px" }}>
        <h3
          className="font-display"
          style={{
            fontSize: "1.7rem",
            fontWeight: 400,
            fontStyle: "italic",
            color: "var(--cream)",
            lineHeight: 1.2,
            marginBottom: 16,
          }}
        >
          Tonight's Prayer
        </h3>

        {/* Small ornament */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
          <div style={{ width: 20, height: 1, background: "rgba(201,169,110,0.4)" }} />
          <span style={{ color: "var(--gold)", fontSize: "0.5rem" }}>✦</span>
          <div style={{ width: 20, height: 1, background: "rgba(201,169,110,0.4)" }} />
        </div>

        <p
          className="font-display"
          style={{
            fontSize: "1.05rem",
            fontStyle: "italic",
            fontWeight: 300,
            color: "rgba(240,232,216,0.82)",
            lineHeight: 1.85,
            marginBottom: 24,
          }}
        >
          "Lord, quiet my mind tonight. Remove the weight I carried today,
          protect my heart, and help me rest in peace. Let tomorrow bring
          clarity, strength, and blessings. Amen."
        </p>

        {/* Footer */}
        <div
          style={{
            paddingTop: 18,
            borderTop: "1px solid rgba(201,169,110,0.1)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <span
            style={{
              fontSize: "0.65rem",
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "var(--gold-dim)",
              fontWeight: 400,
            }}
          >
            Peace · Protection · Hope
          </span>
          <span style={{ color: "var(--gold)", fontSize: "0.6rem" }}>✦</span>
        </div>
      </div>
    </div>
  );
}
