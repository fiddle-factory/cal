import type { BookerEvent } from "@calcom/features/bookings/types";
import { getUserAvatarUrl } from "@calcom/lib/getAvatarUrl";
import { useLocale } from "@calcom/lib/hooks/useLocale";
import type { User } from "@calcom/prisma/client";
import classNames from "@calcom/ui/classNames";
import { Avatar, UserAvatarGroupWithOrg } from "@calcom/ui/components/avatar";
import { Button } from "@calcom/ui/components/button";
import { Tooltip } from "@calcom/ui/components/tooltip";
import { createContext, useContext, useEffect, useState } from "react";
import { createPortal } from "react-dom";

/**
 * Lifecycle of the booker's "Talk to someone now" (instant meeting) card, shown on team booking pages.
 * - available: a team member is online right now and the visitor can connect instantly.
 * - connecting: an instant meeting was requested and we are waiting for a team member to accept.
 * - connected: a team member accepted; the visitor can join the video call.
 * When nobody from the team is available, the card is not shown at all.
 */
export type InstantMeetingStatus = "available" | "connecting" | "connected";

export type InstantMeetingController = {
  status: InstantMeetingStatus;
  /** Name of the team member who accepted the call, when known. */
  memberName?: string | null;
  onConnectNow: () => void;
  onCancel?: () => void;
  onJoinCall?: () => void;
};

/**
 * Lets a host page (e.g. an embed or a Storybook story) drive the instant meeting card itself.
 * When no controller is provided, the Booker derives the status from the event and booking data.
 */
export const InstantMeetingControllerContext = createContext<InstantMeetingController | null>(null);
export const useInstantMeetingController = () => useContext(InstantMeetingControllerContext);

interface IInstantBookingProps {
  status?: InstantMeetingStatus;
  memberName?: string | null;
  onConnectNow: () => void;
  onCancel?: () => void;
  onJoinCall?: () => void;
  event: Pick<BookerEvent, "entity" | "schedulingType"> & {
    subsetOfUsers: (Pick<User, "name" | "username" | "avatarUrl"> & { bookerUrl: string })[];
  };
  cooldownMs?: number;
}

const statusDotClassNames: Record<InstantMeetingStatus, string> = {
  available: "bg-green-500",
  connecting: "bg-attention animate-pulse",
  connected: "bg-green-500",
};

export const InstantBooking = ({
  status = "available",
  memberName,
  onConnectNow,
  onCancel,
  onJoinCall,
  event,
  cooldownMs = 0,
}: IInstantBookingProps) => {
  const { t } = useLocale();
  const isCoolingDown = cooldownMs > 0;

  const copy: Record<InstantMeetingStatus, { title: string; description: string }> = {
    available: {
      title: t("talk_to_someone_now"),
      description: t("someone_from_the_team_is_available_now"),
    },
    connecting: {
      title: t("connecting_you_to_the_team"),
      description: t("waiting_for_team_member_to_join"),
    },
    connected: {
      title: t("team_member_is_ready_to_talk", { name: memberName || t("someone_from_the_team") }),
      description: t("your_call_is_ready"),
    },
  };

  if (status !== "available") {
    return (
      <InstantMeetingTakeover
        status={status}
        title={copy[status].title}
        description={copy[status].description}
        memberName={memberName}
        onCancel={onCancel}
        onJoinCall={onJoinCall}
        event={event}
      />
    );
  }

  const connectButton = (
    <Button
      color="primary"
      size="sm"
      StartIcon="phone-call"
      disabled={isCoolingDown}
      onClick={() => onConnectNow()}
      className="w-full justify-center rounded-lg sm:w-auto">
      {t("connect_now")}
    </Button>
  );

  return (
    <div
      role="status"
      aria-live="polite"
      data-testid="instant-booking-card"
      data-status={status}
      className="bg-default border-subtle mx-2 block w-[calc(100vw-1rem)] max-w-md items-center gap-4 rounded-xl border p-[6px] text-sm shadow-sm sm:flex sm:w-auto sm:max-w-none">
      <div className="flex items-center gap-3 ps-1">
        <div className="relative shrink-0">
          <UserAvatarGroupWithOrg
            size="sm"
            className="border-muted"
            organization={{
              slug: event.entity.orgSlug,
              name: event.entity.name || "",
              logoUrl: event.entity.logoUrl ?? null,
            }}
            users={event.subsetOfUsers.slice(0, 2)}
            disableHref
          />
          <div
            className={classNames(
              "border-muted absolute -bottom-0.5 -right-1 h-2 w-2 rounded-full border",
              statusDotClassNames[status]
            )}
          />
        </div>
        <div className="min-w-0">
          <p className="text-emphasis font-semibold leading-5">{copy[status].title}</p>
          <p className="text-subtle leading-5">{copy[status].description}</p>
        </div>
      </div>
      <div className="mt-2 flex shrink-0 items-center gap-2 sm:ms-auto sm:mt-0">
        {isCoolingDown ? (
          <Tooltip content={t("just_connected_description")}>
            <span className="inline-flex w-full sm:w-auto">{connectButton}</span>
          </Tooltip>
        ) : (
          connectButton
        )}
      </div>
    </div>
  );
};

