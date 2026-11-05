// Built using Hyperiux Vault: https://vault.hyperiux.com
// Copy for the Platform page. Edit here to rebrand.

import type { IconName } from "../Icon";

export const LAYERS = [
  {
    name: "Runtime",
    title: "Durable execution",
    body: "Jobs survive restarts, retries and week-long waits. Every step is checkpointed, so nothing runs twice.",
    caps: ["Checkpoint on every step", "Automatic retries with backoff", "Pause for days, resume in milliseconds"],
    spec: [
      ["Longest run", "30 days"],
      ["Checkpoints", "Every step"],
      ["Cold start", "120 ms"],
    ],
  },
  {
    name: "Memory",
    title: "Context that stays scoped",
    body: "Vector and graph recall that every agent shares, fenced per customer so nothing leaks between tenants.",
    caps: ["Vector and graph recall", "Scoped per agent and per customer", "Forget on request, provably"],
    spec: [
      ["Recall latency", "18 ms p50"],
      ["Retention", "You decide"],
      ["Isolation", "Per tenant"],
    ],
  },
  {
    name: "Tools",
    title: "840 typed connectors",
    body: "From Postgres to payroll, every tool call is typed in and typed out, with least-privilege credentials.",
    caps: ["Typed inputs and outputs", "Short-lived, scoped credentials", "Write your own in minutes"],
    spec: [
      ["Connectors", "840"],
      ["Auth", "OAuth, keys, mTLS"],
      ["Schema", "Typed end to end"],
    ],
  },
  {
    name: "Guard",
    title: "Policies on every action",
    body: "Rules live on the action, not in a prompt. A call that breaks one is denied before it runs.",
    caps: ["Spend ceilings per run", "Scope and data rules", "Human sign-off queues"],
    spec: [
      ["Checks per action", "All of them"],
      ["Added latency", "4 ms"],
      ["Bypass", "Not possible"],
    ],
  },
  {
    name: "Evals",
    title: "Regression tests for behaviour",
    body: "Golden sets and graders run on every deploy, so a model change can never quietly break a workflow.",
    caps: ["Run on every deploy", "Model or code graders", "Block a bad release"],
    spec: [
      ["Suites", "Unlimited"],
      ["Graders", "Model or code"],
      ["Gate", "On deploy"],
    ],
  },
  {
    name: "Observe",
    title: "Every run on the record",
    body: "Traces, costs and decisions for every step, with one-click replay of exactly what each agent saw.",
    caps: ["Full traces and costs", "One-click replay", "Export to your SIEM"],
    spec: [
      ["Retention", "90 days and up"],
      ["Replay", "Step by step"],
      ["Export", "OpenTelemetry"],
    ],
  },
];

export const CAPABILITIES: { icon: IconName; title: string; body: string }[] = [
  { icon: "layers", title: "Durable by default", body: "Checkpointed steps, retries and resumable waits without a queue to babysit." },
  { icon: "trend", title: "Model routing", body: "Route each agent to the best model per step, with automatic fallbacks." },
  { icon: "box", title: "Typed tools", body: "Every connector has a schema, so agents can't call a tool with the wrong shape." },
  { icon: "shield", title: "Policy engine", body: "Spend, scope and sign-off rules checked on every action, in four milliseconds." },
  { icon: "check-circle", title: "Evals on deploy", body: "Behaviour tests gate every release, the same way unit tests gate code." },
  { icon: "report", title: "Replayable runs", body: "Open any run and step through exactly what each agent saw and decided." },
];

export const CONNECTORS = [
  "Postgres", "Snowflake", "Salesforce", "Stripe", "NetSuite", "Slack", "Gmail", "Zendesk",
  "GitHub", "Jira", "HubSpot", "BigQuery", "S3", "Notion", "Workday", "Intercom",
];

export const CODE = [
  'import { Ordin } from "@ordin/sdk";',
  "",
  'const ordin = new Ordin({ region: "eu-west-1" });',
  "",
  "const run = await ordin.run({",
  '  job: "Reconcile Q3 invoices",',
  '  agents: ["planner", "analyst", "courier"],',
  '  policies: ["spend-ceiling", "sign-off"],',
  "  budget: { usd: 0.05 },",
  "});",
  "",
  'console.log(run.status); // "settled"',
];
