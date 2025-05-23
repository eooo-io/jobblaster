import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Edit2, Trash2, Search, Target, MapPin, DollarSign, Clock, Play, ChevronDown, ChevronRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { JobSearchCriteria, InsertJobSearchCriteria } from "@shared/schema";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import Sidebar from "@/components/sidebar";

interface SearchCriteriaFormData {
  name: string;
  keywords: string[];
  jobTitles: string[];
  locations: string[];
  excludeKeywords: string[];
  employmentType: string;
  salaryMin?: number;
  salaryMax?: number;
  experienceLevel: string;
  isActive: boolean;
}

export default function SearchCriteriaPage() {
  const { toast } = useToast();
  
  // Clear cache on component mount
  React.useEffect(() => {
    queryClient.invalidateQueries({ queryKey: ["/api/job-search-criteria"] });
  }, []);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCriteria, setEditingCriteria] = useState<JobSearchCriteria | null>(null);
  const [expandedCriteria, setExpandedCriteria] = useState<{ [key: number]: boolean }>({});
  const [keywordInput, setKeywordInput] = useState("");
  const [jobTitleInput, setJobTitleInput] = useState("");
  const [locationInput, setLocationInput] = useState("");
  const [excludeKeywordInput, setExcludeKeywordInput] = useState("");

  const [formData, setFormData] = useState<SearchCriteriaFormData>({
    name: "",
    keywords: [],
    jobTitles: [],
    locations: [],
    excludeKeywords: [],
    employmentType: "full-time",
    salaryMin: undefined,
    salaryMax: undefined,
    experienceLevel: "mid",
    isActive: true,
  });

  const { data: criteria = [], isLoading } = useQuery({
    queryKey: ["/api/job-search-criteria"],
    staleTime: 0, // Force fresh data
    cacheTime: 0, // Don't cache
  });

  // Debug log to see what data we're getting
  console.log("Search criteria data:", criteria, "isLoading:", isLoading);

  const createMutation = useMutation({
    mutationFn: (data: InsertJobSearchCriteria) => apiRequest("/api/job-search-criteria", "POST", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/job-search-criteria"] });
      setIsDialogOpen(false);
      resetForm();
      toast({ title: "Search criteria created successfully!" });
    },
    onError: () => {
      toast({ title: "Failed to create search criteria", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<InsertJobSearchCriteria> }) =>
      apiRequest(`/api/job-search-criteria/${id}`, "PUT", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/job-search-criteria"] });
      setIsDialogOpen(false);
      resetForm();
      toast({ title: "Search criteria updated successfully!" });
    },
    onError: () => {
      toast({ title: "Failed to update search criteria", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiRequest(`/api/job-search-criteria/${id}`, "DELETE"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/job-search-criteria"] });
      toast({ title: "Search criteria deleted successfully!" });
    },
    onError: () => {
      toast({ title: "Failed to delete search criteria", variant: "destructive" });
    },
  });

  const runSearchMutation = useMutation({
    mutationFn: (criteriaId: number) => apiRequest("/api/job-search/run", "POST", { criteriaId }),
    onSuccess: () => {
      toast({ title: "Job search started! Check External API Logs for progress." });
    },
    onError: () => {
      toast({ title: "Failed to start job search", variant: "destructive" });
    },
  });

  const resetForm = () => {
    setFormData({
      name: "",
      keywords: [],
      jobTitles: [],
      locations: [],
      excludeKeywords: [],
      employmentType: "full-time",
      salaryMin: undefined,
      salaryMax: undefined,
      experienceLevel: "mid",
      isActive: true,
    });
    setEditingCriteria(null);
    setKeywordInput("");
    setJobTitleInput("");
    setLocationInput("");
    setExcludeKeywordInput("");
  };

  const openCreateDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const openEditDialog = (criteria: JobSearchCriteria) => {
    setEditingCriteria(criteria);
    setFormData({
      name: criteria.name,
      keywords: criteria.keywords || [],
      jobTitles: criteria.jobTitles || [],
      locations: criteria.locations || [],
      excludeKeywords: criteria.excludeKeywords || [],
      employmentType: criteria.employmentType || "full-time",
      salaryMin: criteria.salaryMin || undefined,
      salaryMax: criteria.salaryMax || undefined,
      experienceLevel: criteria.experienceLevel || "mid",
      isActive: criteria.isActive ?? true,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.keywords.length === 0 && formData.jobTitles.length === 0) {
      toast({ title: "Please add at least one keyword or job title", variant: "destructive" });
      return;
    }

    if (formData.locations.length === 0) {
      toast({ title: "Please add at least one location", variant: "destructive" });
      return;
    }

    const submitData: InsertJobSearchCriteria = {
      name: formData.name,
      keywords: formData.keywords,
      jobTitles: formData.jobTitles,
      locations: formData.locations,
      excludeKeywords: formData.excludeKeywords,
      employmentType: formData.employmentType,
      salaryMin: formData.salaryMin || null,
      salaryMax: formData.salaryMax || null,
      experienceLevel: formData.experienceLevel,
      isActive: formData.isActive,
      userId: 1, // This will be replaced with actual user ID from session
    };

    if (editingCriteria) {
      updateMutation.mutate({ id: editingCriteria.id, data: submitData });
    } else {
      createMutation.mutate(submitData);
    }
  };

  const addTag = (type: 'keywords' | 'jobTitles' | 'locations' | 'excludeKeywords', value: string) => {
    if (!value.trim()) return;
    
    const currentArray = formData[type];
    if (!currentArray.includes(value.trim())) {
      setFormData(prev => ({
        ...prev,
        [type]: [...currentArray, value.trim()]
      }));
    }
    
    // Clear the input
    switch (type) {
      case 'keywords':
        setKeywordInput("");
        break;
      case 'jobTitles':
        setJobTitleInput("");
        break;
      case 'locations':
        setLocationInput("");
        break;
      case 'excludeKeywords':
        setExcludeKeywordInput("");
        break;
    }
  };

  const removeTag = (type: 'keywords' | 'jobTitles' | 'locations' | 'excludeKeywords', value: string) => {
    setFormData(prev => ({
      ...prev,
      [type]: prev[type].filter(item => item !== value)
    }));
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">Loading search criteria...</div>
      </div>
    );
  }

  const toggleCriteriaExpansion = (criteriaId: number) => {
    setExpandedCriteria(prev => ({
      ...prev,
      [criteriaId]: !prev[criteriaId]
    }));
  };

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-auto">
          <div className="container mx-auto p-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-3xl font-bold">Job Search Criteria</h1>
                <p className="text-muted-foreground">
                  Manage universal search parameters for all job connectors and scrapers
                </p>
              </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreateDialog}>
              <Plus className="h-4 w-4 mr-2" />
              Create Criteria
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>
                  {editingCriteria ? "Edit Search Criteria" : "Create Search Criteria"}
                </DialogTitle>
                <DialogDescription>
                  Define keywords, job titles, and locations that will be used across all job scrapers and connectors
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-4 py-4">
                <div>
                  <Label htmlFor="name">Criteria Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Frontend Developer - Remote"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="keywords">Keywords</Label>
                  <div className="flex gap-2 mb-2">
                    <Input
                      id="keywords"
                      value={keywordInput}
                      onChange={(e) => setKeywordInput(e.target.value)}
                      placeholder="e.g., React, JavaScript, Frontend"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addTag('keywords', keywordInput);
                        }
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => addTag('keywords', keywordInput)}
                    >
                      Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.keywords.map((keyword) => (
                      <Badge key={keyword} variant="default" className="cursor-pointer">
                        {keyword}
                        <button
                          type="button"
                          onClick={() => removeTag('keywords', keyword)}
                          className="ml-1 text-xs"
                        >
                          ×
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <Label htmlFor="jobTitles">Job Titles</Label>
                  <div className="flex gap-2 mb-2">
                    <Input
                      id="jobTitles"
                      value={jobTitleInput}
                      onChange={(e) => setJobTitleInput(e.target.value)}
                      placeholder="e.g., Frontend Developer, React Developer"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addTag('jobTitles', jobTitleInput);
                        }
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => addTag('jobTitles', jobTitleInput)}
                    >
                      Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.jobTitles.map((title) => (
                      <Badge key={title} variant="secondary" className="cursor-pointer">
                        {title}
                        <button
                          type="button"
                          onClick={() => removeTag('jobTitles', title)}
                          className="ml-1 text-xs"
                        >
                          ×
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <Label htmlFor="locations">Locations</Label>
                  <div className="flex gap-2 mb-2">
                    <Input
                      id="locations"
                      value={locationInput}
                      onChange={(e) => setLocationInput(e.target.value)}
                      placeholder="e.g., Remote, San Francisco, New York"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addTag('locations', locationInput);
                        }
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => addTag('locations', locationInput)}
                    >
                      Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.locations.map((location) => (
                      <Badge key={location} variant="outline" className="cursor-pointer">
                        {location}
                        <button
                          type="button"
                          onClick={() => removeTag('locations', location)}
                          className="ml-1 text-xs"
                        >
                          ×
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <Label htmlFor="excludeKeywords">Exclude Keywords (Optional)</Label>
                  <div className="flex gap-2 mb-2">
                    <Input
                      id="excludeKeywords"
                      value={excludeKeywordInput}
                      onChange={(e) => setExcludeKeywordInput(e.target.value)}
                      placeholder="e.g., Senior, Lead, Manager"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addTag('excludeKeywords', excludeKeywordInput);
                        }
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => addTag('excludeKeywords', excludeKeywordInput)}
                    >
                      Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.excludeKeywords.map((keyword) => (
                      <Badge key={keyword} variant="destructive" className="cursor-pointer">
                        {keyword}
                        <button
                          type="button"
                          onClick={() => removeTag('excludeKeywords', keyword)}
                          className="ml-1 text-xs"
                        >
                          ×
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="employmentType">Employment Type</Label>
                    <Select
                      value={formData.employmentType}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, employmentType: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="full-time">Full-time</SelectItem>
                        <SelectItem value="part-time">Part-time</SelectItem>
                        <SelectItem value="contract">Contract</SelectItem>
                        <SelectItem value="freelance">Freelance</SelectItem>
                        <SelectItem value="internship">Internship</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="experienceLevel">Experience Level</Label>
                    <Select
                      value={formData.experienceLevel}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, experienceLevel: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="entry">Entry Level</SelectItem>
                        <SelectItem value="mid">Mid Level</SelectItem>
                        <SelectItem value="senior">Senior Level</SelectItem>
                        <SelectItem value="executive">Executive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="salaryMin">Min Salary (Optional)</Label>
                    <Input
                      id="salaryMin"
                      type="number"
                      value={formData.salaryMin || ""}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        salaryMin: e.target.value ? parseInt(e.target.value) : undefined 
                      }))}
                      placeholder="80000"
                    />
                  </div>

                  <div>
                    <Label htmlFor="salaryMax">Max Salary (Optional)</Label>
                    <Input
                      id="salaryMax"
                      type="number"
                      value={formData.salaryMax || ""}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        salaryMax: e.target.value ? parseInt(e.target.value) : undefined 
                      }))}
                      placeholder="120000"
                    />
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                  {editingCriteria ? "Update Criteria" : "Create Criteria"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

            <div className="grid gap-4">
              {criteria.map((criteriaItem: JobSearchCriteria) => (
                <Collapsible
                  key={criteriaItem.id}
                  open={expandedCriteria[criteriaItem.id] || false}
                  onOpenChange={() => toggleCriteriaExpansion(criteriaItem.id)}
                >
                  <Card>
                    <CollapsibleTrigger asChild>
                      <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-2 flex-1">
                            {expandedCriteria[criteriaItem.id] ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <ChevronRight className="h-4 w-4" />
                            )}
                            <Target className="h-5 w-5" />
                            <CardTitle className="flex items-center gap-2">
                              {criteriaItem.name}
                              {criteriaItem.isActive ? (
                                <Badge variant="default">Active</Badge>
                              ) : (
                                <Badge variant="secondary">Inactive</Badge>
                              )}
                            </CardTitle>
                          </div>
                  <CardDescription className="flex items-center gap-4 mt-2">
                    <span className="flex items-center gap-1">
                      <Search className="h-4 w-4" />
                      {criteriaItem.keywords?.length || 0} keywords
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {criteriaItem.locations?.length || 0} locations
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {criteriaItem.employmentType}
                    </span>
                    {(criteriaItem.salaryMin || criteriaItem.salaryMax) && (
                      <span className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4" />
                        {criteriaItem.salaryMin && `$${criteriaItem.salaryMin.toLocaleString()}`}
                        {criteriaItem.salaryMin && criteriaItem.salaryMax && " - "}
                        {criteriaItem.salaryMax && `$${criteriaItem.salaryMax.toLocaleString()}`}
                      </span>
                    )}
                          </CardDescription>
                        </div>
                        <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                          <Button
                            variant="outline"
                            size="sm"
                    onClick={() => runSearchMutation.mutate(criteriaItem.id)}
                    disabled={runSearchMutation.isPending}
                  >
                    <Play className="h-4 w-4 mr-1" />
                    Run Search
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEditDialog(criteriaItem)}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => deleteMutation.mutate(criteriaItem.id)}
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                        </div>
                      </CardHeader>
                    </CollapsibleTrigger>
                    
                    <CollapsibleContent>
                      <CardContent>
              <div className="grid gap-4">
                {criteriaItem.keywords && criteriaItem.keywords.length > 0 && (
                  <div>
                    <Label className="text-sm font-medium">Keywords</Label>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {criteriaItem.keywords.map((keyword) => (
                        <Badge key={keyword} variant="default">
                          {keyword}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {criteriaItem.jobTitles && criteriaItem.jobTitles.length > 0 && (
                  <div>
                    <Label className="text-sm font-medium">Job Titles</Label>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {criteriaItem.jobTitles.map((title) => (
                        <Badge key={title} variant="secondary">
                          {title}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {criteriaItem.locations && criteriaItem.locations.length > 0 && (
                  <div>
                    <Label className="text-sm font-medium">Locations</Label>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {criteriaItem.locations.map((location) => (
                        <Badge key={location} variant="outline">
                          {location}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {criteriaItem.excludeKeywords && criteriaItem.excludeKeywords.length > 0 && (
                  <div>
                    <Label className="text-sm font-medium">Exclude Keywords</Label>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {criteriaItem.excludeKeywords.map((keyword) => (
                        <Badge key={keyword} variant="destructive">
                          {keyword}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                      </div>
                    </CardContent>
                  </CollapsibleContent>
                </Card>
              </Collapsible>
            ))}

        {criteria.length === 0 && (
          <Card>
            <CardContent className="text-center py-8">
              <Target className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No search criteria yet</h3>
              <p className="text-muted-foreground mb-4">
                Create your first universal search criteria to use across all job scrapers and connectors
              </p>
              <Button onClick={openCreateDialog}>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Criteria
              </Button>
            </CardContent>
          </Card>
          )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}