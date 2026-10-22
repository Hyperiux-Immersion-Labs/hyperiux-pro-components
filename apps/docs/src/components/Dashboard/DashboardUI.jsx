"use client";

import { useEffect, useRef, useState } from "react";
import { LoaderCircle, Search } from "lucide-react";
import { BUTTON_SIZE, ButtonChrome, buttonClassName } from "@/homepage/components/Button";
import LinkButton from "@/components/WebsiteComps/LinkButton";
import { DateRangeCalendarPicker } from "@/components/admin/DateRangeCalendarPicker";
import { FilterMenu } from "@/app/(app)/(workspace)/effects/FilterMenu";
import { SliderArrowButton } from "@/components/ui/SliderArrowButton";
import { useButtonId } from "@/components/ui/ButtonIds";

// Building blocks shared by the dashboard tabs on the light sheet.

// The white card, and its padding
export const CARD = "flex flex-col bg-foreground text-ink ring-1 ring-inset ring-black/10";
export const CARD_PAD = "p-[calc(var(--cvw)*1.6)] max-lg:p-6 max-md:p-5";

// Wide tables (the admin Users, Invoicing and Emails lists): every column takes the width
// of its content (cells don't wrap), the card scrolls the table sideways when it doesn't
// fit, and the last column - the row's actions - stays pinned to the right edge. The pin
// shows its edge shadow only while there's more table scrolled away beneath it.
export const TABLE = "w-full min-w-max border-collapse text-left [&_td]:whitespace-nowrap [&_th]:whitespace-nowrap";
export const STICKY_END =
  "sticky right-0 z-1 bg-foreground pl-4 transition-shadow duration-300 group-data-[clipped]/scroll:shadow-[-14px_0_14px_-14px_rgba(0,0,0,0.3)]";
// The first column (who the row is about) stays pinned to the left edge the same way, so
// sideways scrolling - even a slightly diagonal trackpad swipe - never cuts off the avatar
// and name; its shadow shows once the table is scrolled. Not on phones, where it'd take
// half the width.
export const STICKY_START =
  "md:sticky md:left-0 md:z-1 bg-foreground transition-shadow duration-300 md:group-data-[scrolled]/scroll:shadow-[14px_0_14px_-14px_rgba(0,0,0,0.3)]";

// Every dashboard table's rows and cells, so lists read the same on every tab: a quiet
// header row, a hairline between rows, the same room between columns. Text cells don't
// wrap (TABLE), so on tablets and phones the card scrolls the table sideways instead of
// squeezing it. NUM right-aligns a number column.
export const HEAD_ROW = "type-label border-b border-black/10 text-black/60";
export const TH = "py-3 pr-[calc(var(--cvw)*2)] font-normal last:pr-0 max-lg:pr-6";
export const ROW = "border-b border-black/10 last:border-b-0";
export const TD = "py-[calc(var(--cvw)*0.8)] pr-[calc(var(--cvw)*2)] align-middle last:pr-0 max-lg:py-3 max-lg:pr-6";
export const NUM = " tabular-nums";

// A card's filter row (search, segments, menus, per page): wraps on tablets; on phones it
// takes the card's width, so the search box spans it and the rest wrap in even rows.
// Top-aligned: every control is the same height (h-9.5), and a custom date range puts its
// calendar button under the date menu - the controls beside it (the sort button) stay
// level with the menu instead of centring on both
// On phones a two-column grid: search, segments ([role=group]) and rows per page take a full
// row; dropdowns pair up two to a row (dense, so a pair fills in around a full-width item)
export const TOOLBAR = "flex flex-wrap items-start gap-[calc(var(--cvw)*0.7)] max-lg:gap-3 max-md:grid max-md:w-full max-md:grid-flow-row-dense max-md:grid-cols-2 max-md:items-center max-md:gap-[2.5vw] max-md:[&>[role=group]]:col-span-2";

