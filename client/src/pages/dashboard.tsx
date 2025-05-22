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
  const [selectedTheme, setSelectedTheme] = useState<string>("modern");

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-gray-950">
      <Sidebar />
      
      <main className="flex-1 flex flex-col overflow-hidden lg:ml-0 pt-16 lg:pt-0">
        {/* Header */}
        <header className="bg-white dark:bg-gray-900 border-b border-slate-200 dark:border-gray-700 px-4 lg:px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl lg:text-2xl font-bold text-slate-900 dark:text-white">Resume Builder & Job Matcher</h2>
            <p className="text-sm lg:text-base text-slate-600 dark:text-gray-300">Upload your resume and find the perfect job match</p>
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
          <div className="bg-white dark:bg-gray-900 border-t border-slate-200 dark:border-gray-700 p-6">
            {/* Theme Selector */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-2">
                Preview Theme
              </label>
              <select 
                value={selectedTheme} 
                onChange={(e) => setSelectedTheme(e.target.value)}
                className="block w-full max-w-xs px-3 py-2 border border-slate-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-slate-900 dark:text-white"
              >
                <option value="modern">Modern</option>
                <option value="james-clark">James Clark Professional</option>
                <option value="classic">Classic</option>
                <option value="minimal">Minimal</option>
              </select>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <ResumePreview resume={selectedResume} theme={selectedTheme} />
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
