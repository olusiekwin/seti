import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { RefreshCw, Clock, Trophy, Users, TrendingUp, TrendingDown, X } from 'lucide-react'
import { useLiveSports } from '@/hooks/useLiveSports'

interface LiveSportsSidebarProps {
  isOpen: boolean
  onClose: () => void
  className?: string
}

export function LiveSportsSidebar({ isOpen, onClose, className = "" }: LiveSportsSidebarProps) {
  const { scores, loading, error, lastUpdated, refresh, getLiveScores, getUpcomingScores } = useLiveSports({
    autoRefresh: true,
    refreshInterval: 15000 // Refresh every 15 seconds for live updates
  })

  const [activeTab, setActiveTab] = useState<'live' | 'upcoming'>('live')

  const liveScores = getLiveScores()
  const upcomingScores = getUpcomingScores()

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'live':
        return 'bg-red-500 text-white animate-pulse'
      case 'finished':
        return 'bg-green-500 text-white'
      case 'upcoming':
        return 'bg-blue-500 text-white'
      default:
        return 'bg-gray-500 text-white'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'live':
        return <Clock className="w-3 h-3" />
      case 'finished':
        return <Trophy className="w-3 h-3" />
      case 'upcoming':
        return <Users className="w-3 h-3" />
      default:
        return null
    }
  }

  const formatTime = (time: string) => {
    // Format time display for better readability
    if (time.includes('Q')) return time // Basketball quarters
    if (time.includes('\'')) return time // Soccer minutes
    if (time.includes('PM') || time.includes('AM')) return time // Scheduled time
    return time
  }

  if (!isOpen) return null

  return (
    <div className={`fixed inset-y-0 right-0 w-80 bg-background border-l border-border shadow-xl z-50 flex flex-col ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-500" />
          <CardTitle className="text-lg">Live Sports</CardTitle>
        </div>
        <div className="flex items-center gap-2">
          {lastUpdated && (
            <span className="text-xs text-muted-foreground">
              {lastUpdated.toLocaleTimeString()}
            </span>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={refresh}
            disabled={loading}
            className="h-8 w-8 p-0"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border">
        <button
          className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === 'live'
              ? 'bg-primary text-primary-foreground border-b-2 border-primary'
              : 'text-muted-foreground hover:text-foreground'
          }`}
          onClick={() => setActiveTab('live')}
        >
          <div className="flex items-center justify-center gap-2">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            Live ({liveScores.length})
          </div>
        </button>
        <button
          className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === 'upcoming'
              ? 'bg-primary text-primary-foreground border-b-2 border-primary'
              : 'text-muted-foreground hover:text-foreground'
          }`}
          onClick={() => setActiveTab('upcoming')}
        >
          <div className="flex items-center justify-center gap-2">
            <Clock className="w-4 h-4" />
            Upcoming ({upcomingScores.length})
          </div>
        </button>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1 p-4">
        {error ? (
          <div className="text-center py-8">
            <div className="text-red-500 mb-4">
              <Trophy className="w-12 h-12 mx-auto mb-2" />
              <p className="text-sm">{error}</p>
            </div>
            <Button variant="outline" size="sm" onClick={refresh}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry
            </Button>
          </div>
        ) : loading ? (
          <div className="text-center py-8">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">Loading live scores...</p>
          </div>
        ) : (
          <div className="space-y-3">
            {(activeTab === 'live' ? liveScores : upcomingScores).map((score) => (
              <Card key={score.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  {/* League and Status */}
                  <div className="flex items-center justify-between mb-3">
                    <Badge variant="secondary" className="text-xs">
                      {score.league}
                    </Badge>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(score.status)}
                      <Badge className={`text-xs ${getStatusColor(score.status)}`}>
                        {score.status.toUpperCase()}
                      </Badge>
                    </div>
                  </div>

                  {/* Teams and Scores */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span className="text-sm font-medium">{score.homeTeam}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold">{score.homeScore}</span>
                        {score.status === 'live' && (
                          <TrendingUp className="w-3 h-3 text-green-500" />
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        <span className="text-sm font-medium">{score.awayTeam}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold">{score.awayScore}</span>
                        {score.status === 'live' && (
                          <TrendingDown className="w-3 h-3 text-red-500" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Time/Period */}
                  <div className="mt-3 pt-2 border-t border-border/50">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{score.period || 'Time'}</span>
                      <span className="font-semibold">{formatTime(score.time)}</span>
                    </div>
                  </div>

                  {/* Live indicator for live matches */}
                  {score.status === 'live' && (
                    <div className="mt-2 flex items-center gap-1 text-xs text-red-500">
                      <div className="w-1 h-1 bg-red-500 rounded-full animate-pulse"></div>
                      <span>LIVE</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}

            {(activeTab === 'live' ? liveScores : upcomingScores).length === 0 && (
              <div className="text-center py-8">
                <Trophy className="w-12 h-12 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">
                  No {activeTab} matches available
                </p>
              </div>
            )}
          </div>
        )}
      </ScrollArea>

      {/* Footer */}
      <div className="p-4 border-t border-border bg-muted/20">
        <div className="text-xs text-muted-foreground text-center">
          Updates every 15 seconds
        </div>
      </div>
    </div>
  )
}


