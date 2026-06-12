import type { Metadata } from "next";
import Navbar from "../components/Navbar";

export const metadata: Metadata = {
  title: "Privacy Policy — Nightly Prayer",
  description: "How My Nightly Prayer collects, uses, and protects your information.",
};

export default function PrivacyPage() {
  return (
    <>
      <Navbar />
      <main className="legal-page">
        <div className="container" style={{ maxWidth: 720 }}>
          <h1 className="font-display legal-title">Privacy Policy</h1>
          <p className="legal-updated">Last updated: June 12, 2026</p>

          <p>
            My Nightly Prayer (&ldquo;we&rdquo;, &ldquo;us&rdquo;) operates{" "}
            <strong>mynightlyprayer.com</strong>, a subscription service that delivers a
            personal prayer to your email each night. This policy explains what
            information we collect and how we use it.
          </p>

          <h2 className="font-display">What we collect</h2>
          <p>When you sign up, we collect:</p>
          <ul>
            <li>Your first name and email address</li>
            <li>Your chosen delivery time and timezone</li>
            <li>Your prayer preferences (focus and tone)</li>
          </ul>
          <p>
            Payments are handled entirely by <strong>Stripe</strong>. We never see or
            store your card details.
          </p>

          <h2 className="font-display">How we use it</h2>
          <ul>
            <li>To write and deliver your personalized nightly prayer email</li>
            <li>To manage your subscription and billing</li>
            <li>To respond when you contact us for support</li>
          </ul>
          <p>
            We do <strong>not</strong> sell, rent, or share your personal information
            with anyone for marketing purposes.
          </p>

          <h2 className="font-display">Service providers</h2>
          <p>
            We rely on a small number of trusted providers to run the service: Stripe
            (payments), Resend (email delivery), Supabase (secure data storage), and
            OpenAI (your first name and prayer preferences are used to compose your
            personalized prayer). Each provider only receives the minimum information
            needed to do its job.
          </p>

          <h2 className="font-display">Your choices</h2>
          <ul>
            <li>
              You can pause emails, change your preferences, or cancel your subscription
              anytime from the <a href="/manage">manage page</a> or via the links in any
              prayer email.
            </li>
            <li>
              You can ask us to delete your account and data entirely by emailing{" "}
              <a href="mailto:ewanshaool@gmail.com">ewanshaool@gmail.com</a>.
            </li>
          </ul>

          <h2 className="font-display">Data retention &amp; security</h2>
          <p>
            We keep your information only as long as you have an account. Data is stored
            with industry-standard encryption in transit and at rest.
          </p>

          <h2 className="font-display">Children</h2>
          <p>
            The service is not directed at children under 13, and we do not knowingly
            collect information from them.
          </p>

          <h2 className="font-display">Changes &amp; contact</h2>
          <p>
            If we make material changes to this policy, we will update this page. For
            any questions, email{" "}
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
