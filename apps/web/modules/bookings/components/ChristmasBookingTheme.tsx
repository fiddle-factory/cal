"use client";

import * as React from "react";

const CARD = '[data-testid="success-page"] [role="dialog"][aria-labelledby="modal-headline"]';

const LIGHT_COLORS = ["#e53935", "#fdd835", "#43a047", "#1e88e5", "#fb8c00"];

function seeded(i: number, salt: number) {
	const x = Math.sin(i * 12.9898 + salt * 78.233) * 43758.5453;
	return x - Math.floor(x);
}

export function ChristmasBookingTheme({ children }: { children: React.ReactNode }) {
	const [snowColor, setSnowColor] = React.useState("#ffffff");
	const [snowCount, setSnowCount] = React.useState(60);
	const [snowSpeed, setSnowSpeed] = React.useState(10);
	const [accentColor, setAccentColor] = React.useState("#c62828");
	const [greenColor, setGreenColor] = React.useState("#1b5e20");
	const [lightsTwinkle, setLightsTwinkle] = React.useState(true);

	// geneditor-listener-start
	React.useEffect(() => {
		const el = document.querySelector('[data-config-id="ChristmasTheme-controls"]');
		if (!el) return;
		const handler = (e: Event) => {
			const p = (e as CustomEvent).detail as Record<string, unknown>;
			if (typeof p.snowColor === "string") setSnowColor(p.snowColor);
			if (typeof p.snowCount === "number") setSnowCount(p.snowCount);
			if (typeof p.snowSpeed === "number") setSnowSpeed(p.snowSpeed);
			if (typeof p.accentColor === "string") setAccentColor(p.accentColor);
			if (typeof p.greenColor === "string") setGreenColor(p.greenColor);
			if (typeof p.lightsTwinkle === "boolean") setLightsTwinkle(p.lightsTwinkle);
		};
		el.addEventListener("animation:update", handler);
		return () => el.removeEventListener("animation:update", handler);
	}, []);
	// geneditor-listener-end

	const flakes = React.useMemo(
		() =>
			Array.from({ length: Math.max(0, Math.round(snowCount)) }, (_, i) => ({
				left: seeded(i, 1) * 100,
				size: 3 + seeded(i, 2) * 6,
				delay: -seeded(i, 3) * 20,
				durationFactor: 0.7 + seeded(i, 4) * 0.6,
				drift: (seeded(i, 5) - 0.5) * 80,
				opacity: 0.5 + seeded(i, 6) * 0.5,
			})),
		[snowCount],
	);

	const lights = Array.from({ length: 28 }, (_, i) => i);

	return (
		<div
			className="xmas-theme"
			data-config-id="ChristmasTheme-controls"
			style={
				{
					position: "relative",
					minHeight: "100vh",
					overflow: "hidden",
					background:
						"linear-gradient(180deg, rgba(27,94,32,0.10) 0%, rgba(198,40,40,0.06) 60%, rgba(255,255,255,0) 100%)",
					"--xmas-accent": accentColor,
					"--xmas-green": greenColor,
				} as React.CSSProperties
			}
		>
			<style>{`
				@keyframes xmas-fall {
					0% { transform: translate3d(0, -10vh, 0); }
					100% { transform: translate3d(var(--xmas-drift), 110vh, 0); }
				}
				@keyframes xmas-twinkle {
					0%, 100% { opacity: 1; filter: brightness(1.15); }
					50% { opacity: 0.35; filter: brightness(0.8); }
				}
				.xmas-theme ${CARD} {
					position: relative;
					border-color: var(--xmas-green);
					border-width: 2px;
					box-shadow: 0 0 0 4px rgba(255,255,255,0.6), 0 10px 40px -10px var(--xmas-accent);
					background-image:
						radial-gradient(circle at 100% 0%, rgba(198,40,40,0.08), transparent 40%),
						radial-gradient(circle at 0% 100%, rgba(27,94,32,0.08), transparent 40%);
				}
				.xmas-theme ${CARD}::before {
					content: "";
					position: absolute;
					top: 0; left: 0; right: 0;
					height: 8px;
					background: repeating-linear-gradient(45deg, var(--xmas-accent) 0 10px, #ffffff 10px 20px);
				}
				.xmas-theme ${CARD}::after {
					content: "🎄";
					position: absolute;
					top: 14px; right: 16px;
					font-size: 28px;
					line-height: 1;
					pointer-events: none;
				}
				.xmas-theme ${CARD} .bg-cal-success {
					background-color: var(--xmas-green);
					box-shadow: 0 0 0 4px rgba(198,40,40,0.25);
				}
				.xmas-theme ${CARD} .bg-cal-success svg { color: #ffffff; }
				.xmas-theme ${CARD} #modal-headline::before { content: "❄️ "; }
				.xmas-theme ${CARD} #modal-headline::after { content: " ❄️"; }
			`}</style>

			{/* String of lights */}
			<div
				aria-hidden="true"
				style={{
					position: "absolute",
					top: 0,
					left: 0,
					right: 0,
					height: 28,
					display: "flex",
					justifyContent: "space-between",
					padding: "0 12px",
					borderTop: `2px solid ${greenColor}`,
					pointerEvents: "none",
					zIndex: 60,
				}}
			>
				{lights.map((i) => (
					<span
						key={i}
						style={{
							marginTop: i % 2 === 0 ? 4 : 8,
							width: 10,
							height: 14,
							borderRadius: "50% 50% 50% 50% / 40% 40% 60% 60%",
							background: LIGHT_COLORS[i % LIGHT_COLORS.length],
							boxShadow: `0 0 8px ${LIGHT_COLORS[i % LIGHT_COLORS.length]}`,
							animation: lightsTwinkle ? `xmas-twinkle 1.6s ease-in-out ${(i % 5) * 0.3}s infinite` : "none",
						}}
					/>
				))}
			</div>

			{children}

			{/* Snowfall */}
			<div
				aria-hidden="true"
				style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 70, overflow: "hidden" }}
			>
				{flakes.map((f, i) => (
					<span
						key={i}
						style={
							{
								position: "absolute",
								top: 0,
								left: `${f.left}%`,
								width: f.size,
								height: f.size,
								borderRadius: "50%",
								background: snowColor,
								opacity: f.opacity,
								boxShadow: "0 0 3px rgba(0,0,0,0.15)",
								"--xmas-drift": `${f.drift}px`,
								animation: `xmas-fall ${snowSpeed * f.durationFactor}s linear ${f.delay}s infinite`,
							} as React.CSSProperties
						}
					/>
				))}
			</div>
		</div>
	);
}
