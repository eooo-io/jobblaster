import { QueryClientProvider } from "@tanstack/react-query";
import { Route, Switch, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";

import { TooltipProvider } from "@/components/ui/tooltip";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { useAuth } from "@/hooks/useAuth";
import ApplicationHistory from "@/pages/application-history";
import Applications from "@/pages/applications";
import AssignedTemplates from "@/pages/assigned-templates";
import Connectors from "@/pages/connectors";
import CoverLetters from "@/pages/cover-letters";
import Dashboard from "@/pages/dashboard";
import ExternalLogs from "@/pages/external-logs";
import Login from "@/pages/login";
import NotFound from "@/pages/not-found";
import Profile from "@/pages/profile";
import Templates from "@/pages/templates";

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
    return (
      <Login
        onLoginSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
          setLocation("/");
        }}
      />
    );
  }

  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/profile" component={Profile} />
      <Route path="/connectors" component={Connectors} />
      <Route path="/templates" component={Templates} />
      <Route path="/assigned-templates" component={AssignedTemplates} />
      <Route path="/external-logs" component={ExternalLogs} />
      <Route path="/cover-letters" component={CoverLetters} />
      <Route path="/application-history" component={ApplicationHistory} />
      <Route path="/applications" component={Applications} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <Router />
          </TooltipProvider>
        </QueryClientProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;