// The search box every list's toolbar uses; the whole row on phones
export function SearchField({ value, onChange, placeholder, label, className = "" }) {
  return (
    <label className={`type-small flex h-9.5 items-center gap-2 bg-light px-3 text-black/60 ring-1 ring-inset ring-black/10 focus-within:ring-primary max-md:col-span-2 max-md:w-full ${className}`}>
      <Search className="size-3.5 shrink-0" aria-hidden="true" />
      <span className="sr-only">{label}</span>
      <input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="w-[calc(var(--cvw)*12)] min-w-0 bg-transparent text-ink outline-none placeholder:text-black/40 max-lg:w-40 max-md:flex-1" />
    </label>
  );
}

// Payments - the account's Invoicing receipts and an admin's view of one user: what, amount
// and status first (what a phone shows before scrolling), then when, the Razorpay payment
// id (with showPaymentId) and the receipt. Rows:
// { id, date, description, paymentId?, amount (formatted), status, url }.
const PAID = new Set(["paid", "redeemed"]);
const formatPaymentDate = (value) => (value ? new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(new Date(value)) : "—");

export function PaymentsTable({ rows, showPaymentId = false }) {
  return (
    <TableScroll>
      <table className={TABLE}>
        <thead>
          <tr className={HEAD_ROW}>
            <th className={TH}>Description</th>
            <th className={`${TH} ${NUM}`}>Amount</th>
            <th className={TH}>Status</th>
            <th className={TH}>Date</th>
            {showPaymentId && <th className={TH}>Payment ID</th>}
            <th className={`${TH} ${STICKY_END} text-right`}>Receipt</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} className={ROW}>
              <td className={`type-body ${TD} max-w-80 truncate max-md:max-w-40`}>{row.description}</td>
              <td className={`type-body ${TD} ${NUM} font-aeonik`}>{row.amount}</td>
              <td className={TD}>
                <span className="type-small inline-flex items-center gap-1.5 capitalize">
                  <span aria-hidden="true" className={`size-1.5 rounded-full ${PAID.has(row.status) ? "bg-primary" : "bg-black/20"}`} />
                  {row.status || "unknown"}
                </span>
              </td>
              <td className={`type-small ${TD} text-black/60`}>{formatPaymentDate(row.date)}</td>
              {showPaymentId && <td className={`type-small ${TD} font-mono text-black/60`}>{row.paymentId || "—"}</td>}
              <td className={`${TD} ${STICKY_END} text-right`}>
                {row.url ? (
                  <a href={row.url} target="_blank" rel="noopener noreferrer" className="type-small text-ink underline underline-offset-3 transition-colors duration-300 hover:text-primary">
                    View
                  </a>
                ) : (
                  <span className="type-small text-black/20">—</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </TableScroll>
  );
}

// A table with nothing to show ("No users match these filters.") keeps at least 20vh, its
// message centred - as a block, or as the one <td> of an empty <tbody>
export const EMPTY_TABLE = "type-body flex min-h-[20vh] flex-col items-center justify-center gap-4 text-center text-black/60";
export const EMPTY_CELL = "type-body h-[20vh] text-center align-middle text-black/60";

export function TableScroll({ children, className = "" }) {
  const ref = useRef(null);
  const [clipped, setClipped] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const update = () => {
      setClipped(el.scrollWidth - el.clientWidth - el.scrollLeft > 1);
      setScrolled(el.scrollLeft > 1);
    };
    update();
    el.addEventListener("scroll", update, { passive: true });
    const observer = new ResizeObserver(update);
    observer.observe(el);
    if (el.firstElementChild) observer.observe(el.firstElementChild);
    return () => {
      el.removeEventListener("scroll", update);
      observer.disconnect();
    };
  }, []);
  return (
    <div ref={ref} data-clipped={clipped || undefined} data-scrolled={scrolled || undefined} className={`group/scroll overflow-x-auto overscroll-x-contain ${className}`}>
      {children}
    </div>
  );
}

