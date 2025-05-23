import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Upload, User, Camera, Key, Eye, EyeOff, ArrowLeft, Search } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import ErrorModal from "@/components/error-modal";

export default function Profile() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showApiKey, setShowApiKey] = useState(false);
  const [apiKey, setApiKey] = useState(user?.openaiApiKey || "");
  const [adzunaAppId, setAdzunaAppId] = useState(user?.adzunaAppId || "");
  const [adzunaApiKey, setAdzunaApiKey] = useState(user?.adzunaApiKey || "");
  
  // Error modal state
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [adzunaConnected, setAdzunaConnected] = useState(false);
  const [openaiConnected, setOpenaiConnected] = useState(false);

  // Initialize connection status when user data loads
  useEffect(() => {
    if (user?.adzunaAppId && user?.adzunaApiKey) {
      setAdzunaConnected(true);
    } else {
      setAdzunaConnected(false);
    }
    
    if (user?.openaiApiKey) {
      setOpenaiConnected(true);
    } else {
      setOpenaiConnected(false);
    }
  }, [user]);

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("profilePicture", file);
      
      const response = await fetch("/api/upload-profile-picture", {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to upload profile picture");
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Success!",
        description: "Profile picture updated successfully",
      });
      
      // Refresh user data
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      setSelectedFile(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Upload Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateApiKeyMutation = useMutation({
    mutationFn: async (newApiKey: string) => {
      const response = await fetch("/api/update-profile", {
        method: "POST",
        body: JSON.stringify({ openaiApiKey: newApiKey }),
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update API key");
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      // Set connected status when API key is saved successfully
      setOpenaiConnected(true);
      
      // Handle API test results
      if (data.openaiTest) {
        if (data.openaiTest.success) {
          toast({
            title: "Success!",
            description: "OpenAI API key saved and verified successfully",
          });
        } else {
          setApiError(data.openaiTest.error);
          setShowErrorModal(true);
          toast({
            title: "API Key Saved", 
            description: "API key saved but verification failed. Check error details.",
            variant: "destructive",
          });
        }
      } else {
        toast({
          title: "Success!",
          description: "OpenAI API key updated successfully",
        });
      }
      
      // Refresh user data
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateAdzunaMutation = useMutation({
    mutationFn: async ({ appId, apiKey }: { appId: string; apiKey: string }) => {
      const response = await fetch("/api/update-profile", {
        method: "POST",
        body: JSON.stringify({ adzunaAppId: appId, adzunaApiKey: apiKey }),
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update Adzuna credentials");
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      // Always set connected when credentials are saved successfully
      setAdzunaConnected(true);
      
      // Handle API test results
      if (data.adzunaTest) {
        if (data.adzunaTest.success) {
          toast({
            title: "Success!",
            description: "Adzuna credentials saved and tested successfully",
          });
        } else {
          setApiError(data.adzunaTest.error);
          setShowErrorModal(true);
          toast({
            title: "Credentials Saved", 
            description: "Credentials saved but API test failed. Check error details.",
            variant: "destructive",
          });
        }
      } else {
        toast({
          title: "Success!",
          description: "Adzuna credentials saved successfully",
        });
      }
      
      // Force refresh user data
      queryClient.removeQueries({ queryKey: ["/api/auth/user"] });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Save Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleUpload = () => {
    if (selectedFile) {
      uploadMutation.mutate(selectedFile);
    }
  };

  const handleApiKeyUpdate = () => {
    if (apiKey.trim()) {
      updateApiKeyMutation.mutate(apiKey.trim());
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Navigation Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="max-w-2xl mx-auto">
          <Link href="/">
            <Button variant="ghost" size="sm" className="flex items-center space-x-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-white">
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Dashboard</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Profile Settings</h1>
          <p className="text-slate-600 dark:text-gray-300 mt-2">Manage your account settings and profile information</p>
        </div>

        {/* Profile Picture Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Camera className="w-5 h-5" />
              <span>Profile Picture</span>
            </CardTitle>
            <CardDescription>
              Upload and manage your profile picture
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-4">
              <Avatar className="w-20 h-20">
                <AvatarImage src={user?.profilePicture || ""} alt={user?.username || "Profile"} />
                <AvatarFallback className="text-xl">
                  {user?.username?.charAt(0).toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="profile-picture-input"
                />
                <label htmlFor="profile-picture-input">
                  <Button variant="outline" size="sm" className="cursor-pointer" asChild>
                    <span className="flex items-center space-x-2">
                      <Upload className="w-4 h-4" />
                      <span>Choose Photo</span>
                    </span>
                  </Button>
                </label>
                
                {selectedFile && (
                  <div className="mt-2 flex items-center space-x-2">
                    <span className="text-sm text-slate-600 dark:text-gray-300">{selectedFile.name}</span>
                    <Button
                      size="sm"
                      onClick={handleUpload}
                      disabled={uploadMutation.isPending}
                    >
                      {uploadMutation.isPending ? "Uploading..." : "Upload"}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* OpenAI API Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Key className="w-5 h-5" />
              <span>AI Integration</span>
            </CardTitle>
            <CardDescription>
              Configure your OpenAI API key for AI-powered resume optimization and job matching
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="apiKey">OpenAI API Key</Label>
              <div className="flex space-x-2 mt-1">
                <div className="relative flex-1">
                  <Input
                    id="apiKey"
                    type={showApiKey ? "text" : "password"}
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="sk-..."
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:text-gray-400 dark:hover:text-gray-300"
                  >
                    {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <Button
                  onClick={handleApiKeyUpdate}
                  disabled={updateApiKeyMutation.isPending || !apiKey.trim()}
                >
                  {updateApiKeyMutation.isPending ? "Saving..." : "Save"}
                </Button>
              </div>
              <p className="text-xs text-slate-500 dark:text-gray-400 mt-1">
                Your API key is stored securely and only used for your AI features. 
                Get your key from <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">OpenAI Platform</a>.
              </p>
              {openaiConnected && (
                <div className="flex items-center space-x-2 mt-2 p-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-green-700 dark:text-green-400">API key configured - AI features are enabled</span>
                </div>
              )}
              {!openaiConnected && (
                <div className="flex items-center space-x-2 mt-2 p-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <span className="text-sm text-yellow-700 dark:text-yellow-400">No API key - AI features are disabled</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Job Connector Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Search className="w-5 h-5" />
              <span>Job Search Connectors</span>
            </CardTitle>
            <CardDescription>
              Configure API credentials for automatic job searching across multiple platforms
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Adzuna Configuration */}
            <div className="border border-gray-200 rounded-lg p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">Adzuna</h4>
                  <p className="text-sm text-gray-600">Global job search engine aggregating positions from hundreds of job boards</p>
                </div>
                {adzunaConnected && (
                  <div className="flex items-center space-x-2 px-3 py-1 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-full">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-xs text-green-700 dark:text-green-300 font-medium">Connected</span>
                  </div>
                )}
                {!adzunaConnected && (
                  <div className="flex items-center space-x-2 px-3 py-1 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-full">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <span className="text-xs text-yellow-700 dark:text-yellow-400 font-medium">Not Connected</span>
                  </div>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="adzunaAppId">App ID</Label>
                  <Input
                    id="adzunaAppId"
                    type="text"
                    value={adzunaAppId}
                    onChange={(e) => setAdzunaAppId(e.target.value)}
                    placeholder="Your Adzuna App ID"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="adzunaApiKey">API Key</Label>
                  <Input
                    id="adzunaApiKey"
                    type="password"
                    value={adzunaApiKey}
                    onChange={(e) => setAdzunaApiKey(e.target.value)}
                    placeholder="Your Adzuna API Key"
                    className="mt-1"
                  />
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <p className="text-xs text-gray-500">
                  Get your credentials from <a href="https://developer.adzuna.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Adzuna Developer Portal</a>
                </p>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => updateAdzunaMutation.mutate({ appId: adzunaAppId, apiKey: adzunaApiKey })}
                  disabled={updateAdzunaMutation.isPending || !adzunaAppId.trim() || !adzunaApiKey.trim()}
                >
                  {updateAdzunaMutation.isPending ? "Saving..." : "Save Credentials"}
                </Button>
              </div>
            </div>

            {/* Future Connectors Preview */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-gray-700">Additional Connectors (Coming Soon)</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  { name: "Indeed", status: "Partner API Required" },
                  { name: "Glassdoor", status: "API Discontinued" },
                  { name: "Greenhouse", status: "Partner Access" },
                  { name: "ZipRecruiter", status: "Partner API Required" }
                ].map((connector) => (
                  <div key={connector.name} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg bg-gray-50">
                    <span className="text-sm font-medium text-gray-600">{connector.name}</span>
                    <span className="text-xs text-gray-500 px-2 py-1 bg-gray-100 rounded-full">{connector.status}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Account Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="w-5 h-5" />
              <span>Account Information</span>
            </CardTitle>
            <CardDescription>
              Your basic account details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Username</Label>
                <Input value={user?.username || ""} disabled className="mt-1" />
              </div>
              <div>
                <Label>Email</Label>
                <Input 
                  value={user?.email || "Not set"} 
                  disabled 
                  className="mt-1"
                  placeholder="Email not configured"
                />
              </div>
            </div>
            <p className="text-xs text-slate-500">
              Contact your administrator to update account information
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* Error Modal */}
      <ErrorModal
        isOpen={showErrorModal}
        onClose={() => setShowErrorModal(false)}
        title="Adzuna API Connection Failed"
        error={apiError}
      />
    </div>
  );
}