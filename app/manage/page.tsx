/**
 * app/manage/page.tsx
 * Server Component — resolves the management token from searchParams (Promise in Next.js 15+),
 * fetches the subscriber from Supabase, and renders the client form.
 * Never exposes Stripe IDs or billing data to the client.
 */

import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import Navbar from "../components/Navbar";
import ManageClient from "./ManageClient";
import RequestLinkClient from "./RequestLinkClient";

interface ManagePageProps {
  searchParams: Promise<{ token?: string; error?: string }>;
}

export const dynamic = "force-dynamic";

export default async function ManagePage({ searchParams }: ManagePageProps) {
  const params = await searchParams;
  const token  = params.token ?? "";
  const portalError = params.error === "portal";

  /* ─── No token — let the subscriber request their link by email ─── */
  if (!token) {
    return (
      <>
        <div className="stars" aria-hidden="true" />
        <Navbar />
        <main style={mainStyle}>
          <RequestLinkClient />
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

  /* ─── Token not found — offer to email a fresh link ─── */
  if (!subscriber) {
    return (
      <>
        <div className="stars" aria-hidden="true" />
        <Navbar />
        <main style={mainStyle}>
          <RequestLinkClient expired />
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

