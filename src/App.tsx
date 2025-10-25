import { Toaster } from "@/components/ui/toaster"
import { Toaster as Sonner } from "@/components/ui/sonner"
import { TooltipProvider } from "@/components/ui/tooltip"
import { BrowserRouter, Routes, Route } from "react-router-dom"
import { PredictionModalProvider } from "@/contexts/PredictionModalContext"
import { NotificationProvider } from "@/contexts/NotificationContext"
import Index from "./pages/Index"
import NotFound from "./pages/NotFound"
import Dashboard from "./pages/Dashboard"
import Activity from "./pages/Activity"
import Profile from "./pages/Profile"
import Notifications from "./pages/Notifications"
import PredictionDetails from "./pages/PredictionDetails"
import { SimpleChainlinkApp } from "./components/SimpleChainlinkApp"
import { DemoNotifications } from "./components/DemoNotifications"

const App = () => {
  return (
    <TooltipProvider>
      <PredictionModalProvider>
        <NotificationProvider>
          <DemoNotifications />
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
            <Route path="/prediction/:id" element={<PredictionDetails />} />
            <Route path="/chainlink" element={<SimpleChainlinkApp />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
        </NotificationProvider>
      </PredictionModalProvider>
    </TooltipProvider>
  )
}

export default App