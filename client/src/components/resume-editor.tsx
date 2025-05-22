import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

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
        theme: selectedResume.theme,
      });
    }
  };

  const handleSaveResume = () => {
    if (!jsonContent) return;
    
    try {
      // Basic JSON validation
      const parsedJson = typeof jsonContent === 'string' ? JSON.parse(jsonContent) : jsonContent;
      
      // Check for basic JSON Resume schema structure
      if (!parsedJson.basics && !parsedJson.work && !parsedJson.skills) {
        toast({
          title: "Invalid Resume Format",
          description: "Please ensure your JSON follows the JSON Resume Schema format with at least basics, work, or skills sections.",
          variant: "destructive",
        });
        return;
      }

      const resumeName = parsedJson.basics?.name || `Resume ${new Date().toLocaleDateString()}`;
      
      uploadMutation.mutate({
        name: resumeName,
        jsonData: parsedJson,
        theme: "modern",
      });
    } catch (error) {
      toast({
        title: "Invalid JSON",
        description: "Please check your JSON syntax. Make sure it's properly formatted.",
        variant: "destructive",
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

  const handleDeleteResume = async (resumeId: number) => {
    if (!confirm("Are you sure you want to delete this resume? This action cannot be undone.")) {
      return;
    }

    try {
      await apiRequest(`/api/resumes/${resumeId}`, {
        method: "DELETE",
      });
      
      queryClient.invalidateQueries({ queryKey: ["/api/resumes"] });
      
      // If we deleted the currently selected resume, clear the selection
      if (selectedResume?.id === resumeId) {
        onResumeSelect(null as any);
        setJsonContent(null);
      }
      
      toast({
        title: "Resume deleted",
        description: "The resume has been successfully deleted.",
      });
    } catch (error) {
      toast({
        title: "Delete failed",
        description: "There was an error deleting the resume. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleCreateNewResume = () => {
    // Clear current selection and JSON content to start fresh
    onResumeSelect(null as any);
    setJsonContent({
      basics: {
        name: "",
        label: "",
        email: "",
        phone: "",
        summary: ""
      },
      work: [],
      education: [],
      skills: [],
      projects: []
    });
    
    toast({
      title: "New resume started",
      description: "Fill in the JSON editor and click 'Save Resume' to create your new resume.",
    });
  };

  return (
    <Card className="bg-white rounded-xl border border-slate-200 flex flex-col h-full">
      <CardHeader className="border-b border-slate-200">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-slate-900">Resume Editor</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDownloadPDF}
            disabled={!selectedResume}
            className="ml-auto"
          >
            <Download className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0">
        {/* Upload Section */}
        <div className="p-6 border-b border-slate-200 dark:border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* File Upload */}
            <div className="border-2 border-dashed border-slate-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-blue-600 transition-colors">
              <div className="w-10 h-10 bg-blue-600/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                <CloudUpload className="text-blue-600 text-lg" />
              </div>
              <h4 className="text-base font-medium text-slate-900 dark:text-white mb-2">Upload File</h4>
              <p className="text-sm text-slate-600 dark:text-gray-300 mb-3">Drop your resume.json file here</p>
              <label htmlFor="resume-upload">
                <Button className="bg-blue-600 hover:bg-blue-700" size="sm" asChild>
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
            </div>

            {/* Save Resume */}
            <div className="border-2 border-dashed border-green-300 dark:border-green-600 rounded-lg p-6 text-center hover:border-green-600 transition-colors">
              <div className="w-10 h-10 bg-green-600/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                <RefreshCw className="text-green-600 text-lg" />
              </div>
              <h4 className="text-base font-medium text-slate-900 dark:text-white mb-2">Save Resume</h4>
              <p className="text-sm text-slate-600 dark:text-gray-300 mb-3">Validate and save your JSON</p>
              <Button
                className="bg-green-600 hover:bg-green-700"
                size="sm"
                disabled={!jsonContent || uploadMutation.isPending}
                onClick={handleSaveResume}
              >
                {uploadMutation.isPending ? "Saving..." : "Save & Validate"}
              </Button>
            </div>
          </div>
          <p className="text-xs text-slate-500 dark:text-gray-400 mt-3 text-center">Supports JSON Resume Schema format</p>
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

          {/* Saved Resumes CRUD Section */}
          <div className="border-t border-slate-200 bg-slate-50 dark:bg-gray-800 dark:border-gray-600">
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">JSON Resumes</h3>
                <Button
                  onClick={handleCreateNewResume}
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <CloudUpload className="w-4 h-4 mr-2" />
                  New Resume
                </Button>
              </div>
              
              {/* Resume List */}
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {console.log('Resumes data:', resumes)}
                {Array.isArray(resumes) && resumes.length > 0 ? (
                  resumes.map((resume: any) => (
                    <div 
                      key={resume.id}
                      className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all ${
                        selectedResume?.id === resume.id 
                          ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700 shadow-sm' 
                          : 'bg-white dark:bg-gray-700 border-slate-200 dark:border-gray-600 hover:bg-slate-50 dark:hover:bg-gray-600'
                      }`}
                      onClick={() => onResumeSelect(resume)}
                    >
                      <div className="flex-1">
                        <h4 className="font-medium text-slate-900 dark:text-white">{resume.name || 'Untitled Resume'}</h4>
                        <p className="text-sm text-slate-500 dark:text-gray-400">
                          Theme: {resume.theme || 'modern'} • Created: {resume.createdAt ? new Date(resume.createdAt).toLocaleDateString() : 'Unknown'}
                        </p>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            onResumeSelect(resume);
                            setJsonContent(resume.jsonData);
                          }}
                          className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteResume(resume.id);
                          }}
                          className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-slate-500 dark:text-gray-400">
                    <p>No saved resumes yet.</p>
                    <p className="text-sm">Upload a file or paste JSON above to create your first resume.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
