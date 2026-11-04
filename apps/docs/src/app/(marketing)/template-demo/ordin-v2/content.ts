// Built using Hyperiux Vault: https://vault.hyperiux.com
// Every word, link, number and colour on the page lives here. Edit this file to rebrand the template.

export type IconName =
  | "search"
  | "analyze"
  | "report"
  | "bolt"
  | "shield"
  | "check-circle"
  | "trend"
  | "user"
  | "pen"
  | "nodes"
  | "layers"
  | "database"
  | "cube"
  | "box"
  | "building"
  | "doc";

export type Link = { label: string; href: string };

// Colours. The page reads these as CSS variables, the globe and the shader read them directly.
export const theme = {
  mint: "#A8E6C1",
  mintHighlight: "#B6EDC7",
  accent: "#5B9871",
  light: "#EAF2EB",
  lightAlt: "#F3F7F3",
  forest: "#080D0A",
  surface: "#0D1510",
  raised: "#15231A",
  text: "#15231A",
  textMuted: "#506354",
  textOnDark: "#EAF2EB",
  textOnDarkMuted: "#A4B3A7",
  border: "#CFDFD1",
  borderDark: "#293A2E",
  // Aurora Ribbon shader behind the dark sections
  aurora: { background: "#080D0A", halo: "#1C4A31", glow: "#5B9871", core: "#B6EDC7" },
};

export const brand = {
  name: "Ordin",
  homeHref: "/template-demo/ordin-v2",
};

export const nav = {
  links: [
    { label: "Product", href: "#execution" },
    { label: "Solutions", href: "#specialists" },
    { label: "Docs", href: "#faq" },
    { label: "Pricing", href: "#pricing" },
  ] as Link[],
  cta: { label: "Get started", href: "#get-started" } as Link,
};

export const hero = {
  title: ["The operating layer", "for "],
  highlight: "autonomous work.",
  copy: ["Turn a single instruction into coordinated execution.", "Agents that work, with the rules to work responsibly."],
  primary: { label: "Explore the runtime", href: "#architecture" } as Link,
  secondary: { label: "See how it works", href: "#execution" } as Link,
};

export const execution = {
  title: ["Every job starts", "as a sentence.", "Not a workflow."],
  copy: "Describe what you need in plain language. Ordin interprets, plans and executes the work end to end.",
  instruction: "Find the latest customer feedback and prepare a summary.",
  tasks: [
    { icon: "search", title: "Research", detail: "Gather relevant information.", status: "done" },
    { icon: "analyze", title: "Analyze", detail: "Extract insights and patterns.", status: "running" },
    { icon: "report", title: "Report", detail: "Create a clear summary.", status: "queued" },
  ] as { icon: IconName; title: string; detail: string; status: "done" | "running" | "queued" }[],
};

export const specialists = {
  title: "One prompt. Six specialists.",
  copy: "A coordinated workforce, each with a clear role.",
  // The first three sit left of the globe, the last three right
  items: [
    { icon: "search", title: "Research", detail: "Find and gather information." },
    { icon: "analyze", title: "Analysis", detail: "Extract insights and patterns." },
    { icon: "bolt", title: "Execution", detail: "Turn plans into action." },
    { icon: "shield", title: "Governance", detail: "Ensure rules and compliance." },
    { icon: "doc", title: "Reporting", detail: "Deliver the final output." },
    { icon: "check-circle", title: "Validation", detail: "Review and verify results." },
  ] as { icon: IconName; title: string; detail: string }[],
};

export const governance = {
  title: ["Agents improve.", "Policies don't."],
  copy: "A system that learns and adapts, while your rules stay consistent and enforceable.",
  rows: [
    { icon: "trend", title: "Adaptive intelligence", detail: "Agents get better with context and feedback." },
    { icon: "shield", title: "Fixed boundaries", detail: "Your policies, permissions and constraints stay in control." },
    { icon: "user", title: "Human control", detail: "Keep oversight with approvals and review where it matters." },
  ] as { icon: IconName; title: string; detail: string }[],
};

export const architecture = {
  title: ["Six layers.", "One runtime."],
  copy: "A modular foundation that turns intent into reliable execution.",
  layers: [
    { icon: "pen", title: "Interface", detail: "Natural language in." },
    { icon: "nodes", title: "Orchestration", detail: "Breaks work into tasks." },
    { icon: "layers", title: "Agents", detail: "Specialized execution." },
    { icon: "shield", title: "Governance", detail: "Rules and approvals." },
    { icon: "database", title: "Memory", detail: "Context for better future runs." },
    { icon: "cube", title: "Runtime", detail: "Reliable execution at scale." },
  ] as { icon: IconName; title: string; detail: string }[],
};

export const manifesto = {
  title: ["Autonomy without oversight", "is "],
  highlight: "a liability.",
  lines: [
    "Every execution deserves boundaries.",
    "Every decision deserves context.",
    "Every outcome deserves accountability.",
  ],
};

