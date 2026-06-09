const steps = [
  {
    num: "I",
    title: "Choose your bedtime",
    desc: "Tell us when you want your prayer delivered — we'll send it right before you sleep.",
  },
  {
    num: "II",
    title: "Choose your prayer style",
    desc: "Peace, protection, gratitude, healing, forgiveness, family, or strength.",
  },
  {
    num: "III",
    title: "Receive it nightly",
    desc: "Your prayer arrives in your inbox every night before sleep, without fail.",
  },
];

export default function HowItWorks() {
  return (
    <section
      style={{
        padding: "100px 0 120px",
        position: "relative",
        zIndex: 1,
        background: "linear-gradient(180deg, rgba(21,35,56,0.4) 0%, rgba(21,35,56,0.4) 100%)",
      }}
    >
      <div className="container">
        {/* Header */}
        <div
          className="reveal"
          style={{ textAlign: "center", marginBottom: 72 }}
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
            How it works
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
            Three simple steps to{" "}
            <em className="text-gold" style={{ fontStyle: "italic", fontWeight: 300 }}>
              nightly peace
            </em>
          </h2>
        </div>

        {/* Steps */}
        <div
          className="reveal steps-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: 48,
          }}
        >
          {steps.map((step, i) => (
            <div key={i} style={{ display: "flex", flexDirection: "column" }}>
              <div className="step-circle">{step.num}</div>
              <h3
                className="font-display"
                style={{
                  fontSize: "1.3rem",
                  fontWeight: 400,
                  color: "var(--cream)",
                  lineHeight: 1.3,
                  marginBottom: 14,
                }}
              >
                {step.title}
              </h3>
              <p
                style={{
                  fontSize: "0.9rem",
                  fontWeight: 300,
                  lineHeight: 1.8,
                  color: "rgba(240,232,216,0.52)",
                }}
              >
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .steps-grid {
            grid-template-columns: 1fr !important;
            gap: 48px !important;
          }
        }
      `}</style>
    </section>
  );
}
