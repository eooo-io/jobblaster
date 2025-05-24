import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Sidebar } from "@/components/sidebar";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { FileText, Plus, Save, Wand2 } from "lucide-react";
import type { CoverLetter, Resume, JobPosting } from "@shared/schema";

const DEFAULT_COVER_LETTER_TEMPLATE = `Dear Hiring Manager,

I am writing to express my strong interest in the [POSITION] position at [COMPANY]. With my background in [FIELD] and passion for [INDUSTRY], I am excited about the opportunity to contribute to your team.

In my previous roles, I have developed expertise in:
• [SKILL_1]
• [SKILL_2]
• [SKILL_3]

I am particularly drawn to [COMPANY] because of [COMPANY_REASON]. Your commitment to [COMPANY_VALUE] aligns perfectly with my professional values and career aspirations.

I would welcome the opportunity to discuss how my experience and enthusiasm can benefit your team. Thank you for considering my application.

Sincerely,
[YOUR_NAME]`;

export default function CoverLetters() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedResume, setSelectedResume] = useState<number | null>(null);
  const [selectedJob, setSelectedJob] = useState<number | null>(null);
  const [coverLetterContent, setCoverLetterContent] = useState(DEFAULT_COVER_LETTER_TEMPLATE);
  const [tone, setTone] = useState("professional");
  const [focus, setFocus] = useState("skills");

  // Fetch resumes
  const { data: resumes = [] } = useQuery<Resume[]>({
    queryKey: ["/api/resumes"],
  });

  // Fetch job postings
  const { data: jobs = [] } = useQuery<JobPosting[]>({
    queryKey: ["/api/jobs"],
  });

  // Fetch existing cover letters
  const { data: coverLetters = [] } = useQuery<CoverLetter[]>({
    queryKey: ["/api/cover-letters"],
  });

  // Create cover letter mutation
  const createCoverLetterMutation = useMutation({
    mutationFn: (data: { resumeId: number | null; jobId: number | null; content: string; tone: string; focus: string }) =>
      apiRequest("/api/cover-letters", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cover-letters"] });
      toast({
        title: "Success",
        description: "Cover letter saved successfully!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to save cover letter",
        variant: "destructive",
      });
    },
  });

  // Generate AI cover letter mutation
  const generateCoverLetterMutation = useMutation({
    mutationFn: (data: { resumeId: number; jobId: number; tone: string; focus: string }) =>
      apiRequest("/api/cover-letters/generate", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: (data: any) => {
      setCoverLetterContent(data.content);
      toast({
        title: "Success",
        description: "AI cover letter generated successfully!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to generate cover letter",
        variant: "destructive",
      });
    },
  });

  const handleSaveCoverLetter = () => {
    createCoverLetterMutation.mutate({
      resumeId: selectedResume,
      jobId: selectedJob,
      content: coverLetterContent,
      tone,
      focus,
    });
  };

  const handleGenerateAICoverLetter = () => {
    if (!selectedResume || !selectedJob) {
      toast({
        title: "Missing Selection",
        description: "Please select both a resume and job posting to generate an AI cover letter.",
        variant: "destructive",
      });
      return;
    }

    generateCoverLetterMutation.mutate({
      resumeId: selectedResume,
      jobId: selectedJob,
      tone,
      focus,
    });
  };

  const handleLoadTemplate = () => {
    setCoverLetterContent(DEFAULT_COVER_LETTER_TEMPLATE);
  };

  const selectedResumeData = resumes.find(r => r.id === selectedResume);
  const selectedJobData = jobs.find(j => j.id === selectedJob);

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-gray-950">
      <Sidebar />
      <main className="flex-1 flex flex-col overflow-hidden lg:ml-0 pt-16 lg:pt-0">
        <div className="flex-1 overflow-y-auto p-6 max-w-7xl mx-auto w-full">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Cover Letters
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Create and manage personalized cover letters for your job applications.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Settings Panel */}
            <div className="lg:col-span-1 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Settings
                  </CardTitle>
                  <CardDescription>
                    Configure your cover letter preferences
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="resume-select">Select Resume</Label>
                    <Select value={selectedResume?.toString() || ""} onValueChange={(value) => setSelectedResume(Number(value))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a resume" />
                      </SelectTrigger>
                      <SelectContent>
                        {resumes.map((resume) => (
                          <SelectItem key={resume.id} value={resume.id.toString()}>
                            {resume.name}
                            {resume.isDefault && <Badge variant="secondary" className="ml-2">Default</Badge>}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="job-select">Select Job Posting</Label>
                    <Select value={selectedJob?.toString() || ""} onValueChange={(value) => setSelectedJob(Number(value))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a job posting" />
                      </SelectTrigger>
                      <SelectContent>
                        {jobs.map((job) => (
                          <SelectItem key={job.id} value={job.id.toString()}>
                            {job.title} - {job.company}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="tone-select">Tone</Label>
                    <Select value={tone} onValueChange={setTone}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="professional">Professional</SelectItem>
                        <SelectItem value="friendly">Friendly</SelectItem>
                        <SelectItem value="confident">Confident</SelectItem>
                        <SelectItem value="enthusiastic">Enthusiastic</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="focus-select">Focus</Label>
                    <Select value={focus} onValueChange={setFocus}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="skills">Technical Skills</SelectItem>
                        <SelectItem value="experience">Experience</SelectItem>
                        <SelectItem value="achievements">Achievements</SelectItem>
                        <SelectItem value="culture">Culture Fit</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex flex-col gap-2">
                    <Button onClick={handleLoadTemplate} variant="outline" className="w-full">
                      Load Default Template
                    </Button>
                    <Button 
                      onClick={handleGenerateAICoverLetter}
                      disabled={!selectedResume || !selectedJob || generateCoverLetterMutation.isPending}
                      className="w-full"
                    >
                      <Wand2 className="w-4 h-4 mr-2" />
                      {generateCoverLetterMutation.isPending ? "Generating..." : "Generate AI Cover Letter"}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {selectedResumeData && (
                <Card>
                  <CardHeader>
                    <CardTitle>Selected Resume</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="font-medium">{selectedResumeData.name}</p>
                    <Badge variant="secondary" className="mt-2">{selectedResumeData.theme}</Badge>
                  </CardContent>
                </Card>
              )}

              {selectedJobData && (
                <Card>
                  <CardHeader>
                    <CardTitle>Selected Job</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="font-medium">{selectedJobData.title}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{selectedJobData.company}</p>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Cover Letter Editor */}
            <div className="lg:col-span-2">
              <Card className="h-full">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    Cover Letter Editor
                    <Button 
                      onClick={handleSaveCoverLetter}
                      disabled={createCoverLetterMutation.isPending}
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {createCoverLetterMutation.isPending ? "Saving..." : "Save Cover Letter"}
                    </Button>
                  </CardTitle>
                  <CardDescription>
                    Write or edit your cover letter content
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={coverLetterContent}
                    onChange={(e) => setCoverLetterContent(e.target.value)}
                    placeholder="Write your cover letter here..."
                    className="min-h-[500px] font-mono text-sm"
                  />
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Existing Cover Letters */}
          {coverLetters.length > 0 && (
            <div className="mt-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Saved Cover Letters
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {coverLetters.map((letter) => (
                  <Card key={letter.id} className="cursor-pointer hover:shadow-lg transition-shadow"
                        onClick={() => setCoverLetterContent(letter.content)}>
                    <CardHeader>
                      <CardTitle className="text-lg">Cover Letter #{letter.id}</CardTitle>
                      <CardDescription>
                        <div className="flex gap-2 mt-2">
                          <Badge variant="outline">{letter.tone}</Badge>
                          <Badge variant="outline">{letter.focus}</Badge>
                        </div>
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
                        {letter.content.substring(0, 150)}...
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}