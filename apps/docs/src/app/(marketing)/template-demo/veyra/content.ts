// Built using Hyperiux Vault: https://vault.hyperiux.com

export type IconName =
  | "spark"
  | "agent"
  | "flow"
  | "book"
  | "team"
  | "layers"
  | "bolt"
  | "database"
  | "shield"
  | "plug"
  | "chart"
  | "doc"
  | "mail"
  | "chat"
  | "calendar"
  | "check"
  | "search"
  | "home"
  | "settings"
  | "grid";

export type AppName = "notion" | "slack" | "drive" | "github" | "linear" | "figma";

export const brand = {
  name: "Veyra",
  tagline: "Intelligence for the way you work.",
  support: "One intelligent platform. Infinite possibilities.",
  homeHref: "/template-demo/veyra",
};

export const nav = {
  links: [
    { label: "Product", href: "#platform", id: "platform" },
    { label: "Solutions", href: "#teams", id: "teams" },
    { label: "Resources", href: "#how-it-works", id: "how-it-works" },
    { label: "Pricing", href: "#pricing", id: "pricing" },
  ],
  login: { label: "Log in", href: "#" },
  cta: { label: "Get started", href: "#pricing" },
};

export const intro = {
  message: "Initializing intelligence.",
};

export const hero = {
  lines: ["The AI platform", "for modern teams."],
  description: "Build, automate, and scale your work with intelligence that understands your business.",
  primary: { label: "Get started", href: "#pricing" },
  secondary: { label: "Watch demo", href: "#how-it-works" },
  scrollLabel: "Scroll to explore",
  command: {
    placeholder: "Ask Veyra",
    prompt: "Summarise this week's customer calls and share the top risks with #product",
    steps: [
      { label: "Research", done: "38 calls read" },
      { label: "Analyse", done: "5 risks found" },
      { label: "Share", done: "Posted to #product" },
    ],
  },
  badges: [
    { value: "2,481", label: "Automations today" },
    { value: "18", label: "Agents running" },
  ],
};

export const promise = {
  heading: ["Turn ideas into", "intelligent workflows."],
  nodes: ["Idea", "Context", "Workflow", "Outcome"],
  statements: [
    "Capture what your team already knows.",
    "Shape it into clear, repeatable steps.",
    "Let it run, learn, and improve on its own.",
  ],
};

export const connected = {
  heading: ["One intelligent layer.", "Everything connected."],
  description: "Documents, conversations, tickets and tools stop living in separate places. Veyra reads them as one system.",
  core: "Veyra intelligence layer",
  sources: [
    { title: "Q3 planning.pdf", meta: "Document", icon: "doc", x: 15, y: 18, dx: -9, dy: -12, rot: -9 },
    { title: "Customer inbox", meta: "142 threads", icon: "mail", x: 15, y: 50, dx: -12, dy: 6, rot: 7 },
    { title: "Sales pipeline", meta: "Data source", icon: "database", x: 15, y: 82, dx: -5, dy: 12, rot: -5 },
    { title: "Team chat", meta: "#launch", icon: "chat", x: 85, y: 18, dx: 10, dy: -10, rot: 8 },
    { title: "Roadmap", meta: "24 items", icon: "calendar", x: 85, y: 50, dx: 13, dy: -4, rot: -7 },
    { title: "Support tickets", meta: "38 open", icon: "search", x: 85, y: 82, dx: 6, dy: 13, rot: 6 },
  ] as { title: string; meta: string; icon: IconName; x: number; y: number; dx: number; dy: number; rot: number }[],
};

export const contextAction = {
  heading: ["One platform.", "From context to action."],
  stages: [
    {
      index: "01",
      title: "Understand",
      text: "Veyra reads your documents, data and conversations to build real context.",
    },
    {
      index: "02",
      title: "Plan",
      text: "It breaks the goal into steps, owners and the tools each step needs.",
    },
    {
      index: "03",
      title: "Execute",
      text: "Agents carry out the work and report back with a clear record of every action.",
    },
  ],
};

