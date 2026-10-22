"use client";

import React from "react";
import {
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import { useLocale } from "@calcom/lib/hooks/useLocale";
import { trpc } from "@calcom/trpc/react";
import type { RouterOutputs } from "@calcom/trpc/react";

import { useInsightsBookingParameters } from "@calcom/web/modules/insights/hooks/useInsightsBookingParameters";
import { useToggleableLegend } from "@calcom/web/modules/insights/hooks/useToggleableLegend";
import { valueFormatter } from "@calcom/features/insights/lib/valueFormatter";
import { ChartCard } from "../ChartCard";

const COLOR = {
  CREATED: "#a855f7",
  COMPLETED: "#22c55e",
  RESCHEDULED: "#3b82f6",
  CANCELLED: "#ef4444",
  NO_SHOW_HOST: "#64748b",
  NO_SHOW_GUEST: "#f97316",
};

export const legend = [
  { label: "Created", color: COLOR.CREATED },
  { label: "Completed", color: COLOR.COMPLETED },
  { label: "Rescheduled", color: COLOR.RESCHEDULED },
  { label: "Cancelled", color: COLOR.CANCELLED },
  { label: "No-Show (Host)", color: COLOR.NO_SHOW_HOST },
  { label: "No-Show (Guest)", color: COLOR.NO_SHOW_GUEST },
];

// Series that get an ordered-dither fill beneath their line
const DITHERED_SERIES = new Set(["Created", "Completed"]);

// 4x4 Bayer matrix used for ordered dithering
const BAYER_4X4 = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5],
];

const CONFIG_ID = "EventTrendsChart-controls";

type EventTrendsData = RouterOutputs["viewer"]["insights"]["eventTrends"][number];

// Custom Tooltip component
const CustomTooltip = ({
  active,
  payload,
  label: _label,
}: {
  active?: boolean;
  payload?: Array<{
    value: number;
    dataKey: string;
    name: string;
    color: string;
    payload: EventTrendsData;
  }>;
  label?: string;
}) => {
  if (!active || !payload?.length) {
    return null;
  }

  return (
    <div className="bg-default text-inverted border-subtle rounded-lg border p-3 shadow-lg">
      <p className="text-default font-medium">{payload[0].payload.formattedDateFull}</p>
      {payload.map((entry, index: number) => (
        <p key={index} style={{ color: entry.color }}>
          {entry.name}: {valueFormatter ? valueFormatter(entry.value) : entry.value}
        </p>
      ))}
    </div>
  );
};

const DitherPattern = ({
  id,
  color,
  density,
  pixelSize,
}: {
  id: string;
  color: string;
  density: number;
  pixelSize: number;
}) => {
  const size = pixelSize * 4;
  return (
    <pattern id={id} width={size} height={size} patternUnits="userSpaceOnUse">
      {BAYER_4X4.flatMap((row, y) =>
        row.map((threshold, x) =>
          threshold < density ? (
            <rect
              key={`${x}-${y}`}
              x={x * pixelSize}
              y={y * pixelSize}
              width={pixelSize}
              height={pixelSize}
              fill={color}
              shapeRendering="crispEdges"
            />
          ) : null
        )
      )}
    </pattern>
  );
};

export const EventTrendsChart = () => {
  const { t } = useLocale();
  const insightsBookingParams = useInsightsBookingParameters();
  const { enabledLegend, toggleSeries } = useToggleableLegend(legend);
  const patternPrefix = `dither-${React.useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;

  const [ditherDensity, setDitherDensity] = React.useState(8);
  const [ditherPixelSize, setDitherPixelSize] = React.useState(4);
  const [shineEnabled, setShineEnabled] = React.useState(true);
  const [shineSpeed, setShineSpeed] = React.useState(7);
  const [shineIntensity, setShineIntensity] = React.useState(0.6);
  const [shineColor, setShineColor] = React.useState("#ffffff");

  const {
    data: eventTrends,
    isSuccess,
    isPending,
    isError,
  } = trpc.viewer.insights.eventTrends.useQuery(insightsBookingParams, {
    staleTime: 180000,
    refetchOnWindowFocus: false,
    trpc: {
      context: { skipBatch: true },
    },
  });

  // geneditor-listener-start
  React.useEffect(() => {
    const el = document.querySelector(`[data-config-id="${CONFIG_ID}"]`);
    if (!el) return;
    const handler = (e: Event) => {
      const p = (e as CustomEvent).detail as Record<string, unknown>;
      if (typeof p.ditherDensity === "number") setDitherDensity(p.ditherDensity);
      if (typeof p.ditherPixelSize === "number") setDitherPixelSize(p.ditherPixelSize);
      if (typeof p.shineEnabled === "boolean") setShineEnabled(p.shineEnabled);
      if (typeof p.shineSpeed === "number") setShineSpeed(p.shineSpeed);
      if (typeof p.shineIntensity === "number") setShineIntensity(p.shineIntensity);
      if (typeof p.shineColor === "string") setShineColor(p.shineColor);
    };
    el.addEventListener("animation:update", handler);
    return () => el.removeEventListener("animation:update", handler);
  }, [isSuccess]);
  // geneditor-listener-end

  const ditheredSeries = enabledLegend.filter((item) => DITHERED_SERIES.has(item.label));
  const patternId = (label: string) => `${patternPrefix}-${label.replace(/[^a-zA-Z0-9]/g, "")}`;

  return (
    <ChartCard
      title={t("event_trends")}
      legend={legend}
      enabledLegend={enabledLegend}
      onSeriesToggle={toggleSeries}
      isPending={isPending}
      isError={isError}>
      {isSuccess ? (
        <div data-config-id={CONFIG_ID} className="linechart relative ml-4 mt-4 h-80 sm:ml-0">
          <style>{`
            @keyframes eventTrendsShine {
              0% { transform: translateX(-100%) skewX(-20deg); }
              100% { transform: translateX(350%) skewX(-20deg); }
            }
            @media (prefers-reduced-motion: reduce) {
              .event-trends-shine { animation: none !important; opacity: 0 !important; }
            }
          `}</style>
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={eventTrends ?? []} margin={{ top: 30, right: 20, left: 0, bottom: 0 }}>
              <defs>
                {ditheredSeries.map((item) => (
                  <DitherPattern
                    key={item.label}
                    id={patternId(item.label)}
                    color={item.color}
                    density={ditherDensity}
                    pixelSize={ditherPixelSize}
                  />
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
              <Tooltip content={<CustomTooltip />} />
              {ditheredSeries.map((item) => (
                <Area
                  key={`area-${item.label}`}
                  type="linear"
                  dataKey={item.label}
                  name={item.label}
                  stroke="none"
                  fill={`url(#${patternId(item.label)})`}
                  fillOpacity={1}
                  tooltipType="none"
                  activeDot={false}
                  legendType="none"
                  animationDuration={1000}
                />
              ))}
              {enabledLegend.map((item) => (
                <Line
                  key={item.label}
                  type="linear"
                  dataKey={item.label}
                  name={item.label}
                  stroke={item.color}
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                  animationDuration={1000}
                />
              ))}
            </ComposedChart>
          </ResponsiveContainer>
          {shineEnabled ? (
            <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
              <div
                className="event-trends-shine absolute inset-y-0 left-0 w-1/3"
                style={{
                  opacity: shineIntensity,
                  background: `linear-gradient(90deg, transparent 0%, ${shineColor} 50%, transparent 100%)`,
                  animation: `eventTrendsShine ${shineSpeed}s ease-in-out infinite`,
                }}
              />
            </div>
          ) : null}
        </div>
      ) : null}
    </ChartCard>
  );
};
