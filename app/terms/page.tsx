import type { Metadata } from "next";
import Navbar from "../components/Navbar";

export const metadata: Metadata = {
  title: "Terms of Service — Nightly Prayer",
  description: "The terms that govern your use of My Nightly Prayer.",
};

export default function TermsPage() {
  return (
    <>
      <Navbar />
      <main className="legal-page">
        <div className="container" style={{ maxWidth: 720 }}>
          <h1 className="font-display legal-title">Terms of Service</h1>
          <p className="legal-updated">Last updated: June 12, 2026</p>

          <p>
            Welcome to My Nightly Prayer (<strong>mynightlyprayer.com</strong>). By
            subscribing or using the site, you agree to these terms.
          </p>

          <h2 className="font-display">The service</h2>
          <p>
            My Nightly Prayer delivers a personalized prayer to your email each night at
            the time you choose. Prayers are composed individually for you, based on the
            name, focus, and tone you select, with the help of AI writing technology.
          </p>

          <h2 className="font-display">Free trial &amp; billing</h2>
          <ul>
            <li>
              Your first <strong>7 nights are free</strong>. A payment method is
              required to start the trial, but you are not charged during it.
            </li>
            <li>
              After the trial, your subscription is <strong>$5.99 USD per month</strong>,
              billed automatically through Stripe until you cancel.
            </li>
            <li>
              You can cancel anytime — during the trial or after — from the{" "}
              <a href="/manage">manage page</a> or the links in any prayer email. If you
              cancel during the trial, you pay nothing.
            </li>
            <li>
              When you cancel, your subscription stays active until the end of the
              period you already paid for, and no further charges are made.
            </li>
          </ul>

          <h2 className="font-display">A note on content</h2>
          <p>
            Our prayers are devotional content intended for personal comfort,
            encouragement, and reflection. They are not a substitute for professional
            medical, mental-health, legal, or financial advice, and My Nightly Prayer is
            not affiliated with any particular church or denomination.
          </p>

          <h2 className="font-display">Your account</h2>
          <p>
            You agree to provide accurate information and to use the service only for
            personal, non-commercial purposes. You may not resell, scrape, or
            redistribute the service or its content.
          </p>

          <h2 className="font-display">Liability</h2>
          <p>
            The service is provided &ldquo;as is.&rdquo; While we work hard to deliver
            every prayer on time, we cannot guarantee uninterrupted delivery (for
            example, if an email provider delays or filters a message). To the maximum
            extent permitted by law, our total liability is limited to the amount you
            paid us in the past three months.
          </p>

          <h2 className="font-display">Changes</h2>
          <p>
            We may update these terms from time to time. If a change is material, we
            will note it on this page. Continuing to use the service after a change
            means you accept the updated terms.
          </p>

          <h2 className="font-display">Contact</h2>
          <p>
            Questions about these terms? Email{" "}
            <a href="mailto:ewanshaool@gmail.com">ewanshaool@gmail.com</a>.
          </p>
        </div>
      </main>

      <style>{`
        .legal-page {
          position: relative;
          z-index: 1;
          padding: 140px 0 100px;
        }
        .legal-title {
          font-size: clamp(2rem, 5vw, 2.8rem);
          font-weight: 400;
          font-style: italic;
          color: var(--navy-text);
          margin-bottom: 8px;
        }
        .legal-updated {
          font-size: 0.78rem;
          font-weight: 300;
          color: var(--secondary-text);
          letter-spacing: 0.04em;
          margin-bottom: 40px;
        }
        .legal-page h2 {
          font-size: 1.3rem;
          font-weight: 400;
          font-style: italic;
          color: var(--navy-text);
          margin: 36px 0 12px;
        }
        .legal-page p, .legal-page li {
          font-size: 0.92rem;
          font-weight: 300;
          line-height: 1.8;
          color: var(--secondary-text);
          margin-bottom: 12px;
        }
        .legal-page ul {
          padding-left: 22px;
          margin-bottom: 12px;
        }
        .legal-page li { margin-bottom: 6px; }
        .legal-page a {
          color: var(--gold-dim);
          text-decoration: underline;
          text-underline-offset: 3px;
        }
        .legal-page strong { color: var(--navy-text); font-weight: 400; }
      `}</style>
    </>
  );
}
