import { Toaster } from "@/components/ui/toaster"
import { Toaster as Sonner } from "@/components/ui/sonner"
import { TooltipProvider } from "@/components/ui/tooltip"
import { BrowserRouter, Routes, Route } from "react-router-dom"
import { PredictionModalProvider } from "@/contexts/PredictionModalContext"
import { MarketSidebarProvider } from "@/contexts/MarketSidebarContext"
import { NotificationProvider } from "@/contexts/NotificationContext"
import { ConfirmationProvider } from "@/contexts/ConfirmationContext"
import Index from "./pages/Index"
import NotFound from "./pages/NotFound"
import Dashboard from "./pages/Dashboard"
import Activity from "./pages/Activity"
import Profile from "./pages/Profile"
import Notifications from "./pages/Notifications"
import PredictionDetails from "./pages/PredictionDetails"
import Drafts from "./pages/Drafts"
import { SimpleChainlinkApp } from "./components/SimpleChainlinkApp"

const App = () => {
  return (
    <TooltipProvider>
      <PredictionModalProvider>
        <MarketSidebarProvider>
          <NotificationProvider>
            <ConfirmationProvider>
          <Toaster />
          <Sonner />
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
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/drafts" element={<Drafts />} />
            <Route path="/prediction/:id" element={<PredictionDetails />} />
            <Route path="/chainlink" element={<SimpleChainlinkApp />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
          </ConfirmationProvider>
        </NotificationProvider>
        </MarketSidebarProvider>
      </PredictionModalProvider>
    </TooltipProvider>
  )
}

export default App