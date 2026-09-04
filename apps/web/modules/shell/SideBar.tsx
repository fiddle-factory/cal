import type { User as UserAuth } from "next-auth";
import { useSession } from "next-auth/react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { getBookerBaseUrlSync } from "@calcom/features/ee/organizations/lib/getBookerBaseUrlSync";
import { useFlagMap } from "@calcom/features/flags/context/provider";
import { IS_VISUAL_REGRESSION_TESTING, ENABLE_PROFILE_SWITCHER } from "@calcom/lib/constants";
import { getPlaceholderAvatar } from "@calcom/lib/defaultAvatarImage";
import { useLocale } from "@calcom/lib/hooks/useLocale";
import { UserPermissionRole } from "@calcom/prisma/enums";
import classNames from "@calcom/ui/classNames";
import { Avatar } from "@calcom/ui/components/avatar";
import { Credits } from "@calcom/ui/components/credits";
import { ButtonOrLink } from "@calcom/ui/components/dropdown";
import { Icon } from "@calcom/ui/components/icon";
import { Logo } from "@calcom/ui/components/logo";
import { SkeletonText } from "@calcom/ui/components/skeleton";
import { Tooltip } from "@calcom/ui/components/tooltip";

import { KBarTrigger } from "./Kbar";
import { Navigation } from "./navigation/Navigation";
import { useBottomNavItems } from "./useBottomNavItems";
import { ProfileDropdown } from "./user-dropdown/ProfileDropdown";
import { UserDropdown } from "./user-dropdown/UserDropdown";

// need to import without ssr to prevent hydration errors
const Tips = dynamic(() => import("./Tips").then((mod) => mod.default), {
  ssr: false,
});

export type SideBarContainerProps = {
  bannersHeight: number;
  isPlatformUser?: boolean;
};

export type SideBarProps = {
  bannersHeight: number;
  user?: UserAuth | null;
  isPlatformUser?: boolean;
};

function SidebarToggleButton({
  isCollapsed,
  onToggle,
}: {
  isCollapsed: boolean;
  onToggle: () => void;
}) {
  const label = isCollapsed ? "Expand sidebar" : "Collapse sidebar";
  return (
    <button
      type="button"
      aria-label={label}
      aria-expanded={!isCollapsed}
      onClick={onToggle}
      title={label}
      className="text-subtle hover:bg-subtle hover:text-emphasis flex h-6 w-6 shrink-0 items-center justify-center rounded-md">
      <Icon
        name={isCollapsed ? "chevron-right" : "chevron-left"}
        className="h-4 w-4 shrink-0"
        aria-hidden="true"
      />
    </button>
  );
}

export function SideBarContainer({ bannersHeight, isPlatformUser = false }: SideBarContainerProps) {
  const { status, data } = useSession();

  // Make sure that Sidebar is rendered optimistically so that a refresh of pages when logged in have SideBar from the beginning.
  // This improves the experience of refresh on app store pages(when logged in) which are SSG.
  // Though when logged out, app store pages would temporarily show SideBar until session status is confirmed.
  if (status !== "loading" && status !== "authenticated") return null;
  return <SideBar isPlatformUser={isPlatformUser} bannersHeight={bannersHeight} user={data?.user} />;
}

