import * as React from "react";
import { useState } from "react";

const CONFIG_ID = "ChristmasBookingTheme-controls";

// Deterministic pseudo-random so the snowfall looks the same on every render.
function seeded(index: number, salt: number) {
	const x = Math.sin(index * 12.9898 + salt * 78.233) * 43758.5453;
	return x - Math.floor(x);
}

const CARD = `[data-config-id="${CONFIG_ID}"] [role="dialog"][aria-labelledby="modal-headline"]`;

function buildCss(accentColor: string, showLights: boolean, twinkleSeconds: number) {
	return `
@keyframes xmas-snowfall {
	0% { transform: translate3d(0, -10vh, 0); }
	100% { transform: translate3d(var(--xmas-drift), 110vh, 0); }
}
@keyframes xmas-twinkle {
	0%, 100% { filter: brightness(1) saturate(1); opacity: 1; }
	50% { filter: brightness(1.35) saturate(1.2); opacity: 0.7; }
}
[data-config-id="${CONFIG_ID}"] [data-testid="back-to-bookings"] { color: #f8fafc; }
${CARD} {
	position: relative;
	border-color: ${accentColor};
	box-shadow: 0 0 0 4px rgba(255, 255, 255, 0.08), 0 24px 60px -20px rgba(0, 0, 0, 0.55);
}
${CARD}::before {
	content: "";
	position: absolute;
	inset: 0 0 auto 0;
	height: 8px;
	background: repeating-linear-gradient(-45deg, ${accentColor} 0 10px, #ffffff 10px 20px);
	pointer-events: none;
}
${
	showLights
		? `${CARD}::after {
	content: "";
	position: absolute;
	top: 11px;
	left: 12px;
	right: 12px;
	height: 10px;
	background-image:
		radial-gradient(circle at 6px 5px, #ef4444 3px, transparent 4px),
		radial-gradient(circle at 24px 5px, #facc15 3px, transparent 4px),
		radial-gradient(circle at 42px 5px, #22c55e 3px, transparent 4px),
		radial-gradient(circle at 60px 5px, #3b82f6 3px, transparent 4px);
	background-size: 72px 10px;
	background-repeat: repeat-x;
	animation: xmas-twinkle ${twinkleSeconds}s ease-in-out infinite;
	pointer-events: none;
}`
		: ""
}
${CARD} #modal-headline::before { content: "🎄 "; }
${CARD} #modal-headline::after { content: " 🎁"; }
@media (prefers-reduced-motion: reduce) {
	[data-config-id="${CONFIG_ID}"] .xmas-flake, ${CARD}::after { animation: none !important; }
}
`;
}

export function ChristmasBookingTheme({ children }: { children: React.ReactNode }) {
	const [snowEnabled, setSnowEnabled] = useState(true);
	const [snowCount, setSnowCount] = useState(60);
	const [snowSpeed, setSnowSpeed] = useState(1);
	const [snowColor, setSnowColor] = useState("#ffffff");
	const [accentColor, setAccentColor] = useState("#c0392b");
	const [showLights, setShowLights] = useState(true);
	const [twinkleSeconds, setTwinkleSeconds] = useState(1.6);

	// geneditor-listener-start
	React.useEffect(() => {
		const el = document.querySelector('[data-config-id="ChristmasBookingTheme-controls"]');
		if (!el) return;
		const handler = (e: Event) => {
			const p = (e as CustomEvent).detail as Record<string, unknown>;
			if (typeof p.snowEnabled === "boolean") setSnowEnabled(p.snowEnabled);
			if (typeof p.snowCount === "number") setSnowCount(p.snowCount);
			if (typeof p.snowSpeed === "number") setSnowSpeed(p.snowSpeed);
			if (typeof p.snowColor === "string") setSnowColor(p.snowColor);
			if (typeof p.accentColor === "string") setAccentColor(p.accentColor);
			if (typeof p.showLights === "boolean") setShowLights(p.showLights);
			if (typeof p.twinkleSeconds === "number") setTwinkleSeconds(p.twinkleSeconds);
		};
		el.addEventListener("animation:update", handler);
		return () => el.removeEventListener("animation:update", handler);
	}, []);
	// geneditor-listener-end

	const flakes = React.useMemo(
		() =>
			Array.from({ length: Math.max(0, Math.round(snowCount)) }, (_, i) => ({
				left: seeded(i, 1) * 100,
				size: 3 + seeded(i, 2) * 5,
				duration: 7 + seeded(i, 3) * 9,
				delay: -seeded(i, 4) * 16,
				drift: (seeded(i, 5) - 0.5) * 80,
				opacity: 0.5 + seeded(i, 6) * 0.5,
			})),
		[snowCount],
	);

	return (
		<div
			data-config-id="ChristmasBookingTheme-controls"
			style={{
				position: "relative",
				minHeight: "100vh",
				overflow: "hidden",
				background:
					"radial-gradient(ellipse at top, #1f5f45 0%, #0f3d2e 45%, #0a2a20 100%)",
			}}
		>
			<style>{buildCss(accentColor, showLights, twinkleSeconds)}</style>
			<div style={{ position: "relative", zIndex: 1 }}>{children}</div>
			{snowEnabled && (
				<div
					aria-hidden="true"
					style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 2 }}
				>
					{flakes.map((flake, i) => (
						<span
							key={i}
							className="xmas-flake"
							style={
								{
									position: "absolute",
									top: 0,
									left: `${flake.left}%`,
									width: flake.size,
									height: flake.size,
									borderRadius: "9999px",
									background: snowColor,
									opacity: flake.opacity,
									boxShadow: `0 0 6px ${snowColor}`,
									"--xmas-drift": `${flake.drift}px`,
									animation: `xmas-snowfall ${flake.duration / Math.max(snowSpeed, 0.1)}s linear ${flake.delay / Math.max(snowSpeed, 0.1)}s infinite`,
								} as React.CSSProperties
							}
						/>
					))}
				</div>
			)}
		</div>
	);
}

