// Built using Hyperiux Vault: https://vault.hyperiux.com

"use client";

import TextStream from "../effects/text-stream";
import { THEME } from "../../theme";

const TASKS = [
  "reconciles Q3 invoices",
  "drafts vendor emails for sign-off",
  "triages the support queue",
  "answers security questionnaires",
  "writes the weekly revenue report",
  "chases overdue contracts",
  "migrates a thousand tickets",
  "checks every figure twice",
  "books the quarterly review",
  "cleans the CRM",
  "summarises yesterday's calls",
  "flags anything over budget",
  "updates the roadmap in Jira",
  "files the expense claims",
];

// Agents page: the Hyperiux Text Stream finishing one sentence many ways. Scroll speeds it up.
const TaskStream = () => (
  // The mask fades the lines in and out at the edges instead of cutting them off
  <section
    data-ord-orb="agents-stream"
    data-ord-chapter="Jobs"
    className="relative [mask-image:linear-gradient(to_bottom,transparent,#000_22%,#000_78%,transparent)]"
  >
    <TextStream
      items={TASKS}
      label="Ordin"
      speed={0.9}
      backgroundColor="transparent"
      textColor={THEME.bone}
      className="h-[90vh]"
      labelClassName="text-64 pr-[1vw] text-(--ord-primary-light)"
      lineClassName="text-64 font-light text-ord-bone"
    />
  </section>
);

export default TaskStream;
