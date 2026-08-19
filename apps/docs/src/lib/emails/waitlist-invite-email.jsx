import {
  Body,
  Column,
  Container,
  Font,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Row,
  Section,
  Tailwind,
  Text,
} from "@react-email/components";

// NOTE: baseUrl and every asset path below (logo, social icons) are
// placeholders - swap them once the final design assets are ready. Always
// production, regardless of environment: email clients fetch these images
// over the public internet, and a local dev server won't be serving them.
const baseUrl = "https://vault.hyperiux.com";

// Where the app itself is running - used only for the CTA link, so it
// follows NEXT_PUBLIC_APP_URL (e.g. a local/staging subdomain while
// testing) instead of always pointing at production like baseUrl does.
const appUrl = process.env.NEXT_PUBLIC_APP_URL || baseUrl;

// Actually-animated sample gif (public domain, Wikimedia Commons) so you can
// confirm gifs render/animate correctly in email clients before swapping in
// the real "Vault effects in motion" clip (upload it to ${baseUrl}/emails/
// and update the src below).
const showcaseGifUrl = "https://pub-8abee449136941f5b0a1cd2c014534e9.r2.dev/gif/mailer-gif.gif";

const socialLinks = [
  { label: "X", href: "https://x.com/_hyperiux_", icon: "/emails/x-icon-email-temp.png" },
  { label: "LinkedIn", href: "https://www.linkedin.com/company/hyperiux/", icon: "/emails/linkedin-icon-email-temp.png" },
  { label: "GitHub", href: "https://github.com/Hyperiux-Immersion-Labs/hyperiux-components", icon: "/emails/github-icon-email-temp.png" },
  { label: "Instagram", href: "https://www.instagram.com/_hyperiux_/", icon: "/emails/insta-icon-email-temp.png" },
];

const fontFamily = "Aeonik, system-ui";

// The CTA routes through /api/e/[trackingId] (a click-tracking redirect that
// marks the sent_emails row as clicked) which then forwards the recipient on
// to the invitation's sign-up ticket URL (accepting only asks for a
// password, since the email is pre-verified) - or to /effects with UTM
// params as a fallback if no ticket URL is available.
const exploreVaultUtm = "utm_source=email&utm_medium=invite&utm_campaign=invitations";

function exploreVaultUrl(trackingId, signUpUrl) {
  if (!trackingId) return signUpUrl || `${appUrl}/effects?${exploreVaultUtm}`;
  const to = signUpUrl ? `?to=${encodeURIComponent(signUpUrl)}` : "";
  return `${appUrl}/api/e/${trackingId}${to}`;
}

export const waitlistInviteSubject = "You're invited to Hyperiux Vault";

export function waitlistInviteText({ trackingId, signUpUrl } = {}) {
  return `
Hey, building every interaction from scratch is one way to make a site feel specific - not always the sensible one.

That's why we built Hyperiux Vault: a source-first library of interaction effects and frontend systems for React and Next.js.

You can preview an effect, inspect how it works, then copy the source or add it with the CLI. From there, change the timing, behaviour and implementation until it fits the project rather than looking like something you pulled off the shelf.

Vault also surfaces dependencies and the production details worth checking, including mobile behaviour, reduced motion and performance.

Explore Vault: ${exploreVaultUrl(trackingId, signUpUrl)}

Hyperiux Vault
`;
}

