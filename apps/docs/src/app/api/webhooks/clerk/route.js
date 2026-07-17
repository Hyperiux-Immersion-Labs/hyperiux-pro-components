import { NextResponse } from "next/server";
import { Webhook } from "svix";
import { supabase } from "@/lib/supabase";
import { sendEmail } from "@/lib/resend";
import { renderWelcomeEmail, welcomeSubject, welcomeText } from "@/lib/emails/welcome-email";
import {
  renderResetPasswordEmail,
  resetPasswordSubject,
  resetPasswordText,
} from "@/lib/emails/reset-password-email";

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
  } else if (event.type === "email.created") {
    // Fires for any Clerk system email whose "Delivered by Clerk" toggle is
    // off (currently just the reset-password-code template - see Dashboard
    // > Customization > Emails). delivered_by_clerk is false only in that
    // case, so gating on it (rather than guessing the template's internal
    // slug string) is what tells us Clerk expects us to send this one
    // ourselves instead of just logging/ignoring the event.
    const { to_email_address: toEmail, delivered_by_clerk: deliveredByClerk, data } = event.data;
    const otpCode = data?.otp_code;

    if (deliveredByClerk === false && toEmail && otpCode) {
      await sendEmail({
        to: toEmail,
        subject: resetPasswordSubject,
        react: renderResetPasswordEmail({
          otpCode,
          requestedFrom: data?.requested_from,
          requestedAt: data?.requested_at,
        }),
        text: resetPasswordText({
          otpCode,
          requestedFrom: data?.requested_from,
          requestedAt: data?.requested_at,
        }),
        emailType: "reset_password_code",
      });
    }
  }

  return NextResponse.json({ received: true });
}
