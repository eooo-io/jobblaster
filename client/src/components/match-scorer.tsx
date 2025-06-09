import type { MatchScore } from "@shared/schema";
import { useState } from "react";

type ScoreCategory = "technicalScore" | "experienceScore" | "softSkillsScore" | "locationScore";

interface MatchScorerProps {
  initialScore?: MatchScore | null;
  onScoreChange?: (score: MatchScore) => void;
}

export function MatchScorer({ initialScore = null, onScoreChange }: MatchScorerProps) {
  const [score, setScore] = useState<MatchScore>(
    initialScore ?? {
      id: 0,
      resumeId: null,
      jobId: null,
      overallScore: 0,
      technicalScore: 0,
      experienceScore: 0,
      softSkillsScore: 0,
      locationScore: 0,
      recommendations: [],
      createdAt: new Date(),
    }
  );

  const handleScoreChange = (category: ScoreCategory, value: number) => {
    const newScore = {
      ...score,
      [category]: Math.max(0, Math.min(100, value)),
    };

    // Calculate overall score as weighted average
    const weights: Record<ScoreCategory, number> = {
      technicalScore: 0.3,
      experienceScore: 0.3,
      softSkillsScore: 0.2,
      locationScore: 0.2,
    };

    const weightedSum = Object.entries(weights).reduce((sum, [key, weight]) => {
      return sum + newScore[key as ScoreCategory] * weight;
    }, 0);

    newScore.overallScore = Math.round(weightedSum);

    setScore(newScore);
    onScoreChange?.(newScore);
  };

  const scoreCategories: Record<ScoreCategory, string> = {
    technicalScore: "Technical",
    experienceScore: "Experience",
    softSkillsScore: "Soft Skills",
    locationScore: "Location",
  };

  return (
    <div className="space-y-4">
      {(Object.entries(scoreCategories) as [ScoreCategory, string][]).map(([category, label]) => (
        <div key={category} className="flex items-center gap-4">
          <label className="min-w-[100px]">{label}</label>
          <input
            type="range"
            min="0"
            max="100"
            value={score[category]}
            onChange={(e) => handleScoreChange(category, parseInt(e.target.value))}
            className="flex-1"
          />
          <span className="min-w-[50px] text-right">{score[category]}%</span>
        </div>
      ))}
      <div className="mt-6 flex items-center gap-4 font-semibold">
        <span className="min-w-[100px]">Overall</span>
        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-500 rounded-full"
            style={{ width: `${score.overallScore}%` }}
          />
        </div>
        <span className="min-w-[50px] text-right">{score.overallScore}%</span>
      </div>
    </div>
  );
}
