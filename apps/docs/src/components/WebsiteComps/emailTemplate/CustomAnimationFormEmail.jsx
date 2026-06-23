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

export function CustomAnimationFormEmail({ name, email, number, message }) {
  return (
    <Html>
      <Head />
      <Preview>New custom animation request from {name}</Preview>

      <Body style={main}>
        <Container style={container}>
          <Section style={eyebrowSection}>
            <Text style={eyebrow}>Hyperiux Vault</Text>
          </Section>

          <Heading style={heading}>New custom animation request</Heading>

          <Text style={intro}>
            Someone submitted the custom animation form from the website.
          </Text>

          <Section style={card}>
            <Text style={label}>Name</Text>
            <Text style={value}>{name}</Text>

            <Text style={label}>Email</Text>
            <Text style={value}>{email}</Text>

            <Text style={label}>Phone Number</Text>
            <Text style={value}>{number}</Text>

            <Text style={label}>Message</Text>
            <Text style={messageStyle}>{message}</Text>
          </Section>

          <Text style={footer}>
            Reply directly to this email to respond to {name}.
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

const value = {
  margin: "0 0 18px",
  color: "#ffffff",
  fontSize: "16px",
  lineHeight: "1.6",
};

const messageStyle = {
  margin: "0",
  color: "#ffffff",
  fontSize: "16px",
  lineHeight: "1.7",
  whiteSpace: "pre-wrap",
};

const footer = {
  margin: "24px 0 0",
  color: "rgba(255,255,255,0.42)",
  fontSize: "13px",
  lineHeight: "1.6",
};