import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Clipboard, Upload, Link, Plus, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import MatchScorer from "@/components/match-scorer";
import type { JobPosting, Resume } from "@shared/schema";

interface JobAnalyzerProps {
  selectedJob: JobPosting | null;
  onJobSelect: (job: JobPosting) => void;
  selectedResume?: Resume | null;
}

export default function JobAnalyzer({ selectedJob, onJobSelect, selectedResume }: JobAnalyzerProps) {
  const [activeTab, setActiveTab] = useState<"paste" | "upload" | "url">("paste");
  const [jobDescription, setJobDescription] = useState("");
  const [parsedData, setParsedData] = useState<any>(null);
  const [newSkill, setNewSkill] = useState("");
  const { toast } = useToast();

  const analyzeMutation = useMutation({
    mutationFn: async (description: string) => {
      const response = await apiRequest('POST', '/api/jobs/analyze', { description });
      return response.json();
    },
    onSuccess: (data) => {
      setParsedData(data);
      toast({
        title: "Job description analyzed",
        description: "The job requirements have been parsed successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Analysis failed",
        description: "There was an error analyzing the job description.",
        variant: "destructive",
      });
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (jobData: any) => {
      const response = await apiRequest('POST', '/api/jobs', jobData);
      return response.json();
    },
    onSuccess: (newJob) => {
      queryClient.invalidateQueries({ queryKey: ['/api/jobs'] });
      onJobSelect(newJob);
      toast({
        title: "Job saved",
        description: "The job posting has been saved to your library.",
      });
    },
  });

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      const response = await fetch('/api/jobs/upload', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Upload failed');
      return response.json();
    },
    onSuccess: (data) => {
      setParsedData(data);
      toast({
        title: "File uploaded and analyzed",
        description: "The job requirements have been extracted from your file.",
      });
    },
  });

  const handleAnalyze = () => {
    if (!jobDescription.trim()) {
      toast({
        title: "No job description",
        description: "Please enter a job description to analyze.",
        variant: "destructive",
      });
      return;
    }
    analyzeMutation.mutate(jobDescription);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      uploadMutation.mutate(file);
    }
  };

  const handleSaveJob = () => {
    if (!parsedData) return;

    const jobData = {
      title: parsedData.title || "Untitled Position",
      company: parsedData.company || "Unknown Company",
      description: jobDescription,
      parsedData,
      techStack: parsedData.techStack || [],
      softSkills: parsedData.softSkills || [],
      experienceYears: parsedData.experienceYears || "",
      location: parsedData.location || "",
      employmentType: parsedData.employmentType || "",
    };

    saveMutation.mutate(jobData);
  };

  const updateParsedField = (field: string, value: any) => {
    setParsedData(prev => ({ ...prev, [field]: value }));
  };

  const addSkill = (type: 'techStack' | 'softSkills') => {
    if (!newSkill.trim()) return;
    
    const currentSkills = parsedData?.[type] || [];
    updateParsedField(type, [...currentSkills, newSkill.trim()]);
    setNewSkill("");
  };

  const removeSkill = (type: 'techStack' | 'softSkills', index: number) => {
    const currentSkills = parsedData?.[type] || [];
    updateParsedField(type, currentSkills.filter((_, i) => i !== index));
  };

  return (
    <Card className="bg-white rounded-xl border border-slate-200 flex flex-col h-full">
      <CardHeader className="border-b border-slate-200">
        <CardTitle className="text-lg font-semibold text-slate-900">Job Description Analysis</CardTitle>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0">
        {/* Job Input Section */}
        <div className="p-6 border-b border-slate-200">
          <div className="space-y-4">
            <div className="flex space-x-2">
              <Button
                variant={activeTab === "paste" ? "default" : "outline"}
                className="flex-1 text-sm"
                onClick={() => setActiveTab("paste")}
              >
                <Clipboard className="w-4 h-4 mr-2" />
                Paste Text
              </Button>
              <Button
                variant={activeTab === "upload" ? "default" : "outline"}
                className="flex-1 text-sm"
                onClick={() => setActiveTab("upload")}
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload File
              </Button>
              <Button
                variant={activeTab === "url" ? "default" : "outline"}
                className="flex-1 text-sm"
                onClick={() => setActiveTab("url")}
              >
                <Link className="w-4 h-4 mr-2" />
                Scrape URL
              </Button>
            </div>

            {activeTab === "paste" && (
              <div className="space-y-2">
                <Textarea
                  className="h-32 resize-none"
                  placeholder="Paste job description here..."
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                />
                <Button 
                  onClick={handleAnalyze}
                  disabled={analyzeMutation.isPending || !jobDescription.trim()}
                  className="w-full"
                >
                  {analyzeMutation.isPending ? "Analyzing..." : "Analyze Job Description"}
                </Button>
              </div>
            )}

            {activeTab === "upload" && (
              <div className="space-y-2">
                <input
                  type="file"
                  accept=".txt,.pdf,.docx"
                  onChange={handleFileUpload}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
                <p className="text-xs text-slate-500">Supports .txt, .pdf, and .docx files</p>
              </div>
            )}

            {activeTab === "url" && (
              <div className="space-y-2">
                <Input
                  placeholder="Enter LinkedIn or Indeed job URL..."
                  className="w-full"
                />
                <Button className="w-full" disabled>
                  Scrape Job Description (Coming Soon)
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Match Score Section */}
        <div className="border-b border-slate-200 p-6">
          <MatchScorer 
            resume={selectedResume} 
            job={selectedJob} 
          />
        </div>

        {/* Parsed Job Data */}
        {parsedData && (
          <div className="flex-1 p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-medium text-slate-900">Parsed Job Information</h4>
              <Button onClick={handleSaveJob} disabled={saveMutation.isPending}>
                {saveMutation.isPending ? "Saving..." : "Save Job"}
              </Button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-slate-700 mb-1">Job Title</Label>
                  <Input
                    value={parsedData.title || ""}
                    onChange={(e) => updateParsedField('title', e.target.value)}
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium text-slate-700 mb-1">Company</Label>
                  <Input
                    value={parsedData.company || ""}
                    onChange={(e) => updateParsedField('company', e.target.value)}
                  />
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium text-slate-700 mb-1">Required Tech Stack</Label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {parsedData.techStack?.map((skill: string, index: number) => (
                    <Badge key={index} className="bg-blue-100 text-blue-800 flex items-center">
                      {skill}
                      <button
                        onClick={() => removeSkill('techStack', index)}
                        className="ml-1 hover:text-blue-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                  <div className="flex items-center gap-2">
                    <Input
                      placeholder="Add skill"
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      className="w-24"
                      onKeyPress={(e) => e.key === 'Enter' && addSkill('techStack')}
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => addSkill('techStack')}
                    >
                      <Plus className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-slate-700 mb-1">Experience Required</Label>
                  <Input
                    value={parsedData.experienceYears || ""}
                    onChange={(e) => updateParsedField('experienceYears', e.target.value)}
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium text-slate-700 mb-1">Location</Label>
                  <Input
                    value={parsedData.location || ""}
                    onChange={(e) => updateParsedField('location', e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
