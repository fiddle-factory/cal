import * as React from "react";

import { useLocale } from "@calcom/lib/hooks/useLocale";
import { Badge } from "@calcom/ui/components/badge";
import { Icon } from "@calcom/ui/components/icon";

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

type ConfettiPiece = {
  id: number;
  color: string;
  width: number;
  height: number;
  round: boolean;
  dx: number;
  dy: number;
  rotate: number;
  delay: number;
};

function createConfettiPieces(count: number, colors: string[], spread: number): ConfettiPiece[] {
  return Array.from({ length: count }, (_, id) => {
    // Fan upward from the success icon, slightly wider than a semicircle
    const angle = (-170 + Math.random() * 160) * (Math.PI / 180);
    const velocity = spread * (0.45 + Math.random() * 0.55);
    const round = Math.random() < 0.3;
    const size = 6 + Math.random() * 4;
    return {
      id,
      color: colors[id % colors.length],
      width: size,
      height: round ? size : size * 0.45,
      round,
      dx: Math.cos(angle) * velocity,
      dy: Math.sin(angle) * velocity,
      rotate: (Math.random() < 0.5 ? -1 : 1) * (360 + Math.random() * 540),
      delay: Math.random() * 120,
    };
  });
}

function ConfettiBurst({
  burstKey,
  colors,
  pieceCount,
  duration,
  spread,
}: {
  burstKey: string;
  colors: string[];
  pieceCount: number;
  duration: number;
  spread: number;
}) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const pieces = React.useMemo(
    () => createConfettiPieces(pieceCount, colors, spread),
    // burstKey replays the burst whenever a setting changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [burstKey]
  );

  React.useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    const gravity = spread * 1.6;
    const animations = Array.from(container.children).map((child, index) => {
      const piece = pieces[index];
      const steps = [0, 0.15, 0.35, 0.6, 0.8, 1];
      const keyframes: Keyframe[] = steps.map((t) => ({
        offset: t,
        opacity: t < 0.7 ? 1 : 1 - (t - 0.7) / 0.3,
        transform: `translate(${piece.dx * t}px, ${piece.dy * t + gravity * t * t}px) rotate(${
          piece.rotate * t
        }deg) scale(${t === 0 ? 0.4 : 1})`,
      }));
      return (child as HTMLElement).animate(keyframes, {
        duration,
        delay: piece.delay,
        easing: "cubic-bezier(0.15, 0.7, 0.35, 1)",
        fill: "both",
      });
    });
    return () => animations.forEach((animation) => animation.cancel());
  }, [pieces, duration, spread]);

  return (
    <div ref={containerRef} aria-hidden="true" className="pointer-events-none absolute inset-0 z-10">
      {pieces.map((piece) => (
        <span
          key={piece.id}
          className="absolute left-1/2 top-11 sm:top-14"
          style={{
            width: piece.width,
            height: piece.height,
            marginLeft: -piece.width / 2,
            backgroundColor: piece.color,
            borderRadius: piece.round ? "9999px" : "1px",
            opacity: 0,
          }}
        />
      ))}
    </div>
  );
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
  const [confettiEnabled, setConfettiEnabled] = React.useState(true);
  const [confettiPrimaryColor, setConfettiPrimaryColor] = React.useState("#111827");
  const [confettiSuccessColor, setConfettiSuccessColor] = React.useState("#16a34a");
  const [confettiAccentColor, setConfettiAccentColor] = React.useState("#3b82f6");
  const [confettiPieceCount, setConfettiPieceCount] = React.useState(60);
  const [confettiDuration, setConfettiDuration] = React.useState(2200);
  const [confettiSpread, setConfettiSpread] = React.useState(260);

  // geneditor-listener-start
  React.useEffect(() => {
    const el = document.querySelector('[data-config-id="DecoyBookingSuccessCard-div-4"]');
    if (!el) return;
    const handler = (e: Event) => {
      const p = (e as CustomEvent).detail as Record<string, unknown>;
      if (typeof p.confettiEnabled === "boolean") setConfettiEnabled(p.confettiEnabled);
      if (typeof p.confettiPrimaryColor === "string") setConfettiPrimaryColor(p.confettiPrimaryColor);
      if (typeof p.confettiSuccessColor === "string") setConfettiSuccessColor(p.confettiSuccessColor);
      if (typeof p.confettiAccentColor === "string") setConfettiAccentColor(p.confettiAccentColor);
      if (typeof p.confettiPieceCount === "number") setConfettiPieceCount(p.confettiPieceCount);
      if (typeof p.confettiDuration === "number") setConfettiDuration(p.confettiDuration);
      if (typeof p.confettiSpread === "number") setConfettiSpread(p.confettiSpread);
    };
    el.addEventListener("animation:update", handler);
    return () => el.removeEventListener("animation:update", handler);
  }, []);
  // geneditor-listener-end

  const confettiColors = [confettiPrimaryColor, confettiSuccessColor, confettiAccentColor, "#f59e0b"];
  const confettiKey = [
    confettiPieceCount,
    confettiDuration,
    confettiSpread,
    confettiPrimaryColor,
    confettiSuccessColor,
    confettiAccentColor,
  ].join("|");

  return (
    <div className="h-screen">
      <main className="mx-auto max-w-3xl">
        <div className="overflow-y-auto">
          <div className="flex items-end justify-center px-4 pb-20 pt-4 text-center sm:flex sm:p-0">
            <div className="main inset-0 my-4 flex flex-col transition-opacity sm:my-0" aria-hidden="true">
              <div
                data-config-id="DecoyBookingSuccessCard-div-4"
                className="bg-default dark:bg-cal-muted border-booker border-booker-width relative inline-block transform overflow-hidden rounded-lg px-8 pb-4 pt-5 text-left align-bottom transition-all sm:my-8 sm:w-full sm:max-w-xl sm:py-8 sm:align-middle"
                role="dialog"
                aria-modal="true"
                aria-labelledby="modal-headline">
                {confettiEnabled && (
                  <ConfettiBurst
                    key={confettiKey}
                    burstKey={confettiKey}
                    colors={confettiColors}
                    pieceCount={confettiPieceCount}
                    duration={confettiDuration}
                    spread={confettiSpread}
                  />
                )}
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
