import { useEffect, useMemo, useState } from "react";
import type { CSSProperties, ReactNode } from "react";

/**
 * Snowy winter wonderland theme for page stories.
 * Re-maps the Cal.com design tokens (--cal-*) to icy blues and whites inside its
 * scope, and layers a gentle falling-snow animation behind/above the content.
 */

const winterTokens = {
	"--cal-bg": "hsla(205, 100%, 99%, 0.94)",
	"--cal-bg-muted": "hsla(205, 80%, 97%, 1)",
	"--cal-bg-subtle": "hsla(205, 70%, 93%, 1)",
	"--cal-bg-emphasis": "hsla(205, 60%, 88%, 1)",
	"--cal-bg-success": "hsla(203, 90%, 92%, 1)",
	"--cal-border": "hsla(205, 55%, 80%, 1)",
	"--cal-border-subtle": "hsla(205, 60%, 87%, 1)",
	"--cal-border-muted": "hsla(205, 60%, 92%, 1)",
	"--cal-border-booker": "hsla(204, 65%, 80%, 1)",
	"--cal-text-emphasis": "hsla(212, 62%, 18%, 1)",
	"--cal-text": "hsla(210, 35%, 30%, 1)",
	"--cal-text-subtle": "hsla(208, 25%, 46%, 1)",
	"--cal-text-muted": "hsla(206, 22%, 62%, 1)",
	"--cal-brand": "hsla(208, 70%, 32%, 1)",
	"--cal-brand-emphasis": "hsla(210, 72%, 24%, 1)",
} as CSSProperties;

const keyframes = `
@keyframes snowy-winter-fall {
  0% { transform: translate3d(0, -10vh, 0); }
  100% { transform: translate3d(0, 110vh, 0); }
}
@keyframes snowy-winter-sway {
  0%, 100% { margin-left: 0; }
  50% { margin-left: 24px; }
}
[data-snowy-content] [role="dialog"] {
  box-shadow: 0 20px 60px -20px rgba(30, 90, 150, 0.45), 0 0 0 4px rgba(255, 255, 255, 0.5);
  backdrop-filter: blur(4px);
}
@media (prefers-reduced-motion: reduce) {
  [data-snowflake] { animation: none !important; }
}
`;

// Deterministic pseudo-random so the snowfall is stable between renders.
function seeded(i: number, salt: number) {
	const x = Math.sin(i * 12.9898 + salt * 78.233) * 43758.5453;
	return x - Math.floor(x);
}

export function SnowyWinterTheme({ children }: { children: ReactNode }) {
	const [snowEnabled, setSnowEnabled] = useState(true);
	const [snowflakeCount, setSnowflakeCount] = useState(48);
	const [fallDuration, setFallDuration] = useState(14);
	const [snowOpacity, setSnowOpacity] = useState(0.85);
	const [snowColor, setSnowColor] = useState("#ffffff");
	const [accentColor, setAccentColor] = useState("#2a7bc0");

	// geneditor-listener-start
	useEffect(() => {
		const el = document.querySelector('[data-config-id="SnowyWinterTheme-controls"]');
		if (!el) return;
		const handler = (e: Event) => {
			const p = (e as CustomEvent).detail as Record<string, unknown>;
			if (typeof p.snowEnabled === "boolean") setSnowEnabled(p.snowEnabled);
			if (typeof p.snowflakeCount === "number") setSnowflakeCount(p.snowflakeCount);
			if (typeof p.fallDuration === "number") setFallDuration(p.fallDuration);
			if (typeof p.snowOpacity === "number") setSnowOpacity(p.snowOpacity);
			if (typeof p.snowColor === "string") setSnowColor(p.snowColor);
			if (typeof p.accentColor === "string") setAccentColor(p.accentColor);
		};
		el.addEventListener("animation:update", handler);
		return () => el.removeEventListener("animation:update", handler);
	}, []);
	// geneditor-listener-end

	const flakes = useMemo(
		() =>
			Array.from({ length: Math.max(0, Math.round(snowflakeCount)) }, (_, i) => ({
				left: seeded(i, 1) * 100,
				size: 4 + seeded(i, 2) * 10,
				speed: 0.6 + seeded(i, 3) * 0.8,
				delay: seeded(i, 4),
				sway: 3 + seeded(i, 5) * 4,
				glyph: seeded(i, 6) > 0.55,
			})),
		[snowflakeCount],
	);

	return (
		<div
			data-config-id="SnowyWinterTheme-controls"
			data-snow={snowEnabled ? "on" : "off"}
			data-snowflakes={snowflakeCount}
			className="relative min-h-screen"
			style={{
				...winterTokens,
				["--snow-color" as string]: snowColor,
				["--snow-opacity" as string]: snowOpacity,
				["--snow-duration" as string]: `${fallDuration}s`,
				// Check icon in the confirmation badge uses the green palette; tint it icy.
				["--color-green-600" as string]: accentColor,
				["--color-green-400" as string]: accentColor,
			}}
		>
			<style>{keyframes}</style>

			{/* Icy winter sky */}
			<div
				aria-hidden="true"
				className="pointer-events-none fixed inset-0"
				style={{
					background:
						"radial-gradient(ellipse at top, hsla(205, 90%, 96%, 1) 0%, hsla(206, 75%, 88%, 1) 45%, hsla(212, 60%, 76%, 1) 100%)",
				}}
			/>

			{/* Soft snowdrift along the bottom for a cozy feel */}
			<div
				aria-hidden="true"
				className="pointer-events-none fixed inset-x-0 bottom-0 h-40"
				style={{
					background:
						"radial-gradient(120% 100% at 20% 100%, #ffffff 0%, rgba(255,255,255,0.9) 40%, rgba(255,255,255,0) 70%), radial-gradient(120% 100% at 80% 100%, #ffffff 0%, rgba(255,255,255,0.85) 35%, rgba(255,255,255,0) 70%)",
				}}
			/>

			<div data-snowy-content style={{ position: "relative", zIndex: 10 }}>
				{children}
			</div>

			{snowEnabled && flakes.length > 0 && (
				<div aria-hidden="true" className="pointer-events-none fixed inset-0 z-20 overflow-hidden">
					{flakes.map((f, i) => (
						<span
							key={i}
							data-snowflake
							className="absolute top-0 select-none leading-none"
							style={{
								left: `${f.left}%`,
								fontSize: f.glyph ? f.size + 6 : undefined,
								width: f.glyph ? undefined : f.size,
								height: f.glyph ? undefined : f.size,
								borderRadius: f.glyph ? undefined : "9999px",
								background: f.glyph ? undefined : "var(--snow-color)",
								color: "var(--snow-color)",
								opacity: "var(--snow-opacity)",
								textShadow: f.glyph ? "0 0 6px rgba(120,180,230,0.6)" : undefined,
								boxShadow: f.glyph ? undefined : "0 0 6px rgba(120,180,230,0.5)",
								animation: `snowy-winter-fall calc(var(--snow-duration) / ${f.speed}) linear calc(var(--snow-duration) / ${f.speed} * ${-f.delay}) infinite, snowy-winter-sway ${f.sway}s ease-in-out ${-f.delay * f.sway}s infinite`,
							}}
						>
							{f.glyph ? "❄" : null}
						</span>
					))}
				</div>
			)}
		</div>
	);
}
