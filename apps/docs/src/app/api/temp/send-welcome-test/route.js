import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { sendEmail } from "@/lib/resend";
import {
  renderWelcomeEmail,
  welcomeSubject,
  welcomeText,
} from "@/lib/emails/welcome-email";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "hitesh@weareenigma.com";

async function assertAdmin() {
  const { userId } = await auth();
  if (!userId) return false;

  const clerk = await clerkClient();
  const user = await clerk.users.getUser(userId);

  return (
    user?.publicMetadata?.role === "admin" ||
    user?.emailAddresses?.[0]?.emailAddress === ADMIN_EMAIL
  );
}

// Temporary route for previewing the welcome email without waiting on a
// real Clerk user.created webhook. Safe to delete once the design is final.
export async function POST() {
  if (!(await assertAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await sendEmail({
    to: "harsh@weareenigma.com",
    subject: welcomeSubject,
    react: renderWelcomeEmail(),
    text: welcomeText(),
    emailType: "temp_welcome_test",
  });

  return NextResponse.json({ success: true });
}
