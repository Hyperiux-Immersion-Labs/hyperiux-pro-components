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

export function WorkWithHyperiuxConfirmationEmail({ name, message }) {
  return (
    <Html>
      <Head />
      <Preview>We received your enquiry, {name}.</Preview>

      <Body style={main}>
        <Container style={container}>
          <Section style={eyebrowSection}>
            <Text style={eyebrow}>Hyperiux</Text>
          </Section>

          <Heading style={heading}>We got your message.</Heading>

          <Text style={intro}>
            Hey {name}, thanks for reaching out. We have received your enquiry
            and will get back to you within 1–2 business days.
          </Text>

          <Section style={card}>
            <Text style={label}>Your message</Text>
            <Text style={messageStyle}>{message}</Text>
          </Section>

          <Text style={bodyText}>
            In the meantime, feel free to browse the Vault or follow us on
            social media for updates on new effects and releases.
          </Text>

          <Text style={footer}>
            - The Hyperiux Team · hello@hyperiux.com
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

const eyebrowSection = { marginBottom: "18px" };

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
  margin: "0 0 24px",
  color: "rgba(255,255,255,0.62)",
  fontSize: "16px",
  lineHeight: "1.6",
};

const card = {
  padding: "24px",
  borderRadius: "18px",
  backgroundColor: "#1b1b1b",
  border: "1px solid rgba(255,255,255,0.08)",
};

const label = {
  margin: "0 0 4px",
  color: "rgba(255,255,255,0.45)",
  fontSize: "13px",
  lineHeight: "1.5",
};

const messageStyle = {
  margin: 0,
  color: "#ffffff",
  fontSize: "16px",
  lineHeight: "1.7",
  whiteSpace: "pre-wrap",
};

const bodyText = {
  margin: "24px 0 0",
  color: "rgba(255,255,255,0.62)",
  fontSize: "15px",
  lineHeight: "1.6",
};

const footer = {
  margin: "16px 0 0",
  color: "rgba(255,255,255,0.35)",
  fontSize: "13px",
  lineHeight: "1.6",
};
