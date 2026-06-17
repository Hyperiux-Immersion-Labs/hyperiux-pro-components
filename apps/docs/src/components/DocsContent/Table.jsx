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
  className,
  tableClassName,
  headerRowClassName,
  bodyRowClassName,
  headerCellClassName,
  cellClassName,
  ...props
}) {
  const normalizedColumns = normalizeColumns({ columns, headers, rows });

  return (
    <div
  className={cx(
    "w-full overflow-x-auto rounded-md border border-white/12 bg-white/4 fadeup",
    className
  )}
  {...props}
>
  <table
    className={cx(
      "w-full min-w-[38rem] border-collapse text-left",
      tableClassName
    )}
  >
    {caption ? (
      <caption className="px-4 py-3 text-left text-sm text-white/60">
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
                "bg-[#272727] px-4 py-3.5 text-[1.2rem] font-medium text-white/80 border-b border-white/10",
                idx !== normalizedColumns.length - 1 &&
                  "border-r border-white/10",
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
            "align-top border-b border-white/10",
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

            return (
              <td
                key={col.key ?? colIdx}
                className={cx(
                  "px-4 py-3.5 text-sm md:text-base leading-relaxed text-white/70 border-white/10",
                  colIdx !== normalizedColumns.length - 1 &&
                    "border-r border-white/10",
                  col.cellClassName,
                  cellClassName
                )}
              >
                {value}
              </td>
            );
          })}
        </tr>
      ))}
    </tbody>
  </table>
</div>
  );
}