// Where an effect was delivered: web solid, CLI orange, MCP outlined - on white cards,
// or on dark surfaces with `dark`
const SOURCES = {
  web: ["Web", "bg-ink text-foreground", "bg-foreground text-background"],
  cli: ["CLI", "bg-primary text-background", "bg-primary text-background"],
  mcp: ["MCP", "text-ink ring-1 ring-inset ring-black/20", "text-foreground ring-1 ring-inset ring-foreground/30"],
};

export function SourceChip({ source, dark = false }) {
  const [label, light, onDark] = SOURCES[source] || SOURCES.web;
  return <span className={`type-small inline-flex w-12 shrink-0 justify-center py-0.5 ${dark ? onDark : light}`}>{label}</span>;
}

// The FAQ's "View More" link (underline, rolling label) with a sideways arrow, no shimmer:
// "All usage", "Your templates". `tone`: "light" (dark text on the white cards), "dark"
// (white text on the dark plan card) or "accent" (orange, inline in a sentence - no
// arrow there). `arrow={false}` drops the arrow, keeping the underline animation.
// On hover the label, its line and the arrow all turn orange.
const LINK_TONES = {
  light: "text-ink transition-colors duration-300 hover:text-primary",
  dark: "text-foreground transition-colors duration-300 hover:text-primary",
  accent: "text-primary",
};

export function CardLink({ href, children, tone = "light", onClick, arrow = true, className = "" }) {
  const inline = tone === "accent";
  return (
    <LinkButton
      href={href}
      text={children}
      onClick={onClick}
      tilted={false}
      showArrow={!inline && arrow}
      arrowRight
      underlineClassName="mt-0.5"
      colorClassName={LINK_TONES[tone]}
      // One line, never squeezed: beside a long heading on a phone the label would wrap,
      // and its rolling animation clips everything after the first line ("All Usage" → "All")
      className={[inline ? "" : "type-label shrink-0 whitespace-nowrap", className].filter(Boolean).join(" ")}
    />
  );
}

// CardLink's look on a <button>, no arrow: a modal's quiet way out ("Keep It", "Cancel").
// `tone`: "dark" (on the dark modals and drawers) or "light" (on the white cards).
export function TextButton({ children, onClick, disabled = false, tone = "dark", className = "", id }) {
  const bid = useButtonId();
  return (
    <LinkButton
      as="button"
      id={id || bid(typeof children === "string" ? children : "text-button")}
      text={children}
      onClick={onClick}
      disabled={disabled}
      tilted={false}
      underlineClassName="mt-0.5"
      colorClassName={LINK_TONES[tone]}
      className={`type-label ${className}`}
    />
  );
}

// The width of the dashboard's dropdown filters (trigger and panel alike)
// On phones a dropdown takes an even share of its toolbar row, never under 40%: two side by
// side, a lone one the whole row - so options like "Last 30 days" never wrap and no menu
// stretches across the card while its neighbour is squeezed
export const FILTER_WIDTH = "w-[calc(var(--cvw)*13)] max-lg:w-48 max-md:w-auto max-md:min-w-[40%] max-md:flex-1";
// A right-aligned dropdown panel with a long list: a fixed height, scrolling inside
export const SCROLL_PANEL = "left-auto! right-0 max-h-[20vw] overflow-y-auto max-lg:max-h-[50vh]";

// "14 of 14 saved": the shown count big and dark, the rest quiet - as the effects listing's count
export function FilteredCount({ shown, total, noun }) {
  return (
    <p aria-live="polite" className="flex items-baseline gap-2">
      <span className="type-h3 text-ink">{shown}</span>
      <span className="type-label text-black/60">
        of {total} {noun}
      </span>
    </p>
  );
}

// The date filter's choices - the admin Activity page's ranges
export const DATE_PRESETS = { all: "All time", today: "Today", "7d": "Last 7 days", "30d": "Last 30 days", "90d": "Last 90 days", custom: "Custom range" };
const PRESET_DAYS = { today: 1, "7d": 7, "30d": 30, "90d": 90 };
export const ALL_DATES = { preset: "all", from: "", to: "" };

const dayString = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

