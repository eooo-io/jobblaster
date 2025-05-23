import { useQuery } from "@tanstack/react-query";
import { Card, CardHeader, CardBody, Typography, Chip } from "@material-tailwind/react";
import { Clock, CheckCircle, XCircle, Activity, Database } from "lucide-react";
import { format } from "date-fns";

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

  const formatJsonData = (data: any) => {
    if (!data) return "No data";
    try {
      return JSON.stringify(data, null, 2);
    } catch {
      return String(data);
    }
  };

  const getServiceColor = (service: string) => {
    switch (service.toLowerCase()) {
      case 'openai': return 'green';
      case 'adzuna': return 'blue';
      case 'indeed': return 'orange';
      case 'glassdoor': return 'purple';
      default: return 'gray';
    }
  };

  const getStatusColor = (success: boolean) => {
    return success ? 'green' : 'red';
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <Database className="w-6 h-6 text-blue-600" />
          <Typography variant="h4" color="blue-gray">
            External API Logs
          </Typography>
        </div>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardBody>
                <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardBody>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center gap-2 mb-6">
        <Database className="w-6 h-6 text-blue-600" />
        <Typography variant="h4" color="blue-gray">
          External API Logs
        </Typography>
        <Chip
          value={`${logs.length} logs`}
          size="sm"
          color="blue"
          className="ml-auto"
        />
      </div>

      {logs.length === 0 ? (
        <Card>
          <CardBody className="text-center py-12">
            <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <Typography variant="h6" color="blue-gray" className="mb-2">
              No API Logs Yet
            </Typography>
            <Typography variant="small" color="gray" className="mb-4">
              API calls to external services will appear here once you start using features like job search or AI analysis.
            </Typography>
          </CardBody>
        </Card>
      ) : (
        <div className="space-y-4">
          {logs.map((log) => (
            <Card key={log.id} className="overflow-hidden">
              <CardHeader 
                floated={false} 
                shadow={false} 
                className="rounded-none bg-gray-50 dark:bg-gray-800 py-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Chip
                      value={log.service}
                      color={getServiceColor(log.service) as any}
                      size="sm"
                    />
                    <Chip
                      value={log.method}
                      variant="outlined"
                      size="sm"
                    />
                    <Typography variant="small" color="blue-gray" className="font-mono">
                      {log.endpoint}
                    </Typography>
                  </div>
                  <div className="flex items-center gap-2">
                    {log.success ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-500" />
                    )}
                    <Chip
                      value={log.success ? 'Success' : 'Failed'}
                      color={getStatusColor(log.success) as any}
                      size="sm"
                    />
                    <div className="flex items-center gap-1 text-gray-500">
                      <Clock className="w-3 h-3" />
                      <Typography variant="small">
                        {format(new Date(log.createdAt), 'MMM d, HH:mm:ss')}
                      </Typography>
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardBody className="pt-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {/* Request Details */}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Typography variant="small" className="font-semibold text-blue-600">
                        Request
                      </Typography>
                      {log.responseTime && (
                        <Chip
                          value={`${log.responseTime}ms`}
                          size="sm"
                          variant="outlined"
                          color="blue"
                        />
                      )}
                      {log.responseStatus && (
                        <Chip
                          value={`${log.responseStatus}`}
                          size="sm"
                          variant="outlined"
                          color={log.responseStatus < 400 ? "green" : "red"}
                        />
                      )}
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-800 rounded p-3">
                      <pre className="text-xs text-gray-700 dark:text-gray-300 overflow-x-auto">
                        {formatJsonData(log.requestData)}
                      </pre>
                    </div>
                  </div>

                  {/* Response Details */}
                  <div>
                    <Typography variant="small" className="font-semibold text-green-600 mb-2">
                      Response
                    </Typography>
                    <div className="bg-gray-50 dark:bg-gray-800 rounded p-3">
                      <pre className="text-xs text-gray-700 dark:text-gray-300 overflow-x-auto">
                        {log.errorMessage ? (
                          <span className="text-red-600">{log.errorMessage}</span>
                        ) : (
                          formatJsonData(log.responseData)
                        )}
                      </pre>
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}