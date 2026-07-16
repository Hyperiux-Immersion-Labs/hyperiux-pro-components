import {
  Body,
  Button,
  Column,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Row,
  Section,
  Tailwind,
  Text,
} from "@react-email/components";

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://vault.hyperiux.com";

const socialLinks = [
  { label: "X", href: "https://x.com/_hyperiux_", icon: "/assets/social-icons/twitter.svg" },
  { label: "LinkedIn", href: "https://www.linkedin.com/company/hyperiux/", icon: "/assets/social-icons/linkedIn.svg" },
  { label: "GitHub", href: "https://github.com/Hyperiux-Immersion-Labs/hyperiux-components", icon: "/icons/github.svg" },
  { label: "Instagram", href: "https://www.instagram.com/_hyperiux_/", icon: "/assets/social-icons/instagram.svg" },
];

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
        <Head />
        <Preview>Your Hyperiux Vault Pro spot is ready</Preview>
        <Body className="m-0 bg-[#f4f4f5] font-sans">
          <Container className="mx-auto my-8 w-full max-w-[560px]">
            <Section className="overflow-hidden rounded-[10px] bg-white text-center">
              <Section className="px-8 pt-6 pb-4 text-left">
                <Img src={`${baseUrl}/hyperiux.png`} alt="Hyperiux" width={120} height={15} />
              </Section>

              <Img
                src={`${baseUrl}/emails/invitation-email-img.jpeg`}
                alt=""
                width={560}
                height={315}
                className="block w-full"
              />

              <Section className="px-8 py-10">
                <Text className="m-0 mb-6 text-[13px] font-semibold tracking-[0.2em] text-[#ff5f00] uppercase">
                  Founding Access
                </Text>

                <Heading as="h1" className="m-0 mb-4 text-[28px] text-[#0a0a0a]">
                  You&apos;re in.
                </Heading>

                <Text className="m-0 mb-8 text-[15px] leading-6 text-[#525252]">
                  Hyperiux Vault Pro is now open, and your Founding Access
                  spot is ready. Accept your invite to create your account
                  and unlock the full vault.
                </Text>

                <Button
                  href={inviteUrl}
                  className="inline-block rounded-full bg-[#ff5f00] px-7 py-3 text-[15px] font-semibold text-white"
                >
                  Accept Invite
                </Button>
              </Section>
            </Section>

            <Row className="mt-8">
              <Column align="center">
                {socialLinks.map((social) => (
                  <Link
                    key={social.label}
                    href={social.href}
                    className="mx-1.5 inline-block h-8 w-8 rounded-full bg-[#0a0a0a] text-center align-middle leading-8"
                  >
                    <Img
                      src={`${baseUrl}${social.icon}`}
                      alt={social.label}
                      width={15}
                      className="inline-block align-middle"
                    />
                  </Link>
                ))}
              </Column>
            </Row>

            <Text className="mt-6 text-center text-[12px] text-[#a1a1aa]">
              You&apos;re receiving this because you joined the Hyperiux
              Vault waitlist.
            </Text>
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
