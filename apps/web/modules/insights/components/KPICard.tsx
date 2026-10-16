"use client";

import { useLocale } from "@calcom/lib/hooks/useLocale";
import { Badge } from "@calcom/ui/components/badge";
import { Icon } from "@calcom/ui/components/icon";
import { Tooltip } from "@calcom/ui/components/tooltip";

import { calculateDeltaType, valueFormatter } from "@calcom/features/insights/lib";

export const KPICard = ({
  title,
  previousMetricData,
  previousDateRange,
}: {
  title: string;
  previousMetricData: {
    count: number;
    deltaPrevious: number;
  };
  previousDateRange: { startDate: string; endDate: string };
}) => {
  const { t } = useLocale();

  const deltaType = calculateDeltaType(previousMetricData.deltaPrevious - previousMetricData.count);
  const deltaValue = Number(previousMetricData.deltaPrevious).toFixed(0);

  const getBadgeVariant = (type: string) => {
    switch (type) {
      case "increase":
      case "moderateIncrease":
        return "success" as const;
      case "decrease":
      case "moderateDecrease":
        return "error" as const;
      case "unchanged":
      default:
        return "gray" as const;
    }
  };

  // Get appropriate icon for delta
  const getDeltaIcon = (type: string) => {
    switch (type) {
      case "increase":
      case "moderateIncrease":
        return "arrow-up" as const;
      case "decrease":
      case "moderateDecrease":
        return "arrow-down" as const;
      case "unchanged":
      default:
        return null;
    }
  };

  const badgeVariant = getBadgeVariant(deltaType);
  const deltaIcon = getDeltaIcon(deltaType);

  return (
    <div className="min-w-0">
      <div className="text-default truncate text-xs" title={title}>
        {title}
      </div>
      <div className="mt-0.5 flex items-baseline gap-2">
        <div className="text-emphasis text-xl font-semibold leading-tight">
          {valueFormatter(previousMetricData.count)}
        </div>
        <Badge variant={badgeVariant} size="sm" className="flex items-center gap-0.5">
          {deltaIcon && <Icon name={deltaIcon} className="h-3 w-3" />}
          {deltaValue}%
        </Badge>
      </div>
      <Tooltip
        content={t("from_to_date_period", {
          startDate: previousDateRange.startDate,
          endDate: previousDateRange.endDate,
        })}>
        <small className="text-muted inline-block max-w-full cursor-pointer truncate text-[11px] leading-tight">
          {t("from_last_period")}
        </small>
      </Tooltip>
    </div>
  );
};
