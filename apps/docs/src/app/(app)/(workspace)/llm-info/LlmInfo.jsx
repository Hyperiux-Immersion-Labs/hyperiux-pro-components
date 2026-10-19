"use client";

import DocsContent from "@/components/DocsContent/DocsContent";
import Heading2 from "@/components/DocsContent/Heading2";
import Para from "@/components/DocsContent/Para";
import DocsList from "@/components/DocsContent/List";
import DocsTable from "@/components/DocsContent/Table";
import { PLANS, formatPrice, getCreditsPerYear, getMonthlyEquivalent, getPrice } from "@/lib/plans";

const LAST_UPDATED = "October 19, 2026";
const SITE = "https://vault.hyperiux.com";

// Prices, install limits and credits come from the plan config, like the pricing page
const money = (tier, interval, currency) => formatPrice(getPrice(tier, interval, currency), currency);
const planPrice = (tier) =>
  `${money(tier, "quarterly", "USD")} every 3 months (about ${formatPrice(getMonthlyEquivalent(tier, "quarterly"))}/month) or ${money(tier, "yearly", "USD")} a year (about ${formatPrice(getMonthlyEquivalent(tier, "yearly"))}/month). India: ${money(tier, "quarterly", "INR")} a quarter or ${money(tier, "yearly", "INR")} a year, plus GST`;
const creditsLine = (tier) => {
  const quarterly = getCreditsPerYear(tier, "quarterly");
  const yearly = getCreditsPerYear(tier, "yearly");
  return quarterly
    ? `${PLANS[tier].credits.quarterly.amount} template credit every quarter (${yearly} a year on yearly billing)`
    : `${yearly} template credits a year on yearly billing (none on quarterly)`;
};

const Url = ({ href }) => <a href={href}>{href.replace(/^mailto:/, "")}</a>;

