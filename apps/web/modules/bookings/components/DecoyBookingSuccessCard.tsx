"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";

import { useLocale } from "@calcom/lib/hooks/useLocale";
import { Badge } from "@calcom/ui/components/badge";
import { Icon } from "@calcom/ui/components/icon";

// Design-system palette (Tailwind tokens used across @calcom/ui badges and semantic states)
const CONFETTI_PALETTE = [
  "#3b82f6", // blue-500 (info)
  "#f59e0b", // amber-500 (attention)
  "#ec4899", // pink-500
  "#8b5cf6", // violet-500
  "#22c55e", // green-500 (success)
];

interface ConfettiBurstProps {
  accentColor: string;
  count: number;
  spread: number;
  duration: number;
  size: number;
  enabled: boolean;
}

// Deterministic pseudo-random so the burst is stable between renders
function seeded(index: number, salt: number) {
  const x = Math.sin(index * 12.9898 + salt * 78.233) * 43758.5453;
  return x - Math.floor(x);
}

function ConfettiBurst({ accentColor, count, spread, duration, size, enabled }: ConfettiBurstProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const pieces = useMemo(
    () =>
      Array.from({ length: Math.max(0, Math.round(count)) }, (_, i) => {
        const angle = (i / Math.max(1, count)) * Math.PI * 2 + seeded(i, 1) * 0.6;
        const distance = 0.45 + seeded(i, 2) * 0.55;
        const colors = [accentColor, ...CONFETTI_PALETTE];
        return {
          angle,
          distance,
          color: colors[i % colors.length],
          rotation: (seeded(i, 3) - 0.5) * 720,
          aspect: seeded(i, 4) > 0.5 ? 0.45 : 1,
          round: seeded(i, 5) > 0.7,
          delay: seeded(i, 6) * 120,
          scale: 0.7 + seeded(i, 7) * 0.6,
        };
      }),
    [count, accentColor]
  );

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !enabled) return;
    const reduceMotion =
      typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) return;

    const animations: Animation[] = [];
    const nodes = Array.from(container.children) as HTMLElement[];
    nodes.forEach((node, i) => {
      const piece = pieces[i];
      if (!piece || typeof node.animate !== "function") return;
      const dx = Math.cos(piece.angle) * spread * piece.distance;
      const dy = Math.sin(piece.angle) * spread * piece.distance;
      animations.push(
        node.animate(
          [
            { transform: "translate(-50%, -50%) translate(0px, 0px) rotate(0deg) scale(0.3)", opacity: 0 },
            {
              transform: `translate(-50%, -50%) translate(${dx * 0.85}px, ${dy * 0.85}px) rotate(${
                piece.rotation * 0.6
              }deg) scale(${piece.scale})`,
              opacity: 1,
              offset: 0.35,
            },
            {
              transform: `translate(-50%, -50%) translate(${dx}px, ${dy + spread * 0.35}px) rotate(${
                piece.rotation
              }deg) scale(${piece.scale * 0.8})`,
              opacity: 0,
            },
          ],
          {
            duration,
            delay: piece.delay,
            easing: "cubic-bezier(0.16, 1, 0.3, 1)",
            fill: "both",
          }
        )
      );
    });
    return () => animations.forEach((animation) => animation.cancel());
  }, [pieces, spread, duration, enabled]);

  if (!enabled) return null;

  return (
    <div ref={containerRef} className="pointer-events-none absolute inset-0" aria-hidden="true">
      {pieces.map((piece, i) => (
        <span
          key={i}
          className="absolute left-1/2 top-1/2 block"
          style={{
            width: size * piece.aspect,
            height: size,
            backgroundColor: piece.color,
            borderRadius: piece.round ? "9999px" : "2px",
            opacity: 0,
            transform: "translate(-50%, -50%)",
          }}
        />
      ))}
    </div>
  );
}

export interface DecoyBookingSuccessCardProps {
  title: string;
  formattedDate: string;
  formattedTime: string;
  endTime: string;
  formattedTimeZone: string;
  hostName: string | null;
  hostEmail: string | null;
  attendeeName: string | null;
  attendeeEmail: string | null;
  location: string | null;
}

