import Link from "next/link";

const features = [
  "One personal prayer every night",
  "Delivered at your chosen bedtime",
  "Choose your prayer theme",
  "Peaceful, elegant email design",
  "Cancel anytime",
];

export default function PricingCard() {
  return (
    <section
      className="pricing-section"
      style={{
        padding: "80px 0 100px",
        position: "relative",
        zIndex: 1,
      }}
    >
      <div className="container">
        {/* Header */}
        <div
          className="reveal"
          style={{ textAlign: "center", marginBottom: 56 }}
        >
          <p
            style={{
              fontSize: "0.68rem",
              fontWeight: 400,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "var(--gold)",
              marginBottom: 20,
            }}
          >
            Pricing
          </p>
          <h2
            className="font-display"
            style={{
              fontSize: "clamp(1.9rem, 3.5vw, 2.8rem)",
              fontWeight: 400,
              color: "var(--cream)",
              lineHeight: 1.2,
            }}
          >
            Simple, honest pricing
          </h2>
        </div>

        {/* Card */}
        <div
          className="pricing-card reveal pricing-inner"
          style={{
            maxWidth: 480,
            margin: "0 auto",
            padding: "48px 40px",
          }}
        >
          {/* Plan name */}
          <p
            style={{
              fontSize: "0.68rem",
              fontWeight: 400,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "var(--gold)",
              textAlign: "center",
              marginBottom: 24,
            }}
          >
            Nightly Prayer
          </p>

          {/* Price */}
          <div
            style={{
              textAlign: "center",
              marginBottom: 8,
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "center",
              gap: 4,
            }}
          >
            <span
              className="font-display"
              style={{
                fontSize: "1.1rem",
                color: "var(--cream)",
                marginTop: 10,
              }}
            >
              $
            </span>
            <span
              className="font-display text-gold"
              style={{
                fontSize: "4.8rem",
                fontWeight: 400,
                lineHeight: 1,
              }}
            >
              5.99
            </span>
            <span
              style={{
                fontSize: "0.85rem",
                color: "var(--muted)",
                fontWeight: 300,
                alignSelf: "flex-end",
                marginBottom: 12,
              }}
            >
              /mo
            </span>
          </div>

          <p
            style={{
              textAlign: "center",
              fontSize: "0.8rem",
              fontWeight: 300,
              color: "rgba(240,232,216,0.4)",
              marginBottom: 36,
            }}
          >
            Billed monthly · Cancel anytime
          </p>

          {/* Divider */}
          <div className="divider" style={{ marginBottom: 32 }} />

          {/* Features */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 40 }}>
            {features.map((f) => (
              <div key={f} className="check-row">
                <span className="check-icon">✓</span>
                {f}
              </div>
            ))}
          </div>

          {/* CTA */}
          <Link
            href="/checkout"
            className="btn-gold"
            style={{ width: "100%", display: "flex" }}
          >
            Start Tonight
          </Link>

          <p
            style={{
              textAlign: "center",
              fontSize: "0.76rem",
              fontWeight: 300,
              color: "var(--muted)",
              marginTop: 16,
            }}
          >
            Your first prayer arrives tonight.
          </p>
        </div>
      </div>

      <style>{`
        @media (max-width: 640px) {
          .pricing-section { padding: 60px 0 80px !important; }
          .pricing-inner { padding: 36px 24px !important; }
        }
      `}</style>
    </section>
  );
}
