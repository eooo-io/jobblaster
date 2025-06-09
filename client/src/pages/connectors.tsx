import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { JobConnector } from "@shared/schema";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";

export default function ConnectorsPage() {
  const { toast } = useToast();
  const [newConnector, setNewConnector] = useState<Partial<JobConnector>>({
    name: "",
    url: "",
    enabled: true,
    credentials: {},
  });

  const { data: connectors, refetch } = useQuery<JobConnector[]>({
    queryKey: ["/api/connectors"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/connectors");
      return response.json();
    },
  });

  const createMutation = useMutation({
    mutationFn: async (connector: Partial<JobConnector>) => {
      const response = await apiRequest("POST", "/api/connectors", connector);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Connector created",
        description: "The job connector was created successfully.",
      });
      refetch();
      setNewConnector({
        name: "",
        url: "",
        enabled: true,
        credentials: {},
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create job connector.",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (connector: JobConnector) => {
      const response = await apiRequest("PUT", `/api/connectors/${connector.id}`, connector);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Connector updated",
        description: "The job connector was updated successfully.",
      });
      refetch();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update job connector.",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/connectors/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "Connector deleted",
        description: "The job connector was deleted successfully.",
      });
      refetch();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete job connector.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(newConnector);
  };

  const handleToggle = (connector: JobConnector) => {
    updateMutation.mutate({
      ...connector,
      enabled: !connector.enabled,
    });
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-8">Job Connectors</h1>

      {/* Add New Connector */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Add New Connector</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <Input
                value={newConnector.name}
                onChange={(e) => setNewConnector({ ...newConnector, name: e.target.value })}
                placeholder="Enter connector name"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">URL</label>
              <Input
                value={newConnector.url}
                onChange={(e) => setNewConnector({ ...newConnector, url: e.target.value })}
                placeholder="Enter connector URL"
                required
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                checked={newConnector.enabled}
                onCheckedChange={(checked) =>
                  setNewConnector({ ...newConnector, enabled: checked })
                }
              />
              <label className="text-sm font-medium">Enabled</label>
            </div>
            <Button type="submit" disabled={createMutation.isPending} className="w-full">
              {createMutation.isPending ? "Creating..." : "Create Connector"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Existing Connectors */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {connectors?.map((connector) => (
          <Card key={connector.id}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{connector.name}</span>
                <Switch
                  checked={connector.enabled}
                  onCheckedChange={() => handleToggle(connector)}
                />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500 mb-4">{connector.url}</p>
              <div className="flex justify-end space-x-2">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => deleteMutation.mutate(connector.id)}
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
