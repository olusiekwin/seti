"use client"

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useToast } from '@/components/ui/use-toast'
import { usePrediction } from '@/hooks/usePrediction'
import { useAccount } from 'wagmi'
import { 
  X, 
  Clock, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  BarChart3, 
  Trophy,
  Calendar,
  DollarSign,
  Loader2
} from 'lucide-react'
import { type Market, calculatePrices, formatVolume } from '@/types/contract'
import { MarketChart } from './MarketChart'
import { useCountdown } from '@/hooks/useCountdown'
import { useFavoritesBackend } from '@/hooks/useFavoritesBackend'
import { Bookmark, BookmarkCheck } from 'lucide-react'

interface MarketDetailsSidebarProps {
  isOpen: boolean
  onClose: () => void
  market: Market | null
}

export function MarketDetailsSidebar({ isOpen, onClose, market }: MarketDetailsSidebarProps) {
  // All hooks must be called unconditionally at the top
  const [isAnimating, setIsAnimating] = useState(false)
  const [amount, setAmount] = useState('')
  const [selectedOutcome, setSelectedOutcome] = useState<'YES' | 'NO' | null>(null)
  const { isFavorite, toggleFavorite } = useFavoritesBackend()
  const { toast } = useToast()
  const { isConnected, address } = useAccount()
  const { placePrediction, isLoading, error, isSuccess, hash } = usePrediction()
  
  // Safe default values to ensure consistent hook calls
  const safeEndTime = market?.end_time || 0
  const { timeLeft, isEnded, isUrgent } = useCountdown(safeEndTime)
  
  // Safe calculations with null checks
  const { yesPrice, noPrice } = market ? calculatePrices(market.outcome_a_shares || 0, market.outcome_b_shares || 0) : { yesPrice: 0, noPrice: 0 }
  const volume = market ? formatVolume(market.volume_24h) : '0'
  const liquidityUSDC = market ? (market.total_liquidity || 0) / 1_000_000_000 : 0

  const handleFavoriteClick = () => {
    if (!market) return
    setIsAnimating(true)
    setTimeout(() => {
      setIsAnimating(false)
      toggleFavorite(market.id)
    }, 300)
  }

  const handleOutcomeSelect = (outcome: 'YES' | 'NO') => {
    setSelectedOutcome(outcome)
  }

  const handlePlacePrediction = async () => {
    if (!market || !selectedOutcome || !amount) return
    
    if (!isConnected) {
      toast({
        title: "🔗 Connect Your Wallet",
        description: "Connect your wallet to start placing predictions and earning rewards!",
        variant: "destructive",
      })
      return
    }

    if (market.resolved) {
      toast({
        title: "🏁 Market Closed",
        description: "This market has already been resolved. Look for active markets to place your predictions!",
        variant: "destructive",
      })
      return
    }

    const amountNum = parseFloat(amount)
    if (isNaN(amountNum) || amountNum <= 0) {
      toast({
        title: "💰 Invalid Amount",
        description: "Please enter a valid amount greater than 0 USDC to place your prediction.",
        variant: "destructive",
      })
      return
    }

    try {
      const success = await placePrediction({
        marketId: market.id,
        outcome: selectedOutcome,
        amount: amountNum,
      })

      if (success) {
        const outcomeEmoji = selectedOutcome === 'YES' ? '📈' : '📉'
        const outcomeText = selectedOutcome === 'YES' ? 'YES' : 'NO'
        
        // Personalized message based on market type
        let personalizedMessage = ''
        if (isSportsMarket) {
          personalizedMessage = `Your ${outcomeText} prediction on this sports event is now live! May the odds be in your favor! 🏆`
        } else if (market.category?.toLowerCase().includes('crypto')) {
          personalizedMessage = `Your ${outcomeText} crypto prediction is now live! HODL or trade - you decide! 💎`
        } else if (market.category?.toLowerCase().includes('politics')) {
          personalizedMessage = `Your ${outcomeText} political prediction is now live! Democracy in action! 🗳️`
        } else {
          personalizedMessage = `Your ${outcomeText} prediction is now live! Time to see if you're right! 🎯`
        }
        
        toast({
          title: `${outcomeEmoji} Prediction Placed!`,
          description: personalizedMessage,
        })
        
        // Reset form
        setAmount('')
        setSelectedOutcome(null)
        
        // Close sidebar
        onClose()
      } else {
        toast({
          title: "❌ Transaction Failed",
          description: error || "Your prediction couldn't be placed. Check your wallet and try again!",
          variant: "destructive",
        })
      }
    } catch (err) {
      console.error('Prediction error:', err)
      toast({
        title: "⚠️ Something Went Wrong",
        description: "An unexpected error occurred. Please check your connection and try again.",
        variant: "destructive",
      })
    }
  }

  const isSportsMarket = market ? (
    market.category?.toLowerCase().includes('sport') || 
    market.question?.toLowerCase().includes('football') ||
    market.question?.toLowerCase().includes('soccer') ||
    market.question?.toLowerCase().includes('basketball') ||
    market.question?.toLowerCase().includes('baseball') ||
    market.question?.toLowerCase().includes('hockey') ||
    market.question?.toLowerCase().includes('tennis') ||
    market.question?.toLowerCase().includes('cricket') ||
    market.question?.toLowerCase().includes('rugby') ||
    market.question?.toLowerCase().includes('match') ||
    market.question?.toLowerCase().includes('game') ||
    market.question?.toLowerCase().includes('vs') ||
    market.question?.toLowerCase().includes('v ')
  ) : false

  // Always render but conditionally show content to ensure hooks are called consistently
  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />
      
      {/* Sidebar */}
      <div className={`fixed right-0 top-0 h-full w-full max-w-md bg-background/80 backdrop-blur-md border-l border-border/20 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border/20">
            <h2 className="text-lg font-semibold text-foreground">Market Details</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0 hover:bg-muted/50"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            {market && (
              <>
                {/* Market Header */}
                <div className="space-y-4">
                  {/* Market Icon and Title */}
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-muted/20">
                      {market.image_url ? (
                        <img
                          src={market.image_url}
                          alt={market.question}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/40 rounded-lg flex items-center justify-center">
                          <BarChart3 className="w-6 h-6 text-primary" />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-foreground leading-tight mb-2">
                        {market.question}
                      </h3>
                      
                      {/* Market Status */}
                      <div className="flex items-center gap-2 mb-2">
                        {market.resolved ? (
                          <Badge variant="secondary" className="bg-green-100 text-green-700 border-green-200">
                            <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
                            RESOLVED
                          </Badge>
                        ) : (
                          <div className={`flex items-center gap-2 text-sm ${isUrgent ? 'text-destructive' : 'text-muted-foreground'}`}>
                            <Clock className={`w-4 h-4 ${isUrgent ? 'text-destructive' : 'text-muted-foreground'}`} />
                            <span className={isUrgent ? 'font-semibold' : ''}>
                              {isUrgent ? 'Ends soon' : 'Ends'} {timeLeft}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Category and Tags */}
                      <div className="flex items-center gap-2">
                        {market.category && (
                          <Badge variant="outline" className="text-xs">
                            {market.category}
                          </Badge>
                        )}
                        {market.tags?.slice(0, 2).map((tag, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Favorite Button */}
                    <button 
                      className={`p-2 rounded-md transition-colors duration-200 hover:scale-105 ${
                        isFavorite(market.id) 
                        ? 'bg-yellow-100 hover:bg-yellow-200 dark:bg-yellow-900/20 dark:hover:bg-yellow-900/30' 
                        : 'hover:bg-muted/50'
                      } ${isAnimating ? 'animate-favorite-heart' : ''}`}
                      onClick={handleFavoriteClick}
                      title={isFavorite(market.id) ? 'Remove from favorites' : 'Add to favorites'}
                    >
                      {isFavorite(market.id) ? (
                        <BookmarkCheck className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                      ) : (
                        <Bookmark className="w-5 h-5 text-muted-foreground hover:text-yellow-500" />
                      )}
                    </button>
                  </div>

                  {/* Description */}
                  {market.description && (
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {market.description}
                    </p>
                  )}
                </div>

                {/* Sports Indicator */}
                {isSportsMarket && (
                  <Card className="bg-gradient-to-br from-green-500/10 to-green-600/20 border-green-500/30">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
                            <Trophy className="w-5 h-5 text-green-600" />
                          </div>
                          <div>
                            <h3 className="text-sm font-semibold text-green-700 dark:text-green-400">
                              Sports Event
                            </h3>
                            <p className="text-xs text-muted-foreground">
                              Live prediction market
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                          <Badge className="text-xs bg-red-500 text-white">
                            LIVE
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Market Stats */}
                <Card className="bg-muted/20 border-border/50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <BarChart3 className="w-4 h-4 text-primary" />
                      Market Statistics
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Volume (24h)</span>
                      </div>
                      <span className="text-sm font-semibold">${volume}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Liquidity</span>
                      </div>
                      <span className="text-sm font-semibold">${liquidityUSDC.toFixed(2)}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Created</span>
                      </div>
                      <span className="text-sm font-semibold">
                        {new Date(market.created_timestamp * 1000).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Time Remaining</span>
                      </div>
                      <span className={`text-sm font-semibold ${isUrgent ? 'text-destructive' : 'text-foreground'}`}>
                        {timeLeft}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <BarChart3 className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Market ID</span>
                      </div>
                      <span className="text-sm font-mono text-muted-foreground">
                        {market.id.slice(0, 8)}...{market.id.slice(-8)}
                      </span>
                    </div>
                  </CardContent>
                </Card>

                {/* Price Chart */}
                <Card className="bg-muted/20 border-border/50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-primary" />
                      Price Movement
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <MarketChart 
                      marketId={market.id}
                      currentYesPrice={yesPrice}
                      currentNoPrice={noPrice}
                    />
                  </CardContent>
                </Card>

                {/* Current Prices */}
                <Card className="bg-muted/20 border-border/50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Current Prices</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="text-center p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                        <div className="text-xs text-green-600 mb-1">YES</div>
                        <div className="text-lg font-bold text-green-600">{yesPrice}%</div>
                      </div>
                      <div className="text-center p-3 bg-red-500/10 rounded-lg border border-red-500/20">
                        <div className="text-xs text-red-600 mb-1">NO</div>
                        <div className="text-lg font-bold text-red-600">{noPrice}%</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </div>

          {/* Footer Actions */}
          <div className="p-4 border-t border-border/20 space-y-4">
            {/* Wallet Status */}
            {!isConnected && (
              <div className="p-3 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 rounded-lg">
                <div className="flex items-center gap-2">
                  <span className="text-lg">🔗</span>
                  <div>
                    <p className="text-sm font-medium text-yellow-700 dark:text-yellow-400">
                      Connect Your Wallet
                    </p>
                    <p className="text-xs text-yellow-600 dark:text-yellow-500">
                      Start predicting and earning rewards!
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Amount Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Amount (USDC)</label>
              <Input
                type="number"
                placeholder="0.1"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full"
                min="0"
                step="0.01"
                disabled={!isConnected}
              />
            </div>

            {/* Outcome Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Select Outcome</label>
              <div className="grid grid-cols-2 gap-3">
                <Button 
                  className={`h-10 ${selectedOutcome === 'YES' ? 'bg-green-600 hover:bg-green-700' : 'bg-green-500 hover:bg-green-600'} text-white`}
                  disabled={market?.resolved || !isConnected}
                  onClick={() => handleOutcomeSelect('YES')}
                >
                  <span className="mr-2">📈</span>
                  YES ({yesPrice}%)
                </Button>
                <Button 
                  className={`h-10 ${selectedOutcome === 'NO' ? 'bg-red-600 hover:bg-red-700' : 'bg-red-500 hover:bg-red-600'} text-white`}
                  disabled={market?.resolved || !isConnected}
                  onClick={() => handleOutcomeSelect('NO')}
                >
                  <span className="mr-2">📉</span>
                  NO ({noPrice}%)
                </Button>
              </div>
            </div>

            {/* Transaction Note */}
            <div className="p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <div className="flex items-start gap-2">
                <div className="text-blue-600 dark:text-blue-400 text-sm">ℹ️</div>
                <div className="text-sm text-blue-800 dark:text-blue-200">
                  <p className="font-medium mb-1">Transaction Note:</p>
                  <p>MetaMask will show ETH in the transaction modal, but this represents USDC value. The amount shown in ETH equals your USDC bet amount.</p>
                </div>
              </div>
            </div>

            {/* Place Prediction Button */}
            <Button 
              className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground"
              disabled={!selectedOutcome || !amount || market?.resolved || isLoading || !isConnected}
              onClick={handlePlacePrediction}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {selectedOutcome === 'YES' ? 'Placing YES Prediction...' : 'Placing NO Prediction...'}
                </>
              ) : !isConnected ? (
                <>
                  <span className="mr-2">🔗</span>
                  Connect Wallet to Predict
                </>
              ) : (
                <>
                  <span className="mr-2">{selectedOutcome === 'YES' ? '📈' : '📉'}</span>
                  Place {selectedOutcome || 'Your'} Prediction
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}