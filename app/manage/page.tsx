/**
 * app/manage/page.tsx
 * Server Component — resolves the management token from searchParams (Promise in Next.js 15+),
 * fetches the subscriber from Supabase, and renders the client form.
 * Never exposes Stripe IDs or billing data to the client.
 */

import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import Navbar from "../components/Navbar";
import ManageClient from "./ManageClient";

interface ManagePageProps {
  searchParams: Promise<{ token?: string; error?: string }>;
}

export const dynamic = "force-dynamic";

export default async function ManagePage({ searchParams }: ManagePageProps) {
  const params = await searchParams;
  const token  = params.token ?? "";
  const portalError = params.error === "portal";

  /* ─── Invalid / missing token ─── */
  if (!token) {
    return (
      <>
        <div className="stars" aria-hidden="true" />
        <Navbar />
        <main style={mainStyle}>
          <div style={cardStyle}>
            <p style={eyebrowStyle}>Manage Subscription</p>
            <h1 style={headingStyle}>Link not valid.</h1>
            <p style={bodyStyle}>
              This link is missing a token. Please use the link from your most recent prayer email.
            </p>
          </div>
        </main>
      </>
    );
  }

  /* ─── Fetch subscriber (server-side only) ─── */
  const db = getSupabaseAdmin();
  const { data: subscriber } = await db
    .from("subscribers")
    .select(
      "id, first_name, delivery_time, timezone, prayer_focus, tone, prayer_request, is_active, management_token"
    )
    .eq("management_token", token)
    .maybeSingle();

  /* ─── Token not found ─── */
  if (!subscriber) {
    return (
      <>
        <div className="stars" aria-hidden="true" />
        <Navbar />
        <main style={mainStyle}>
          <div style={cardStyle}>
            <p style={eyebrowStyle}>Manage Subscription</p>
            <h1 style={headingStyle}>Link expired or invalid.</h1>
            <p style={bodyStyle}>
              We couldn't find a subscription linked to this token. Try the link in your most recent
              prayer email, or contact support.
            </p>
          </div>
        </main>
      </>
    );
  }

  /* ─── Valid subscriber — render manage form ─── */
  return (
    <>
      <div className="stars" aria-hidden="true" />
      <Navbar />
      <main style={mainStyle}>
        <ManageClient
          token={token}
          firstName={subscriber.first_name ?? ""}
          deliveryTime={subscriber.delivery_time ?? "22:00"}
          timezone={subscriber.timezone ?? "America/New_York"}
          prayerFocus={subscriber.prayer_focus ?? "peace"}
          tone={subscriber.tone ?? "gentle"}
          prayerRequest={subscriber.prayer_request ?? ""}
          isActive={subscriber.is_active ?? true}
          portalError={portalError}
        />
      </main>
    </>
  );
}

/* ── Shared styles ── */
const mainStyle: React.CSSProperties = {
  position:        "relative",
  zIndex:          1,
  minHeight:       "100vh",
  display:         "flex",
  alignItems:      "center",
  justifyContent:  "center",
  padding:         "100px 24px 60px",
};

const cardStyle: React.CSSProperties = {
  textAlign:  "center",
  maxWidth:   520,
};

const eyebrowStyle: React.CSSProperties = {
  fontSize:       "0.68rem",
  fontWeight:     400,
  letterSpacing:  "0.18em",
  textTransform:  "uppercase",
  color:          "var(--gold)",
  marginBottom:   20,
};

const headingStyle: React.CSSProperties = {
  fontSize:    "clamp(1.6rem, 4vw, 2.4rem)",
  fontWeight:  400,
  fontStyle:   "italic",
  color:       "var(--cream)",
  lineHeight:  1.2,
  marginBottom: 20,
};

const bodyStyle: React.CSSProperties = {
  fontSize:    "1rem",
  fontWeight:  300,
  lineHeight:  1.85,
  color:       "rgba(240,232,216,0.55)",
};
