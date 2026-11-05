// Built using Hyperiux Vault: https://vault.hyperiux.com

"use client";

import { useEffect, useRef, useState } from "react";
import LineReveal from "../Animations/LineReveal";
import { prefersReducedMotion } from "../Animations/reducedMotion";
import { HX_LIGHT_PRIMARY } from "../hxPalette";
import { ThemedDataTable } from "../effects/animated-data-table";

const STEPS: Record<string, string[]> = {
  R8821: ["Planner split the job into 9 steps", "Guard denied wire_transfer, spend ceiling", "Courier queued 14 drafts for sign-off"],
  R8820: ["Researcher read 4,812 tickets", "Analyst grouped 31 themes", "Report sent to #support-leads"],
  R8819: ["Courier drafted 22 renewal emails", "Guard held all 22 for sign-off"],
  R8818: ["Coder wrote migrate_tickets.sql", "Evals failed on 3 of 120 cases", "Run rolled back, nothing written"],
  R8817: ["Analyst refreshed the revenue model", "Critic re-checked 64 figures"],
  R8816: ["Planner is waiting on the CRM connector"],
  R8815: ["Researcher matched 1,204 leads", "Courier updated HubSpot owners"],
};

const ROWS = [
  { id: "R8821", job: "Reconcile Q3 invoices", agents: "4 agents", status: "Held", cost: 3.12 },
  { id: "R8820", job: "Summarise support tickets", agents: "3 agents", status: "Settled", cost: 1.84 },
  { id: "R8819", job: "Chase contract renewals", agents: "2 agents", status: "Held", cost: 1.2 },
  { id: "R8818", job: "Migrate legacy tickets", agents: "3 agents", status: "Rolled back", cost: 4.4 },
  { id: "R8817", job: "Weekly revenue report", agents: "2 agents", status: "Settled", cost: 0.92 },
  { id: "R8816", job: "Clean the CRM", agents: "1 agent", status: "Running", cost: 0.31 },
  { id: "R8815", job: "Route inbound leads", agents: "2 agents", status: "Settled", cost: 0.74 },
];

const COLUMNS = [
  { key: "id", header: "Run", className: "w-[12%]" },
  { key: "job", header: "Job", className: "w-[32%]" },
  { key: "agents", header: "Agents", className: "w-[16%]" },
  { key: "status", header: "Outcome", kind: "status" as const, className: "w-[20%]" },
  { key: "cost", header: "Cost", kind: "currency" as const },
];

const STATUSES = [
  { value: "Settled", tone: "success" as const },
  { value: "Held", tone: "warning" as const, pulse: true },
  { value: "Rolled back", tone: "danger" as const },
  { value: "Running", tone: "neutral" as const, pulse: true },
];

// Governance page: the Hyperiux Animated Data Table as a live audit log of recent runs.
// Sort any column, filter by outcome, and open a run to see the steps that were taken or stopped.
const RunLog = () => {
  const root = useRef<HTMLElement>(null);
  const [loading, setLoading] = useState(true);

  // Like the Vault demo: the table loads in with its skeleton the first time it scrolls into view
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    let timer = 0;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        io.disconnect();
        timer = window.setTimeout(() => setLoading(false), prefersReducedMotion() ? 0 : 1200);
      },
      { threshold: 0.3 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      window.clearTimeout(timer);
    };
  }, []);

  return (
    <section ref={root} data-ord-orb="governance-log" data-ord-chapter="Audit log" data-ord-light className="relative bg-ord-bone text-ord-ink">
      <div className="flex flex-col gap-12 ord-container ord-section max-md:gap-8">
        <div className="flex items-end justify-between gap-10 max-lg:flex-col max-lg:items-start max-lg:gap-4">
          <LineReveal className="w-[50%] max-lg:w-full">
            <h2>
              Every run, <span className="text-(--ord-text-muted)">on the record.</span>
            </h2>
          </LineReveal>
          <div className="flex w-[30%] flex-col items-end gap-6 max-lg:w-[70%] max-lg:items-start max-md:w-full">
            <LineReveal delay={0.15}>
              <p className="text-28 text-(--ord-text-muted)">Sort, filter and open any run to see exactly which steps went through and which were stopped.</p>
            </LineReveal>
          </div>
        </div>
        <ThemedDataTable
          palette={HX_LIGHT_PRIMARY}
          mode="light"
          className="text-22"
          columns={COLUMNS}
          rows={ROWS}
          statusKey="status"
          statuses={STATUSES}
          totalKey="cost"
          loading={loading}
          renderDetail={(row) => (
            <ul className="flex flex-col items-center gap-2 py-2">
              {(STEPS[String(row.id)] ?? []).map((step) => (
                <li key={step} className="flex items-center gap-3 ord-label text-14 uppercase text-(--ord-text-muted)">
                  <span className="h-[0.5vh] aspect-square bg-(--ord-primary-deep)" />
                  {step}
                </li>
              ))}
            </ul>
          )}
          // The Vault demo's own entrance settings, so the motion matches the component page
          duration={0.4}
          stagger={0.04}
          staggerRows
          staggerCells={false}
          numberAnimation="roll"
          rowHighlight="slide"
          rowHighlightColor="primary"
          sortable
          showStatusFilter
          showStatusBadges
          expandable
          addable={false}
          removable={false}
          selectable={false}
          textAlign="center"
          height="52vh"
          stickyHeader
          loadingSkeleton
          rounded="none"
        />
      </div>
    </section>
  );
};

export default RunLog;
