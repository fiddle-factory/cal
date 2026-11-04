"use client";

import * as React from "react";

type Particle = {
	x: number;
	y: number;
	vx: number;
	vy: number;
	life: number;
	maxLife: number;
	color: string;
};

type Rocket = {
	x: number;
	y: number;
	vy: number;
	targetY: number;
	color: string;
};

const PALETTE = ["#f43f5e", "#f59e0b", "#22c55e", "#3b82f6", "#a855f7", "#ec4899", "#facc15"];

/**
 * Celebratory fireworks drawn on a canvas behind its children.
 * Children render above the canvas, so the confirmation card stays readable.
 */
export function FireworksBackdrop({ children }: { children: React.ReactNode }) {
	const [burstColor, setBurstColor] = React.useState("#f59e0b");
	const [multicolor, setMulticolor] = React.useState(true);
	const [burstsPerSecond, setBurstsPerSecond] = React.useState(2.5);
	const [particleCount, setParticleCount] = React.useState(70);
	const [particleSize, setParticleSize] = React.useState(2.5);
	const [showDuration, setShowDuration] = React.useState(6);
	const [loop, setLoop] = React.useState(false);

	const canvasRef = React.useRef<HTMLCanvasElement>(null);

	// geneditor-listener-start
	React.useEffect(() => {
		const el = document.querySelector('[data-config-id="BookingConfirmationFireworks-controls"]');
		if (!el) return;
		const handler = (e: Event) => {
			const p = (e as CustomEvent).detail as Record<string, unknown>;
			if (typeof p.burstColor === "string") setBurstColor(p.burstColor);
			if (typeof p.multicolor === "boolean") setMulticolor(p.multicolor);
			if (typeof p.burstsPerSecond === "number") setBurstsPerSecond(p.burstsPerSecond);
			if (typeof p.particleCount === "number") setParticleCount(p.particleCount);
			if (typeof p.particleSize === "number") setParticleSize(p.particleSize);
			if (typeof p.showDuration === "number") setShowDuration(p.showDuration);
			if (typeof p.loop === "boolean") setLoop(p.loop);
		};
		el.addEventListener("animation:update", handler);
		return () => el.removeEventListener("animation:update", handler);
	}, []);
	// geneditor-listener-end

	React.useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;
		const ctx = canvas.getContext("2d");
		if (!ctx) return;
		if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;

		let width = 0;
		let height = 0;
		const resize = () => {
			const dpr = window.devicePixelRatio || 1;
			width = canvas.clientWidth;
			height = canvas.clientHeight;
			canvas.width = Math.max(1, Math.floor(width * dpr));
			canvas.height = Math.max(1, Math.floor(height * dpr));
			ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
		};
		resize();
		const observer = new ResizeObserver(resize);
		observer.observe(canvas);

		const rockets: Rocket[] = [];
		const particles: Particle[] = [];
		const pickColor = () =>
			multicolor ? PALETTE[Math.floor(Math.random() * PALETTE.length)] : burstColor;

		const launch = () => {
			// Favour the sides so bursts frame the centred card.
			const side = Math.random() < 0.5 ? -1 : 1;
			const offset = 0.18 + Math.random() * 0.3;
			const x = width / 2 + side * offset * width;
			rockets.push({
				x,
				y: height,
				vy: -(height * 0.012 + Math.random() * 3),
				targetY: height * (0.12 + Math.random() * 0.4),
				color: pickColor(),
			});
		};

		const explode = (r: Rocket) => {
			const count = Math.round(particleCount * (0.75 + Math.random() * 0.5));
			const speed = 2 + Math.random() * 2.5;
			for (let i = 0; i < count; i++) {
				const angle = (Math.PI * 2 * i) / count + Math.random() * 0.2;
				const v = speed * (0.5 + Math.random() * 0.5);
				const maxLife = 50 + Math.random() * 30;
				particles.push({
					x: r.x,
					y: r.y,
					vx: Math.cos(angle) * v,
					vy: Math.sin(angle) * v,
					life: maxLife,
					maxLife,
					color: multicolor && Math.random() < 0.25 ? pickColor() : r.color,
				});
			}
		};

		let frame = 0;
		let last = performance.now();
		const start = last;
		let spawnAccumulator = 1; // launch one immediately on appear

		const tick = (now: number) => {
			const dt = Math.min(0.05, (now - last) / 1000);
			last = now;
			const elapsed = (now - start) / 1000;
			const active = loop || elapsed < showDuration;

			if (active) {
				spawnAccumulator += dt * burstsPerSecond;
				while (spawnAccumulator >= 1) {
					launch();
					spawnAccumulator -= 1;
				}
			}

			ctx.clearRect(0, 0, width, height);
			ctx.globalCompositeOperation = "lighter";

			for (let i = rockets.length - 1; i >= 0; i--) {
				const r = rockets[i];
				r.y += r.vy;
				ctx.fillStyle = r.color;
				ctx.beginPath();
				ctx.arc(r.x, r.y, particleSize * 0.8, 0, Math.PI * 2);
				ctx.fill();
				if (r.y <= r.targetY) {
					explode(r);
					rockets.splice(i, 1);
				}
			}

			for (let i = particles.length - 1; i >= 0; i--) {
				const p = particles[i];
				p.vx *= 0.97;
				p.vy = p.vy * 0.97 + 0.05;
				p.x += p.vx;
				p.y += p.vy;
				p.life -= 1;
				if (p.life <= 0) {
					particles.splice(i, 1);
					continue;
				}
				ctx.globalAlpha = Math.max(0, p.life / p.maxLife);
				ctx.fillStyle = p.color;
				ctx.beginPath();
				ctx.arc(p.x, p.y, particleSize, 0, Math.PI * 2);
				ctx.fill();
			}
			ctx.globalAlpha = 1;
			ctx.globalCompositeOperation = "source-over";

			if (active || rockets.length || particles.length) {
				frame = requestAnimationFrame(tick);
			}
		};
		frame = requestAnimationFrame(tick);

		return () => {
			cancelAnimationFrame(frame);
			observer.disconnect();
		};
	}, [burstColor, multicolor, burstsPerSecond, particleCount, particleSize, showDuration, loop]);

	return (
		<div data-config-id="BookingConfirmationFireworks-controls" style={{ position: "relative", minHeight: "100vh" }}>
			<canvas
				ref={canvasRef}
				aria-hidden="true"
				style={{
					position: "absolute",
					inset: 0,
					width: "100%",
					height: "100%",
					pointerEvents: "none",
					zIndex: 0,
				}}
			/>
			<div style={{ position: "relative", zIndex: 1 }}>
				{children}
			</div>
		</div>
	);
}
