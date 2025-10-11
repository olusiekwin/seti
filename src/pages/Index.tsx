"use client"
import { useState, useEffect } from "react"
import { MarketCard } from "@/components/MarketCard"
import { MarketCardSkeleton } from "@/components/MarketCardSkeleton"
import { MarketSlideshow } from "@/components/MarketSlideshow"
import { SharedPredictionModal, PredictionReceiptModal } from "@/components/SharedPredictionModal"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowRight, Plus } from "lucide-react"
import { useMarkets } from "@/hooks/useMarkets"
import { usePredictionModalContext } from "@/contexts/PredictionModalContext"
import { Layout } from "@/components/Layout"

const Index = () => {
  const { markets, isLoading, error, refetch } = useMarkets()
  const [searchQuery, setSearchQuery] = useState("")
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

  // Listen for search events from the header
  useEffect(() => {
    const handleSearch = (event: Event) => {
      const searchEvent = event as CustomEvent<{ query: string }>;
      setSearchQuery(searchEvent.detail.query);
    };

    window.addEventListener('marketSearch', handleSearch);
    return () => window.removeEventListener('marketSearch', handleSearch);
  }, []);

  const [activeTab, setActiveTab] = useState("all");

  // Filter markets based on search query and active tab
  const filteredMarkets = markets.filter(market => {
    // First filter by search query
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      if (!(
        market.question.toLowerCase().includes(searchLower) ||
        market.description?.toLowerCase().includes(searchLower) ||
        market.category.toLowerCase().includes(searchLower) ||
        market.tags?.some(tag => tag.toLowerCase().includes(searchLower))
      )) {
        return false;
      }
    }

    // Then filter by category tab
    if (activeTab === "all") return true;
    return market.category.toLowerCase() === activeTab.toLowerCase();
  });

  return (
    <Layout>
      <div className="min-h-screen bg-background">
        {/* Main Markets Section */}
        <section className="py-4 w-full">
          <div className="container mx-auto px-4 max-w-7xl">
            <Tabs defaultValue="all" className="w-full mb-6 md:mb-8" onValueChange={setActiveTab}>
              <TabsList className="w-full bg-muted/30 border border-border/50 flex h-9">
                <div className="flex items-center border-r border-border/20">
                  <TabsTrigger value="trending" className="text-sm text-muted-foreground data-[state=active]:text-[hsl(208,65%,85%)] h-full px-3 transition-colors">
                    Trending
                  </TabsTrigger>
                  <TabsTrigger value="breaking" className="text-sm text-muted-foreground data-[state=active]:text-[hsl(208,65%,85%)] h-full px-3 transition-colors">
                    Breaking
                  </TabsTrigger>
                  <TabsTrigger value="new" className="text-sm text-muted-foreground data-[state=active]:text-[hsl(208,65%,85%)] h-full px-3 transition-colors">
                    New
                  </TabsTrigger>
                </div>

                <div className="text-white/20 flex items-center px-4">|</div>

                <div className="flex flex-1">
                  <TabsTrigger value="all" className="flex-1 text-sm text-muted-foreground data-[state=active]:text-[hsl(208,65%,85%)] h-full px-2 transition-colors">
                    All Markets
                  </TabsTrigger>
                  <TabsTrigger value="crypto" className="flex-1 text-sm text-muted-foreground data-[state=active]:text-[hsl(208,65%,85%)] h-full px-2 transition-colors">
                    Crypto
                  </TabsTrigger>
                  <TabsTrigger value="stocks" className="flex-1 text-sm text-muted-foreground data-[state=active]:text-[hsl(208,65%,85%)] h-full px-2 transition-colors">
                    Stocks
                  </TabsTrigger>
                  <TabsTrigger value="sports" className="flex-1 text-sm text-muted-foreground data-[state=active]:text-[hsl(208,65%,85%)] h-full px-2 transition-colors">
                    Sports
                  </TabsTrigger>
                  <TabsTrigger value="politics" className="flex-1 text-sm text-muted-foreground data-[state=active]:text-[hsl(208,65%,85%)] h-full px-2 transition-colors">
                    Politics
                  </TabsTrigger>
                </div>
              </TabsList>

              <TabsContent value="trending" className="mt-8">
                {isLoading ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                    {[...Array(8)].map((_, index) => (
                      <MarketCardSkeleton key={index} />
                    ))}
                  </div>
                ) : error ? (
                  <div className="text-center py-12">
                    <p className="text-destructive mb-4">{error}</p>
                    <Button onClick={refetch} className="rounded-xl bg-[hsl(208,65%,75%)] hover:bg-[hsl(208,65%,85%)] text-background">
                      Try Again
                    </Button>
                  </div>
                ) : filteredMarkets.length === 0 ? (
                  <div className="text-center py-12">
                    <h3 className="text-xl font-semibold mb-2">No trending markets</h3>
                    <p className="text-muted-foreground">Check back later for trending markets</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                    {filteredMarkets.map((market, index) => (
                      <MarketCard
                        key={market.id}
                        market={market}
                        trending="up"
                      />
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="breaking" className="mt-8">
                {isLoading ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                    {[...Array(8)].map((_, index) => (
                      <MarketCardSkeleton key={index} />
                    ))}
                  </div>
                ) : error ? (
                  <div className="text-center py-12">
                    <p className="text-destructive mb-4">{error}</p>
                    <Button onClick={refetch} className="rounded-xl bg-[hsl(208,65%,75%)] hover:bg-[hsl(208,65%,85%)] text-background">
                      Try Again
                    </Button>
                  </div>
                ) : filteredMarkets.length === 0 ? (
                  <div className="text-center py-12">
                    <h3 className="text-xl font-semibold mb-2">No breaking markets</h3>
                    <p className="text-muted-foreground">Check back later for breaking markets</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                    {filteredMarkets.map((market, index) => (
                      <MarketCard
                        key={market.id}
                        market={market}
                      />
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="new" className="mt-8">
                {isLoading ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                    {[...Array(8)].map((_, index) => (
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
                ) : filteredMarkets.length === 0 ? (
                  <div className="text-center py-12">
                    <h3 className="text-xl font-semibold mb-2">No new markets</h3>
                    <p className="text-muted-foreground">Check back later for new markets</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                    {filteredMarkets.map((market, index) => (
                      <MarketCard
                        key={market.id}
                        market={market}
                      />
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="all" className="mt-8">
                {isLoading ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                    {[...Array(8)].map((_, index) => (
                      <MarketCardSkeleton key={index} />
                    ))}
                  </div>
                ) : error ? (
                  <div className="text-center py-12">
                    <p className="text-destructive mb-4">{error}</p>
                    <Button onClick={refetch} className="rounded-xl bg-[hsl(208,65%,75%)] hover:bg-[hsl(208,65%,85%)] text-background">
                      Try Again
                    </Button>
                  </div>
                ) : markets.length === 0 || (searchQuery && filteredMarkets.length === 0) ? (
                  <div className="text-center py-12">
                    <Plus className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-xl font-semibold mb-2">No markets yet</h3>
                    <p className="text-muted-foreground mb-6">Be the first to create a prediction market!</p>
                    <Button
                      className="bg-[hsl(208,65%,75%)] hover:bg-[hsl(208,65%,85%)] text-background gap-2"
                      onClick={() => {
                        window.scrollTo({ top: 0, behavior: "smooth" })
                        setTimeout(() => {
                          alert(
                            'Please connect your wallet first using the "Connect Wallet" button in the header to create markets',
                          )
                        }, 500)
                      }}
                    >
                      <Plus className="w-4 h-4" />
                      Connect Wallet to Create Market
                    </Button>
                  </div>
                ) : (
                  <div>
                    {filteredMarkets.length === 0 ? (
                      <div className="text-center py-12">
                        <h3 className="text-xl font-semibold mb-2">No markets found</h3>
                        <p className="text-muted-foreground">Try adjusting your search terms</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                        {filteredMarkets.map((market, index) => (
                          <MarketCard
                            key={market.id}
                            market={market}
                            trending={index < 3 ? (index % 2 === 0 ? "up" : "down") : undefined}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </TabsContent>
            </Tabs>

            {/* Load More */}
            {!isLoading && markets.length > 0 && (
              <div className="text-center mt-6 md:mt-8">
                <Button
                  size="lg"
                  className="gap-2 w-full sm:w-auto transition-all duration-200 hover:scale-105 bg-[hsl(208,65%,75%)] hover:bg-[hsl(208,65%,85%)] text-background"
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