export const engine = {
  heading: ["Everything begins", "with intelligence."],
  description: "At the centre of Veyra is a reasoning engine that holds context, weighs options and explains its choices.",
  core: "Veyra Core",
  signals: ["Context", "Reasoning", "Memory", "Judgement"],
};

export const pillars = {
  heading: ["Built for", "real work."],
  description: "Four capabilities that work together, so your team spends less time coordinating and more time deciding.",
  items: [
    {
      index: "01",
      title: "AI Agents",
      text: "Plan and complete complex tasks.",
      icon: "agent",
      preview: { label: "Agent run", rows: ["Research competitors", "Draft summary", "Share with #strategy"] },
    },
    {
      index: "02",
      title: "Automation",
      text: "Transform repetitive processes into intelligent workflows.",
      icon: "flow",
      preview: { label: "Workflow", rows: ["New invoice received", "Match purchase order", "Send for approval"] },
    },
    {
      index: "03",
      title: "Knowledge",
      text: "Find, organise, and understand information.",
      icon: "book",
      preview: { label: "Search", rows: ["Pricing policy 2026", "Onboarding checklist", "Security overview"] },
    },
    {
      index: "04",
      title: "Collaboration",
      text: "Work alongside your team and AI.",
      icon: "team",
      preview: { label: "Shared thread", rows: ["Maya left a comment", "Agent updated the brief", "Leo approved"] },
    },
  ] as {
    index: string;
    title: string;
    text: string;
    icon: IconName;
    preview: { label: string; rows: string[] };
  }[],
};

export const architecture = {
  heading: ["A complete", "intelligence system."],
  description: "Four layers, each with one job, designed to work as a single architecture.",
  unified: "One unified architecture",
  layers: [
    { title: "Models", text: "The intelligence behind the platform.", icon: "spark" },
    { title: "Memory", text: "Context that persists.", icon: "database" },
    { title: "Agents", text: "Systems that take action.", icon: "agent" },
    { title: "Control", text: "Security and permissions.", icon: "shield" },
  ] as { title: string; text: string; icon: IconName }[],
};

export const integrations = {
  heading: ["Connect your tools.", "Bring your data together."],
  description: "Native connectors keep Veyra in sync with the tools your team already uses.",
  more: "100+ more",
  apps: [
    { name: "Notion", app: "notion", side: "left" },
    { name: "Slack", app: "slack", side: "left" },
    { name: "Google Drive", app: "drive", side: "left" },
    { name: "GitHub", app: "github", side: "right" },
    { name: "Linear", app: "linear", side: "right" },
    { name: "Figma", app: "figma", side: "right" },
  ] as { name: string; app: AppName; side: "left" | "right" }[],
};

export const howItWorks = {
  heading: ["Intelligence that understands,", "reasons, and acts."],
  steps: [
    {
      label: "Input",
      title: "Request received",
      body: "Can we move the product launch to Friday without slipping the campaign?",
    },
    {
      label: "Analyse",
      title: "Checking context",
      body: "Roadmap, campaign calendar and 3 dependent tasks reviewed.",
      chips: ["Roadmap", "Calendar", "Tasks"],
    },
    {
      label: "Decide",
      title: "Recommendation",
      body: "Move launch to Friday. Shift the email send by one day and notify 2 owners.",
    },
    {
      label: "Execute",
      title: "Actions taken",
      body: "",
      actions: ["Launch date updated", "Campaign rescheduled", "Owners notified"],
    },
  ],
  done: "Completed in 4.2 seconds",
};

export const automation = {
  heading: ["Automate the", "busy work."],
  description: "Hand off the repetitive steps. Veyra runs them in order, checks its own work and tells the right people when it is done.",
  before: { label: "Before", value: "45 min", text: "of manual reading, copying and messaging per document." },
  after: { label: "After", value: "Under 1 min", text: "from a new document to a team that is already informed." },
  runTitle: "Vendor contract intake",
  steps: [
    { title: "New document received", meta: "contract_acme_v3.pdf" },
    { title: "AI analyses document", meta: "18 pages read" },
    { title: "Relevant information extracted", meta: "Renewal date, terms, owner" },
    { title: "Summary generated", meta: "142 words" },
    { title: "Team notified", meta: "#legal, #finance" },
  ],
  summary: {
    title: "Summary ready",
    body: "Renewal on 14 March. Price increase capped at 4%. Legal review needed for clause 9.",
  },
};

