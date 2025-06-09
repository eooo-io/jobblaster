import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { CoverLetter, JobPosting, Resume } from "@shared/schema";
import { useMutation, useQuery } from "@tanstack/react-query";
import { FileText } from "lucide-react";
import { useState } from "react";

interface CoverLetterGeneratorProps {
  resume: Resume | null;
  job: JobPosting | null;
}

export default function CoverLetterGenerator({ resume, job }: CoverLetterGeneratorProps) {
  const { getUIText } = useLanguage();
  const [tone, setTone] = useState("professional");
  const [focus, setFocus] = useState("technical");
  const [coverLetter, setCoverLetter] = useState<CoverLetter | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState("");
  const { toast } = useToast();

  const { data: existingLetters } = useQuery({
    queryKey: ["/api/cover-letters", resume?.id, job?.id],
    enabled: !!(resume?.id && job?.id),
  });

  const generateMutation = useMutation({
    mutationFn: async () => {
      if (!resume || !job) throw new Error("Resume and job are required");

      const response = await apiRequest("POST", "/api/cover-letters", {
        resumeId: resume.id,
        jobId: job.id,
        tone,
        focus,
      });
      return response.json();
    },
    onSuccess: (data) => {
      setCoverLetter(data);
      setEditedContent(data.content);
      setIsEditing(false);
      toast({
        title: "Cover letter generated",
        description: "Your personalized cover letter is ready for review.",
      });
    },
    onError: () => {
      toast({
        title: "Generation failed",
        description: "There was an error generating the cover letter. Please try again.",
        variant: "destructive",
      });
    },
  });

  const exportMutation = useMutation({
    mutationFn: async () => {
      if (!resume || !job || !coverLetter) throw new Error("Missing required data");

      const response = await fetch("/api/export-package", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeId: resume.id,
          jobId: job.id,
          coverLetterId: coverLetter.id,
        }),
        credentials: "include",
      });

      if (!response.ok) throw new Error("Export failed");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `application-package-${job.company}-${job.title}.zip`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    },
    onSuccess: () => {
      toast({
        title: "Package exported",
        description: "Your application package has been downloaded.",
      });
    },
    onError: () => {
      toast({
        title: "Export failed",
        description: "There was an error creating the export package.",
        variant: "destructive",
      });
    },
  });

  const handleGenerate = () => {
    if (!resume || !job) {
      toast({
        title: "Missing data",
        description: "Please select both a resume and job posting to generate a cover letter.",
        variant: "destructive",
      });
      return;
    }
    generateMutation.mutate();
  };

  const handleExport = () => {
    exportMutation.mutate();
  };

  const handleEditToggle = () => {
    if (isEditing) {
      // Save changes
      if (coverLetter) {
        setCoverLetter({ ...coverLetter, content: editedContent });
      }
    }
    setIsEditing(!isEditing);
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <FileText className="w-5 h-5" />
          <span>{getUIText("coverLetters")}</span>
        </CardTitle>
        <CardDescription>{getUIText("buildAndMatchResumes")}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden">
        {resume && job ? (
          <ScrollArea className="h-full">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold">{job.title}</h3>
                <p className="text-sm text-gray-600">{job.company}</p>
              </div>

              <div className="prose prose-sm max-w-none dark:prose-invert">
                <p>Dear Hiring Manager,</p>
                <p>
                  I am writing to express my strong interest in the {job.title} position at{" "}
                  {job.company}. With my background and skills that closely align with your
                  requirements, I am confident in my ability to contribute effectively to your team.
                </p>
                <p>
                  Thank you for considering my application. I look forward to discussing how I can
                  contribute to {job.company}'s continued success.
                </p>
                <p>
                  Best regards,
                  <br />
                  {resume.name}
                </p>
              </div>

              <div className="pt-4">
                <Button className="w-full">
                  <FileText className="w-4 h-4 mr-2" />
                  {getUIText("createNewResume")}
                </Button>
              </div>
            </div>
          </ScrollArea>
        ) : (
          <div className="h-full flex items-center justify-center">
            <p className="text-sm text-gray-600">{getUIText("pleaseSelectResume")}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
