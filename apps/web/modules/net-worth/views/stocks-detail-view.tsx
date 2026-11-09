import classNames from "@calcom/ui/classNames";
import { Badge } from "@calcom/ui/components/badge/Badge";
import { Icon } from "@calcom/ui/components/icon/Icon";
import type { IconName } from "@calcom/ui/components/icon/icon-names";

export type StockMarket = "IN" | "US";

export type StockHolding = {
  symbol: string;
  name: string;
  market: StockMarket;
  sector: string;
  quantity: number;
  /** Average buy price per share, in INR. */
  avgPrice: number;
  /** Last traded price per share, in INR. */
  lastPrice: number;
  /** Today's price change in percent. */
  dayChangePercent: number;
};

export type StockBenchmark = {
  name: string;
  period: string;
  portfolioReturnPercent: number;
  benchmarkReturnPercent: number;
};

export type StockPortfolio = {
  holdings: StockHolding[];
  benchmark?: StockBenchmark;
  /** Sectors commonly found in a diversified Indian portfolio, used to flag gaps. */
  referenceSectors?: string[];
};

export type StocksDetailViewProps = StockPortfolio & {
  asOf?: string;
  onBack?: () => void;
};

const inrFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const formatInr = (value: number) => inrFormatter.format(value);
const formatSignedInr = (value: number) => `${value >= 0 ? "+" : "−"}${formatInr(Math.abs(value))}`;
const formatPercent = (value: number) => `${value.toFixed(1)}%`;
const formatSignedPercent = (value: number) => `${value >= 0 ? "+" : "−"}${formatPercent(Math.abs(value))}`;
const sum = (values: number[]) => values.reduce((total, value) => total + value, 0);

const SECTOR_COLORS = [
  "bg-visualization-3-emphasis",
  "bg-visualization-1-emphasis",
  "bg-visualization-2-emphasis",
  "bg-visualization-5-emphasis",
  "bg-visualization-4-emphasis",
  "bg-visualization-6-emphasis",
  "bg-visualization-7-emphasis",
];

/** Single-stock and single-sector weights above these levels are flagged as concentration risk. */
const STOCK_CONCENTRATION_LIMIT = 15;
const SECTOR_CONCENTRATION_LIMIT = 25;

type EnrichedHolding = StockHolding & {
  value: number;
  invested: number;
  pnl: number;
  pnlPercent: number;
  weight: number;
  dayChange: number;
};

type SectorSlice = { name: string; value: number; weight: number; colorClassName: string; count: number };

type Insight = {
  id: string;
  icon: IconName;
  tone: "warning" | "success" | "info";
  title: string;
  description: string;
};

const toneStyles: Record<Insight["tone"], string> = {
  warning: "bg-attention text-attention",
  success: "bg-cal-success text-success",
  info: "bg-cal-info text-info",
};

function pnlTextClass(value: number) {
  return value >= 0 ? "text-success" : "text-error";
}

function SectionHeader({
  title,
  subtitle,
  trailing,
}: {
  title: string;
  subtitle?: string;
  trailing?: string;
}) {
  return (
    <div className="flex items-end justify-between px-1 pb-3">
      <div>
        <h2 className="text-emphasis text-base font-semibold leading-6">{title}</h2>
        {subtitle && <p className="text-subtle text-xs">{subtitle}</p>}
      </div>
      {trailing && <p className="text-subtle text-xs">{trailing}</p>}
    </div>
  );
}

function Stat({
  label,
  value,
  valueClassName,
  align = "left",
}: {
  label: string;
  value: string;
  valueClassName?: string;
  align?: "left" | "right";
}) {
  return (
    <div className={align === "right" ? "text-right" : undefined}>
      <p className="text-subtle text-xs">{label}</p>
      <p className={classNames("mt-1 text-sm font-semibold tabular-nums", valueClassName ?? "text-emphasis")}>
        {value}
      </p>
    </div>
  );
}

