"use client";

import React from "react";

function cx(...parts) {
  return parts.filter(Boolean).join(" ");
}

function normalizeColumns({ columns, headers, rows }) {
  if (Array.isArray(columns) && columns.length > 0) {
    if (typeof columns[0] === "string") {
      return columns.map((label) => ({ key: label, header: label }));
    }
    return columns;
  }

  if (Array.isArray(headers) && headers.length > 0) {
    return headers.map((label, idx) => ({ key: String(idx), header: label, index: idx }));
  }

  if (Array.isArray(rows) && rows.length > 0 && Array.isArray(rows[0])) {
    const maxLen = rows.reduce((m, r) => Math.max(m, Array.isArray(r) ? r.length : 0), 0);
    return Array.from({ length: maxLen }, (_, idx) => ({
      key: String(idx),
      header: "",
      index: idx,
    }));
  }

  return [];
}

export default function DocsTable({
  columns,
  headers,
  rows = [],
  caption,
  colorVariant = "vault",
  firstColumnAsHeader = false,
  className,
  tableClassName,
  headerRowClassName,
  bodyRowClassName,
  headerCellClassName,
  cellClassName,
  ...props
}) {
  const normalizedColumns = normalizeColumns({ columns, headers, rows });
  // Each variant only redefines the four table tokens; every rule below reads
  // them, so a variant never needs its own structural classes.
  //   solid   - filled dark header bar, zebra body rows (the default look)
  //   outline - no fills at all, white hairline grid only
  //   orange  - brand-primary header bar
  //   muted   - low-contrast header, for tables that shouldn't pull focus
  const variantClassName =
    colorVariant === "outline"
      ? "[--docs-table-border:rgba(255,255,255,0.22)] [--docs-table-header-bg:transparent] [--docs-table-header-color:#fff] [--docs-table-cell-color:rgba(255,255,255,0.76)] [--docs-table-stripe:transparent]"
      : colorVariant === "orange"
        ? "[--docs-table-border:rgba(255,95,0,0.32)] [--docs-table-header-bg:var(--primary)] [--docs-table-header-color:#0e0e0e] [--docs-table-cell-color:rgba(255,255,255,0.82)] [--docs-table-stripe:rgba(255,95,0,0.06)]"
        : colorVariant === "muted"
          ? "[--docs-table-border:rgba(147,147,147,0.28)] [--docs-table-header-bg:rgba(255,255,255,0.08)] [--docs-table-header-color:rgba(255,255,255,0.9)] [--docs-table-cell-color:rgba(255,255,255,0.68)] [--docs-table-stripe:rgba(255,255,255,0.03)]"
          : "[--docs-table-border:rgba(255,255,255,0.14)] [--docs-table-header-bg:#272727] [--docs-table-header-color:#fff] [--docs-table-cell-color:rgba(255,255,255,0.86)] [--docs-table-stripe:rgba(255,255,255,0.04)]";

  // Padding/alignment every cell shares, header or not.
  const cellBase =
    "px-[1.2vw] py-[1vh] text-left align-top max-[1025px]:px-4 max-[1025px]:py-3 max-md:px-3 max-md:py-2.5";

  return (
    <div
      className={cx(
        
        "w-full overflow-x-auto bg-transparent fadeup",
        variantClassName,
        className
      )}
      {...props}
    >
      <table
        className={cx(
          "w-full min-w-[38rem] border-collapse border border-(--docs-table-border) text-left",
          tableClassName
        )}
      >
        {caption ? (
          <caption className="px-[1.2vw] py-[1vh] text-left text-sm text-white/60 max-md:px-3">
            {caption}
          </caption>
        ) : null}

        {normalizedColumns.length ? (
          <thead>
            <tr className={cx("align-top", headerRowClassName)}>
              {normalizedColumns.map((col, idx) => (
                <th
                  key={col.key ?? idx}
                  scope="col"
                  className={cx(
                    cellBase,
                    "bg-(--docs-table-header-bg) font-bold text-(--docs-table-header-color)",
                    "text-base max-[1025px]:text-sm max-md:text-xs",
                    "border-b border-(--docs-table-border)",
                    idx !== normalizedColumns.length - 1 &&
                      "border-r border-(--docs-table-border)",
                    col.headerClassName,
                    headerCellClassName
                  )}
                >
                  {col.header ?? col.label ?? ""}
                </th>
              ))}
            </tr>
          </thead>
        ) : null}

        <tbody>
          {rows.map((row, rowIdx) => (
            <tr
              key={rowIdx}
              className={cx(
                "align-top",
                // Zebra rows come from the variant's stripe token, so the
                // outline variant (stripe: transparent) stays fill-free.
                rowIdx % 2 === 1 && "bg-(--docs-table-stripe)",
                bodyRowClassName
              )}
            >
              {normalizedColumns.map((col, colIdx) => {
                let value;

                if (typeof col.render === "function") {
                  value = col.render(row, rowIdx);
                } else if (Array.isArray(row)) {
                  const index = col.index ?? colIdx;
                  value = row[index];
                } else if (row && typeof row === "object") {
                  value = row[col.key];
                } else {
                  value = "";
                }

                const isRowHeader = firstColumnAsHeader && colIdx === 0;
                const Cell = isRowHeader ? "th" : "td";

                return (
                  <Cell
                    key={col.key ?? colIdx}
                    scope={isRowHeader ? "row" : undefined}
                    className={cx(
                      cellBase,
                      "leading-relaxed text-(--docs-table-cell-color)",
                      rowIdx !== rows.length - 1 &&
                        "border-b border-(--docs-table-border)",
                      // Row headers are bold only - no fill, so the left rail
                      // reads as emphasis rather than a second header band.
                      isRowHeader && "font-bold",
                      "text-base max-[1025px]:text-sm max-md:text-xs",
                      colIdx !== normalizedColumns.length - 1 &&
                        "border-r border-(--docs-table-border)",
                      col.cellClassName,
                      cellClassName
                    )}
                  >
                    {value}
                  </Cell>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
