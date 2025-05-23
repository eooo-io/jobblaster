import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Card,
  CardBody,
  Typography,
  Button,
  Alert,
} from "@material-tailwind/react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Save, Settings, Brain, AlertCircle } from "lucide-react";
import Sidebar from "@/components/sidebar";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface Template {
  id: number;
  name: string;
  description: string;
  provider: string;
  category: string;
  model: string;
}

interface TemplateAssignment {
  category: string;
  templateId: number | null;
  template?: Template;
}

const CATEGORIES = [
  { id: "job_analysis", name: "Job Analysis", description: "Analyzing job descriptions and extracting requirements" },
  { id: "resume_analysis", name: "Resume Analysis", description: "Parsing and analyzing resume content" },
  { id: "cover_letter", name: "Cover Letter", description: "Generating personalized cover letters" },
  { id: "match_scoring", name: "Match Scoring", description: "Calculating compatibility between resumes and jobs" },
  { id: "general", name: "General", description: "General purpose AI operations" }
];

export default function AssignedTemplates() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [assignments, setAssignments] = useState<TemplateAssignment[]>([]);

  // Fetch all templates
  const { data: templates = [], isLoading: templatesLoading } = useQuery({
    queryKey: ["/api/templates"],
  });

  // Fetch current template assignments
  const { data: currentAssignments = [], isLoading: assignmentsLoading } = useQuery({
    queryKey: ["/api/template-assignments"],
    onSuccess: (data) => {
      setAssignments(data);
    }
  });

  // Initialize assignments when data loads
  useState(() => {
    if (currentAssignments.length > 0 && templates.length > 0) {
      // Match saved assignments with full template data
      const enrichedAssignments = CATEGORIES.map(cat => {
        const savedAssignment = currentAssignments.find(a => a.category === cat.id);
        if (savedAssignment && savedAssignment.templateId) {
          const template = templates.find(t => t.id === savedAssignment.templateId);
          return {
            category: cat.id,
            templateId: savedAssignment.templateId,
            template: template
          };
        }
        return {
          category: cat.id,
          templateId: null,
          template: undefined
        };
      });
      setAssignments(enrichedAssignments);
    } else {
      // Initialize with empty assignments for all categories
      setAssignments(CATEGORIES.map(cat => ({
        category: cat.id,
        templateId: null,
        template: undefined
      })));
    }
  }, [currentAssignments, templates]);

  // Save template assignments
  const saveAssignmentsMutation = useMutation({
    mutationFn: async (assignmentData: TemplateAssignment[]) => {
      return apiRequest("POST", "/api/template-assignments", assignmentData);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Template assignments saved successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/template-assignments"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to save template assignments",
        variant: "destructive",
      });
    },
  });

  const handleAssignmentChange = (category: string, templateId: string | undefined) => {
    const selectedTemplate = templates.find((t: Template) => t.id === Number(templateId));
    
    setAssignments(prev => prev.map(assignment => 
      assignment.category === category 
        ? { 
            ...assignment, 
            templateId: templateId ? Number(templateId) : null,
            template: selectedTemplate 
          }
        : assignment
    ));
  };

  const handleSave = () => {
    saveAssignmentsMutation.mutate(assignments);
  };

  const getProviderColor = (provider: string) => {
    switch (provider) {
      case 'openai': return 'text-green-600 dark:text-green-400';
      case 'anthropic': return 'text-purple-600 dark:text-purple-400';
      case 'xai': return 'text-blue-600 dark:text-blue-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getProviderBadgeColor = (provider: string) => {
    switch (provider) {
      case 'openai': return 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200';
      case 'anthropic': return 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200';
      case 'xai': return 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200';
      default: return 'bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200';
    }
  };

  if (templatesLoading || assignmentsLoading) {
    return (
      <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
        <Sidebar />
        <main className="flex-1 overflow-y-auto">
          <div className="p-6">
            <div className="flex items-center space-x-3 mb-8">
              <Settings className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              <Typography variant="h4" className="text-gray-900 dark:text-white">
                Assigned Templates
              </Typography>
            </div>
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
              <div className="space-y-3">
                <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-3">
              <Settings className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              <div>
                <Typography variant="h4" className="text-gray-900 dark:text-white">
                  Assigned Templates
                </Typography>
                <Typography variant="small" className="text-gray-600 dark:text-gray-400 mt-1">
                  Configure which AI template to use for each operation category
                </Typography>
              </div>
            </div>
            <Button
              onClick={handleSave}
              disabled={saveAssignmentsMutation.isPending}
              className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              <Save className="h-4 w-4" />
              <span>{saveAssignmentsMutation.isPending ? "Saving..." : "Save Assignments"}</span>
            </Button>
          </div>

          {templates.length === 0 && (
            <Alert
              icon={<AlertCircle className="h-4 w-4" />}
              className="mb-6 bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800"
            >
              <Typography variant="small" className="text-yellow-800 dark:text-yellow-200">
                No templates found. Create some AI templates first before assigning them to categories.
              </Typography>
            </Alert>
          )}

          <div className="space-y-6">
            {CATEGORIES.map((category) => {
              const assignment = assignments.find(a => a.category === category.id);
              const selectedTemplate = assignment?.template;

              return (
                <Card key={category.id} className="bg-white dark:bg-gray-800 shadow-sm">
                  <CardBody className="p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                      <div>
                        <Typography variant="h6" className="text-gray-900 dark:text-white mb-2">
                          {category.name}
                        </Typography>
                        <Typography variant="small" className="text-gray-600 dark:text-gray-400">
                          {category.description}
                        </Typography>
                      </div>

                      <div>
                        <Typography variant="small" className="font-semibold mb-2 text-gray-700 dark:text-gray-300">
                          Assigned Template
                        </Typography>
                        <Select
                          value={assignment?.templateId?.toString() || "none"}
                          onValueChange={(value) => handleAssignmentChange(category.id, value === "none" ? "" : value)}
                        >
                          <SelectTrigger className="w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600">
                            <SelectValue placeholder="No template assigned" />
                          </SelectTrigger>
                          <SelectContent className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600">
                            <SelectItem value="none" className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-600">
                              No template assigned
                            </SelectItem>
                            {templates
                              .filter((template: Template) => template.category === category.id || template.category === 'general')
                              .map((template: Template) => (
                                <SelectItem 
                                  key={template.id} 
                                  value={template.id.toString()}
                                  className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-600"
                                >
                                  {template.name} ({template.provider.toUpperCase()})
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        {selectedTemplate && (
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2 mb-3">
                              <div className="flex items-center space-x-1 px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-xs font-medium">
                                <span className="w-2 h-2 bg-green-600 rounded-full"></span>
                                <span>Selected</span>
                              </div>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getProviderBadgeColor(selectedTemplate.provider)}`}>
                                {selectedTemplate.provider.toUpperCase()}
                              </span>
                            </div>
                            <Typography variant="small" className="font-medium text-gray-900 dark:text-white">
                              {selectedTemplate.name}
                            </Typography>
                            <Typography variant="small" className="text-gray-600 dark:text-gray-400">
                              Model: {selectedTemplate.model}
                            </Typography>
                            <Typography variant="small" className="text-gray-500 dark:text-gray-500">
                              {selectedTemplate.description}
                            </Typography>
                          </div>
                        )}
                        {!selectedTemplate && (
                          <div className="text-center py-4">
                            <AlertCircle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                            <Typography variant="small" className="text-gray-500 dark:text-gray-500">
                              No template assigned
                            </Typography>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardBody>
                </Card>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}