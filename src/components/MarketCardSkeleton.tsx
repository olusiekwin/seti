import { Skeleton } from "@/components/ui/skeleton"

export function MarketCardSkeleton() {
  return (
    <div className="market-card group p-4 md:p-5 w-full max-w-sm mx-auto h-fit flex flex-col bg-background/50 backdrop-blur-sm border border-border/50 rounded-xl shadow-lg">
      {/* Image Skeleton */}
      <Skeleton className="w-full h-28 md:h-32 mb-3 md:mb-4 rounded-lg" />

      {/* Header with Badge */}
      <div className="flex items-start justify-between mb-3 flex-shrink-0">
        <Skeleton className="h-6 w-20 rounded-full" />
        <Skeleton className="h-6 w-24 rounded-full" />
      </div>

      {/* Title */}
      <Skeleton className="h-6 w-full mb-2" />
      <Skeleton className="h-6 w-3/4 mb-2" />

      {/* Description */}
      <Skeleton className="h-4 w-full mb-1" />
      <Skeleton className="h-4 w-5/6 mb-3" />

      {/* Market Stats */}
      <div className="mb-3 p-3 bg-muted/20 rounded-lg flex-shrink-0 border border-border/20">
        <div className="flex items-center justify-between mb-2">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-3 w-16" />
        </div>
        <div className="flex items-center justify-between">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>

      {/* Price Buttons */}
      <div className="grid grid-cols-2 gap-2 mb-3 flex-shrink-0">
        <Skeleton className="h-12 rounded-xl" />
        <Skeleton className="h-12 rounded-xl" />
      </div>

      {/* Chart */}
      <Skeleton className="w-full h-24 mb-3 rounded-lg" />

      {/* Tags */}
      <div className="flex flex-wrap gap-1 mt-auto">
        <Skeleton className="h-6 w-16 rounded-full" />
        <Skeleton className="h-6 w-20 rounded-full" />
        <Skeleton className="h-6 w-14 rounded-full" />
      </div>
    </div>
  )
}
