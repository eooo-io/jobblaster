import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { JobPosting, Resume } from "@shared/schema";
import { useMutation } from "@tanstack/react-query";
import { Building, ChartBar, FileText, MapPin } from "lucide-react";
import React, { useState } from "react";

interface JobAnalyzerProps {
  selectedJob: JobPosting | null;
  onJobSelect: (job: JobPosting) => void;
  selectedResume: Resume | null;
}

interface AnalysisResponse {
  skillMatch: number;
  experienceMatch: number;
  overallMatch: number;
}

export default function JobAnalyzer({
  selectedJob,
  onJobSelect,
  selectedResume,
}: JobAnalyzerProps) {
  const { getUIText } = useLanguage();
  const { toast } = useToast();
  const [scores, setScores] = useState<{
    skillMatch: number;
    experienceMatch: number;
    overallMatch: number;
  }>({
    skillMatch: 0,
    experienceMatch: 0,
    overallMatch: 0,
  });

  const analyzeMutation = useMutation({
    mutationFn: async (): Promise<AnalysisResponse | null> => {
      if (!selectedJob || !selectedResume) return null;
      const response = await apiRequest("POST", "/api/match-score", {
        method: "POST",
        body: JSON.stringify({
          jobId: selectedJob.id,
          resumeId: selectedResume.id,
        }),
      });
      const data = await response.json();
      return data;
    },
    onSuccess: (data: AnalysisResponse | null) => {
      if (data) {
        setScores({
          skillMatch: data.skillMatch || 0,
          experienceMatch: data.experienceMatch || 0,
          overallMatch: data.overallMatch || 0,
        });
      }
    },
  });

  React.useEffect(() => {
    if (selectedJob && selectedResume) {
      analyzeMutation.mutate();
    }
  }, [selectedJob?.id, selectedResume?.id]);

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <ChartBar className="w-5 h-5" />
          <span>{getUIText("jobAnalysis")}</span>
        </CardTitle>
        <CardDescription>{getUIText("buildAndMatchResumes")}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden">
        {selectedJob ? (
          <ScrollArea className="h-full">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold">{selectedJob.title}</h3>
                <div className="flex items-center space-x-2 mt-1 text-sm text-gray-600">
                  <Building className="w-4 h-4" />
                  <span>{selectedJob.company}</span>
                </div>
                <div className="flex items-center space-x-2 mt-1 text-sm text-gray-600">
                  <MapPin className="w-4 h-4" />
                  <span>{selectedJob.location}</span>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">{getUIText("matchScoring")}</h4>
                <div className="space-y-2">
                  {selectedResume ? (
                    <>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">{getUIText("resumeBuilder")}</span>
                        <Badge variant="secondary">{scores.skillMatch}%</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">{getUIText("jobAnalysis")}</span>
                        <Badge variant="secondary">{scores.experienceMatch}%</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">{getUIText("matchScoring")}</span>
                        <Badge variant="secondary">{scores.overallMatch}%</Badge>
                      </div>
                    </>
                  ) : (
                    <p className="text-sm text-gray-600">{getUIText("pleaseSelectResume")}</p>
                  )}
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">{getUIText("jobAnalysis")}</h4>
                <div className="prose prose-sm max-w-none dark:prose-invert">
                  <div dangerouslySetInnerHTML={{ __html: selectedJob.description }} />
                </div>
              </div>

              <div className="pt-4">
                <Button
                  className="w-full"
                  disabled={!selectedResume}
                  onClick={() => {
                    if (selectedResume) {
                      toast({
                        title: getUIText("soon"),
                        description: getUIText("pleaseSelectResume"),
                      });
                    }
                  }}
                >
                  <FileText className="w-4 h-4 mr-2" />
                  {getUIText("createNewResume")}
                </Button>
              </div>
            </div>
          </ScrollArea>
        ) : (
          <div className="h-full flex items-center justify-center">
            <p className="text-sm text-gray-600">{getUIText("noResumeSelected")}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