export function WaitlistInviteEmail({ trackingId, signUpUrl } = {}) {
  return (
    <Tailwind>
      <Html>
        <Head>
          <Font
            fontFamily="Aeonik"
            fallbackFontFamily="Arial"
            webFont={{
              url: `${baseUrl}/assets/fonts/Aeonik-Regular.woff2`,
              format: "woff2",
            }}
            fontWeight={400}
            fontStyle="normal"
          />
          <style>{`
            @media only screen and (max-width: 542px) {
              .vault-btn { padding: 8px 16px !important; }
            }
          `}</style>
        </Head>
        <Preview>Your account is ready to be set up on Hyperiux Vault.</Preview>
        <Body className="m-0" style={{ fontFamily }}>
          <Container
            className="mx-auto w-full max-w-150 px-4"
            style={{
              backgroundImage: `url(${baseUrl}/emails/email-temp-bg.png)`,
              backgroundSize: "cover",
              backgroundPosition: "top center",
              backgroundRepeat: "no-repeat",
            }}
          >
            <Section className="px-1 pt-8 pb-6">
              <Img src={`${baseUrl}/emails/hyperiux-email-logo.png`} alt="Hyperiux" width={140} height={17} />
            </Section>

            <Section className=" mb-8 overflow-hidden rounded-[14px] bg-white">
              <Section className="p-4">
                <Img
                  src={`${baseUrl}/emails/invite-email-img.jpg`}
                  alt="email-icon"
                  width={560}
                  className="block h-auto w-full rounded-[9px]"
                />
              </Section>

              <Section className="px-8 pb-10 text-center mt-4">
                <Heading
                  as="h1"
                  style={{ fontFamily, fontWeight: 400 }}
                  className="m-0 text-[32px] leading-[1.15] text-[#0a0a0a]"
                >
                  Your account is ready to be set up on Hyperiux Vault.
                </Heading>

                <Text
                  className="m-0 mt-5 text-[18px] leading-6 text-[#1D1D1D]"
                  style={{ fontFamily }}
                >
                  Hey, building every interaction from scratch is one way
                  to make a site feel specific - not always the sensible
                  one.
                </Text>

                <Text
                  className="m-0 mt-4 text-[15px] leading-6 text-[#1D1D1D]"
                  style={{ fontFamily }}
                >
                  That&apos;s why we built Hyperiux Vault: a source-first
                  library of interaction effects and frontend systems for
                  React and Next.js.
                </Text>

                <Text
                  className="m-0 mt-4 text-[15px] leading-6 text-[#1D1D1D]"
                  style={{ fontFamily }}
                >
                  You can preview an effect, inspect how it works, then
                  copy the source or add it with the CLI. From there,
                  change the timing, behaviour and implementation until it
                  fits the project rather than looking like something you
                  pulled off the shelf.
                </Text>

                <Section className="mt-8">
                  <Text
                    className="m-0 mb-3 text-[18px] font-semibold leading-5 text-[#1D1D1D]"
                    style={{ fontFamily }}
                  >
                    A few Vault effects, in motion.
                  </Text>
                  <Img
                    src={showcaseGifUrl}
                    alt="A few Hyperiux Vault effects in motion"
                    width={560}
                    className="block h-auto w-full rounded-[9px]"
                  />
                </Section>

                <Text
                  className="m-0 mt-6 text-[15px] leading-6 text-[#1D1D1D]"
                  style={{ fontFamily }}
                >
                  Vault also surfaces dependencies and the production
                  details worth checking, including mobile behaviour,
                  reduced motion and performance.
                </Text>

                <Section className="mt-8 text-center">
                  {/* Gmail's mobile apps don't render CSS background-image at
                      all, so the gradient here comes from the legacy HTML
                      `background` attribute (a real PNG), which Gmail mobile
                      does honor. The inline gradient is layered on top as a
                      progressive enhancement for clients that support it. */}
                  <table role="presentation" cellPadding="0" cellSpacing="0" style={{ margin: "0 auto" }}>
                    <tbody>
                      <tr>
                        <td
                          align="center"
                          bgcolor="#ff5f00"
                          background={`${baseUrl}/emails/button-gradient.png`}
                          style={{
                            borderRadius: "9999px",
                            backgroundImage: "linear-gradient(135deg, #FF8400, #FF4100)",
                            backgroundSize: "cover",
                          }}
                        >
                          <a
                            href={exploreVaultUrl(trackingId, signUpUrl)}
                            className="vault-btn"
                            style={{
                              display: "inline-block",
                              padding: "10px 20px",
                              fontFamily,
                              fontSize: "18px",
                              fontWeight: 600,
                              color: "#ffffff",
                              textDecoration: "none",
                            }}
                          >
                            Explore Vault
                          </a>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </Section>

                <Hr className="mx-0 mt-10 mb-8 border-[#e4e4e7]" />

                <Row>
                  <Column align="center">
                    {socialLinks.map((social) => (
                      <Link
                        key={social.label}
                        href={social.href}
                        className="mx-2 inline-block align-middle"
                      >
                        <Img src={`${baseUrl}${social.icon}`} alt={social.label} width={18} />
                      </Link>
                    ))}
                  </Column>
                </Row>

                <Text
                  className="m-0 mt-6 text-[13px] text-[#8a8a8a]"
                  style={{ fontFamily }}
                >
                  <Link href={`${baseUrl}/legal/privacy-policy`} className="text-[#8a8a8a]">
                    Privacy Policy
                  </Link>
                  {" "}·{" "}
                  <Link href={`${baseUrl}/legal/terms-of-service`} className="text-[#8a8a8a]">
                    Terms of Service
                  </Link>
                </Text>

                <Text
                  className="m-0 mt-2 text-[13px]"
                  style={{ fontFamily }}
                >
                  <Link href={`${baseUrl}`} className="text-[#ff5f00]">
                    Unsubscribe
                  </Link>
                </Text>
              </Section>
            </Section>
          </Container>
        </Body>
      </Html>
    </Tailwind>
  );
}

export default WaitlistInviteEmail;

export function renderWaitlistInviteEmail({ trackingId, signUpUrl } = {}) {
  return <WaitlistInviteEmail trackingId={trackingId} signUpUrl={signUpUrl} />;
}
