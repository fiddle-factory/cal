import { useLocale } from "@calcom/lib/hooks/useLocale";
import classNames from "@calcom/ui/classNames";
import { SkeletonText } from "@calcom/ui/components/skeleton";

// Shimmer is the design-system pulse; it stops for users who prefer reduced motion.
const bone = "motion-reduce:animate-none";

const DETAIL_ROWS = [
  { valueWidths: ["w-48"] },
  { valueWidths: ["w-56", "w-32"] },
  { valueWidths: ["w-40", "w-52", "w-36"] },
  { valueWidths: ["w-44"] },
];

/**
 * Loading placeholder for the booking confirmation page. Mirrors the success card layout
 * (status circle, heading, What/When/Who/Where rows, change links and calendar buttons).
 * Fireworks are intentionally not rendered while loading.
 */
export function BookingSuccessSkeleton() {
  const { t } = useLocale();

  return (
    <div className="h-screen" data-testid="success-page-skeleton">
      <main className="mx-auto max-w-3xl">
        <div className="relative flex items-end justify-center px-4 pb-20 pt-4 sm:flex sm:p-0">
          <div className="main relative inset-0 z-10 my-4 flex flex-col sm:my-0">
            <div
              className={classNames(
                "bg-default dark:bg-cal-muted border-booker border-booker-width inline-block overflow-hidden rounded-lg border px-8 pb-4 pt-5 text-left align-bottom sm:my-8 sm:w-full sm:max-w-xl sm:py-8 sm:align-middle"
              )}>
              <div role="status" aria-live="polite" aria-busy="true">
                <span className="sr-only">{t("loading")}</span>

                {/* Status circle */}
                <SkeletonText className={classNames(bone, "mx-auto block h-12 w-12 rounded-full")} />

                {/* Heading + subtitle */}
                <div className="mb-8 mt-6 flex flex-col items-center">
                  <SkeletonText className={classNames(bone, "h-6 w-64 max-w-full")} />
                  <SkeletonText className={classNames(bone, "mt-3 h-4 w-80 max-w-full")} />

                  {/* What / When / Who / Where */}
                  <div className="border-subtle mt-8 grid w-full grid-cols-3 gap-x-4 border-t pt-8 sm:gap-x-0">
                    {DETAIL_ROWS.map((row, rowIndex) => (
                      <div key={rowIndex} className="contents">
                        <div className="mb-6 last:mb-0">
                          <SkeletonText className={classNames(bone, "h-5 w-14")} />
                        </div>
                        <div className="col-span-2 mb-6 flex flex-col gap-2">
                          {row.valueWidths.map((width, i) => (
                            <SkeletonText key={i} className={classNames(bone, "h-5 max-w-full", width)} />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Reschedule / cancel */}
                <hr className="border-subtle mb-8" />
                <div className="flex items-center justify-center gap-2">
                  <SkeletonText className={classNames(bone, "h-5 w-40")} />
                  <SkeletonText className={classNames(bone, "h-5 w-20")} />
                  <SkeletonText className={classNames(bone, "h-5 w-14")} />
                </div>

                {/* Add to calendar */}
                <hr className="border-subtle mt-8" />
                <div className="flex flex-row items-center justify-center pt-8">
                  <SkeletonText className={classNames(bone, "h-5 w-28 ltr:mr-2 rtl:ml-2")} />
                  <div className="flex gap-2">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <SkeletonText key={i} className={classNames(bone, "h-10 w-10 rounded-sm")} />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default BookingSuccessSkeleton;
