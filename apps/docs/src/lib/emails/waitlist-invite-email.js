export function createWaitlistInviteEmail({ inviteUrl }) {
  const subject = "You're in — Hyperiux Vault Pro is now open";

  const text = `
Good news - Hyperiux Vault Pro is now open.

You joined the Founding Access waitlist, and your spot is ready. Click below to create your account and unlock the full 115-effect vault.

Accept your invite: ${inviteUrl}

Hyperiux Vault
`;

  const html = `
    <div style="margin:0;padding:0;background:#050505;font-family:Arial,Helvetica,sans-serif;color:#ffffff;">
      <div style="max-width:620px;margin:0 auto;padding:40px 24px;">
        <div style="border:1px solid rgba(255,255,255,0.12);background:rgba(255,255,255,0.04);border-radius:28px;padding:32px;">
          <p style="margin:0 0 14px;color:#ff5f00;font-size:12px;font-weight:700;letter-spacing:0.24em;text-transform:uppercase;">
            Founding Access
          </p>

          <h1 style="margin:0;color:#ffffff;font-size:36px;line-height:1.05;font-weight:500;letter-spacing:-0.04em;">
            You're in.
          </h1>

          <p style="margin:18px 0 0;color:rgba(255,255,255,0.68);font-size:16px;line-height:1.7;">
            Hyperiux Vault Pro is now open, and your Founding Access spot is ready. Accept your invite to create your account and unlock the full vault.
          </p>

          <a href="${inviteUrl}" style="display:inline-block;margin-top:28px;padding:14px 28px;background:#ff5f00;color:#ffffff;text-decoration:none;border-radius:9999px;font-size:15px;font-weight:600;">
            Accept Invite
          </a>

          <p style="margin:28px 0 0;color:rgba(255,255,255,0.35);font-size:12px;line-height:1.7;">
            You're receiving this because you joined the Hyperiux Vault waitlist.
          </p>
        </div>
      </div>
    </div>
  `;

  return { subject, text, html };
}
