export function createPaymentFailedEmail({ name = "there" }) {
  const subject = "Action required: Payment failed for Hyperiux Vault Pro";

  const text = `
Hi ${name},

We were unable to process your payment for Hyperiux Vault Pro.

Your access remains active for now, but please update your payment method to avoid interruption.

Update payment details: https://vault.hyperiux.com/dashboard/settings

If you have any questions, reply to this email.

Hyperiux Vault
`;

  const html = `
    <div style="margin:0;padding:0;background:#050505;font-family:Arial,Helvetica,sans-serif;color:#ffffff;">
      <div style="max-width:620px;margin:0 auto;padding:40px 24px;">
        <div style="border:1px solid rgba(255,255,255,0.12);background:rgba(255,255,255,0.04);border-radius:28px;padding:32px;">
          <p style="margin:0 0 14px;color:#ff5f00;font-size:12px;font-weight:700;letter-spacing:0.24em;text-transform:uppercase;">
            Hyperiux Vault
          </p>

          <h1 style="margin:0;color:#ffffff;font-size:32px;line-height:1.1;font-weight:500;letter-spacing:-0.03em;">
            Payment failed.
          </h1>

          <p style="margin:18px 0 0;color:rgba(255,255,255,0.68);font-size:16px;line-height:1.7;">
            Hi ${name}, we weren't able to process your payment for Hyperiux Vault Pro.
            Your access remains active for now, but please update your payment method to avoid interruption.
          </p>

          <div style="margin:28px 0;">
            <a href="https://vault.hyperiux.com/dashboard/settings" style="display:inline-block;padding:14px 28px;background:#ff5f00;color:#ffffff;text-decoration:none;border-radius:9999px;font-size:15px;font-weight:600;">
              Update Payment Method
            </a>
          </div>

          <p style="margin:20px 0 0;color:rgba(255,255,255,0.35);font-size:12px;line-height:1.7;">
            If you believe this is an error or need help, reply to this email.
          </p>
        </div>
      </div>
    </div>
  `;

  return { subject, text, html };
}

export function createSubscriptionCancelledEmail({ name = "there" }) {
  const subject = "Your Hyperiux Vault Pro subscription has ended";

  const text = `
Hi ${name},

Your Hyperiux Vault Pro subscription has been cancelled and your access has been downgraded to the free tier.

You still have access to 30+ free effects in the vault.

To resubscribe and unlock the full vault again, visit: https://vault.hyperiux.com/pricing

Hyperiux Vault
`;

  const html = `
    <div style="margin:0;padding:0;background:#050505;font-family:Arial,Helvetica,sans-serif;color:#ffffff;">
      <div style="max-width:620px;margin:0 auto;padding:40px 24px;">
        <div style="border:1px solid rgba(255,255,255,0.12);background:rgba(255,255,255,0.04);border-radius:28px;padding:32px;">
          <p style="margin:0 0 14px;color:#ff5f00;font-size:12px;font-weight:700;letter-spacing:0.24em;text-transform:uppercase;">
            Hyperiux Vault
          </p>

          <h1 style="margin:0;color:#ffffff;font-size:32px;line-height:1.1;font-weight:500;letter-spacing:-0.03em;">
            Subscription cancelled.
          </h1>

          <p style="margin:18px 0 0;color:rgba(255,255,255,0.68);font-size:16px;line-height:1.7;">
            Hi ${name}, your Hyperiux Vault Pro subscription has ended.
            Your account has been moved to the free tier — you still have access to 30+ effects.
          </p>

          <div style="margin:28px 0;padding:20px;border:1px solid rgba(255,255,255,0.1);background:#0d0d0d;border-radius:20px;">
            <p style="margin:0 0 8px;color:rgba(255,255,255,0.5);font-size:13px;">What you still have</p>
            <ul style="margin:10px 0 0;padding:0;list-style:none;color:rgba(255,255,255,0.72);font-size:15px;line-height:2;">
              <li>✓ 30+ free effects — scroll, cursor, text, and UI</li>
              <li>✓ Copy-paste React &amp; Next.js components</li>
              <li>✓ Live previews and documentation</li>
            </ul>
          </div>

          <a href="https://vault.hyperiux.com/pricing" style="display:inline-block;padding:14px 28px;background:#ff5f00;color:#ffffff;text-decoration:none;border-radius:9999px;font-size:15px;font-weight:600;">
            Resubscribe to Pro
          </a>

          <p style="margin:20px 0 0;color:rgba(255,255,255,0.35);font-size:12px;line-height:1.7;">
            We're sorry to see you go. If you have feedback, reply to this email.
          </p>
        </div>
      </div>
    </div>
  `;

  return { subject, text, html };
}

export function createSubscriptionRenewedEmail({ name = "there", validUntil }) {
  const renewalDate = validUntil
    ? new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(new Date(validUntil))
    : "Not available";

  const subject = "Your Hyperiux Vault Pro subscription has renewed";

  const text = `
Hi ${name},

Your Hyperiux Vault Pro subscription has renewed successfully.

Next renewal: ${renewalDate}

You continue to have full access to the vault.

Explore the vault: https://vault.hyperiux.com/effects

Hyperiux Vault
`;

  const html = `
    <div style="margin:0;padding:0;background:#050505;font-family:Arial,Helvetica,sans-serif;color:#ffffff;">
      <div style="max-width:620px;margin:0 auto;padding:40px 24px;">
        <div style="border:1px solid rgba(255,255,255,0.12);background:rgba(255,255,255,0.04);border-radius:28px;padding:32px;">
          <p style="margin:0 0 14px;color:#ff5f00;font-size:12px;font-weight:700;letter-spacing:0.24em;text-transform:uppercase;">
            Hyperiux Vault
          </p>

          <h1 style="margin:0;color:#ffffff;font-size:32px;line-height:1.1;font-weight:500;letter-spacing:-0.03em;">
            Subscription renewed.
          </h1>

          <p style="margin:18px 0 0;color:rgba(255,255,255,0.68);font-size:16px;line-height:1.7;">
            Hi ${name}, your Hyperiux Vault Pro subscription has renewed successfully. Your full vault access continues.
          </p>

          <div style="margin:28px 0;padding:20px;border:1px solid rgba(255,255,255,0.1);background:#0d0d0d;border-radius:20px;">
            <p style="margin:0 0 10px;color:rgba(255,255,255,0.5);font-size:13px;">Next renewal</p>
            <p style="margin:0;color:#ffffff;font-size:20px;font-weight:600;">${renewalDate}</p>
          </div>

          <a href="https://vault.hyperiux.com/effects" style="display:inline-block;padding:14px 28px;background:#ff5f00;color:#ffffff;text-decoration:none;border-radius:9999px;font-size:15px;font-weight:600;">
            Explore the Vault
          </a>
        </div>
      </div>
    </div>
  `;

  return { subject, text, html };
}
