"use client";

import classNames from "@calcom/ui/classNames";
import { Button } from "@calcom/ui/components/button";
import { SkeletonText } from "@calcom/ui/components/skeleton";

function SkeletonLoader() {
  return (
    <ul className="grid animate-pulse grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      <SkeletonItem />
      <SkeletonItem />
      <SkeletonItem />
    </ul>
  );
}

export default SkeletonLoader;

function SkeletonItem() {
  return (
    <li className="border-subtle bg-default relative flex flex-col rounded-md border">
      <div className="flex flex-col gap-3 p-4">
        <SkeletonText className="h-4 w-32" />
        <SkeletonText className="h-3 w-44" />
      </div>
      <div className="border-subtle border-t px-4 py-3">
        <SkeletonText className="h-3 w-28" />
      </div>
      <div className="absolute top-3 ltr:right-3 rtl:left-3">
        <Button type="button" variant="icon" color="secondary" StartIcon="ellipsis" disabled />
      </div>
    </li>
  );
}

export const SelectSkeletonLoader = ({ className }: { className?: string }) => {
  return (
    <li
      className={classNames(
        "border-subtle group flex w-full items-center justify-between rounded-sm border px-[10px] py-3",
        className
      )}>
      <div className="grow truncate text-sm">
        <div className="flex justify-between">
          <SkeletonText className="h-4 w-32" />
          <SkeletonText className="h-4 w-4" />
        </div>
      </div>
    </li>
  );
};
