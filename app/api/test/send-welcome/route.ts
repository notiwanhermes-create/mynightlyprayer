import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin }   from "@/lib/supabaseAdmin";
import { sendWelcomeEmail }   from "@/lib/sendWelcomeEmail";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function authorized(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const header = req.headers.get("authorization") ?? "";
  const token  = header.startsWith("Bearer ") ? header.slice(7) : header;
  return token === secret;
}

export async function GET(req: NextRequest)  { return run(req); }
export async function POST(req: NextRequest) { return run(req); }

async function run(req: NextRequest) {
  if (!process.env.CRON_SECRET) {
    return NextResponse.json({ error: "CRON_SECRET not set." }, { status: 500 });
  }
  if (!authorized(req)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const url   = new URL(req.url);
  const email = url.searchParams.get("email");

  if (!email) {
    return NextResponse.json({ error: "Provide ?email=you@example.com" }, { status: 400 });
  }

  const db = getSupabaseAdmin();
  const { data: rows, error: fetchErr } = await db
    .from("subscribers")
    .select("email, first_name, delivery_time, management_token")
    .eq("email", email)
    .limit(1);

  if (fetchErr) return NextResponse.json({ error: fetchErr.message }, { status: 500 });
  if (!rows?.length) return NextResponse.json({ error: "Subscriber not found." }, { status: 404 });

  const sub = rows[0];

  try {
    await sendWelcomeEmail({
      to:              sub.email,
      firstName:       sub.first_name     ?? "",
      deliveryTime:    sub.delivery_time  ?? "",
      managementToken: sub.management_token ?? "",
    });

    console.log(`[test-welcome] Welcome email sent → ${sub.email}`);
    return NextResponse.json({ success: true, email: sub.email });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`[test-welcome] Failed:`, msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
