import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { sendEmail } from "@/lib/resend";
import { createWaitlistInviteEmail } from "@/lib/emails/waitlist-invite-email";

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

export async function POST(req) {
  if (!(await assertAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Missing email" }, { status: 400 });
    }

    const clerk = await clerkClient();

    // notify:false stops Clerk sending its own invite email - we send our
    // own branded one below using the invitation's accept URL.
    const invitation = await clerk.invitations.createInvitation({
      emailAddress: email,
      notify: false,
      ignoreExisting: true,
      templateSlug: "waitlist_invitation",
    });

    if (!invitation.url) {
      throw new Error("Clerk did not return an invitation URL");
    }

    const emailContent = createWaitlistInviteEmail({ inviteUrl: invitation.url });

    await sendEmail({
      to: email,
      subject: emailContent.subject,
      html: emailContent.html,
      text: emailContent.text,
      emailType: "waitlist_invite",
    });

    return NextResponse.json({ success: true, invitationId: invitation.id });
  } catch (error) {
    console.error("ADMIN_WAITLIST_INVITE_ERROR:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
