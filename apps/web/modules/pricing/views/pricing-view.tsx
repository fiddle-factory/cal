"use client";

import { Fragment, useState } from "react";

import classNames from "@calcom/ui/classNames";
import { Badge } from "@calcom/ui/components/badge";
import { Button } from "@calcom/ui/components/button";
import { Icon } from "@calcom/ui/components/icon";
import { SegmentedControl } from "@calcom/ui/components/segmented-control";
import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableNew as Table,
  TableRow,
} from "@calcom/ui/components/table";

type BillingPeriod = "monthly" | "yearly";
type PlanId = "free" | "teams" | "organizations" | "enterprise";

type Plan = {
  id: PlanId;
  name: string;
  description: string;
  price: Record<BillingPeriod, string>;
  priceSuffix?: string;
  cta: string;
  ctaColor: "primary" | "secondary";
  highlighted?: boolean;
};

type FeatureValue = boolean | string;

type FeatureCategory = {
  name: string;
  features: { name: string; values: Record<PlanId, FeatureValue> }[];
};

const PLANS: Plan[] = [
  {
    id: "free",
    name: "Free",
    description: "For individuals",
    price: { monthly: "$0", yearly: "$0" },
    priceSuffix: "forever",
    cta: "Get started",
    ctaColor: "secondary",
  },
  {
    id: "teams",
    name: "Teams",
    description: "For growing teams",
    price: { monthly: "$15", yearly: "$12" },
    priceSuffix: "/user/mo",
    cta: "Try for free",
    ctaColor: "primary",
    highlighted: true,
  },
  {
    id: "organizations",
    name: "Organizations",
    description: "For multi-team companies",
    price: { monthly: "$37", yearly: "$28" },
    priceSuffix: "/user/mo",
    cta: "Get started",
    ctaColor: "secondary",
  },
  {
    id: "enterprise",
    name: "Enterprise",
    description: "For large organizations",
    price: { monthly: "Custom", yearly: "Custom" },
    cta: "Contact sales",
    ctaColor: "secondary",
  },
];

const all = (value: FeatureValue): Record<PlanId, FeatureValue> => ({
  free: value,
  teams: value,
  organizations: value,
  enterprise: value,
});

const FEATURE_CATEGORIES: FeatureCategory[] = [
  {
    name: "Scheduling",
    features: [
      { name: "Unlimited event types", values: all(true) },
      { name: "Unlimited bookings", values: all(true) },
      { name: "Calendar connections", values: { free: "Unlimited", teams: "Unlimited", organizations: "Unlimited", enterprise: "Unlimited" } },
      { name: "Booking questions & custom fields", values: all(true) },
      { name: "Recurring & seated events", values: all(true) },
      { name: "Routing forms", values: { free: true, teams: true, organizations: true, enterprise: true } },
    ],
  },
  {
    name: "Team collaboration",
    features: [
      { name: "Round-robin scheduling", values: { free: false, teams: true, organizations: true, enterprise: true } },
      { name: "Collective events", values: { free: false, teams: true, organizations: true, enterprise: true } },
      { name: "Managed event types", values: { free: false, teams: true, organizations: true, enterprise: true } },
      { name: "Teams", values: { free: false, teams: "1", organizations: "Unlimited", enterprise: "Unlimited" } },
      { name: "Insights & analytics", values: { free: false, teams: true, organizations: true, enterprise: true } },
    ],
  },
  {
    name: "Automation",
    features: [
      { name: "Workflows (email reminders)", values: { free: false, teams: true, organizations: true, enterprise: true } },
      { name: "SMS & WhatsApp reminders", values: { free: false, teams: "Credits", organizations: "Credits", enterprise: "Custom" } },
      { name: "Webhooks & API access", values: all(true) },
    ],
  },
  {
    name: "Administration & security",
    features: [
      { name: "Organization subdomain", values: { free: false, teams: false, organizations: true, enterprise: true } },
      { name: "SAML SSO & SCIM", values: { free: false, teams: false, organizations: true, enterprise: true } },
      { name: "Attribute-based routing", values: { free: false, teams: false, organizations: true, enterprise: true } },
      { name: "Data residency & audit logs", values: { free: false, teams: false, organizations: false, enterprise: true } },
      { name: "Support", values: { free: "Community", teams: "Email", organizations: "Priority", enterprise: "Dedicated" } },
      { name: "Uptime SLA", values: { free: false, teams: false, organizations: false, enterprise: "99.99%" } },
    ],
  },
];

const FAQS: { question: string; answer: string }[] = [
  {
    question: "Is the Free plan really free forever?",
    answer:
      "Yes. Individuals get unlimited event types, bookings and calendar connections at no cost, with no time limit.",
  },
  {
    question: "How does per-user pricing work?",
    answer:
      "Teams and Organizations are billed per active member each month. You can add or remove seats at any time and we prorate the difference.",
  },
  {
    question: "Can I switch plans later?",
    answer:
      "Absolutely. Upgrade or downgrade from your billing settings whenever you need to; your event types and bookings stay intact.",
  },
  {
    question: "Do you offer discounts for non-profits or education?",
    answer: "Yes, we offer discounted pricing for eligible non-profits and educational institutions. Contact sales to apply.",
  },
];