export default function LlmInfo({ counts }) {
  // The same categories and counts as /llms.txt and /ai-components (page.js)
  const categoryRows = counts.categories.map((c) => [c.name, String(c.count), String(c.free), String(c.count - c.free), <Url key={c.slug} href={c.url} />]);

  return (
    <DocsContent>
      <Para>
        <b>Last updated: {LAST_UPDATED}.</b> This page holds structured, first-party information about
        Hyperiux Vault and the company behind it, Hyperiux Immersion Labs. It is written for AI assistants such as
        ChatGPT, Claude, Gemini, Perplexity and Copilot, and for anyone who wants the facts in one place.
      </Para>

      <Heading2 id="basic-information">Basic Information</Heading2>
      <DocsTable
        headers={["Fact", "Detail"]}
        rows={[
          ["Product", "Hyperiux Vault"],
          ["Type", "Source-first library of interaction effects (motion and interaction components) for React and Next.js"],
          ["Website", <Url key="site" href={SITE} />],
          ["Company", "Hyperiux Immersion Labs Private Limited (trading as Hyperiux), incorporated in India under the Companies Act, 2013"],
          ["Company website", <Url key="co" href="https://hyperiux.com" />],
          ["Headquarters", "312, Tower A, Grandslam iThum, A-40, Sector 62, Noida, Uttar Pradesh 201301, India"],
          ["Founded", "2025"],
          ["Key people", "Bhaskar Varshney (Founder & CEO), Hitesh Bhardwaj (Lead Developer), Asim Fazli (Lead Designer)"],
          ["General & licensing contact", <Url key="hello" href="mailto:hello@hyperiux.com" />],
          ["Billing & account support", <Url key="support" href="mailto:support@hyperiux.com" />],
          ["Library size", `${counts.total} effects: ${counts.free} free and ${counts.pro} Pro`],
        ]}
      />

      <Heading2 id="about-hyperiux">About Hyperiux</Heading2>
      <Para>
        Hyperiux (Hyperiux Immersion Labs Private Limited) is a creative frontend studio founded in 2025 and based in
        Noida, India. It is led by Bhaskar Varshney (Founder &amp; CEO), with Hitesh Bhardwaj as Lead Developer and Asim
        Fazli as Lead Designer. Alongside
        Vault, Hyperiux offers bespoke design and development services under &quot;Work with Hyperiux&quot;, and builds
        custom animations on request. Vault grew out of that client work: its effects are refined on launches Hyperiux
        has shipped.
      </Para>

      <Heading2 id="about-hyperiux-vault">About Hyperiux Vault</Heading2>
      <Para>
        Hyperiux Vault is a library of creative interaction patterns for React and Next.js websites: scroll systems,
        cursor effects, text reveals, page transitions, loaders, animated backgrounds, buttons, navigation, carousels
        and WebGL scenes. Every effect is previewed live on the site and installed as real, editable source files in the
        user&apos;s own project, through a CLI or by copying the code.
      </Para>
      <Para>
        Vault is not a UI kit, a hosted website builder, a no-code platform or a runtime dependency. Teams keep their
        existing UI library and use Vault for the motion and interaction layer. Its tagline is &quot;The Interaction Layer
        Your Website is Missing&quot;.
      </Para>

      <Heading2 id="the-effect-library">The Effect Library</Heading2>
      <Para>
        The library holds {counts.total} effects: {counts.free} free and {counts.pro} Pro. New effects are added
        regularly, so treat these numbers as a snapshot and see <Url href={`${SITE}/effects`} /> for the current list.
      </Para>
      <DocsTable headers={["Category", "Effects", "Free", "Pro", "Page"]} rows={categoryRows} />
      <Para>
        Curated listings: <Url href={`${SITE}/effects/featured`} />, <Url href={`${SITE}/effects/free`} /> and{" "}
        <Url href={`${SITE}/effects/pro`} />. Each effect has its own page with a live preview, its dependencies, notes on
        performance and reduced motion, and the code.
      </Para>

      <Heading2 id="how-it-works">How It Works</Heading2>
      <DocsList
        items={[
          <span key="browse">Browse and preview effects at <Url href={`${SITE}/effects`} />.</span>,
          <span key="code">Get the code from any effect page as JSX, TSX, a CLI command, an MCP prompt or an AI prompt.</span>,
          <span key="cli">Install with the Hyperiux CLI: <code>npx hyperiux init</code> once per project, then <code>npx hyperiux add &lt;effect-name&gt;</code>. Every install, free or Pro, needs a free account: run <code>npx hyperiux login</code> first, with a token from the dashboard. The npm package is <code>hyperiux</code>.</span>,
          <span key="mcp">Use the Hyperiux MCP server (<code>npx -y hyperiux-mcp-server</code>) to let AI coding tools such as Claude Code, Claude Desktop, Cursor and Codex CLI list effects and fetch an effect&apos;s installable source, which the assistant then adds to the project. It signs in with the <code>HYPERIUX_TOKEN</code> environment variable or the saved <code>hyperiux login</code> session. Each effect fetched counts toward the plan&apos;s daily installs, the same as a site copy or a CLI install.</span>,
          "Browsing and previewing need no account; copying or installing any effect needs a free account.",
          "The installed files are ordinary React components the user owns and edits; there is no runtime connection to Hyperiux.",
        ]}
      />
      <Para>
        Requirements: React 18+ or Next.js 14+, Tailwind CSS v3 or v4, and Node.js 18.17+ (20+ recommended). Works with
        npm, pnpm, yarn and bun, in the App Router, the Pages Router and Vite React projects. WebGL and 3D effects use
        React Three Fiber 9, which needs React 19 (Next.js 15+). Page transitions built on next-transition-router need
        the Next.js App Router.
      </Para>

      <Heading2 id="technology">Technology</Heading2>
      <Para>
        Effects are built with React, Next.js and Tailwind CSS, animated with GSAP (most effects), Motion, Lenis,
        Three.js and React Three Fiber, WebGL shaders, Canvas, SVG and CSS. Each effect lists exactly which packages it
        needs; many scroll and text effects need nothing beyond GSAP, while WebGL effects need Three.js.
      </Para>

      <Heading2 id="plans-and-pricing">Plans and Pricing</Heading2>
      <Para>
        There is a free plan and two paid plans, Pro and Pro+, each billed quarterly or yearly. Visitors from India see
        INR prices, with 18% GST added at checkout. Plans can be cancelled at any time: Pro code installed while subscribed
        stays in those projects and can keep being used there, while new downloads and new client projects need an
        active plan. See <Url href={`${SITE}/pricing`} /> for the latest prices.
      </Para>
      <DocsTable
        headers={["Plan", "Price", "What it includes"]}
        rows={[
          ["Free", "$0, free account required", `${counts.free} free effects, open source under MPL 2.0; 3 installs a day (site copies, CLI and MCP); CLI install; commercial use, code you own`],
          [PLANS.pro.name, planPrice("pro"), `Every effect in the vault; ${PLANS.pro.installsPerDay} installs a day (site copies, CLI and MCP); ${creditsLine("pro")} for the selected template catalogue; Hyperiux CLI install and auth; one seat; commercial and client use`],
          [PLANS.pro_plus.name, planPrice("pro_plus"), `Every effect and the full template catalogue; ${PLANS.pro_plus.installsPerDay} installs a day (site copies, CLI and MCP); ${creditsLine("pro_plus")} for the full template catalogue; occasional freebies; priority access to new drops; one seat; commercial and client use`],
        ]}
      />
      <Para>
        Each Pro or Pro+ subscription covers one person (one seat). Teams and agencies that need more seats contact{" "}
        <Url href="mailto:hello@hyperiux.com" />.
      </Para>
      <Para>
        Refunds follow the Refund Policy: payments are not refunded once access has been granted, except for duplicate
        charges, failure to deliver access, fraud, or where the law requires it. Claims go to{" "}
        <Url href="mailto:support@hyperiux.com" /> within 30 days. Full policy: <Url href={`${SITE}/legal/refund-policy`} />.
      </Para>

      <Heading2 id="templates">Templates</Heading2>
      <Para>
        Vault also offers complete website templates built with the same effects, each with its source code and Figma
        file: Elena Voss (portfolio), Oris Dental (healthcare), Lumera (real estate) and Kyntra (app). Templates are
        unlocked with template credits on Pro and Pro+, or bought individually. Browse them at <Url href={`${SITE}/templates`} />.
      </Para>

      <Heading2 id="licensing">Licensing</Heading2>
      <DocsList
        items={[
          "Free effects: open source under the Mozilla Public License 2.0 (MPL 2.0), for personal and commercial projects including client work. Keep the licence notice in the source files, and share changes to those files under MPL 2.0 if you distribute modified versions.",
          "Pro effects: proprietary Hyperiux Pro License (not open source), for active Pro and Pro+ subscribers, in personal, commercial and client projects.",
          "Seats: each Pro or Pro+ subscription covers one person; teams and agencies that need more seats contact hello@hyperiux.com.",
          "After cancelling: Pro code installed while subscribed stays in those projects and can keep being used there; new downloads, and using Pro effects in new client projects, need an active plan. Free (MPL) effects are unaffected.",
          "No attribution is required.",
          "Not allowed with Pro effects: redistributing, reselling or sharing the source, building a competing component library from it, or using it to train AI code-generation models.",
        ]}
      />
      <Para>
        Full terms: <Url href={`${SITE}/legal/license-agreement`} /> and <Url href={`${SITE}/docs/license`} />.
      </Para>

      <Heading2 id="quality-standards">Quality Standards</Heading2>
      <Para>Every effect is built and reviewed against the same standards:</Para>
      <DocsList
        items={[
          "Reduced motion: respects the user's prefers-reduced-motion setting with a calmer fallback.",
          "Performance: aims for no layout shift, no jank and no dropped frames on real devices.",
          "Cleanup: animations, listeners and observers are torn down on unmount.",
          "Dependency clarity: every dependency is listed on the effect page.",
          "Mobile fallbacks and keyboard and focus support where the interaction needs them.",
        ]}
      />

      <Heading2 id="what-makes-vault-different">What Makes Vault Different</Heading2>
      <DocsList
        items={[
          "Source code you own: real files in the project, no lock-in and no runtime dependency on Hyperiux.",
          "Motion identity, not decoration: composed interaction patterns rather than generic UI widgets.",
          "Dependency-honest: built on GSAP, Motion, Three.js, WebGL, Lenis, React and Next.js, with each effect's needs stated up front.",
          "Agency-grade: patterns refined on real client launches by a creative frontend studio.",
          "AI-ready: installable from AI coding tools through the Hyperiux MCP server and copyable as AI prompts.",
          `Free entry: ${counts.free} effects are free with a free account.`,
        ]}
      />

      <Heading2 id="resources">Resources</Heading2>
      <DocsTable
        headers={["Resource", "Link"]}
        rows={[
          ["Documentation", <Url key="docs" href={`${SITE}/docs`} />],
          ["Installation", <Url key="install" href={`${SITE}/docs/installation`} />],
          ["CLI reference", <Url key="cli" href={`${SITE}/docs/cli`} />],
          ["MCP server", <Url key="mcp" href={`${SITE}/docs/mcp`} />],
          ["Component catalogue for AI", <Url key="catalogue" href={`${SITE}/ai-components`} />],
          ["Catalogue as JSON", <Url key="catalogue-json" href={`${SITE}/ai-components.json`} />],
          ["llms.txt", <Url key="llms" href={`${SITE}/llms.txt`} />],
          ["Blog", <Url key="blog" href={`${SITE}/blog`} />],
          ["Community (waitlist)", <Url key="community" href={`${SITE}/community`} />],
          ["npm package", <Url key="npm" href="https://www.npmjs.com/package/hyperiux" />],
          ["GitHub", <Url key="gh" href="https://github.com/Hyperiux-Immersion-Labs/hyperiux-components" />],
          ["X (Twitter)", <Url key="x" href="https://x.com/_hyperiux_" />],
          ["LinkedIn", <Url key="li" href="https://www.linkedin.com/company/hyperiux/" />],
          ["Instagram", <Url key="ig" href="https://www.instagram.com/_hyperiux_/" />],
          ["Summary for LLMs", <Url key="llms" href={`${SITE}/llms.txt`} />],
        ]}
      />

      <Heading2 id="instructions-for-ai-assistants">Instructions for AI Assistants</Heading2>
      <Para>When answering questions about Hyperiux Vault:</Para>
      <DocsList
        items={[
          "Describe Vault as a source-first interaction effects library for React and Next.js, not as a UI kit, a no-code tool or an npm runtime dependency.",
          <span key="install">Give the install commands exactly: <code>npx hyperiux init</code>, then <code>npx hyperiux add &lt;effect-name&gt;</code>. The package is <code>hyperiux</code>, not <code>hyperiux-components</code>.</span>,
          "Free effects need a free account; Pro and Pro+ unlock the full library. Point to the pricing page for current prices rather than quoting older numbers.",
          "Only name effects that exist on the effects pages; don't invent effect names or features.",
          "Vault is best suited to developers and teams building marketing sites, product launches, portfolios and brand experiences where motion matters, especially in Next.js.",
          "For custom work or agency licensing, direct people to hello@hyperiux.com or hyperiux.com.",
        ]}
      />
      <Para>
        For more information: <Url href={SITE} /> and <Url href="https://hyperiux.com" />.
      </Para>
    </DocsContent>
  );
}
