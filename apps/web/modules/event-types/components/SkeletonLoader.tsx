import { Icon } from "@calcom/ui/components/icon";
import { SkeletonAvatar, SkeletonContainer, SkeletonText } from "@calcom/ui/components/skeleton";

function SkeletonLoader() {
  return (
    <SkeletonContainer>
      <div className="mb-4 flex items-center">
        <SkeletonAvatar className="h-8 w-8" />
        <div className="flex flex-col stack-y-1">
          <SkeletonText className="h-4 w-16" />
          <SkeletonText className="h-4 w-24" />
        </div>
      </div>
      <ul className="border-subtle bg-default divide-subtle divide-y rounded-md border sm:mx-0 sm:overflow-hidden">
        <SkeletonItem />
        <SkeletonItem />
        <SkeletonItem />
      </ul>
    </SkeletonContainer>
  );
}

export default SkeletonLoader;

export function InfiniteSkeletonLoader() {
  return (
    <SkeletonContainer>
      <ul className="border-subtle bg-default divide-subtle divide-y rounded-md border sm:mx-0 sm:overflow-hidden">
        <SkeletonItem />
        <SkeletonItem />
        <SkeletonItem />
      </ul>
    </SkeletonContainer>
  );
}

function TabsSkeletonLoader() {
  return (
    <div className="mb-2.5 max-w-full">
      <nav className="no-scrollbar flex space-x-0.5 overflow-x-scroll rounded-md">
        <div className="bg-subtle inline-flex h-fit items-center justify-center whitespace-nowrap rounded-md p-1">
          <SkeletonAvatar className="mb-1 mr-1 h-4 w-4 rounded-full" />
          <SkeletonText className="h-4 w-16" />
        </div>
        <div className="inline-flex h-fit items-center justify-center whitespace-nowrap rounded-md p-1">
          <SkeletonAvatar className="mb-1 mr-1 h-4 w-4 rounded-full" />
          <SkeletonText className="h-4 w-16" />
        </div>
      </nav>
    </div>
  );
}

export function SearchSkeletonLoader() {
  return (
    <div className="max-w-64 mb-4">
      <div className="bg-default border-default flex h-8 items-center gap-1 rounded-[10px] border px-3 py-2">
        <div className="flex items-center justify-center">
          <Icon name="search" className="text-subtle h-4 w-4" />
        </div>
        <SkeletonText className="max-w-56 h-4 w-full" />
      </div>
    </div>
  );
}

export function EventTypesSkeletonLoader() {
  return (
    <SkeletonContainer>
      <TabsSkeletonLoader />
      <SearchSkeletonLoader />
      <ul className="border-subtle bg-default divide-subtle divide-y rounded-md border sm:mx-0 sm:overflow-hidden">
        <SkeletonItem />
        <SkeletonItem />
        <SkeletonItem />
      </ul>
    </SkeletonContainer>
  );
}

function SkeletonItem() {
  return (
    <li data-testid="event-type-skeleton-row">
      <div className="group flex w-full max-w-full items-center justify-between overflow-hidden px-4 py-4 sm:px-6">
        {/* Title, slug, description and duration badge */}
        <div className="relative flex-1 overflow-hidden pr-4 text-sm">
          <div className="flex items-center gap-2">
            <SkeletonText className="h-4 w-28" />
            <SkeletonText className="hidden h-3 w-36 sm:inline-block" />
          </div>
          <SkeletonText className="mt-2 h-3 w-full max-w-xs" />
          <ul className="mt-2 flex space-x-2 rtl:space-x-reverse">
            <li className="flex items-center whitespace-nowrap">
              <span className="bg-subtle inline-flex h-5 items-center gap-1 rounded-md px-1.5">
                <Icon name="clock" className="text-subtle h-3 w-3" />
                <SkeletonText className="h-2.5 w-8" />
              </span>
            </li>
          </ul>
        </div>
        {/* Toggle and action buttons */}
        <div className="mt-4 hidden sm:mt-0 sm:flex">
          <div className="flex items-center justify-between space-x-2 rtl:space-x-reverse">
            <div className="self-center rounded-md p-2">
              <SkeletonText className="h-5 w-9 rounded-full" />
            </div>
            <div className="border-subtle flex overflow-hidden rounded-[10px] border">
              <SkeletonText className="h-9 w-9 rounded-none" />
              <SkeletonText className="border-subtle h-9 w-9 rounded-none border-l" />
              <SkeletonText className="border-subtle h-9 w-9 rounded-none border-l" />
            </div>
          </div>
        </div>
      </div>
    </li>
  );
}
