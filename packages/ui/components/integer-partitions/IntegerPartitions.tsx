"use client";

import { useId, useMemo, useState } from "react";

import classNames from "@calcom/ui/classNames";

export const MIN_PARTITION_N = 1;
export const MAX_PARTITION_N = 15;

const ROW_COLORS = ["#6b78cc", "#4fa07c", "#e0a552", "#d27b78", "#977dc6"] as const;

/** Returns all partitions of n, each with parts in descending order, listed in reverse lexicographic order. */
export function getPartitions(n: number): number[][] {
  const result: number[][] = [];
  const build = (remaining: number, maxPart: number, current: number[]) => {
    if (remaining === 0) {
      result.push([...current]);
      return;
    }
    for (let part = Math.min(remaining, maxPart); part >= 1; part--) {
      current.push(part);
      build(remaining - part, part, current);
      current.pop();
    }
  };
  build(n, n, []);
  return result;
}

const clampN = (value: number) => Math.min(MAX_PARTITION_N, Math.max(MIN_PARTITION_N, Math.round(value)));

export interface IntegerPartitionsProps {
  defaultN?: number;
  className?: string;
}

export function IntegerPartitions({ defaultN = 5, className }: IntegerPartitionsProps) {
  const inputId = useId();
  const [rawValue, setRawValue] = useState(String(clampN(defaultN)));
  const [n, setN] = useState(clampN(defaultN));

  const partitions = useMemo(() => getPartitions(n), [n]);

  const handleChange = (value: string) => {
    setRawValue(value);
    const parsed = Number(value);
    if (value.trim() === "" || !Number.isFinite(parsed)) return;
    setN(clampN(parsed));
  };

  return (
    <div className={classNames("min-h-full bg-[#111111] p-4 font-sans text-white", className)}>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
        <h2 className="font-cal text-2xl font-semibold leading-tight">
          The {partitions.length} {partitions.length === 1 ? "partition" : "partitions"} of {n}
        </h2>
        <label htmlFor={inputId} className="flex items-center gap-2 text-sm text-gray-400">
          n
          <input
            id={inputId}
            type="number"
            inputMode="numeric"
            min={MIN_PARTITION_N}
            max={MAX_PARTITION_N}
            step={1}
            value={rawValue}
            onChange={(e) => handleChange(e.target.value)}
            onBlur={() => setRawValue(String(n))}
            className="h-8 w-20 rounded-md border border-gray-700 bg-[#1c1c1c] px-2 text-sm text-white outline-none transition focus:border-gray-400 focus:ring-2 focus:ring-gray-600"
          />
        </label>
      </div>

      <ol className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-x-4 gap-y-2">
        {partitions.map((parts, rowIndex) => {
          const color = ROW_COLORS[rowIndex % ROW_COLORS.length];
          return (
            <li key={parts.join("+")} className="contents">
              <span className="min-w-[2rem] text-base tabular-nums text-gray-500">{rowIndex + 1}</span>
              <div className="flex h-10 min-w-0 gap-1.5">
                {parts.map((part, partIndex) => (
                  <div
                    key={partIndex}
                    className="h-full rounded"
                    style={{ flexGrow: part, flexBasis: 0, backgroundColor: color }}
                  />
                ))}
              </div>
              <span className="whitespace-nowrap pl-4 text-right text-lg tabular-nums">
                {parts.join(" + ")}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