function FeatureCell({ value }: { value: FeatureValue }) {
  if (value === true) {
    return (
      <>
        <Icon name="check" className="text-emphasis mx-auto h-4 w-4" aria-hidden="true" />
        <span className="sr-only">Included</span>
      </>
    );
  }
  if (value === false) {
    return (
      <>
        <span className="text-muted" aria-hidden="true">
          —
        </span>
        <span className="sr-only">Not included</span>
      </>
    );
  }
  return <span className="text-default text-sm">{value}</span>;
}

export default function PricingView() {
  const [period, setPeriod] = useState<BillingPeriod>("yearly");

  return (
    <div className="bg-default min-h-screen px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <header className="mx-auto max-w-2xl text-center">
          <h1 className="font-heading text-emphasis text-3xl sm:text-4xl">Compare plans</h1>
          <p className="text-subtle mt-3 text-base">
            Start for free and upgrade as your team grows. Every plan includes unlimited event types and
            bookings.
          </p>
          <div className="mt-6 flex justify-center">
            <SegmentedControl<BillingPeriod>
              className="w-64"
              data={[
                { value: "monthly", label: "Monthly" },
                { value: "yearly", label: "Yearly · save 20%" },
              ]}
              value={period}
              onChange={setPeriod}
            />
          </div>
        </header>

        <div className="border-subtle mt-10 overflow-x-auto rounded-2xl border">
          <Table className="min-w-[760px] table-fixed border-0">
            <colgroup>
              <col className="w-[28%]" />
              {PLANS.map((plan) => (
                <col key={plan.id} className="w-[18%]" />
              ))}
            </colgroup>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-subtle">
                <TableHead className="align-bottom px-4 py-5">
                  <span className="text-subtle text-sm font-normal">Plans</span>
                </TableHead>
                {PLANS.map((plan) => (
                  <TableHead
                    key={plan.id}
                    className={classNames("px-4 py-5 align-top", plan.highlighted && "bg-cal-muted")}>
                    <div className="flex h-full flex-col gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-emphasis text-base font-semibold">{plan.name}</span>
                          {plan.highlighted && (
                            <Badge variant="blue" size="sm">
                              Popular
                            </Badge>
                          )}
                        </div>
                        <p className="text-subtle mt-0.5 text-xs font-normal">{plan.description}</p>
                      </div>
                      <div className="flex items-baseline gap-1">
                        <span className="font-heading text-emphasis text-2xl">{plan.price[period]}</span>
                        {plan.priceSuffix && (
                          <span className="text-subtle text-xs font-normal">{plan.priceSuffix}</span>
                        )}
                      </div>
                      <Button color={plan.ctaColor} size="sm" className="w-full justify-center">
                        {plan.cta}
                      </Button>
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {FEATURE_CATEGORIES.map((category) => (
                <Fragment key={category.name}>
                  <TableRow className="bg-subtle hover:bg-subtle border-subtle">
                    <TableCell
                      colSpan={PLANS.length + 1}
                      className="text-emphasis px-4 py-2 text-xs font-semibold uppercase tracking-wide">
                      {category.name}
                    </TableCell>
                  </TableRow>
                  {category.features.map((feature) => (
                    <TableRow key={feature.name} className="border-subtle">
                      <TableCell className="text-default px-4 py-3 text-sm">{feature.name}</TableCell>
                      {PLANS.map((plan) => (
                        <TableCell
                          key={plan.id}
                          className={classNames("px-4 py-3 text-center", plan.highlighted && "bg-cal-muted")}>
                          <FeatureCell value={feature.values[plan.id]} />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </Fragment>
              ))}
            </TableBody>
          </Table>
        </div>

        <section className="mx-auto mt-16 max-w-3xl">
          <h2 className="font-heading text-emphasis text-center text-2xl">Frequently asked questions</h2>
          <div className="border-subtle divide-subtle mt-6 divide-y rounded-2xl border">
            {FAQS.map((faq) => (
              <details key={faq.question} className="group px-5 py-4">
                <summary className="text-emphasis flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-medium [&::-webkit-details-marker]:hidden">
                  {faq.question}
                  <Icon
                    name="chevron-down"
                    className="text-subtle h-4 w-4 shrink-0 transition-transform group-open:rotate-180"
                  />
                </summary>
                <p className="text-subtle mt-2 text-sm leading-relaxed">{faq.answer}</p>
              </details>
            ))}
          </div>
          <p className="text-subtle mt-6 text-center text-sm">
            Still have questions?{" "}
            <Button color="minimal" size="sm" href="mailto:sales@cal.com" className="inline-flex">
              Talk to sales
            </Button>
          </p>
        </section>
      </div>
    </div>
  );
}
