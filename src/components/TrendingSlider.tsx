import { TrendingUp, Clock, Users, BarChart3 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

// Mock data for trending markets
const mockTrendingMarkets = [
  {
    id: '1',
    question: 'Will Bitcoin reach $100,000 by end of 2024?',
    category: 'Crypto',
    volume: '$2.4M',
    price: '68%',
    timeLeft: '2d 14h',
    trending: 'up'
  },
  {
    id: '2', 
    question: 'Will the Lakers win the NBA Championship?',
    category: 'Sports',
    volume: '$1.8M',
    price: '45%',
    timeLeft: '5d 8h',
    trending: 'up'
  },
  {
    id: '3',
    question: 'Will AI replace 50% of jobs by 2030?',
    category: 'Technology',
    volume: '$1.2M',
    price: '72%',
    timeLeft: '12d 6h',
    trending: 'down'
  }
]

export function TrendingSlider() {
  return (
    <div className="w-full">
      {/* Trending Markets Sidebar */}
      <div className="bg-background/80 backdrop-blur-md border border-border/20 rounded-xl shadow-lg">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border/20">
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Trending Markets
          </h2>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {mockTrendingMarkets.map((market, index) => (
            <Card key={market.id} className="bg-background/30 border-border/40 hover:border-primary/30 transition-colors">
              <CardContent className="p-3">
                {/* Market Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold">
                      {index + 1}
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      #{index + 1} Trending
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                    <TrendingUp className="w-3 h-3" />
                    <span className="text-xs font-medium">Hot</span>
                  </div>
                </div>

                {/* Market Question */}
                <h3 className="text-sm font-semibold text-card-foreground mb-2 line-clamp-2 leading-tight">
                  {market.question}
                </h3>

                {/* Market Info */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Category</span>
                    <Badge variant="outline" className="text-xs">
                      {market.category}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Volume</span>
                    <span className="font-semibold text-card-foreground">{market.volume}</span>
                  </div>
                  
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Price</span>
                    <span className="font-semibold text-card-foreground">{market.price}</span>
                  </div>
                  
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-muted-foreground" />
                      <span className="text-muted-foreground">Ends</span>
                    </div>
                    <span className="font-semibold text-card-foreground">{market.timeLeft}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 mt-3">
                  <button className="flex-1 h-8 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold rounded-lg transition-all duration-300 text-xs">
                    YES {market.price}
                  </button>
                  <button className="flex-1 h-8 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold rounded-lg transition-all duration-300 text-xs">
                    NO {100 - parseInt(market.price)}%
                  </button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}