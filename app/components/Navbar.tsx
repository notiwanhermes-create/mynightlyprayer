import Link from "next/link";

export default function Navbar({ dark = false }: { dark?: boolean }) {
  return (
    <nav
      className="site-nav"
      style={{
        background: "rgba(238,238,246,0.94)",
        backdropFilter: "blur(18px)",
        borderBottom: "1px solid rgba(108,142,245,0.1)",
      }}
    >
      <Link
        href="/"
        style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}
      >
        <svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path d="M10 1L11.9 8.1L19 10L11.9 11.9L10 19L8.1 11.9L1 10L8.1 8.1Z" fill="#6C8EF5" />
        </svg>
        <span style={{
          fontSize: "0.95rem",
          fontWeight: 700,
          color: "#111827",
          fontFamily: "var(--font-jost), 'Jost', sans-serif",
          letterSpacing: "-0.01em",
        }}>
          Nightly Prayer
        </span>
      </Link>

      <div className="site-nav__links">
        <a href="#how-it-works" style={linkStyle}>How it works</a>
        <a href="#pricing"      style={linkStyle}>Pricing</a>
        <a href="#about"        style={linkStyle}>About</a>
        <Link href="/manage"    style={signInStyle}>Sign in</Link>
      </div>

      <style>{`
        .site-nav__links {
          display: flex;
          align-items: center;
          gap: 32px;
        }
        @media (max-width: 640px) {
          .site-nav__links { display: none; }
        }
        .site-nav__links a {
          transition: color 0.15s;
        }
        .site-nav__links a:hover {
          color: #6C8EF5 !important;
        }
      `}</style>
    </nav>
  );
}

const linkStyle: React.CSSProperties = {
  fontSize: "0.88rem",
  color: "#9CA3AF",
  fontWeight: 400,
  textDecoration: "none",
  fontFamily: "var(--font-jost), sans-serif",
};

const signInStyle: React.CSSProperties = {
  fontSize: "0.88rem",
  color: "#111827",
  fontWeight: 500,
  textDecoration: "none",
  fontFamily: "var(--font-jost), sans-serif",
};
