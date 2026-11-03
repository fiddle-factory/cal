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
          className="absolute left-14 top-14 sm:left-16 sm:top-16 rtl:left-auto rtl:right-14 sm:rtl:right-16"
          style={{
            width: piece.width,
            height: piece.height,
            marginLeft: -piece.width / 2,
            marginTop: -piece.height / 2,
            backgroundColor: piece.color,
            borderRadius: piece.round ? "9999px" : "1px",
            opacity: 0,
          }}
        />
      ))}
    </div>
  );
}

const SERIF_STACK =
  '"Tiempos Headline", "Iowan Old Style", "Palatino Linotype", Palatino, "Book Antiqua", Georgia, ui-serif, serif';

// Deterministic pseudo-random so server and client render the same torn edges
function seededRandom(seed: number) {
  let value = seed;
  return () => {
    value = (value * 16807) % 2147483647;
    return (value - 1) / 2147483646;
  };
}

function tornBandPath(center: number, width: number, seed: number, height = 900): string {
  const rand = seededRandom(seed);
  const step = 14;
  const left: string[] = [];
  const right: string[] = [];
  for (let y = -20; y <= height + 20; y += step) {
    const wave = Math.sin((y / height) * Math.PI * 2 + seed) * 70;
    const jagL = (rand() - 0.5) * 34;
    const jagR = (rand() - 0.5) * 34;
    const half = width / 2 + Math.sin(y / 60 + seed) * 10;
    left.push(`${(center + wave - half + jagL).toFixed(1)},${y}`);
    right.unshift(`${(center + wave + half + jagR).toFixed(1)},${y}`);
  }
  return `M${left.join(" L")} L${right.join(" L")} Z`;
}

const TORN_BANDS = [
  tornBandPath(120, 90, 3),
  tornBandPath(470, 70, 11),
  tornBandPath(860, 80, 7),
  tornBandPath(1150, 90, 19),
];

function TornBands() {
  return (
    <svg
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 h-full w-full"
      viewBox="0 0 1200 900"
      preserveAspectRatio="xMidYMid slice">
      {TORN_BANDS.map((d) => (
        <path key={d} d={d} fill="#C0D8DE" />
      ))}
    </svg>
  );
}

function polarPath(base: number, amplitude: number, lobes: number, rotation = 0): string {
  const points: string[] = [];
  const samples = 96;
  for (let i = 0; i < samples; i++) {
    const theta = (i / samples) * Math.PI * 2;
    const r = base + amplitude * Math.cos(lobes * (theta + rotation));
    points.push(`${(50 + r * Math.cos(theta)).toFixed(2)},${(50 + r * Math.sin(theta)).toFixed(2)}`);
  }
  return `M${points.join(" L")} Z`;
}

const FLOWER_PETALS = polarPath(36, 6, 4, Math.PI / 4);
const FLOWER_BLOOM = polarPath(19, 3.5, 6);

// [outer tile, petals, bloom, center]
const FLOWER_PALETTES: [string, string, string, string][] = [
  ["#3F4468", "#8A8CC8", "#C9E0E6", "#1F2A44"],
  ["#D0552F", "#7A3530", "#2C5F5B", "#EBC873"],
  ["#E0661F", "#EDAA3E", "#7A3530", "#F06A28"],
  ["#2C5F5B", "#3F8E4E", "#EBC873", "#6BB5B0"],
];