// The YYYY-MM-DD days a date filter covers: { from, to }, from "" for all time
export function resolveDateRange({ preset, from, to }) {
  if (preset === "custom") return { from, to };
  const days = PRESET_DAYS[preset];
  if (!days) return { from: "", to: "" };
  const start = new Date();
  start.setDate(start.getDate() - (days - 1));
  return { from: dayString(start), to: dayString(new Date()) };
}

/**
 * A date filter for the light sheet: a dropdown of ranges (last 7 / 30 / 90 days...), as
 * on the admin Activity page, with a calendar beside it for "Custom range". The trigger
 * shows just the range ("All time"); `label` names the date for screen readers ("Saved",
 * "Joined"); `value` is { preset, from, to }.
 */
export function DateRangeFilter({ label, value, onChange, widthClassName = FILTER_WIDTH, className = "" }) {
  const bid = useButtonId();
  // The trigger and its panel share one width
  return (
    // On phones the wrapper steps aside (contents): the dropdown sits in the row beside its
    // neighbour (the audience filter, or the toolbar's other menus) and a custom range's
    // "Pick a date range" takes a full-width line of its own below, so its calendar opens
    // centred on the screen
    <div className={`flex flex-wrap items-center gap-[calc(var(--cvw)*0.7)] max-md:contents ${className}`}>
      <FilterMenu
        id={bid("dashboard-ui-date-range")}
        tone="light"
        variant="label"
        alignRight
        widthClassName={widthClassName}
        label={label ? `${label} date range` : "Date range"}
        panelClassName="left-auto! right-0"
        options={Object.keys(DATE_PRESETS)}
        categoryFilter={value.preset}
        activeFilter={value.preset === "all" ? null : value.preset}
        getLabel={(id) => DATE_PRESETS[id]}
        onSelect={(preset) => onChange({ preset, from: preset === "custom" ? value.from : "", to: preset === "custom" ? value.to : "" })}
      />
      {value.preset === "custom" && (
        // the full row on phones: a grid's both columns, or a flex row's whole width
        <div className="flex max-md:col-span-2 max-md:w-full max-md:basis-full">
          <DateRangeCalendarPicker
            tone="light"
            from={value.from}
            to={value.to}
            onChange={(range) => onChange({ ...value, ...range })}
            onClear={() => onChange(ALL_DATES)}
          />
        </div>
      )}
    </div>
  );
}

// Whether a timestamp falls inside a picked range of YYYY-MM-DD days (local, both ends
// included). No range picked: everything passes; a range picked: undated items don't.
export function inDateRange(value, from, to) {
  if (!from) return true;
  if (!value) return false;
  const time = new Date(value).getTime();
  const start = new Date(`${from}T00:00:00`).getTime();
  const end = new Date(`${to || from}T23:59:59.999`).getTime();
  return time >= start && time <= end;
}

// A native <button> (form submit) in the site Button's look: orange, or "outline"
export function SubmitButton({ label, busy = false, disabled = false, variant = "orange", type = "submit", onClick, className = "", id }) {
  const bid = useButtonId();
  const [hovered, setHovered] = useState(false);
  return (
    <button
      id={id || bid(typeof label === "string" ? label : "submit")}
      type={type}
      onClick={onClick}
      disabled={disabled || busy}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={buttonClassName({ variant, disabled: disabled || busy, className: `w-fit ${className}` })}
    >
      <ButtonChrome label={busy ? <LoaderCircle className="size-4 animate-spin" aria-label="Working" /> : label} hovered={hovered} />
    </button>
  );
}

// A text field on a white card: label above, light well
export const FIELD = "type-body w-full bg-light px-4 py-3 text-ink ring-1 ring-inset ring-black/10 outline-none transition-shadow duration-300 placeholder:text-black/40 focus:ring-primary";
export const FIELD_LABEL = "type-label flex flex-col gap-2 text-black/60";