export const proof = {
  title: ["Built for the work agents actually create.", "Measured, not promised."],
  // Demonstration values. Replace them with your own verified numbers before launch.
  sampleNote: "Sample values. Replace with your own data.",
  metrics: [
    { icon: "layers", value: 2.4, decimals: 1, suffix: "B", label: "Tasks executed" },
    { icon: "bolt", value: 142, decimals: 0, suffix: "ms", label: "Average agent latency" },
    { icon: "shield", value: 99.9, decimals: 1, suffix: "%", label: "Execution success" },
    { icon: "trend", value: 38, decimals: 0, suffix: "%", label: "Time saved" },
  ] as { icon: IconName; value: number; decimals: number; suffix: string; label: string }[],
  report: {
    title: "Execution report",
    total: "Completed in 3.2s",
    rows: [
      { icon: "search", agent: "Research agent", summary: "Gathered and curated relevant sources.", time: "0.8s" },
      { icon: "analyze", agent: "Analysis agent", summary: "Extracted key insights and patterns.", time: "1.4s" },
      { icon: "report", agent: "Report agent", summary: "Generated a concise summary.", time: "1.0s" },
    ] as { icon: IconName; agent: string; summary: string; time: string }[],
    result: { title: "Task completed", detail: "Summary report ready.", cta: { label: "View output", href: "#" } as Link },
  },
};

export const pricing = {
  title: ["Priced per run.", "Not per prompt."],
  billing: { monthly: "Monthly", yearly: "Yearly", yearlyNote: "Save 20%" },
  plans: [
    {
      icon: "box",
      name: "Exploration",
      tagline: "For getting started.",
      price: { monthly: 19, yearly: 15 },
      features: ["Up to 5,000 runs / month", "Core agent workforce", "Standard execution policies", "Community support"],
      cta: { label: "Get started", href: "#get-started" },
    },
    {
      icon: "layers",
      name: "Production",
      tagline: "For growing teams.",
      price: { monthly: 79, yearly: 63 },
      featured: true,
      badge: "Most popular",
      features: ["Up to 100,000 runs / month", "Full agent suite", "Custom policies and approvals", "Priority support"],
      cta: { label: "Get started", href: "#get-started" },
    },
    {
      icon: "building",
      name: "Custom",
      tagline: "For scale and enterprise.",
      price: null,
      priceLabel: "Contact us",
      features: ["Custom run volume", "Dedicated runtime", "Advanced governance", "SLA and enterprise support"],
      cta: { label: "Talk to sales", href: "#contact" },
    },
  ] as {
    icon: IconName;
    name: string;
    tagline: string;
    price: { monthly: number; yearly: number } | null;
    priceLabel?: string;
    featured?: boolean;
    badge?: string;
    features: string[];
    cta: Link;
  }[],
  currency: "$",
  period: "/month",
};

export const social = {
  title: "Trusted by teams building with agents.",
  // Placeholder logos: swap `name` for your customers, or render your own SVGs in Social.tsx
  logos: ["Logo", "Logo", "Logo", "Logo"],
  testimonial: {
    placeholder: true,
    quote: "Ordin gives us a structured way to run complex work with agents, without losing control.",
    name: "Alex Morgan",
    role: "Head of AI Operations",
    company: "Example Co.",
  },
};

export const faq = {
  title: "Questions, answered.",
  copy: "Everything you need to know before getting started.",
  items: [
    {
      q: "How does Ordin coordinate multiple agents?",
      a: "Ordin breaks an instruction into tasks, assigns each one to the right specialist and passes context between them through shared memory, so every agent works from the same plan.",
    },
    {
      q: "Can agents work independently?",
      a: "Yes. Each agent can run on its own within the permissions you give it. Orchestration only steps in when a task depends on another agent's output.",
    },
    {
      q: "How are execution policies enforced?",
      a: "Policies are checked on every action before it runs. An action that breaks a rule is blocked, logged and, if you choose, sent for review.",
    },
    {
      q: "Can I connect my own models and tools?",
      a: "Bring any model with an API and connect your own tools. You choose which agent uses which model and which tools it may call.",
    },
    {
      q: "How is usage calculated?",
      a: "You pay per completed run, not per prompt or token. A run is one instruction carried through to a finished result, however many agents it takes.",
    },
    {
      q: "Does every action require approval?",
      a: "No. You decide which actions need a person to sign off. Everything else runs automatically within your policies.",
    },
  ],
};

export const cta = {
  title: ["Hand it the job.", "Keep the rules."],
  copy: "Give your autonomous workforce its next instruction.",
  primary: { label: "Get started", href: "#get-started" } as Link,
  secondary: { label: "Explore the docs", href: "#faq" } as Link,
};

export const footer = {
  groups: [
    {
      title: "Product",
      links: [
        { label: "Overview", href: "#top" },
        { label: "Agents", href: "#specialists" },
        { label: "Runtime", href: "#architecture" },
        { label: "Governance", href: "#governance" },
        { label: "Pricing", href: "#pricing" },
      ],
    },
    {
      title: "Resources",
      links: [
        { label: "Docs", href: "#" },
        { label: "Guides", href: "#" },
        { label: "API reference", href: "#" },
        { label: "Examples", href: "#" },
        { label: "Changelog", href: "#" },
      ],
    },
    {
      title: "Company",
      links: [
        { label: "About", href: "#" },
        { label: "Blog", href: "#" },
        { label: "Careers", href: "#" },
        { label: "Contact", href: "#" },
      ],
    },
  ] as { title: string; links: Link[] }[],
  social: {
    title: "Follow",
    links: [
      { label: "X", href: "https://x.com", icon: "x" },
      { label: "LinkedIn", href: "https://linkedin.com", icon: "linkedin" },
      { label: "GitHub", href: "https://github.com", icon: "github" },
      { label: "YouTube", href: "https://youtube.com", icon: "youtube" },
    ] as (Link & { icon: "x" | "linkedin" | "github" | "youtube" })[],
  },
  copyright: `© ${new Date().getFullYear()} Ordin. All rights reserved.`,
  legal: [
    { label: "Terms", href: "#" },
    { label: "Privacy", href: "#" },
    { label: "Cookies", href: "#" },
  ] as Link[],
};
