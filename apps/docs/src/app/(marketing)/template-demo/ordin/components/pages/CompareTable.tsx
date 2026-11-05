// Built using Hyperiux Vault: https://vault.hyperiux.com

"use client";

import { useRef } from "react";
import { useReveal } from "../Animations/useReveal";
import LineReveal from "../Animations/LineReveal";
import { HX_LIGHT_PRIMARY } from "../hxPalette";
import { ThemedDataTable } from "../effects/animated-data-table";
import { COMPARE } from "./content";

const COLUMNS = [
  { key: "feature", header: "", className: "w-[34%]" },
  ...COMPARE.plans.map((plan) => ({ key: plan, header: plan })),
];

const ROWS = COMPARE.rows.map((row, i) => ({
  id: String(i),
  feature: row.label,
  ...Object.fromEntries(COMPARE.plans.map((plan, p) => [plan, row.values[p]])),
}));

// Light section: every plan side by side in the Hyperiux Animated Data Table, with only its
// hover on: a highlight that slides from row to row under the cursor
const CompareTable = () => {
  const root = useRef<HTMLElement>(null);
  useReveal(root);

  return (
    <section ref={root} data-ord-orb="pricing-compare" data-ord-chapter="Compare" data-ord-light className="relative bg-ord-bone text-ord-ink">
      <div className="flex flex-col gap-14 ord-container ord-section max-md:gap-8">
        <LineReveal className="w-[50%] max-lg:w-full">
          <h2>
            Compare <span className="text-(--ord-text-muted)">every plan.</span>
          </h2>
        </LineReveal>
        <div data-ord-reveal>
          <ThemedDataTable
            palette={HX_LIGHT_PRIMARY}
            mode="light"
            className="text-22"
            columns={COLUMNS}
            rows={ROWS}
            rowHighlight="slide"
            rowHighlightColor="primary"
            staggerRows={false}
            staggerCells={false}
            numberAnimation="off"
            sortable={false}
            showStatusFilter={false}
            showStatusBadges={false}
            expandable={false}
            addable={false}
            removable={false}
            selectable={false}
            loadingSkeleton={false}
            stickyHeader={false}
            height="auto"
            rounded="none"
            showVerticalLines={false}
          />
        </div>
      </div>
    </section>
  );
};

export default CompareTable;
