import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import { ThemeProvider } from "@/contexts/ThemeContext";
import Dashboard from "@/pages/dashboard";
import Login from "@/pages/login";
import Profile from "@/pages/profile";
import Connectors from "@/pages/connectors";
import Templates from "@/pages/templates";
import AssignedTemplates from "@/pages/assigned-templates";
import SearchCriteria from "@/pages/search-criteria";
import ScrapedJobs from "@/pages/scraped-jobs";
import ExternalLogs from "@/pages/external-logs";
import NotFound from "@/pages/not-found";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-gray-300">Loading JobBlaster...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login onLoginSuccess={() => {
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
      setLocation('/');
    }} />;
  }

  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/profile" component={Profile} />
      <Route path="/connectors" component={Connectors} />
      <Route path="/search-criteria" component={SearchCriteria} />
      <Route path="/scraped-jobs" component={ScrapedJobs} />
      <Route path="/templates" component={Templates} />
      <Route path="/assigned-templates" component={AssignedTemplates} />
      <Route path="/external-logs" component={ExternalLogs} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
