"use client";

import { useState } from "react";

import { useLocale } from "@calcom/lib/hooks/useLocale";
import classNames from "@calcom/ui/classNames";
import { Badge } from "@calcom/ui/components/badge";
import { Button } from "@calcom/ui/components/button";
import { Icon } from "@calcom/ui/components/icon";
import type { IconName } from "@calcom/ui/components/icon";
import SegmentedControl from "@calcom/ui/components/segmented-control/SegmentedControl";

export type PlanId = "individual" | "teams" | "organizations" | "enterprise";
export type BillingPeriod = "monthly" | "annual";
export type PlanSelectionStep = "select" | "confirm" | "complete";

type Plan = {
  id: PlanId;
  icon: IconName;
  nameKey: string;
  descriptionKey: string;
  /** Price per seat per month, in USD. `null` means custom pricing. */
  price: { monthly: number; annual: number } | null;
  perSeat: boolean;
  ctaKey: string;
  featuresHeadingKey: string;
  featureKeys: string[];
};

export const PLANS: Plan[] = [
  {
    id: "individual",
    icon: "user",
    nameKey: "plan_selection_individual",
    descriptionKey: "plan_selection_individual_description",
    price: { monthly: 0, annual: 0 },
    perSeat: false,
    ctaKey: "plan_selection_individual_cta",
    featuresHeadingKey: "plan_selection_free_forever",
    featureKeys: [
      "plan_selection_feature_unlimited_event_types",
      "plan_selection_feature_unlimited_calendars",
      "plan_selection_feature_workflows",
      "plan_selection_feature_integrations",
      "plan_selection_feature_cal_video",
    ],
  },
  {
    id: "teams",
    icon: "users",
    nameKey: "plan_selection_teams",
    descriptionKey: "plan_selection_teams_description",
    price: { monthly: 15, annual: 12 },
    perSeat: true,
    ctaKey: "plan_selection_teams_cta",
    featuresHeadingKey: "plan_selection_everything_in_individual",
    featureKeys: [
      "plan_selection_feature_round_robin",
      "plan_selection_feature_collective_events",
      "plan_selection_feature_routing_forms",
      "plan_selection_feature_team_workflows",
      "plan_selection_feature_insights",
    ],
  },
  {
    id: "organizations",
    icon: "building",
    nameKey: "plan_selection_organizations",
    descriptionKey: "plan_selection_organizations_description",
    price: { monthly: 37, annual: 30 },
    perSeat: true,
    ctaKey: "plan_selection_organizations_cta",
    featuresHeadingKey: "plan_selection_everything_in_teams",
    featureKeys: [
      "plan_selection_feature_subdomain",
      "plan_selection_feature_unlimited_teams",
      "plan_selection_feature_sso",
      "plan_selection_feature_attribute_routing",
      "plan_selection_feature_admin_panel",
    ],
  },
  {
    id: "enterprise",
    icon: "shield",
    nameKey: "plan_selection_enterprise",
    descriptionKey: "plan_selection_enterprise_description",
    price: null,
    perSeat: true,
    ctaKey: "contact_sales",
    featuresHeadingKey: "plan_selection_everything_in_organizations",
    featureKeys: [
      "plan_selection_feature_dedicated_support",
      "plan_selection_feature_sla",
      "plan_selection_feature_compliance",
      "plan_selection_feature_custom_contracts",
      "plan_selection_feature_dsync",
    ],
  },
];

const ANNUAL_DISCOUNT_PERCENT = 20;

const formatPrice = (amount: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: amount % 1 === 0 ? 0 : 2,
  }).format(amount);

export type PlanSelectionFlowProps = {
  defaultBillingPeriod?: BillingPeriod;
  defaultSelectedPlan?: PlanId | null;
  defaultStep?: PlanSelectionStep;
  recommendedPlan?: PlanId;
  seats?: number;
  onConfirm?: (selection: { plan: PlanId; billingPeriod: BillingPeriod; seats: number }) => void;
  className?: string;
};

