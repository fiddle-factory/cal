"use client";

import type { CSSProperties, ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";

const leaf = (rotate: number, fill: string) =>
	`<path d='M0 0 Q6 -7 12 -3 Q16 -9 22 -4 Q26 -9 32 0 Q26 9 22 4 Q16 9 12 3 Q6 7 0 0Z' fill='${fill}' stroke='#0f3d1f' stroke-width='0.8' transform='translate(32 30) rotate(${rotate})'/>`;

const hollySvg = (flip: boolean) =>
	`url("data:image/svg+xml,${encodeURIComponent(
		`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'><g transform='${flip ? "translate(64 0) scale(-1 1)" : ""}'>${leaf(200, "#15803d")}${leaf(-20, "#166534")}${leaf(95, "#16a34a")}<circle cx='29' cy='27' r='5' fill='#dc2626'/><circle cx='36' cy='26' r='5' fill='#b91c1c'/><circle cx='32' cy='33' r='5' fill='#ef4444'/><circle cx='27.5' cy='25.5' r='1.4' fill='#fecaca'/><circle cx='34.5' cy='24.5' r='1.4' fill='#fecaca'/></g></svg>`,
	)}")`;

const ORNAMENT_COLORS = ["#dc2626", "#15803d", "#facc15", "#b91c1c", "#16a34a", "#e5e7eb"];

function seeded(i: number) {
	const x = Math.sin(i * 9301 + 49297) * 233280;
	return x - Math.floor(x);
}

