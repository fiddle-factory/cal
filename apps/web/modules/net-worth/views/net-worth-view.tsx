"use client";

import { useState } from "react";

import classNames from "@calcom/ui/classNames";
import { Badge } from "@calcom/ui/components/badge/Badge";
import { Icon } from "@calcom/ui/components/icon/Icon";
import type { IconName } from "@calcom/ui/components/icon/icon-names";

import { StocksDetailView } from "./stocks-detail-view";
import type { StockPortfolio } from "./stocks-detail-view";

export type NetWorthLineItem = {
  name: string;
  amount: number;
  detail?: string;
};

export type NetWorthAsset = {
  id: string;
  name: string;
  icon: IconName;
  /** Tailwind background token used for the allocation bar, e.g. "bg-visualization-1-emphasis". */
  colorClassName: string;
  amount: number;
  /** Month-on-month change in percent. */
  changePercent?: number;
  items?: NetWorthLineItem[];
};

export type NetWorthDueStatus = "overdue" | "due_soon" | "scheduled";

export type NetWorthLiability = {
  id: string;
  name: string;
  icon: IconName;
  kind: "loan" | "bill";
  amount: number;
  dueInfo: string;
  dueStatus: NetWorthDueStatus;
  items?: (NetWorthLineItem & { dueStatus?: NetWorthDueStatus })[];
};

export type NetWorthViewProps = {
  userName: string;
  asOf: string;
  /** Net worth at the start of the month, used for the change indicator. */
  previousNetWorth: number;
  assets: NetWorthAsset[];
  liabilities: NetWorthLiability[];
  /** Stock holdings behind the "stocks" asset row. When provided, the row opens a Stocks detail page. */
  stocks?: StockPortfolio;
  /** Which page to show first. */
  initialView?: NetWorthPage;
  className?: string;
};

export type NetWorthPage = "overview" | "stocks";

const inrFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

export const formatInr = (value: number) => inrFormatter.format(value);

const formatPercent = (value: number) => `${value.toFixed(1)}%`;

const sum = (values: number[]) => values.reduce((total, value) => total + value, 0);

const dueBadge: Record<NetWorthDueStatus, { variant: "error" | "orange" | "gray"; label: string }> = {
  overdue: { variant: "error", label: "Overdue" },
  due_soon: { variant: "orange", label: "Due soon" },
  scheduled: { variant: "gray", label: "Auto-debit" },
};

function SectionHeader({ title, total, subtitle }: { title: string; total: number; subtitle: string }) {
  return (
    <div className="flex items-end justify-between px-1 pb-3">
      <div>
        <h2 className="text-emphasis text-base font-semibold leading-6">{title}</h2>
        <p className="text-subtle text-xs">{subtitle}</p>
      </div>
      <p className="text-emphasis text-base font-semibold tabular-nums">{formatInr(total)}</p>
    </div>
  );
}

function RowIcon({ name }: { name: IconName }) {
  return (
    <div className="bg-subtle text-emphasis flex h-10 w-10 shrink-0 items-center justify-center rounded-full">
      <Icon name={name} className="h-5 w-5" />
    </div>
  );
}

function ChangeBadge({ value }: { value: number }) {
  const isPositive = value >= 0;
  return (
    <Badge
      variant={isPositive ? "success" : "error"}
      size="sm"
      startIcon={isPositive ? "arrow-up" : "arrow-down"}>
      {formatPercent(Math.abs(value))}
    </Badge>
  );
}