export const outcome = {
  heading: ["From information to", "meaningful outcomes."],
  cards: [
    { title: "Weekly brief", meta: "Generated for Leadership", icon: "doc" },
    { title: "Decisions logged", meta: "12 this week", icon: "check" },
    { title: "Pipeline health", meta: "Updated 2 min ago", icon: "chart" },
  ] as { title: string; meta: string; icon: IconName }[],
};

export const platform = {
  heading: ["A complete toolkit", "for your AI operations."],
  description: "Everything you need to build, deploy, and scale intelligent workflows.",
  capabilities: [
    { index: "01", title: "Agents", text: "Delegate multi-step work." },
    { index: "02", title: "Workflows", text: "Automate any process." },
    { index: "03", title: "Knowledge", text: "One source of truth." },
    { index: "04", title: "Integrations", text: "Connected to your stack." },
  ],
};

export const features = {
  heading: ["Everything you need,", "nothing you don't."],
  items: [
    { title: "Build", text: "Create AI-powered workflows and applications.", icon: "bolt" },
    { title: "Automate", text: "Turn repetitive tasks into intelligent processes.", icon: "layers" },
    { title: "Integrate", text: "Connect your tools and data seamlessly.", icon: "plug" },
    { title: "Scale", text: "Grow with secure, reliable infrastructure.", icon: "chart" },
  ] as { title: string; text: string; icon: IconName }[],
};

export const dashboard = {
  heading: ["A product that", "fits your team."],
  description: "A calm, clear workspace where your agents, workflows and knowledge live side by side.",
  user: "Maya",
  date: "Wednesday, 4 November",
  nav: [
    { label: "Overview", icon: "home" },
    { label: "Workflows", icon: "flow" },
    { label: "AI Agents", icon: "agent" },
    { label: "Knowledge", icon: "book" },
    { label: "Analytics", icon: "chart" },
    { label: "Settings", icon: "settings" },
  ] as { label: string; icon: IconName }[],
  stats: [
    { label: "Automations run", value: 2481, delta: "+12%" },
    { label: "Hours saved", value: 312, delta: "+8%" },
    { label: "Active agents", value: 18, delta: "+3" },
    { label: "Tasks completed", value: 1204, delta: "+21%" },
  ],
  ranges: [
    { label: "7D", points: [32, 40, 36, 52, 48, 61, 70] },
    { label: "30D", points: [20, 28, 26, 34, 31, 42, 39, 47, 52, 49, 58, 64] },
    { label: "90D", points: [12, 18, 22, 21, 30, 34, 33, 41, 46, 52, 57, 66] },
  ],
  workflows: [
    { name: "Invoice approvals", runs: 412, status: "Running" },
    { name: "Weekly product brief", runs: 52, status: "Scheduled" },
    { name: "Support triage", runs: 1380, status: "Running" },
    { name: "Contract intake", runs: 96, status: "Paused" },
  ],
  tasks: [
    { label: "Review Q4 hiring plan", done: true },
    { label: "Approve campaign brief", done: false },
    { label: "Sync with design on onboarding", done: false },
  ],
  activity: [
    { who: "Research agent", what: "summarised 14 interviews", when: "2m" },
    { who: "Leo", what: "approved Invoice #4821", when: "18m" },
    { who: "Triage agent", what: "routed 23 tickets", when: "1h" },
  ],
};

