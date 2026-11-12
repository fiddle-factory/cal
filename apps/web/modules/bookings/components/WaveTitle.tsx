"use client";

import classNames from "classnames";
import React, { useState } from "react";

type WaveTitleProps = {
  text: string;
  id?: string;
  className?: string;
  "data-testid"?: string;
};

const KEYFRAMES = `
@keyframes cal-wave-title-in {
  0% { opacity: 0; transform: translateY(var(--wave-bounce)) rotate(calc(var(--wave-tilt) * -2)); }
  55% { opacity: 1; transform: translateY(calc(var(--wave-bounce) * -0.35)) rotate(calc(var(--wave-tilt) * 1.5)); }
  80% { transform: translateY(calc(var(--wave-bounce) * 0.1)) rotate(var(--wave-tilt)); }
  100% { opacity: 1; transform: translateY(0) rotate(var(--wave-tilt)); }
}
@media (prefers-reduced-motion: reduce) {
  .cal-wave-letter { animation: none !important; opacity: 1 !important; }
}
`;

/**
 * Headline split into letters that bounce in as a wave, each settling with a slight playful tilt.
 */
export const WaveTitle = ({ text, id, className, "data-testid": dataTestId }: WaveTitleProps) => {
  const [waveDuration, setWaveDuration] = useState(700);
  const [waveStagger, setWaveStagger] = useState(35);
  const [waveBounce, setWaveBounce] = useState(14);
  const [waveTilt, setWaveTilt] = useState(4);
  const [replayKey, setReplayKey] = useState(0);

  // geneditor-listener-start
  React.useEffect(() => {
    const el = document.querySelector('[data-config-id="WaveTitle-controls"]');
    if (!el) return;
    const handler = (e: Event) => {
      const p = (e as CustomEvent).detail as Record<string, unknown>;
      if (typeof p.waveDuration === "number") setWaveDuration(p.waveDuration);
      if (typeof p.waveStagger === "number") setWaveStagger(p.waveStagger);
      if (typeof p.waveBounce === "number") setWaveBounce(p.waveBounce);
      if (typeof p.waveTilt === "number") setWaveTilt(p.waveTilt);
      setReplayKey((k) => k + 1);
    };
    el.addEventListener("animation:update", handler);
    return () => el.removeEventListener("animation:update", handler);
  }, []);
  // geneditor-listener-end

  const words = text.split(" ");
  let letterIndex = 0;

  return (
    <>
    <style>{KEYFRAMES}</style>
    <h3
      id={id}
      data-testid={dataTestId}
      data-config-id="WaveTitle-controls"
      aria-label={text}
      className={classNames("font-heading text-emphasis text-2xl font-semibold leading-8", className)}>
      <span aria-hidden="true" key={replayKey}>
        {words.map((word, wordIdx) => (
          <React.Fragment key={`${word}-${wordIdx}`}>
            <span className="inline-block whitespace-nowrap">
              {Array.from(word).map((char, charIdx) => {
                const i = letterIndex++;
                // Alternate the tilt direction for a playful, hand-set feel
                const tilt = i % 2 === 0 ? waveTilt : -waveTilt;
                return (
                  <span
                    key={`${char}-${charIdx}`}
                    className={classNames(
                      "cal-wave-letter inline-block opacity-0",
                      i % 3 === 1 && "text-brand-default"
                    )}
                    style={
                      {
                        "--wave-bounce": `${waveBounce}px`,
                        "--wave-tilt": `${tilt}deg`,
                        animation: `cal-wave-title-in ${waveDuration}ms cubic-bezier(.21, 1.02, .73, 1) ${
                          i * waveStagger
                        }ms forwards`,
                      } as React.CSSProperties
                    }>
                    {char}
                  </span>
                );
              })}
            </span>
            {wordIdx < words.length - 1 && " "}
          </React.Fragment>
        ))}
      </span>
    </h3>
    </>
  );
};

export default WaveTitle;