export function DecoyBookingSuccessCard({
  title,
  formattedDate,
  formattedTime,
  endTime,
  formattedTimeZone,
  hostName,
  hostEmail,
  attendeeName,
  attendeeEmail,
  location,
}: DecoyBookingSuccessCardProps) {
  const { t } = useLocale();
  const [confettiColor, setConfettiColor] = useState("#16a34a");
  const [confettiCount, setConfettiCount] = useState(36);
  const [confettiSpread, setConfettiSpread] = useState(110);
  const [confettiDuration, setConfettiDuration] = useState(1600);
  const [confettiSize, setConfettiSize] = useState(8);
  const [confettiEnabled, setConfettiEnabled] = useState(true);

  // geneditor-listener-start
  React.useEffect(() => {
    const el = document.querySelector('[data-config-id="DecoyBookingSuccessCard-controls"]');
    if (!el) return;
    const handler = (e: Event) => {
      const p = (e as CustomEvent).detail as Record<string, unknown>;
      if (typeof p.confettiColor === "string") setConfettiColor(p.confettiColor);
      if (typeof p.confettiCount === "number") setConfettiCount(p.confettiCount);
      if (typeof p.confettiSpread === "number") setConfettiSpread(p.confettiSpread);
      if (typeof p.confettiDuration === "number") setConfettiDuration(p.confettiDuration);
      if (typeof p.confettiSize === "number") setConfettiSize(p.confettiSize);
      if (typeof p.confettiEnabled === "boolean") setConfettiEnabled(p.confettiEnabled);
    };
    el.addEventListener("animation:update", handler);
    return () => el.removeEventListener("animation:update", handler);
  }, []);
  // geneditor-listener-end

  return (
    <div className="h-screen">
      <main className="mx-auto max-w-3xl">
        <div className="overflow-y-auto">
          <div className="flex items-end justify-center px-4 pb-20 pt-4 text-center sm:flex sm:p-0">
            <div className="main inset-0 my-4 flex flex-col transition-opacity sm:my-0" aria-hidden="true">
              <div
                className="bg-default dark:bg-cal-muted border-booker border-booker-width inline-block transform overflow-hidden rounded-lg px-8 pb-4 pt-5 text-left align-bottom transition-all sm:my-8 sm:w-full sm:max-w-xl sm:py-8 sm:align-middle"
                role="dialog"
                aria-modal="true"
                aria-labelledby="modal-headline">
                <div className="relative" data-config-id="DecoyBookingSuccessCard-controls">
                  <ConfettiBurst
                    accentColor={confettiColor}
                    count={confettiCount}
                    spread={confettiSpread}
                    duration={confettiDuration}
                    size={confettiSize}
                    enabled={confettiEnabled}
                  />
                  <div className="bg-cal-success relative z-10 mx-auto flex h-12 w-12 items-center justify-center rounded-full">
                    <Icon name="check" className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                </div>
                <div className="mb-8 mt-6 text-center last:mb-0">
                  <h3 className="text-emphasis text-2xl font-semibold leading-6" id="modal-headline">
                    {t("meeting_is_scheduled")}
                  </h3>

                  <div className="mt-3">
                    <p className="text-default">{t("emailed_you_and_any_other_attendees")}</p>
                  </div>

                  <div className="border-subtle text-default mt-8 grid grid-cols-3 gap-x-4 border-t pt-8 text-left rtl:text-right sm:gap-x-0">
                    <div className="font-medium">{t("what")}</div>
                    <div className="col-span-2 mb-6 last:mb-0">{title}</div>

                    {formattedDate && (
                      <>
                        <div className="font-medium">{t("when")}</div>
                        <div className="col-span-2 mb-6 last:mb-0">
                          {formattedDate}
                          {formattedTime && (
                            <>
                              <br />
                              {formattedTime}
                              {endTime && ` - ${endTime}`}
                              {formattedTimeZone && (
                                <span className="text-bookinglight"> ({formattedTimeZone})</span>
                              )}
                            </>
                          )}
                        </div>
                      </>
                    )}

                    <div className="font-medium">{t("who")}</div>
                    <div className="col-span-2 last:mb-0">
                      {hostName && (
                        <div className="mb-3">
                          <div>
                            <span className="mr-2">{hostName}</span>
                            <Badge variant="blue">{t("Host")}</Badge>
                          </div>
                          {hostEmail && <p className="text-default">{hostEmail}</p>}
                        </div>
                      )}
                      {attendeeName && (
                        <div className="mb-3 last:mb-0">
                          <p>{attendeeName}</p>
                          {attendeeEmail && <p>{attendeeEmail}</p>}
                        </div>
                      )}
                    </div>

                    {location && (
                      <>
                        <div className="mt-3 font-medium">{t("where")}</div>
                        <div className="col-span-2 mt-3">{t("web_conferencing_details_to_follow")}</div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
