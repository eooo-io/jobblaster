import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardBody, CardHeader, Typography, Button, Progress, Chip, IconButton } from "@material-tailwind/react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, Target, Building2, MapPin, Calendar, DollarSign, Users, ExternalLink } from "lucide-react";
import Sidebar from "../components/sidebar";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface ScrapedJob {
  id: number;
  userId: number;
  criteriaId: number;
  source: string;
  title: string;
  company: string;
  location: string | null;
  description: string | null;
  url: string | null;
  salary: string | null;
  employmentType: string | null;
  experienceLevel: string | null;
  postedDate: string | null;
  matchScore: number | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Resume {
  id: number;
  name: string;
  content: any;
  isDefault: boolean;
}

// Circular progress component for match scores
function MatchScoreCircle({ score }: { score: number | null }) {
  if (score === null) {
    return (
      <div className="w-16 h-16 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-full">
        <span className="text-xs text-gray-500 dark:text-gray-400">No Score</span>
      </div>
    );
  }

  const circumference = 2 * Math.PI * 20;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    if (score >= 40) return "text-orange-600";
    return "text-red-600";
  };

  const getStrokeColor = (score: number) => {
    if (score >= 80) return "stroke-green-600";
    if (score >= 60) return "stroke-yellow-600";
    if (score >= 40) return "stroke-orange-600";
    return "stroke-red-600";
  };

  return (
    <div className="relative w-16 h-16">
      <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 44 44">
        <circle
          cx="22"
          cy="22"
          r="20"
          stroke="currentColor"
          strokeWidth="3"
          fill="transparent"
          className="text-gray-200 dark:text-gray-700"
        />
        <circle
          cx="22"
          cy="22"
          r="20"
          stroke="currentColor"
          strokeWidth="3"
          fill="transparent"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          className={getStrokeColor(score)}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className={`text-sm font-bold ${getScoreColor(score)}`}>
          {score}%
        </span>
      </div>
    </div>
  );
}