// Rows of term / value pairs inside a card
export function DetailRows({ rows, tone = "light" }) {
  const line = tone === "dark" ? "border-foreground/10" : "border-black/10";
  const term = tone === "dark" ? "text-foreground/80" : "text-black/60";
  return (
    <dl className="flex flex-col">
      {rows.map(([label, value]) => (
        <div key={label} className={`flex items-baseline justify-between gap-4 border-t py-[calc(var(--cvw)*0.9)] first:border-t-0 max-lg:py-3 ${line}`}>
          <dt className={`type-small ${term}`}>{label}</dt>
          <dd className="type-body text-right">{value}</dd>
        </div>
      ))}
    </dl>
  );
}

// Previous / next for a paged table, with "Page 1 of 5 · 40 events" - the effects listing's
// Trending arrows. One page only: just the count, no arrows.
// Its arrows: "<noun>-page-previous" / "-next" ("user-page-next"; the noun singular, so the
// id doesn't change with the count)
export function Pager({ page, pages, total, noun, onPage }) {
  const bid = useButtonId();
  const idNoun = String(noun || "").replace(/s$/, "");
  return (
    <div className="flex items-center justify-between gap-4">
      <p className="type-small text-black/60">{pages > 1 ? `Page ${page + 1} of ${pages} · ${total} ${noun}` : `${total} ${noun}`}</p>
      {pages > 1 && (
        <div className="flex gap-[calc(var(--cvw)*0.6)] max-lg:gap-2">
          <SliderArrowButton id={bid(idNoun, "page-previous")} tone="light" direction="prev" ariaLabel="Previous page" disabled={page === 0} onClick={() => onPage(page - 1)} />
          <SliderArrowButton id={bid(idNoun, "page-next")} tone="light" direction="next" ariaLabel="Next page" disabled={page >= pages - 1} onClick={() => onPage(page + 1)} />
        </div>
      )}
    </div>
  );
}

// How many rows a table shows a page
export const PER_PAGE_OPTIONS = [10, 50, 100, 150, 200];
// The admin tables: at least 25 a page, 50 to start
export const ADMIN_PER_PAGE_OPTIONS = [25, 50, 100, 150, 200];
export const ADMIN_PER_PAGE = 50;

export function PerPageMenu({ value, onChange, options = PER_PAGE_OPTIONS }) {
  const bid = useButtonId();
  return (
    // the last full row of a toolbar on phones
    <div className="flex items-center gap-3 max-md:col-span-2 max-md:justify-between">
      <span className="type-small text-black/60">Per page</span>
      <FilterMenu
        id={bid("dashboard-ui-rows-per-page")}
        tone="light"
        variant="label"
        widthClassName="w-24"
        label="Rows per page"
        options={options.map(String)}
        categoryFilter={String(value)}
        activeFilter={null}
        getLabel={(id) => id}
        onSelect={(id) => onChange(Number(id))}
      />
    </div>
  );
}

// Plain action buttons at the standard button size, icon + label: orange, or outlined
const ACTION = `inline-flex w-fit shrink-0 cursor-pointer items-center gap-2 px-4 ${BUTTON_SIZE} transition-[background-color,color,box-shadow] duration-300 disabled:cursor-default disabled:opacity-60 [&_svg]:size-4`;
export const ACTION_PRIMARY = `${ACTION} bg-primary text-background hover:bg-primary-hover`;
export const ACTION_LINE = `${ACTION} text-ink ring-1 ring-inset ring-black/10 hover:text-primary hover:ring-primary`;

// An on / off switch (square track, round knob); `disabled` for one that's always on
export function Toggle({ checked, onChange, label, disabled = false, id }) {
  const bid = useButtonId();
  return (
    <button
      id={id || bid(label, "toggle")}
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange?.(!checked)}
      className={`relative h-6 w-11 shrink-0 cursor-pointer transition-colors duration-300 disabled:cursor-default ${checked ? "bg-primary" : "bg-black/20"} ${disabled ? "opacity-60" : ""}`}
    >
      <span aria-hidden="true" className={`absolute top-1 left-1 size-4  bg-foreground transition-transform duration-300 ${checked ? "translate-x-5" : ""}`} />
    </button>
  );
}
