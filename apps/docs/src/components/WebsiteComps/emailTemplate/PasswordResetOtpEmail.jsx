import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";

export function PasswordResetOtpEmail({ otp, expiresInMinutes = 10 }) {
  return (
    <Html>
      <Head />
      <Preview>Your Hyperiux Vault password reset code: {otp}</Preview>

      <Body style={main}>
        <Container style={container}>
          <Section style={eyebrowSection}>
            <Text style={eyebrow}>Hyperiux Vault</Text>
          </Section>

          <Heading style={heading}>Password reset code</Heading>

          <Text style={intro}>
            Use the code below to reset your password. It expires in{" "}
            {expiresInMinutes} minutes.
          </Text>

          <Section style={otpBox}>
            <Text style={otpText}>{otp}</Text>
          </Section>

          <Text style={footer}>
            If you did not request a password reset, you can safely ignore this
            email. Your password will not change.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

const main = {
  margin: 0,
  padding: "32px",
  backgroundColor: "#050505",
  fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
};

const container = {
  maxWidth: "620px",
  margin: "0 auto",
  padding: "32px",
  borderRadius: "24px",
  backgroundColor: "#111111",
  border: "1px solid rgba(255,255,255,0.08)",
};

const eyebrowSection = {
  marginBottom: "18px",
};

const eyebrow = {
  margin: 0,
  color: "#ff5f00",
  fontSize: "13px",
  fontWeight: 600,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
};

const heading = {
  margin: "0 0 12px",
  color: "#ffffff",
  fontSize: "28px",
  lineHeight: "1.2",
  fontWeight: 600,
};

const intro = {
  margin: "0 0 28px",
  color: "rgba(255,255,255,0.62)",
  fontSize: "16px",
  lineHeight: "1.6",
};

const otpBox = {
  padding: "28px",
  borderRadius: "18px",
  backgroundColor: "#1b1b1b",
  border: "1px solid rgba(255,255,255,0.08)",
  textAlign: "center",
};

const otpText = {
  margin: 0,
  color: "#ff5f00",
  fontSize: "42px",
  fontWeight: 700,
  letterSpacing: "0.22em",
};

const footer = {
  margin: "28px 0 0",
  color: "rgba(255,255,255,0.42)",
  fontSize: "13px",
  lineHeight: "1.6",
};