function Flower({ palette }: { palette: [string, string, string, string] }) {
  const [tile, petals, bloom, center] = palette;
  return (
    <svg aria-hidden="true" viewBox="0 0 100 100" className="h-11 w-11 sm:h-12 sm:w-12">
      <rect x="2" y="2" width="96" height="96" rx="34" fill={tile} />
      <path d={FLOWER_PETALS} fill={petals} />
      <path d={FLOWER_BLOOM} fill={bloom} />
      <circle cx="50" cy="50" r="8" fill={center} />
      <circle cx="50" cy="50" r="3" fill="#1C1B1F" />
    </svg>
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
  const [confettiPrimaryColor, setConfettiPrimaryColor] = React.useState("#3F4468");
  const [confettiSuccessColor, setConfettiSuccessColor] = React.useState("#2C5F5B");
  const [confettiAccentColor, setConfettiAccentColor] = React.useState("#D0552F");
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

  const confettiColors = [confettiPrimaryColor, confettiSuccessColor, confettiAccentColor, "#7A3530", "#8A8CC8", "#C0D8DE"];
  const confettiKey = [
    confettiPieceCount,
    confettiDuration,
    confettiSpread,
    confettiPrimaryColor,
    confettiSuccessColor,
    confettiAccentColor,
  ].join("|");

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#D05A24]">
      <TornBands />
      <main className="relative mx-auto max-w-3xl">
        <div className="overflow-y-auto">
          <div className="flex items-end justify-center px-4 pb-20 pt-4 text-center sm:flex sm:p-0">
            <div className="main inset-0 my-4 flex flex-col transition-opacity sm:my-0" aria-hidden="true">
              <div
                data-config-id="DecoyBookingSuccessCard-div-4"
                className="relative inline-block transform overflow-hidden rounded-2xl bg-[#EDAA3E] px-8 pb-8 pt-8 text-left align-bottom text-[#1C1B1F] shadow-[0_1px_0_rgba(28,27,31,0.08)] transition-all sm:my-12 sm:w-full sm:max-w-xl sm:px-10 sm:py-10 sm:align-middle"
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
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#1C1B1F]">
                    <Icon name="check" className="h-5 w-5 text-[#EDAA3E]" />
                  </div>
                </div>
                <div className="mb-8 mt-6 text-left last:mb-0 rtl:text-right">
                  <h3
                    className="text-4xl font-normal leading-[0.95] tracking-[-0.02em] text-[#1C1B1F] sm:text-5xl"
                    style={{ fontFamily: SERIF_STACK }}
                    id="modal-headline">
                    {t("meeting_is_scheduled")}
                  </h3>

                  <div className="mt-4">
                    <p className="text-[#1C1B1F]/80">{t("emailed_you_and_any_other_attendees")}</p>
                  </div>

                  <div className="mt-8 grid grid-cols-3 gap-x-4 border-t border-[#1C1B1F]/20 pt-8 text-left text-[#1C1B1F] rtl:text-right sm:gap-x-0">
                    <div className="font-semibold">{t("what")}</div>
                    <div className="col-span-2 mb-6 last:mb-0">{title}</div>

                    {formattedDate && (
                      <>
                        <div className="font-semibold">{t("when")}</div>
                        <div className="col-span-2 mb-6 last:mb-0">
                          {formattedDate}
                          {formattedTime && (
                            <>
                              <br />
                              {formattedTime}
                              {endTime && ` - ${endTime}`}
                              {formattedTimeZone && (
                                <span className="text-[#1C1B1F]/65"> ({formattedTimeZone})</span>
                              )}
                            </>
                          )}
                        </div>
                      </>
                    )}

                    <div className="font-semibold">{t("who")}</div>
                    <div className="col-span-2 last:mb-0">
                      {hostName && (
                        <div className="mb-3">
                          <div>
                            <span className="mr-2">{hostName}</span>
                            <Badge variant="blue" className="rounded-md bg-[#1C1B1F] text-white">
                              {t("Host")}
                            </Badge>
                          </div>
                          {hostEmail && <p className="text-[#1C1B1F]/80">{hostEmail}</p>}
                        </div>
                      )}
                      {attendeeName && (
                        <div className="mb-3 last:mb-0">
                          <p>{attendeeName}</p>
                          {attendeeEmail && <p className="text-[#1C1B1F]/80">{attendeeEmail}</p>}
                        </div>
                      )}
                    </div>

                    {location && (
                      <>
                        <div className="mt-3 font-semibold">{t("where")}</div>
                        <div className="col-span-2 mt-3">{t("web_conferencing_details_to_follow")}</div>
                      </>
                    )}
                  </div>
                </div>
                <div className="mt-2 flex justify-end gap-2 rtl:justify-start">
                  {FLOWER_PALETTES.map((palette) => (
                    <Flower key={palette.join("")} palette={palette} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
