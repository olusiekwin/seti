import { Toaster } from "@/components/ui/toaster"
import { Toaster as Sonner } from "@/components/ui/sonner"
import { TooltipProvider } from "@/components/ui/tooltip"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { BrowserRouter, Routes, Route } from "react-router-dom"
import { SuiClientProvider, WalletProvider } from "@mysten/dapp-kit"
import { getFullnodeUrl } from "@mysten/sui/client"
import Index from "./pages/Index"
import NotFound from "./pages/NotFound"
import Dashboard from "./pages/Dashboard"
import Activity from "./pages/Activity"
import Profile from "./pages/Profile"
import PredictionDetails from "./pages/PredictionDetails"
import { PredictionModalProvider } from "./contexts/PredictionModalContext"
import { PredictionSettlement } from "./components/PredictionSettlement"

const queryClient = new QueryClient()

const App = () => (
  <QueryClientProvider client={queryClient}>
    <SuiClientProvider
      networks={{
        devnet: { url: getFullnodeUrl("devnet") },
        testnet: { url: getFullnodeUrl("testnet") },
        mainnet: { url: getFullnodeUrl("mainnet") },
      }}
      defaultNetwork={(import.meta as any).env?.VITE_SUI_NETWORK || "testnet"}
    >
      <WalletProvider>
        <PredictionModalProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <PredictionSettlement />
            <BrowserRouter
              future={{
                v7_startTransition: true,
                v7_relativeSplatPath: true,
              }}
            >
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/activity" element={<Activity />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/prediction/:id" element={<PredictionDetails />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </PredictionModalProvider>
      </WalletProvider>
    </SuiClientProvider>
  </QueryClientProvider>
)

export default App
