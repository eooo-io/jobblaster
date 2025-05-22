import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CloudUpload, Download, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import JsonEditor from "@/components/json-editor";
import { generatePDF } from "@/lib/pdf-generator";
import type { Resume } from "@shared/schema";

interface ResumeEditorProps {
  selectedResume: Resume | null;
  onResumeSelect: (resume: Resume) => void;
}

export default function ResumeEditor({ selectedResume, onResumeSelect }: ResumeEditorProps) {
  const [theme, setTheme] = useState("modern");
  const [jsonContent, setJsonContent] = useState<any>(null);
  const { toast } = useToast();

  const { data: resumes } = useQuery({
    queryKey: ['/api/resumes'],
  });

  const uploadMutation = useMutation({
    mutationFn: async (data: { name: string; jsonData: any; theme: string }) => {
      const response = await apiRequest('POST', '/api/resumes', data);
      return response.json();
    },
    onSuccess: (newResume) => {
      queryClient.invalidateQueries({ queryKey: ['/api/resumes'] });
      onResumeSelect(newResume);
      toast({
        title: "Resume uploaded successfully",
        description: "Your resume has been saved and is ready for analysis.",
      });
    },
    onError: () => {
      toast({
        title: "Upload failed",
        description: "There was an error uploading your resume. Please try again.",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: { id: number; jsonData: any; theme: string }) => {
      const response = await apiRequest('PUT', `/api/resumes/${data.id}`, {
        jsonData: data.jsonData,
        theme: data.theme,
      });
      return response.json();
    },
    onSuccess: (updatedResume) => {
      queryClient.invalidateQueries({ queryKey: ['/api/resumes'] });
      onResumeSelect(updatedResume);
      toast({
        title: "Resume updated",
        description: "Your changes have been saved.",
      });
    },
  });

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target?.result as string);
        setJsonContent(json);
        
        const resumeName = json.basics?.name || "Untitled Resume";
        uploadMutation.mutate({
          name: resumeName,
          jsonData: json,
          theme: theme,
        });
      } catch (error) {
        toast({
          title: "Invalid JSON",
          description: "The uploaded file is not valid JSON. Please check the format.",
          variant: "destructive",
        });
      }
    };
    reader.readAsText(file);
  };

  const handleJsonChange = (newJson: any) => {
    setJsonContent(newJson);
    if (selectedResume) {
      updateMutation.mutate({
        id: selectedResume.id,
        jsonData: newJson,
        theme: theme,
      });
    }
  };

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme);
    if (selectedResume) {
      updateMutation.mutate({
        id: selectedResume.id,
        jsonData: selectedResume.jsonData,
        theme: newTheme,
      });
    }
  };

  const handleDownloadPDF = async () => {
    if (!selectedResume) {
      toast({
        title: "No resume selected",
        description: "Please select a resume to download.",
        variant: "destructive",
      });
      return;
    }

    try {
      await generatePDF(selectedResume.jsonData, selectedResume.theme);
      toast({
        title: "PDF generated",
        description: "Your resume has been downloaded as a PDF.",
      });
    } catch (error) {
      toast({
        title: "PDF generation failed",
        description: "There was an error generating the PDF. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="bg-white rounded-xl border border-slate-200 flex flex-col h-full">
      <CardHeader className="border-b border-slate-200">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-slate-900">Resume Editor</CardTitle>
          <div className="flex items-center space-x-2">
            <Select value={theme} onValueChange={handleThemeChange}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="modern">Modern Theme</SelectItem>
                <SelectItem value="classic">Classic Theme</SelectItem>
                <SelectItem value="creative">Creative Theme</SelectItem>
                <SelectItem value="formal">Formal Theme</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDownloadPDF}
              disabled={!selectedResume}
            >
              <Download className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0">
        {/* Upload Section */}
        <div className="p-6 border-b border-slate-200">
          <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center hover:border-blue-600 transition-colors">
            <div className="w-12 h-12 bg-blue-600/10 rounded-lg flex items-center justify-center mx-auto mb-4">
              <CloudUpload className="text-blue-600 text-xl" />
            </div>
            <h4 className="text-lg font-medium text-slate-900 mb-2">Upload Resume</h4>
            <p className="text-slate-600 mb-4">Drop your resume.json file or click to browse</p>
            <label htmlFor="resume-upload">
              <Button className="bg-blue-600 hover:bg-blue-700" asChild>
                <span>Choose File</span>
              </Button>
            </label>
            <input
              id="resume-upload"
              type="file"
              accept=".json"
              onChange={handleFileUpload}
              className="hidden"
            />
            <p className="text-xs text-slate-500 mt-2">Supports JSON Resume Schema format</p>
          </div>
        </div>

        {/* JSON Editor */}
        <div className="flex-1 p-6">
          <div className="h-full">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-medium text-slate-900">JSON Editor</h4>
              <Button
                variant="ghost"
                size="sm"
                disabled={!jsonContent}
                onClick={() => {
                  if (jsonContent) {
                    handleJsonChange(jsonContent);
                  }
                }}
              >
                <RefreshCw className="w-4 h-4 mr-1" />
                Validate
              </Button>
            </div>
            <JsonEditor
              value={selectedResume?.jsonData || jsonContent}
              onChange={handleJsonChange}
              height="300px"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
