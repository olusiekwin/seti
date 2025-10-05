"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { MarketChart } from "./MarketChart"
import { ChevronLeft, ChevronRight, Play, Pause } from "lucide-react"
import { type Market, calculatePrices, formatTimeRemaining, formatVolume } from "@/types/contract"
import { usePredictionModal } from "@/hooks/usePredictionModal"

interface MarketSlideshowProps {
  markets: Market[]
}

export function MarketSlideshow({ markets }: MarketSlideshowProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(true)
  const { openModal } = usePredictionModal()

  // Auto-advance slideshow
  useEffect(() => {
    if (!isPlaying) return

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % markets.length)
    }, 5000) // Change slide every 5 seconds

    return () => clearInterval(interval)
  }, [isPlaying, markets.length])

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + markets.length) % markets.length)
  }

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % markets.length)
  }

  const goToSlide = (index: number) => {
    setCurrentIndex(index)
  }

  const handlePredictionClick = (outcome: "YES" | "NO") => {
    openModal(currentMarket, outcome)
  }

  if (markets.length === 0) return null

  const currentMarket = markets[currentIndex]
  const { yesPrice, noPrice } = calculatePrices(currentMarket.outcome_a_shares, currentMarket.outcome_b_shares)
  const timeLeft = formatTimeRemaining(currentMarket.end_time)
  const volume = formatVolume(currentMarket.volume_24h)

  return (
    <section className="relative w-full max-w-7xl h-80 md:h-96 lg:h-[500px] overflow-hidden rounded-2xl bg-gradient-dark mx-auto px-4">
      {/* Background Image */}
      {currentMarket.image_url && (
        <div className="absolute inset-0">
          <img
            src={currentMarket.image_url || "/placeholder.svg"}
            alt={currentMarket.question}
            className="w-full h-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
        </div>
      )}

      {/* Content */}
      <div className="relative z-10 h-full flex items-center">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl">
            {/* Market Category */}
            <div className="mb-3 md:mb-4">
              <span className="inline-block px-2 md:px-3 py-1 bg-primary/20 text-primary text-xs md:text-sm font-medium rounded-full border border-primary/30">
                {currentMarket.category}
              </span>
            </div>

            {/* Market Question */}
            <h1 className="text-2xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-4 md:mb-6 leading-tight">
              <span className="text-gradient-gold font-orbitron">{currentMarket.question}</span>
            </h1>

            {/* Market Description */}
            <p className="text-sm md:text-lg lg:text-xl text-muted-foreground mb-6 md:mb-8 max-w-2xl leading-relaxed">
              {currentMarket.description}
            </p>

            {/* Market Stats */}
            <div className="flex flex-wrap items-center gap-4 md:gap-6 lg:gap-8 mb-6 md:mb-8">
              <div className="flex items-center gap-2">
                <div className="text-lg md:text-xl lg:text-2xl font-bold text-gradient-gold">
                  {yesPrice}¢ / {noPrice}¢
                </div>
                <div className="text-xs md:text-sm text-muted-foreground">YES / NO</div>
              </div>

              <div className="flex items-center gap-2">
                <div className="text-lg md:text-xl lg:text-2xl font-bold text-gradient-neon">${volume}</div>
                <div className="text-xs md:text-sm text-muted-foreground">24h Volume</div>
              </div>

              <div className="flex items-center gap-2">
                <div className="text-lg md:text-xl lg:text-2xl font-bold text-accent">{timeLeft}</div>
                <div className="text-xs md:text-sm text-muted-foreground">Time Left</div>
              </div>
            </div>

            {/* Market Chart */}
            <div className="mb-6 md:mb-8 w-full max-w-2xl mx-auto">
              <MarketChart
                marketId={currentMarket.id}
                currentYesPrice={yesPrice}
                currentNoPrice={noPrice}
                className="bg-black/20 backdrop-blur-sm w-full"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row flex-wrap gap-3 md:gap-4">
              <Button
                size="lg"
                className="btn-market-success text-sm md:text-lg px-4 md:px-6 lg:px-8 py-3 md:py-4 lg:py-6 w-full sm:w-auto transition-all duration-200 hover:scale-105"
                onClick={() => handlePredictionClick("YES")}
              >
                Trade YES ({yesPrice}¢)
              </Button>
              <Button
                size="lg"
                className="btn-market-danger text-sm md:text-lg px-4 md:px-6 lg:px-8 py-3 md:py-4 lg:py-6 w-full sm:w-auto transition-all duration-200 hover:scale-105"
                onClick={() => handlePredictionClick("NO")}
              >
                Trade NO ({noPrice}¢)
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="absolute bottom-4 md:bottom-6 left-1/2 transform -translate-x-1/2 flex items-center gap-2 md:gap-4">
        {/* Play/Pause Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsPlaying(!isPlaying)}
          className="text-white hover:text-primary w-8 h-8 md:w-10 md:h-10"
        >
          {isPlaying ? <Pause className="w-4 h-4 md:w-5 md:h-5" /> : <Play className="w-4 h-4 md:w-5 md:h-5" />}
        </Button>

        {/* Previous Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={goToPrevious}
          className="text-white hover:text-primary w-8 h-8 md:w-10 md:h-10"
        >
          <ChevronLeft className="w-4 h-4 md:w-5 md:h-5" />
        </Button>

        {/* Slide Indicators */}
        <div className="flex gap-1 md:gap-2">
          {markets.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-2 h-2 md:w-3 md:h-3 rounded-full transition-all duration-300 ${
                index === currentIndex ? "bg-primary scale-125" : "bg-white/30 hover:bg-white/50"
              }`}
            />
          ))}
        </div>

        {/* Next Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={goToNext}
          className="text-white hover:text-primary w-8 h-8 md:w-10 md:h-10"
        >
          <ChevronRight className="w-4 h-4 md:w-5 md:h-5" />
        </Button>
      </div>

      {/* Market Tags */}
      {currentMarket.tags.length > 0 && (
        <div className="absolute top-4 md:top-6 right-4 md:right-6 flex flex-wrap gap-1 md:gap-2">
          {currentMarket.tags.slice(0, 3).map((tag, index) => (
            <span
              key={index}
              className="px-2 md:px-3 py-1 bg-black/30 backdrop-blur-sm text-white text-xs md:text-sm rounded-full border border-white/20"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </section>
  )
}
