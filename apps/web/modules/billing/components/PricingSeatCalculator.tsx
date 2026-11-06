"use client";

import { useState } from "react";

import { useLocale } from "@calcom/lib/hooks/useLocale";
import classNames from "@calcom/ui/classNames";
import { Badge } from "@calcom/ui/components/badge";
import { Button } from "@calcom/ui/components/button";
import { Input } from "@calcom/ui/components/form";
import { Icon } from "@calcom/ui/components/icon";
import type { IconName } from "@calcom/ui/components/icon";
import { SegmentedControl } from "@calcom/ui/components/segmented-control";

type BillingPeriod = "monthly" | "yearly";
type PlanId = "free" | "teams" | "organizations" | "enterprise";

type Plan = {
  id: PlanId;
  icon: IconName;
  /** Price per seat per month, in USD, for each billing period. `null` means custom quote. */
  pricePerSeat: Record<BillingPeriod, number> | null;
};

const MIN_SEATS = 1;
const MAX_SEATS = 150;
const ENTERPRISE_SEAT_THRESHOLD = 100;
const ORGANIZATIONS_SEAT_THRESHOLD = 30;
const YEARLY_DISCOUNT_PERCENT = 20;

const PLANS: Record<PlanId, Plan> = {
  free: { id: "free", icon: "user", pricePerSeat: { monthly: 0, yearly: 0 } },
  teams: { id: "teams", icon: "users", pricePerSeat: { monthly: 15, yearly: 12 } },
  organizations: { id: "organizations", icon: "building", pricePerSeat: { monthly: 37, yearly: 28 } },
  enterprise: { id: "enterprise", icon: "shield-check", pricePerSeat: null },
};

export function getRecommendedPlan(seats: number): Plan {
  if (seats >= ENTERPRISE_SEAT_THRESHOLD) return PLANS.enterprise;
  if (seats >= ORGANIZATIONS_SEAT_THRESHOLD) return PLANS.organizations;
  if (seats > 1) return PLANS.teams;
  return PLANS.free;
}

const clampSeats = (value: number) => Math.min(MAX_SEATS, Math.max(MIN_SEATS, Math.round(value)));

const formatUsd = (value: number) => value.toLocaleString("en-US", { maximumFractionDigits: 0 });

export type PricingSeatCalculatorProps = {
  defaultSeats?: number;
  defaultBillingPeriod?: BillingPeriod;
};

