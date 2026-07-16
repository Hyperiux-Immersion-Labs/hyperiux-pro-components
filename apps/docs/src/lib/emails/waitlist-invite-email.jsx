import {
  Body,
  Button,
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

// NOTE: baseUrl and every asset path below (logo, hero image, social icons)
// are placeholders - swap them once the final design assets are ready.
const baseUrl = "https://vault.hyperiux.com";

const socialLinks = [
  { label: "X", href: "https://x.com/_hyperiux_", icon: "/emails/x-icon-email-temp.png" },
  { label: "LinkedIn", href: "https://www.linkedin.com/company/hyperiux/", icon: "/emails/linkedin-icon-email-temp.png" },
  { label: "GitHub", href: "https://github.com/Hyperiux-Immersion-Labs/hyperiux-components", icon: "/emails/github-icon-email-temp.png" },
  { label: "Instagram", href: "https://www.instagram.com/_hyperiux_/", icon: "/emails/insta-icon-email-temp.png" },
];

const fontFamily = "Aeonik, Arial, sans-serif";

export const waitlistInviteSubject = "You're first: Vault Pro is live! 🚀";

export function waitlistInviteText({ inviteUrl }) {
  return `
The door's open. Vault Pro is live.

Everyone else will find out later today. You already knew, because you trusted us before everyone else.

As a thank you, we're opening founding access to the first 100 people on our waitlist: $149/year, locked in for as long as your annual subscription remains active and uninterrupted. After those 100 memberships are claimed, Vault Pro will be $179/year or $20/month.

Unlock the complete Pro collection with source code that lands directly in your project. Edit it, restyle it, and make every interaction yours without starting from zero or working around a black box.

Claim Founding Price — $149/year: ${inviteUrl}

Once these 100 spots are gone, this price won't come back.

Cancel anytime. Code you have already installed stays in your repo.

Hyperiux Vault
`;
}

export function WaitlistInviteEmail({ inviteUrl }) {
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
        </Head>
        <Preview>Your Founding Access invite is ready. Just the first 100 get this.</Preview>
        <Body className="m-0" style={{ fontFamily }}>
          <Container
            className="mx-auto w-full max-w-[600px] px-4"
            style={{
              backgroundImage: `url(${baseUrl}/emails/email-temp-bg.png)`,
              backgroundSize: "cover",
              backgroundPosition: "top center",
              backgroundRepeat: "no-repeat",
            }}
          >
            <Section className="px-1 pt-8 pb-6">
              <Img src={`${baseUrl}/emails/hyperiux-logo-white.png`} alt="Hyperiux" width={140} height={17} />
            </Section>

            <Section className=" mb-8 overflow-hidden rounded-[14px] bg-white">
              <Section className="p-4">
                <Img
                  src={`${baseUrl}/emails/invitation-email-img.png`}
                  alt=""
                  width={560}
                  className="block h-auto w-full rounded-[9px]"
                />
              </Section>

              <Section className="px-4 pb-10 text-center">
                <Heading
                  as="h1"
                  style={{ fontFamily, fontWeight: 400 }}
                  className="m-0 text-[40px] leading-[1.15] text-[#0a0a0a]"
                >
                  The door&apos;s open. Vault Pro is live.
                </Heading>

                <Text
                  className="m-0 mt-5 text-[15px] leading-6 text-[#1D1D1D]"
                  style={{ fontFamily }}
                >
                  Everyone else will find out later today. You already
                  knew, because you trusted us before everyone else.
                </Text>

                <Text
                  className="m-0 mt-4 text-[15px] leading-6 text-[#1D1D1D]"
                  style={{ fontFamily }}
                >
                  As a thank you, we&apos;re opening founding access to
                  the first 100 people on our waitlist: $149/year, locked
                  in for as long as your annual subscription remains
                  active and uninterrupted. After those 100 memberships
                  are claimed, Vault Pro will be $179/year or $20/month.
                </Text>

                <Text
                  className="m-0 mt-4 text-[15px] leading-6 text-[#1D1D1D]"
                  style={{ fontFamily }}
                >
                  Unlock the complete Pro collection with source code
                  that lands directly in your project. Edit it, restyle
                  it, and make every interaction yours without starting
                  from zero or working around a black box.
                </Text>
                <Text
                  className="m-0 mt-4 text-[15px] font-semibold leading-6 text-[#1D1D1D]"
                  style={{ fontFamily }}
                >
                   Claim Founding Price - $149/year
                </Text>

                <Section className="mt-8 text-center">
                  <Button
                    href={inviteUrl}
                    style={{ fontFamily }}
                    className="inline-block rounded-full bg-[#ff5f00] px-8 py-4 text-[15px] font-medium text-white"
                  >
                    Accept Invite
                  </Button>
                </Section>

                <Text
                  className="m-0 mt-4 text-[13px] text-[#8a8a8a]"
                  style={{ fontFamily }}
                >
                  Once these 100 spots are gone, this price won&apos;t
                  come back.
                </Text>

                <Text
                  className="m-0 mt-1 text-[13px] text-[#8a8a8a]"
                  style={{ fontFamily }}
                >
                  Cancel anytime. Code you have already installed stays
                  in your repo.
                </Text>

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
                  className="m-0 mt-6 text-[12px] leading-5 text-[#a1a1aa]"
                  style={{ fontFamily }}
                >
                  312, Tower A, Grandslam I-Thum,
                  <br />
                  Sector 62, Noida, Uttar Pradesh
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

export function renderWaitlistInviteEmail({ inviteUrl }) {
  return <WaitlistInviteEmail inviteUrl={inviteUrl} />;
}
