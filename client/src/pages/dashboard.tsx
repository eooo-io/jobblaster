import { useState } from "react";
import Sidebar from "@/components/sidebar";
import ResumeEditor from "@/components/resume-editor";
import JobAnalyzer from "@/components/job-analyzer";
import MatchScorer from "@/components/match-scorer";
import CoverLetterGenerator from "@/components/cover-letter-generator";
import ResumePreview from "@/components/resume-preview";
import { Button } from "@/components/ui/button";
import { Plus, Bell } from "lucide-react";
import type { Resume, JobPosting } from "@shared/schema";

export default function Dashboard() {
  const [selectedResume, setSelectedResume] = useState<Resume | null>(null);
  const [selectedJob, setSelectedJob] = useState<JobPosting | null>(null);

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <Sidebar />
      
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Resume Builder & Job Matcher</h2>
            <p className="text-slate-600">Upload your resume and find the perfect job match</p>
          </div>
          <div className="flex items-center space-x-4">
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              New Project
            </Button>
            <Button variant="ghost" size="sm">
              <Bell className="w-4 h-4" />
            </Button>
          </div>
        </header>

        {/* Content Grid */}
        <div className="flex-1 overflow-hidden">
          <div className="h-full grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
            <ResumeEditor 
              selectedResume={selectedResume}
              onResumeSelect={setSelectedResume}
            />
            <JobAnalyzer 
              selectedJob={selectedJob}
              onJobSelect={setSelectedJob}
            />
          </div>

          {/* Bottom Panel */}
          <div className="bg-white border-t border-slate-200 p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <ResumePreview resume={selectedResume} />
              <MatchScorer 
                resume={selectedResume} 
                job={selectedJob} 
              />
              <CoverLetterGenerator 
                resume={selectedResume} 
                job={selectedJob} 
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
