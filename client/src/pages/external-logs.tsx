import { useQuery } from "@tanstack/react-query";
import { Card, CardHeader, CardBody, Typography, Chip, Button } from "@material-tailwind/react";
import { Clock, CheckCircle, XCircle, Activity, Database, ArrowLeft, ChevronDown, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import { Link } from "wouter";
import { useState } from "react";

interface ExternalLog {
  id: number;
  userId: number;
  service: string;
  endpoint: string;
  method: string;
  requestData: any;
  responseStatus: number | null;
  responseData: any;
  responseTime: number | null;
  success: boolean;
  errorMessage: string | null;
  createdAt: string;
}

export default function ExternalLogs() {
  const { data: logs = [], isLoading } = useQuery<ExternalLog[]>({
    queryKey: ["/api/external-logs"],
  });

  const [expandedLogs, setExpandedLogs] = useState<Set<number>>(new Set());
  const [expandedServices, setExpandedServices] = useState<Set<string>>(new Set(["OpenAI", "Adzuna"]));

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="flex items-center space-x-2">
          <Activity className="h-6 w-6 animate-spin text-blue-600" />
          <span className="text-lg text-gray-600 dark:text-gray-300">Loading external API logs...</span>
        </div>
      </div>
    );
  }

  const toggleLogExpansion = (logId: number) => {
    const newExpanded = new Set(expandedLogs);
    if (newExpanded.has(logId)) {
      newExpanded.delete(logId);
    } else {
      newExpanded.add(logId);
    }
    setExpandedLogs(newExpanded);
  };

  const toggleServiceExpansion = (service: string) => {
    const newExpanded = new Set(expandedServices);
    if (newExpanded.has(service)) {
      newExpanded.delete(service);
    } else {
      newExpanded.add(service);
    }
    setExpandedServices(newExpanded);
  };

  const getStatusIcon = (success: boolean) => {
    return success ? (
      <CheckCircle className="h-5 w-5 text-green-600" />
    ) : (
      <XCircle className="h-5 w-5 text-red-600" />
    );
  };

  const getStatusColor = (success: boolean) => {
    return success ? "green" : "red";
  };

  const formatResponseTime = (responseTime: number | null) => {
    if (!responseTime) return "N/A";
    return `${responseTime}ms`;
  };

  const getServiceIcon = (service: string) => {
    switch (service) {
      case "OpenAI":
        return "🤖";
      case "Adzuna":
        return "🔍";
      default:
        return "🔗";
    }
  };

  const getServiceStats = (service: string, serviceLogs: ExternalLog[]) => {
    const total = serviceLogs.length;
    const successful = serviceLogs.filter(log => log.success).length;
    const failed = total - successful;
    return { total, successful, failed };
  };

  // Group logs by service
  const logsByService = logs.reduce((acc, log) => {
    if (!acc[log.service]) {
      acc[log.service] = [];
    }
    acc[log.service].push(log);
    return acc;
  }, {} as Record<string, ExternalLog[]>);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link href="/dashboard">
              <Button variant="outlined" size="sm" className="flex items-center space-x-2">
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Dashboard</span>
              </Button>
            </Link>
            <div className="flex items-center space-x-3">
              <Database className="h-8 w-8 text-blue-600" />
              <div>
                <Typography variant="h4" color="blue-gray">
                  External API Logs
                </Typography>
                <Typography variant="small" color="gray">
                  Monitor all external API calls and their responses
                </Typography>
              </div>
            </div>
          </div>
        </div>

        {/* Services */}
        <div className="space-y-6">
          {Object.keys(logsByService).length === 0 ? (
            <Card className="bg-white dark:bg-gray-800 shadow-sm">
              <CardBody className="text-center py-12">
                <Database className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <Typography variant="h6" color="blue-gray" className="mb-2">
                  No API Logs Found
                </Typography>
                <Typography variant="small" color="gray">
                  External API calls will appear here when they are made.
                </Typography>
              </CardBody>
            </Card>
          ) : (
            Object.entries(logsByService).map(([service, serviceLogs]) => {
              const stats = getServiceStats(service, serviceLogs);
              const isServiceExpanded = expandedServices.has(service);
              
              return (
                <Card key={service} className="bg-white dark:bg-gray-800 shadow-sm">
                  <CardHeader 
                    className="bg-gray-50 dark:bg-gray-700 py-4 px-6 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                    onClick={() => toggleServiceExpansion(service)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-2">
                          {isServiceExpanded ? 
                            <ChevronDown className="h-5 w-5 text-gray-500" /> : 
                            <ChevronRight className="h-5 w-5 text-gray-500" />
                          }
                          <span className="text-2xl">{getServiceIcon(service)}</span>
                        </div>
                        <div>
                          <Typography variant="h6" color="blue-gray">
                            {service} API
                          </Typography>
                          <Typography variant="small" color="gray">
                            {stats.total} total calls • {stats.successful} successful • {stats.failed} failed
                          </Typography>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Chip
                          value={stats.failed === 0 ? "Healthy" : "Issues"}
                          color={stats.failed === 0 ? "green" : "orange"}
                          size="sm"
                        />
                        <div className="text-sm text-gray-500">
                          {stats.successful}/{stats.total} success rate
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  
                  {isServiceExpanded && (
                    <CardBody className="p-0">
                      <div className="space-y-2 p-4">
                        {serviceLogs.map((log) => {
                          const isExpanded = expandedLogs.has(log.id);
                          
                          return (
                            <div key={log.id} className="border border-gray-200 dark:border-gray-600 rounded-lg">
                              <div 
                                className="p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                onClick={() => toggleLogExpansion(log.id)}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-3">
                                    <div className="flex items-center space-x-2">
                                      {isExpanded ? 
                                        <ChevronDown className="h-4 w-4 text-gray-500" /> : 
                                        <ChevronRight className="h-4 w-4 text-gray-500" />
                                      }
                                      {getStatusIcon(log.success)}
                                    </div>
                                    <div>
                                      <Typography variant="small" className="font-semibold" color="blue-gray">
                                        {log.method} {log.endpoint}
                                      </Typography>
                                      <Typography variant="small" color="gray">
                                        {format(new Date(log.createdAt), "MMM dd, HH:mm:ss")} • {formatResponseTime(log.responseTime)}
                                      </Typography>
                                    </div>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <Chip
                                      value={log.responseStatus?.toString() || "N/A"}
                                      color={log.success ? "green" : "red"}
                                      size="sm"
                                    />
                                  </div>
                                </div>
                              </div>
                              
                              {isExpanded && (
                                <div className="border-t border-gray-200 dark:border-gray-600 p-4 bg-gray-50 dark:bg-gray-800">
                                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 text-sm">
                                    {log.errorMessage && (
                                      <div className="lg:col-span-2">
                                        <Typography variant="small" className="font-semibold text-red-600 mb-2">
                                          Error Message
                                        </Typography>
                                        <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded p-3">
                                          <Typography variant="small" className="text-red-700 dark:text-red-300 font-mono">
                                            {log.errorMessage}
                                          </Typography>
                                        </div>
                                      </div>
                                    )}
                                    <div>
                                      <Typography variant="small" className="font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                        Request Data
                                      </Typography>
                                      <pre className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-600 p-3 rounded text-xs overflow-x-auto max-h-40">
                                        {JSON.stringify(log.requestData, null, 2)}
                                      </pre>
                                    </div>
                                    <div>
                                      <Typography variant="small" className="font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                        Response Data
                                      </Typography>
                                      <pre className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-600 p-3 rounded text-xs overflow-x-auto max-h-40">
                                        {JSON.stringify(log.responseData, null, 2)}
                                      </pre>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </CardBody>
                  )}
                </Card>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}