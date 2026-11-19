"use client";

import { useEffect, useState } from "react";

import { useLocale } from "@calcom/lib/hooks/useLocale";
import { Badge } from "@calcom/ui/components/badge";
import { Button } from "@calcom/ui/components/button";

type BookingCountdownTimerProps = {
  seconds?: number;
};

export function BookingCountdownTimer({ seconds = 10 }: BookingCountdownTimerProps) {
  const { t } = useLocale();
  const [remaining, setRemaining] = useState(seconds);
  const isFinished = remaining <= 0;

  useEffect(() => {
    if (isFinished) return;
    const timeout = setTimeout(() => setRemaining((value) => Math.max(value - 1, 0)), 1000);
    return () => clearTimeout(timeout);
  }, [remaining, isFinished]);

  return (
    <div
      className="mb-4 flex items-center justify-end gap-2"
      data-testid="booking-countdown-timer"
      role="timer"
      aria-live="polite">
      {isFinished ? (
        <>
          <Badge variant="green" startIcon="check" data-testid="booking-countdown-finished">
            {t("countdown_finished")}
          </Badge>
          <Button
            color="minimal"
            size="sm"
            StartIcon="rotate-ccw"
            data-testid="booking-countdown-restart"
            onClick={() => setRemaining(seconds)}>
            {t("restart")}
          </Button>
        </>
      ) : (
        <Badge variant="gray" startIcon="clock">
          <span className="tabular-nums">{t("countdown_seconds_remaining", { count: remaining })}</span>
        </Badge>
      )}
    </div>
  );
}

export default BookingCountdownTimer;
