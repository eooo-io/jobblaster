import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { ExternalLog } from "@shared/schema";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

export default function ExternalLogsPage() {
  const { toast } = useToast();
  const [filter, setFilter] = useState("");

  const { data: logs, refetch } = useQuery<ExternalLog[]>({
    queryKey: ["/api/external-logs", filter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filter) params.append("filter", filter);
      const response = await apiRequest("GET", `/api/external-logs?${params.toString()}`);
      return response.json();
    },
  });

  const clearLogs = async () => {
    try {
      await apiRequest("DELETE", "/api/external-logs");
      toast({
        title: "Logs cleared",
        description: "All external logs have been cleared.",
      });
      refetch();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to clear logs.",
        variant: "destructive",
      });
    }
  };

  const getLogLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case "error":
        return "text-red-600 bg-red-50";
      case "warn":
        return "text-yellow-600 bg-yellow-50";
      case "info":
        return "text-blue-600 bg-blue-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">External Logs</h1>
        <div className="flex items-center space-x-4">
          <Input
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Filter logs..."
            className="w-64"
          />
          <Button variant="destructive" onClick={clearLogs} className="whitespace-nowrap">
            Clear All Logs
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {logs?.map((log) => (
          <Card key={log.id}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="text-lg">{log.source}</span>
                <span className={`px-2 py-1 rounded-full text-sm ${getLogLevelColor(log.level)}`}>
                  {log.level}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm text-gray-500">{formatTimestamp(log.timestamp)}</p>
                <pre className="whitespace-pre-wrap text-sm bg-gray-50 p-4 rounded-md">
                  {log.message}
                </pre>
                {log.metadata && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium mb-2">Metadata</h4>
                    <pre className="text-xs bg-gray-50 p-2 rounded-md">
                      {JSON.stringify(log.metadata, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}

        {(!logs || logs.length === 0) && (
          <div className="text-center py-8 text-gray-500">
            No logs found. {filter && "Try adjusting your filter."}
          </div>
        )}
      </div>
    </div>
  );
}
