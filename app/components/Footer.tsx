import Link from "next/link";

export default function Footer() {
  return (
    <footer
      style={{
        position:  "relative",
        zIndex:    1,
        borderTop: "1px solid rgba(16,42,67,0.1)",
        padding:   "48px 0 40px",
      }}
    >
      <div className="container">
        <div className="footer-grid">
          {/* Wordmark + line */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ color: "var(--gold)", fontSize: "0.6rem" }}>✦</span>
              <span
                className="font-display"
                style={{
                  fontSize:      "1rem",
                  fontWeight:    400,
                  fontStyle:     "italic",
                  color:         "var(--navy-text)",
                  letterSpacing: "0.04em",
                }}
              >
                Nightly Prayer
              </span>
            </span>
            <span style={{ fontSize: "0.78rem", fontWeight: 300, color: "var(--secondary-text)" }}>
              A personal prayer in your inbox, every night.
            </span>
          </div>

          {/* Links */}
          <nav className="footer-links" aria-label="Footer">
            <Link href="/privacy" className="footer-link">Privacy Policy</Link>
            <Link href="/terms" className="footer-link">Terms of Service</Link>
            <a href="mailto:ewanshaool@gmail.com" className="footer-link">Contact</a>
            <Link href="/manage" className="footer-link">Manage Subscription</Link>
          </nav>
        </div>

        <p
          style={{
            marginTop:  32,
            fontSize:   "0.7rem",
            fontWeight: 300,
            color:      "rgba(16,42,67,0.45)",
          }}
        >
          © {new Date().getFullYear()} My Nightly Prayer · mynightlyprayer.com
        </p>
      </div>

      <style>{`
        .footer-grid {
          display:         flex;
          justify-content: space-between;
          align-items:     flex-start;
          gap:             32px;
          flex-wrap:       wrap;
        }
        .footer-links {
          display:   flex;
          gap:       28px;
          flex-wrap: wrap;
        }
        .footer-link {
          font-size:       0.78rem;
          font-weight:     300;
          color:           var(--secondary-text);
          text-decoration: none;
          letter-spacing:  0.03em;
          transition:      color 0.2s;
        }
        .footer-link:hover { color: var(--gold-dim); }
        @media (max-width: 600px) {
          .footer-grid  { flex-direction: column; }
          .footer-links { gap: 20px; }
        }
      `}</style>
    </footer>
  );
}
