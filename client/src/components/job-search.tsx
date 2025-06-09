import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { JobPosting } from "@shared/schema";
import { useMutation } from "@tanstack/react-query";
import { Plus, Search } from "lucide-react";
import { useState } from "react";

interface JobSearchProps {
  onJobSelect: (job: JobPosting) => void;
}

interface JobResult {
  id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  salary_min?: number;
  salary_max?: number;
  url: string;
  posted_at: string;
  source: string;
}

interface JobSearchResponse {
  jobs: JobResult[];
  total_results: number;
  page: number;
  per_page: number;
  has_more: boolean;
}

interface SearchParams {
  query: string;
  location: string;
  salary_min: string;
  salary_max: string;
  page: number;
}

export default function JobSearch({ onJobSelect }: JobSearchProps) {
  const { getUIText } = useLanguage();
  const { toast } = useToast();
  const [searchParams, setSearchParams] = useState<SearchParams>({
    query: "",
    location: "",
    salary_min: "",
    salary_max: "",
    page: 1,
  });
  const [searchResults, setSearchResults] = useState<JobSearchResponse>({
    jobs: [],
    total_results: 0,
    page: 1,
    per_page: 10,
    has_more: false,
  });

  const searchJobsMutation = useMutation({
    mutationFn: async (params: SearchParams) => {
      const queryParams = new URLSearchParams({
        query: params.query,
        location: params.location,
        salary_min: params.salary_min,
        salary_max: params.salary_max,
        page: params.page.toString(),
      });
      const response = await apiRequest("GET", `/api/jobs/search?${queryParams}`);
      const data = await response.json();
      return data as JobSearchResponse;
    },
    onSuccess: (data) => {
      setSearchResults(data);
    },
    onError: (error: Error) => {
      toast({
        title: getUIText("noResumeSelected"),
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const importJobMutation = useMutation({
    mutationFn: async (job: JobResult) => {
      const response = await apiRequest("POST", "/api/jobs/import", {
        method: "POST",
        body: JSON.stringify(job),
      });
      const data = await response.json();
      return data as JobPosting;
    },
    onSuccess: (job) => {
      onJobSelect(job);
      toast({
        title: getUIText("resumeBuilder"),
        description: getUIText("buildAndMatchResumes"),
      });
    },
    onError: (error: Error) => {
      toast({
        title: getUIText("noResumeSelected"),
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleImportJob = (job: JobResult) => {
    importJobMutation.mutate(job);
  };

  const formatSalary = (min?: number, max?: number) => {
    if (!min && !max) return null;
    if (min && max) return `$${min.toLocaleString()} - $${max.toLocaleString()}`;
    if (min) return `$${min.toLocaleString()}+`;
    if (max) return `Up to $${max.toLocaleString()}`;
    return null;
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "Recently posted";
    try {
      return new Date(dateStr).toLocaleDateString();
    } catch {
      return "Recently posted";
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Search className="w-5 h-5" />
            <span>{getUIText("jobSearch")}</span>
          </CardTitle>
          <CardDescription>{getUIText("searchJobsDescription")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="query">{getUIText("jobTitle")}</Label>
              <Input
                id="query"
                placeholder={getUIText("searchJobsPlaceholder")}
                value={searchParams.query}
                onChange={(e) => setSearchParams((prev) => ({ ...prev, query: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="location">{getUIText("location")}</Label>
              <Input
                id="location"
                placeholder={getUIText("locationPlaceholder")}
                value={searchParams.location}
                onChange={(e) => setSearchParams((prev) => ({ ...prev, location: e.target.value }))}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="salary_min">{getUIText("minSalary")}</Label>
              <Input
                id="salary_min"
                type="number"
                placeholder={getUIText("minSalaryPlaceholder")}
                value={searchParams.salary_min}
                onChange={(e) =>
                  setSearchParams((prev) => ({ ...prev, salary_min: e.target.value }))
                }
              />
            </div>
            <div>
              <Label htmlFor="salary_max">{getUIText("maxSalary")}</Label>
              <Input
                id="salary_max"
                type="number"
                placeholder={getUIText("maxSalaryPlaceholder")}
                value={searchParams.salary_max}
                onChange={(e) =>
                  setSearchParams((prev) => ({ ...prev, salary_max: e.target.value }))
                }
              />
            </div>
          </div>

          <div className="flex justify-between items-center pt-4">
            <p className="text-sm text-gray-600">
              {searchResults.total_results > 0
                ? getUIText("foundJobs").replace("{count}", searchResults.total_results.toString())
                : ""}
            </p>
            <Button
              onClick={() => searchJobsMutation.mutate(searchParams)}
              disabled={searchJobsMutation.isPending}
            >
              {searchJobsMutation.isPending && (
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              )}
              {!searchJobsMutation.isPending && <Search className="w-4 h-4 mr-2" />}
              <span>
                {searchJobsMutation.isPending ? getUIText("searching") : getUIText("search")}
              </span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {searchResults.jobs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>{getUIText("searchResults")}</CardTitle>
            <CardDescription>
              {getUIText("foundJobs").replace("{count}", searchResults.total_results.toString())}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {searchResults.jobs.map((job) => (
                <div key={job.id} className="p-4 border rounded-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">{job.title}</h3>
                      <p className="text-sm text-gray-600">{job.company}</p>
                      <p className="text-sm text-gray-500">{job.location}</p>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(job.url, "_blank")}
                      >
                        {getUIText("viewJob")}
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleImportJob(job)}
                        disabled={importJobMutation.isPending}
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        {importJobMutation.isPending ? getUIText("importing") : getUIText("import")}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}

              {searchResults.has_more && (
                <div className="flex justify-center pt-4">
                  <Button
                    variant="outline"
                    onClick={() => {
                      const nextPage = searchResults.page + 1;
                      searchJobsMutation.mutate({
                        ...searchParams,
                        page: nextPage,
                      });
                    }}
                    disabled={searchJobsMutation.isPending}
                  >
                    {getUIText("loadMore")}
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
