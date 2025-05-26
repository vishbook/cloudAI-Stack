import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Sidebar } from "@/components/layout/sidebar";
import Dashboard from "@/pages/dashboard";
import Infrastructure from "@/pages/infrastructure";
import LiveInfrastructure from "@/pages/live-infrastructure";
import AIMonitoring from "@/pages/ai-monitoring";
import Analytics from "@/pages/analytics";
import Alerts from "@/pages/alerts";
import UserManagement from "@/pages/user-management";
import Settings from "@/pages/settings";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/infrastructure" component={Infrastructure} />
      <Route path="/ai-monitoring" component={AIMonitoring} />
      <Route path="/analytics" component={Analytics} />
      <Route path="/alerts" component={Alerts} />
      <Route path="/users" component={UserManagement} />
      <Route path="/settings" component={Settings} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="flex h-screen overflow-hidden bg-background">
          <Sidebar />
          <Router />
        </div>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
