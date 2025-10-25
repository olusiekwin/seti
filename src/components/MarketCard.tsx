"use client"

import { Button } from "@/components/ui/button"
import { MarketBadge } from "./MarketBadge"
import { TrendingUp, TrendingDown, Users, Clock, ImageIcon, BarChart3, Gift, Bookmark, BookmarkCheck } from "lucide-react"
import { type Market, calculatePrices, formatTimeRemaining, formatVolume } from "@/types/contract"
import { usePredictionModalContext } from "@/contexts/PredictionModalContext"
import { useCountdown } from "@/hooks/useCountdown"
import { useFavorites } from "@/hooks/useFavorites"

interface MarketCardProps {
  market: Market
  trending?: "up" | "down"
}

export function MarketCard({ market, trending }: MarketCardProps) {
  const { yesPrice, noPrice } = calculatePrices(market.outcome_a_shares || 0, market.outcome_b_shares || 0)
  const { timeLeft, isEnded, isUrgent } = useCountdown(market.end_time)
  const volume = formatVolume(market.volume_24h)

  // Convert SUI to USD (assuming 1 SUI = $1 for demo)
  const SUI_TO_USD = 1
  const liquidityUSD = ((market.total_liquidity || 0) / 1_000_000_000) * SUI_TO_USD

  const { openModal } = usePredictionModalContext()
  const { isFavorite, toggleFavorite } = useFavorites()

  const handlePredictionClick = (outcome: "YES" | "NO") => {
    console.log("[v0] MarketCard: Prediction clicked:", outcome, market.question)
    openModal(market, outcome)
  }

  const handleFavoriteClick = () => {
    console.log("[v0] MarketCard: Favorite clicked:", market.id)
    toggleFavorite(market.id)
  }

  return (
    <div className="market-card group p-6 w-full max-w-sm mx-auto bg-gradient-to-br from-slate-900/90 to-slate-800/90 border border-slate-700/50 rounded-xl transition-all duration-300 hover:border-blue-500/50 hover:shadow-xl hover:shadow-blue-500/10 backdrop-blur-sm">
      {/* Market Header with Image and Progress Meter */}
      <div className="flex items-start gap-4 mb-6">
        {/* Market Icon */}
        <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 shadow-lg">
          {market.image_url ? (
            <img
              src={market.image_url}
              alt={market.question}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-600 rounded-xl flex items-center justify-center">
              <BarChart3 className="w-7 h-7 text-white" />
            </div>
          )}
        </div>

        {/* Market Question and Progress Meter */}
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-semibold text-white group-hover:text-blue-100 transition-all duration-300 leading-tight line-clamp-2 mb-3">
            {market.question}
          </h3>
          
          {/* Enhanced Circular Progress Meter */}
          <div className="flex items-center gap-4">
            <div className="relative w-16 h-16">
              <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-slate-600"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className={`${yesPrice > 70 ? 'text-green-400' : yesPrice > 40 ? 'text-yellow-400' : 'text-red-400'}`}
                  stroke="currentColor"
                  strokeWidth="2.5"
                  fill="none"
                  strokeDasharray={`${yesPrice}, 100`}
                  strokeLinecap="round"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-sm font-bold text-white">{yesPrice}%</span>
              </div>
            </div>
          </div>

          {/* Enhanced Market Status */}
          <div className="mt-3 flex items-center gap-2">
            {market.resolved ? (
              <div className="inline-flex items-center gap-1 bg-green-500/20 text-green-400 text-xs px-3 py-1.5 rounded-full border border-green-500/30">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                RESOLVED
              </div>
            ) : (
              <div className={`flex items-center gap-2 text-sm ${isUrgent ? 'text-red-300' : 'text-slate-300'}`}>
                <Clock className={`w-4 h-4 ${isUrgent ? 'text-red-300' : 'text-slate-400'}`} />
                <span className={isUrgent ? 'font-semibold' : ''}>
                  {isUrgent ? 'Ends soon' : 'Ends'} {timeLeft}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Enhanced Action Buttons */}
      <div className="flex gap-3 mb-6">
        <Button
          className="flex-1 h-12 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-green-500/25 hover:scale-[1.02]"
          disabled={market.resolved}
          onClick={() => handlePredictionClick("YES")}
        >
          <span className="text-base">Yes</span>
          <span className="text-sm font-bold bg-white/20 px-2 py-1 rounded-lg">{yesPrice}%</span>
        </Button>
        <Button
          className="flex-1 h-12 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-red-500/25 hover:scale-[1.02]"
          disabled={market.resolved}
          onClick={() => handlePredictionClick("NO")}
        >
          <span className="text-base">No</span>
          <span className="text-sm font-bold bg-white/20 px-2 py-1 rounded-lg">{noPrice}%</span>
        </Button>
      </div>

      {/* Enhanced Bottom Section */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-700/50">
        {/* Volume */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-400">Vol.</span>
          <span className="text-sm font-bold text-white">${volume}</span>
        </div>

        {/* Enhanced Action Icons */}
        <div className="flex items-center gap-3">
          <button 
            className="p-2 hover:bg-blue-500/20 rounded-lg transition-all duration-200 hover:scale-110 group"
            title="Share market"
          >
            <Gift className="w-5 h-5 text-slate-400 group-hover:text-blue-400 transition-colors" />
          </button>
          <button 
            className={`p-2 rounded-lg transition-all duration-200 hover:scale-110 group ${
              isFavorite(market.id) 
                ? 'bg-yellow-500/20 hover:bg-yellow-500/30' 
                : 'hover:bg-yellow-500/20'
            }`}
            onClick={handleFavoriteClick}
            title={isFavorite(market.id) ? 'Remove from favorites' : 'Add to favorites'}
          >
            {isFavorite(market.id) ? (
              <BookmarkCheck className="w-5 h-5 text-yellow-400 group-hover:text-yellow-300 transition-colors" />
            ) : (
              <Bookmark className="w-5 h-5 text-slate-400 group-hover:text-yellow-400 transition-colors" />
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
