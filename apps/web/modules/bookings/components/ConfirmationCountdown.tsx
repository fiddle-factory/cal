import { useEffect, useState } from "react";

import { useLocale } from "@calcom/lib/hooks/useLocale";
import { Badge } from "@calcom/ui/components/badge";
import { Button } from "@calcom/ui/components/button";

type ConfirmationCountdownProps = {
  /** Number of seconds to count down from. */
  seconds?: number;
};

export function ConfirmationCountdown({ seconds = 10 }: ConfirmationCountdownProps) {
  const { t } = useLocale();
  const [secondsLeft, setSecondsLeft] = useState(seconds);
  const isFinished = secondsLeft <= 0;

  useEffect(() => {
    if (isFinished) return;
    const timeout = setTimeout(() => setSecondsLeft((current) => Math.max(current - 1, 0)), 1000);
    return () => clearTimeout(timeout);
  }, [secondsLeft, isFinished]);

  return (
    <div className="mb-4 flex items-center justify-end gap-2" data-testid="confirmation-countdown">
      <div role="timer" aria-live="polite" aria-atomic="true">
        {isFinished ? (
          <Badge variant="success" startIcon="check">
            {t("countdown_finished")}
          </Badge>
        ) : (
          <Badge variant="gray" startIcon="clock">
            <span className="tabular-nums">{t("countdown_seconds_left", { seconds: secondsLeft })}</span>
          </Badge>
        )}
      </div>
      {isFinished && (
        <Button
          color="minimal"
          size="xs"
          StartIcon="rotate-ccw"
          data-testid="confirmation-countdown-restart"
          onClick={() => setSecondsLeft(seconds)}>
          {t("restart")}
        </Button>
      )}
    </div>
  );
}

export default ConfirmationCountdown;