function HoldingRow({ holding }: { holding: EnrichedHolding }) {
  return (
    <li className="p-4">
      <div className="flex items-start gap-3">
        <div className="bg-subtle text-emphasis flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold">
          {holding.symbol.slice(0, 4)}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-emphasis truncate text-sm font-medium">{holding.name}</p>
              <p className="text-subtle mt-0.5 truncate text-xs tabular-nums">
                {holding.quantity} shares · Avg {formatInr(holding.avgPrice)}
              </p>
            </div>
            <div className="shrink-0 text-right">
              <p className="text-emphasis text-sm font-semibold tabular-nums">{formatInr(holding.value)}</p>
              <p className={classNames("mt-0.5 text-xs font-medium tabular-nums", pnlTextClass(holding.pnl))}>
                {formatSignedInr(holding.pnl)} ({formatSignedPercent(holding.pnlPercent)})
              </p>
            </div>
          </div>
          <div className="mt-2.5 flex items-center gap-2">
            <div className="bg-subtle h-1.5 flex-1 overflow-hidden rounded-full">
              <div
                className="bg-visualization-3-emphasis h-full rounded-full"
                style={{ width: `${Math.min(holding.weight, 100)}%` }}
              />
            </div>
            <span className="text-subtle w-20 text-right text-[11px] tabular-nums">
              {formatPercent(holding.weight)} weight
            </span>
          </div>
          <div className="text-muted mt-1.5 flex items-center justify-between text-[11px] tabular-nums">
            <span>
              {holding.sector} · LTP {formatInr(holding.lastPrice)}
            </span>
            <span className={pnlTextClass(holding.dayChangePercent)}>
              {formatSignedPercent(holding.dayChangePercent)} today
            </span>
          </div>
        </div>
      </div>
    </li>
  );
}

function buildInsights(
  holdings: EnrichedHolding[],
  sectors: SectorSlice[],
  totalValue: number,
  referenceSectors: string[]
): Insight[] {
  const insights: Insight[] = [];
  const top = holdings[0];
  const topSector = sectors[0];

  if (top && top.weight > STOCK_CONCENTRATION_LIMIT) {
    const excess = ((top.weight - STOCK_CONCENTRATION_LIMIT) / 100) * totalValue;
    insights.push({
      id: "stock-concentration",
      icon: "triangle-alert",
      tone: "warning",
      title: `${top.name} is ${formatPercent(top.weight)} of your stocks`,
      description: `Above the ${STOCK_CONCENTRATION_LIMIT}% single-stock guideline. Trimming ~${formatInr(
        excess
      )} would bring it back in range and lock in part of your ${formatSignedPercent(top.pnlPercent)} gain.`,
    });
  }

  if (topSector && topSector.weight > SECTOR_CONCENTRATION_LIMIT) {
    insights.push({
      id: "sector-concentration",
      icon: "layers",
      tone: "warning",
      title: `${topSector.name} is overweight at ${formatPercent(topSector.weight)}`,
      description: `More than ${SECTOR_CONCENTRATION_LIMIT}% in one sector raises exposure to sector-specific shocks. Direct new investments to other sectors.`,
    });
  }

  const owned = new Set(sectors.map((sector) => sector.name));
  const missing = referenceSectors.filter((sector) => !owned.has(sector));
  if (missing.length > 0) {
    insights.push({
      id: "sector-gaps",
      icon: "sparkles",
      tone: "info",
      title: `No exposure to ${missing.slice(0, 2).join(" or ")}`,
      description: `Defensive sectors like ${missing[0]} tend to cushion falls. A small SIP into a ${missing[0].toLowerCase()} fund or leader could improve balance.`,
    });
  }

  const losers = holdings.filter((holding) => holding.pnl < 0);
  if (losers.length > 0) {
    const totalLoss = Math.abs(sum(losers.map((holding) => holding.pnl)));
    insights.push({
      id: "tax-loss",
      icon: "flag",
      tone: "info",
      title: `Review ${losers.length} holding${losers.length > 1 ? "s" : ""} in loss`,
      description: `${losers.map((holding) => holding.name).join(" and ")} ${
        losers.length > 1 ? "are" : "is"
      } down ${formatInr(totalLoss)} in total. If your thesis has changed, booking the loss can offset capital gains this year.`,
    });
  }

  const usShare = sum(holdings.filter((holding) => holding.market === "US").map((holding) => holding.weight));
  if (usShare > 0) {
    insights.push({
      id: "global",
      icon: "globe",
      tone: "success",
      title: `${formatPercent(usShare)} in US stocks`,
      description:
        usShare < 20
          ? "Healthy global diversification that also hedges against rupee depreciation. Up to 20% is a common target."
          : "Global exposure is above 20%. Consider whether currency risk matches your goals.",
    });
  }

  return insights;
}