export const teams = {
  heading: ["Designed for the way", "your team works."],
  items: [
    {
      label: "Product",
      title: "Turn research into roadmap decisions.",
      text: "Synthesise interviews, feedback and usage data into clear priorities your whole team can see.",
      points: ["Interview synthesis", "Feedback clustering", "Spec drafting"],
      demo: { title: "Synthesise 48 user interviews", steps: ["Interviews imported", "Themes clustered", "Top 5 insights drafted"] },
    },
    {
      label: "Engineering",
      title: "Less triage. More shipping.",
      text: "Route bugs, summarise incidents and keep tickets in sync with the code that fixes them.",
      points: ["Bug triage", "Incident summaries", "Release notes"],
      demo: { title: "Triage incoming bug reports", steps: ["23 reports grouped", "Duplicates merged", "Owners assigned"] },
    },
    {
      label: "Marketing",
      title: "Campaigns that stay on brief.",
      text: "Draft, review and schedule content with an assistant that knows your voice and your calendar.",
      points: ["On-brand drafts", "Campaign planning", "Performance recaps"],
      demo: { title: "Plan the November launch", steps: ["Brief analysed", "6 assets drafted", "Calendar scheduled"] },
    },
    {
      label: "Operations",
      title: "Processes that run themselves.",
      text: "Automate approvals, hand-offs and reporting across every tool your operations team touches.",
      points: ["Approvals", "Vendor intake", "Weekly reporting"],
      demo: { title: "Process vendor onboarding", steps: ["Documents verified", "Contract summarised", "Finance notified"] },
    },
    {
      label: "Support",
      title: "Faster answers, happier customers.",
      text: "Suggest replies from your knowledge base, tag tickets and escalate only what needs a human.",
      points: ["Suggested replies", "Smart tagging", "Escalation rules"],
      demo: { title: "Resolve the morning queue", steps: ["86 tickets tagged", "61 replies suggested", "4 escalated"] },
    },
    {
      label: "Finance",
      title: "Close the books with confidence.",
      text: "Match invoices, flag anomalies and prepare reports with a full audit trail behind every number.",
      points: ["Invoice matching", "Anomaly detection", "Month-end reports"],
      demo: { title: "Reconcile October invoices", steps: ["312 invoices matched", "3 anomalies flagged", "Report prepared"] },
    },
  ],
};

export const proof = {
  heading: ["Trusted by", "ambitious teams."],
  logos: ["Northwind", "Halcyon", "Kestrel", "Fieldstone", "Orbitly", "Lumen & Co"],
  logoNote: "Sample customer logos. Replace with your own.",
  metrics: [
    { value: 3.4, decimals: 1, suffix: "x", label: "Faster workflow execution" },
    { value: 62, decimals: 0, suffix: "%", label: "Less manual operations work" },
    { value: 41, decimals: 0, suffix: "%", label: "Higher team productivity" },
  ],
  metricNote: "Illustrative figures for this template. Replace them with your own verified results.",
};

export const testimonials = {
  heading: ["What teams say", "after the switch."],
  items: [
    {
      quote: "Veyra has changed how we work. It is fast, reliable, and it actually understands our business.",
      name: "Rohan Mehta",
      role: "Head of Product",
      company: "Northwind",
    },
    {
      quote: "We replaced four internal tools and a lot of copy and paste. Our ops team finally has time to think.",
      name: "Clara Jensen",
      role: "VP Operations",
      company: "Halcyon",
    },
    {
      quote: "The agents do the busy work and show their reasoning. That transparency is why our legal team said yes.",
      name: "Daniel Okafor",
      role: "General Counsel",
      company: "Kestrel",
    },
  ],
};

