"use client";

import { useLocale } from "@calcom/lib/hooks/useLocale";
import { trpc } from "@calcom/trpc/react";
import { SkeletonText } from "@calcom/ui/components/skeleton";

import { useInsightsBookingParameters } from "@calcom/web/modules/insights/hooks/useInsightsBookingParameters";
import { KPICard } from "../KPICard";

export const BookingKPICards = () => {
  const { t } = useLocale();
  const insightsBookingParams = useInsightsBookingParameters();

  const { data, isSuccess, isPending, isError } = trpc.viewer.insights.bookingKPIStats.useQuery(
    insightsBookingParams,
    {
      staleTime: 180000,
      refetchOnWindowFocus: false,
      trpc: {
        context: { skipBatch: true },
      },
    }
  );

  const eventCategories: {
    title: string;
    index: "created" | "completed" | "rescheduled" | "cancelled";
  }[] = [
    {
      title: t("events_created"),
      index: "created",
    },
    {
      title: t("events_completed"),
      index: "completed",
    },
    {
      title: t("events_rescheduled"),
      index: "rescheduled",
    },
    {
      title: t("events_cancelled"),
      index: "cancelled",
    },
  ];

  const performanceCategories: {
    title: string;
    index: "rating" | "no_show" | "no_show_guest" | "csat";
  }[] = [
    {
      title: t("event_ratings"),
      index: "rating",
    },
    {
      title: t("event_no_show"),
      index: "no_show",
    },
    {
      title: t("event_no_show_guest"),
      index: "no_show_guest",
    },
    {
      title: t("csat_score"),
      index: "csat",
    },
  ];

  if (isPending) {
    return (
      <LoadingKPICards eventCategories={eventCategories} performanceCategories={performanceCategories} />
    );
  }

  if (!isSuccess || !data) return null;

  return (
    <StatStrip>
      <StatGroup title={t("events")}>
        {eventCategories.map((item) => (
          <StatItem key={item.title}>
            <KPICard
              title={item.title}
              previousMetricData={data[item.index]}
              previousDateRange={data.previousRange}
            />
          </StatItem>
        ))}
      </StatGroup>
      <StatGroup title={t("performance")}>
        {performanceCategories.map((item) => (
          <StatItem key={item.title}>
            <KPICard
              title={item.title}
              previousMetricData={data[item.index]}
              previousDateRange={data.previousRange}
            />
          </StatItem>
        ))}
      </StatGroup>
    </StatStrip>
  );
};

const LoadingKPICards = (props: {
  eventCategories: { title: string; index: string }[];
  performanceCategories: { title: string; index: string }[];
}) => {
  const { eventCategories, performanceCategories } = props;
  const { t } = useLocale();

  const renderSkeleton = (item: { title: string }) => (
    <StatItem key={item.title}>
      <SkeletonText className="mb-1.5 h-3 w-20" />
      <SkeletonText className="h-6 w-12" />
      <SkeletonText className="mt-1.5 h-3 w-16" />
    </StatItem>
  );

  return (
    <StatStrip>
      <StatGroup title={t("events")}>{eventCategories.map(renderSkeleton)}</StatGroup>
      <StatGroup title={t("performance")}>{performanceCategories.map(renderSkeleton)}</StatGroup>
    </StatStrip>
  );
};

// StatStrip: a single horizontal strip holding every KPI group
function StatStrip({ children }: { children: React.ReactNode }) {
  return (
    <div
      data-testid="insights-kpi-strip"
      className="bg-cal-muted flex w-full flex-col gap-1 rounded-2xl p-1 xl:flex-row">
      {children}
    </div>
  );
}

// StatGroup: a labelled set of compact stats within the strip
function StatGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="bg-default border-muted flex min-w-0 flex-1 flex-col rounded-xl border">
      <h2 className="text-subtle px-3 pt-2 text-xs font-medium uppercase tracking-wide">{title}</h2>
      <div className="divide-muted grid grid-cols-2 sm:grid-cols-4 sm:divide-x">{children}</div>
    </section>
  );
}

// StatItem: a single compact stat cell
function StatItem({ children }: { children: React.ReactNode }) {
  return <div className="min-w-0 px-3 py-2">{children}</div>;
}
