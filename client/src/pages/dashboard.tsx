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
            <Button 
              className="bg-blue-600 hover:bg-blue-700"
              onClick={() => {
                if (selectedResume) {
                  // Show preview modal or expand preview section
                  const previewSection = document.getElementById('resume-preview-section');
                  if (previewSection) {
                    previewSection.scrollIntoView({ behavior: 'smooth' });
                    previewSection.classList.add('ring-2', 'ring-blue-500', 'ring-opacity-50');
                    setTimeout(() => {
                      previewSection.classList.remove('ring-2', 'ring-blue-500', 'ring-opacity-50');
                    }, 2000);
                  }
                } else {
                  alert('Please select a resume first to preview!');
                }
              }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Preview Resume
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

          {/* Resume Preview Section */}
          <div 
            id="resume-preview-section" 
            className="bg-white dark:bg-gray-900 border-t border-slate-200 dark:border-gray-700 p-6 transition-all duration-300"
          >
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Resume Preview</h2>
                  <p className="text-slate-600 dark:text-gray-300">See how your resume looks in different themes</p>
                </div>
                
                {/* Theme Selector */}
                <div className="flex items-center space-x-4">
                  <label className="text-sm font-medium text-slate-700 dark:text-gray-300">
                    Theme:
                  </label>
                  <select 
                    value={selectedTheme} 
                    onChange={(e) => setSelectedTheme(e.target.value)}
                    className="px-3 py-2 border border-slate-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-slate-900 dark:text-white"
                  >
                    <option value="modern">Modern</option>
                    <option value="james-clark">James Clark Professional</option>
                    <option value="classic">Classic</option>
                    <option value="minimal">Minimal</option>
                  </select>
                </div>
              </div>

              {/* Large Preview */}
              <div className="bg-slate-50 dark:bg-gray-800 rounded-lg p-6 border border-slate-200 dark:border-gray-600">
                <ResumePreview resume={selectedResume} theme={selectedTheme} />
              </div>
            </div>
          </div>

          {/* Bottom Panel */}
          <div className="bg-white dark:bg-gray-900 border-t border-slate-200 dark:border-gray-700 p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
