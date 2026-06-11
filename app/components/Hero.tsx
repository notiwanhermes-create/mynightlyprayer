import Link from "next/link";
import PrayerPreviewCard from "./PrayerPreviewCard";

export default function Hero() {
  return (
    <section
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        paddingTop: 96,
        paddingBottom: 80,
        position: "relative",
        zIndex: 1,
        overflow: "hidden",
      }}
    >
      <div className="container">
        <div className="hero-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 64, alignItems: "center" }}>

          {/* Left: text */}
          <div className="hero-text">
            <p className="fade-up d1 hero-eyebrow" style={{ fontSize: "0.68rem", fontWeight: 400, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--gold)", marginBottom: 24, display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ display: "inline-block", width: 24, height: 1, background: "rgba(201,169,110,0.5)", flexShrink: 0 }} />
              A prayer for every night
              <span style={{ display: "inline-block", width: 24, height: 1, background: "rgba(201,169,110,0.5)", flexShrink: 0 }} />
            </p>

            <h1 className="font-display fade-up d2" style={{ fontSize: "clamp(2.2rem, 8vw, 3.6rem)", fontWeight: 400, fontStyle: "italic", lineHeight: 1.22, color: "var(--cream)", marginBottom: 24, letterSpacing: "-0.01em" }}>
              Sleep with peace{" "}
              <span className="text-gold">tonight.</span>
              <br />
              Wake up with faith{" "}
              <span className="text-gold">tomorrow.</span>
            </h1>

            <p className="fade-up d3" style={{ fontSize: "1rem", fontWeight: 300, lineHeight: 1.85, color: "rgba(240,232,216,0.6)", maxWidth: 440, marginBottom: 36 }}>
              Receive a personal nightly prayer in your inbox at the bedtime
              you choose — written to help you end the day with peace,
              gratitude, protection, and hope.
            </p>

            <div className="fade-up d4 hero-cta" style={{ marginBottom: 18 }}>
              <Link href="/checkout" className="btn-gold" style={{ display: "inline-flex" }}>
                Start Nightly Prayer
              </Link>
            </div>

            <p className="fade-up d5 hero-price" style={{ fontSize: "0.78rem", fontWeight: 300, color: "var(--muted)", letterSpacing: "0.04em" }}>
              $5.99/month · Delivered every night · Cancel anytime
            </p>
          </div>

          {/* Right: prayer card */}
          <div className="fade-up d6 hero-card" style={{ display: "flex", justifyContent: "flex-end" }}>
            <PrayerPreviewCard />
          </div>
        </div>
      </div>

      {/* Scroll indicator — hidden on mobile */}
      <div className="scroll-hint fade-up d7" style={{ position: "absolute", bottom: 32, left: "50%", transform: "translateX(-50%)", display: "flex", flexDirection: "column", alignItems: "center", gap: 6, opacity: 0.45 }}>
        <span style={{ fontSize: "0.58rem", letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--muted)" }}>Scroll</span>
        <div style={{ width: 1, height: 30, background: "linear-gradient(to bottom, var(--muted), transparent)" }} />
      </div>

      <style>{`
        /* ── Mobile hero ── */
        @media (max-width: 768px) {
          .hero-grid {
            grid-template-columns: 1fr !important;
            gap: 40px !important;
          }
          .hero-text { text-align: center; }
          .hero-eyebrow { justify-content: center; }
          .hero-cta { display: flex; justify-content: center; }
          .hero-price { text-align: center; }
          .hero-card { justify-content: center !important; order: -1; }
          .scroll-hint { display: none !important; }
        }
        /* ── Small phones ── */
        @media (max-width: 390px) {
          .hero-text h1 { font-size: 2rem !important; }
        }
      `}</style>
    </section>
  );
}