export function PlanSelectionFlow({
  defaultBillingPeriod = "monthly",
  defaultSelectedPlan = null,
  defaultStep = "select",
  recommendedPlan = "teams",
  seats = 5,
  onConfirm,
  className,
}: PlanSelectionFlowProps) {
  const { t } = useLocale();
  const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>(defaultBillingPeriod);
  const [selectedPlanId, setSelectedPlanId] = useState<PlanId | null>(defaultSelectedPlan);
  const [step, setStep] = useState<PlanSelectionStep>(
    defaultSelectedPlan ? defaultStep : "select"
  );

  const selectedPlan = PLANS.find((plan) => plan.id === selectedPlanId) ?? null;

  const handleConfirm = () => {
    if (!selectedPlan) return;
    onConfirm?.({ plan: selectedPlan.id, billingPeriod, seats });
    setStep("complete");
  };

  return (
    <div className={classNames("bg-default w-full px-4 py-10 sm:px-8", className)}>
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <StepIndicator step={step} />
        {step === "select" && (
          <SelectPlanStep
            billingPeriod={billingPeriod}
            onBillingPeriodChange={setBillingPeriod}
            selectedPlanId={selectedPlanId}
            onSelectPlan={setSelectedPlanId}
            recommendedPlan={recommendedPlan}
            onContinue={() => setStep("confirm")}
          />
        )}
        {step === "confirm" && selectedPlan && (
          <ConfirmPlanStep
            plan={selectedPlan}
            billingPeriod={billingPeriod}
            onBillingPeriodChange={setBillingPeriod}
            seats={seats}
            onBack={() => setStep("select")}
            onConfirm={handleConfirm}
          />
        )}
        {step === "complete" && selectedPlan && (
          <div className="bg-cal-muted mx-auto w-full max-w-xl rounded-2xl p-1">
            <div className="bg-default border-subtle flex flex-col items-center rounded-xl border px-6 py-10 text-center">
              <div className="bg-cal-success text-success flex h-12 w-12 items-center justify-center rounded-full">
                <Icon name="check" className="h-6 w-6" />
              </div>
              <h2 className="font-heading text-emphasis mt-4 text-2xl">
                {t("plan_selection_complete_title", { plan: t(selectedPlan.nameKey) })}
              </h2>
              <p className="text-subtle mt-2 max-w-sm text-sm">{t("plan_selection_complete_description")}</p>
              <div className="mt-6 flex gap-2">
                <Button color="secondary" onClick={() => setStep("select")}>
                  {t("plan_selection_change_plan")}
                </Button>
                <Button color="primary" EndIcon="arrow-right">
                  {t("plan_selection_go_to_dashboard")}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StepIndicator({ step }: { step: PlanSelectionStep }) {
  const { t } = useLocale();
  const steps: { id: PlanSelectionStep; labelKey: string }[] = [
    { id: "select", labelKey: "plan_selection_step_choose" },
    { id: "confirm", labelKey: "plan_selection_step_review" },
    { id: "complete", labelKey: "plan_selection_step_done" },
  ];
  const activeIndex = steps.findIndex((s) => s.id === step);

  return (
    <ol className="flex items-center justify-center gap-2 text-sm">
      {steps.map((s, index) => {
        const isDone = index < activeIndex;
        const isActive = index === activeIndex;
        return (
          <li key={s.id} className="flex items-center gap-2">
            <span
              className={classNames(
                "flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium",
                isDone && "bg-inverted text-inverted",
                isActive && "bg-brand-default text-brand",
                !isDone && !isActive && "bg-subtle text-subtle"
              )}>
              {isDone ? <Icon name="check" className="h-3.5 w-3.5" /> : index + 1}
            </span>
            <span className={classNames("font-medium", isActive ? "text-emphasis" : "text-subtle")}>
              {t(s.labelKey)}
            </span>
            {index < steps.length - 1 && <span className="bg-subtle mx-1 h-px w-8" aria-hidden />}
          </li>
        );
      })}
    </ol>
  );
}

function BillingToggle({
  value,
  onChange,
}: {
  value: BillingPeriod;
  onChange: (value: BillingPeriod) => void;
}) {
  const { t } = useLocale();
  return (
    <div className="flex items-center gap-3">
      <SegmentedControl<BillingPeriod>
        className="w-56"
        data-testid="billing-period-toggle"
        value={value}
        onChange={onChange}
        data={[
          { value: "monthly", label: t("monthly") },
          { value: "annual", label: t("plan_selection_annually") },
        ]}
      />
      <Badge variant="green" size="md">
        {t("plan_selection_save_percent", { percent: ANNUAL_DISCOUNT_PERCENT })}
      </Badge>
    </div>
  );
}

function SelectPlanStep({
  billingPeriod,
  onBillingPeriodChange,
  selectedPlanId,
  onSelectPlan,
  recommendedPlan,
  onContinue,
}: {
  billingPeriod: BillingPeriod;
  onBillingPeriodChange: (value: BillingPeriod) => void;
  selectedPlanId: PlanId | null;
  onSelectPlan: (plan: PlanId) => void;
  recommendedPlan: PlanId;
  onContinue: () => void;
}) {
  const { t } = useLocale();
  const selectedPlan = PLANS.find((plan) => plan.id === selectedPlanId);

  return (
    <>
      <div className="flex flex-col items-center gap-3 text-center">
        <h1 className="font-heading text-emphasis text-3xl">{t("plan_selection_title")}</h1>
        <p className="text-subtle max-w-xl text-sm">{t("plan_selection_subtitle")}</p>
        <div className="mt-2">
          <BillingToggle value={billingPeriod} onChange={onBillingPeriodChange} />
        </div>
      </div>

      <div role="radiogroup" className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {PLANS.map((plan) => (
          <PlanCard
            key={plan.id}
            plan={plan}
            billingPeriod={billingPeriod}
            isRecommended={plan.id === recommendedPlan}
            isSelected={plan.id === selectedPlanId}
            onSelect={() => onSelectPlan(plan.id)}
          />
        ))}
      </div>

      <div className="bg-cal-muted border-subtle flex flex-col items-start justify-between gap-3 rounded-xl border px-5 py-4 sm:flex-row sm:items-center">
        <p className="text-subtle text-sm">
          {selectedPlan ? (
            <>
              <span className="text-emphasis font-medium">{t(selectedPlan.nameKey)}</span>
              {" · "}
              {billingPeriod === "annual" ? t("plan_selection_billed_annually") : t("plan_selection_billed_monthly")}
            </>
          ) : (
            t("plan_selection_no_plan_selected")
          )}
        </p>
        <Button color="primary" EndIcon="arrow-right" disabled={!selectedPlan} onClick={onContinue}>
          {t("continue")}
        </Button>
      </div>
    </>
  );
}

function PlanPrice({ plan, billingPeriod }: { plan: Plan; billingPeriod: BillingPeriod }) {
  const { t } = useLocale();
  if (!plan.price) {
    return (
      <div className="flex flex-col gap-1">
        <span className="font-heading text-emphasis text-3xl">{t("plan_selection_custom_pricing")}</span>
        <span className="text-subtle text-xs">{t("plan_selection_tailored_to_your_org")}</span>
      </div>
    );
  }

  const amount = plan.price[billingPeriod];
  const showStrikethrough = billingPeriod === "annual" && plan.price.monthly !== plan.price.annual;

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-baseline gap-2">
        <span className="font-heading text-emphasis text-3xl">{formatPrice(amount)}</span>
        {showStrikethrough && (
          <span className="text-muted text-sm line-through">{formatPrice(plan.price.monthly)}</span>
        )}
      </div>
      <span className="text-subtle text-xs">
        {plan.perSeat
          ? billingPeriod === "annual"
            ? t("plan_selection_per_user_month_annual")
            : t("plan_selection_per_user_month")
          : t("plan_selection_free_forever")}
      </span>
    </div>
  );
}

function PlanCard({
  plan,
  billingPeriod,
  isRecommended,
  isSelected,
  onSelect,
}: {
  plan: Plan;
  billingPeriod: BillingPeriod;
  isRecommended: boolean;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const { t } = useLocale();

  return (
    <div
      role="radio"
      aria-checked={isSelected}
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect();
        }
      }}
      data-testid={`plan-card-${plan.id}`}
      className={classNames(
        "relative flex cursor-pointer flex-col rounded-2xl p-1 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
        isRecommended ? "bg-inverted" : "bg-cal-muted",
        isSelected && "ring-brand-default ring-2 ring-offset-2"
      )}>
      {isRecommended && (
        <div className="text-inverted flex items-center gap-1.5 px-4 py-2 text-xs font-medium">
          <Icon name="sparkles" className="h-3.5 w-3.5" />
          {t("plan_selection_recommended")}
        </div>
      )}
      <div
        className={classNames(
          "bg-default flex flex-1 flex-col gap-5 rounded-xl border p-5",
          isSelected ? "border-emphasis shadow-sm" : "border-subtle"
        )}>
        <div className="flex items-start justify-between gap-2">
          <div className="bg-muted border-subtle flex h-9 w-9 items-center justify-center rounded-lg border">
            <Icon name={plan.icon} className="text-emphasis h-4 w-4" />
          </div>
          <span
            aria-hidden
            className={classNames(
              "flex h-5 w-5 items-center justify-center rounded-full border transition",
              isSelected ? "bg-brand-default border-transparent text-brand" : "border-default bg-default"
            )}>
            {isSelected && <Icon name="check" className="h-3 w-3" />}
          </span>
        </div>

        <div className="flex flex-col gap-1">
          <h3 className="text-emphasis text-base font-semibold">{t(plan.nameKey)}</h3>
          <p className="text-subtle min-h-[40px] text-sm">{t(plan.descriptionKey)}</p>
        </div>

        <PlanPrice plan={plan} billingPeriod={billingPeriod} />

        <Button
          color={isSelected || isRecommended ? "primary" : "secondary"}
          className="w-full justify-center"
          StartIcon={isSelected ? "check" : undefined}
          onClick={(e) => {
            e.stopPropagation();
            onSelect();
          }}>
          {isSelected ? t("plan_selection_selected") : t(plan.ctaKey)}
        </Button>

        <div className="border-subtle flex flex-col gap-3 border-t pt-4">
          <p className="text-emphasis text-xs font-medium">{t(plan.featuresHeadingKey)}</p>
          <ul className="flex flex-col gap-2.5">
            {plan.featureKeys.map((featureKey) => (
              <li key={featureKey} className="text-default flex items-start gap-2 text-sm">
                <Icon name="check" className="text-emphasis mt-0.5 h-4 w-4 shrink-0" />
                <span>{t(featureKey)}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function ConfirmPlanStep({
  plan,
  billingPeriod,
  onBillingPeriodChange,
  seats,
  onBack,
  onConfirm,
}: {
  plan: Plan;
  billingPeriod: BillingPeriod;
  onBillingPeriodChange: (value: BillingPeriod) => void;
  seats: number;
  onBack: () => void;
  onConfirm: () => void;
}) {
  const { t } = useLocale();
  const isCustom = plan.price === null;
  const isFree = plan.price !== null && plan.price.monthly === 0;
  const seatCount = plan.perSeat ? seats : 1;
  const months = billingPeriod === "annual" ? 12 : 1;
  const unitPrice = plan.price ? plan.price[billingPeriod] : 0;
  const subtotal = plan.price ? plan.price.monthly * seatCount * months : 0;
  const total = unitPrice * seatCount * months;
  const savings = subtotal - total;

  const confirmLabel = isCustom
    ? t("plan_selection_request_quote")
    : isFree
    ? t("plan_selection_start_for_free")
    : t("plan_selection_confirm_and_pay", { amount: formatPrice(total) });

  return (
    <>
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="font-heading text-emphasis text-3xl">{t("plan_selection_review_title")}</h1>
        <p className="text-subtle max-w-xl text-sm">{t("plan_selection_review_subtitle")}</p>
      </div>

      <div className="mx-auto grid w-full max-w-4xl grid-cols-1 gap-4 lg:grid-cols-5">
        {/* Plan recap */}
        <div className="bg-cal-muted rounded-2xl p-1 lg:col-span-3">
          <div className="flex h-11 items-center justify-between px-4">
            <span className="text-emphasis text-sm font-semibold">{t("plan_selection_your_plan")}</span>
            <Button color="minimal" size="sm" StartIcon="arrow-left" onClick={onBack}>
              {t("plan_selection_change_plan")}
            </Button>
          </div>
          <div className="bg-default border-subtle flex flex-col gap-5 rounded-xl border p-5">
            <div className="flex items-start gap-3">
              <div className="bg-muted border-subtle flex h-10 w-10 items-center justify-center rounded-lg border">
                <Icon name={plan.icon} className="text-emphasis h-5 w-5" />
              </div>
              <div className="flex flex-1 flex-col gap-1">
                <h3 className="text-emphasis text-base font-semibold">{t(plan.nameKey)}</h3>
                <p className="text-subtle text-sm">{t(plan.descriptionKey)}</p>
              </div>
            </div>
            {!isCustom && !isFree && (
              <div className="flex flex-col gap-2">
                <span className="text-emphasis text-sm font-medium">{t("plan_selection_billing_period")}</span>
                <BillingToggle value={billingPeriod} onChange={onBillingPeriodChange} />
              </div>
            )}
            <div className="border-subtle flex flex-col gap-3 border-t pt-4">
              <p className="text-emphasis text-xs font-medium">{t("plan_selection_whats_included")}</p>
              <ul className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                {plan.featureKeys.map((featureKey) => (
                  <li key={featureKey} className="text-default flex items-start gap-2 text-sm">
                    <Icon name="check" className="text-emphasis mt-0.5 h-4 w-4 shrink-0" />
                    <span>{t(featureKey)}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Order summary */}
        <div className="bg-cal-muted flex flex-col rounded-2xl p-1 lg:col-span-2">
          <div className="flex h-11 items-center px-4">
            <span className="text-emphasis text-sm font-semibold">{t("plan_selection_summary")}</span>
          </div>
          <div className="bg-default border-subtle flex flex-1 flex-col gap-4 rounded-xl border p-5">
            {isCustom ? (
              <p className="text-subtle text-sm">{t("plan_selection_enterprise_summary")}</p>
            ) : (
              <dl className="flex flex-col gap-3 text-sm">
                <SummaryRow
                  label={t(plan.nameKey)}
                  value={
                    plan.perSeat
                      ? t("plan_selection_price_times_seats", { price: formatPrice(unitPrice), seats: seatCount })
                      : formatPrice(unitPrice)
                  }
                />
                <SummaryRow
                  label={t("plan_selection_billing_period")}
                  value={billingPeriod === "annual" ? t("plan_selection_annually") : t("monthly")}
                />
                {savings > 0 && (
                  <SummaryRow
                    label={t("plan_selection_annual_savings")}
                    value={`−${formatPrice(savings)}`}
                    valueClassName="text-success"
                  />
                )}
                <div className="border-subtle flex items-baseline justify-between border-t pt-3">
                  <dt className="text-emphasis font-semibold">{t("plan_selection_due_today")}</dt>
                  <dd className="font-heading text-emphasis text-2xl">{formatPrice(total)}</dd>
                </div>
              </dl>
            )}
            <div className="mt-auto flex flex-col gap-2">
              <Button color="primary" className="w-full justify-center" onClick={onConfirm}>
                {confirmLabel}
              </Button>
              <Button color="secondary" className="w-full justify-center" onClick={onBack}>
                {t("back")}
              </Button>
            </div>
            {!isCustom && !isFree && (
              <p className="text-muted flex items-center gap-1.5 text-xs">
                <Icon name="lock" className="h-3.5 w-3.5" />
                {t("plan_selection_secure_checkout")}
              </p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

function SummaryRow({
  label,
  value,
  valueClassName,
}: {
  label: string;
  value: string;
  valueClassName?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <dt className="text-subtle">{label}</dt>
      <dd className={classNames("text-emphasis font-medium", valueClassName)}>{value}</dd>
    </div>
  );
}

export default PlanSelectionFlow;
