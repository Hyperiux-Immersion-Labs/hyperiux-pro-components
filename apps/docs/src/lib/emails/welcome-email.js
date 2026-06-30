export function createWelcomeEmail({ name = "there" }) {
  const subject = "Welcome to Hyperiux Vault";

  const text = `
Hi ${name},

Welcome to Hyperiux Vault. Your account is now active.

With your free account you get access to 30+ effects — scroll interactions, cursor effects, text animations, and more — all copy-paste ready for React and Next.js.

To access the full vault of 100+ premium effects, upgrade to Pro from your dashboard.

Get started: https://vault.hyperiux.com/effects

Hyperiux Vault
`;

  const html = `
    <div style="margin:0;padding:0;background:#050505;font-family:Arial,Helvetica,sans-serif;color:#ffffff;">
      <div style="max-width:620px;margin:0 auto;padding:40px 24px;">
        <div style="border:1px solid rgba(255,255,255,0.12);background:rgba(255,255,255,0.04);border-radius:28px;padding:32px;">
          <p style="margin:0 0 14px;color:#ff5f00;font-size:12px;font-weight:700;letter-spacing:0.24em;text-transform:uppercase;">
            Hyperiux Vault
          </p>

          <h1 style="margin:0;color:#ffffff;font-size:36px;line-height:1.05;font-weight:500;letter-spacing:-0.04em;">
            Welcome to the Vault.
          </h1>

          <p style="margin:18px 0 0;color:rgba(255,255,255,0.68);font-size:16px;line-height:1.7;">
            Hi ${name}, your Hyperiux Vault account is active and ready to go.
          </p>

          <div style="margin:28px 0;padding:20px;border:1px solid rgba(255,255,255,0.1);background:#0d0d0d;border-radius:20px;">
            <p style="margin:0 0 8px;color:rgba(255,255,255,0.5);font-size:13px;">Your free account includes</p>
            <ul style="margin:12px 0 0;padding:0;list-style:none;color:rgba(255,255,255,0.72);font-size:15px;line-height:2;">
              <li>✓ 30+ free effects — scroll, cursor, text, and UI</li>
              <li>✓ Copy-paste React &amp; Next.js components</li>
              <li>✓ Live previews and clean docs</li>
            </ul>
          </div>

          <h2 style="margin:0 0 12px;color:#ffffff;font-size:20px;line-height:1.2;font-weight:600;">
            Unlock the full Vault with Pro
          </h2>
          <p style="margin:0 0 24px;color:rgba(255,255,255,0.68);font-size:15px;line-height:1.7;">
            Upgrade to access 100+ premium effects, WebGL components, advanced motion systems, and Hyperiux CLI support.
          </p>

          <a href="https://vault.hyperiux.com/effects" style="display:inline-block;padding:14px 28px;background:#ff5f00;color:#ffffff;text-decoration:none;border-radius:9999px;font-size:15px;font-weight:600;">
            Explore the Vault
          </a>

          <p style="margin:28px 0 0;color:rgba(255,255,255,0.35);font-size:12px;line-height:1.7;">
            You're receiving this because you created a Hyperiux Vault account.
          </p>
        </div>
      </div>
    </div>
  `;

  return { subject, text, html };
}
