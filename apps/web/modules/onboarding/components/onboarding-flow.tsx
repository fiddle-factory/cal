"use client";

import { useState } from "react";

import { useLocale } from "@calcom/lib/hooks/useLocale";
import { Button } from "@calcom/ui/components/button";
import { Label, Select, Steps, TextField } from "@calcom/ui/components/form";
import { Icon } from "@calcom/ui/components/icon";
import type { IconName } from "@calcom/ui/components/icon";

export const ONBOARDING_FLOW_STEPS = ["welcome", "profile", "availability", "done"] as const;
export type OnboardingFlowStep = (typeof ONBOARDING_FLOW_STEPS)[number];

type Option = { label: string; value: string };

export type OnboardingFlowData = {
  name: string;
  username: string;
  timeZone: string;
  days: number[];
  startTime: string;
  endTime: string;
};

type OnboardingFlowProps = {
  /** Step shown on first render. */
  initialStep?: OnboardingFlowStep;
  defaultValues?: Partial<OnboardingFlowData>;
  onComplete?: (data: OnboardingFlowData) => void;
};

const TIME_ZONES: Option[] = [
  { label: "America/Los_Angeles", value: "America/Los_Angeles" },
  { label: "America/New_York", value: "America/New_York" },
  { label: "Europe/London", value: "Europe/London" },
  { label: "Europe/Berlin", value: "Europe/Berlin" },
  { label: "Asia/Kolkata", value: "Asia/Kolkata" },
  { label: "Asia/Tokyo", value: "Asia/Tokyo" },
  { label: "Australia/Sydney", value: "Australia/Sydney" },
];

const TIMES: Option[] = Array.from({ length: 17 }, (_, i) => {
  const hour = i + 6;
  const value = `${String(hour).padStart(2, "0")}:00`;
  const label = `${hour % 12 === 0 ? 12 : hour % 12}:00 ${hour < 12 ? "am" : "pm"}`;
  return { label, value };
});

// Sunday-first, matching the day indexes used by availability schedules.
const DAY_KEYS = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];

const DEFAULT_DATA: OnboardingFlowData = {
  name: "",
  username: "",
  timeZone: "America/New_York",
  days: [1, 2, 3, 4, 5],
  startTime: "09:00",
  endTime: "17:00",
};

const findOption = (options: Option[], value: string) => options.find((option) => option.value === value);

const FeatureRow = ({ icon, title, description }: { icon: IconName; title: string; description: string }) => (
  <li className="flex items-start gap-3">
    <div className="bg-muted text-emphasis flex h-9 w-9 shrink-0 items-center justify-center rounded-lg">
      <Icon name={icon} className="h-4 w-4" />
    </div>
    <div className="flex flex-col gap-0.5">
      <p className="text-emphasis text-sm font-medium leading-5">{title}</p>
      <p className="text-subtle text-sm leading-5">{description}</p>
    </div>
  </li>
);

