"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import type { Dispatch, SetStateAction } from "react";
import React, { useState } from "react";

import LicenseRequired from "~/ee/common/components/LicenseRequired";
import type { WorkflowRepository } from "@calcom/features/ee/workflows/repositories/WorkflowRepository";
import { FilterResults } from "@calcom/features/filters/components/FilterResults";
import { TeamsFilter } from "@calcom/features/filters/components/TeamsFilter";
import { getTeamsFiltersFromQuery } from "@calcom/features/filters/lib/getTeamsFiltersFromQuery";
import { WEBAPP_URL } from "@calcom/lib/constants";
import { useLocale } from "@calcom/lib/hooks/useLocale";
import { useRouterQuery } from "@calcom/lib/hooks/useRouterQuery";
import { trpc } from "@calcom/trpc/react";
import classNames from "@calcom/ui/classNames";
import { Avatar } from "@calcom/ui/components/avatar";
import { Button } from "@calcom/ui/components/button";
import { EmptyScreen as EmptyScreenUI } from "@calcom/ui/components/empty-screen";
import { AnimatedPopover } from "@calcom/ui/components/popover";
import Shell, { ShellMain } from "@calcom/web/modules/shell/Shell";
import EmptyScreen from "@calcom/web/modules/ee/workflows/components/EmptyScreen";
import SkeletonLoader from "@calcom/web/modules/ee/workflows/components/SkeletonLoaderList";
import {
  WorkflowCreationDialog,
  useWorkflowCreation,
} from "@calcom/web/modules/ee/workflows/components/WorkflowCreationDialog";
import WorkflowList from "@calcom/web/modules/ee/workflows/components/WorkflowListPage";

import { CreateButtonWithTeamsList } from "~/ee/teams/components/createButton/CreateButtonWithTeamsList";

type PageProps = {
  filteredList?: Awaited<ReturnType<typeof WorkflowRepository.getFilteredList>>;
  /** Forces the loading state (skeleton rows) regardless of query state. */
  isLoading?: boolean;
  /** Forces the error state; falls back to the query error when omitted. */
  error?: { message?: string } | null;
  /** Called when the user clicks Retry in the error state; defaults to refetching. */
  onRetry?: () => void;
};

const DEFAULT_PAGE_BACKGROUND_COLOR = "#ffffff";

function WorkflowsError({ message, onRetry }: { message?: string; onRetry: () => void }) {
  const { t } = useLocale();
  return (
    <EmptyScreenUI
      Icon="triangle-alert"
      headline={t("something_went_wrong")}
      description={message || t("unable_to_load_workflows")}
      buttonRaw={
        <Button color="secondary" StartIcon="rotate-cw" onClick={onRetry} data-testid="workflows-retry">
          {t("retry")}
        </Button>
      }
    />
  );
}

