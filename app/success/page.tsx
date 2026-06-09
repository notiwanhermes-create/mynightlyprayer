import Link from "next/link";
import Navbar from "../components/Navbar";

export default function SuccessPage() {
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
              border: "1px solid rgba(201,169,110,0.35)",
              background: "rgba(201,169,110,0.07)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 32px",
              fontSize: "1.4rem",
              color: "var(--gold)",
            }}
          >
            ✦
          </div>

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
            Welcome to Nightly Prayer
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
            Your nightly prayer is active.
          </h1>

          <p
            style={{
              fontSize: "1rem",
              fontWeight: 300,
              lineHeight: 1.85,
              color: "rgba(240,232,216,0.55)",
              marginBottom: 48,
            }}
          >
            Your first prayer can arrive tonight.
            <br />
            Check your inbox — peace is on its way.
          </p>

          {/* Divider */}
          <div
            style={{
              width: "100%",
              maxWidth: 280,
              height: 1,
              background: "linear-gradient(to right, transparent, rgba(201,169,110,0.25), transparent)",
              margin: "0 auto 40px",
            }}
          />

          <Link
            href="/"
            className="btn-gold"
            style={{ display: "inline-flex" }}
          >
            Back to Home
          </Link>
        </div>
      </main>
    </>
  );
}
