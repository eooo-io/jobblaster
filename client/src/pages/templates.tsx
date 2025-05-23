import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardHeader, CardBody, Typography, Button, Input, Textarea, Select, Option, Tabs, TabsHeader, TabsBody, Tab, TabPanel } from "@material-tailwind/react";
import { Plus, Edit, Trash2, Save, X, Settings, ArrowLeft, Brain, Cpu, Zap } from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import Sidebar from "@/components/sidebar";

interface Template {
  id: number;
  name: string;
  description: string;
  provider: string;
  category: string;
  systemPrompt: string;
  extractionInstruction: string;
  outputFormat: any;
  temperature: number;
  maxTokens: number;
  model: string;
  isDefault: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const aiProviders = [
  { 
    id: 'openai', 
    name: 'OpenAI', 
    icon: Brain, 
    color: 'green',
    models: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'gpt-3.5-turbo'],
    description: 'GPT models for natural language processing'
  },
  { 
    id: 'anthropic', 
    name: 'Anthropic', 
    icon: Cpu, 
    color: 'orange',
    models: ['claude-3-5-sonnet', 'claude-3-opus', 'claude-3-haiku'],
    description: 'Claude models for advanced reasoning and analysis'
  },
  { 
    id: 'xai', 
    name: 'xAI', 
    icon: Zap, 
    color: 'purple',
    models: ['grok-1', 'grok-1.5'],
    description: 'Grok models for real-time understanding'
  }
];

const defaultTemplate = {
  name: "",
  description: "",
  provider: "openai",
  category: "job_analysis",
  systemPrompt: "You are an AI assistant that extracts structured information from text. Always return only valid JSON.",
  extractionInstruction: "Extract the key information from the following text:\\n\\n{input_text}",
  outputFormat: {},
  temperature: 20, // stored as integer * 100
  maxTokens: 1024,
  model: "gpt-4o",
  isDefault: false,
  isActive: true,
};

