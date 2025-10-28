import { MarketCard } from "@/components/MarketCard"
import { MarketCardSkeleton } from "@/components/MarketCardSkeleton"
import { useMarkets } from "@/hooks/useMarkets"
import { TrendingUp, Users, Clock } from "lucide-react"

export function TrendingSlider() {
  const { markets, isLoading } = useMarkets({
    sort_by: 'volume_24h',
    status: 'active'
  })

  // Get top 3 markets by volume for trending section
  const trendingMarkets = markets.slice(0, 3)

  return (
    <div className="w-full space-y-6">
      {/* Trending Markets Section */}
      <div className="bg-background/30 dark:bg-black/20 backdrop-blur-sm border border-border/40 dark:border-white/20 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold text-card-foreground">Trending</h3>
        </div>
        
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, index) => (
              <MarketCardSkeleton key={index} />
            ))}
          </div>
        ) : trendingMarkets.length > 0 ? (
          <div className="space-y-3">
            {trendingMarkets.map((market, index) => (
              <div key={market.id} className="relative">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold">
                    {index + 1}
                  </div>
                  <span className="text-xs text-muted-foreground">Trending #{index + 1}</span>
                </div>
                <MarketCard market={market} trending="up" />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6">
            <TrendingUp className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              No trending markets yet
            </p>
          </div>
        )}
      </div>

      {/* Market Stats */}
      <div className="bg-background/30 dark:bg-black/20 backdrop-blur-sm border border-border/40 dark:border-white/20 rounded-xl p-4">
        <h3 className="text-lg font-semibold text-card-foreground mb-4">Stats</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Total Markets</span>
            </div>
            <span className="text-sm font-semibold text-card-foreground">{markets.length}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Active</span>
            </div>
            <span className="text-sm font-semibold text-green-600 dark:text-green-400">
              {markets.filter(m => m.status === 'active').length}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Categories</span>
            </div>
            <span className="text-sm font-semibold text-card-foreground">
              {new Set(markets.map(m => m.category).filter(Boolean)).size}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}