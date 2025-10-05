"use client"
import { MarketCard } from "@/components/MarketCard"
import { MarketCardSkeleton } from "@/components/MarketCardSkeleton"
import { MarketSlideshow } from "@/components/MarketSlideshow"
import { SharedPredictionModal, PredictionReceiptModal } from "@/components/SharedPredictionModal"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Flame, Filter, ArrowRight, Plus } from "lucide-react"
import { useMarkets } from "@/hooks/useMarkets"
import { usePredictionModalContext } from "@/contexts/PredictionModalContext"
import { Layout } from "@/components/Layout"

const Index = () => {
  const { markets, isLoading, error, refetch } = useMarkets()
  const {
    isOpen,
    selectedMarket,
    selectedOutcome,
    receipt,
    showReceipt,
    closeModal,
    showPredictionReceipt,
    closeReceipt,
  } = usePredictionModalContext()

  console.log("[v0] Index: Modal state:", { isOpen, selectedMarket: selectedMarket?.question, selectedOutcome })

  return (
    <Layout>
      <div className="min-h-screen bg-background">
        {/* Market Slideshow */}
        {!isLoading && markets.length > 0 && (
          <section className="py-4 md:py-8 w-full">
            <div className="container mx-auto px-4 max-w-7xl">
              <MarketSlideshow markets={markets.slice(0, 4)} />
            </div>
          </section>
        )}

        {/* Main Markets Section */}
        <section className="py-8 md:py-16 w-full">
          <div className="container mx-auto px-4 max-w-7xl">
            <div className="flex flex-col sm:flex-row items-center justify-between mb-6 md:mb-8 gap-4">
              <div className="flex items-center gap-3">
                <Flame className="w-5 h-5 md:w-6 md:h-6 text-primary" />
                <h2 className="text-2xl md:text-3xl font-bold text-gradient-gold">Live Markets</h2>
              </div>
              <Button
                variant="outline"
                className="gap-2 w-full sm:w-auto transition-all duration-200 hover:scale-105 rounded-xl bg-transparent"
                onClick={() => {
                  // TODO: Implement filter functionality
                }}
              >
                <Filter className="w-4 h-4" />
                Filter
              </Button>
            </div>

            <Tabs defaultValue="all" className="mb-6 md:mb-8">
              <TabsList className="bg-muted/30 border border-border/50 w-full sm:w-auto overflow-x-auto">
                <TabsTrigger value="all" className="text-xs sm:text-sm">
                  All Markets
                </TabsTrigger>
                <TabsTrigger value="crypto" className="text-xs sm:text-sm">
                  Crypto
                </TabsTrigger>
                <TabsTrigger value="stocks" className="text-xs sm:text-sm">
                  Stocks
                </TabsTrigger>
                <TabsTrigger value="sports" className="text-xs sm:text-sm">
                  Sports
                </TabsTrigger>
                <TabsTrigger value="politics" className="text-xs sm:text-sm">
                  Politics
                </TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="mt-8">
                {isLoading ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                    {[...Array(6)].map((_, index) => (
                      <MarketCardSkeleton key={index} />
                    ))}
                  </div>
                ) : error ? (
                  <div className="text-center py-12">
                    <p className="text-destructive mb-4">{error}</p>
                    <Button onClick={refetch} className="rounded-xl">
                      Try Again
                    </Button>
                  </div>
                ) : markets.length === 0 ? (
                  <div className="text-center py-12">
                    <Plus className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-xl font-semibold mb-2">No markets yet</h3>
                    <p className="text-muted-foreground mb-6">Be the first to create a prediction market!</p>
                    <Button
                      className="btn-market-gold gap-2"
                      onClick={() => {
                        window.scrollTo({ top: 0, behavior: "smooth" })
                        setTimeout(() => {
                          alert(
                            'Please connect your wallet first using the "Connect Sui Wallet" button in the header to create markets',
                          )
                        }, 500)
                      }}
                    >
                      <Plus className="w-4 h-4" />
                      Connect Wallet to Create Market
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                    {markets.map((market, index) => (
                      <MarketCard
                        key={market.id}
                        market={market}
                        trending={index < 3 ? (index % 2 === 0 ? "up" : "down") : undefined}
                      />
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>

            {/* Load More */}
            {!isLoading && markets.length > 0 && (
              <div className="text-center mt-6 md:mt-8">
                <Button
                  size="lg"
                  className="btn-market-gold gap-2 w-full sm:w-auto transition-all duration-200 hover:scale-105"
                  onClick={() => {
                    // TODO: Implement load more functionality
                  }}
                >
                  Load More Markets
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
        </section>

        {/* Shared Prediction Modal */}
        <SharedPredictionModal
          isOpen={isOpen}
          onClose={closeModal}
          market={selectedMarket}
          outcome={selectedOutcome}
          onShowReceipt={showPredictionReceipt}
        />

        {/* Prediction Receipt Modal */}
        <PredictionReceiptModal isOpen={showReceipt} onClose={closeReceipt} receipt={receipt} />
      </div>
    </Layout>
  )
}

export default Index
