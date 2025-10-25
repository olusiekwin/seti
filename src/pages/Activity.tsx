"use client"

import { Layout } from "@/components/Layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Clock, DollarSign, CheckCircle, XCircle, FileText, Receipt } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useUserPredictions } from "@/hooks/useUserPredictions"
import { useWalletConnection } from "@/hooks/useWalletConnection"
import { PredictionSlipModal } from "@/components/PredictionSlipModal"
import { PredictionSlips } from "@/components/PredictionSlips"
import { PredictionSlipSidebar } from "@/components/PredictionSlipSidebar"
import { useState } from "react"

export default function Activity() {
  const { isConnected, address, isConnecting, isReady, shouldShowConnectPrompt, isWalletReady } = useWalletConnection()
  const { predictions, isLoading } = useUserPredictions(address)
  const [selectedSlip, setSelectedSlip] = useState<{
    market: any
    prediction: any
  } | null>(null)
  const [sidebarSlip, setSidebarSlip] = useState<any>(null)
  
  // All predictions are fetched from Supabase via backend
  const allPredictions = predictions
  const trades = predictions // All predictions are trades

  // Show loading state while wallet is initializing
  if (!isReady || isConnecting) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 max-w-7xl">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gradient-gold mb-4">Activity</h1>
            <p className="text-muted-foreground mb-8">Loading wallet connection...</p>
          </div>
        </div>
      </Layout>
    )
  }

  // Show connect prompt if wallet is not connected
  if (shouldShowConnectPrompt) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 max-w-7xl">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gradient-gold mb-4">Activity</h1>
            <p className="text-muted-foreground mb-8">Connect your wallet to view your activity history</p>
            <Button className="btn-market-gold">Connect Wallet</Button>
          </div>
        </div>
      </Layout>
    )
  }

  const renderPredictionItem = (prediction: any) => {
    const isResolved = prediction.market?.resolved || false
    const isWon = isResolved && prediction.market?.winning_outcome === prediction.outcome
    const isLost = isResolved && prediction.market?.winning_outcome !== prediction.outcome
    const isActive = !isResolved

    return (
      <div
        key={prediction.id}
        className="p-4 bg-muted/20 rounded-lg border border-border/50 hover:border-primary/50 transition-colors"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="inline-block px-2 py-0.5 bg-primary/20 text-primary text-xs font-medium rounded border border-primary/30">
                {prediction.market?.category || 'Unknown'}
              </span>
              <span
                className={`inline-block px-2 py-0.5 text-xs font-bold rounded ${
                  prediction.outcome_label === "YES"
                    ? "bg-success/20 text-success border border-success/30"
                    : "bg-danger/20 text-danger border border-danger/30"
                }`}
              >
                {prediction.outcome_label}
              </span>
              {isActive && (
                <span className="inline-block px-2 py-0.5 bg-blue-500/20 text-blue-400 text-xs font-medium rounded border border-blue-500/30">
                  ACTIVE
                </span>
              )}
              {isWon && (
                <span className="inline-block px-2 py-0.5 bg-success/20 text-success text-xs font-bold rounded border border-success/30 items-center gap-1">
                  <CheckCircle className="w-3 h-3" />
                  WON
                </span>
              )}
              {isLost && (
                <span className="inline-block px-2 py-0.5 bg-muted text-muted-foreground text-xs font-bold rounded border border-border items-center gap-1">
                  <XCircle className="w-3 h-3" />
                  LOST
                </span>
              )}
            </div>
            <h4 className="font-semibold text-sm mb-2 line-clamp-2">{prediction.market?.question || 'Market data unavailable'}</h4>
            <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {new Date(prediction.timestamp * 1000).toLocaleString()}
              </span>
              <span>Amount: {(prediction.amount / 1000000000).toFixed(2)} SUI</span>
              {isResolved && prediction.created_at && (
                <span>Date: {new Date(prediction.created_at).toLocaleDateString()}</span>
              )}
            </div>
          </div>
          <div className="text-right flex flex-col items-end gap-2">
            <div className="text-sm font-bold text-foreground">{(prediction.amount / 1000000000).toFixed(2)} SUI</div>
            {isActive ? (
              <div className="text-xs text-muted-foreground">
                {prediction.outcome_label} @ {(prediction.price / 1000000000).toFixed(2)}
              </div>
            ) : (
              <div className={`text-xs font-semibold ${isWon ? "text-success" : "text-muted-foreground"}`}>
                {isWon ? "WON" : "LOST"}
              </div>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                // Create slip data from prediction
                const slipData = {
                  id: prediction.id || prediction.transaction_hash,
                  marketId: prediction.market_id,
                  marketQuestion: prediction.market?.question || 'Market data unavailable',
                  marketDescription: prediction.market?.description,
                  outcome: prediction.outcome_label as 'YES' | 'NO',
                  amount: prediction.amount,
                  price: prediction.price / 1000000000, // Convert from smallest unit
                  shares: prediction.shares || 0,
                  timestamp: prediction.timestamp * 1000, // Convert to milliseconds
                  transactionHash: prediction.transaction_hash,
                  status: isResolved ? 'resolved' : (prediction.created_at ? 'confirmed' : 'pending'),
                  winningOutcome: prediction.market?.winning_outcome === 1 ? 'YES' : prediction.market?.winning_outcome === 0 ? 'NO' : undefined,
                  payout: isWon ? (prediction.shares || 0) : undefined,
                  marketEndTime: prediction.market?.end_time ? prediction.market.end_time * 1000 : undefined,
                  marketResolved: prediction.market?.resolved
                }
                setSidebarSlip(slipData)
              }}
              className="gap-1 text-xs h-6"
            >
              <FileText className="w-3 h-3" />
              View Slip
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 md:py-12 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gradient-gold mb-2">Activity</h1>
          <p className="text-muted-foreground">View your trading history and transactions</p>
        </div>

        {/* Activity Tabs */}
        <Tabs defaultValue="all" className="space-y-6">
          <TabsList className="bg-muted/30 border border-border/50 w-full sm:w-auto">
            <TabsTrigger value="all">All Activity</TabsTrigger>
            <TabsTrigger value="trades">Trades</TabsTrigger>
            <TabsTrigger value="slips" className="flex items-center gap-2">
              <Receipt className="w-4 h-4" />
              Prediction Slips
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Your latest transactions and trades</CardDescription>
              </CardHeader>
              <CardContent>
                {allPredictions.length === 0 ? (
                  <div className="text-center py-12">
                    <Clock className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-xl font-semibold mb-2">No activity yet</h3>
                    <p className="text-muted-foreground">Your trading activity will appear here</p>
                  </div>
                ) : (
                  <div className="space-y-3">{allPredictions.map(renderPredictionItem)}</div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="trades" className="space-y-4">
            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardHeader>
                <CardTitle>Trade History</CardTitle>
                <CardDescription>All your market trades</CardDescription>
              </CardHeader>
              <CardContent>
                {trades.length === 0 ? (
                  <div className="text-center py-12">
                    <DollarSign className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-xl font-semibold mb-2">No trades yet</h3>
                    <p className="text-muted-foreground">Start trading to build your history</p>
                  </div>
                ) : (
                  <div className="space-y-3">{trades.map(renderPredictionItem)}</div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="slips" className="space-y-4">
            <PredictionSlips />
          </TabsContent>
        </Tabs>
      </div>

      {/* Prediction Slip Sidebar */}
      <PredictionSlipSidebar
        isOpen={!!sidebarSlip}
        onClose={() => setSidebarSlip(null)}
        slipData={sidebarSlip}
      />

      {/* Prediction Slip Modal (Legacy) */}
      {selectedSlip && (
        <PredictionSlipModal
          isOpen={!!selectedSlip}
          onClose={() => setSelectedSlip(null)}
          market={selectedSlip.market}
          prediction={{
            outcome: selectedSlip.prediction.outcome_label,
            amount: selectedSlip.prediction.amount / 1000000000,
            shares: selectedSlip.prediction.shares || 0,
            price: selectedSlip.prediction.price / 1000000000,
            timestamp: selectedSlip.prediction.timestamp,
            transaction_hash: selectedSlip.prediction.transaction_hash
          }}
        />
      )}
    </Layout>
  )
}
