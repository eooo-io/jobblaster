import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Upload, User, Camera, Key, Eye, EyeOff } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function Profile() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showApiKey, setShowApiKey] = useState(false);
  const [apiKey, setApiKey] = useState(user?.openaiApiKey || "");

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
    onSuccess: () => {
      toast({
        title: "Success!",
        description: "OpenAI API key updated successfully",
      });
      
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

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast({
          title: "Invalid File",
          description: "Please select an image file",
          variant: "destructive",
        });
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File Too Large",
          description: "Please select an image smaller than 5MB",
          variant: "destructive",
        });
        return;
      }
      
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
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Profile Settings</h1>
        <p className="text-slate-600 mt-2">Manage your account settings and profile information</p>
      </div>

      {/* Profile Picture Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Camera className="w-5 h-5" />
            <span>Profile Picture</span>
          </CardTitle>
          <CardDescription>
            Upload a profile picture to personalize your account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Current Profile Picture */}
          <div className="flex items-center space-x-4">
            <Avatar className="w-20 h-20">
              <AvatarImage src={user?.profilePicture || undefined} alt="Profile picture" />
              <AvatarFallback className="bg-gradient-to-br from-blue-600 to-indigo-600 text-white text-xl">
                {user?.username?.charAt(0).toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold text-slate-900">{user?.username}</h3>
              <p className="text-sm text-slate-600">
                {user?.profilePicture ? "Profile picture set" : "No profile picture"}
              </p>
            </div>
          </div>

          {/* File Upload */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="profilePicture">Choose new profile picture</Label>
              <Input
                id="profilePicture"
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="mt-1"
              />
              <p className="text-xs text-slate-500 mt-1">
                Supported formats: JPG, PNG, GIF. Maximum size: 5MB
              </p>
            </div>

            {selectedFile && (
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center space-x-2">
                  <Upload className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-900">
                    {selectedFile.name}
                  </span>
                  <span className="text-xs text-blue-600">
                    ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                  </span>
                </div>
                <Button
                  onClick={handleUpload}
                  disabled={uploadMutation.isPending}
                  size="sm"
                >
                  {uploadMutation.isPending ? "Uploading..." : "Upload"}
                </Button>
              </div>
            )}
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
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
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
            <p className="text-xs text-slate-500 mt-1">
              Your API key is stored securely and only used for your AI features. 
              Get your key from <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">OpenAI Platform</a>.
            </p>
            {user?.openaiApiKey && (
              <div className="flex items-center space-x-2 mt-2 p-2 bg-green-50 border border-green-200 rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-green-700">API key configured - AI features are enabled</span>
              </div>
            )}
            {!user?.openaiApiKey && (
              <div className="flex items-center space-x-2 mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <span className="text-sm text-yellow-700">No API key - AI features are disabled</span>
              </div>
            )}
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
  );
}