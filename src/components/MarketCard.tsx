"use client"

import { Button } from "@/components/ui/button"
import { MarketBadge } from "./MarketBadge"
import { MarketChart } from "./MarketChart"
import { TrendingUp, TrendingDown, Users, Clock, ImageIcon, BarChart3 } from "lucide-react"
import { type Market, calculatePrices, formatTimeRemaining, formatVolume } from "@/types/contract"
import { usePredictionModalContext } from "@/contexts/PredictionModalContext"

interface MarketCardProps {
  market: Market
  trending?: "up" | "down"
}

export function MarketCard({ market, trending }: MarketCardProps) {
  const { yesPrice, noPrice } = calculatePrices(market.outcome_a_shares, market.outcome_b_shares)
  const timeLeft = formatTimeRemaining(market.end_time)
  const volume = formatVolume(market.volume_24h)

  const { openModal } = usePredictionModalContext()

  const handlePredictionClick = (outcome: "YES" | "NO") => {
    console.log("[v0] MarketCard: Prediction clicked:", outcome, market.question)
    openModal(market, outcome)
  }

  return (
    <div className="market-card group p-4 md:p-5 w-full max-w-sm mx-auto h-fit flex flex-col bg-background/50 backdrop-blur-sm border border-border/50 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:border-border">
      {/* Market Image */}
      {market.image_url && (
        <div className="w-full h-28 md:h-32 mb-3 md:mb-4 rounded-xl overflow-hidden bg-muted/30 flex-shrink-0 relative">
          <img
            src={market.image_url || "/placeholder.svg"}
            alt={market.question}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            onError={(e) => {
              e.currentTarget.style.display = "none"
              e.currentTarget.nextElementSibling?.classList.remove("hidden")
            }}
          />
          <div className="hidden w-full h-full flex items-center justify-center">
            <ImageIcon className="w-8 h-8 text-muted-foreground" />
          </div>
        </div>
      )}

      {/* Header with Badge and Trending */}
      <div className="flex items-start justify-between mb-3 flex-shrink-0">
        <MarketBadge variant="purple" className="text-xs rounded-full">
          {market.category}
        </MarketBadge>
        {trending && (
          <div
            className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
              trending === "up" ? "bg-success/20 text-success" : "bg-danger/20 text-danger"
            }`}
          >
            {trending === "up" ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            <span>Trending</span>
          </div>
        )}
      </div>

      {/* Title */}
      <h3 className="text-lg font-bold text-foreground mb-2 group-hover:text-gradient-gold transition-all duration-300 line-clamp-2 flex-shrink-0 leading-tight">
        {market.question}
      </h3>

      {/* Description */}
      <p className="text-sm text-muted-foreground mb-3 line-clamp-2 flex-shrink-0 leading-relaxed">
        {market.description}
      </p>

      {/* Market Status */}
      {market.resolved && (
        <div className="mb-3 p-3 rounded-xl bg-muted/30 flex-shrink-0 border border-border/30">
          <div className="text-xs text-muted-foreground mb-1">Market Status</div>
          <div
            className={`text-sm font-medium ${
              market.winning_outcome === 0
                ? "text-danger"
                : market.winning_outcome === 1
                  ? "text-success"
                  : "text-muted-foreground"
            }`}
          >
            {market.winning_outcome === 0 ? "NO" : market.winning_outcome === 1 ? "YES" : "INVALID/CANCELED"}
          </div>
        </div>
      )}

      {/* Market Stats */}
      <div className="mb-3 p-3 bg-muted/20 rounded-xl flex-shrink-0 border border-border/20">
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
          <div className="flex items-center gap-1">
            <Users className="w-3 h-3" />
            <span>{(market.total_liquidity / 1_000_000_000).toFixed(2)} SUI</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>{timeLeft}</span>
          </div>
        </div>

        {/* Volume */}
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">24h Volume</span>
          <div className="flex items-center gap-1">
            <BarChart3 className="w-3 h-3 text-success" />
            <span className="text-success font-medium">${volume}</span>
          </div>
        </div>
      </div>

      {/* Price Buttons */}
      <div className="grid grid-cols-2 gap-2 mb-3 flex-shrink-0">
        <Button
          className="btn-market-success h-12 flex flex-col items-center justify-center transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 border-0 shadow-sm bg-transparent"
          variant="outline"
          disabled={market.resolved}
          onClick={() => handlePredictionClick("YES")}
        >
          <span className="text-xs opacity-80 font-medium">YES</span>
          <span className="text-sm font-bold">{yesPrice}¢</span>
        </Button>

        <Button
          className="btn-market-danger h-12 flex flex-col items-center justify-center transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 border-0 shadow-sm bg-transparent"
          variant="outline"
          disabled={market.resolved}
          onClick={() => handlePredictionClick("NO")}
        >
          <span className="text-xs opacity-80 font-medium">NO</span>
          <span className="text-sm font-bold">{noPrice}¢</span>
        </Button>
      </div>

      {/* Market Chart */}
      <div className="w-full mb-3">
        <MarketChart
          marketId={market.id}
          currentYesPrice={yesPrice}
          currentNoPrice={noPrice}
          className="w-full rounded-xl"
        />
      </div>

      {/* Tags */}
      {market.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-auto">
          {market.tags.slice(0, 3).map((tag, index) => (
            <span
              key={index}
              className="text-xs px-2 py-1 bg-muted/30 rounded-full text-muted-foreground border border-border/20"
            >
              {tag}
            </span>
          ))}
          {market.tags.length > 3 && (
            <span className="text-xs px-2 py-1 bg-muted/30 rounded-full text-muted-foreground border border-border/20">
              +{market.tags.length - 3}
            </span>
          )}
        </div>
      )}
    </div>
  )
}
