export default function ProblemSection() {
  return (
    <section
      style={{
        padding: "120px 0",
        position: "relative",
        zIndex: 1,
      }}
    >
      <div className="container">
        <div className="divider" style={{ marginBottom: 80 }} />

        <div
          className="reveal"
          style={{
            maxWidth: 680,
            margin: "0 auto",
            textAlign: "center",
          }}
        >
          <p
            style={{
              fontSize: "0.68rem",
              fontWeight: 400,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "var(--gold)",
              marginBottom: 28,
            }}
          >
            The problem
          </p>

          <h2
            className="font-display"
            style={{
              fontSize: "clamp(2rem, 4vw, 3rem)",
              fontWeight: 400,
              lineHeight: 1.15,
              color: "var(--cream)",
              marginBottom: 28,
            }}
          >
            Most nights, your mind{" "}
            <em className="text-gold" style={{ fontStyle: "italic", fontWeight: 300 }}>
              doesn't stop.
            </em>
          </h2>

          <p
            style={{
              fontSize: "1rem",
              fontWeight: 300,
              lineHeight: 1.9,
              color: "rgba(240,232,216,0.58)",
              marginBottom: 48,
            }}
          >
            Stress, overthinking, fear, regret, and worries can follow you into bed.
            Nightly Prayer gives you one peaceful moment every night — a prayer
            written for comfort, protection, gratitude, and calm before sleep.
          </p>

          {/* Tags */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 10,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            {["Stress", "Overthinking", "Fear", "Regret", "Worry", "Loneliness"].map((w) => (
              <span
                key={w}
                style={{
                  padding: "7px 18px",
                  border: "1px solid rgba(201,169,110,0.14)",
                  borderRadius: 2,
                  fontSize: "0.78rem",
                  letterSpacing: "0.05em",
                  fontWeight: 300,
                  color: "rgba(240,232,216,0.32)",
                  background: "rgba(201,169,110,0.03)",
                }}
              >
                {w}
              </span>
            ))}
            <span
              style={{
                padding: "7px 18px",
                border: "1px solid rgba(201,169,110,0.4)",
                borderRadius: 2,
                fontSize: "0.78rem",
                letterSpacing: "0.05em",
                fontWeight: 400,
                color: "var(--gold)",
                background: "rgba(201,169,110,0.08)",
              }}
            >
              → Peace
            </span>
          </div>
        </div>

        <div className="divider" style={{ marginTop: 80 }} />
      </div>
    </section>
  );
}
