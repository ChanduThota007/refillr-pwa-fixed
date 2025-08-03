import { useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";

import { Dashboard } from "./pages/Dashboard";
import { AddItem } from "./pages/AddItem";
import { EditRefill } from "./pages/EditRefill";
import { Settings } from "./pages/Settings";
import { Analytics } from "./pages/Analytics";
import NotFound from "./pages/NotFound";

import { useRefillrStore } from "@/store/useRefillrStore";
import { useToast } from "@/components/ui/use-toast";
import { usePwaInstall } from "@/hooks/usePwaInstall";

const queryClient = new QueryClient();

const App = () => {
  const performDailySubtraction = useRefillrStore((state) => state.performDailySubtraction);
  const { toast } = useToast();
  const { canInstall, promptInstall } = usePwaInstall();

  useEffect(() => {
    performDailySubtraction();
  }, [performDailySubtraction]);

  const handleInstall = async () => {
    const accepted = await promptInstall();
    toast({
      title: accepted ? "✅ Installed!" : "❌ Installation Cancelled",
      description: accepted
        ? "ReFillr was added to your device"
        : "User dismissed the installation prompt",
    });
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/add" element={<AddItem />} />
            <Route path="/edit" element={<EditRefill />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>

        {canInstall && (
          <button
            onClick={handleInstall}
            className="fixed bottom-4 right-4 z-50 px-4 py-2 bg-emerald-600 text-white rounded-xl shadow-lg hover:bg-emerald-700 transition"
          >
            Install ReFillr
          </button>
        )}
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
