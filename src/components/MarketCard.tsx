"use client"

import { Button } from "@/components/ui/button"
import { MarketBadge } from "./MarketBadge"
import { TrendingUp, TrendingDown, Users, Clock, ImageIcon, BarChart3, Gift, Bookmark } from "lucide-react"
import { type Market, calculatePrices, formatTimeRemaining, formatVolume } from "@/types/contract"
import { usePredictionModalContext } from "@/contexts/PredictionModalContext"
import { useCountdown } from "@/hooks/useCountdown"

interface MarketCardProps {
  market: Market
  trending?: "up" | "down"
}

export function MarketCard({ market, trending }: MarketCardProps) {
  const { yesPrice, noPrice } = calculatePrices(market.outcome_a_shares, market.outcome_b_shares)
  const { timeLeft, isEnded, isUrgent } = useCountdown(market.end_time)
  const volume = formatVolume(market.volume_24h)

  // Convert SUI to USD (assuming 1 SUI = $1 for demo)
  const SUI_TO_USD = 1
  const liquidityUSD = (market.total_liquidity / 1_000_000_000) * SUI_TO_USD

  const { openModal } = usePredictionModalContext()

  const handlePredictionClick = (outcome: "YES" | "NO") => {
    console.log("[v0] MarketCard: Prediction clicked:", outcome, market.question)
    openModal(market, outcome)
  }

  return (
    <div className="market-card group p-4 w-full max-w-sm mx-auto bg-[hsl(222,47%,11%)] border border-[hsl(220,13%,18%)] rounded-lg transition-all duration-300 hover:border-[hsl(270,70%,65%,0.3)]">
      {/* Market Header with Image and Progress Meter */}
      <div className="flex items-start gap-3 mb-4">
        {/* Market Icon */}
        <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
          {market.image_url ? (
            <img
              src={market.image_url}
              alt={market.question}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
          )}
        </div>

        {/* Market Question and Progress Meter */}
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-white/90 group-hover:text-white transition-all duration-300 leading-tight line-clamp-2 mb-2">
            {market.question}
          </h3>
          
          {/* Circular Progress Meter */}
          <div className="flex items-center gap-3">
            <div className="relative w-12 h-12">
              <svg className="w-12 h-12 transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-white/20"
                  stroke="currentColor"
                  strokeWidth="3"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className={`${yesPrice > 70 ? 'text-green-500' : yesPrice > 40 ? 'text-yellow-500' : 'text-red-500'}`}
                  stroke="currentColor"
                  strokeWidth="3"
                  fill="none"
                  strokeDasharray={`${yesPrice}, 100`}
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xs font-bold text-white">{yesPrice}%</span>
              </div>
            </div>
          </div>

          {/* Market Status */}
          <div className="mt-2 flex items-center gap-2">
            {market.resolved ? (
              <div className="inline-block bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                RESOLVED
              </div>
            ) : (
              <div className={`flex items-center gap-1 text-xs ${isUrgent ? 'text-red-400' : 'text-white/60'}`}>
                <Clock className={`w-3 h-3 ${isUrgent ? 'text-red-400' : ''}`} />
                <span className={isUrgent ? 'font-semibold' : ''}>
                  {isUrgent ? 'Ends soon' : 'Ends'} {timeLeft}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 mb-4">
        <Button
          className="flex-1 h-10 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          disabled={market.resolved}
          onClick={() => handlePredictionClick("YES")}
        >
          <span>Yes</span>
          <span className="text-xs opacity-80">{yesPrice}%</span>
        </Button>
        <Button
          className="flex-1 h-10 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          disabled={market.resolved}
          onClick={() => handlePredictionClick("NO")}
        >
          <span>No</span>
          <span className="text-xs opacity-80">{noPrice}%</span>
        </Button>
      </div>

      {/* Bottom Section */}
      <div className="flex items-center justify-between pt-3 border-t border-white/10">
        {/* Volume */}
        <div className="flex items-center gap-1">
          <span className="text-xs text-white/40">Vol.</span>
          <span className="text-xs font-medium text-white/90">${volume}</span>
        </div>

        {/* Action Icons */}
        <div className="flex items-center gap-2">
          <button className="p-1 hover:bg-white/10 rounded transition-colors">
            <Gift className="w-4 h-4 text-white/40" />
          </button>
          <button className="p-1 hover:bg-white/10 rounded transition-colors">
            <Bookmark className="w-4 h-4 text-white/40" />
          </button>
        </div>
      </div>
    </div>
  )
}
