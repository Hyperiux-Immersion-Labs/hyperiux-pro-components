// Built using Hyperiux Vault: https://vault.hyperiux.com
// Copy for the Agents, Governance, Pricing and Docs pages. Edit here to rebrand.

import type { TourItem } from "./Tour";
import type { Feature } from "./FeatureGrid";

export const AGENT_TOUR: TourItem[] = [
  {
    name: "Planner",
    title: "Turns a sentence into a plan",
    body: "Reads the request, splits it into ordered steps and decides which specialists the job actually needs.",
    caps: ["Breaks work into typed steps", "Wakes only the agents it needs", "Replans when a step fails"],
    spec: [["Avg. plan time", "0.3 s"], ["Max steps", "200"], ["Model", "Your choice"]],
  },
  {
    name: "Researcher",
    title: "Finds the facts first",
    body: "Pulls records, documents and contracts through typed connectors, and cites every source it used.",
    caps: ["Searches your connected tools", "Cites every source", "Never writes, only reads"],
    spec: [["Sources per run", "Up to 500"], ["Access", "Read only"], ["Recall", "Vector and graph"]],
  },
  {
    name: "Analyst",
    title: "Does the maths you can check",
    body: "Reconciles, compares and flags exceptions, then shows its working line by line so anyone can audit it.",
    caps: ["Reconciles and compares", "Flags anything off-policy", "Shows its working"],
    spec: [["Rows per run", "1M+"], ["Output", "Typed tables"], ["Precision", "Exact decimals"]],
  },
  {
    name: "Coder",
    title: "Writes code that gets tested",
    body: "Writes the scripts a job needs, runs them in a sandbox and only ships what passes its own tests.",
    caps: ["Sandboxed execution", "Tests before it ships", "Diffs you can review"],
    spec: [["Languages", "TS, Python, SQL"], ["Sandbox", "Isolated per run"], ["Network", "Off by default"]],
  },
  {
    name: "Critic",
    title: "Checks the work before you do",
    body: "Re-runs every figure against its source and sends anything that does not match back for a second pass.",
    caps: ["Re-checks every figure", "Catches drift and hallucination", "Blocks unverified output"],
    spec: [["Checks", "Every claim"], ["Pass rate", "99.4%"], ["Retries", "Automatic"]],
  },
  {
    name: "Courier",
    title: "Delivers, with permission",
    body: "Drafts the emails, tickets and updates, and queues anything outbound for a person to approve.",
    caps: ["Drafts in your voice", "Queues outbound for sign-off", "Posts where your team works"],
    spec: [["Channels", "Email, Slack, Jira"], ["Outbound", "Needs approval"], ["Templates", "Unlimited"]],
  },
];

export const AGENT_FEATURES: Feature[] = [
  { icon: "layers", title: "Shared memory", body: "Every agent on a job reads from the same scoped context, so nothing gets lost in a handoff." },
  { icon: "trend", title: "Model per agent", body: "Give the planner a large model and the courier a fast one. Swap providers without rewriting." },
  { icon: "bolt", title: "Parallel by default", body: "Independent steps run at the same time, so a nine-step job finishes in seconds, not minutes." },
  { icon: "shield", title: "Scoped by design", body: "Each agent only sees the tools and data its brief names, and nothing else." },
  { icon: "box", title: "Bring your own", body: "Wrap an existing script or model as a specialist and it joins the team like any other." },
  { icon: "report", title: "Every step traced", body: "See which agent did what, with which inputs, at what cost, and replay any step." },
];

export const AGENT_CODE = [
  'import { agent } from "@ordin/sdk";',
  "",
  "export const auditor = agent({",
  '  name: "auditor",',
  '  brief: "Check vendor invoices against contracts",',
  '  model: "large",',
  '  tools: ["ledger.read", "contracts.search"],',
  '  memory: { scope: "customer" },',
  '  policies: ["read-only", "spend-ceiling"],',
  "  budget: { usd: 0.02 },",
  "});",
];

