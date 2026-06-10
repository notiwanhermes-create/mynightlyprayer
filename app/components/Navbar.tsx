import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="site-nav">
      {/* Wordmark */}
      <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
        <span style={{ color: "var(--gold)", fontSize: "0.6rem" }}>✦</span>
        <span
          className="font-display"
          style={{
            fontSize: "1rem",
            fontWeight: 400,
            fontStyle: "italic",
            color: "var(--navy-text)",
            letterSpacing: "0.04em",
          }}
        >
          Nightly Prayer
        </span>
      </Link>

      {/* Nav CTA */}
      <Link
        href="/#signup"
        style={{
          fontSize: "0.72rem",
          fontWeight: 400,
          letterSpacing: "0.08em",
          color: "var(--gold)",
          textDecoration: "none",
          border: "1px solid rgba(198,161,91,0.45)",
          padding: "8px 20px",
          borderRadius: "2px",
          transition: "background 0.2s",
        }}
      >
        Start Tonight →
      </Link>
    </nav>
  );
}
