"use client"

import { Layout } from "@/components/Layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Clock, DollarSign, CheckCircle, XCircle } from "lucide-react"
import { useCurrentWallet } from "@mysten/dapp-kit"
import { Button } from "@/components/ui/button"
import { getPredictions, type Prediction } from "@/hooks/usePrediction"
import { useEffect, useState } from "react"

export default function Activity() {
  const { isConnected } = useCurrentWallet()
  const [allPredictions, setAllPredictions] = useState<Prediction[]>([])
  const [trades, setTrades] = useState<Prediction[]>([])

  useEffect(() => {
    if (isConnected) {
      loadActivity()
    }
  }, [isConnected])

  const loadActivity = () => {
    const predictions = getPredictions()
    // Sort by timestamp, newest first
    const sorted = [...predictions].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    setAllPredictions(sorted)
    setTrades(sorted.filter((p) => p.status !== "pending_settlement"))
  }

  if (!isConnected) {
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

  const renderPredictionItem = (prediction: Prediction) => {
    const isActive = prediction.status === "active"
    const isWon = prediction.status === "won"
    const isLost = prediction.status === "lost"

    return (
      <div
        key={prediction.id}
        className="p-4 bg-muted/20 rounded-lg border border-border/50 hover:border-primary/50 transition-colors"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="inline-block px-2 py-0.5 bg-primary/20 text-primary text-xs font-medium rounded border border-primary/30">
                {prediction.marketCategory}
              </span>
              <span
                className={`inline-block px-2 py-0.5 text-xs font-bold rounded ${
                  prediction.outcome === "YES"
                    ? "bg-success/20 text-success border border-success/30"
                    : "bg-danger/20 text-danger border border-danger/30"
                }`}
              >
                {prediction.outcome}
              </span>
              {isActive && (
                <span className="inline-block px-2 py-0.5 bg-blue-500/20 text-blue-400 text-xs font-medium rounded border border-blue-500/30">
                  ACTIVE
                </span>
              )}
              {isWon && (
                <span className="inline-block px-2 py-0.5 bg-success/20 text-success text-xs font-bold rounded border border-success/30 flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" />
                  WON
                </span>
              )}
              {isLost && (
                <span className="inline-block px-2 py-0.5 bg-muted text-muted-foreground text-xs font-bold rounded border border-border flex items-center gap-1">
                  <XCircle className="w-3 h-3" />
                  LOST
                </span>
              )}
            </div>
            <h4 className="font-semibold text-sm mb-2 line-clamp-2">{prediction.marketQuestion}</h4>
            <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {new Date(prediction.timestamp).toLocaleString()}
              </span>
              <span>Price: {prediction.price}¢</span>
              {!isActive && prediction.settledAt && (
                <span>Settled: {new Date(prediction.settledAt).toLocaleDateString()}</span>
              )}
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm font-bold text-foreground mb-1">{prediction.amount} SUI</div>
            {isActive ? (
              <div className="text-xs text-muted-foreground">
                Potential: {prediction.potentialPayout.toFixed(2)} SUI
              </div>
            ) : (
              <div className={`text-xs font-semibold ${isWon ? "text-success" : "text-muted-foreground"}`}>
                {isWon ? `+${((prediction.actualPayout || 0) - prediction.amount).toFixed(2)}` : "0.00"} SUI
              </div>
            )}
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
        </Tabs>
      </div>
    </Layout>
  )
}
