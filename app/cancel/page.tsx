import Link from "next/link";
import Navbar from "../components/Navbar";

export default function CancelPage() {
  return (
    <>
      <div className="stars" aria-hidden="true" />
      <Navbar />
      <main
        style={{
          position: "relative",
          zIndex: 1,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "100px 24px 60px",
        }}
      >
        <div style={{ textAlign: "center", maxWidth: 520 }}>

          {/* Icon */}
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: "50%",
              border: "1px solid rgba(201,169,110,0.2)",
              background: "rgba(255,255,255,0.03)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 32px",
              fontSize: "1.2rem",
              color: "rgba(240,232,216,0.3)",
            }}
          >
            ×
          </div>

          <p
            style={{
              fontSize: "0.68rem",
              fontWeight: 400,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "var(--muted)",
              marginBottom: 20,
            }}
          >
            Checkout canceled
          </p>

          <h1
            className="font-display"
            style={{
              fontSize: "clamp(2rem, 5vw, 3rem)",
              fontWeight: 400,
              fontStyle: "italic",
              color: "var(--cream)",
              lineHeight: 1.2,
              marginBottom: 20,
            }}
          >
            No worries.
          </h1>

          <p
            style={{
              fontSize: "1rem",
              fontWeight: 300,
              lineHeight: 1.85,
              color: "rgba(240,232,216,0.5)",
              marginBottom: 48,
            }}
          >
            You can return anytime to start your nightly prayer.
            <br />
            Your peace is waiting whenever you're ready.
          </p>

          {/* Divider */}
          <div
            style={{
              width: "100%",
              maxWidth: 280,
              height: 1,
              background: "linear-gradient(to right, transparent, rgba(201,169,110,0.2), transparent)",
              margin: "0 auto 40px",
            }}
          />

          <Link
            href="/#signup"
            className="btn-gold"
            style={{ display: "inline-flex" }}
          >
            Return to Nightly Prayer
          </Link>
        </div>
      </main>
    </>
  );
}