export default function ScrapedJobsPage() {
  const [selectedCompany, setSelectedCompany] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [selectedResume, setSelectedResume] = useState<number | null>(null);
  const [scoringJobId, setScoringJobId] = useState<number | null>(null);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch scraped jobs
  const { data: jobs = [], isLoading, error } = useQuery({
    queryKey: ["/api/scraped-jobs", currentPage, pageSize],
    retry: false,
  });

  // Fetch resumes for scoring
  const { data: resumes = [] } = useQuery<Resume[]>({
    queryKey: ["/api/resumes"],
    retry: false,
  });

  // Delete job mutation
  const deleteJobMutation = useMutation({
    mutationFn: (jobId: number) => apiRequest(`/api/scraped-jobs/${jobId}`, {
      method: "DELETE",
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/scraped-jobs"] });
      toast({
        title: "Job deleted successfully",
        description: "The job has been removed from your scraped jobs list.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete job. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Score job mutation
  const scoreJobMutation = useMutation({
    mutationFn: ({ jobId, resumeId }: { jobId: number; resumeId: number }) =>
      apiRequest(`/api/score-job/${jobId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeId }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/scraped-jobs"] });
      setScoringJobId(null);
      toast({
        title: "Job scored successfully",
        description: "The job has been analyzed and scored against your resume.",
      });
    },
    onError: (error: any) => {
      setScoringJobId(null);
      toast({
        title: "Scoring failed",
        description: error.message || "Failed to score job. Please check your OpenAI API key.",
        variant: "destructive",
      });
    },
  });

  // Run scraping session mutation
  const scrapeJobsMutation = useMutation({
    mutationFn: () => apiRequest("/api/scrape-jobs", { method: "POST" }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/scraped-jobs"] });
      toast({
        title: "Job scraping completed",
        description: `Found ${data.totalJobsFound} jobs, imported ${data.jobsImported} new positions.`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Scraping failed",
        description: error.message || "Failed to scrape jobs. Please check your search criteria.",
        variant: "destructive",
      });
    },
  });

  // Get unique companies for filtering
  const companies = Array.from(new Set(jobs.map((job: ScrapedJob) => job.company))).sort();

  // Filter jobs by company
  const filteredJobs = selectedCompany === "all" 
    ? jobs 
    : jobs.filter((job: ScrapedJob) => job.company === selectedCompany);

  const handleDeleteJob = (jobId: number) => {
    if (confirm("Are you sure you want to delete this job?")) {
      deleteJobMutation.mutate(jobId);
    }
  };

  const handleScoreJob = (jobId: number) => {
    if (!selectedResume) {
      toast({
        title: "No resume selected",
        description: "Please select a resume to score against this job.",
        variant: "destructive",
      });
      return;
    }
    setScoringJobId(jobId);
    scoreJobMutation.mutate({ jobId, resumeId: selectedResume });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getSourceIcon = (source: string) => {
    switch (source.toLowerCase()) {
      case 'linkedin':
        return '💼';
      case 'indeed':
        return '🔍';
      case 'adzuna':
        return '📊';
      default:
        return '🌐';
    }
  };

  if (error) {
    return (
      <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
        <Sidebar />
        <div className="flex-1 p-8">
          <div className="text-center">
            <Typography variant="h4" color="red" className="mb-4">
              Error Loading Jobs
            </Typography>
            <Typography>Failed to load scraped jobs. Please try again.</Typography>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      <div className="flex-1 overflow-auto">
        <div className="p-6">
          {/* Header */}
          <div className="mb-6">
            <Typography variant="h4" className="text-gray-900 dark:text-white mb-2">
              Scraped Jobs
            </Typography>
            <Typography variant="small" className="text-gray-600 dark:text-gray-400">
              Manage and score automatically collected job opportunities
            </Typography>
          </div>

          {/* Controls */}
          <div className="mb-6 flex flex-wrap gap-4 items-center">
            <Button
              onClick={() => scrapeJobsMutation.mutate()}
              disabled={scrapeJobsMutation.isPending}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {scrapeJobsMutation.isPending ? "Scraping..." : "Run Job Scraper"}
            </Button>

            <div className="flex items-center gap-2">
              <Typography variant="small" className="text-gray-700 dark:text-gray-300">
                Filter by Company:
              </Typography>
              <Select value={selectedCompany} onValueChange={(value) => setSelectedCompany(value || "all")}>
                <SelectTrigger className="min-w-[200px]">
                  <SelectValue placeholder="Select company" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Companies</SelectItem>
                  {companies.map((company) => (
                    <SelectItem key={company} value={company}>
                      {company}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <Typography variant="small" className="text-gray-700 dark:text-gray-300">
                Resume for Scoring:
              </Typography>
              <Select
                value={selectedResume?.toString() || ""}
                onChange={(value) => setSelectedResume(value ? parseInt(value) : null)}
                className="min-w-[200px]"
              >
                <SelectItem value="">Select Resume</SelectItem>
                {resumes.map((resume) => (
                  <SelectItem key={resume.id} value={resume.id.toString()}>
                    {resume.name} {resume.isDefault && "(Default)"}
                  </SelectItem>
                ))}
              </Select>
            </div>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="text-center py-8">
              <Typography>Loading scraped jobs...</Typography>
            </div>
          )}

          {/* Empty State */}
          {!isLoading && filteredJobs.length === 0 && (
            <Card className="text-center py-12">
              <CardBody>
                <Typography variant="h5" className="mb-4 text-gray-600 dark:text-gray-400">
                  No jobs found
                </Typography>
                <Typography className="mb-6 text-gray-500 dark:text-gray-500">
                  {jobs.length === 0 
                    ? "Run the job scraper to start collecting opportunities"
                    : "No jobs match the selected company filter"
                  }
                </Typography>
                {jobs.length === 0 && (
                  <Button
                    onClick={() => scrapeJobsMutation.mutate()}
                    disabled={scrapeJobsMutation.isPending}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {scrapeJobsMutation.isPending ? "Scraping..." : "Run Job Scraper"}
                  </Button>
                )}
              </CardBody>
            </Card>
          )}

          {/* Jobs Grid */}
          {!isLoading && filteredJobs.length > 0 && (
            <div className="grid gap-6">
              {filteredJobs.map((job: ScrapedJob) => (
                <Card key={job.id} className="border border-gray-200 dark:border-gray-700">
                  <CardBody className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Typography variant="h6" className="text-gray-900 dark:text-white">
                            {job.title}
                          </Typography>
                          <Chip
                            value={`${getSourceIcon(job.source)} ${job.source}`}
                            size="sm"
                            className="bg-blue-50 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                          />
                        </div>
                        
                        <div className="flex items-center gap-2 mb-3">
                          <Building2 className="w-4 h-4 text-gray-500" />
                          <Typography className="text-gray-700 dark:text-gray-300">
                            {job.company}
                          </Typography>
                          {job.location && (
                            <>
                              <MapPin className="w-4 h-4 text-gray-500 ml-4" />
                              <Typography className="text-gray-600 dark:text-gray-400">
                                {job.location}
                              </Typography>
                            </>
                          )}
                        </div>

                        <div className="flex flex-wrap gap-4 mb-4">
                          {job.salary && (
                            <div className="flex items-center gap-1">
                              <DollarSign className="w-4 h-4 text-gray-500" />
                              <Typography variant="small" className="text-gray-600 dark:text-gray-400">
                                {job.salary}
                              </Typography>
                            </div>
                          )}
                          {job.employmentType && (
                            <div className="flex items-center gap-1">
                              <Users className="w-4 h-4 text-gray-500" />
                              <Typography variant="small" className="text-gray-600 dark:text-gray-400">
                                {job.employmentType}
                              </Typography>
                            </div>
                          )}
                          {job.postedDate && (
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4 text-gray-500" />
                              <Typography variant="small" className="text-gray-600 dark:text-gray-400">
                                Posted {formatDate(job.postedDate)}
                              </Typography>
                            </div>
                          )}
                        </div>

                        {job.description && (
                          <Typography 
                            variant="small" 
                            className="text-gray-600 dark:text-gray-400 line-clamp-3 mb-4"
                          >
                            {job.description.substring(0, 300)}
                            {job.description.length > 300 && "..."}
                          </Typography>
                        )}
                      </div>

                      <div className="flex items-center gap-4 ml-6">
                        {/* Match Score */}
                        <div className="text-center">
                          <MatchScoreCircle score={job.matchScore} />
                          <Typography variant="small" className="text-gray-500 dark:text-gray-400 mt-1">
                            Match Score
                          </Typography>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleScoreJob(job.id)}
                            disabled={!selectedResume || scoringJobId === job.id}
                            className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
                          >
                            <Target className="w-4 h-4" />
                            {scoringJobId === job.id ? "Scoring..." : "Score Job"}
                          </Button>
                          
                          {job.url && (
                            <Button
                              size="sm"
                              variant="outlined"
                              onClick={() => window.open(job.url, '_blank')}
                              className="flex items-center gap-2"
                            >
                              <ExternalLink className="w-4 h-4" />
                              View Job
                            </Button>
                          )}
                          
                          <IconButton
                            size="sm"
                            color="red"
                            variant="outlined"
                            onClick={() => handleDeleteJob(job.id)}
                            disabled={deleteJobMutation.isPending}
                          >
                            <Trash2 className="w-4 h-4" />
                          </IconButton>
                        </div>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              ))}
            </div>
          )}

          {/* Pagination Info */}
          {!isLoading && filteredJobs.length > 0 && (
            <div className="mt-6 text-center">
              <Typography variant="small" className="text-gray-600 dark:text-gray-400">
                Showing {filteredJobs.length} jobs
                {selectedCompany !== "all" && ` from ${selectedCompany}`}
              </Typography>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}