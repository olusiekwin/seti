"use client"

import { Layout } from "@/components/Layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { User, Settings, Bell, Shield, Copy, Check } from "lucide-react"
import { useCurrentWallet, useAccounts } from "@mysten/dapp-kit"
import { useState } from "react"

export default function Profile() {
  const { isConnected } = useCurrentWallet()
  const accounts = useAccounts()
  const currentAccount = accounts?.[0]
  const [copied, setCopied] = useState(false)

  const copyAddress = async () => {
    if (currentAccount?.address) {
      await navigator.clipboard.writeText(currentAccount.address)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (!isConnected) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 max-w-7xl">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gradient-gold mb-4">Profile</h1>
            <p className="text-muted-foreground mb-8">Connect your wallet to view your profile</p>
            <Button className="btn-market-gold">Connect Wallet</Button>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 md:py-12 max-w-5xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gradient-gold mb-2">Profile & Settings</h1>
          <p className="text-muted-foreground">Manage your account and preferences</p>
        </div>

        {/* Profile Tabs */}
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="bg-muted/30 border border-border/50 w-full sm:w-auto">
            <TabsTrigger value="profile" className="gap-2">
              <User className="w-4 h-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-2">
              <Settings className="w-4 h-4" />
              Settings
            </TabsTrigger>
            <TabsTrigger value="notifications" className="gap-2">
              <Bell className="w-4 h-4" />
              Notifications
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardHeader>
                <CardTitle>Wallet Information</CardTitle>
                <CardDescription>Your connected wallet details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="address">Wallet Address</Label>
                  <div className="flex gap-2">
                    <Input
                      id="address"
                      value={currentAccount?.address || ""}
                      readOnly
                      className="font-mono text-sm bg-muted/30"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={copyAddress}
                      className="flex-shrink-0 bg-transparent"
                    >
                      {copied ? <Check className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                  <div className="p-4 bg-muted/20 rounded-lg border border-border/20">
                    <div className="text-sm text-muted-foreground mb-1">Total Trades</div>
                    <div className="text-2xl font-bold">0</div>
                  </div>
                  <div className="p-4 bg-muted/20 rounded-lg border border-border/20">
                    <div className="text-sm text-muted-foreground mb-1">Markets Created</div>
                    <div className="text-2xl font-bold">0</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardHeader>
                <CardTitle>Profile Settings</CardTitle>
                <CardDescription>Customize your profile information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Username (Optional)</Label>
                  <Input id="username" placeholder="Enter username" className="bg-muted/30" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bio">Bio (Optional)</Label>
                  <Input id="bio" placeholder="Tell us about yourself" className="bg-muted/30" />
                </div>
                <Button className="bg-[hsl(208,65%,75%)] hover:bg-[hsl(208,65%,85%)] text-background transition-all duration-200 hover:scale-105">Save Changes</Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardHeader>
                <CardTitle>Preferences</CardTitle>
                <CardDescription>Manage your application preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-border/20">
                  <div>
                    <div className="font-medium">Dark Mode</div>
                    <div className="text-sm text-muted-foreground">Use dark theme</div>
                  </div>
                  <Button variant="outline" size="sm" className="hover:bg-[hsl(208,65%,75%)] hover:text-background border-[hsl(208,65%,75%)]">
                    Enabled
                  </Button>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-border/20">
                  <div>
                    <div className="font-medium">Auto-connect Wallet</div>
                    <div className="text-sm text-muted-foreground">Automatically connect on visit</div>
                  </div>
                  <Button variant="outline" size="sm">
                    Enabled
                  </Button>
                </div>
                <div className="flex items-center justify-between py-3">
                  <div>
                    <div className="font-medium">Show Prices in</div>
                    <div className="text-sm text-muted-foreground">Display currency preference</div>
                  </div>
                  <Button variant="outline" size="sm">
                    USD
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Security
                </CardTitle>
                <CardDescription>Manage your security settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-muted/20 rounded-lg border border-border/20">
                  <p className="text-sm text-muted-foreground">
                    Your wallet connection is secured by your wallet provider. Always verify transactions before
                    signing.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-6">
            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>Choose what updates you want to receive</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-border/20">
                  <div>
                    <div className="font-medium">Market Updates</div>
                    <div className="text-sm text-muted-foreground">Get notified about market changes</div>
                  </div>
                  <Button variant="outline" size="sm">
                    On
                  </Button>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-border/20">
                  <div>
                    <div className="font-medium">Position Alerts</div>
                    <div className="text-sm text-muted-foreground">Alerts for your active positions</div>
                  </div>
                  <Button variant="outline" size="sm">
                    On
                  </Button>
                </div>
                <div className="flex items-center justify-between py-3">
                  <div>
                    <div className="font-medium">Market Resolution</div>
                    <div className="text-sm text-muted-foreground">When markets you're in resolve</div>
                  </div>
                  <Button variant="outline" size="sm">
                    On
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  )
}