export default function Templates() {
  const { toast } = useToast();
  const [isCreating, setIsCreating] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [formData, setFormData] = useState(defaultTemplate);

  const { data: templates = [], isLoading } = useQuery<Template[]>({
    queryKey: ["/api/templates"],
  });

  const createMutation = useMutation({
    mutationFn: async (template: typeof defaultTemplate) => {
      const response = await fetch("/api/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(template),
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to create template");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/templates"] });
      toast({ title: "Template created successfully!" });
      setIsCreating(false);
      setFormData(defaultTemplate);
    },
    onError: () => {
      toast({ title: "Failed to create template", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...template }: Template) => {
      const response = await fetch(`/api/templates/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(template),
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to update template");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/templates"] });
      toast({ title: "Template updated successfully!" });
      setEditingTemplate(null);
    },
    onError: () => {
      toast({ title: "Failed to update template", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/templates/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to delete template");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/templates"] });
      toast({ title: "Template deleted successfully!" });
    },
    onError: () => {
      toast({ title: "Failed to delete template", variant: "destructive" });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingTemplate) {
      updateMutation.mutate({ ...editingTemplate, ...formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (template: Template) => {
    setEditingTemplate(template);
    setFormData({
      name: template.name,
      description: template.description,
      category: template.category,
      systemPrompt: template.systemPrompt,
      extractionInstruction: template.extractionInstruction,
      outputFormat: template.outputFormat,
      temperature: template.temperature,
      maxTokens: template.maxTokens,
    });
  };

  const handleCancel = () => {
    setIsCreating(false);
    setEditingTemplate(null);
    setFormData(defaultTemplate);
  };

  const updateOutputFormat = (value: string) => {
    try {
      const parsed = JSON.parse(value);
      setFormData({ ...formData, outputFormat: parsed });
    } catch (e) {
      // Invalid JSON, but still update the field for editing
      setFormData({ ...formData, outputFormat: value });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="flex items-center space-x-2">
          <Settings className="h-6 w-6 animate-spin text-blue-600" />
          <span className="text-lg text-gray-600 dark:text-gray-300">Loading templates...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-gray-900">
      <Sidebar />
      
      <main className="flex-1 flex flex-col overflow-hidden lg:ml-0 pt-16 lg:pt-0">
        <div className="flex-1 overflow-y-auto p-6 max-w-6xl mx-auto w-full">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <Settings className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                <div>
                  <Typography variant="h4" className="text-gray-900 dark:text-white">
                    AI Prompt Templates
                  </Typography>
                  <Typography variant="small" className="text-gray-600 dark:text-gray-300">
                    Manage your AI prompt templates for job analysis and other AI features
                  </Typography>
                </div>
              </div>
          </div>
          {!isCreating && !editingTemplate && (
            <Button
              onClick={() => setIsCreating(true)}
              className="flex items-center space-x-2"
              color="blue"
            >
              <Plus className="h-4 w-4" />
              <span>New Template</span>
            </Button>
          )}
        </div>

        {/* Create/Edit Form */}
        {(isCreating || editingTemplate) && (
          <Card className="mb-6 bg-white dark:bg-gray-800 shadow-sm">
            <CardHeader className="bg-blue-50 dark:bg-blue-900 py-4">
              <Typography variant="h6" className="text-gray-900 dark:text-white">
                {editingTemplate ? "Edit Template" : "Create New Template"}
              </Typography>
            </CardHeader>
            <CardBody>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <Typography variant="small" className="font-semibold mb-2 text-gray-700 dark:text-gray-300">
                      Template Name
                    </Typography>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Job Analysis Template"
                      required
                      className="dark:text-white dark:bg-gray-700 dark:border-gray-600"
                    />
                  </div>
                  <div>
                    <Typography variant="small" className="font-semibold mb-2 text-gray-700 dark:text-gray-300">
                      Category
                    </Typography>
                    <Select
                      value={formData.category}
                      onChange={(value) => setFormData({ ...formData, category: value || "job_analysis" })}
                      className="dark:text-white dark:bg-gray-700 dark:border-gray-600"
                    >
                      <Option value="job_analysis">Job Analysis</Option>
                      <Option value="resume_analysis">Resume Analysis</Option>
                      <Option value="cover_letter">Cover Letter</Option>
                      <Option value="match_scoring">Match Scoring</Option>
                      <Option value="general">General</Option>
                    </Select>
                  </div>
                </div>

                <div>
                  <Typography variant="small" className="font-semibold mb-2 text-gray-700 dark:text-gray-300">
                    Description
                  </Typography>
                  <Input
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Brief description of what this template does"
                    className="dark:text-white dark:bg-gray-700 dark:border-gray-600"
                  />
                </div>

                <div>
                  <Typography variant="small" className="font-semibold mb-2 text-gray-700 dark:text-gray-300">
                    System Prompt
                  </Typography>
                  <Textarea
                    value={formData.systemPrompt}
                    onChange={(e) => setFormData({ ...formData, systemPrompt: e.target.value })}
                    placeholder="You are an AI assistant that..."
                    rows={4}
                    className="font-mono text-sm dark:text-white dark:bg-gray-700 dark:border-gray-600"
                  />
                </div>

                <div>
                  <Typography variant="small" className="font-semibold mb-2 text-gray-700 dark:text-gray-300">
                    Extraction Instruction
                  </Typography>
                  <Textarea
                    value={formData.extractionInstruction}
                    onChange={(e) => setFormData({ ...formData, extractionInstruction: e.target.value })}
                    placeholder="Extract information from the following text..."
                    rows={6}
                    className="font-mono text-sm dark:text-white dark:bg-gray-700 dark:border-gray-600"
                  />
                  <Typography variant="small" className="mt-1 text-gray-600 dark:text-gray-400">
                    Use {`{{input_text}}`} as a placeholder for dynamic content
                  </Typography>
                </div>

                <div>
                  <Typography variant="small" className="font-semibold mb-2 text-gray-700 dark:text-gray-300">
                    Output Format (JSON)
                  </Typography>
                  <Textarea
                    value={typeof formData.outputFormat === 'string' ? formData.outputFormat : JSON.stringify(formData.outputFormat, null, 2)}
                    onChange={(e) => updateOutputFormat(e.target.value)}
                    placeholder='{"field1": "", "field2": []}'
                    rows={8}
                    className="font-mono text-sm dark:text-white dark:bg-gray-700 dark:border-gray-600"
                  />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <Typography variant="small" className="font-semibold mb-2 text-gray-700 dark:text-gray-300">
                      Temperature (0.0 - 2.0)
                    </Typography>
                    <Input
                      type="number"
                      min="0"
                      max="2"
                      step="0.1"
                      value={formData.temperature}
                      onChange={(e) => setFormData({ ...formData, temperature: parseFloat(e.target.value) })}
                      className="dark:text-white dark:bg-gray-700 dark:border-gray-600"
                    />
                  </div>
                  <div>
                    <Typography variant="small" className="font-semibold mb-2 text-gray-700 dark:text-gray-300">
                      Max Tokens
                    </Typography>
                    <Input
                      type="number"
                      min="1"
                      max="4000"
                      value={formData.maxTokens}
                      onChange={(e) => setFormData({ ...formData, maxTokens: parseInt(e.target.value) })}
                      className="dark:text-white dark:bg-gray-700 dark:border-gray-600"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <Button type="submit" color="blue" className="flex items-center space-x-2">
                    <Save className="h-4 w-4" />
                    <span>{editingTemplate ? "Update" : "Create"} Template</span>
                  </Button>
                  <Button
                    type="button"
                    variant="outlined"
                    onClick={handleCancel}
                    className="flex items-center space-x-2"
                  >
                    <X className="h-4 w-4" />
                    <span>Cancel</span>
                  </Button>
                </div>
              </form>
            </CardBody>
          </Card>
        )}

        {/* Templates List - Organized by Provider */}
        <div className="space-y-6">
          {templates.length === 0 ? (
            <Card className="bg-white dark:bg-gray-800 shadow-sm">
              <CardBody className="text-center py-12">
                <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <Typography variant="h6" color="blue-gray" className="mb-2">
                  No Templates Found
                </Typography>
                <Typography variant="small" color="gray">
                  Create your first AI prompt template to get started.
                </Typography>
              </CardBody>
            </Card>
          ) : (
            <>
              {/* OpenAI Templates */}
              {templates.filter(t => t.provider === 'openai').length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Brain className="h-6 w-6 text-green-600 dark:text-green-400" />
                    <Typography variant="h5" className="text-gray-900 dark:text-white">
                      OpenAI Templates
                    </Typography>
                  </div>
                  {templates.filter(t => t.provider === 'openai').map((template) => (
                    <Card key={template.id} className="bg-white dark:bg-gray-800 shadow-sm">
                      <CardBody className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <Typography variant="h6" className="text-gray-900 dark:text-white">
                                {template.name}
                              </Typography>
                              <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-xs font-medium">
                                OpenAI
                              </span>
                            </div>
                            <Typography variant="small" className="text-gray-600 dark:text-gray-300 mb-4">
                              {template.description}
                            </Typography>
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 text-sm">
                              <div>
                                <Typography variant="small" className="font-semibold text-gray-700 dark:text-gray-300">
                                  Temperature: {template.temperature}
                                </Typography>
                              </div>
                              <div>
                                <Typography variant="small" className="font-semibold text-gray-700 dark:text-gray-300">
                                  Max Tokens: {template.maxTokens}
                                </Typography>
                              </div>
                              <div>
                                <Typography variant="small" className="font-semibold text-gray-700 dark:text-gray-300">
                                  Model: {template.model}
                                </Typography>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2 ml-4">
                            <Button
                              size="sm"
                              variant="outlined"
                              onClick={() => handleEdit(template)}
                              className="flex items-center space-x-1"
                            >
                              <Edit className="h-4 w-4" />
                              <span>Edit</span>
                            </Button>
                            <Button
                              size="sm"
                              color="red"
                              variant="outlined"
                              onClick={() => handleDelete(template.id)}
                              className="flex items-center space-x-1"
                            >
                              <Trash2 className="h-4 w-4" />
                              <span>Delete</span>
                            </Button>
                          </div>
                        </div>
                      </CardBody>
                    </Card>
                  ))}
                </div>
              )}

              {/* Anthropic Templates */}
              {templates.filter(t => t.provider === 'anthropic').length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Brain className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                    <Typography variant="h5" className="text-gray-900 dark:text-white">
                      Anthropic Templates
                    </Typography>
                  </div>
                  {templates.filter(t => t.provider === 'anthropic').map((template) => (
                    <Card key={template.id} className="bg-white dark:bg-gray-800 shadow-sm">
                      <CardBody className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <Typography variant="h6" className="text-gray-900 dark:text-white">
                                {template.name}
                              </Typography>
                              <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-full text-xs font-medium">
                                Anthropic
                              </span>
                            </div>
                            <Typography variant="small" className="text-gray-600 dark:text-gray-300 mb-4">
                              {template.description}
                            </Typography>
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 text-sm">
                              <div>
                                <Typography variant="small" className="font-semibold text-gray-700 dark:text-gray-300">
                                  Temperature: {template.temperature}
                                </Typography>
                              </div>
                              <div>
                                <Typography variant="small" className="font-semibold text-gray-700 dark:text-gray-300">
                                  Max Tokens: {template.maxTokens}
                                </Typography>
                              </div>
                              <div>
                                <Typography variant="small" className="font-semibold text-gray-700 dark:text-gray-300">
                                  Model: {template.model}
                                </Typography>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2 ml-4">
                            <Button
                              size="sm"
                              variant="outlined"
                              onClick={() => handleEdit(template)}
                              className="flex items-center space-x-1"
                            >
                              <Edit className="h-4 w-4" />
                              <span>Edit</span>
                            </Button>
                            <Button
                              size="sm"
                              color="red"
                              variant="outlined"
                              onClick={() => handleDelete(template.id)}
                              className="flex items-center space-x-1"
                            >
                              <Trash2 className="h-4 w-4" />
                              <span>Delete</span>
                            </Button>
                          </div>
                        </div>
                      </CardBody>
                    </Card>
                  ))}
                </div>
              )}

              {/* xAI Templates */}
              {templates.filter(t => t.provider === 'xai').length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Brain className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    <Typography variant="h5" className="text-gray-900 dark:text-white">
                      xAI Templates
                    </Typography>
                  </div>
                  {templates.filter(t => t.provider === 'xai').map((template) => (
                    <Card key={template.id} className="bg-white dark:bg-gray-800 shadow-sm">
                      <CardBody className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <Typography variant="h6" className="text-gray-900 dark:text-white">
                                {template.name}
                              </Typography>
                              <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-xs font-medium">
                                xAI
                              </span>
                            </div>
                            <Typography variant="small" className="text-gray-600 dark:text-gray-300 mb-4">
                              {template.description}
                            </Typography>
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 text-sm">
                              <div>
                                <Typography variant="small" className="font-semibold text-gray-700 dark:text-gray-300">
                                  Temperature: {template.temperature}
                                </Typography>
                              </div>
                              <div>
                                <Typography variant="small" className="font-semibold text-gray-700 dark:text-gray-300">
                                  Max Tokens: {template.maxTokens}
                                </Typography>
                              </div>
                              <div>
                                <Typography variant="small" className="font-semibold text-gray-700 dark:text-gray-300">
                                  Model: {template.model}
                                </Typography>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2 ml-4">
                            <Button
                              size="sm"
                              variant="outlined"
                              onClick={() => handleEdit(template)}
                              className="flex items-center space-x-1"
                            >
                              <Edit className="h-4 w-4" />
                              <span>Edit</span>
                            </Button>
                            <Button
                              size="sm"
                              color="red"
                              variant="outlined"
                              onClick={() => handleDelete(template.id)}
                              className="flex items-center space-x-1"
                            >
                              <Trash2 className="h-4 w-4" />
                              <span>Delete</span>
                            </Button>
                          </div>
                        </div>
                      </CardBody>
                    </Card>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
        </div>
      </main>
    </div>
  );
}