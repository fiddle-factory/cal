"use client";

import { useState } from "react";

import classNames from "@calcom/ui/classNames";
import { Badge } from "@calcom/ui/components/badge/Badge";
import { Button } from "@calcom/ui/components/button/Button";
import Icon from "@calcom/ui/components/icon/Icon";
import type { IconName } from "@calcom/ui/components/icon/icon-names";
import SegmentedControl from "@calcom/ui/components/segmented-control/SegmentedControl";

type BillingPeriod = "monthly" | "yearly";

type Plan = {
  id: string;
  name: string;
  icon: IconName;
  description: string;
  price: { monthly: number; yearly: number } | null;
  priceSuffix?: string;
  customPriceLabel?: string;
  featuresIntro: string;
  features: string[];
  cta: string;
  recommended?: boolean;
};

const PLANS: Plan[] = [
  {
    id: "free",
    name: "Free",
    icon: "user",
    description: "For individuals getting started with scheduling.",
    price: { monthly: 0, yearly: 0 },
    priceSuffix: "forever",
    featuresIntro: "Includes:",
    features: [
      "1 user",
      "Unlimited calendars",
      "Unlimited event types",
      "Workflows",
      "Integrate with your favorite apps",
      "Accept payments via Stripe",
    ],
    cta: "Get started",
  },
  {
    id: "teams",
    name: "Teams",
    icon: "users",
    description: "For teams that need to collaborate on scheduling.",
    price: { monthly: 15, yearly: 12 },
    priceSuffix: "per user / month",
    featuresIntro: "Everything in Free, plus:",
    features: [
      "Round-robin & collective events",
      "Routing forms",
      "Team workflows",
      "Insights & analytics",
      "Remove Cal.com branding",
      "Managed event types",
    ],
    cta: "Start 14-day trial",
    recommended: true,
  },
  {
    id: "organizations",
    name: "Organizations",
    icon: "building",
    description: "For companies with multiple teams and admin needs.",
    price: { monthly: 37, yearly: 30 },
    priceSuffix: "per user / month",
    featuresIntro: "Everything in Teams, plus:",
    features: [
      "Unlimited sub-teams",
      "Organization subdomain",
      "SAML SSO & SCIM",
      "Domain-wide delegation",
      "Admin & member attributes",
      "Organization-wide insights",
    ],
    cta: "Get started",
  },
  {
    id: "enterprise",
    name: "Enterprise",
    icon: "sparkles",
    description: "For large organizations with advanced requirements.",
    price: null,
    customPriceLabel: "Custom",
    priceSuffix: "billed annually",
    featuresIntro: "Everything in Organizations, plus:",
    features: [
      "Dedicated support & SLA",
      "Custom contracts & invoicing",
      "Advanced security reviews",
      "HIPAA compliance",
      "Dedicated onboarding",
      "Uptime guarantees",
    ],
    cta: "Contact sales",
  },
];

function PlanCard({ plan, period }: { plan: Plan; period: BillingPeriod }) {
  const amount = plan.price ? plan.price[period] : null;
  const showYearlyNote = plan.price && plan.price.monthly > 0 && period === "yearly";

  return (
    <div
      className={classNames(
        "bg-default relative flex flex-col rounded-2xl border p-6",
        plan.recommended ? "border-emphasis shadow-lg" : "border-subtle"
      )}>
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="bg-subtle text-emphasis flex h-8 w-8 items-center justify-center rounded-lg">
            <Icon name={plan.icon} className="h-4 w-4" />
          </div>
          <h2 className="text-emphasis font-cal text-lg font-semibold">{plan.name}</h2>
        </div>
        {plan.recommended && (
          <Badge variant="blue" size="md" startIcon="star">
            Recommended
          </Badge>
        )}
      </div>

      <p className="text-subtle mt-3 min-h-[40px] text-sm">{plan.description}</p>

      <div className="mt-6 flex items-end gap-1.5">
        <span className="text-emphasis font-cal text-4xl font-semibold leading-none">
          {amount === null ? plan.customPriceLabel : `$${amount}`}
        </span>
        {plan.priceSuffix && <span className="text-subtle pb-0.5 text-sm">{plan.priceSuffix}</span>}
      </div>
      <p className="text-muted mt-2 h-4 text-xs">
        {showYearlyNote && plan.price ? `$${plan.price.yearly * 12} billed yearly per user` : ""}
      </p>

      <Button
        className="mt-6 w-full justify-center"
        color={plan.recommended ? "primary" : "secondary"}
        size="lg">
        {plan.cta}
      </Button>

      <div className="border-subtle mt-6 border-t pt-6">
        <p className="text-emphasis text-sm font-medium">{plan.featuresIntro}</p>
        <ul className="mt-4 space-y-3">
          {plan.features.map((feature) => (
            <li key={feature} className="text-default flex items-start gap-2 text-sm">
              <Icon name="check" className="text-success mt-0.5 h-4 w-4 shrink-0" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default function PricingView() {
  const [period, setPeriod] = useState<BillingPeriod>("monthly");

  return (
    <div className="bg-cal-muted min-h-screen px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-2xl text-center">
          <Badge variant="gray" size="md" className="mb-4">
            Pricing
          </Badge>
          <h1 className="text-emphasis font-cal text-4xl font-semibold tracking-tight sm:text-5xl">
            Simple pricing for every team
          </h1>
          <p className="text-subtle mt-4 text-base">
            Start for free and upgrade as you grow. All plans include unlimited bookings and calendar
            connections.
          </p>
        </div>

        <div className="mt-10 flex items-center justify-center gap-3">
          <SegmentedControl<BillingPeriod>
            className="w-56"
            value={period}
            onChange={setPeriod}
            data={[
              { value: "monthly", label: "Monthly" },
              { value: "yearly", label: "Yearly" },
            ]}
          />
          <Badge variant="success" size="md">
            Save 20%
          </Badge>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
          {PLANS.map((plan) => (
            <PlanCard key={plan.id} plan={plan} period={period} />
          ))}
        </div>

        <p className="text-subtle mt-10 text-center text-sm">
          Prices in USD. Need something different?{" "}
          <a href="#" className="text-emphasis font-medium underline">
            Talk to our team
          </a>
          .
        </p>
      </div>
    </div>
  );
}
