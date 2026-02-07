import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Landing from "./pages/Landing";
import SignalSubmission from "./pages/SignalSubmission";
import Dashboard from "./pages/Dashboard";
import OpportunityDetail from "./pages/OpportunityDetail";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/report" element={<SignalSubmission />} />
          <Route path="/opportunities" element={<Dashboard />} />
          <Route path="/opportunity/:id" element={<OpportunityDetail />} />
          {/* Legacy route redirects */}
          <Route path="/submit" element={<Navigate to="/report" replace />} />
          <Route path="/dashboard" element={<Navigate to="/opportunities" replace />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