export function ChristmasTheme({ children }: { children: ReactNode }) {
	const [snowEnabled, setSnowEnabled] = useState(true);
	const [snowCount, setSnowCount] = useState(60);
	const [snowSpeed, setSnowSpeed] = useState(1);
	const [snowColor, setSnowColor] = useState("#ffffff");
	const [snowOpacity, setSnowOpacity] = useState(0.85);
	const [accentRed, setAccentRed] = useState("#c0262d");
	const [accentGreen, setAccentGreen] = useState("#166534");

	// geneditor-listener-start
	useEffect(() => {
		const el = document.querySelector('[data-config-id="ChristmasTheme-controls"]');
		if (!el) return;
		const handler = (e: Event) => {
			const p = (e as CustomEvent).detail as Record<string, unknown>;
			if (typeof p.snowEnabled === "boolean") setSnowEnabled(p.snowEnabled);
			if (typeof p.snowCount === "number") setSnowCount(p.snowCount);
			if (typeof p.snowSpeed === "number") setSnowSpeed(p.snowSpeed);
			if (typeof p.snowColor === "string") setSnowColor(p.snowColor);
			if (typeof p.snowOpacity === "number") setSnowOpacity(p.snowOpacity);
			if (typeof p.accentRed === "string") setAccentRed(p.accentRed);
			if (typeof p.accentGreen === "string") setAccentGreen(p.accentGreen);
		};
		el.addEventListener("animation:update", handler);
		return () => el.removeEventListener("animation:update", handler);
	}, []);
	// geneditor-listener-end

	const flakes = useMemo(
		() =>
			Array.from({ length: Math.max(0, Math.round(snowCount)) }, (_, i) => ({
				left: seeded(i + 1) * 100,
				size: 3 + seeded(i + 101) * 6,
				duration: 8 + seeded(i + 201) * 10,
				delay: -seeded(i + 301) * 18,
				drift: (seeded(i + 401) - 0.5) * 80,
			})),
		[snowCount],
	);

	const ornaments = Array.from({ length: 14 }, (_, i) => i);

	return (
		<div
			data-config-id="ChristmasTheme-controls"
			className="xmas-theme"
			style={
				{
					position: "relative",
					minHeight: "100vh",
					overflow: "hidden",
					background: `radial-gradient(ellipse at top, ${accentGreen} 0%, #0b2e1a 60%, #071d11 100%)`,
					"--xmas-red": accentRed,
					"--xmas-green": accentGreen,
				} as CSSProperties
			}
		>
			<style>{`
				@keyframes xmas-snowfall {
					0% { transform: translate3d(0, -10vh, 0); }
					100% { transform: translate3d(var(--drift), 110vh, 0); }
				}
				@keyframes xmas-swing {
					0%, 100% { transform: rotate(-6deg); }
					50% { transform: rotate(6deg); }
				}
				.xmas-theme [data-testid="success-page"] { position: relative; z-index: 1; height: auto; min-height: 100vh; padding-top: 56px; }
				.xmas-theme [data-testid="success-page"] [role="dialog"] {
					position: relative;
					border-color: var(--xmas-red);
					border-width: 2px;
					box-shadow: 0 0 0 6px rgba(255,255,255,0.08), 0 20px 50px rgba(0,0,0,0.35);
					padding-top: 2.5rem;
				}
				.xmas-theme [data-testid="success-page"] [role="dialog"]::before {
					content: "";
					position: absolute;
					top: 0; left: 0; right: 0;
					height: 10px;
					background: repeating-linear-gradient(135deg, var(--xmas-red) 0 12px, #ffffff 12px 20px, var(--xmas-green) 20px 32px, #ffffff 32px 40px);
				}
				.xmas-theme [data-testid="success-page"] [role="dialog"]::after {
					content: "";
					position: absolute;
					top: 12px; left: 6px; right: 6px;
					height: 56px;
					background-image: ${hollySvg(true)}, ${hollySvg(false)};
					background-size: 56px 56px, 56px 56px;
					background-position: left top, right top;
					background-repeat: no-repeat;
					pointer-events: none;
				}
				.xmas-theme [data-testid="success-page"] [role="dialog"] .text-emphasis.text-2xl { color: var(--xmas-red); }
				@media (prefers-reduced-motion: reduce) {
					.xmas-theme .xmas-flake, .xmas-theme .xmas-ornament { animation: none !important; }
				}
			`}</style>

			{snowEnabled && (
				<div
					aria-hidden="true"
					style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0 }}
				>
					{flakes.map((f, i) => (
						<span
							key={i}
							className="xmas-flake"
							style={
								{
									position: "absolute",
									top: 0,
									left: `${f.left}%`,
									width: f.size,
									height: f.size,
									borderRadius: "50%",
									background: snowColor,
									opacity: snowOpacity,
									filter: "blur(0.5px)",
									"--drift": `${f.drift}px`,
									animation: `xmas-snowfall ${f.duration / Math.max(snowSpeed, 0.1)}s linear ${f.delay / Math.max(snowSpeed, 0.1)}s infinite`,
								} as CSSProperties
							}
						/>
					))}
				</div>
			)}

			<div
				aria-hidden="true"
				style={{
					position: "absolute",
					top: 0,
					left: 0,
					right: 0,
					height: 64,
					zIndex: 2,
					pointerEvents: "none",
				}}
			>
				<svg
					width="100%"
					height="40"
					preserveAspectRatio="none"
					viewBox="0 0 100 40"
					style={{ position: "absolute", top: 0, left: 0 }}
				>
					<path
						d="M0 4 Q 7 24 14.3 4 T 28.6 4 T 42.9 4 T 57.1 4 T 71.4 4 T 85.7 4 T 100 4"
						fill="none"
						stroke={accentGreen}
						strokeWidth="2.5"
						vectorEffect="non-scaling-stroke"
					/>
				</svg>
				{ornaments.map((i) => {
					const left = ((i + 0.5) / ornaments.length) * 100;
					const color = ORNAMENT_COLORS[i % ORNAMENT_COLORS.length];
					return (
						<span
							key={i}
							className="xmas-ornament"
							style={{
								position: "absolute",
								top: i % 2 === 0 ? 14 : 6,
								left: `${left}%`,
								transformOrigin: "top center",
								animation: `xmas-swing ${3 + (i % 3)}s ease-in-out ${-(i % 4) * 0.5}s infinite`,
								display: "flex",
								flexDirection: "column",
								alignItems: "center",
							}}
						>
							<span style={{ width: 6, height: 5, background: "#d4af37", borderRadius: 1 }} />
							<span
								style={{
									width: 18,
									height: 18,
									borderRadius: "50%",
									background: `radial-gradient(circle at 35% 35%, rgba(255,255,255,0.8) 0 2px, ${color} 4px)`,
									boxShadow: "0 2px 4px rgba(0,0,0,0.3)",
								}}
							/>
						</span>
					);
				})}
			</div>

			{children}
		</div>
	);
}
