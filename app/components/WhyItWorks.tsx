const steps = [
  {
    num: "01",
    title: "Choose your bedtime",
    desc: "Tell us when you want your prayer — we deliver it right before you sleep.",
  },
  {
    num: "02",
    title: "Pick your prayer style",
    desc: "Peace, protection, gratitude, healing, forgiveness, or strength.",
  },
  {
    num: "03",
    title: "Receive it every night",
    desc: "A personal prayer lands in your inbox, without fail, every single night.",
  },
];

export default function WhyItWorks() {
  return (
    <section
      className="reveal why-section"
      style={{
        padding: "80px 0 100px",
        position: "relative",
        zIndex: 1,
      }}
    >
      <div className="container">

        {/* Top divider */}
        <div className="divider" style={{ marginBottom: 80 }} />

        {/* Headline block */}
        <div style={{ textAlign: "center", marginBottom: 72 }}>
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
            Why Nightly Prayer
          </p>
          <h2
            className="font-display"
            style={{
              fontSize: "clamp(2rem, 4vw, 3rem)",
              fontWeight: 400,
              lineHeight: 1.15,
              color: "var(--cream)",
              marginBottom: 20,
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
              lineHeight: 1.85,
              color: "rgba(240,232,216,0.55)",
              maxWidth: 520,
              margin: "0 auto",
            }}
          >
            Stress, regret, and worry follow you to bed. One quiet prayer
            changes everything — here's how it works.
          </p>
        </div>

        {/* Steps row */}
        <div
          className="steps-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: 2,
          }}
        >
          {steps.map((step, i) => (
            <div
              key={i}
              style={{
                padding: "40px 36px",
                background: i === 1
                  ? "rgba(201,169,110,0.07)"
                  : "rgba(14,28,50,0.5)",
                border: "1px solid rgba(201,169,110,0.1)",
                borderRadius: i === 0 ? "12px 0 0 12px" : i === 2 ? "0 12px 12px 0" : "0",
                display: "flex",
                flexDirection: "column",
                gap: 16,
              }}
            >
              <span
                className="font-display"
                style={{
                  fontSize: "2.5rem",
                  fontWeight: 300,
                  fontStyle: "italic",
                  color: "rgba(201,169,110,0.35)",
                  lineHeight: 1,
                }}
              >
                {step.num}
              </span>
              <h3
                className="font-display"
                style={{
                  fontSize: "1.25rem",
                  fontWeight: 400,
                  color: "var(--cream)",
                  lineHeight: 1.3,
                }}
              >
                {step.title}
              </h3>
              <p
                style={{
                  fontSize: "0.88rem",
                  fontWeight: 300,
                  lineHeight: 1.8,
                  color: "rgba(240,232,216,0.5)",
                }}
              >
                {step.desc}
              </p>
            </div>
          ))}
        </div>

        {/* Bottom divider */}
        <div className="divider" style={{ marginTop: 80 }} />
      </div>

      <style>{`
        @media (max-width: 768px) {
          .why-section { padding: 60px 0 80px !important; }
          .steps-grid {
            grid-template-columns: 1fr !important;
            gap: 2px !important;
          }
          .steps-grid > div {
            border-radius: 0 !important;
            padding: 28px 24px !important;
          }
          .steps-grid > div:first-child { border-radius: 12px 12px 0 0 !important; }
          .steps-grid > div:last-child  { border-radius: 0 0 12px 12px !important; }
        }
      `}</style>
    </section>
  );
}
