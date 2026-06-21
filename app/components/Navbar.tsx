import Link from "next/link";

export default function Navbar({ dark = false }: { dark?: boolean }) {
  return (
    <nav className={`site-nav${dark ? " site-nav--dark" : ""}`}>
      <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
        <span style={{ color: "var(--gold)", fontSize: "0.6rem" }}>✦</span>
        <span
          className="font-display"
          style={{
            fontSize: "1rem",
            fontWeight: 400,
            fontStyle: "italic",
            color: dark ? "rgba(255,252,245,0.88)" : "var(--navy-text)",
            letterSpacing: "0.04em",
          }}
        >
          Nightly Prayer
        </span>
      </Link>
    </nav>
  );
}
