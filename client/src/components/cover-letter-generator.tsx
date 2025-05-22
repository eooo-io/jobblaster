import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Wand2, Edit, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Resume, JobPosting, CoverLetter } from "@shared/schema";

interface CoverLetterGeneratorProps {
  resume: Resume | null;
  job: JobPosting | null;
}

export default function CoverLetterGenerator({ resume, job }: CoverLetterGeneratorProps) {
  const [tone, setTone] = useState("professional");
  const [focus, setFocus] = useState("technical");
  const [coverLetter, setCoverLetter] = useState<CoverLetter | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState("");
  const { toast } = useToast();

  const { data: existingLetters } = useQuery({
    queryKey: ['/api/cover-letters', resume?.id, job?.id],
    enabled: !!(resume?.id && job?.id),
  });

  const generateMutation = useMutation({
    mutationFn: async () => {
      if (!resume || !job) throw new Error("Resume and job are required");
      
      const response = await apiRequest('POST', '/api/cover-letters', {
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
      
      const response = await fetch('/api/export-package', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resumeId: resume.id,
          jobId: job.id,
          coverLetterId: coverLetter.id,
        }),
        credentials: 'include',
      });
      
      if (!response.ok) throw new Error('Export failed');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
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
    <div className="lg:col-span-1">
      <h3 className="text-lg font-semibold text-slate-900 mb-4">Cover Letter Generator</h3>

      {/* Generation Options */}
      <div className="space-y-3 mb-4">
        <div>
          <Label className="text-sm font-medium text-slate-700 mb-1">Tone</Label>
          <Select value={tone} onValueChange={setTone}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="professional">Professional</SelectItem>
              <SelectItem value="friendly">Friendly</SelectItem>
              <SelectItem value="enthusiastic">Enthusiastic</SelectItem>
              <SelectItem value="minimal">Minimal</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label className="text-sm font-medium text-slate-700 mb-1">Focus</Label>
          <Select value={focus} onValueChange={setFocus}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="technical">Technical Skills</SelectItem>
              <SelectItem value="leadership">Leadership</SelectItem>
              <SelectItem value="project">Project Delivery</SelectItem>
              <SelectItem value="innovation">Innovation</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <Button
          onClick={handleGenerate}
          disabled={generateMutation.isPending || !resume || !job}
          className="w-full bg-indigo-600 hover:bg-indigo-700"
        >
          <Wand2 className={`w-4 h-4 mr-2 ${generateMutation.isPending ? 'animate-spin' : ''}`} />
          {generateMutation.isPending ? "Generating..." : "Generate Cover Letter"}
        </Button>
      </div>

      {/* Cover Letter Preview */}
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 h-64 overflow-auto mb-4">
        {coverLetter ? (
          <div className="text-sm text-slate-700 leading-relaxed">
            {isEditing ? (
              <Textarea
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
                className="w-full h-full min-h-[200px] resize-none border-none bg-transparent p-0"
              />
            ) : (
              <pre className="whitespace-pre-wrap font-sans">{coverLetter.content}</pre>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-slate-500">
            <div className="text-center">
              <Wand2 className="w-12 h-12 mx-auto mb-2 text-slate-300" />
              <p className="text-sm">Generate a cover letter to see the preview</p>
            </div>
          </div>
        )}
      </div>

      {/* Export Options */}
      <div className="space-y-2">
        <Button
          variant="outline"
          className="w-full"
          onClick={handleEditToggle}
          disabled={!coverLetter}
        >
          <Edit className="w-4 h-4 mr-2" />
          {isEditing ? "Save Changes" : "Edit Cover Letter"}
        </Button>
        
        <Button
          onClick={handleExport}
          disabled={exportMutation.isPending || !coverLetter}
          className="w-full bg-green-600 hover:bg-green-700"
        >
          <Download className={`w-4 h-4 mr-2 ${exportMutation.isPending ? 'animate-spin' : ''}`} />
          {exportMutation.isPending ? "Creating Package..." : "Export Application Package"}
        </Button>
      </div>
    </div>
  );
}
