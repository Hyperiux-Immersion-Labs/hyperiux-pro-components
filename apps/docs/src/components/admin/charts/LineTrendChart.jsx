"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  CHART_AXIS_PROPS,
  CHART_GRID_PROPS,
  CHART_TOOLTIP_CONTENT_STYLE,
  CHART_TOOLTIP_LABEL_STYLE,
} from "./ChartTheme";

// Time-series trend (signups/day, copies/day, revenue/day). `data` is a
// flat array of plain objects, e.g. [{ date: "Aug 1", value: 4 }, ...] -
// callers pre-format the x label so this stays a dumb rendering component.
export function LineTrendChart({
  data,
  xKey = "date",
  dataKey = "value",
  color = "#ff5f00",
  height = 220,
  valueLabel,
}) {
  if (!data?.length) {
    return (
      <div
        className="flex items-center justify-center text-sm text-white/40"
        style={{ height }}
      >
        No data yet
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid {...CHART_GRID_PROPS} />
        <XAxis dataKey={xKey} {...CHART_AXIS_PROPS} />
        <YAxis allowDecimals={false} {...CHART_AXIS_PROPS} width={32} />
        <Tooltip
          contentStyle={CHART_TOOLTIP_CONTENT_STYLE}
          labelStyle={CHART_TOOLTIP_LABEL_STYLE}
          formatter={(value) => [value, valueLabel || dataKey]}
          cursor={{ stroke: "rgba(255,255,255,0.15)" }}
        />
        <Line
          type="monotone"
          dataKey={dataKey}
          stroke={color}
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