export function SideBar({ bannersHeight, user }: SideBarProps) {
  const session = useSession();
  const { t, isLocaleReady } = useLocale();
  const pathname = usePathname();
  const isPlatformPages = pathname?.startsWith("/settings/platform");
  const isAdmin = session.data?.user.role === UserPermissionRole.ADMIN;
  const flags = useFlagMap();

  const [isCollapsed, setIsCollapsed] = useState(false);
  // Fiddle: sidebar collapse transition — duration/easing tunable via the canvas editor controls.
  const [transitionDuration, setTransitionDuration] = useState(80);
  const [transitionEasing, setTransitionEasing] = useState("cubic-bezier(0.4, 0, 0.2, 1)");

  // geneditor-listener-start
  useEffect(() => {
    const el = document.querySelector('[data-config-id="Layout-div-0"]');
    if (!el) return;
    const handler = (e: Event) => {
      const p = (e as CustomEvent).detail as Record<string, unknown>;
      if (typeof p.transitionDuration === "number") setTransitionDuration(p.transitionDuration);
      if (typeof p.transitionEasing === "string") setTransitionEasing(p.transitionEasing);
    };
    el.addEventListener("animation:update", handler);
    return () => el.removeEventListener("animation:update", handler);
  }, []);
  // geneditor-listener-end

  const publicPageUrl = `${getBookerBaseUrlSync(user?.org?.slug ?? null)}/${user?.orgAwareUsername}`;

  const bottomNavItems = useBottomNavItems({
    publicPageUrl,
    isAdmin,
    user,
  });

  const sidebarStylingAttributes = {
    maxHeight: `calc(100vh - ${bannersHeight}px)`,
    top: `${bannersHeight}px`,
  };

  return (
    <div className="relative" data-config-id="Layout-div-0">
      <style jsx global>{`
        aside[data-fiddle-sidebar="true"] {
          transition-property: width, padding;
        }
        aside[data-fiddle-sidebar="true"] .fiddle-sidebar-label {
          transition-property: opacity;
          transition-duration: ${transitionDuration}ms;
          transition-timing-function: ${transitionEasing};
        }
        aside[data-fiddle-sidebar="true"][data-collapsed="true"] .fiddle-sidebar-label {
          opacity: 0;
          pointer-events: none;
        }
        @media (min-width: 1024px) {
          aside[data-fiddle-sidebar="true"][data-collapsed="true"] .fiddle-sidebar-label {
            display: none;
          }
        }
      `}</style>
      <aside
        data-fiddle-sidebar="true"
        data-collapsed={isCollapsed}
        style={{
          ...(!isPlatformPages ? sidebarStylingAttributes : {}),
          transitionProperty: "width, padding",
          transitionDuration: `${transitionDuration}ms`,
          transitionTimingFunction: transitionEasing,
        }}
        className={classNames(
          "bg-cal-muted border-muted fixed left-0 hidden h-full flex-col overflow-y-auto overflow-x-hidden border-r md:sticky md:flex",
          isCollapsed ? "w-14 lg:w-14 lg:px-0" : "w-14 lg:w-56 lg:px-3",
          !isPlatformPages && "max-h-screen"
        )}>
        <div className="flex h-full flex-col justify-between py-3 lg:pt-4">
          <header className="todesktop:-mt-3 todesktop:flex-col-reverse todesktop:[-webkit-app-region:drag] items-center justify-between md:hidden lg:flex">
            {user?.org ? (
              !ENABLE_PROFILE_SWITCHER ? (
                <Link href="/settings/organizations/profile" className="w-full px-1.5">
                  <div className="flex items-center gap-2 font-medium">
                    <Avatar
                      alt={`${user.org.name} logo`}
                      imageSrc={getPlaceholderAvatar(user.org.logoUrl, user.org.name)}
                      size="xsm"
                    />
                    <p className="fiddle-sidebar-label text line-clamp-1 text-sm">
                      <span>{user.org.name}</span>
                    </p>
                  </div>
                </Link>
              ) : (
                <ProfileDropdown />
              )
            ) : (
              <div data-testid="user-dropdown-trigger" className="todesktop:mt-4 w-full">
                <span className="hidden lg:inline">
                  <UserDropdown />
                </span>
                <span className="hidden md:inline lg:hidden">
                  <UserDropdown small />
                </span>
              </div>
            )}
            <div className="flex w-full justify-end rtl:space-x-reverse">
              <button
                color="minimal"
                onClick={() => window.history.back()}
                className="todesktop:block hover:text-emphasis text-subtle group hidden text-sm font-medium">
                <Icon name="arrow-left" className="group-hover:text-emphasis text-subtle h-4 w-4 shrink-0" />
              </button>
              <button
                color="minimal"
                onClick={() => window.history.forward()}
                className="todesktop:block hover:text-emphasis text-subtle group hidden text-sm font-medium">
                <Icon name="arrow-right" className="group-hover:text-emphasis text-subtle h-4 w-4 shrink-0" />
              </button>
              {!!user?.org && (
                <div data-testid="user-dropdown-trigger" className="flex items-center">
                  <UserDropdown small />
                </div>
              )}
              <KBarTrigger />
              <SidebarToggleButton isCollapsed={isCollapsed} onToggle={() => setIsCollapsed((prev) => !prev)} />
            </div>
          </header>
          {/* logo icon for tablet */}
          <Link href="/event-types" className="text-center md:inline lg:hidden">
            <Logo small icon />
          </Link>
          <Navigation isPlatformNavigation={isPlatformPages} />
        </div>

        {!isPlatformPages && (
          <div className="md:px-2 md:pb-4 lg:p-0">
            {flags["sidebar-tips"] && (
              <div className="overflow-hidden">
                <Tips />
              </div>
            )}
            {bottomNavItems.map((item, index) => (
              <Tooltip side="right" content={t(item.name)} className="lg:hidden" key={item.name}>
                <ButtonOrLink
                  id={item.name}
                  href={item.href || undefined}
                  aria-label={t(item.name)}
                  target={item.target}
                  className={classNames(
                    "text-left",
                    "[&[aria-current='page']]:bg-emphasis text-default justify-right group flex items-center rounded-md px-2 py-1.5 text-sm font-medium transition",
                    "[&[aria-current='page']]:text-emphasis mt-0.5 w-full text-sm",
                    isLocaleReady ? "hover:bg-subtle hover:text-emphasis" : "",
                    index === 0 && "mt-3"
                  )}
                  onClick={item.onClick}>
                  {!!item.icon && (
                    <Icon
                      name={item.isLoading ? "rotate-cw" : item.icon}
                      className={classNames(
                        "h-4 w-4 shrink-0 aria-[aria-current='page']:text-inherit",
                        "ml-3 md:mx-auto lg:ltr:mr-2 lg:rtl:ml-2",
                        item.isLoading && "animate-spin"
                      )}
                      aria-hidden="true"
                    />
                  )}
                  {isLocaleReady ? (
                    <span className="fiddle-sidebar-label hidden w-full justify-between lg:flex">
                      <div className="flex">{t(item.name)}</div>
                    </span>
                  ) : (
                    <SkeletonText className="h-[20px] w-full" />
                  )}
                </ButtonOrLink>
              </Tooltip>
            ))}
            {!IS_VISUAL_REGRESSION_TESTING && (
              <div className="fiddle-sidebar-label">
                <Credits />
              </div>
            )}
          </div>
        )}
      </aside>
    </div>
  );
}
