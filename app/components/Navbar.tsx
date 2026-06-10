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

    </nav>
  );
}