export const OnboardingFlow = ({ initialStep = "welcome", defaultValues, onComplete }: OnboardingFlowProps) => {
  const { t } = useLocale();
  const [stepIndex, setStepIndex] = useState(() => Math.max(0, ONBOARDING_FLOW_STEPS.indexOf(initialStep)));
  const [data, setData] = useState<OnboardingFlowData>({ ...DEFAULT_DATA, ...defaultValues });

  const step = ONBOARDING_FLOW_STEPS[stepIndex];
  const maxSteps = ONBOARDING_FLOW_STEPS.length;
  const isFirstStep = stepIndex === 0;
  const isLastStep = stepIndex === maxSteps - 1;

  const update = (values: Partial<OnboardingFlowData>) => setData((prev) => ({ ...prev, ...values }));
  const goNext = () => setStepIndex((index) => Math.min(index + 1, maxSteps - 1));
  const goBack = () => setStepIndex((index) => Math.max(index - 1, 0));

  const toggleDay = (day: number) =>
    update({
      days: data.days.includes(day)
        ? data.days.filter((d) => d !== day)
        : [...data.days, day].sort((a, b) => a - b),
    });

  const canContinue =
    step === "profile"
      ? data.name.trim().length > 0 && data.username.trim().length > 0
      : step === "availability"
        ? data.days.length > 0 && data.startTime < data.endTime
        : true;

  const header: Record<OnboardingFlowStep, { title: string; subtitle: string }> = {
    welcome: {
      title: t("welcome_to_calcom", { appName: "Cal.com" }),
      subtitle: t("onboarding_flow_welcome_subtitle"),
    },
    profile: { title: t("add_your_details"), subtitle: t("onboarding_flow_profile_subtitle") },
    availability: {
      title: t("onboarding_flow_availability_title"),
      subtitle: t("onboarding_flow_availability_subtitle"),
    },
    done: { title: t("onboarding_flow_done_title"), subtitle: t("onboarding_flow_done_subtitle") },
  };

  const workingDaysSummary = DAY_KEYS.filter((_, index) => data.days.includes(index))
    .map((key) => t(key).slice(0, 3))
    .join(", ");

  return (
    <div className="bg-cal-muted flex min-h-screen w-full flex-col items-center justify-center px-4 py-10 md:px-6">
      <div
        className="border-subtle bg-default flex w-full max-w-[532px] flex-col rounded-2xl border px-4 py-6 sm:px-10 sm:py-8"
        data-testid="onboarding-flow">
        {/* Step indicator */}
        <Steps
          maxSteps={maxSteps}
          currentStep={stepIndex + 1}
          navigateToStep={(index) => {
            if (index < stepIndex) setStepIndex(index);
          }}
          stepLabel={(current, total) => t("onboarding_flow_step_of", { current, total })}
        />

        {/* Header */}
        <div className="mt-6 flex flex-col gap-2">
          {step === "done" && (
            <div className="bg-cal-success text-success mb-2 flex h-10 w-10 items-center justify-center rounded-full">
              <Icon name="check" className="h-5 w-5" />
            </div>
          )}
          <h1 className="font-heading text-emphasis text-xl leading-6" data-testid="onboarding-flow-title">
            {header[step].title}
          </h1>
          <p className="text-subtle text-sm leading-tight">{header[step].subtitle}</p>
        </div>

        {/* Content */}
        <div className="mt-6 flex flex-col gap-6">
          {step === "welcome" && (
            <ul className="flex flex-col gap-4">
              <FeatureRow
                icon="user"
                title={t("onboarding_flow_feature_profile_title")}
                description={t("onboarding_flow_feature_profile_description")}
              />
              <FeatureRow
                icon="clock"
                title={t("onboarding_flow_feature_availability_title")}
                description={t("onboarding_flow_feature_availability_description")}
              />
              <FeatureRow
                icon="link"
                title={t("onboarding_flow_feature_share_title")}
                description={t("onboarding_flow_feature_share_description")}
              />
            </ul>
          )}

          {step === "profile" && (
            <div className="flex flex-col gap-4">
              <TextField
                label={t("your_name")}
                placeholder="John Doe"
                value={data.name}
                onChange={(e) => update({ name: e.target.value })}
              />
              <TextField
                label={t("username")}
                addOnLeading="cal.com/"
                placeholder="john"
                value={data.username}
                onChange={(e) => update({ username: e.target.value.toLowerCase().replace(/\s+/g, "-") })}
              />
              <div className="flex flex-col gap-2">
                <Label className="mb-0">{t("timezone")}</Label>
                <Select<Option>
                  options={TIME_ZONES}
                  value={findOption(TIME_ZONES, data.timeZone)}
                  onChange={(option) => option && update({ timeZone: option.value })}
                />
              </div>
            </div>
          )}

          {step === "availability" && (
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <Label className="mb-0">{t("onboarding_flow_working_days")}</Label>
                <div className="flex flex-wrap gap-2">
                  {DAY_KEYS.map((key, index) => {
                    const selected = data.days.includes(index);
                    return (
                      <Button
                        key={key}
                        size="sm"
                        color={selected ? "primary" : "secondary"}
                        aria-pressed={selected}
                        onClick={() => toggleDay(index)}>
                        {t(key).slice(0, 3)}
                      </Button>
                    );
                  })}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <Label className="mb-0">{t("start_time")}</Label>
                  <Select<Option>
                    options={TIMES}
                    value={findOption(TIMES, data.startTime)}
                    onChange={(option) => option && update({ startTime: option.value })}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label className="mb-0">{t("end_time")}</Label>
                  <Select<Option>
                    options={TIMES}
                    value={findOption(TIMES, data.endTime)}
                    onChange={(option) => option && update({ endTime: option.value })}
                  />
                </div>
              </div>
            </div>
          )}

          {step === "done" && (
            <div className="border-subtle bg-cal-muted flex flex-col divide-subtle divide-y rounded-xl border">
              {[
                { icon: "user" as const, label: data.name || "—" },
                { icon: "link" as const, label: `cal.com/${data.username || "—"}` },
                { icon: "globe" as const, label: data.timeZone },
                {
                  icon: "calendar" as const,
                  label: `${workingDaysSummary || "—"} · ${findOption(TIMES, data.startTime)?.label} – ${
                    findOption(TIMES, data.endTime)?.label
                  }`,
                },
              ].map((row) => (
                <div key={row.icon} className="text-default flex items-center gap-3 px-4 py-3 text-sm">
                  <Icon name={row.icon} className="text-subtle h-4 w-4 shrink-0" />
                  <span className="truncate">{row.label}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="mt-8 flex w-full items-center justify-end gap-4">
          {!isFirstStep && !isLastStep && (
            <Button color="minimal" StartIcon="arrow-left" onClick={goBack}>
              {t("back")}
            </Button>
          )}
          {isLastStep ? (
            <Button color="primary" EndIcon="arrow-right" onClick={() => onComplete?.(data)}>
              {t("onboarding_flow_go_to_dashboard")}
            </Button>
          ) : (
            <Button color="primary" EndIcon="arrow-right" disabled={!canContinue} onClick={goNext}>
              {isFirstStep ? t("get_started") : t("continue")}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default OnboardingFlow;