type InstantMeetingTakeoverProps = Pick<
  IInstantBookingProps,
  "memberName" | "onCancel" | "onJoinCall" | "event"
> & {
  status: Exclude<InstantMeetingStatus, "available">;
  title: string;
  description: string;
};

/**
 * Full-viewport takeover shown while connecting to, and once connected with, a team member.
 * Rendered in a portal so it covers the whole booker regardless of the card's positioned/animated wrapper.
 */
const InstantMeetingTakeover = ({
  status,
  title,
  description,
  memberName,
  onCancel,
  onJoinCall,
  event,
}: InstantMeetingTakeoverProps) => {
  const { t } = useLocale();
  const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null);
  const [pulseEnabled, setPulseEnabled] = useState(true);
  const [pulseDuration, setPulseDuration] = useState(1);
  const [pulseOpacity, setPulseOpacity] = useState(0.6);

  useEffect(() => {
    setPortalTarget(document.body);
  }, []);

  useEffect(() => {
    if (status !== "connecting" || !onCancel) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [status, onCancel]);

  // geneditor-listener-start
  useEffect(() => {
    const el = document.querySelector('[data-config-id="InstantMeetingTakeover-controls"]');
    if (!el) return;
    const handler = (e: Event) => {
      const p = (e as CustomEvent).detail as Record<string, unknown>;
      if (typeof p.pulseEnabled === "boolean") setPulseEnabled(p.pulseEnabled);
      if (typeof p.pulseDuration === "number") setPulseDuration(p.pulseDuration);
      if (typeof p.pulseOpacity === "number") setPulseOpacity(p.pulseOpacity);
    };
    el.addEventListener("animation:update", handler);
    return () => el.removeEventListener("animation:update", handler);
  }, [portalTarget, status]);
  // geneditor-listener-end

  if (!portalTarget) return null;

  const member = memberName ? event.subsetOfUsers.find((user) => user.name === memberName) : undefined;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="instant-meeting-takeover-title"
      data-testid="instant-booking-takeover"
      data-status={status}
      data-config-id="InstantMeetingTakeover-controls"
      className="bg-default fixed inset-0 z-50 flex overflow-y-auto">
      <div
        role="status"
        aria-live="polite"
        className="animate-fade-in-up m-auto flex w-full max-w-md flex-col items-center px-6 py-12 text-center">
        <div className="relative flex min-h-32 min-w-32 items-center justify-center p-6">
          {status === "connecting" && (
            <>
              {pulseEnabled && (
                <span
                  className="bg-attention absolute inset-0 animate-ping rounded-full"
                  style={{ animationDuration: `${pulseDuration}s`, opacity: pulseOpacity }}
                />
              )}
              <span className="bg-attention absolute inset-2 animate-pulse rounded-full" />
            </>
          )}
          {status === "connected" && <span className="bg-success absolute inset-0 rounded-full" />}
          <div className="relative">
            {status === "connected" ? (
              <Avatar
                size="xl"
                className="border-default border-2"
                imageSrc={member ? getUserAvatarUrl(member) : undefined}
                alt={memberName || ""}
              />
            ) : (
              <UserAvatarGroupWithOrg
                size="lg"
                organization={{
                  slug: event.entity.orgSlug,
                  name: event.entity.name || "",
                  logoUrl: event.entity.logoUrl ?? null,
                }}
                users={event.subsetOfUsers.slice(0, 2)}
                disableHref
              />
            )}
            <span
              className={classNames(
                "border-default absolute bottom-1 right-1 h-4 w-4 rounded-full border-2",
                statusDotClassNames[status]
              )}
            />
          </div>
        </div>
        <h2
          id="instant-meeting-takeover-title"
          className="font-heading text-emphasis mt-8 text-2xl leading-tight sm:text-3xl">
          {title}
        </h2>
        <p className="text-subtle mt-3 text-base leading-6">{description}</p>
        <div className="mt-8 flex w-full flex-col items-stretch gap-3 sm:w-auto sm:items-center">
          {status === "connecting" ? (
            <Button
              color="secondary"
              size="lg"
              onClick={() => onCancel?.()}
              className="w-full justify-center rounded-lg sm:w-auto sm:min-w-40">
              {t("cancel")}
            </Button>
          ) : (
            <Button
              color="primary"
              size="lg"
              StartIcon="video"
              autoFocus
              onClick={() => onJoinCall?.()}
              className="w-full justify-center rounded-lg px-8 py-3 text-base sm:w-auto sm:min-w-56">
              {t("join_call")}
            </Button>
          )}
        </div>
      </div>
    </div>,
    portalTarget
  );
};
