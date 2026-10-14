"use client";

import { useSession } from "next-auth/react";

import { useLocale } from "@calcom/lib/hooks/useLocale";
import { InsightsUpsell } from "@calcom/web/modules/insights/components/InsightsUpsell";

import { UpgradeTip } from "~/shell/UpgradeTip";

export default function UpgradeTipWrapper({ children }: { children: React.ReactNode }) {
  const { t } = useLocale();
  const session = useSession();

  return (
    <UpgradeTip
      plan="team"
      title={t("make_informed_decisions")}
      description={t("make_informed_decisions_description")}
      features={[]}
      background="/tips/insights"
      lockedView={<InsightsUpsell />}>
      {!session.data?.user ? null : children}
    </UpgradeTip>
  );
}
