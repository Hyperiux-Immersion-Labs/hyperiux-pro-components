import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { sendEmail } from "@/lib/resend";
import {
  renderProUnlockedEmail,
  proUnlockedSubject,
  proUnlockedText,
} from "@/lib/emails/pro-unlocked-email";

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

// Temporary route for previewing the pro-unlocked email without a real
// Stripe payment. Safe to delete once the design is final.
export async function POST() {
  if (!(await assertAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const planLabel = "Vault Pro Founding Annual";

  await sendEmail({
    to: "harsh@weareenigma.com",
    subject: proUnlockedSubject,
    react: renderProUnlockedEmail({ planLabel }),
    text: proUnlockedText({ planLabel }),
    emailType: "temp_pro_unlocked_test",
  });

  return NextResponse.json({ success: true });
}
