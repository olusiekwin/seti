"use client"

import { Button } from "@/components/ui/button"
import { MarketBadge } from "./MarketBadge"
// MarketChart intentionally hidden in card to reduce UI clutter
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

  // Convert SUI to USD (assuming 1 SUI = $1 for demo)
  const SUI_TO_USD = 1
  const liquidityUSD = (market.total_liquidity / 1_000_000_000) * SUI_TO_USD

  const { openModal } = usePredictionModalContext()

  const handlePredictionClick = (outcome: "YES" | "NO") => {
    console.log("[v0] MarketCard: Prediction clicked:", outcome, market.question)
    openModal(market, outcome)
  }

  return (
    <div className="market-card group p-4 md:p-4 w-full max-w-sm mx-auto min-h-[120px] md:min-h-[140px] flex flex-col bg-[hsl(222,47%,11%)] border border-[hsl(220,13%,18%)] rounded-lg transition-all duration-300 hover:border-[hsl(270,70%,65%,0.3)]">
      {/* Content Container - Flex row on mobile, column on desktop */}
      <div className="flex flex-1 gap-2">
        {/* Left: Question */}
        <div className="flex-1 min-w-0 pr-2">
          <h3 className="text-sm text-white/90 group-hover:text-white transition-all duration-300 leading-relaxed">
            {market.question}
          </h3>
        </div>

        {/* Mobile Controls (right-aligned) - Only visible on mobile */}
        <div className="flex md:hidden flex-col items-end justify-center gap-1.5 shrink-0">
          {/* Mobile Buttons */}
          <div className="w-[90px]">
            <Button
              className="w-full h-7 px-3 flex items-center justify-between bg-[hsl(143,97%,40%)] hover:bg-[hsl(143,97%,35%)] text-[11px] text-black rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={market.resolved}
              onClick={() => handlePredictionClick("YES")}
            >
              <span>Yes</span>
              <span className="opacity-60">{yesPrice}%</span>
            </Button>

            <Button
              className="w-full h-7 mt-1.5 px-3 flex items-center justify-between bg-[hsl(0,95%,47%)] hover:bg-[hsl(0,95%,42%)] text-[11px] text-white/90 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={market.resolved}
              onClick={() => handlePredictionClick("NO")}
            >
              <span>No</span>
              <span className="opacity-60">{noPrice}%</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Desktop Controls (bottom-aligned) - Only visible on desktop */}
      <div className="hidden md:flex justify-between items-center mt-2 pt-2 border-t border-white/10">
        {/* Yes button on the left */}
        <Button
          className="w-[45%] h-9 px-4 flex items-center justify-between bg-[hsl(143,97%,40%)] hover:bg-[hsl(143,97%,35%)] text-sm font-medium text-black rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={market.resolved}
          onClick={() => handlePredictionClick("YES")}
        >
          <span>Yes</span>
          <span className="opacity-80">{yesPrice}%</span>
        </Button>

        {/* No button on the right */}
        <Button
          className="w-[45%] h-9 px-4 flex items-center justify-between bg-[hsl(0,95%,47%)] hover:bg-[hsl(0,95%,42%)] text-sm font-medium text-white/90 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={market.resolved}
          onClick={() => handlePredictionClick("NO")}
        >
          <span>No</span>
          <span className="opacity-80">{noPrice}%</span>
        </Button>
      </div>

      {/* Bottom Stats */}
      <div className="grid grid-cols-3 gap-4 text-[11px] mt-3 pt-3 md:mt-3 md:pt-3 border-t border-white/10">
        <div className="flex flex-col">
          <span className="text-white/40">Volume 24h</span>
          <span className="text-white/90">${volume}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-white/40">Time Left</span>
          <span className="text-white/90">{timeLeft}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-white/40">Liquidity</span>
          <span className="text-white/90">${liquidityUSD.toLocaleString()}</span>
        </div>
      </div>
    </div>
  )
}
