import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Search, MapPin, Building, Calendar, ExternalLink, Plus, Loader2 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface JobResult {
  id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  salary_min?: number;
  salary_max?: number;
  url: string;
  posted_date?: string;
  contract_type?: string;
  source: string;
}

interface JobSearchResponse {
  jobs: JobResult[];
  total_results: number;
  page: number;
  per_page: number;
  has_more: boolean;
}

export default function JobSearch() {
  const [searchParams, setSearchParams] = useState({
    query: "",
    location: "",
    salary_min: "",
    salary_max: "",
    page: 1
  });
  const [searchResults, setSearchResults] = useState<JobSearchResponse | null>(null);
  const { toast } = useToast();

  // Search jobs mutation
  const searchJobsMutation = useMutation({
    mutationFn: async (params: typeof searchParams) => {
      const queryParams = new URLSearchParams();
      if (params.query) queryParams.append('query', params.query);
      if (params.location) queryParams.append('location', params.location);
      if (params.salary_min) queryParams.append('salary_min', params.salary_min);
      if (params.salary_max) queryParams.append('salary_max', params.salary_max);
      queryParams.append('page', params.page.toString());
      
      return apiRequest(`/api/jobs/search?${queryParams}`);
    },
    onSuccess: (data: JobSearchResponse) => {
      setSearchResults(data);
      toast({
        title: "Search Complete",
        description: `Found ${data.total_results} jobs from connected platforms`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Search Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Import job mutation
  const importJobMutation = useMutation({
    mutationFn: async (job: JobResult) => {
      return apiRequest('/api/job-postings', {
        method: 'POST',
        body: JSON.stringify({
          title: job.title,
          company: job.company,
          description: job.description,
          location: job.location,
          techStack: [],
          softSkills: [],
          experienceYears: null,
          employmentType: job.contract_type || null
        }),
      });
    },
    onSuccess: () => {
      toast({
        title: "Job Imported",
        description: "Job successfully added to your job listings for analysis",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Import Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSearch = () => {
    searchJobsMutation.mutate(searchParams);
  };

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
    <div className="space-y-6">
      {/* Search Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Search className="w-5 h-5" />
            <span>Job Search</span>
          </CardTitle>
          <CardDescription>
            Search for jobs across connected platforms and import them for analysis
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="query">Job Title / Keywords</Label>
              <Input
                id="query"
                placeholder="e.g. Software Engineer, React Developer"
                value={searchParams.query}
                onChange={(e) => setSearchParams(prev => ({ ...prev, query: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                placeholder="e.g. San Francisco, Remote"
                value={searchParams.location}
                onChange={(e) => setSearchParams(prev => ({ ...prev, location: e.target.value }))}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="salary_min">Minimum Salary</Label>
              <Input
                id="salary_min"
                type="number"
                placeholder="e.g. 80000"
                value={searchParams.salary_min}
                onChange={(e) => setSearchParams(prev => ({ ...prev, salary_min: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="salary_max">Maximum Salary</Label>
              <Input
                id="salary_max"
                type="number"
                placeholder="e.g. 150000"
                value={searchParams.salary_max}
                onChange={(e) => setSearchParams(prev => ({ ...prev, salary_max: e.target.value }))}
              />
            </div>
          </div>

          <div className="flex justify-between items-center pt-4">
            <p className="text-sm text-gray-600">
              Search will use all configured job connectors
            </p>
            <Button 
              onClick={handleSearch}
              disabled={searchJobsMutation.isPending || !searchParams.query}
              className="flex items-center space-x-2"
            >
              {searchJobsMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Search className="w-4 h-4" />
              )}
              <span>{searchJobsMutation.isPending ? "Searching..." : "Search Jobs"}</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Search Results */}
      {searchResults && (
        <Card>
          <CardHeader>
            <CardTitle>Search Results</CardTitle>
            <CardDescription>
              Found {searchResults.total_results} jobs • Page {searchResults.page}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {searchResults.jobs.map((job) => (
                <div key={job.id} className="border border-gray-200 rounded-lg p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <h3 className="font-medium text-gray-900">{job.title}</h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <div className="flex items-center space-x-1">
                          <Building className="w-4 h-4" />
                          <span>{job.company}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <MapPin className="w-4 h-4" />
                          <span>{job.location}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDate(job.posted_date)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="secondary">{job.source}</Badge>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleImportJob(job)}
                        disabled={importJobMutation.isPending}
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Import
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => window.open(job.url, '_blank')}
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  
                  {formatSalary(job.salary_min, job.salary_max) && (
                    <div className="text-sm font-medium text-green-600">
                      {formatSalary(job.salary_min, job.salary_max)}
                    </div>
                  )}
                  
                  {job.contract_type && (
                    <Badge variant="outline" className="w-fit">
                      {job.contract_type}
                    </Badge>
                  )}
                  
                  <div className="text-sm text-gray-700 line-clamp-3">
                    {job.description.replace(/<[^>]*>/g, '').substring(0, 300)}...
                  </div>
                </div>
              ))}
            </div>

            {searchResults.has_more && (
              <div className="flex justify-center mt-6">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchParams(prev => ({ ...prev, page: prev.page + 1 }));
                    searchJobsMutation.mutate({ ...searchParams, page: searchParams.page + 1 });
                  }}
                  disabled={searchJobsMutation.isPending}
                >
                  Load More Jobs
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}