export const POLICY_TOUR: TourItem[] = [
  {
    name: "Scopes",
    title: "Scoped permissions",
    body: "Each agent touches only the tables, tools and inboxes its brief names. Everything else does not exist to it.",
    caps: ["Per agent, per customer", "Least-privilege credentials", "Scopes expire with the run"],
    spec: [["Default", "Deny all"], ["Granularity", "Row and column"], ["Credentials", "Short lived"]],
  },
  {
    name: "Ceilings",
    title: "Spend ceilings",
    body: "Limits live on the action itself, not in a prompt someone can talk around. A run stops at the line you set.",
    caps: ["Per run, per day, per team", "Covers models and tools", "Alerts before the line"],
    spec: [["Currency", "Any"], ["Enforced", "Before execution"], ["Override", "Admins only"]],
  },
  {
    name: "Sign-off",
    title: "Human sign-off",
    body: "Anything outbound waits in a queue with its full trace attached. Approve it, edit it, or send it back.",
    caps: ["Mark any action as outbound", "Approve from Slack or email", "Escalate on timeout"],
    spec: [["Queue", "Per team"], ["Context", "Full trace"], ["SLA timers", "Built in"]],
  },
  {
    name: "Atomic runs",
    title: "All-or-nothing runs",
    body: "A job settles in full or rolls back. No half-paid batches, no emails sent for a reconciliation that failed.",
    caps: ["Checkpointed steps", "Automatic rollback", "Compensating actions"],
    spec: [["Isolation", "Per run"], ["Rollback", "Automatic"], ["Partial writes", "Never"]],
  },
  {
    name: "Audit",
    title: "A full audit trail",
    body: "Every token, tool call and decision is signed and kept, ready for the auditor who asks a year from now.",
    caps: ["Signed, tamper-evident logs", "Search across every run", "Export to your SIEM"],
    spec: [["Retention", "Up to 7 years"], ["Format", "OpenTelemetry"], ["Signing", "Per event"]],
  },
];

export const COMPLIANCE: Feature[] = [
  { icon: "shield", title: "SOC 2 Type II", body: "Audited every year by an independent firm. Reports available under NDA." },
  { icon: "check-circle", title: "ISO 27001", body: "An information security programme certified end to end." },
  { icon: "doc", title: "GDPR and DPA", body: "A standard data processing agreement and EU representative included." },
  { icon: "building", title: "Data residency", body: "Run in the EU, the US or a private VPC. Your data never leaves the region." },
  { icon: "layers", title: "No training on your data", body: "Inputs and outputs are never used to train any model, ours or a provider's." },
  { icon: "box", title: "SSO and SCIM", body: "SAML single sign-on and automatic provisioning on every paid plan." },
];

export const POLICY_CODE = [
  "# ordin.policy.yaml",
  "policies:",
  "  spend-ceiling:",
  "    max_usd_per_run: 0.05",
  "    on_breach: deny",
  "  sign-off:",
  '    actions: ["email.send", "payment.create"]',
  '    approvers: ["finance-leads"]',
  "    timeout: 4h",
  "  scope:",
  '    tables: ["ledger_q3", "vendors"]',
  "    write: false",
];

export const COMPARE = {
  plans: ["Starter", "Scale", "Enterprise"],
  rows: [
    { label: "Runs per month", values: ["10,000", "500,000", "Custom"] },
    { label: "Agents per job", values: ["3", "Unlimited", "Unlimited"] },
    { label: "Policies and sign-off queues", values: ["Basic", "Full", "Full"] },
    { label: "Trace history", values: ["7 days", "90 days", "Up to 7 years"] },
    { label: "SSO and SCIM", values: ["-", "Included", "Included"] },
    { label: "Data residency", values: ["US", "EU or US", "Any region or VPC"] },
    { label: "Bring your own model", values: ["-", "Included", "Included"] },
    { label: "Support", values: ["Community", "Priority", "Named engineer"] },
  ],
};
