import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { sendEmail } from "@/lib/resend";
import {
  renderPasswordChangedEmail,
  passwordChangedSubject,
  passwordChangedText,
} from "@/lib/emails/password-changed-email";

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

// Temporary route for previewing the password-changed email without a real
// Clerk webhook delivery. Safe to delete once the design is final.
export async function POST() {
  if (!(await assertAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const requestedFrom = "Delhi, India";
  const requestedAt = new Date().toUTCString();

  await sendEmail({
    to: "harsh@weareenigma.com",
    subject: passwordChangedSubject,
    react: renderPasswordChangedEmail({ requestedFrom, requestedAt }),
    text: passwordChangedText({ requestedFrom, requestedAt }),
    emailType: "temp_password_changed_test",
  });

  return NextResponse.json({ success: true });
}
