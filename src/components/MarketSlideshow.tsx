"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { type Market, calculatePrices, formatTimeRemaining, formatVolume } from "@/types/contract"
import { usePredictionModal } from "@/hooks/usePredictionModal"

interface MarketSlideshowProps {
  markets: Market[]
}

export function MarketSlideshow({ markets }: MarketSlideshowProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(true)
  const { openModal } = usePredictionModal()
  const touchStartX = useRef<number | null>(null)
  const touchEndX = useRef<number | null>(null)

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
    touchEndX.current = null
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX
  }

  const handleTouchEnd = () => {
    if (touchStartX.current === null || touchEndX.current === null) return
    const delta = touchStartX.current - touchEndX.current
    const threshold = 50 // px
    if (delta > threshold) {
      goToNext()
    } else if (delta < -threshold) {
      goToPrevious()
    }
    touchStartX.current = null
    touchEndX.current = null
  }

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

  const [staticMarketData, setStaticMarketData] = useState({
    yesPrice: 0,
    noPrice: 0,
    timeLeft: "",
    volume: "0"
  })

  // Set static market data when component mounts or when first market is loaded
  useEffect(() => {
    if (markets.length > 0) {
      const firstMarket = markets[0]
      const prices = calculatePrices(firstMarket.outcome_a_shares, firstMarket.outcome_b_shares)
      setStaticMarketData({
        yesPrice: prices.yesPrice,
        noPrice: prices.noPrice,
        timeLeft: formatTimeRemaining(firstMarket.end_time),
        volume: formatVolume(firstMarket.volume_24h)
      })
    }
  }, [markets])

  if (markets.length === 0) return null

  const currentMarket = markets[currentIndex]

  return (
    <section
      className="relative w-full max-w-7xl h-[320px] sm:h-[340px] md:h-[360px] overflow-hidden rounded-2xl bg-gradient-dark mx-auto px-4 sm:px-6 md:px-8 py-6"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
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
      {/* Content */}
      <div className="relative z-10 h-full flex flex-col justify-between py-2">
        <div className="container mx-auto">
          <div className="max-w-4xl mx-auto">
            {/* Market Category */}
            <div className="mb-2">
              <span className="inline-block px-2 md:px-3 py-1 bg-primary/20 text-primary text-xs md:text-sm font-medium rounded-full border border-primary/30">
                {currentMarket.category}
              </span>
            </div>

            {/* Content Container with Fixed Height */}
            <div className="h-[120px] md:h-[140px] overflow-y-auto scrollbar-hide">
              {/* Market Question */}
              <h1 className="text-xl md:text-3xl lg:text-4xl font-bold leading-snug mb-2">
                <span className="text-gradient-gold font-orbitron line-clamp-2">{currentMarket.question}</span>
              </h1>

              {/* Market Description */}
              <p className="text-sm md:text-base text-muted-foreground max-w-2xl leading-relaxed line-clamp-3">
                {currentMarket.description}
              </p>
            </div>
          </div>
        </div>

        {/* Market Stats */}
        <div className="container mx-auto mt-8 mb-16">
          <div className="max-w-4xl mx-auto">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-center">
              <div className="flex items-center gap-2 justify-center sm:justify-start">
                <Button
                  size="sm"
                  className="btn-market-success text-xs sm:text-sm px-3 py-1.5 transition-all duration-200 hover:scale-105"
                  onClick={() => handlePredictionClick("YES")}
                >
                  Trade YES ({staticMarketData.yesPrice}¢)
                </Button>
                <Button
                  size="sm"
                  className="btn-market-danger text-xs sm:text-sm px-3 py-1.5 transition-all duration-200 hover:scale-105"
                  onClick={() => handlePredictionClick("NO")}
                >
                  Trade NO ({staticMarketData.noPrice}¢)
                </Button>
              </div>

              <div className="flex items-center gap-3 justify-center">
                <div className="text-base md:text-lg lg:text-xl font-bold text-gradient-neon">${staticMarketData.volume}</div>
                <div className="text-xs md:text-sm text-muted-foreground">24h Volume</div>
              </div>

              <div className="flex items-center gap-3 justify-center sm:justify-end">
                <div className="text-base md:text-lg lg:text-xl font-bold text-destructive">{staticMarketData.timeLeft}</div>
                <div className="text-xs md:text-sm text-muted-foreground">Time Left</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Controls */}
      {/* Slide Indicators */}
      <div className="absolute bottom-4 md:bottom-6 left-1/2 transform -translate-x-1/2 flex gap-1 md:gap-2 z-20">
        {markets.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-2 h-2 md:w-3 md:h-3 rounded-full transition-all duration-300 ${index === currentIndex ? "bg-primary scale-125" : "bg-white/30 hover:bg-white/50"
              }`}
          />
        ))}
      </div>

      {/* Left Triangle Navigation */}
      <button
        onClick={goToPrevious}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-8 h-8 md:w-10 md:h-10 flex items-center justify-center hover:bg-black/20 rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-primary"
        aria-label="Previous slide"
      >
        <div className="w-0 h-0 border-y-[8px] border-y-transparent border-r-[12px] border-r-white"></div>
      </button>

      {/* Right Triangle Navigation */}
      <button
        onClick={goToNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-8 h-8 md:w-10 md:h-10 flex items-center justify-center hover:bg-black/20 rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-primary"
        aria-label="Next slide"
      >
        <div className="w-0 h-0 border-y-[8px] border-y-transparent border-l-[12px] border-l-white"></div>
      </button>

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