export function StocksDetailView({
  holdings,
  benchmark,
  referenceSectors = [],
  asOf,
  onBack,
}: StocksDetailViewProps) {
  const totalValue = sum(holdings.map((holding) => holding.quantity * holding.lastPrice));

  const enriched: EnrichedHolding[] = holdings
    .map((holding) => {
      const value = holding.quantity * holding.lastPrice;
      const invested = holding.quantity * holding.avgPrice;
      const pnl = value - invested;
      return {
        ...holding,
        value,
        invested,
        pnl,
        pnlPercent: invested ? (pnl / invested) * 100 : 0,
        weight: totalValue ? (value / totalValue) * 100 : 0,
        dayChange: value - value / (1 + holding.dayChangePercent / 100),
      };
    })
    .sort((a, b) => b.value - a.value);

  const totalInvested = sum(enriched.map((holding) => holding.invested));
  const totalPnl = totalValue - totalInvested;
  const totalPnlPercent = totalInvested ? (totalPnl / totalInvested) * 100 : 0;
  const dayChange = sum(enriched.map((holding) => holding.dayChange));
  const dayChangePercent = totalValue - dayChange ? (dayChange / (totalValue - dayChange)) * 100 : 0;
  const isUp = totalPnl >= 0;

  const sectorMap = new Map<string, { value: number; count: number }>();
  enriched.forEach((holding) => {
    const entry = sectorMap.get(holding.sector) ?? { value: 0, count: 0 };
    sectorMap.set(holding.sector, { value: entry.value + holding.value, count: entry.count + 1 });
  });
  const sectors: SectorSlice[] = Array.from(sectorMap.entries())
    .sort((a, b) => b[1].value - a[1].value)
    .map(([name, entry], index) => ({
      name,
      value: entry.value,
      count: entry.count,
      weight: totalValue ? (entry.value / totalValue) * 100 : 0,
      colorClassName: SECTOR_COLORS[index % SECTOR_COLORS.length],
    }));

  // Diversification score: half from effective number of holdings, half from effective number of sectors.
  const holdingHhi = sum(enriched.map((holding) => (holding.weight / 100) ** 2));
  const sectorHhi = sum(sectors.map((sector) => (sector.weight / 100) ** 2));
  const effectiveHoldings = holdingHhi ? 1 / holdingHhi : 0;
  const effectiveSectors = sectorHhi ? 1 / sectorHhi : 0;
  const diversificationScore = Math.round(
    Math.min(effectiveHoldings / 15, 1) * 50 + Math.min(effectiveSectors / 8, 1) * 50
  );
  const scoreLabel =
    diversificationScore >= 75
      ? "Well diversified"
      : diversificationScore >= 50
        ? "Moderate"
        : "Concentrated";
  const scoreVariant =
    diversificationScore >= 75 ? "success" : diversificationScore >= 50 ? "orange" : "error";

  const byReturn = [...enriched].sort((a, b) => b.pnlPercent - a.pnlPercent);
  const best = byReturn[0];
  const worst = byReturn[byReturn.length - 1];

  const indian = enriched.filter((holding) => holding.market === "IN");
  const us = enriched.filter((holding) => holding.market === "US");
  const insights = buildInsights(enriched, sectors, totalValue, referenceSectors);

  const alpha = benchmark ? benchmark.portfolioReturnPercent - benchmark.benchmarkReturnPercent : 0;
  const maxReturn = benchmark
    ? Math.max(Math.abs(benchmark.portfolioReturnPercent), Math.abs(benchmark.benchmarkReturnPercent), 1)
    : 1;

  return (
    <>
      {/* App bar */}
      <header className="border-subtle flex items-center justify-between border-b px-4 py-3">
        <button
          type="button"
          aria-label="Back to Net Worth"
          onClick={onBack}
          className="hover:bg-subtle text-subtle hover:text-default rounded-md p-1 transition">
          <Icon name="chevron-left" className="h-5 w-5" />
        </button>
        <h1 className="text-emphasis text-base font-semibold">Stocks</h1>
        <button
          type="button"
          aria-label="Refresh prices"
          className="hover:bg-subtle text-subtle hover:text-default rounded-md p-1 transition">
          <Icon name="refresh-cw" className="h-5 w-5" />
        </button>
      </header>

      <div className="space-y-6 px-4 pb-8 pt-6">
        {/* Hero */}
        <section className="text-center">
          <p className="text-subtle text-sm">Current value of your stocks</p>
          <p className="text-emphasis mt-2 text-3xl font-semibold leading-9 tabular-nums">
            {formatInr(totalValue)}
          </p>
          <div className="mt-3 flex items-center justify-center gap-2">
            <Badge variant={isUp ? "success" : "error"} startIcon={isUp ? "arrow-up" : "arrow-down"}>
              {formatSignedPercent(totalPnlPercent)} overall
            </Badge>
            <span className={classNames("text-xs font-medium tabular-nums", pnlTextClass(totalPnl))}>
              {formatSignedInr(totalPnl)}
            </span>
          </div>
          {asOf && <p className="text-muted mt-2 text-xs">Updated {asOf}</p>}
        </section>

        {/* Summary */}
        <section className="border-subtle grid grid-cols-2 gap-4 rounded-lg border p-4">
          <Stat label="Invested" value={formatInr(totalInvested)} />
          <Stat label="Current value" value={formatInr(totalValue)} align="right" />
          <Stat
            label="Overall P&L"
            value={`${formatSignedInr(totalPnl)} (${formatSignedPercent(totalPnlPercent)})`}
            valueClassName={pnlTextClass(totalPnl)}
          />
          <Stat
            label="Today's change"
            value={`${formatSignedInr(dayChange)} (${formatSignedPercent(dayChangePercent)})`}
            valueClassName={pnlTextClass(dayChange)}
            align="right"
          />
        </section>

        {/* Sector allocation */}
        <section>
          <SectionHeader title="Sector allocation" subtitle={`${sectors.length} sectors`} />
          <div className="border-subtle rounded-lg border p-4">
            <div
              className="bg-subtle flex h-2.5 w-full gap-0.5 overflow-hidden rounded-full"
              role="img"
              aria-label={sectors
                .map((sector) => `${sector.name} ${formatPercent(sector.weight)}`)
                .join(", ")}>
              {sectors.map((sector) => (
                <div
                  key={sector.name}
                  className={classNames("h-full", sector.colorClassName)}
                  style={{ width: `${sector.weight}%` }}
                />
              ))}
            </div>
            <ul className="mt-4 space-y-2.5">
              {sectors.map((sector) => {
                const isOverweight = sector.weight > SECTOR_CONCENTRATION_LIMIT;
                return (
                  <li key={sector.name} className="flex items-center gap-2 text-xs">
                    <span className={classNames("h-2 w-2 shrink-0 rounded-full", sector.colorClassName)} />
                    <span className="text-default flex-1 truncate font-medium">
                      {sector.name}
                      <span className="text-subtle font-normal">
                        {" "}
                        · {sector.count} stock{sector.count > 1 ? "s" : ""}
                      </span>
                    </span>
                    {isOverweight && (
                      <Badge variant="orange" size="sm">
                        Overweight
                      </Badge>
                    )}
                    <span className="text-subtle w-12 text-right tabular-nums">
                      {formatPercent(sector.weight)}
                    </span>
                    <span className="text-emphasis w-20 text-right font-medium tabular-nums">
                      {formatInr(sector.value)}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        </section>

        {/* Holdings */}
        {indian.length > 0 && (
          <section>
            <SectionHeader
              title="Indian stocks"
              subtitle={`${indian.length} holdings · NSE/BSE`}
              trailing={formatInr(sum(indian.map((holding) => holding.value)))}
            />
            <ul className="border-subtle divide-subtle divide-y rounded-lg border">
              {indian.map((holding) => (
                <HoldingRow key={holding.symbol} holding={holding} />
              ))}
            </ul>
          </section>
        )}

        {us.length > 0 && (
          <section>
            <SectionHeader
              title="US stocks"
              subtitle={`${us.length} holdings · values in ₹`}
              trailing={formatInr(sum(us.map((holding) => holding.value)))}
            />
            <ul className="border-subtle divide-subtle divide-y rounded-lg border">
              {us.map((holding) => (
                <HoldingRow key={holding.symbol} holding={holding} />
              ))}
            </ul>
          </section>
        )}

        {/* Insights */}
        <section>
          <SectionHeader title="Portfolio insights" subtitle="Based on your current holdings" />
          <div className="space-y-3">
            {/* Diversification + performers */}
            <div className="border-subtle rounded-lg border p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-subtle text-xs">Diversification score</p>
                  <p className="text-emphasis mt-1 text-xl font-semibold tabular-nums">
                    {diversificationScore}
                    <span className="text-subtle text-sm font-normal">/100</span>
                  </p>
                </div>
                <Badge variant={scoreVariant} startIcon="shield-check">
                  {scoreLabel}
                </Badge>
              </div>
              <div className="bg-subtle mt-3 h-1.5 w-full overflow-hidden rounded-full">
                <div
                  className="bg-visualization-4-emphasis h-full rounded-full"
                  style={{ width: `${diversificationScore}%` }}
                />
              </div>
              <p className="text-subtle mt-2 text-xs">
                Behaves like {effectiveHoldings.toFixed(1)} equally weighted stocks across{" "}
                {effectiveSectors.toFixed(1)} sectors.
              </p>
              {best && worst && best !== worst && (
                <div className="border-subtle mt-4 grid grid-cols-2 gap-4 border-t pt-4">
                  <div>
                    <p className="text-subtle flex items-center gap-1 text-xs">
                      <Icon name="arrow-up" className="text-success h-3 w-3" />
                      Best performer
                    </p>
                    <p className="text-emphasis mt-1 truncate text-sm font-medium">{best.name}</p>
                    <p
                      className={classNames(
                        "text-xs font-medium tabular-nums",
                        pnlTextClass(best.pnlPercent)
                      )}>
                      {formatSignedPercent(best.pnlPercent)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-subtle flex items-center justify-end gap-1 text-xs">
                      <Icon name="arrow-down" className="text-error h-3 w-3" />
                      Worst performer
                    </p>
                    <p className="text-emphasis mt-1 truncate text-sm font-medium">{worst.name}</p>
                    <p
                      className={classNames(
                        "text-xs font-medium tabular-nums",
                        pnlTextClass(worst.pnlPercent)
                      )}>
                      {formatSignedPercent(worst.pnlPercent)}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Benchmark */}
            {benchmark && (
              <div className="border-subtle rounded-lg border p-4">
                <div className="flex items-center justify-between">
                  <p className="text-emphasis text-sm font-medium">
                    vs {benchmark.name} · {benchmark.period}
                  </p>
                  <Badge variant={alpha >= 0 ? "success" : "error"} size="sm">
                    {alpha >= 0 ? "Outperforming" : "Underperforming"}
                  </Badge>
                </div>
                <div className="mt-3 space-y-2.5">
                  {[
                    {
                      label: "Your stocks",
                      value: benchmark.portfolioReturnPercent,
                      color: "bg-visualization-3-emphasis",
                    },
                    { label: benchmark.name, value: benchmark.benchmarkReturnPercent, color: "bg-emphasis" },
                  ].map((row) => (
                    <div key={row.label} className="flex items-center gap-2 text-xs">
                      <span className="text-subtle w-20 shrink-0 truncate">{row.label}</span>
                      <div className="bg-subtle h-2 flex-1 overflow-hidden rounded-full">
                        <div
                          className={classNames("h-full rounded-full", row.color)}
                          style={{ width: `${(Math.abs(row.value) / maxReturn) * 100}%` }}
                        />
                      </div>
                      <span
                        className={classNames(
                          "w-14 text-right font-medium tabular-nums",
                          pnlTextClass(row.value)
                        )}>
                        {formatSignedPercent(row.value)}
                      </span>
                    </div>
                  ))}
                </div>
                <p className="text-subtle mt-3 text-xs">
                  You are {alpha >= 0 ? "ahead of" : "behind"} the {benchmark.name} by{" "}
                  <span className={classNames("font-medium", pnlTextClass(alpha))}>
                    {formatPercent(Math.abs(alpha))}
                  </span>{" "}
                  over the {benchmark.period === "1Y" ? "last year" : benchmark.period}.
                </p>
              </div>
            )}

            {/* Actionable suggestions */}
            {insights.length > 0 && (
              <ul className="border-subtle divide-subtle divide-y rounded-lg border">
                {insights.map((insight) => (
                  <li key={insight.id} className="flex gap-3 p-4">
                    <div
                      className={classNames(
                        "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                        toneStyles[insight.tone]
                      )}>
                      <Icon name={insight.icon} className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-emphasis text-sm font-medium">{insight.title}</p>
                      <p className="text-subtle mt-0.5 text-xs leading-5">{insight.description}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <p className="text-muted mt-3 flex items-start gap-1.5 px-1 text-[11px]">
            <Icon name="info" className="mt-0.5 h-3 w-3 shrink-0" />
            Insights are for information only and are not investment advice.
          </p>
        </section>
      </div>
    </>
  );
}

export default StocksDetailView;
