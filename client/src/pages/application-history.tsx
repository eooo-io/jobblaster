import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Sidebar } from "@/components/sidebar";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  History, 
  Download, 
  Package, 
  Calendar,
  Building2,
  FileText,
  Search,
  ExternalLink,
  Trash2
} from "lucide-react";
import { format } from "date-fns";
import type { Application, Resume, JobPosting, CoverLetter } from "@shared/schema";

interface ApplicationWithDetails extends Application {
  resume?: Resume;
  jobPosting?: JobPosting;
  coverLetter?: CoverLetter;
}

export default function ApplicationHistory() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch applications with details
  const { data: applications = [], isLoading, error } = useQuery<ApplicationWithDetails[]>({
    queryKey: ["/api/applications"],
  });

  // Export application package mutation
  const exportPackageMutation = useMutation({
    mutationFn: (applicationId: number) =>
      apiRequest(`/api/applications/${applicationId}/export`, {
        method: "POST",
      }),
    onSuccess: (data: any) => {
      // Create download link for the package
      const blob = new Blob([JSON.stringify(data.packageData, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `application-package-${data.jobTitle}-${data.company}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "Package Exported",
        description: "Your application package has been downloaded successfully!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Export Failed",
        description: error.message || "Failed to export application package",
        variant: "destructive",
      });
    },
  });

  // Delete application mutation
  const deleteApplicationMutation = useMutation({
    mutationFn: (applicationId: number) =>
      apiRequest(`/api/applications/${applicationId}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/applications"] });
      toast({
        title: "Application Deleted",
        description: "The application has been removed from your history.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Delete Failed",
        description: error.message || "Failed to delete application",
        variant: "destructive",
      });
    },
  });

  const handleExportPackage = (applicationId: number) => {
    exportPackageMutation.mutate(applicationId);
  };

  const handleDeleteApplication = (applicationId: number) => {
    if (confirm("Are you sure you want to delete this application? This action cannot be undone.")) {
      deleteApplicationMutation.mutate(applicationId);
    }
  };

  // Filter applications based on search term
  const filteredApplications = applications.filter((app) =>
    app.jobPosting?.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.jobPosting?.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "applied":
        return "bg-blue-500";
      case "interviewing":
        return "bg-yellow-500";
      case "offered":
        return "bg-green-500";
      case "rejected":
        return "bg-red-500";
      case "draft":
        return "bg-gray-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status.toLowerCase()) {
      case "applied":
        return "default";
      case "interviewing":
        return "secondary";
      case "offered":
        return "default";
      case "rejected":
        return "destructive";
      case "draft":
        return "outline";
      default:
        return "secondary";
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-gray-950">
        <Sidebar />
        <main className="flex-1 flex flex-col overflow-hidden lg:ml-0 pt-16 lg:pt-0">
          <div className="flex-1 flex items-center justify-center">
            <div className="text-lg text-gray-600 dark:text-gray-400">Loading applications...</div>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-gray-950">
        <Sidebar />
        <main className="flex-1 flex flex-col overflow-hidden lg:ml-0 pt-16 lg:pt-0">
          <div className="flex-1 flex items-center justify-center">
            <div className="text-lg text-red-600">Error loading applications</div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-gray-950">
      <Sidebar />
      <main className="flex-1 flex flex-col overflow-hidden lg:ml-0 pt-16 lg:pt-0">
        <div className="flex-1 overflow-y-auto p-6 max-w-6xl mx-auto w-full">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Application History
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Track your job applications and download complete application packages.
            </p>
          </div>

          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by job title, company, or status..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <FileText className="h-8 w-8 text-blue-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Applications</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{applications.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Calendar className="h-8 w-8 text-green-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Applied</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {applications.filter(app => app.status === "applied").length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Building2 className="h-8 w-8 text-yellow-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Interviewing</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {applications.filter(app => app.status === "interviewing").length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Package className="h-8 w-8 text-purple-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Packages</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {applications.filter(app => app.packageUrl).length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Applications List */}
          {filteredApplications.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <History className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No Applications Found
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {searchTerm 
                    ? "No applications match your search criteria." 
                    : "You haven't submitted any applications yet. Start by creating a resume and applying for jobs!"
                  }
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredApplications.map((application) => (
                <Card key={application.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                            {application.jobPosting?.title || "Unknown Position"}
                          </h3>
                          <Badge variant={getStatusVariant(application.status)}>
                            {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-3">
                          <div className="flex items-center gap-1">
                            <Building2 className="h-4 w-4" />
                            {application.jobPosting?.company || "Unknown Company"}
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            Applied: {application.appliedAt 
                              ? format(new Date(application.appliedAt), "MMM d, yyyy")
                              : "Draft"
                            }
                          </div>
                        </div>

                        <div className="flex items-center gap-4 text-sm">
                          {application.resume && (
                            <div className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
                              <FileText className="h-4 w-4" />
                              Resume: {application.resume.name}
                            </div>
                          )}
                          {application.coverLetter && (
                            <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                              <FileText className="h-4 w-4" />
                              Cover Letter
                            </div>
                          )}
                        </div>

                        {application.notes && (
                          <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
                            <p className="text-sm text-gray-700 dark:text-gray-300">{application.notes}</p>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2 ml-4">
                        <Button
                          onClick={() => handleExportPackage(application.id)}
                          disabled={exportPackageMutation.isPending}
                          size="sm"
                          variant="outline"
                        >
                          <Download className="h-4 w-4 mr-2" />
                          {exportPackageMutation.isPending ? "Exporting..." : "Export Package"}
                        </Button>

                        {application.packageUrl && (
                          <Button
                            onClick={() => window.open(application.packageUrl!, "_blank")}
                            size="sm"
                            variant="outline"
                          >
                            <ExternalLink className="h-4 w-4 mr-2" />
                            View Package
                          </Button>
                        )}

                        <Button
                          onClick={() => handleDeleteApplication(application.id)}
                          disabled={deleteApplicationMutation.isPending}
                          size="sm"
                          variant="destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}