export function PricingSeatCalculator({
  defaultSeats = 8,
  defaultBillingPeriod = "yearly",
}: PricingSeatCalculatorProps) {
  const { t } = useLocale();
  const [seats, setSeats] = useState(() => clampSeats(defaultSeats));
  const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>(defaultBillingPeriod);

  const plan = getRecommendedPlan(seats);
  const pricePerSeat = plan.pricePerSeat?.[billingPeriod] ?? null;
  const monthlyTotal = pricePerSeat === null ? null : pricePerSeat * seats;
  const periodTotal =
    monthlyTotal === null ? null : billingPeriod === "yearly" ? monthlyTotal * 12 : monthlyTotal;
  const seatLabel = seats === 1 ? t("pricing_single_seat") : t("pricing_seat_count", { count: seats });

  const freeFeatures = [
    "pricing_feature_unlimited_event_types",
    "pricing_feature_calendar_integrations",
    "pricing_feature_workflows_basic",
  ];
  const paidFeatures = [
    "pricing_feature_everything_free",
    "pricing_feature_round_robin",
    "pricing_feature_routing_forms",
    "pricing_feature_insights",
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        {/* Controls */}
        <div className="border-subtle bg-default flex flex-col rounded-xl border lg:col-span-3">
          <section className="border-subtle border-b p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-emphasis text-base font-semibold leading-6">{t("pricing_team_size")}</h2>
                <p className="text-subtle mt-1 text-sm">{t("pricing_team_size_description")}</p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <Button
                  variant="icon"
                  color="secondary"
                  StartIcon="chevron-left"
                  aria-label={t("pricing_decrease_seats")}
                  disabled={seats <= MIN_SEATS}
                  onClick={() => setSeats((current) => clampSeats(current - 1))}
                />
                <Input
                  type="number"
                  inputMode="numeric"
                  min={MIN_SEATS}
                  max={MAX_SEATS}
                  value={seats}
                  isFullWidth={false}
                  aria-label={t("pricing_team_size")}
                  className="mb-0 w-16 text-center tabular-nums"
                  onChange={(event) => {
                    const next = Number(event.target.value);
                    if (!Number.isNaN(next)) setSeats(clampSeats(next));
                  }}
                />
                <Button
                  variant="icon"
                  color="secondary"
                  StartIcon="chevron-right"
                  aria-label={t("pricing_increase_seats")}
                  disabled={seats >= MAX_SEATS}
                  onClick={() => setSeats((current) => clampSeats(current + 1))}
                />
              </div>
            </div>
            <div className="mt-6">
              <input
                type="range"
                min={MIN_SEATS}
                max={MAX_SEATS}
                step={1}
                value={seats}
                aria-label={t("pricing_team_size")}
                onChange={(event) => setSeats(clampSeats(Number(event.target.value)))}
                className="accent-brand-default h-2 w-full cursor-pointer"
              />
              <div className="text-muted mt-2 flex justify-between text-xs tabular-nums">
                <span>{MIN_SEATS}</span>
                <span>{ORGANIZATIONS_SEAT_THRESHOLD}</span>
                <span>{ENTERPRISE_SEAT_THRESHOLD}</span>
                <span>{MAX_SEATS}+</span>
              </div>
            </div>
          </section>
          <section className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-emphasis text-base font-semibold leading-6">
                {t("pricing_billing_period")}
              </h2>
              <p className="text-subtle mt-1 text-sm">{t("pricing_billing_period_description")}</p>
            </div>
            <div className="flex items-center gap-3">
              <SegmentedControl<BillingPeriod>
                className="w-48"
                data={[
                  { value: "monthly", label: t("monthly") },
                  { value: "yearly", label: t("yearly") },
                ]}
                value={billingPeriod}
                onChange={setBillingPeriod}
              />
              <Badge variant="success">{t("pricing_save_percent", { percent: YEARLY_DISCOUNT_PERCENT })}</Badge>
            </div>
          </section>
        </div>

        {/* Summary */}
        <aside
          aria-live="polite"
          className="border-subtle bg-muted flex flex-col rounded-xl border p-6 lg:col-span-2">
          <p className="text-subtle text-xs font-semibold uppercase tracking-wide">
            {t("pricing_recommended_plan")}
          </p>
          <div className="mt-3 flex items-center gap-3">
            <div className="bg-emphasis text-emphasis flex h-10 w-10 items-center justify-center rounded-lg">
              <Icon name={plan.icon} className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-heading text-emphasis text-xl">{t(`pricing_plan_${plan.id}`)}</h3>
                {plan.id === "teams" && <Badge variant="blue">{t("pricing_most_popular")}</Badge>}
              </div>
              <p className="text-subtle text-sm">{seatLabel}</p>
            </div>
          </div>
          <p className="text-default mt-4 text-sm">{t(`pricing_plan_${plan.id}_description`)}</p>

          <div className="border-subtle mt-6 border-t pt-6">
            {periodTotal === null ? (
              <>
                <p className="text-subtle text-sm">{t("pricing_total_per_month")}</p>
                <p className="font-heading text-emphasis mt-1 text-3xl">{t("pricing_custom_quote")}</p>
                <p className="text-subtle mt-1 text-sm">{t("pricing_custom_quote_note")}</p>
              </>
            ) : (
              <>
                <p className="text-subtle text-sm">
                  {billingPeriod === "yearly" ? t("pricing_total_per_year") : t("pricing_total_per_month")}
                </p>
                <p className="font-heading text-emphasis mt-1 text-4xl tabular-nums">
                  ${formatUsd(periodTotal)}
                </p>
                {pricePerSeat !== null && pricePerSeat > 0 && (
                  <p className="text-subtle mt-1 text-sm tabular-nums">
                    {billingPeriod === "yearly"
                      ? t("pricing_billed_yearly_note", { monthly: formatUsd(monthlyTotal ?? 0) })
                      : t("pricing_billed_monthly_note", { seats, price: pricePerSeat })}
                  </p>
                )}
                {pricePerSeat !== null && (
                  <p className="text-muted mt-1 text-xs tabular-nums">
                    {t("pricing_per_seat_per_month", { price: pricePerSeat })}
                  </p>
                )}
              </>
            )}
          </div>

          <div className="mt-auto pt-6">
            {plan.id === "enterprise" ? (
              <Button className="w-full justify-center" EndIcon="arrow-right">
                {t("contact_sales")}
              </Button>
            ) : (
              <Button className="w-full justify-center" EndIcon="arrow-right">
                {plan.id === "free" ? t("pricing_start_free") : t("pricing_start_trial")}
              </Button>
            )}
          </div>
        </aside>
      </div>

      {/* Free vs Paid */}
      <section>
        <div className="mb-4">
          <h2 className="text-emphasis text-base font-semibold leading-6">{t("pricing_free_vs_paid")}</h2>
          <p className="text-subtle mt-1 text-sm">{t("pricing_free_vs_paid_description")}</p>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <PlanHighlight
            title={t("pricing_plan_free")}
            price={t("pricing_free_plan_price")}
            features={freeFeatures.map((key) => t(key))}
            active={plan.id === "free"}
          />
          <PlanHighlight
            title={t("pricing_plan_teams")}
            price={t("pricing_paid_plan_price", { price: PLANS.teams.pricePerSeat?.yearly ?? 0 })}
            features={paidFeatures.map((key) => t(key))}
            active={plan.id !== "free"}
            badge={t("pricing_most_popular")}
          />
        </div>
      </section>

      {/* Enterprise banner */}
      <section className="bg-inverted flex flex-col gap-4 rounded-xl p-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-4">
          <div className="bg-default text-emphasis flex h-10 w-10 shrink-0 items-center justify-center rounded-lg">
            <Icon name="building" className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-inverted text-base font-semibold leading-6">
              {t("pricing_enterprise_banner_title")}
            </h2>
            <p className="text-inverted mt-1 text-sm opacity-80">
              {t("pricing_enterprise_banner_description")}
            </p>
          </div>
        </div>
        <Button color="secondary" EndIcon="arrow-right" className="shrink-0">
          {t("contact_sales")}
        </Button>
      </section>
    </div>
  );
}

function PlanHighlight({
  title,
  price,
  features,
  active,
  badge,
}: {
  title: string;
  price: string;
  features: string[];
  active: boolean;
  badge?: string;
}) {
  return (
    <div
      className={classNames(
        "bg-default rounded-xl border p-6 transition",
        active ? "border-emphasis shadow-sm" : "border-subtle"
      )}>
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-emphasis text-base font-semibold">{title}</h3>
        {badge && <Badge variant="gray">{badge}</Badge>}
      </div>
      <p className="text-subtle mt-1 text-sm">{price}</p>
      <ul className="mt-4 space-y-2">
        {features.map((feature) => (
          <li key={feature} className="text-default flex items-center gap-2 text-sm">
            <Icon name="check" className="text-success h-4 w-4 shrink-0" />
            {feature}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default PricingSeatCalculator;