export function NetWorthView({
  userName,
  asOf,
  previousNetWorth,
  assets,
  liabilities,
  stocks,
  initialView = "overview",
  className,
}: NetWorthViewProps) {
  const [page, setPage] = useState<NetWorthPage>(stocks ? initialView : "overview");
  const totalAssets = sum(assets.map((asset) => asset.amount));
  const totalLiabilities = sum(liabilities.map((liability) => liability.amount));
  const netWorth = totalAssets - totalLiabilities;
  const change = netWorth - previousNetWorth;
  const changePercent = previousNetWorth ? (change / previousNetWorth) * 100 : 0;
  const isUp = change >= 0;
  const grossTotal = totalAssets + totalLiabilities;
  const assetShare = grossTotal ? (totalAssets / grossTotal) * 100 : 0;
  const liabilityShare = 100 - assetShare;
  const loans = liabilities.filter((liability) => liability.kind === "loan");
  const bills = liabilities.filter((liability) => liability.kind === "bill");

  return (
    <div
      className={classNames(
        "bg-default dark:bg-cal-muted border-subtle text-default mx-auto w-full max-w-[390px] overflow-hidden rounded-lg border",
        className
      )}>
      {page === "stocks" && stocks ? (
        <StocksDetailView {...stocks} asOf={asOf} onBack={() => setPage("overview")} />
      ) : (
        <>
          {/* App bar */}
          <header className="border-subtle flex items-center justify-between border-b px-4 py-3">
            <button
              type="button"
              aria-label="Back"
              className="hover:bg-subtle text-subtle hover:text-default rounded-md p-1 transition">
              <Icon name="chevron-left" className="h-5 w-5" />
            </button>
            <h1 className="text-emphasis text-base font-semibold">Net Worth</h1>
            <button
              type="button"
              aria-label="Hide amounts"
              className="hover:bg-subtle text-subtle hover:text-default rounded-md p-1 transition">
              <Icon name="eye" className="h-5 w-5" />
            </button>
          </header>

          <div className="space-y-6 px-4 pb-8 pt-6">
            {/* Hero */}
            <section className="text-center">
              <p className="text-subtle text-sm">Hi {userName}, your net worth is</p>
              <p className="text-emphasis mt-2 text-3xl font-semibold leading-9 tabular-nums">
                {formatInr(netWorth)}
              </p>
              <div className="mt-3 flex items-center justify-center gap-2">
                <Badge variant={isUp ? "success" : "error"} startIcon={isUp ? "arrow-up" : "arrow-down"}>
                  {isUp ? "+" : "−"}
                  {formatPercent(Math.abs(changePercent))} this month
                </Badge>
                <span
                  className={classNames(
                    "text-xs font-medium tabular-nums",
                    isUp ? "text-success" : "text-error"
                  )}>
                  {isUp ? "+" : "−"}
                  {formatInr(Math.abs(change))}
                </span>
              </div>
              <p className="text-muted mt-2 text-xs">Updated {asOf}</p>
            </section>

            {/* Assets vs liabilities */}
            <section className="border-subtle rounded-lg border p-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-emphasis font-medium">Assets vs Liabilities</span>
                <span className="text-subtle text-xs">{formatPercent(assetShare)} assets</span>
              </div>
              <div
                className="bg-subtle mt-3 flex h-2.5 w-full gap-0.5 overflow-hidden rounded-full"
                role="img"
                aria-label={`Assets ${formatPercent(assetShare)}, liabilities ${formatPercent(liabilityShare)}`}>
                <div
                  className="bg-visualization-4-emphasis h-full rounded-l-full"
                  style={{ width: `${assetShare}%` }}
                />
                <div
                  className="bg-visualization-7-emphasis h-full rounded-r-full"
                  style={{ width: `${liabilityShare}%` }}
                />
              </div>
              <div className="mt-4 grid grid-cols-2 gap-4">
                <div>
                  <div className="text-subtle flex items-center gap-1.5 text-xs">
                    <span className="bg-visualization-4-emphasis h-2 w-2 rounded-full" />
                    Total assets
                  </div>
                  <p className="text-emphasis mt-1 text-base font-semibold tabular-nums">
                    {formatInr(totalAssets)}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-subtle flex items-center justify-end gap-1.5 text-xs">
                    <span className="bg-visualization-7-emphasis h-2 w-2 rounded-full" />
                    Total liabilities
                  </div>
                  <p className="text-emphasis mt-1 text-base font-semibold tabular-nums">
                    {formatInr(totalLiabilities)}
                  </p>
                </div>
              </div>
            </section>

            {/* Assets */}
            <section>
              <SectionHeader title="Assets" subtitle={`${assets.length} asset classes`} total={totalAssets} />
              <div className="bg-subtle mb-3 flex h-1.5 w-full gap-0.5 overflow-hidden rounded-full">
                {assets.map((asset) => (
                  <div
                    key={asset.id}
                    className={classNames("h-full", asset.colorClassName)}
                    style={{ width: `${(asset.amount / totalAssets) * 100}%` }}
                  />
                ))}
              </div>
              <ul className="border-subtle divide-subtle divide-y overflow-hidden rounded-lg border">
                {assets.map((asset) => {
                  const share = (asset.amount / totalAssets) * 100;
                  const opensStocks = asset.id === "stocks" && !!stocks;
                  const summary = (
                    <div className="flex items-center gap-3">
                      <RowIcon name={asset.icon} />
                      <div className="min-w-0 flex-1">
                        <p className="text-emphasis truncate text-sm font-medium">{asset.name}</p>
                        <div className="text-subtle mt-0.5 flex items-center gap-1.5 text-xs">
                          <span className={classNames("h-2 w-2 rounded-full", asset.colorClassName)} />
                          {formatPercent(share)} of assets
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <p className="text-emphasis text-sm font-semibold tabular-nums">
                          {formatInr(asset.amount)}
                        </p>
                        {asset.changePercent !== undefined && <ChangeBadge value={asset.changePercent} />}
                      </div>
                      {opensStocks && <Icon name="chevron-right" className="text-subtle h-4 w-4 shrink-0" />}
                    </div>
                  );
                  if (opensStocks) {
                    return (
                      <li key={asset.id}>
                        <button
                          type="button"
                          aria-label={`View ${asset.name} breakdown`}
                          onClick={() => setPage("stocks")}
                          className="hover:bg-muted w-full p-4 text-left transition">
                          {summary}
                        </button>
                      </li>
                    );
                  }
                  return (
                    <li key={asset.id} className="p-4">
                      {summary}
                      {asset.items && asset.items.length > 0 && (
                        <ul className="bg-cal-muted dark:bg-default mt-3 space-y-2 rounded-md px-3 py-2.5">
                          {asset.items.map((item) => (
                            <li key={item.name} className="flex items-center justify-between text-xs">
                              <div className="min-w-0">
                                <p className="text-default font-medium">{item.name}</p>
                                {item.detail && <p className="text-subtle">{item.detail}</p>}
                              </div>
                              <p className="text-emphasis font-medium tabular-nums">
                                {formatInr(item.amount)}
                              </p>
                            </li>
                          ))}
                        </ul>
                      )}
                    </li>
                  );
                })}
              </ul>
            </section>

            {/* Liabilities */}
            <section>
              <SectionHeader
                title="Liabilities"
                subtitle={`${loans.length} loans · ${bills.length} bill categories`}
                total={totalLiabilities}
              />
              <ul className="border-subtle divide-subtle divide-y rounded-lg border">
                {[...loans, ...bills].map((liability) => {
                  const badge = dueBadge[liability.dueStatus];
                  return (
                    <li key={liability.id} className="p-4">
                      <div className="flex items-center gap-3">
                        <RowIcon name={liability.icon} />
                        <div className="min-w-0 flex-1">
                          <p className="text-emphasis truncate text-sm font-medium">{liability.name}</p>
                          <p className="text-subtle mt-0.5 truncate text-xs">{liability.dueInfo}</p>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <p className="text-emphasis text-sm font-semibold tabular-nums">
                            {formatInr(liability.amount)}
                          </p>
                          <Badge variant={badge.variant} size="sm">
                            {badge.label}
                          </Badge>
                        </div>
                      </div>
                      {liability.items && liability.items.length > 0 && (
                        <ul className="bg-cal-muted dark:bg-default mt-3 space-y-2 rounded-md px-3 py-2.5">
                          {liability.items.map((item) => (
                            <li key={item.name} className="flex items-center justify-between gap-3 text-xs">
                              <div className="min-w-0">
                                <p className="text-default truncate font-medium">{item.name}</p>
                                {item.detail && (
                                  <p
                                    className={classNames(
                                      item.dueStatus === "overdue" ? "text-error" : "text-subtle"
                                    )}>
                                    {item.detail}
                                  </p>
                                )}
                              </div>
                              <p className="text-emphasis font-medium tabular-nums">
                                {formatInr(item.amount)}
                              </p>
                            </li>
                          ))}
                        </ul>
                      )}
                    </li>
                  );
                })}
              </ul>
            </section>
          </div>
        </>
      )}
    </div>
  );
}

export default NetWorthView;
