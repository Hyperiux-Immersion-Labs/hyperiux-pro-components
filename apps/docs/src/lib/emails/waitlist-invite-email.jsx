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
  { label: "X", href: "https://x.com/_hyperiux_", icon: "/assets/social-icons/twitter.svg" },
  { label: "LinkedIn", href: "https://www.linkedin.com/company/hyperiux/", icon: "/assets/social-icons/linkedIn.svg" },
  { label: "GitHub", href: "https://github.com/Hyperiux-Immersion-Labs/hyperiux-components", icon: "/icons/github.svg" },
  { label: "Instagram", href: "https://www.instagram.com/_hyperiux_/", icon: "/assets/social-icons/instagram.svg" },
];

const fontFamily = "AvenirNextCyr, Arial, sans-serif";

export const waitlistInviteSubject = "You're in — Hyperiux Vault Pro is now open";

export function waitlistInviteText({ inviteUrl }) {
  return `
Good news - Hyperiux Vault Pro is now open.

You joined the Founding Access waitlist, and your spot is ready. Click below to create your account and unlock the full 115-effect vault.

Accept your invite: ${inviteUrl}

Hyperiux Vault
`;
}

export function WaitlistInviteEmail({ inviteUrl }) {
  return (
    <Tailwind>
      <Html>
        <Head>
          <Font
            fontFamily="AvenirNextCyr"
            fallbackFontFamily="Arial"
            webFont={{
              url: `${baseUrl}/assets/fonts/AvenirNextCyr-Regular.woff2`,
              format: "woff2",
            }}
            fontWeight={400}
            fontStyle="normal"
          />
          <Font
            fontFamily="AvenirNextCyr"
            fallbackFontFamily="Arial"
            webFont={{
              url: `${baseUrl}/assets/fonts/AvenirNextCyr-Medium.woff2`,
              format: "woff2",
            }}
            fontWeight={500}
            fontStyle="normal"
          />
        </Head>
        <Preview>Your Hyperiux Vault Pro spot is ready</Preview>
        <Body className="m-0 bg-[#0a0a0a]" style={{ fontFamily }}>
          <Container className="mx-auto w-full max-w-[600px]">
            <Section className="px-8 pt-8 pb-6">
              <Img src={`${baseUrl}/hyperiux.png`} alt="Hyperiux" width={140} height={17} />
            </Section>

            <Section className="mx-4 mb-8 overflow-hidden rounded-[24px] bg-white">
              <Section className="p-4">
                <Img
                  src={`${baseUrl}/emails/invitation-email-img.png`}
                  alt=""
                  width={560}
                  height={315}
                  className="block w-full rounded-[16px]"
                />
              </Section>

              <Section className="px-10 pb-10 text-center">
                <Text className="m-0 text-[14px] text-[#8a8a8a]" style={{ fontFamily }}>
                  Thanks for joining us
                </Text>

                <Heading
                  as="h1"
                  style={{ fontFamily, fontWeight: 500 }}
                  className="m-0 mt-3 text-[48px] leading-[1.05] text-[#0a0a0a]"
                >
                  You&apos;re in.
                </Heading>

                <Text
                  className="m-0 mt-4 text-[15px] leading-6 text-[#666666]"
                  style={{ fontFamily }}
                >
                  Hyperiux Vault Pro is now open, and your Founding Access
                  spot is ready. Accept your invite to create your account
                  and unlock the full vault.
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
