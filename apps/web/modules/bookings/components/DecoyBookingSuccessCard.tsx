import { useLocale } from "@calcom/lib/hooks/useLocale";
import { Badge } from "@calcom/ui/components/badge";
import { Icon } from "@calcom/ui/components/icon";
import React, { useEffect, useMemo, useRef, useState } from "react";

// Design-system visualization / semantic tokens used as the confetti palette
const CONFETTI_COLORS = [
  "var(--cal-bg-visualization-1-emphasis, hsla(330, 81%, 60%, 1))",
  "var(--cal-bg-visualization-2-emphasis, hsla(256, 85%, 57%, 1))",
  "var(--cal-bg-visualization-3-emphasis, hsla(235, 100%, 63%, 1))",
  "var(--cal-bg-semantic-success-emphasis, hsla(158, 74%, 38%, 1))",
  "var(--cal-bg-visualization-5-emphasis, hsla(45, 93%, 47%, 1))",
  "var(--cal-bg-visualization-6-emphasis, hsla(25, 95%, 53%, 1))",
  "var(--cal-bg-visualization-7-emphasis, hsla(0, 84%, 60%, 1))",
];

interface ConfettiPiece {
  color: string;
  angle: number;
  velocity: number;
  drift: number;
  rotation: number;
  delay: number;
  shape: "rect" | "circle" | "strip";
  sizeFactor: number;
}

function createPieces(count: number): ConfettiPiece[] {
  return Array.from({ length: count }, (_, i) => {
    const shapeRoll = Math.random();
    return {
      color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
      // mostly upward, fanned left/right
      angle: -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 0.9,
      velocity: 0.55 + Math.random() * 0.45,
      drift: (Math.random() - 0.5) * 0.6,
      rotation: (Math.random() - 0.5) * 1440,
      delay: Math.random() * 0.12,
      shape: shapeRoll < 0.5 ? "rect" : shapeRoll < 0.75 ? "strip" : "circle",
      sizeFactor: 0.7 + Math.random() * 0.6,
    };
  });
}

function ConfettiBurst() {
  const [confettiEnabled, setConfettiEnabled] = useState(true);
  const [confettiCount, setConfettiCount] = useState(90);
  const [confettiDuration, setConfettiDuration] = useState(3.2);
  const [confettiSpread, setConfettiSpread] = useState(420);
  const [confettiSize, setConfettiSize] = useState(9);
  const [confettiOriginY, setConfettiOriginY] = useState(22);
  const containerRef = useRef<HTMLDivElement>(null);

  // geneditor-listener-start
  React.useEffect(() => {
    const el = document.querySelector('[data-config-id="SourceRouteStory-main-0"]');
    if (!el) return;
    const handler = (e: Event) => {
      const p = (e as CustomEvent).detail as Record<string, unknown>;
      if (typeof p.confettiEnabled === "boolean") setConfettiEnabled(p.confettiEnabled);
      if (typeof p.confettiCount === "number") setConfettiCount(p.confettiCount);
      if (typeof p.confettiDuration === "number") setConfettiDuration(p.confettiDuration);
      if (typeof p.confettiSpread === "number") setConfettiSpread(p.confettiSpread);
      if (typeof p.confettiSize === "number") setConfettiSize(p.confettiSize);
      if (typeof p.confettiOriginY === "number") setConfettiOriginY(p.confettiOriginY);
    };
    el.addEventListener("animation:update", handler);
    return () => el.removeEventListener("animation:update", handler);
  }, []);
  // geneditor-listener-end

  const pieces = useMemo(() => createPieces(Math.round(confettiCount)), [confettiCount]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !confettiEnabled) return;
    if (typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;

    const fallDistance = Math.max(window.innerHeight, 600);
    const durationMs = confettiDuration * 1000;
    const nodes = Array.from(container.children) as HTMLElement[];
    const animations = nodes.map((node, i) => {
      const piece = pieces[i];
      if (!piece) return null;
      const burstX = Math.cos(piece.angle) * confettiSpread * piece.velocity;
      const burstY = Math.sin(piece.angle) * confettiSpread * 0.75 * piece.velocity;
      const endX = burstX * 1.25 + piece.drift * confettiSpread;
      return node.animate(
        [
          { transform: "translate(-50%, -50%) translate(0px, 0px) rotate(0deg) scale(0.3)", opacity: 1 },
          {
            transform: `translate(-50%, -50%) translate(${burstX}px, ${burstY}px) rotate(${piece.rotation * 0.3}deg) scale(1)`,
            opacity: 1,
            offset: 0.22,
            easing: "cubic-bezier(0.33, 0, 0.67, 1)",
          },
          {
            transform: `translate(-50%, -50%) translate(${(burstX + endX) / 2}px, ${fallDistance * 0.4}px) rotate(${piece.rotation * 0.7}deg) scale(1)`,
            opacity: 1,
            offset: 0.7,
          },
          {
            transform: `translate(-50%, -50%) translate(${endX}px, ${fallDistance}px) rotate(${piece.rotation}deg) scale(0.9)`,
            opacity: 0,
          },
        ],
        {
          duration: durationMs,
          delay: piece.delay * 1000,
          easing: "cubic-bezier(0.15, 0.6, 0.45, 1)",
          fill: "both",
        }
      );
    });

    return () => {
      animations.forEach((a) => a?.cancel());
    };
  }, [pieces, confettiEnabled, confettiDuration, confettiSpread, confettiSize, confettiOriginY]);

  if (!confettiEnabled) return null;

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-50 overflow-hidden"
      data-testid="booking-confetti">
      {pieces.map((piece, i) => {
        const base = confettiSize * piece.sizeFactor;
        const width = piece.shape === "strip" ? base * 0.45 : base;
        const height = piece.shape === "strip" ? base * 1.8 : piece.shape === "rect" ? base * 0.6 : base;
        return (
          <span
            key={i}
            style={{
              position: "absolute",
              left: "50%",
              top: `${confettiOriginY}%`,
              width,
              height,
              backgroundColor: piece.color,
              borderRadius: piece.shape === "circle" ? "9999px" : "2px",
              opacity: 0,
              willChange: "transform, opacity",
            }}
          />
        );
      })}
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

  return (
    <div className="h-screen">
      <ConfettiBurst />
      <main className="mx-auto max-w-3xl">
        <div className="overflow-y-auto">
          <div className="flex items-end justify-center px-4 pb-20 pt-4 text-center sm:flex sm:p-0">
            <div className="main inset-0 my-4 flex flex-col transition-opacity sm:my-0" aria-hidden="true">
              <div
                className="bg-default dark:bg-cal-muted border-booker border-booker-width inline-block transform overflow-hidden rounded-lg px-8 pb-4 pt-5 text-left align-bottom transition-all sm:my-8 sm:w-full sm:max-w-xl sm:py-8 sm:align-middle"
                role="dialog"
                aria-modal="true"
                aria-labelledby="modal-headline">
                <div>
                  <div className="bg-cal-success mx-auto flex h-12 w-12 items-center justify-center rounded-full">
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
