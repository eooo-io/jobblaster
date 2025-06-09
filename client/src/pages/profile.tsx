import { ErrorModal } from "@/components/error-modal";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Upload, User } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "wouter";

export default function Profile() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showApiKey, setShowApiKey] = useState(false);
  const [apiKey, setApiKey] = useState(user?.openaiApiKey || "");
  const [adzunaAppId, setAdzunaAppId] = useState(user?.adzunaAppId || "");
  const [adzunaApiKey, setAdzunaApiKey] = useState(user?.adzunaApiKey || "");
  const [dateOfBirth, setDateOfBirth] = useState<string>(user?.dateOfBirth ?? "");

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

  // Get resumes
  const { data: resumes } = useQuery({
    queryKey: ["resumes"],
    queryFn: async () => {
      const response = await fetch("/api/resumes");
      if (!response.ok) throw new Error("Failed to fetch resumes");
      return response.json();
    },
  });

  // Upload mutation
  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("profilePicture", file);

      const response = await fetch("/api/upload-profile-picture", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Failed to upload profile picture");
      return response.json();
    },
    onSuccess: (data) => {
      // Update user query cache
      queryClient.setQueryData(["/api/auth/user"], (oldData: any) => ({
        ...oldData,
        profilePicture: data.profilePicture,
      }));

      toast({
        title: "Success",
        description: "Profile picture updated successfully",
      });

      // Clear selected file
      setSelectedFile(null);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to upload profile picture",
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

  const updateProfileMutation = useMutation({
    mutationFn: async (data: { dateOfBirth?: string }) => {
      const response = await fetch("/api/update-profile", {
        method: "POST",
        body: JSON.stringify(data),
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update profile");
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Date of birth updated successfully",
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
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center space-x-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-white"
            >
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
          <p className="text-slate-600 dark:text-gray-300 mt-2">
            Manage your account settings and profile information
          </p>
        </div>

        {/* Account Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="w-5 h-5" />
              <span>Account Information</span>
            </CardTitle>
            <CardDescription>Your basic account details</CardDescription>
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

        {/* Profile Section */}
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>Update your profile information</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Profile Picture */}
              <div className="flex items-center space-x-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={user?.profilePicture} />
                  <AvatarFallback>
                    <User className="h-10 w-10" />
                  </AvatarFallback>
                </Avatar>
                <div>
                  <Label htmlFor="picture" className="mb-2 block">
                    Profile Picture
                  </Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      id="picture"
                      type="file"
                      onChange={handleFileSelect}
                      accept="image/*"
                      className="max-w-xs"
                    />
                    <Button
                      onClick={handleUpload}
                      disabled={!selectedFile || uploadMutation.isPending}
                      size="sm"
                    >
                      {uploadMutation.isPending ? (
                        "Uploading..."
                      ) : (
                        <>
                          <Upload className="h-4 w-4 mr-2" />
                          Upload
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Date of Birth */}
              <div className="space-y-2">
                <Label htmlFor="dateOfBirth">Date of Birth</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                  />
                  <Button
                    onClick={() => updateProfileMutation.mutate({ dateOfBirth })}
                    disabled={updateProfileMutation.isPending}
                    size="sm"
                  >
                    Save
                  </Button>
                </div>
              </div>
            </div>
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
