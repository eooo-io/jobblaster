import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Template } from "@shared/schema";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";

export default function TemplatesPage() {
  const { toast } = useToast();
  const [newTemplate, setNewTemplate] = useState<Partial<Template>>({
    name: "",
    content: "",
    type: "cover_letter",
  });

  const { data: templates, refetch } = useQuery<Template[]>({
    queryKey: ["/api/templates"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/templates");
      return response.json();
    },
  });

  const createMutation = useMutation({
    mutationFn: async (template: Partial<Template>) => {
      const response = await apiRequest("POST", "/api/templates", template);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Template created",
        description: "The template was created successfully.",
      });
      refetch();
      setNewTemplate({
        name: "",
        content: "",
        type: "cover_letter",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create template.",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (template: Template) => {
      const response = await apiRequest("PUT", `/api/templates/${template.id}`, template);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Template updated",
        description: "The template was updated successfully.",
      });
      refetch();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update template.",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/templates/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "Template deleted",
        description: "The template was deleted successfully.",
      });
      refetch();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete template.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(newTemplate);
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-8">Templates</h1>

      {/* Add New Template */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Add New Template</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <Input
                value={newTemplate.name}
                onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
                placeholder="Enter template name"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Type</label>
              <select
                value={newTemplate.type}
                onChange={(e) =>
                  setNewTemplate({ ...newTemplate, type: e.target.value as Template["type"] })
                }
                className="w-full rounded-md border border-gray-300 px-3 py-2"
                required
              >
                <option value="cover_letter">Cover Letter</option>
                <option value="resume">Resume</option>
                <option value="email">Email</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Content</label>
              <Textarea
                value={newTemplate.content}
                onChange={(e) => setNewTemplate({ ...newTemplate, content: e.target.value })}
                placeholder="Enter template content"
                rows={10}
                required
              />
            </div>
            <Button type="submit" disabled={createMutation.isPending} className="w-full">
              {createMutation.isPending ? "Creating..." : "Create Template"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Existing Templates */}
      <div className="grid gap-4 md:grid-cols-2">
        {templates?.map((template) => (
          <Card key={template.id}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{template.name}</span>
                <span className="text-sm text-gray-500">{template.type}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="whitespace-pre-wrap text-sm bg-gray-50 p-4 rounded-md mb-4">
                {template.content}
              </pre>
              <div className="flex justify-end space-x-2">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => deleteMutation.mutate(template.id)}
                  disabled={deleteMutation.isPending}
                >
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
