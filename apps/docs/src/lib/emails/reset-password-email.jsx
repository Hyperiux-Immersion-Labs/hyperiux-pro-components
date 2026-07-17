import {
  Body,
  Container,
  Font,
  Head,
  Heading,
  Html,
  Img,
  Preview,
  Section,
  Tailwind,
  Text,
} from "@react-email/components";

// NOTE: baseUrl and every asset path below (logo) are placeholders - swap
// them once the final design assets are ready.
const baseUrl = "https://vault.hyperiux.com";

const fontFamily = "Aeonik, Arial, sans-serif";

export const resetPasswordSubject = "Your Hyperiux Vault reset code";

export function resetPasswordText({ otpCode, requestedFrom, requestedAt }) {
  return `
Reset your password.

Enter the following code when prompted: ${otpCode}

To protect your account, do not share this code with anyone.

Didn't request this? This code was requested from ${requestedFrom || "an unknown location"} at ${requestedAt || "an unknown time"}. If you didn't make this request, you can safely ignore this email.

Hyperiux Vault
`;
}

export function ResetPasswordEmail({ otpCode, requestedFrom, requestedAt }) {
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
        <Preview>{otpCode} is your Hyperiux Vault reset code</Preview>
        <Body className="m-0 bg-[#f4f4f5]" style={{ fontFamily }}>
          <Container className="mx-auto w-full max-w-[480px] px-4 py-8">
            <Section className="mb-6">
              <Img src={`${baseUrl}/emails/hyperiux-email-logo.png`} alt="Hyperiux" width={120} height={15} />
            </Section>

            <Section className="rounded-[14px] bg-white px-8 py-10 text-center">
              <Text
                className="m-0 mb-2 text-[13px] font-semibold tracking-[0.08em] text-[#8a8a8a] uppercase"
                style={{ fontFamily }}
              >
                Password Reset
              </Text>

              <Heading
                as="h1"
                style={{ fontFamily, fontWeight: 400 }}
                className="m-0 mb-4 text-[28px] leading-[1.15] text-[#0a0a0a]"
              >
                Reset your password
              </Heading>

              <Text className="m-0 mb-7 text-[15px] leading-6 text-[#1D1D1D]" style={{ fontFamily }}>
                Enter the following code when prompted:
              </Text>

              <Section className="mx-auto mb-7 inline-block rounded-[10px] border border-[#ffd7bd] bg-[#fff4ed] px-8 py-4">
                <Text
                  className="m-0 text-[32px] font-semibold tracking-[0.15em] text-[#E61915]"
                  style={{ fontFamily }}
                >
                  {otpCode}
                </Text>
              </Section>

              <Text className="m-0 text-[13px] leading-5 text-[#8a8a8a]" style={{ fontFamily }}>
                To protect your account, do not share this code with anyone.
              </Text>
            </Section>

            <Section className="px-2 pt-6">
              <Text className="m-0 mb-1 text-[12px] font-semibold text-[#0a0a0a]" style={{ fontFamily }}>
                Didn&apos;t request this?
              </Text>
              <Text className="m-0 text-[12px] leading-5 text-[#a1a1aa]" style={{ fontFamily }}>
                This code was requested from {requestedFrom || "an unknown location"} at{" "}
                {requestedAt || "an unknown time"}. If you didn&apos;t make this request, you
                can safely ignore this email.
              </Text>
            </Section>
          </Container>
        </Body>
      </Html>
    </Tailwind>
  );
}

export default ResetPasswordEmail;

export function renderResetPasswordEmail({ otpCode, requestedFrom, requestedAt }) {
  return <ResetPasswordEmail otpCode={otpCode} requestedFrom={requestedFrom} requestedAt={requestedAt} />;
}
