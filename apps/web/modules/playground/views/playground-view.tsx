"use client";

import { useState } from "react";
import type { ReactNode, SVGProps } from "react";

import classNames from "@calcom/ui/classNames";
import { Icon } from "@calcom/ui/components/icon/Icon";

const ACCENT = "#ff5c00";

const CHECKLIST_ITEMS = [
  "add a page",
  "prompt to screen",
  "tweak screen",
  "gen editor tweaks",
  "tweak component",
  "export code / pr",
  "snips",
];

const TOUR_STEPS = [
  {
    title: "Welcome to Fiddle",
    body: "Fiddle is where taste meets code. Let's take a quick look at how everything fits together.",
  },
  {
    title: "Welcome to the Canvas",
    body: "This is your creative playground. Drag components from the Assets panel, arrange them on the canvas, and bring your ideas to life. Let us show you around!",
  },
  {
    title: "Tweak with Prompts",
    body: "Select any screen or component and describe the change you want. Fiddle edits the real code behind it.",
  },
  {
    title: "Ship It",
    body: "When you're happy with the result, export the code or open a pull request straight from the top bar.",
  },
];

/* Inline icons for glyphs not included in the project's icon sprite. */
function StrokeSvg({ children, size = 16, ...props }: SVGProps<SVGSVGElement> & { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      {...props}>
      {children}
    </svg>
  );
}

const MessageSquareIcon = (props: { size?: number; className?: string }) => (
  <StrokeSvg {...props}>
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </StrokeSvg>
);

const MousePointerIcon = (props: { size?: number; className?: string }) => (
  <StrokeSvg {...props}>
    <path d="M4.04 4.04 10.5 20l2.4-6.6L19.5 11 4.04 4.04z" />
    <path d="m13 13 6 6" />
  </StrokeSvg>
);

const HandIcon = (props: { size?: number; className?: string }) => (
  <StrokeSvg {...props}>
    <path d="M18 11V6a2 2 0 0 0-4 0v0" />
    <path d="M14 10V4a2 2 0 0 0-4 0v2" />
    <path d="M10 10.5V6a2 2 0 0 0-4 0v8" />
    <path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15" />
  </StrokeSvg>
);

const ScissorsIcon = (props: { size?: number; className?: string }) => (
  <StrokeSvg {...props}>
    <circle cx="6" cy="6" r="3" />
    <path d="M8.12 8.12 12 12" />
    <path d="M20 4 8.12 15.88" />
    <circle cx="6" cy="18" r="3" />
    <path d="M14.8 14.8 20 20" />
  </StrokeSvg>
);

function FiddleLogo({ size }: { size: "sm" | "lg" }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: ACCENT }} />
      <span className={classNames("font-bold leading-none text-white", size === "lg" ? "text-[20px]" : "text-[18px]")}>
        fiddle
      </span>
    </div>
  );
}

function SectionLabel({ children }: { children: ReactNode }) {
  return <p className="text-xs font-semibold text-[#8e8e93]">{children}</p>;
}

