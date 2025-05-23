import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { 
  Trash2, 
  Building2, 
  MapPin, 
  Clock, 
  Search,
  ChevronLeft,
  ChevronRight,
  ExternalLink
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { JobPosting } from "@shared/schema";
import Sidebar from "@/components/sidebar";

export default function ScrapedJobsPage() {
  const { toast } = useToast();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [companyFilter, setCompanyFilter] = useState("");

  // Fetch scraped jobs with pagination
  const { data: jobsData, isLoading } = useQuery({
    queryKey: ["/api/job-postings", currentPage, pageSize, searchTerm, companyFilter],
    queryFn: () => {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: pageSize.toString(),
        ...(searchTerm && { search: searchTerm }),
        ...(companyFilter && { company: companyFilter })
      });
      return fetch(`/api/job-postings?${params}`).then(res => res.json());
    }
  });

  const jobs = jobsData?.jobs || [];
  const totalJobs = jobsData?.total || 0;
  const totalPages = Math.ceil(totalJobs / pageSize);

  // Delete job mutation
  const deleteJobMutation = useMutation({
    mutationFn: (jobId: number) => apiRequest(`/api/job-postings/${jobId}`, "DELETE"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/job-postings"] });
      toast({
        title: "Job Deleted",
        description: "The scraped job has been successfully deleted.",
      });
    },
    onError: () => {
      toast({
        title: "Delete Failed",
        description: "Failed to delete the job. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleDeleteJob = (jobId: number) => {
    deleteJobMutation.mutate(jobId);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const truncateDescription = (description: string, maxLength: number = 200) => {
    if (description.length <= maxLength) return description;
    return description.substring(0, maxLength) + "...";
  };

  const getUniqueCompanies = () => {
    const companies = jobs.map((job: JobPosting) => job.company);
    return [...new Set(companies)].filter(Boolean).sort();
  };

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-gray-900">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-auto">
          <div className="p-8">
            <div className="max-w-7xl mx-auto">
              {/* Header */}
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                  Scraped Jobs
                </h1>
                <p className="mt-2 text-slate-600 dark:text-gray-400">
                  Manage all job listings collected from LinkedIn, Indeed, and other platforms
                </p>
              </div>

              {/* Filters and Controls */}
              <Card className="mb-6">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row gap-4 items-end">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-2">
                        Search Jobs
                      </label>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                          placeholder="Search by title, company, or keywords..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>
                    
                    <div className="min-w-[200px]">
                      <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-2">
                        Filter by Company
                      </label>
                      <Select value={companyFilter} onValueChange={setCompanyFilter}>
                        <SelectTrigger>
                          <SelectValue placeholder="All companies" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All companies</SelectItem>
                          {getUniqueCompanies().map((company) => (
                            <SelectItem key={company} value={company}>
                              {company}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="min-w-[120px]">
                      <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-2">
                        Page Size
                      </label>
                      <Select value={pageSize.toString()} onValueChange={(value) => setPageSize(Number(value))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="5">5 per page</SelectItem>
                          <SelectItem value="10">10 per page</SelectItem>
                          <SelectItem value="25">25 per page</SelectItem>
                          <SelectItem value="50">50 per page</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Results Summary */}
              <div className="mb-6 flex justify-between items-center">
                <p className="text-sm text-slate-600 dark:text-gray-400">
                  Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalJobs)} of {totalJobs} scraped jobs
                </p>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1 || isLoading}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>
                  <span className="text-sm text-slate-600 dark:text-gray-400">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages || isLoading}
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Job Listings */}
              {isLoading ? (
                <div className="space-y-4">
                  {[...Array(pageSize)].map((_, i) => (
                    <Card key={i} className="animate-pulse">
                      <CardContent className="p-6">
                        <div className="h-4 bg-slate-200 dark:bg-gray-700 rounded w-1/3 mb-2"></div>
                        <div className="h-3 bg-slate-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
                        <div className="h-3 bg-slate-200 dark:bg-gray-700 rounded w-full mb-2"></div>
                        <div className="h-3 bg-slate-200 dark:bg-gray-700 rounded w-3/4"></div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : jobs.length === 0 ? (
                <Card>
                  <CardContent className="p-12 text-center">
                    <Building2 className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
                      No scraped jobs found
                    </h3>
                    <p className="text-slate-600 dark:text-gray-400 mb-6">
                      {searchTerm || companyFilter 
                        ? "Try adjusting your search filters or clear them to see all jobs."
                        : "Your job scrapers haven't collected any listings yet. Run your search criteria to start collecting jobs."}
                    </p>
                    {(searchTerm || companyFilter) && (
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          setSearchTerm("");
                          setCompanyFilter("");
                        }}
                      >
                        Clear Filters
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {jobs.map((job: JobPosting) => (
                    <Card key={job.id} className="hover:shadow-md transition-shadow">
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <CardTitle className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                              {job.title}
                            </CardTitle>
                            <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-gray-400">
                              <div className="flex items-center gap-1">
                                <Building2 className="h-4 w-4" />
                                <span>{job.company}</span>
                              </div>
                              {job.location && (
                                <div className="flex items-center gap-1">
                                  <MapPin className="h-4 w-4" />
                                  <span>{job.location}</span>
                                </div>
                              )}
                              <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                <span>{formatDate(job.createdAt!)}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {job.employmentType && (
                              <Badge variant="secondary">
                                {job.employmentType}
                              </Badge>
                            )}
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Scraped Job</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete "{job.title}" at {job.company}? 
                                    This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDeleteJob(job.id)}
                                    className="bg-red-600 hover:bg-red-700"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <p className="text-slate-600 dark:text-gray-400 mb-4">
                          {truncateDescription(job.description)}
                        </p>
                        
                        {/* Tech Stack */}
                        {job.techStack && job.techStack.length > 0 && (
                          <div className="mb-3">
                            <h4 className="text-sm font-medium text-slate-700 dark:text-gray-300 mb-2">
                              Required Technologies:
                            </h4>
                            <div className="flex flex-wrap gap-1">
                              {job.techStack.slice(0, 8).map((tech, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {tech}
                                </Badge>
                              ))}
                              {job.techStack.length > 8 && (
                                <Badge variant="outline" className="text-xs">
                                  +{job.techStack.length - 8} more
                                </Badge>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Experience Level */}
                        {job.experienceYears && (
                          <div className="mb-3">
                            <span className="text-sm font-medium text-slate-700 dark:text-gray-300">
                              Experience: 
                            </span>
                            <span className="text-sm text-slate-600 dark:text-gray-400 ml-2">
                              {job.experienceYears}
                            </span>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {/* Bottom Pagination */}
              {totalPages > 1 && (
                <div className="mt-8 flex justify-center">
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1 || isLoading}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </Button>
                    
                    {/* Page Numbers */}
                    {[...Array(Math.min(5, totalPages))].map((_, i) => {
                      const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                      if (pageNum > totalPages) return null;
                      
                      return (
                        <Button
                          key={pageNum}
                          variant={currentPage === pageNum ? "default" : "outline"}
                          size="sm"
                          onClick={() => setCurrentPage(pageNum)}
                          disabled={isLoading}
                        >
                          {pageNum}
                        </Button>
                      );
                    })}
                    
                    <Button
                      variant="outline"
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages || isLoading}
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}