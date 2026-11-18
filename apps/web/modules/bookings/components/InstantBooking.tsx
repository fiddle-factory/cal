import { createContext, useContext } from "react";

import type { BookerEvent } from "@calcom/features/bookings/types";
import { useLocale } from "@calcom/lib/hooks/useLocale";
import type { User } from "@calcom/prisma/client";
import classNames from "@calcom/ui/classNames";
import { UserAvatarGroupWithOrg } from "@calcom/ui/components/avatar";
import { Button } from "@calcom/ui/components/button";
import { Tooltip } from "@calcom/ui/components/tooltip";

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
        {status === "connecting" && (
          <>
            <Button
              color="secondary"
              size="sm"
              onClick={() => onCancel?.()}
              className="w-full justify-center rounded-lg sm:w-auto">
              {t("cancel")}
            </Button>
            <Button
              color="primary"
              size="sm"
              loading
              disabled
              className="w-full justify-center rounded-lg sm:w-auto">
              {t("connecting")}
            </Button>
          </>
        )}
        {status === "connected" && (
          <Button
            color="primary"
            size="sm"
            StartIcon="video"
            onClick={() => onJoinCall?.()}
            className="w-full justify-center rounded-lg sm:w-auto">
            {t("join_call")}
          </Button>
        )}
        {status === "available" &&
          (isCoolingDown ? (
            <Tooltip content={t("just_connected_description")}>
              <span className="inline-flex w-full sm:w-auto">{connectButton}</span>
            </Tooltip>
          ) : (
            connectButton
          ))}
      </div>
    </div>
  );
};