function Sidebar() {
  const [mainTab, setMainTab] = useState<"chat" | "assets">("assets");
  const [subTab, setSubTab] = useState<"all" | "components" | "pages">("pages");

  return (
    <aside className="flex h-full w-[320px] shrink-0 flex-col gap-4 border-r border-[#242428] bg-[#121214] p-3">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3">
        <button type="button" className="flex items-center gap-2 text-sm font-semibold text-white">
          <Icon name="chevron-left" size={14} className="text-[#8e8e93]" />
          Fiddle App
        </button>
        <button type="button" className="text-xs text-[#8e8e93] hover:text-white">
          Feedback
        </button>
      </div>

      {/* Chat / Assets switch */}
      <div className="flex gap-1 rounded-lg bg-[#1e1e22] p-1">
        {(["chat", "assets"] as const).map((tab) => {
          const active = mainTab === tab;
          return (
            <button
              key={tab}
              type="button"
              onClick={() => setMainTab(tab)}
              className={classNames(
                "flex flex-1 items-center justify-center gap-1.5 rounded-md py-1.5 text-[13px]",
                active ? "bg-[#1c1c1e] font-semibold text-white" : "font-medium text-[#8e8e93]"
              )}>
              {tab === "chat" ? (
                <MessageSquareIcon size={14} className={active ? "text-[#ff5c00]" : "text-[#8e8e93]"} />
              ) : (
                <Icon name="folder" size={14} className={active ? "text-[#ff5c00]" : "text-[#8e8e93]"} />
              )}
              {tab === "chat" ? "Chat" : "Assets"}
            </button>
          );
        })}
      </div>

      {/* Sub tabs */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 text-[13px]">
          {(
            [
              ["all", "All"],
              ["components", "Components"],
              ["pages", "Pages (4)"],
            ] as const
          ).map(([key, label]) => {
            const active = subTab === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setSubTab(key)}
                className={classNames(
                  "pb-1",
                  active
                    ? "border-b-2 border-[#ff5c00] font-semibold text-white"
                    : "border-b-2 border-transparent text-[#8e8e93]"
                )}>
                {label}
              </button>
            );
          })}
        </div>
        <button type="button" aria-label="Search" className="text-[#8e8e93] hover:text-white">
          <Icon name="search" size={14} />
        </button>
      </div>

      {/* Scroll list */}
      <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto">
        {/* Community */}
        <div className="flex flex-col gap-2">
          <div className="relative flex h-[160px] shrink-0 flex-col items-center justify-center gap-4 overflow-hidden rounded-xl border border-[#242428] bg-[#050506] p-5">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 flex flex-wrap content-start gap-1 p-2 font-mono text-[6px] leading-[7px] text-white opacity-20">
              {Array.from({ length: 60 }, (_, i) => (
                <span key={i}>0101</span>
              ))}
            </div>
            <div className="relative">
              <FiddleLogo size="lg" />
            </div>
            <p className="relative text-[11px] text-[#8e8e93]">Taste is the only test.</p>
            <button
              type="button"
              className="relative rounded-md bg-white px-3 py-1.5 text-[11px] font-semibold text-black hover:bg-white/90">
              TAKE ME A TOUR
            </button>
          </div>
          <SectionLabel>Community</SectionLabel>
        </div>

        {/* Login */}
        <div className="flex flex-col gap-2">
          <button
            type="button"
            className="self-start rounded bg-white px-2.5 py-1.5 text-[11px] font-bold leading-[13px] text-black">
            add this
          </button>
          <div className="flex flex-col items-center gap-3.5 rounded-xl border border-[#242428] bg-[#0e0e10] p-5">
            <FiddleLogo size="sm" />
            <div className="flex flex-col items-center gap-1">
              <p className="text-[13px] font-semibold text-white">Welcome to Fiddle</p>
              <p className="text-[11px] text-[#8e8e93]">Let&apos;s get started</p>
            </div>
            <button
              type="button"
              className="flex w-full items-center justify-center gap-2 rounded-md bg-[#24292e] py-2 text-xs font-medium text-white hover:bg-[#2f353b]">
              <Icon name="github" size={14} />
              Login with GitHub
            </button>
            <span className="text-[11px] text-[#5c5c5e]">or</span>
            <input
              type="email"
              placeholder="Your Email"
              className="w-full rounded-md border border-[#242428] bg-[#18181a] p-2 text-[11px] leading-[13px] text-white outline-none placeholder:text-[#5c5c5e] focus:border-[#ff5c00]"
            />
            <button
              type="button"
              className="w-full rounded-md bg-[#2c2c30] py-2 text-xs font-medium text-white hover:bg-[#36363b]">
              Continue with Email
            </button>
          </div>
          <SectionLabel>Login</SectionLabel>
        </div>

        {/* Error banner */}
        <div className="flex shrink-0 flex-col gap-1 rounded-md border-l-4 border-[#ff3b30] bg-white p-3">
          <p className="text-xs font-bold text-[#ff3b30]">editor.getContainer is not a function</p>
          <p className="text-[11px] leading-[13px] text-[#1c1c1e]">
            The component failed to render properly. Likely due to a configuration issue in Storybook.
          </p>
        </div>
      </div>
    </aside>
  );
}

