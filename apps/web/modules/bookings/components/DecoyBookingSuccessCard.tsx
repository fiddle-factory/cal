import * as React from "react";

import { useLocale } from "@calcom/lib/hooks/useLocale";
import { Badge } from "@calcom/ui/components/badge";
import { Icon } from "@calcom/ui/components/icon";

// Defaults are the "visualization emphasis" tokens from packages/config/theme/tokens.css
const CONFETTI_DEFAULT_COLORS = {
  colorA: "#6634EE", // --cal-bg-visualization-2-emphasis
  colorB: "#19A974", // --cal-bg-visualization-4-emphasis
  colorC: "#E7B008", // --cal-bg-visualization-5-emphasis
  colorD: "#EC4699", // --cal-bg-visualization-1-emphasis
};

const CONFETTI_BASE_DURATION_S = 3.5;

const CONFETTI_KEYFRAMES = `
@keyframes cal-confetti-fall {
  0% { transform: translate3d(0, -10vh, 0) rotate(0deg); opacity: 1; }
  80% { opacity: 1; }
  100% { transform: translate3d(var(--cal-confetti-drift), 105vh, 0) rotate(var(--cal-confetti-rotate)); opacity: 0; }
}
@keyframes cal-confetti-flip {
  0% { transform: rotate3d(1, 1, 0, 0deg); }
  100% { transform: rotate3d(1, 1, 0, 360deg); }
}
@media (prefers-reduced-motion: reduce) {
  .cal-confetti { display: none; }
}
`;

// Small deterministic PRNG so server and client render the same pieces
function createRandom(seed: number) {
  let state = seed;
  return () => {
    state |= 0;
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

interface BookingConfettiProps {
  count: number;
  speed: number;
  size: number;
  colors: string[];
}

function BookingConfetti({ count, speed, size, colors }: BookingConfettiProps) {
  const pieces = React.useMemo(() => {
    const random = createRandom(42);
    const safeSpeed = Math.max(speed, 0.05);
    return Array.from({ length: Math.max(0, Math.round(count)) }, (_, index) => {
      const scale = 0.6 + random() * 0.8;
      return {
        id: index,
        left: random() * 100,
        width: size * scale,
        height: size * scale * (random() > 0.5 ? 0.45 : 1),
        round: random() > 0.75,
        color: colors[index % colors.length],
        duration: (CONFETTI_BASE_DURATION_S * (0.75 + random() * 0.5)) / safeSpeed,
        delay: (random() * 1.5) / safeSpeed,
        flipDuration: (0.6 + random() * 0.8) / safeSpeed,
        drift: (random() - 0.5) * 30,
        rotate: (random() > 0.5 ? 1 : -1) * (360 + random() * 540),
      };
    });
  }, [count, speed, size, colors]);

  return (
    <div
      className="cal-confetti pointer-events-none fixed inset-0 z-50 overflow-hidden"
      aria-hidden="true"
      style={{ perspective: "800px" }}>
      <style>{CONFETTI_KEYFRAMES}</style>
      {pieces.map((piece) => (
        <span
          key={piece.id}
          className="absolute top-0 block"
          style={
            {
              left: `${piece.left}%`,
              "--cal-confetti-drift": `${piece.drift}vw`,
              "--cal-confetti-rotate": `${piece.rotate}deg`,
              animation: `cal-confetti-fall ${piece.duration}s cubic-bezier(0.25, 0.46, 0.45, 0.94) ${piece.delay}s both`,
            } as React.CSSProperties
          }>
          <span
            className="block"
            style={{
              width: `${piece.width}px`,
              height: `${piece.height}px`,
              backgroundColor: piece.color,
              borderRadius: piece.round ? "9999px" : "2px",
              animation: `cal-confetti-flip ${piece.flipDuration}s linear infinite`,
            }}
          />
        </span>
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
  const [confettiCount, setConfettiCount] = React.useState(120);
  const [confettiSpeed, setConfettiSpeed] = React.useState(1);
  const [confettiSize, setConfettiSize] = React.useState(10);
  const [confettiColorA, setConfettiColorA] = React.useState(CONFETTI_DEFAULT_COLORS.colorA);
  const [confettiColorB, setConfettiColorB] = React.useState(CONFETTI_DEFAULT_COLORS.colorB);
  const [confettiColorC, setConfettiColorC] = React.useState(CONFETTI_DEFAULT_COLORS.colorC);
  const [confettiColorD, setConfettiColorD] = React.useState(CONFETTI_DEFAULT_COLORS.colorD);

  const confettiColors = React.useMemo(
    () => [confettiColorA, confettiColorB, confettiColorC, confettiColorD],
    [confettiColorA, confettiColorB, confettiColorC, confettiColorD]
  );

  // geneditor-listener-start
  React.useEffect(() => {
    const el = document.querySelector('[data-config-id="SourceRouteStory-main-0"]');
    if (!el) return;
    const handler = (e: Event) => {
      const p = (e as CustomEvent).detail as Record<string, unknown>;
      if (typeof p.confettiCount === "number") setConfettiCount(p.confettiCount);
      if (typeof p.confettiSpeed === "number") setConfettiSpeed(p.confettiSpeed);
      if (typeof p.confettiSize === "number") setConfettiSize(p.confettiSize);
      if (typeof p.confettiColorA === "string") setConfettiColorA(p.confettiColorA);
      if (typeof p.confettiColorB === "string") setConfettiColorB(p.confettiColorB);
      if (typeof p.confettiColorC === "string") setConfettiColorC(p.confettiColorC);
      if (typeof p.confettiColorD === "string") setConfettiColorD(p.confettiColorD);
    };
    el.addEventListener("animation:update", handler);
    return () => el.removeEventListener("animation:update", handler);
  }, []);
  // geneditor-listener-end

  return (
    <div className="h-screen">
      <BookingConfetti
        key={`${confettiCount}-${confettiSpeed}-${confettiSize}-${confettiColors.join("")}`}
        count={confettiCount}
        speed={confettiSpeed}
        size={confettiSize}
        colors={confettiColors}
      />
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
