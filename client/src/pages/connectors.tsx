import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CheckCircle, XCircle, Zap, Globe, Brain, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ErrorModal } from "@/components/error-modal";
import Sidebar from "@/components/sidebar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

interface ConnectorSettings {
  // OpenAI
  openaiApiKey?: string;
  
  // Adzuna
  adzunaAppId?: string;
  adzunaApiKey?: string;
  
  // Anthropic (future)
  anthropicApiKey?: string;
  
  // xAI (future)
  xaiApiKey?: string;
}

interface TestResult {
  success: boolean;
  error?: string;
}

export default function Connectors() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [settings, setSettings] = useState<ConnectorSettings>({});
  const [testResults, setTestResults] = useState<Record<string, TestResult>>({});
  const [errorModal, setErrorModal] = useState<{ isOpen: boolean; error: any }>({
    isOpen: false,
    error: null,
  });

  // Fetch user profile for current settings
  const { data: user } = useQuery({
    queryKey: ["/api/user"],
  });

  // Update settings when user data loads
  useEffect(() => {
    if (user) {
      setSettings({
        openaiApiKey: user.openaiApiKey || "",
        adzunaAppId: user.adzunaAppId || "",
        adzunaApiKey: user.adzunaApiKey || "",
        anthropicApiKey: user.anthropicApiKey || "",
        xaiApiKey: user.xaiApiKey || "",
      });
      
      // Set connection status based on existing credentials
      const results: Record<string, TestResult> = {};
      if (user.openaiApiKey) results.openai = { success: true };
      if (user.adzunaAppId && user.adzunaApiKey) results.adzuna = { success: true };
      if (user.anthropicApiKey) results.anthropic = { success: true };
      if (user.xaiApiKey) results.xai = { success: true };
      setTestResults(results);
    }
  }, [user]);

  const saveSettings = useMutation({
    mutationFn: async (data: ConnectorSettings) => {
      const response = await fetch("/api/user", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to save settings: ${errorText}`);
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Settings saved",
        description: "Your connector settings have been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error saving settings",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const testConnection = async (provider: string) => {
    try {
      let endpoint = "";
      let payload = {};

      switch (provider) {
        case "openai":
          endpoint = "/api/test-openai";
          payload = { apiKey: settings.openaiApiKey };
          break;
        case "adzuna":
          endpoint = "/api/test-adzuna";
          payload = { 
            appId: settings.adzunaAppId, 
            apiKey: settings.adzunaApiKey 
          };
          break;
        case "anthropic":
          endpoint = "/api/test-anthropic";
          payload = { apiKey: settings.anthropicApiKey };
          break;
        case "xai":
          endpoint = "/api/test-xai";
          payload = { apiKey: settings.xaiApiKey };
          break;
      }

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (response.ok) {
        setTestResults(prev => ({
          ...prev,
          [provider]: { success: true }
        }));
        toast({
          title: "Connection successful",
          description: `${provider.charAt(0).toUpperCase() + provider.slice(1)} API is working correctly.`,
        });
      } else {
        setTestResults(prev => ({
          ...prev,
          [provider]: { success: false, error: result.message || "Connection failed" }
        }));
        setErrorModal({ isOpen: true, error: result });
      }
    } catch (error: any) {
      setTestResults(prev => ({
        ...prev,
        [provider]: { success: false, error: error.message }
      }));
      toast({
        title: "Connection failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleSave = () => {
    saveSettings.mutate(settings);
  };

  const handleInputChange = (field: keyof ConnectorSettings, value: string) => {
    setSettings(prev => ({ ...prev, [field]: value }));
    // Clear test result when input changes
    const provider = field.replace(/ApiKey|AppId/, '').toLowerCase();
    setTestResults(prev => {
      const updated = { ...prev };
      delete updated[provider];
      return updated;
    });
  };

  const getConnectionStatus = (provider: string) => {
    const result = testResults[provider];
    if (!result) return null;
    
    return result.success ? (
      <div className="flex items-center space-x-2 text-green-600">
        <CheckCircle className="w-4 h-4" />
        <span className="text-sm font-medium">Connected</span>
      </div>
    ) : (
      <div className="flex items-center space-x-2 text-red-600">
        <XCircle className="w-4 h-4" />
        <span className="text-sm font-medium">Not Connected</span>
      </div>
    );
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-gray-950">
      <Sidebar />
      
      <main className="flex-1 flex flex-col overflow-hidden lg:ml-0 pt-16 lg:pt-0">
        <div className="flex-1 overflow-y-auto p-6 max-w-4xl mx-auto w-full">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              API Connectors
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Configure your API connections for AI services and job search platforms.
            </p>
          </div>

      <div className="space-y-6">
        {/* AI Providers Section */}
        <div>
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center">
            <Brain className="w-5 h-5 mr-2" />
            AI Providers
          </h2>
          
          <div className="grid gap-4 md:grid-cols-2">
            {/* OpenAI */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                      <span className="text-white text-sm font-bold">AI</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        OpenAI
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        GPT-4o for job analysis
                      </p>
                    </div>
                  </div>
                  {getConnectionStatus("openai")}
                </div>

                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="openai-key">API Key</Label>
                    <Input
                      id="openai-key"
                      type="password"
                      value={settings.openaiApiKey || ""}
                      onChange={(e) => handleInputChange("openaiApiKey", e.target.value)}
                      placeholder="sk-..."
                    />
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => testConnection("openai")}
                    disabled={!settings.openaiApiKey}
                    className="w-full"
                  >
                    Test Connection
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Anthropic */}
            <Card className="opacity-60">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center">
                      <span className="text-white text-sm font-bold">A</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        Anthropic
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Claude for advanced analysis
                      </p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    Coming Soon
                  </Badge>
                </div>

                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="anthropic-key">API Key</Label>
                    <Input
                      id="anthropic-key"
                      type="password"
                      value=""
                      disabled
                      placeholder="Coming soon..."
                    />
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled
                    className="w-full"
                  >
                    Test Connection
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* xAI */}
            <Card className="opacity-60">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
                      <span className="text-white text-sm font-bold">X</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        xAI
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Grok for real-time insights
                      </p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    Coming Soon
                  </Badge>
                </div>

                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="xai-key">API Key</Label>
                    <Input
                      id="xai-key"
                      type="password"
                      value=""
                      disabled
                      placeholder="Coming soon..."
                    />
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled
                    className="w-full"
                  >
                    Test Connection
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Job Search Platforms Section */}
        <div>
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center">
            <Globe className="w-5 h-5 mr-2" />
            Job Search Platforms
          </h2>
          
          <div className="grid gap-4 md:grid-cols-2">
            {/* Adzuna */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                      <span className="text-white text-sm font-bold">Az</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        Adzuna
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Job search and analysis
                      </p>
                    </div>
                  </div>
                  {getConnectionStatus("adzuna")}
                </div>

                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="adzuna-app-id">App ID</Label>
                    <Input
                      id="adzuna-app-id"
                      value={settings.adzunaAppId || ""}
                      onChange={(e) => handleInputChange("adzunaAppId", e.target.value)}
                      placeholder="Your Adzuna App ID"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="adzuna-api-key">API Key</Label>
                    <Input
                      id="adzuna-api-key"
                      type="password"
                      value={settings.adzunaApiKey || ""}
                      onChange={(e) => handleInputChange("adzunaApiKey", e.target.value)}
                      placeholder="Your Adzuna API Key"
                    />
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => testConnection("adzuna")}
                    disabled={!settings.adzunaAppId || !settings.adzunaApiKey}
                    className="w-full"
                  >
                    Test Connection
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Future platforms */}
            <Card className="opacity-60">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gray-600 rounded-lg flex items-center justify-center">
                      <span className="text-white text-sm font-bold">+</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        More Platforms
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Indeed, Glassdoor, LinkedIn
                      </p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    Coming Soon
                  </Badge>
                </div>
                <div className="text-center py-4">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Additional job platforms will be available soon
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-6 border-t border-slate-200 dark:border-gray-700">
          <Button
            size="lg"
            className="bg-blue-600 hover:bg-blue-700"
            onClick={handleSave}
            disabled={saveSettings.isPending}
          >
            {saveSettings.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Settings"
            )}
          </Button>
        </div>
      </div>

          <ErrorModal
            isOpen={errorModal.isOpen}
            onClose={() => setErrorModal({ isOpen: false, error: null })}
            error={errorModal.error}
          />
        </div>
      </main>
    </div>
  );
}