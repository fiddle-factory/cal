"use client";

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { valueFormatter } from "@calcom/features/insights/lib/valueFormatter";
import { useLocale } from "@calcom/lib/hooks/useLocale";
import { Badge } from "@calcom/ui/components/badge";

import { useToggleableLegend } from "@calcom/web/modules/insights/hooks/useToggleableLegend";

import { ChartCard } from "./ChartCard";

const COLOR = {
  CREATED: "#a855f7",
  COMPLETED: "#22c55e",
  CANCELLED: "#ef4444",
};

const legend = [
  { label: "Created", color: COLOR.CREATED },
  { label: "Completed", color: COLOR.COMPLETED },
  { label: "Cancelled", color: COLOR.CANCELLED },
];

type EventsOverviewDatum = {
  Month: string;
  Created: number;
  Completed: number;
  Cancelled: number;
  formattedDateFull: string;
};

// Illustrative sample data shown while Insights is locked.
const SAMPLE_EVENTS: EventsOverviewDatum[] = [
  { Month: "Jan", Created: 42, Completed: 35, Cancelled: 4, formattedDateFull: "January 2026" },
  { Month: "Feb", Created: 51, Completed: 43, Cancelled: 5, formattedDateFull: "February 2026" },
  { Month: "Mar", Created: 63, Completed: 52, Cancelled: 6, formattedDateFull: "March 2026" },
  { Month: "Apr", Created: 72, Completed: 61, Cancelled: 5, formattedDateFull: "April 2026" },
  { Month: "May", Created: 94, Completed: 80, Cancelled: 7, formattedDateFull: "May 2026" },
  { Month: "Jun", Created: 128, Completed: 104, Cancelled: 6, formattedDateFull: "June 2026" },
];

const SummaryTooltip = ({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ value: number; name: string; color: string; payload: EventsOverviewDatum }>;
}) => {
  if (!active || !payload?.length) return null;

  return (
    <div className="bg-default border-subtle rounded-lg border p-3 text-sm shadow-lg">
      <p className="text-default font-medium">{payload[0].payload.formattedDateFull}</p>
      {payload.map((entry) => (
        <p key={entry.name} style={{ color: entry.color }}>
          {entry.name}: {valueFormatter(entry.value)}
        </p>
      ))}
    </div>
  );
};

export function EventsOverviewChart({ data = SAMPLE_EVENTS }: { data?: EventsOverviewDatum[] }) {
  const { t } = useLocale();
  const { enabledLegend, toggleSeries } = useToggleableLegend(legend);

  const totalCreated = data.reduce((sum, d) => sum + d.Created, 0);
  const first = data[0]?.Created ?? 0;
  const last = data[data.length - 1]?.Created ?? 0;
  const growth = first > 0 ? Math.round(((last - first) / first) * 100) : 0;

  return (
    <ChartCard
      title={
        <div className="mr-4 flex shrink-0 items-center gap-2">
          <h2 className="text-emphasis shrink-0 text-sm font-semibold">{t("event_trends")}</h2>
          <Badge variant="gray">{t("sample_data")}</Badge>
        </div>
      }
      legend={legend}
      enabledLegend={enabledLegend}
      onSeriesToggle={toggleSeries}>
      <div className="flex items-baseline gap-3 px-4 pt-4">
        <span className="text-emphasis font-cal text-2xl font-semibold">{valueFormatter(totalCreated)}</span>
        <span className="text-subtle text-sm">{t("events_created")}</span>
        <Badge variant={growth >= 0 ? "success" : "error"}>
          {growth >= 0 ? "+" : ""}
          {growth}%
        </Badge>
      </div>
      <div className="ml-4 h-64 sm:ml-0">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
            <defs>
              {legend.map((item) => (
                <linearGradient
                  key={item.label}
                  id={`events-overview-${item.label}`}
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1">
                  <stop offset="0%" stopColor={item.color} stopOpacity={0.25} />
                  <stop offset="100%" stopColor={item.color} stopOpacity={0} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="Month" className="text-xs" axisLine={false} tickLine={false} />
            <YAxis
              allowDecimals={false}
              className="text-xs opacity-50"
              axisLine={false}
              tickLine={false}
              tickFormatter={valueFormatter}
            />
            <Tooltip content={<SummaryTooltip />} />
            {enabledLegend.map((item) => (
              <Area
                key={item.label}
                type="monotone"
                dataKey={item.label}
                name={item.label}
                stroke={item.color}
                strokeWidth={2}
                fill={`url(#events-overview-${item.label})`}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
}