function Checklist() {
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  return (
    <div className="absolute bottom-6 right-6 flex w-[240px] flex-col gap-3.5 rounded-lg bg-[#d9d9d9] p-5">
      <p className="text-sm font-bold text-[#121214]">Fiddle Checklist</p>
      <ul className="flex flex-col gap-2">
        {CHECKLIST_ITEMS.map((item) => {
          const isChecked = !!checked[item];
          return (
            <li key={item}>
              <label className="flex cursor-pointer items-center gap-2 text-[13px] leading-4 text-[#121214]">
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={isChecked}
                  onChange={() => setChecked((prev) => ({ ...prev, [item]: !prev[item] }))}
                />
                <span
                  aria-hidden
                  className={classNames(
                    "flex h-3 w-3 shrink-0 items-center justify-center rounded-[2px] border-[1.5px] border-[#121214]",
                    isChecked && "bg-[#121214]"
                  )}>
                  {isChecked && <Icon name="check" size={9} className="text-[#d9d9d9]" />}
                </span>
                <span className={classNames(isChecked && "line-through opacity-60")}>{item}</span>
              </label>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function Toolbar() {
  const [tool, setTool] = useState<"cursor" | "hand" | "scissors">("cursor");
  const tools = [
    { key: "cursor" as const, label: "Select", IconCmp: MousePointerIcon },
    { key: "hand" as const, label: "Pan", IconCmp: HandIcon },
    { key: "scissors" as const, label: "Snip", IconCmp: ScissorsIcon },
  ];

  return (
    <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 gap-3 rounded-xl border border-[#242428] bg-[#18181a] p-2">
      {tools.map(({ key, label, IconCmp }) => {
        const active = tool === key;
        return (
          <button
            key={key}
            type="button"
            aria-label={label}
            aria-pressed={active}
            onClick={() => setTool(key)}
            className={classNames(
              "rounded-lg p-2",
              active ? "bg-[#2c2c2e] text-white" : "text-[#8e8e93] hover:text-white"
            )}>
            <IconCmp size={16} />
          </button>
        );
      })}
    </div>
  );
}

function WelcomeIllustration() {
  return (
    <div className="relative h-[100px] w-[120px] shrink-0 overflow-hidden rounded-xl border border-[#242428] bg-[#1c1c1e]">
      <span className="absolute left-2.5 right-2.5 top-[29px] h-px bg-[#242428]" />
      <span className="absolute left-2.5 right-2.5 top-[49px] h-px bg-[#242428]" />
      <span className="absolute left-2.5 right-2.5 top-[69px] h-px bg-[#242428]" />
      <span className="absolute left-4 top-[39px] h-5 w-8 rounded border border-[#ff5c00] bg-[#ff5c00]/20" />
      <span className="absolute left-[38px] top-[51px] text-white">
        <MousePointerIcon size={18} />
      </span>
    </div>
  );
}

function WelcomeModal({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState(1);
  const current = TOUR_STEPS[step];
  const isLast = step === TOUR_STEPS.length - 1;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="playground-welcome-title"
      className="relative flex w-[480px] flex-col items-center gap-6 rounded-2xl border border-[#242428] bg-[#121214] p-8 shadow-[0_16px_32px_rgba(0,0,0,0.5)]">
      <WelcomeIllustration />
      <div className="flex w-full flex-col items-center gap-2 text-center">
        <h2 id="playground-welcome-title" className="text-xl font-bold leading-6 text-white">
          {current.title}
        </h2>
        <p className="text-[13px] leading-[1.5] text-[#8e8e93]">{current.body}</p>
      </div>
      <div className="flex w-full items-center justify-between">
        <div className="flex items-center gap-1.5">
          {TOUR_STEPS.map((s, i) => (
            <button
              key={s.title}
              type="button"
              aria-label={`Go to step ${i + 1}`}
              aria-current={i === step ? "step" : undefined}
              onClick={() => setStep(i)}
              className={classNames(
                "h-2 w-2 rounded-full",
                i === step ? "bg-[#ff5c00]" : "border-[1.5px] border-[#5c5c5e]"
              )}
            />
          ))}
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="text-[13px] font-medium text-[#8e8e93] hover:text-white">
            Skip Tour
          </button>
          <button
            type="button"
            onClick={() => (isLast ? onClose() : setStep(step + 1))}
            className="rounded-lg bg-[#ff5c00] px-4 py-2 text-[13px] font-semibold text-white hover:bg-[#e65300]">
            {isLast ? "Get Started" : "Show Me Around"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Canvas() {
  const [tourOpen, setTourOpen] = useState(true);

  return (
    <section className="relative h-full min-w-0 flex-1 overflow-hidden bg-[#0a0a0c]">
      {/* Top bar */}
      <div className="absolute right-6 top-4 flex items-center gap-4">
        <button
          type="button"
          className="flex items-center gap-1 rounded-md bg-[#1c1c1e] px-2.5 py-1.5 text-xs font-medium text-white">
          100%
          <Icon name="chevron-down" size={10} className="text-[#8e8e93]" />
        </button>
        <button type="button" className="text-[13px] font-medium text-[#8e8e93] hover:text-white">
          Share
        </button>
        <button
          type="button"
          className="rounded-md border border-[#242428] px-3 py-1.5 text-[13px] font-semibold text-white hover:bg-[#1c1c1e]">
          Submit PR
        </button>
      </div>

      <Toolbar />
      <Checklist />

      {tourOpen && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <WelcomeModal onClose={() => setTourOpen(false)} />
        </div>
      )}
    </section>
  );
}

export default function PlaygroundView() {
  return (
    <div className="flex h-[820px] w-[1440px] overflow-hidden border border-black bg-[#0a0a0c] font-sans text-white antialiased">
      <Sidebar />
      <Canvas />
    </div>
  );
}
