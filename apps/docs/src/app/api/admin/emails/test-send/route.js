import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { assertAdmin } from "@/lib/admin";
import { sendEmail } from "@/lib/resend";
import { renderWelcomeEmail, welcomeSubject } from "@/lib/emails/welcome-email";
import { renderResetPasswordEmail, resetPasswordSubject } from "@/lib/emails/reset-password-email";
import { renderPasswordChangedEmail, passwordChangedSubject } from "@/lib/emails/password-changed-email";
import { renderProUnlockedEmail, proUnlockedSubject } from "@/lib/emails/pro-unlocked-email";
import { renderWaitlistInviteEmail, waitlistInviteSubject } from "@/lib/emails/waitlist-invite-email";
import { createSubscriptionInvoiceEmail } from "@/lib/emails/subscription-invoice-email";
import { PasswordResetOtpEmail } from "@/components/WebsiteComps/emailTemplate/PasswordResetOtpEmail";
import { CustomAnimationFormEmail } from "@/components/WebsiteComps/emailTemplate/CustomAnimationFormEmail";
import { CustomAnimationFormConfirmationEmail } from "@/components/WebsiteComps/emailTemplate/CustomAnimationFormConfirmationEmail";
import { WorkWithHyperiuxEmail } from "@/components/WebsiteComps/emailTemplate/WorkWithHyperiuxEmail";
import { WorkWithHyperiuxConfirmationEmail } from "@/components/WebsiteComps/emailTemplate/WorkWithHyperiuxConfirmationEmail";

// One entry per email this app actually sends anywhere (webhook, forms,
// admin actions). Each returns either { subject, react } for a React Email
// template or { subject, html, text } for the plain-HTML invoice email -
// sendEmail() accepts both shapes.
const SAMPLE_EMAILS = {
  welcome: () => ({
    subject: welcomeSubject,
    react: renderWelcomeEmail(),
  }),
  reset_password_code: () => ({
    subject: resetPasswordSubject,
    react: renderResetPasswordEmail({
      otpCode: "123456",
      requestedFrom: "Mumbai, India",
      requestedAt: new Date().toLocaleString(),
    }),
  }),
  password_changed: () => ({
    subject: passwordChangedSubject,
    react: renderPasswordChangedEmail({
      requestedFrom: "Mumbai, India",
      requestedAt: new Date().toLocaleString(),
    }),
  }),
  password_reset_otp: () => ({
    subject: "Your password reset code - Hyperiux Vault",
    react: PasswordResetOtpEmail({ otp: "654321", expiresInMinutes: 10 }),
  }),
  pro_unlocked: () => ({
    subject: proUnlockedSubject,
    react: renderProUnlockedEmail({ planLabel: "Vault Pro Annual", isAdminGrant: false }),
  }),
  waitlist_invite: () => ({
    subject: waitlistInviteSubject,
    react: renderWaitlistInviteEmail({
      inviteUrl: "https://vault.hyperiux.com/signup/continue?__clerk_ticket=sample",
    }),
  }),
  subscription_invoice: () => {
    const { subject, html, text } = createSubscriptionInvoiceEmail({
      name: "Test User",
      billingInterval: "yearly",
      amount: 14900,
      currency: "USD",
      paymentId: "pay_test_sample123",
      periodEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      invoiceUrl: "https://razorpay.com/",
      isFirstPayment: true,
    });

    return { subject, html, text };
  },
  custom_animation_request: () => ({
    subject: "New custom animation request from Test User",
    react: CustomAnimationFormEmail({
      name: "Test User",
      email: "test@example.com",
      number: "+1 555 0100",
      message: "Sample request message for testing this email template.",
    }),
  }),
  custom_animation_request_confirmation: () => ({
    subject: "We received your request - Hyperiux",
    react: CustomAnimationFormConfirmationEmail({
      name: "Test User",
      message: "Sample request message for testing this email template.",
    }),
  }),
  work_with_hyperiux: () => ({
    subject: "New work enquiry from Test User",
    react: WorkWithHyperiuxEmail({
      name: "Test User",
      email: "test@example.com",
      number: "+1 555 0100",
      message: "Sample enquiry message for testing this email template.",
    }),
  }),
  work_with_hyperiux_confirmation: () => ({
    subject: "We received your enquiry - Hyperiux",
    react: WorkWithHyperiuxConfirmationEmail({
      name: "Test User",
      message: "Sample enquiry message for testing this email template.",
    }),
  }),
};

export async function POST(request) {
  if (!(await assertAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { type } = await request.json();
  const buildSample = SAMPLE_EMAILS[type];

  if (!buildSample) {
    return NextResponse.json({ error: `Unknown email type: ${type}` }, { status: 400 });
  }

  // Sends to whoever's testing it, not a hardcoded address - keeps this
  // working for any admin regardless of which inbox Resend is allowed to
  // deliver to.
  const user = await currentUser();
  const to = user?.emailAddresses?.[0]?.emailAddress;

  if (!to) {
    return NextResponse.json({ error: "No email address on your account." }, { status: 400 });
  }

  const { subject, react, html, text } = buildSample();

  const { success } = await sendEmail({
    to,
    subject: `[Test] ${subject}`,
    ...(react ? { react } : { html, text }),
    emailType: type,
  });

  if (!success) {
    return NextResponse.json({ error: "Failed to send test email." }, { status: 500 });
  }

  return NextResponse.json({ success: true, sentTo: to });
}
