import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Home from "@/pages/home";
import TrafficMonitor from "@/pages/traffic-monitor";
import AnomalyDetection from "@/pages/anomaly-detection";
import AlertsPage from "@/pages/alerts";
import ThreatPatternsPage from "@/pages/threat-patterns";
import MLModelsPage from "@/pages/ml-models";
import ConfigPage from "@/pages/config";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/traffic" component={TrafficMonitor} />
      <Route path="/anomaly" component={AnomalyDetection} />
      <Route path="/alerts" component={AlertsPage} />
      <Route path="/threat-patterns" component={ThreatPatternsPage} />
      <Route path="/ml-models" component={MLModelsPage} />
      <Route path="/config" component={ConfigPage} />
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
