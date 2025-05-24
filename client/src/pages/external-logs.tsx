import { useQuery } from "@tanstack/react-query";
import { Card, CardHeader, CardBody, Typography, Chip, Button, Select, Option } from "@material-tailwind/react";
import { Clock, CheckCircle, XCircle, Activity, Database, ArrowLeft, ChevronDown, ChevronRight, ChevronLeft } from "lucide-react";
import { format } from "date-fns";
import { Link, useLocation } from "wouter";
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
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [, setLocation] = useLocation();

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

  // Sort logs by creation date (newest first)
  const sortedLogs = [...logs].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  
  // Calculate pagination
  const totalLogs = sortedLogs.length;
  const totalPages = Math.ceil(totalLogs / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedLogs = sortedLogs.slice(startIndex, endIndex);
  
  // Group paginated logs by service
  const logsByService = paginatedLogs.reduce((acc, log) => {
    if (!acc[log.service]) {
      acc[log.service] = [];
    }
    acc[log.service].push(log);
    return acc;
  }, {} as Record<string, ExternalLog[]>);

  const handlePageSizeChange = (value: string) => {
    setPageSize(parseInt(value));
    setCurrentPage(1); // Reset to first page when changing page size
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const renderPaginationButtons = () => {
    const buttons = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    // Adjust start page if we're near the end
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    // Previous button
    buttons.push(
      <Button
        key="prev"
        variant="outlined"
        size="sm"
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="flex items-center space-x-1 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
      >
        <ChevronLeft className="h-4 w-4" />
        <span>Previous</span>
      </Button>
    );

    // Page number buttons
    for (let i = startPage; i <= endPage; i++) {
      buttons.push(
        <Button
          key={i}
          variant={i === currentPage ? "filled" : "outlined"}
          size="sm"
          onClick={() => handlePageChange(i)}
          className={`min-w-[40px] ${
            i === currentPage 
              ? "bg-blue-600 border-blue-600 text-white" 
              : "border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
          }`}
        >
          {i}
        </Button>
      );
    }

    // Next button
    buttons.push(
      <Button
        key="next"
        variant="outlined"
        size="sm"
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="flex items-center space-x-1 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
      >
        <span>Next</span>
        <ChevronRight className="h-4 w-4" />
      </Button>
    );

    return buttons;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Button 
              variant="outlined" 
              size="sm" 
              className="flex items-center space-x-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              onClick={() => setLocation('/')}
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Dashboard</span>
            </Button>
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
          {totalLogs > 0 && (
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
              <div className="flex items-center space-x-2">
                <Typography variant="small" color="gray" className="whitespace-nowrap">
                  Show:
                </Typography>
                <div className="w-16 sm:w-20">
                  <select
                    value={pageSize}
                    onChange={(e) => handlePageSizeChange(e.target.value)}
                    className="w-full px-2 sm:px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="5">5</option>
                    <option value="10">10</option>
                    <option value="25">25</option>
                    <option value="50">50</option>
                    <option value="100">100</option>
                  </select>
                </div>
              </div>
              <Typography variant="small" color="gray" className="text-xs sm:text-sm whitespace-nowrap">
                {startIndex + 1}-{Math.min(endIndex, totalLogs)} of {totalLogs} logs
              </Typography>
            </div>
          )}
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
                          <Typography variant="h6" className="text-gray-900 dark:text-white">
                            {service} API
                          </Typography>
                          <Typography variant="small" className="text-gray-600 dark:text-gray-400">
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
                                className="p-2.5 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                onClick={() => toggleLogExpansion(log.id)}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-2">
                                    <div className="flex items-center space-x-1.5">
                                      {isExpanded ? 
                                        <ChevronDown className="h-3.5 w-3.5 text-gray-500" /> : 
                                        <ChevronRight className="h-3.5 w-3.5 text-gray-500" />
                                      }
                                      {getStatusIcon(log.success)}
                                    </div>
                                    <div>
                                      <Typography variant="small" className="font-semibold text-gray-900 dark:text-white text-sm">
                                        {log.method} {log.endpoint}
                                      </Typography>
                                      <Typography variant="small" className="text-gray-600 dark:text-gray-400 text-xs">
                                        {format(new Date(log.createdAt), "MMM dd, HH:mm:ss")} • {formatResponseTime(log.responseTime)}
                                      </Typography>
                                    </div>
                                  </div>
                                  <div className="flex items-center space-x-1.5">
                                    <Chip
                                      value={log.responseStatus?.toString() || "N/A"}
                                      color={log.success ? "green" : "red"}
                                      size="sm"
                                    />
                                  </div>
                                </div>
                              </div>
                              
                              {isExpanded && (
                                <div className="border-t border-gray-200 dark:border-gray-600 p-2.5 bg-gray-50 dark:bg-gray-800">
                                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-2.5 text-sm">
                                    {log.errorMessage && (
                                      <div className="lg:col-span-2">
                                        <Typography variant="small" className="font-semibold text-red-600 mb-1.5 text-xs">
                                          Error Message
                                        </Typography>
                                        <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded p-2">
                                          <Typography variant="small" className="text-red-700 dark:text-red-300 font-mono text-xs">
                                            {log.errorMessage}
                                          </Typography>
                                        </div>
                                      </div>
                                    )}
                                    <div>
                                      <Typography variant="small" className="font-semibold text-gray-700 dark:text-gray-300 mb-1.5 text-xs">
                                        Request Data
                                      </Typography>
                                      <pre className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-600 p-2 rounded text-xs overflow-x-auto max-h-32 text-gray-900 dark:text-gray-100">
                                        {JSON.stringify(log.requestData, null, 2)}
                                      </pre>
                                    </div>
                                    <div>
                                      <Typography variant="small" className="font-semibold text-gray-700 dark:text-gray-300 mb-1.5 text-xs">
                                        Response Data
                                      </Typography>
                                      <pre className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-600 p-2 rounded text-xs overflow-x-auto max-h-32 text-gray-900 dark:text-gray-100">
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

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <Typography variant="small" className="text-gray-600 dark:text-gray-400 text-center sm:text-left">
              Showing {startIndex + 1}-{Math.min(endIndex, totalLogs)} of {totalLogs} logs
            </Typography>
            <div className="flex items-center space-x-1 sm:space-x-2 overflow-x-auto">
              {renderPaginationButtons()}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}