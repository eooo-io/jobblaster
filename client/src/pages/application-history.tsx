import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Briefcase, Calendar, FileText, MapPin, Building2 } from "lucide-react";

interface JobPosting {
  id: number;
  title: string;
  company: string;
  location: string;
  employmentType: string;
}

interface Resume {
  id: number;
  name: string;
  filename: string;
}

interface CoverLetter {
  id: number;
  content: string;
}

interface Application {
  id: number;
  userId: number;
  resumeId: number;
  jobId: number;
  coverLetterId: number;
  status: string;
  notes: string;

  appliedAt: string;
  createdAt: string;
  jobPosting?: JobPosting;
  resume?: Resume;
  coverLetter?: CoverLetter;
}

export default function ApplicationHistory() {
  const { data: applications = [], isLoading, error } = useQuery<Application[]>({
    queryKey: ["/api/applications"],
  });

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Application History</h1>
        <div className="flex justify-center items-center h-64">
          <div className="text-gray-500">Loading your applications...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Application History</h1>
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-700">Failed to load application history. Please try again.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (applications.length === 0) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Application History</h1>
        <Card>
          <CardContent className="pt-6 text-center">
            <Briefcase className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Applications Yet</h3>
            <p className="text-gray-500">
              Your job applications will appear here once you start applying to positions.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Application History</h1>
        <Badge variant="secondary" className="text-sm">
          {applications.length} Application{applications.length !== 1 ? 's' : ''}
        </Badge>
      </div>

      <div className="space-y-4">
        {applications.map((application) => (
          <Card key={application.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <CardTitle className="text-xl mb-2 flex items-center gap-2">
                    <Briefcase className="h-5 w-5 text-blue-600" />
                    {application.jobPosting?.title || 'Unknown Position'}
                  </CardTitle>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Building2 className="h-4 w-4" />
                      {application.jobPosting?.company || 'Unknown Company'}
                    </div>
                    {application.jobPosting?.location && (
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {application.jobPosting.location}
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {new Date(application.appliedAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge 
                    variant={
                      application.status === 'applied' ? 'default' :
                      application.status === 'interviewed' ? 'secondary' :
                      application.status === 'offered' ? 'default' :
                      application.status === 'rejected' ? 'destructive' :
                      'outline'
                    }
                    className="capitalize"
                  >
                    {application.status}
                  </Badge>
                  {application.jobPosting?.employmentType && (
                    <Badge variant="outline" className="text-xs">
                      {application.jobPosting.employmentType}
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>

            <CardContent className="pt-0">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                {application.resume && (
                  <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                    <FileText className="h-4 w-4 text-gray-600" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {application.resume.name}
                      </p>
                      <p className="text-xs text-gray-500 font-mono">
                        {application.resume.filename}
                      </p>
                    </div>
                  </div>
                )}

                {application.coverLetter && (
                  <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
                    <FileText className="h-4 w-4 text-blue-600" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900">Cover Letter</p>
                      <p className="text-xs text-gray-500 truncate">
                        {application.coverLetter.content.substring(0, 50)}...
                      </p>
                    </div>
                  </div>
                )}


              </div>

              {application.notes && (
                <div className="p-3 bg-yellow-50 border-l-4 border-yellow-200 rounded-r-lg">
                  <p className="text-sm text-gray-700">
                    <span className="font-medium">Notes:</span> {application.notes}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}