"use client";

import classNames from "@calcom/ui/classNames";
import { Button } from "@calcom/ui/components/button";
import { SkeletonText } from "@calcom/ui/components/skeleton";

function SkeletonLoader() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="border-subtle bg-default overflow-hidden rounded-xl border">
        <div className="flex items-start justify-between gap-4 p-4 sm:p-6">
          <div className="flex items-start gap-3">
            <SkeletonText className="h-10 w-10 rounded-lg" />
            <div>
              <SkeletonText className="my-1 h-5 w-40" />
              <SkeletonText className="my-1 h-3 w-28" />
            </div>
          </div>
          <SkeletonText className="h-8 w-16 rounded-md" />
        </div>
        <div className="border-subtle bg-subtle grid grid-cols-2 gap-px border-t sm:grid-cols-4 xl:grid-cols-7">
          {Array.from({ length: 7 }, (_, index) => (
            <div key={index} className="bg-default px-4 py-3">
              <SkeletonText className="my-1 h-2 w-8" />
              <SkeletonText className="my-1 h-3 w-20" />
            </div>
          ))}
        </div>
      </div>
      <ul className="divide-subtle border-subtle bg-default divide-y rounded-md border sm:mx-0 sm:overflow-hidden">
        <SkeletonItem />
        <SkeletonItem />
        <SkeletonItem />
      </ul>
    </div>
  );
}

export default SkeletonLoader;

function SkeletonItem() {
  return (
    <li>
      <div className="flex items-center gap-3 px-3 py-2 sm:px-4">
        <SkeletonText className="h-3 w-32" />
        <SkeletonText className="h-2 w-48" />
        <Button className="ml-auto" type="button" variant="icon" color="minimal" size="sm" StartIcon="ellipsis" disabled />
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
