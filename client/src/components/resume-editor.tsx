import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

import { CloudUpload, Download, RefreshCw, Edit3, Check, X, ChevronDown, Code } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import JsonEditor from "@/components/json-editor";
import ResumeSelector from "@/components/resume-selector";
import { generatePDF } from "@/lib/pdf-generator";
import type { Resume } from "@shared/schema";
// Remove the problematic import for now

interface ResumeEditorProps {
  selectedResume: Resume | null;
  onResumeSelect: (resume: Resume) => void;
}

export default function ResumeEditor({ selectedResume, onResumeSelect }: ResumeEditorProps) {

  const [jsonContent, setJsonContent] = useState<any>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [newName, setNewName] = useState("");
  const [jsonEditorOpen, setJsonEditorOpen] = useState(true);
  const [uploadedFilename, setUploadedFilename] = useState<string>("");
  const [forceCreateNew, setForceCreateNew] = useState(false);
  const { toast } = useToast();

  // Auto-load selected resume into JSON editor
  useEffect(() => {
    if (selectedResume?.jsonData) {
      console.log("Loading resume into editor:", selectedResume.id);
      setJsonContent(selectedResume.jsonData);
      setUploadedFilename(""); // Clear filename when switching resumes
      setForceCreateNew(false); // Reset force create flag when selecting existing resume
    } else {
      console.log("No resume selected or no jsonData");
    }
  }, [selectedResume]);

  const { data: resumes, isLoading: resumesLoading } = useQuery({
    queryKey: ['/api/resumes'],
  });

  const uploadMutation = useMutation({
    mutationFn: async (data: { name: string; jsonData: any; theme: string }) => {
      const response = await apiRequest('POST', '/api/resumes', data);
      return await response.json();
    },
    onSuccess: (newResume) => {
      queryClient.invalidateQueries({ queryKey: ['/api/resumes'] });
      setJsonContent(newResume.jsonData);
      onResumeSelect(newResume);
      setUploadedFilename('');
      setForceCreateNew(false); // Reset the flag
      toast({
        title: "Resume created successfully",
        description: "Your new resume has been saved and is ready for editing.",
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
      console.log("Starting update mutation for resume ID:", data.id);
      const response = await apiRequest('PUT', `/api/resumes/${data.id}`, {
        jsonData: data.jsonData,
        theme: data.theme,
      });
      const result = await response.json();
      console.log("Update mutation response:", result);
      return result;
    },
    onSuccess: (updatedResume) => {
      console.log("Update mutation onSuccess called:", updatedResume);
      queryClient.invalidateQueries({ queryKey: ['/api/resumes'] });
      // Don't force re-selection - let user maintain their current selection
      toast({
        title: "Resume updated",
        description: "Your changes have been saved.",
      });
    },
    onError: (error) => {
      console.error("Update failed:", error);
      toast({
        title: "Save failed",
        description: "There was an error saving your resume. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Rename mutation
  const renameMutation = useMutation({
    mutationFn: async ({ id, name }: { id: number; name: string }) => {
      const response = await apiRequest('PATCH', `/api/resumes/${id}`, { name });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/resumes'] });
      setEditingId(null);
      toast({
        title: "Resume renamed",
        description: "Your resume name has been updated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Rename failed",
        description: "Failed to rename resume. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Store the uploaded filename
    setUploadedFilename(file.name);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target?.result as string);
        
        // Set flag to force creation of new resume
        setForceCreateNew(true);
        
        // Use filename (without extension) as the resume name, fallback to JSON name
        const resumeName = file.name.replace(/\.json$/, '') || json.basics?.name || "Untitled Resume";
        
        // Create new resume immediately with upload mutation
        uploadMutation.mutate({
          name: resumeName,
          jsonData: json,
          theme: "modern",
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
    // Don't auto-save on every change, only when validate button is clicked
  };

  const handleValidateAndSave = () => {
    if (!jsonContent) {
      toast({
        title: "No content to save",
        description: "Please add some content to your resume before saving.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      // Basic JSON validation
      const parsedJson = typeof jsonContent === 'string' ? JSON.parse(jsonContent) : jsonContent;
      console.log("Parsed JSON for validation:", parsedJson);
      
      // Check for basic JSON Resume schema structure
      if (!parsedJson.basics && !parsedJson.work && !parsedJson.skills) {
        toast({
          title: "Invalid Resume Format",
          description: "Please ensure your JSON follows the JSON Resume Schema format with at least basics, work, or skills sections.",
          variant: "destructive",
        });
        return;
      }

      // Debug logging to see the state
      console.log("Save operation - forceCreateNew:", forceCreateNew, "selectedResume:", selectedResume?.id);
      console.log("JSON content being saved:", parsedJson);
      
      // Determine if we should create or update based on forceCreateNew flag
      if (forceCreateNew || !selectedResume) {
        // Create new resume (either forced or no resume selected)
        console.log("Creating new resume");
        const resumeName = parsedJson.basics?.name || `Resume ${new Date().toLocaleDateString()}`;
        uploadMutation.mutate({
          name: resumeName,
          jsonData: parsedJson,
          theme: "modern",
        });
        setForceCreateNew(false); // Reset flag immediately after starting creation
      } else {
        // Update existing resume
        console.log("Updating existing resume with ID:", selectedResume.id);
        updateMutation.mutate({
          id: selectedResume.id,
          jsonData: parsedJson,
          theme: selectedResume.theme || "modern",
        });
      }
    } catch (error) {
      console.error("JSON validation error:", error);
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
      await generatePDF(selectedResume.jsonData as any, selectedResume.theme);
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
      await apiRequest(`/api/resumes/${resumeId}`, "DELETE");
      
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
    console.log("Creating new resume - clearing selection and setting force flag");
    // Clear current selection completely and force new creation
    onResumeSelect(null as any);
    setUploadedFilename('');
    setForceCreateNew(true);
    
    // Set up basic template structure
    const basicTemplate = {
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
    };
    
    setJsonContent(basicTemplate);
    console.log("New resume template set, forceCreateNew should be true");
    toast({
      title: "New resume started",
      description: "Fill in the JSON editor and click 'Save & Validate' to create your new resume.",
    });
  };

  // Edit handlers for renaming
  const handleStartEdit = (resume: any) => {
    setEditingId(resume.id);
    setNewName(resume.name);
  };

  const handleSaveEdit = () => {
    if (!editingId || !newName.trim()) return;
    renameMutation.mutate({ id: editingId, name: newName.trim() });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setNewName("");
  };

  return (
    <Card className="bg-white dark:bg-gray-800 rounded-xl border border-slate-200 dark:border-gray-600 flex flex-col h-full">
      <CardHeader className="border-b border-slate-200 dark:border-gray-600">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white">Resume Editor</CardTitle>
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
        {/* Resume Selector with Accordions */}
        <div className="p-3 lg:p-6 border-b border-slate-200 dark:border-gray-700">
          <ResumeSelector 
            selectedResume={selectedResume}
            onResumeSelect={onResumeSelect}
            onCreateNew={handleCreateNewResume}
          />
        </div>

        {/* Upload Section */}
        <div className="p-3 lg:p-6 border-b border-slate-200 dark:border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 lg:gap-4">
            {/* File Upload */}
            <div className="border-2 border-dashed border-slate-300 dark:border-gray-600 rounded-lg p-3 lg:p-6 text-center hover:border-blue-600 transition-colors">
              <div className="w-8 h-8 lg:w-10 lg:h-10 bg-blue-600/10 rounded-lg flex items-center justify-center mx-auto mb-2 lg:mb-3">
                <CloudUpload className="text-blue-600 text-sm lg:text-lg" />
              </div>
              <h4 className="text-sm lg:text-base font-medium text-slate-900 dark:text-white mb-1 lg:mb-2">Upload File</h4>
              <p className="text-xs lg:text-sm text-slate-600 dark:text-gray-300 mb-2 lg:mb-3">Drop your resume.json file here</p>
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
              {uploadedFilename && (
                <div className="mt-2 text-xs text-slate-600 dark:text-gray-400">
                  Uploaded: <span className="font-mono bg-slate-100 dark:bg-gray-700 px-1 rounded">{uploadedFilename}</span>
                </div>
              )}
            </div>

            {/* Save Resume */}
            <div className="border-2 border-dashed border-green-300 dark:border-green-600 rounded-lg p-3 lg:p-6 text-center hover:border-green-600 transition-colors">
              <div className="w-8 h-8 lg:w-10 lg:h-10 bg-green-600/10 rounded-lg flex items-center justify-center mx-auto mb-2 lg:mb-3">
                <RefreshCw className="text-green-600 text-sm lg:text-lg" />
              </div>
              <h4 className="text-sm lg:text-base font-medium text-slate-900 dark:text-white mb-1 lg:mb-2">Save Resume</h4>
              <p className="text-xs lg:text-sm text-slate-600 dark:text-gray-300 mb-2 lg:mb-3">Validate and save your JSON</p>
              <Button
                className="bg-green-600 hover:bg-green-700"
                size="sm"
                disabled={!jsonContent || uploadMutation.isPending || updateMutation.isPending}
                onClick={handleValidateAndSave}
              >
                {(uploadMutation.isPending || updateMutation.isPending) ? "Saving..." : "Save & Validate"}
              </Button>
            </div>
          </div>
          <p className="text-xs text-slate-500 dark:text-gray-400 mt-3 text-center">Supports JSON Resume Schema format</p>
        </div>



        {/* JSON Editor Accordion */}
        <div className="flex-1 p-3 lg:p-6 min-h-0">
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg">
            <button 
              onClick={() => setJsonEditorOpen(!jsonEditorOpen)}
              className="w-full flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Code className="h-4 w-4" />
                <span className="font-medium">JSON Editor</span>
              </div>
              <ChevronDown className={`h-4 w-4 transition-transform ${jsonEditorOpen ? 'rotate-180' : ''}`} />
            </button>
            
            {jsonEditorOpen && (
              <div className="p-3 border-t border-gray-200 dark:border-gray-700">
                <div className="h-full flex flex-col">
                  <div className="flex items-center justify-between mb-2 lg:mb-4">
                    <h4 className="font-medium text-slate-900 dark:text-white text-sm lg:text-base">Edit Resume JSON</h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={!jsonContent || uploadMutation.isPending || updateMutation.isPending}
                      onClick={handleValidateAndSave}
                    >
                      <RefreshCw className="w-4 h-4 mr-1" />
                      {(uploadMutation.isPending || updateMutation.isPending) ? "Saving..." : "Validate & Save"}
                    </Button>
                  </div>
                  <div className="flex-1 min-h-0">
                    <JsonEditor
                      value={selectedResume?.jsonData || jsonContent}
                      onChange={handleJsonChange}
                      height="250px"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
