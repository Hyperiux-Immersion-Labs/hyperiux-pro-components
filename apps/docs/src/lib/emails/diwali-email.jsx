import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";

// Diwali campaign email for signed-up Vault users.
// All styles are inline (no <style> block / Tailwind classes) so the layout
// survives clients that strip <head> styles, and the hero is a single image
// (diya + logo + headline baked in) so it scales cleanly on mobile.
const baseUrl = "https://vault.hyperiux.com";
const assets = `${baseUrl}/emails/diwali`;

const fontFamily = "'Helvetica Neue', Helvetica, Arial, sans-serif";

const socialLinks = [
  { label: "X", href: "https://x.com/_hyperiux_", icon: `${assets}/icon-x.png` },
  { label: "LinkedIn", href: "https://www.linkedin.com/company/hyperiux/", icon: `${assets}/icon-linkedin.png` },
  { label: "GitHub", href: "https://github.com/Hyperiux-Immersion-Labs/hyperiux-components", icon: `${assets}/icon-github.png` },
  { label: "Instagram", href: "https://www.instagram.com/_hyperiux_/", icon: `${assets}/icon-instagram.png` },
];

export const diwaliSubject = "Let’s brighten your brand together this Diwali 🪔";

export function diwaliText({ unsubscribeUrl } = {}) {
  return `
Celebrating the Light of New Possibilities.

The best things often begin with a spark. An idea worth pursuing. A vision worth believing in. An ambition worth bringing to life.

This Diwali, we celebrate the light that inspires us to think bigger, create better, and turn possibilities into something meaningful. May this festive season bring you renewed inspiration, continued success, and countless reasons to celebrate.

Wishing you a bright and prosperous Diwali.

With warm wishes,
Team Hyperiux

Brighten your brand: ${baseUrl}

312, Tower A, Grandslam I-Thum, Sector 62, Noida, Uttar Pradesh
${unsubscribeUrl ? `\nUnsubscribe: ${unsubscribeUrl}\n` : ""}`;
}

const bodyText = {
  margin: 0,
  fontFamily,
  fontSize: "15px",
  lineHeight: "24px",
  fontWeight: 400,
  color: "#6b6b6b",
};

const darkText = { ...bodyText, fontWeight: 500, color: "#1c1c1c" };

export function DiwaliEmail({ unsubscribeUrl } = {}) {
  return (
    <Html lang="en">
      <Head>
        <meta name="color-scheme" content="light" />
      </Head>
      <Preview>Celebrating the light of new possibilities — warm Diwali wishes from Team Hyperiux.</Preview>
      <Body style={{ margin: 0, padding: 0, backgroundColor: "#ffffff", fontFamily }}>
        <Container style={{ width: "100%", maxWidth: "600px", margin: "0 auto", backgroundColor: "#f2f1ef" }}>
          {/* HERO */}
          <Section>
            <Link href={baseUrl} target="_blank">
              <Img
                src={`${assets}/diwali-hero.jpg`}
                width={600}
                alt="HYPERIUX — Let’s brighten your brand together this DIWALI"
                style={{ display: "block", width: "100%", maxWidth: "600px", height: "auto", border: 0 }}
              />
            </Link>
          </Section>

          {/* BODY */}
          <Section style={{ padding: "55px 48px 52px" }}>
            <Heading
              as="h1"
              style={{
                margin: "0 0 26px",
                fontFamily,
                fontSize: "32px",
                lineHeight: "37px",
                fontWeight: 500,
                color: "#1c1c1c",
              }}
            >
              Celebrating the Light of New Possibilities.
            </Heading>

            <Text style={{ ...bodyText, marginBottom: "18px" }}>
              The best things often begin with a spark. An idea worth pursuing. A vision worth
              believing in. An ambition worth bringing to life.
            </Text>

            <Text style={{ ...bodyText, marginBottom: "24px" }}>
              This Diwali, we celebrate the light that inspires us to think bigger, create better,
              and turn possibilities into something meaningful. May this festive season bring you
              renewed inspiration, continued success, and countless reasons to celebrate.
            </Text>

            <Text style={{ ...darkText, marginBottom: "28px" }}>
              Wishing you a bright and prosperous Diwali.{" "}
              <span
                style={{ display: "inline-block", fontSize: "15px", lineHeight: "15px", verticalAlign: "-2px" }}
              >
                🪔
              </span>
            </Text>

            <Text style={{ ...darkText, marginBottom: "36px" }}>
              With warm wishes,
              <br />
              Team Hyperiux
            </Text>

            <table role="presentation" cellPadding="0" cellSpacing="0" border="0">
              <tbody>
                <tr>
                  <td bgcolor="#1c1c1c" style={{ backgroundColor: "#1c1c1c" }}>
                    <a
                      href={baseUrl}
                      target="_blank"
                      style={{
                        display: "inline-block",
                        padding: "13px 28px",
                        fontFamily,
                        fontSize: "15px",
                        lineHeight: "18px",
                        fontWeight: 500,
                        color: "#ffffff",
                        textDecoration: "none",
                      }}
                    >
                      Brighten your brand{"  "}→
                    </a>
                  </td>
                </tr>
              </tbody>
            </table>
          </Section>

          {/* FOOTER */}
          <Section style={{ backgroundColor: "#1c1c1c", padding: "28px 24px 30px", textAlign: "center" }}>
            <table role="presentation" align="center" cellPadding="0" cellSpacing="0" border="0" style={{ margin: "14px auto 13px" }}>
              <tbody>
                <tr>
                  {socialLinks.map((social) => (
                    <td key={social.label} style={{ padding: "0 7px" }}>
                      <Link href={social.href} target="_blank">
                        <Img src={social.icon} alt={social.label} width={18} height={18} style={{ display: "block", border: 0 }} />
                      </Link>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>

            <Text style={{ margin: 0, fontFamily, fontSize: "11px", lineHeight: "16px", fontWeight: 400, color: "#ffffff" }}>
              312, Tower A, Grandslam I-Thum, Sector 62, Noida, Uttar Pradesh
            </Text>

            {unsubscribeUrl && (
              <Text style={{ margin: "10px 0 0", fontFamily, fontSize: "11px", lineHeight: "16px", fontWeight: 400, color: "#9a9a9a" }}>
                Don’t want these emails?{" "}
                <Link href={unsubscribeUrl} target="_blank" style={{ color: "#9a9a9a", textDecoration: "underline" }}>
                  Unsubscribe
                </Link>
              </Text>
            )}
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

export default DiwaliEmail;

export function renderDiwaliEmail({ unsubscribeUrl } = {}) {
  return <DiwaliEmail unsubscribeUrl={unsubscribeUrl} />;
}
