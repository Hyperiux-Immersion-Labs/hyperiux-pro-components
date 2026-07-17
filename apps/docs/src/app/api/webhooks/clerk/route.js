import { NextResponse } from "next/server";
import { Webhook } from "svix";
import { supabase } from "@/lib/supabase";
import { sendEmail } from "@/lib/resend";
import { renderWelcomeEmail, welcomeSubject, welcomeText } from "@/lib/emails/welcome-email";

export async function POST(request) {
  const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error("CLERK_WEBHOOK_SECRET is not set");
    return NextResponse.json({ error: "Webhook not configured" }, { status: 500 });
  }

  const svixId = request.headers.get("svix-id");
  const svixTimestamp = request.headers.get("svix-timestamp");
  const svixSignature = request.headers.get("svix-signature");

  if (!svixId || !svixTimestamp || !svixSignature) {
    return NextResponse.json({ error: "Missing svix headers" }, { status: 400 });
  }

  const body = await request.text();

  let event;
  try {
    const wh = new Webhook(webhookSecret);
    event = wh.verify(body, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    });
  } catch (err) {
    console.error("Clerk webhook verification failed:", err.message);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "user.created") {
    const { id: clerkUserId, email_addresses, created_at } = event.data;

    const email = email_addresses?.[0]?.email_address;

    // Provision a free subscription row in Supabase
    const { error: upsertError } = await supabase
      .from("subscriptions")
      .upsert(
        {
          clerk_user_id: clerkUserId,
          plan: "free",
          status: "inactive",
          created_at: new Date(created_at).toISOString(),
          updated_at: new Date().toISOString(),
        },
        { onConflict: "clerk_user_id" }
      );

    if (upsertError) {
      console.error("CLERK_WEBHOOK_SUPABASE_UPSERT_ERROR:", upsertError);
    }

    // Send welcome email
    if (email) {
      await sendEmail({
        to: email,
        subject: welcomeSubject,
        react: renderWelcomeEmail(),
        text: welcomeText(),
        emailType: "welcome",
      });
    }
  }

  return NextResponse.json({ received: true });
}
