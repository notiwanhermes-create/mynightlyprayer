import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { sendManageLinkEmail } from "@/lib/sendManageLinkEmail";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST { email } — emails the subscriber their private manage link.
 * Always responds with the same body whether or not the email exists,
 * so the endpoint can't be used to discover who is subscribed.
 */
export async function POST(req: NextRequest) {
  try {
    const body  = await req.json().catch(() => ({}));
    const email = typeof body.email === "string" ? body.email.trim() : "";

    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "A valid email is required." }, { status: 400 });
    }

    const db = getSupabaseAdmin();

    const { data: subscriber, error } = await db
      .from("subscribers")
      .select("first_name, email, management_token")
      .ilike("email", email)
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error("[send-manage-link] Supabase error:", error.message);
      return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
    }

    if (subscriber?.management_token) {
      try {
        await sendManageLinkEmail({
          to:              subscriber.email,
          firstName:       subscriber.first_name ?? "",
          managementToken: subscriber.management_token,
        });
        console.log(`[send-manage-link] Manage link sent → ${subscriber.email}`);
      } catch (emailErr) {
        console.error(
          "[send-manage-link] Email failed:",
          emailErr instanceof Error ? emailErr.message : emailErr,
        );
        return NextResponse.json({ error: "Could not send the email. Please try again." }, { status: 500 });
      }
    } else {
      console.log("[send-manage-link] No subscriber found for requested email");
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[send-manage-link] Handler threw:", err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
