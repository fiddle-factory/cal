"use client";

import { useLocale } from "@calcom/lib/hooks/useLocale";
import classNames from "@calcom/ui/classNames";
import { Badge } from "@calcom/ui/components/badge";
import { Button } from "@calcom/ui/components/button";

const BOOKING_HOURS = [
  { hour: "08hr", count: 12 },
  { hour: "09hr", count: 24 },
  { hour: "10hr", count: 32 },
  { hour: "11hr", count: 32 },
  { hour: "12hr", count: 8 },
  { hour: "13hr", count: 12 },
  { hour: "14hr", count: 32 },
  { hour: "15hr", count: 40 },
  { hour: "16hr", count: 12 },
];

const NO_SHOW_MEMBERS = ["Jordan Cook", "James Corcoran"];

const ringColor = (count: number) => {
  if (count >= 36) return "border-red-400";
  if (count >= 24) return "border-orange-400";
  return "border-emerald-400";
};

/** Static, always-light illustration of the Insights dashboard used in the upsell card. */
function InsightsPreviewIllustration() {
  const { t } = useLocale();

  return (
    <div
      aria-hidden="true"
      className="flex h-full select-none flex-col gap-3 bg-white p-4 pr-0 text-gray-500">
      <div className="h-14 rounded-l-lg border border-r-0 border-gray-100" />

      <div className="rounded-l-lg border border-r-0 border-gray-100 p-4 pr-2">
        <p className="mb-4 text-xs font-medium text-gray-700">{t("booking_hours_by_available_hours")}</p>
        <div className="grid grid-cols-9 gap-1 text-center text-[9px] text-gray-400">
          {BOOKING_HOURS.map(({ hour, count }) => (
            <div key={hour} className="flex flex-col items-center">
              <span>{count}</span>
              <div className="flex h-40 flex-col items-center justify-center">
                {Array.from({ length: Math.max(2, Math.round(count / 2.5)) }).map((_, i) => (
                  <span
                    key={i}
                    className={classNames("-mt-0.5 h-1.5 w-3 rounded-full border bg-white", ringColor(count))}
                  />
                ))}
              </div>
              <span>{hour}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-l-lg border border-r-0 border-gray-100 p-4">
        <p className="mb-3 text-xs font-medium text-gray-700">{t("no_show")}</p>
        <ul className="flex flex-col gap-3">
          {NO_SHOW_MEMBERS.map((name) => (
            <li key={name} className="flex items-center gap-2 text-[10px] text-gray-400">
              <span className="h-3 w-3 rounded-full bg-gray-300" />
              {name}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/** Shown on the Insights page to users without a Teams/Orgs plan. */
export function InsightsUpsell() {
  const { t } = useLocale();

  const features = [
    t("understand_booking_volume_and_cancellations"),
    t("see_how_meetings_are_distributed_across_team_members"),
    t("spot_trends_that_help_you_improve_availability_and_routing"),
  ];

  return (
    <div className="bg-muted flex min-h-[calc(100vh-14rem)] items-center justify-center rounded-2xl p-4 sm:p-8">
      <div className="bg-default border-subtle flex w-full max-w-3xl flex-col overflow-hidden rounded-3xl border md:flex-row md:py-6">
        <div className="flex flex-1 flex-col p-6 md:py-2 md:pl-8 md:pr-2">
          <div className="bg-emphasis text-emphasis mb-3 w-fit rounded-md px-2 py-1 text-xs leading-3">
            {t("insights")}
          </div>
          <h2 className="font-heading text-emphasis text-xl font-semibold leading-6">
            {t("see_whats_getting_booked_and_whats_not")}
          </h2>
          <p className="text-default mt-2 text-sm leading-5">{t("insights_upsell_description")}</p>
          <ul className="text-default mt-4 flex list-inside list-disc flex-col gap-2 text-sm">
            {features.map((feature) => (
              <li key={feature}>{feature}</li>
            ))}
          </ul>

          <div className="mt-8 flex items-center gap-2 border-b border-dashed border-subtle pb-4 md:mt-auto">
            <span className="text-default text-sm">{t("available_on")}</span>
            <Badge variant="orange">{t("teams")}</Badge>
            <Badge variant="purple">{t("orgs")}</Badge>
          </div>

          <div className="mt-6 flex items-center gap-2">
            <Button color="secondary" EndIcon="arrow-right" href="/settings/teams/new">
              {t("try_for_free")}
            </Button>
            <Button color="minimal" href="https://go.cal.com/insights" target="_blank">
              {t("learn_more")}
            </Button>
          </div>
        </div>

        <div className="hidden w-[45%] shrink-0 overflow-hidden rounded-l-xl md:block">
          <InsightsPreviewIllustration />
        </div>
      </div>
    </div>
  );
}
