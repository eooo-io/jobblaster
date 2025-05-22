import { useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { RefreshCw, Lightbulb } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Resume, JobPosting, MatchScore } from "@shared/schema";

interface MatchScorerProps {
  resume: Resume | null;
  job: JobPosting | null;
}

export default function MatchScorer({ resume, job }: MatchScorerProps) {
  const [matchScore, setMatchScore] = useState<MatchScore | null>(null);
  const { toast } = useToast();

  const { data: existingScore } = useQuery({
    queryKey: ['/api/match-score', resume?.id, job?.id],
    enabled: !!(resume?.id && job?.id),
  });

  useEffect(() => {
    if (existingScore) {
      setMatchScore(existingScore);
    }
  }, [existingScore]);

  const analyzeMutation = useMutation({
    mutationFn: async () => {
      if (!resume || !job) throw new Error("Resume and job are required");
      
      const response = await apiRequest('POST', '/api/match-score', {
        resumeId: resume.id,
        jobId: job.id,
      });
      return response.json();
    },
    onSuccess: (data) => {
      setMatchScore(data);
      toast({
        title: "Match analysis complete",
        description: "Your resume has been scored against the job requirements.",
      });
    },
    onError: () => {
      toast({
        title: "Analysis failed",
        description: "There was an error analyzing the match. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleAnalyze = () => {
    if (!resume || !job) {
      toast({
        title: "Missing data",
        description: "Please select both a resume and job posting to analyze the match.",
        variant: "destructive",
      });
      return;
    }
    analyzeMutation.mutate();
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "bg-green-500";
    if (score >= 60) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getScoreTextColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className="lg:col-span-1">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-900">Match Score</h3>
        <Button
          onClick={handleAnalyze}
          disabled={analyzeMutation.isPending || !resume || !job}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <RefreshCw className={`w-4 h-4 mr-1 ${analyzeMutation.isPending ? 'animate-spin' : ''}`} />
          {analyzeMutation.isPending ? "Analyzing..." : "Analyze"}
        </Button>
      </div>

      {matchScore ? (
        <>
          {/* Overall Score */}
          <div className="bg-gradient-to-r from-green-50 to-green-25 border border-green-200 rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-900">Overall Match</span>
              <span className={`text-2xl font-bold ${getScoreTextColor(matchScore.overallScore)}`}>
                {matchScore.overallScore}%
              </span>
            </div>
            <Progress 
              value={matchScore.overallScore} 
              className="w-full h-2"
            />
          </div>

          {/* Detailed Breakdown */}
          <div className="space-y-3 mb-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-700">Technical Skills</span>
              <div className="flex items-center space-x-2">
                <Progress 
                  value={matchScore.technicalScore} 
                  className="w-16 h-1.5"
                />
                <span className="text-sm font-medium text-slate-900 w-8">
                  {matchScore.technicalScore}%
                </span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-700">Experience Level</span>
              <div className="flex items-center space-x-2">
                <Progress 
                  value={matchScore.experienceScore} 
                  className="w-16 h-1.5"
                />
                <span className="text-sm font-medium text-slate-900 w-8">
                  {matchScore.experienceScore}%
                </span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-700">Soft Skills</span>
              <div className="flex items-center space-x-2">
                <Progress 
                  value={matchScore.softSkillsScore} 
                  className="w-16 h-1.5"
                />
                <span className="text-sm font-medium text-slate-900 w-8">
                  {matchScore.softSkillsScore}%
                </span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-700">Location Match</span>
              <div className="flex items-center space-x-2">
                <Progress 
                  value={matchScore.locationScore} 
                  className="w-16 h-1.5"
                />
                <span className="text-sm font-medium text-slate-900 w-8">
                  {matchScore.locationScore}%
                </span>
              </div>
            </div>
          </div>

          {/* Recommendations */}
          {matchScore.recommendations && matchScore.recommendations.length > 0 && (
            <div className="p-3 bg-blue-50 rounded-lg">
              <h4 className="text-sm font-medium text-blue-900 mb-2 flex items-center">
                <Lightbulb className="w-4 h-4 mr-1" />
                Recommendations
              </h4>
              <ul className="text-xs text-blue-800 space-y-1">
                {matchScore.recommendations.map((rec, index) => (
                  <li key={index}>• {rec}</li>
                ))}
              </ul>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-8">
          <p className="text-slate-500 mb-4">
            Select a resume and job posting, then click "Analyze" to see the match score.
          </p>
          <div className="bg-slate-100 rounded-lg p-4">
            <div className="text-sm text-slate-600">
              Match analysis will show:
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Overall compatibility score</li>
                <li>Technical skills alignment</li>
                <li>Experience level match</li>
                <li>Soft skills evaluation</li>
                <li>Personalized recommendations</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