export const pricing = {
  heading: ["Simple, transparent", "pricing."],
  description: "Start free, upgrade when your team is ready. No hidden fees.",
  yearlyNote: "Save 20%",
  plans: [
    {
      name: "Starter",
      description: "For individuals",
      monthly: 0,
      yearly: 0,
      custom: false,
      cta: { label: "Start for free", href: "#" },
      featured: false,
      features: ["Core features", "Up to 3 workflows", "Community support"],
    },
    {
      name: "Pro",
      description: "For growing teams",
      monthly: 24,
      yearly: 19,
      custom: false,
      cta: { label: "Get started", href: "#" },
      featured: true,
      features: ["Everything in Starter", "Unlimited workflows", "AI agents and knowledge", "Team collaboration", "Priority support"],
    },
    {
      name: "Enterprise",
      description: "For large organisations",
      monthly: 0,
      yearly: 0,
      custom: true,
      cta: { label: "Talk to sales", href: "#" },
      featured: false,
      features: ["SSO and governance", "Custom integrations", "Dedicated support", "Audit logs"],
    },
  ],
  featuredLabel: "Most popular",
  perMonth: "/month",
  customLabel: "Custom",
};

export const cta = {
  heading: ["Build what's next", "with Veyra."],
  description: "Bring your intelligence, workflows, and ideas together in one powerful platform.",
  primary: { label: "Get started", href: "#pricing" },
  secondary: { label: "Talk to sales", href: "#" },
};

export const footer = {
  about: "The intelligent platform for modern teams.",
  columns: [
    { title: "Product", links: ["Platform", "Agents", "Workflows", "Integrations", "Pricing"] },
    { title: "Resources", links: ["Docs", "Guides", "Changelog", "Status"] },
    { title: "Company", links: ["About", "Careers", "Contact", "Privacy"] },
  ],
  socials: ["X", "LinkedIn", "GitHub", "YouTube"],
  copyright: "Veyra Inc. All rights reserved.",
};

export const chapters = [
  "Initialization",
  "The promise",
  "Connected",
  "Context to action",
  "The engine",
  "Four pillars",
  "Architecture",
  "Integrations",
  "How it works",
  "Automation",
  "Outcomes",
];

export const platformStream = {
  prefix: "Veyra",
  items: [
    "drafts the weekly brief",
    "routes every new ticket",
    "matches invoices to POs",
    "summarises contracts",
    "keeps roadmaps in sync",
    "answers from your docs",
    "notifies the right owner",
    "closes the loop",
  ],
};

export const platformPreviews: Record<string, { title: string; status: string; rows: string[] }> = {
  Agents: { title: "Research agent", status: "Running", rows: ["Reading 14 interviews", "Grouping themes", "Drafting summary"] },
  Workflows: { title: "Invoice approvals", status: "Live", rows: ["New invoice received", "Matched to PO-4821", "Sent to finance"] },
  Knowledge: { title: "Ask Veyra", status: "3 sources", rows: ["Pricing policy 2026", "Security overview", "Onboarding guide"] },
  Integrations: { title: "Connected tools", status: "6 active", rows: ["Slack, Notion, Drive", "GitHub, Linear", "Figma"] },
};

export const faq = {
  heading: ["Questions, answered."],
  description: "Everything teams usually ask before they switch. Still curious? Our team is one message away.",
  contact: { label: "Talk to sales", href: "#" },
  items: [
    {
      question: "How long does it take to get started?",
      answer:
        "Most teams connect their first tools and run a workflow in under an hour. Templates cover the common processes, so nothing starts from a blank page.",
    },
    {
      question: "Which tools does Veyra connect to?",
      answer:
        "Native connectors cover Slack, Notion, Google Drive, GitHub, Linear and Figma, with 100+ more through the integrations library and a public API for anything custom.",
    },
    {
      question: "Is our data used to train models?",
      answer: "No. Your workspace data stays yours. It is encrypted in transit and at rest, and it is never used to train shared models.",
    },
    {
      question: "Can we control what agents are allowed to do?",
      answer:
        "Yes. Permissions, approval steps and audit logs let you decide which actions an agent can take on its own and which need a human sign-off.",
    },
    {
      question: "Do you offer a free trial of Pro?",
      answer: "Every workspace starts on Starter for free. You can trial Pro for 14 days at any time, with no card required.",
    },
    {
      question: "What does Enterprise add?",
      answer: "SSO, advanced governance, custom integrations, a dedicated success manager and support SLAs tailored to your organisation.",
    },
  ],
};
