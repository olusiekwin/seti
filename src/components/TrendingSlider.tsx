import { MarketCard } from "@/components/MarketCard"
import { MarketCardSkeleton } from "@/components/MarketCardSkeleton"
import { useMarkets } from "@/hooks/useMarkets"
import { TrendingUp, Star, Zap, ChevronLeft, ChevronRight } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useState, useRef } from "react"

export function TrendingSlider() {
  const { markets, isLoading } = useMarkets({
    sort_by: 'volume_24h',
    status: 'active'
  })

  // Get top 4 markets by volume for trending section
  const trendingMarkets = markets.slice(0, 4)

  return (
    <div className="w-full space-y-6">
      {/* Trending Markets Card */}
      <Card className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20 border-orange-200 dark:border-orange-800">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <TrendingUp className="w-5 h-5 text-orange-500" />
            What's Hot Today
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Top trending markets by volume
          </p>
        </CardHeader>
        <CardContent className="space-y-3">
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(4)].map((_, index) => (
                <MarketCardSkeleton key={index} />
              ))}
            </div>
          ) : trendingMarkets.length > 0 ? (
            <div className="space-y-3">
              {trendingMarkets.map((market, index) => (
                <div key={market.id} className="relative">
                  <div className="flex items-center justify-between mb-2">
                    <Badge className="bg-orange-500 text-white text-xs font-bold px-2 py-1">
                      #{index + 1} Trending
                    </Badge>
                    <div className="flex items-center gap-1 text-red-600 dark:text-red-400">
                      <Zap className="w-3 h-3" />
                      <span className="text-xs font-medium">Hot</span>
                    </div>
                  </div>
                  <div className="p-3 bg-background/50 rounded-lg border border-border/50 hover:border-orange-300 dark:hover:border-orange-700 transition-colors cursor-pointer">
                    <h4 className="font-medium text-sm mb-2 line-clamp-2 leading-tight">
                      {market.question}
                    </h4>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span className="capitalize bg-muted/50 px-2 py-1 rounded text-xs">
                        {market.category}
                      </span>
                      <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                        <TrendingUp className="w-3 h-3" />
                        <span className="font-medium">High Vol</span>
                      </div>
                    </div>
                  </div>
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
        </CardContent>
      </Card>

      {/* Quick Stats Card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Market Stats</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Total Markets</span>
            <Badge variant="outline">{markets.length}</Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Active Today</span>
            <Badge variant="outline" className="text-green-600 dark:text-green-400">
              {markets.filter(m => m.status === 'active').length}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Categories</span>
            <Badge variant="outline">
              {new Set(markets.map(m => m.category).filter(Boolean)).size}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
