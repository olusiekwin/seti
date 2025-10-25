"use client"
import { useState, useEffect } from "react"
import { MarketCard } from "@/components/MarketCard"
import { MarketCardSkeleton } from "@/components/MarketCardSkeleton"
import { SharedPredictionModal, PredictionReceiptModal } from "@/components/SharedPredictionModal"
import { ErrorBoundary } from "@/components/ErrorBoundary"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowRight, Plus, TrendingUp, Search, Filter, Bookmark } from "lucide-react"
import { useMarkets } from "@/hooks/useMarkets"
import { usePredictionModalContext } from "@/contexts/PredictionModalContext"
import { useFavorites } from "@/hooks/useFavorites"
import { useWalletConnection } from "@/hooks/useWalletConnection"
import { Layout } from "@/components/Layout"

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("all");
  const [sortBy, setSortBy] = useState("created_timestamp");
  const [showFilter, setShowFilter] = useState(false);
  const [showSaved, setShowSaved] = useState(false);
  
  const { isConnected } = useWalletConnection()
  
  // Use backend filtering instead of frontend filtering
  const { markets, isLoading, error, refetch } = useMarkets({
    category: activeTab === "all" ? undefined : activeTab,
    sort_by: sortBy as 'volume_24h' | 'total_liquidity' | 'created_timestamp',
    search: searchQuery || undefined,
    status: 'active'
  })
  
  const { favorites, isFavorite } = useFavorites()
  
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

  // Filter markets based on saved state
  const filteredMarkets = showSaved 
    ? markets.filter(market => isFavorite(market.id))
    : markets;

  return (
    <Layout>
      <div className="min-h-screen bg-background overflow-x-hidden">
        {/* Main Markets Section */}
        <section className="py-4 w-full overflow-x-hidden">
          <div className="container mx-auto px-2 sm:px-4 max-w-7xl">
            <Tabs value={activeTab} className="w-full mb-4 sm:mb-6 md:mb-8" onValueChange={setActiveTab}>
              {/* Seti Topic Navigation */}
              <TabsList className="w-full bg-muted/30 border border-border/50 flex flex-nowrap overflow-x-auto scrollbar-hide h-9 md:h-10 mb-4">
                <div className="flex flex-nowrap overflow-x-auto scrollbar-hide w-full">
                  <TabsTrigger value="all" className="text-xs sm:text-sm text-muted-foreground data-[state=active]:text-[hsl(208,65%,85%)] h-full px-4 md:px-6 whitespace-nowrap transition-colors flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    All Topics
                  </TabsTrigger>
                  {Array.from(new Set(markets.map(market => market.category).filter(Boolean))).map(category => (
                    <TabsTrigger 
                      key={category} 
                      value={category.toLowerCase()} 
                      className="text-xs sm:text-sm text-muted-foreground data-[state=active]:text-[hsl(208,65%,85%)] h-full px-4 md:px-6 whitespace-nowrap transition-colors capitalize"
                    >
                      {category}
                    </TabsTrigger>
                  ))}
                </div>
              </TabsList>

              {/* Seti Search & Filter Bar */}
              <div className="w-full bg-muted/30 border border-border/50 flex flex-nowrap overflow-x-auto scrollbar-hide h-9 md:h-10 mb-4">
                <div className="flex flex-nowrap overflow-x-auto scrollbar-hide w-full items-center">
                  <div className="relative flex items-center px-3">
                    <Search className="w-4 h-4 text-muted-foreground mr-2" />
                    <input 
                      type="text" 
                      placeholder="Search Seti markets..." 
                      value={searchQuery}
                      className="bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        const searchEvent = new CustomEvent('marketSearch', {
                          detail: { query: e.target.value.toLowerCase() }
                        });
                        window.dispatchEvent(searchEvent);
                      }}
                    />
                  </div>
                  <div className="flex items-center text-muted-foreground px-2">|</div>
                  <button 
                    className={`flex items-center px-3 transition-colors ${
                      showFilter 
                        ? 'text-[hsl(208,65%,75%)] bg-[hsl(208,65%,75%)]/10' 
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                    onClick={() => setShowFilter(!showFilter)}
                  >
                    <Filter className="w-4 h-4 mr-1" />
                    Filter
                  </button>
                  <button 
                    className={`flex items-center px-3 transition-colors ${
                      showSaved 
                        ? 'text-[hsl(208,65%,75%)] bg-[hsl(208,65%,75%)]/10' 
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                    onClick={() => setShowSaved(!showSaved)}
                  >
                    <Bookmark className="w-4 h-4 mr-1" />
                    Saved {showSaved && `(${filteredMarkets.length})`}
                  </button>
                  <div className="flex items-center text-muted-foreground px-2">|</div>
                  <button className="bg-[hsl(208,65%,75%)] text-background px-3 py-1 rounded-md text-sm font-medium">
                    Active
                  </button>
                  <div className="flex items-center gap-2 px-3 overflow-x-auto scrollbar-hide">
                    <span className="text-xs text-muted-foreground">
                      {markets.length} markets
                    </span>
                    <ArrowRight className="w-3 h-3 text-muted-foreground" />
                  </div>
                </div>
              </div>

              {/* Filter Dropdown */}
              {showFilter && (
                <div className="bg-muted/30 border border-border/50 rounded-lg p-4 mb-4">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <label className="text-sm font-medium">Sort by:</label>
                      <select 
                        value={sortBy} 
                        onChange={(e) => setSortBy(e.target.value)}
                        className="bg-background border border-border rounded px-2 py-1 text-sm"
                      >
                        <option value="created_timestamp">Newest</option>
                        <option value="volume_24h">Volume</option>
                        <option value="total_liquidity">Liquidity</option>
                      </select>
                    </div>
                    <div className="flex items-center gap-2">
                      <label className="text-sm font-medium">Status:</label>
                      <select 
                        className="bg-background border border-border rounded px-2 py-1 text-sm"
                        defaultValue="active"
                      >
                        <option value="active">Active</option>
                        <option value="resolved">Resolved</option>
                      </select>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setShowFilter(false)}
                    >
                      Close
                    </Button>
                  </div>
                </div>
              )}

              {/* Sorting Controls */}
              <div className="flex items-center justify-between mt-4 mb-6">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Sort by:</span>
                  <select 
                    value={sortBy} 
                    onChange={(e) => setSortBy(e.target.value)}
                    className="bg-muted/30 border border-border/50 rounded-md px-3 py-1 text-sm text-foreground"
                  >
                    <option value="created_timestamp">Newest</option>
                    <option value="volume_24h">Volume</option>
                    <option value="total_liquidity">Liquidity</option>
                  </select>
                </div>
                <div className="text-sm text-muted-foreground">
                  {filteredMarkets.length} markets
                </div>
              </div>





              <TabsContent value={activeTab} className="mt-8">
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
                        if (!isConnected) {
                          window.scrollTo({ top: 0, behavior: "smooth" })
                          setTimeout(() => {
                            alert(
                              'Please connect your wallet first using the "Connect Wallet" button in the header to create markets',
                            )
                          }, 500)
                        } else {
                          // Wallet is connected, allow creating market
                          window.scrollTo({ top: 0, behavior: "smooth" })
                          // You can add logic here to open a create market modal or navigate to create market page
                          alert('Wallet is connected! You can now create markets.')
                        }
                      }}
                    >
                      <Plus className="w-4 h-4" />
                      {isConnected ? 'Create Market' : 'Connect Wallet to Create Market'}
                    </Button>
                  </div>
                ) : (
                  <div>
                    {showSaved && (
                      <div className="mb-4 p-3 bg-[hsl(208,65%,75%)]/10 border border-[hsl(208,65%,75%)]/20 rounded-lg">
                        <p className="text-sm text-[hsl(208,65%,75%)]">
                          📌 Showing {filteredMarkets.length} saved market{filteredMarkets.length !== 1 ? 's' : ''}
                        </p>
                      </div>
                    )}
                    {filteredMarkets.length === 0 ? (
                      <div className="text-center py-12">
                        <h3 className="text-xl font-semibold mb-2">
                          {showSaved ? 'No saved markets' : 'No markets found'}
                        </h3>
                        <p className="text-muted-foreground">
                          {showSaved 
                            ? 'Save some markets by clicking the bookmark icon on market cards' 
                            : 'Try adjusting your search terms'
                          }
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                        {filteredMarkets.map((market, index) => (
                          <ErrorBoundary key={market.id}>
                            <MarketCard
                              market={market}
                              trending={index < 3 ? (index % 2 === 0 ? "up" : "down") : undefined}
                            />
                          </ErrorBoundary>
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
                    refetch();
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
