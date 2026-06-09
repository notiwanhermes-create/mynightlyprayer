import Link from "next/link";

export default function FinalCTA() {
  return (
    <section
      style={{
        padding: "120px 0 80px",
        position: "relative",
        zIndex: 1,
      }}
    >
      <div className="container">
        <div className="divider" style={{ marginBottom: 80 }} />

        <div
          className="reveal"
          style={{ textAlign: "center", maxWidth: 640, margin: "0 auto" }}
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
            Begin tonight
          </p>

          <h2
            className="font-display"
            style={{
              fontSize: "clamp(2.4rem, 5vw, 3.8rem)",
              fontWeight: 400,
              lineHeight: 1.1,
              color: "var(--cream)",
              marginBottom: 24,
            }}
          >
            End every day with{" "}
            <em className="text-gold" style={{ fontStyle: "italic", fontWeight: 300 }}>
              peace.
            </em>
          </h2>

          <p
            style={{
              fontSize: "1rem",
              fontWeight: 300,
              lineHeight: 1.85,
              color: "rgba(240,232,216,0.52)",
              marginBottom: 48,
            }}
          >
            Your nightly prayer can begin tonight.
          </p>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 18,
            }}
          >
            <Link href="/checkout" className="btn-gold">
              Start My Nightly Prayer
            </Link>
            <span
              style={{
                fontSize: "0.78rem",
                fontWeight: 300,
                color: "var(--muted)",
              }}
            >
              $5.99/month · Cancel anytime
            </span>
          </div>
        </div>

        <div className="divider" style={{ marginTop: 80, marginBottom: 40 }} />

        {/* Footer */}
        <p
          style={{
            textAlign: "center",
            fontSize: "0.72rem",
            fontWeight: 300,
            color: "rgba(90,122,150,0.5)",
            letterSpacing: "0.04em",
          }}
        >
          © {new Date().getFullYear()} Nightly Prayer. All rights reserved.
        </p>
      </div>
    </section>
  );
}