function WorkflowsPage({ filteredList, isLoading, error, onRetry }: PageProps) {
  const { t } = useLocale();
  const [headingText, setHeadingText] = useState<string>(t("workflows"));
  const [pageBackgroundColor, setPageBackgroundColor] = useState<string>(DEFAULT_PAGE_BACKGROUND_COLOR);

  // geneditor-listener-start
  React.useEffect(() => {
    const el = document.querySelector('[data-config-id="SourceRouteStory-main-0"]');
    if (!el) return;
    const handler = (e: Event) => {
      const p = (e as CustomEvent).detail as Record<string, unknown>;
      if (typeof p.headingText === "string") setHeadingText(p.headingText);
      if (typeof p.pageBackgroundColor === "string") setPageBackgroundColor(p.pageBackgroundColor);
    };
    el.addEventListener("animation:update", handler);
    return () => el.removeEventListener("animation:update", handler);
  }, []);
  // geneditor-listener-end

  // Only override the theme background when it was customised, so dark mode keeps its token.
  const mainStyle =
    pageBackgroundColor.toLowerCase() !== DEFAULT_PAGE_BACKGROUND_COLOR
      ? { backgroundColor: pageBackgroundColor }
      : undefined;
  const session = useSession();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- router is kept for future use
  const router = useRouter();
  const routerQuery = useRouterQuery();
  const filters = getTeamsFiltersFromQuery(routerQuery);
  const { showDialog, setShowDialog, pendingTeamId, openDialog } = useWorkflowCreation();

  const {
    data,
    isPending: _isPending,
    error: queryError,
    refetch,
  } = trpc.viewer.workflows.filteredList.useQuery(
    {
      filters,
    },
    {
      enabled: !filteredList && !isLoading && !error,
    }
  );
  const filteredWorkflows = filteredList ?? data;
  const loadError = error ?? (filteredList ? null : queryError);
  const isPending = isLoading ?? (filteredList ? false : _isPending && !loadError);
  const handleRetry = onRetry ?? (() => void refetch());

  return (
    <Shell withoutMain mainStyle={mainStyle}>
      <LicenseRequired>
        <ShellMain
          mainStyle={mainStyle}
          heading={headingText}
          subtitle={t("workflows_to_automate_notifications")}
          title={t("workflows")}
          description={t("workflows_to_automate_notifications")}
          CTA={
            session.data?.hasValidLicense ? (
              <CreateButtonWithTeamsList
                subtitle={t("new_workflow_subtitle").toUpperCase()}
                createFunction={openDialog}
                onlyShowWithNoTeams={true}
                includeOrg={true}
                withPermission={{
                  permission: "workflow.create",
                  fallbackRoles: ["ADMIN", "OWNER"],
                }}
              />
            ) : null
          }>
          <>
            {!isPending && !loadError && filteredWorkflows?.totalCount ? (
              <div className="mb-2 flex">
                <TeamsFilter />
                <div className="mb-4 ml-auto">
                  <CreateButtonWithTeamsList
                    subtitle={t("new_workflow_subtitle").toUpperCase()}
                    createFunction={openDialog}
                    onlyShowWithTeams={true}
                    includeOrg={true}
                    withPermission={{
                      permission: "workflow.create",
                      fallbackRoles: ["ADMIN", "OWNER"],
                    }}
                  />
                </div>
              </div>
            ) : null}
            {loadError && !isPending ? (
              <WorkflowsError message={loadError.message} onRetry={handleRetry} />
            ) : (
              <FilterResults
                queryRes={{ isPending, data: filteredWorkflows }}
                emptyScreen={<EmptyScreen isFilteredView={false} />}
                noResultsScreen={<EmptyScreen isFilteredView={true} />}
                SkeletonLoader={SkeletonLoader}>
                <WorkflowList workflows={filteredWorkflows?.filtered} />
              </FilterResults>
            )}
          </>
        </ShellMain>
        <WorkflowCreationDialog open={showDialog} onOpenChange={setShowDialog} teamId={pendingTeamId} />
      </LicenseRequired>
    </Shell>
  );
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars -- Filter component is kept for future use
const Filter = (props: {
  profiles: {
    readOnly?: boolean | undefined;
    slug: string | null;
    name: string | null;
    teamId: number | null | undefined;
    image?: string | undefined | null;
  }[];
  checked: {
    userId: number | null;
    teamIds: number[];
  };
  setChecked: Dispatch<
    SetStateAction<{
      userId: number | null;
      teamIds: number[];
    }>
  >;
}) => {
  const session = useSession();
  const userId = session.data?.user.id || 0;
  const user = session.data?.user.name || "";
  const userName = session.data?.user.username;
  const userAvatar = `${WEBAPP_URL}/${userName}/avatar.png`;

  const teams = props.profiles.filter((profile) => !!profile.teamId);
  const { checked, setChecked } = props;

  const [noFilter, setNoFilter] = useState(true);

  return (
    <div className={classNames("-mb-2", noFilter ? "w-16" : "w-[100px]")}>
      <AnimatedPopover text={noFilter ? "All" : "Filtered"}>
        <div className="item-center focus-within:bg-subtle hover:bg-cal-muted flex px-4 py-[6px] transition hover:cursor-pointer">
          <Avatar
            imageSrc={userAvatar || ""}
            size="sm"
            alt={`${user} Avatar`}
            className="self-center"
            asChild
          />
          <label
            htmlFor="yourWorkflows"
            className="text-default ml-2 mr-auto self-center truncate text-sm font-medium">
            {user}
          </label>

          <input
            id="yourWorkflows"
            type="checkbox"
            className="text-emphasis focus:ring-emphasis dark:text-muted border-default inline-flex h-4 w-4 place-self-center justify-self-end rounded transition "
            checked={!!checked.userId}
            onChange={(e) => {
              if (e.target.checked) {
                setChecked({ userId: userId, teamIds: checked.teamIds });
                if (checked.teamIds.length === teams.length) {
                  setNoFilter(true);
                }
              } else if (!e.target.checked) {
                setChecked({ userId: null, teamIds: checked.teamIds });

                setNoFilter(false);
              }
            }}
          />
        </div>
        {teams.map((profile) => (
          <div
            className="item-center focus-within:bg-subtle hover:bg-cal-muted flex px-4 py-[6px] transition hover:cursor-pointer"
            key={`${profile.teamId || 0}`}>
            <Avatar
              imageSrc={profile.image || ""}
              size="sm"
              alt={`${profile.slug} Avatar`}
              className="self-center"
              asChild
            />
            <label
              htmlFor={profile.slug || ""}
              className="text-default ml-2 mr-auto select-none self-center truncate text-sm font-medium hover:cursor-pointer">
              {profile.slug}
            </label>

            <input
              id={profile.slug || ""}
              name={profile.slug || ""}
              type="checkbox"
              checked={checked.teamIds?.includes(profile.teamId || 0)}
              onChange={(e) => {
                if (e.target.checked) {
                  const updatedChecked = checked;
                  updatedChecked.teamIds.push(profile.teamId || 0);
                  setChecked({ userId: checked.userId, teamIds: [...updatedChecked.teamIds] });

                  if (checked.userId && updatedChecked.teamIds.length === teams.length) {
                    setNoFilter(true);
                  } else {
                    setNoFilter(false);
                  }
                } else if (!e.target.checked) {
                  const index = checked.teamIds.indexOf(profile.teamId || 0);
                  if (index !== -1) {
                    const updatedChecked = checked;
                    updatedChecked.teamIds.splice(index, 1);
                    setChecked({ userId: checked.userId, teamIds: [...updatedChecked.teamIds] });

                    if (checked.userId && updatedChecked.teamIds.length === teams.length) {
                      setNoFilter(true);
                    } else {
                      setNoFilter(false);
                    }
                  }
                }
              }}
              className="text-emphasis focus:ring-emphasis dark:text-muted border-default inline-flex h-4 w-4 place-self-center justify-self-end rounded transition "
            />
          </div>
        ))}
      </AnimatedPopover>
    </div>
  );
};

export default WorkflowsPage;
