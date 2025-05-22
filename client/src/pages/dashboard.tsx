import { useState } from "react";
import Sidebar from "@/components/sidebar";
import ResumeEditor from "@/components/resume-editor";
import JobAnalyzer from "@/components/job-analyzer";
import MatchScorer from "@/components/match-scorer";
import CoverLetterGenerator from "@/components/cover-letter-generator";
import ResumePreview from "@/components/resume-preview";
import ResumeSelector from "@/components/resume-selector";
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
        <header className="bg-white dark:bg-gray-900 border-b border-slate-200 dark:border-gray-700 px-4 lg:px-6 py-4">
          {/* Mobile Layout */}
          <div className="flex flex-col space-y-4 lg:hidden">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white truncate">Resume Builder</h2>
                <p className="text-xs text-slate-600 dark:text-gray-300">Build & match resumes</p>
              </div>
              <Button variant="ghost" size="sm">
                <Bell className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="flex items-center justify-between space-x-2">
              {/* Theme Selector - Mobile */}
              <div className="flex items-center space-x-2 flex-1">
                <label className="text-xs font-medium text-slate-700 dark:text-gray-300 whitespace-nowrap">
                  Theme:
                </label>
                <select 
                  value={selectedTheme} 
                  onChange={(e) => setSelectedTheme(e.target.value)}
                  className="flex-1 px-2 py-1 border border-slate-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-slate-900 dark:text-white text-xs"
                >
                  <option value="modern">Modern</option>
                  <option value="james-clark">James Clark</option>
                  <option value="classic">Classic</option>
                  <option value="minimal">Minimal</option>
                </select>
              </div>
              
              <Button 
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 text-xs px-3"
                onClick={() => {
                  if (selectedResume) {
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
                <Plus className="w-3 h-3 mr-1" />
                Preview
              </Button>
            </div>
          </div>

          {/* Desktop Layout */}
          <div className="hidden lg:flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Resume Builder & Job Matcher</h2>
              <p className="text-base text-slate-600 dark:text-gray-300">Upload your resume and find the perfect job match</p>
            </div>
            <div className="flex items-center space-x-4">
              {/* Theme Selector - Desktop */}
              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium text-slate-700 dark:text-gray-300">
                  Theme:
                </label>
                <select 
                  value={selectedTheme} 
                  onChange={(e) => setSelectedTheme(e.target.value)}
                  className="px-3 py-2 border border-slate-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-slate-900 dark:text-white text-sm"
                >
                  <option value="modern">Modern</option>
                  <option value="james-clark">James Clark Professional</option>
                  <option value="classic">Classic</option>
                  <option value="minimal">Minimal</option>
                </select>
              </div>
              
              <Button 
                className="bg-blue-600 hover:bg-blue-700"
                onClick={() => {
                  if (selectedResume) {
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
          </div>
        </header>

        {/* Content Grid */}
        <div className="flex-1 overflow-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 p-4 lg:p-6 min-h-0">
            <div className="min-h-0 overflow-hidden">
              <ResumeEditor 
                selectedResume={selectedResume}
                onResumeSelect={setSelectedResume}
              />
            </div>
            <div className="min-h-0 overflow-hidden">
              <JobAnalyzer 
                selectedJob={selectedJob}
                onJobSelect={setSelectedJob}
              />
            </div>
          </div>

          {/* Resume Selection Section */}
          <div className="bg-slate-100 dark:bg-gray-800 border-t border-slate-200 dark:border-gray-700 p-4 lg:p-6">
            <div className="max-w-4xl mx-auto">
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Select Resume for Preview</h3>
                <p className="text-sm text-slate-600 dark:text-gray-300">Choose which saved resume to display below</p>
              </div>
              
              <ResumeSelector 
                selectedResume={selectedResume}
                onResumeSelect={setSelectedResume}
              />
            </div>
          </div>

          {/* Resume Preview Section */}
          <div 
            id="resume-preview-section" 
            className="bg-white dark:bg-gray-900 border-t border-slate-200 dark:border-gray-700 p-4 lg:p-6 transition-all duration-300"
          >
            <div className="max-w-4xl mx-auto">
              <div className="mb-4 lg:mb-6">
                <h2 className="text-xl lg:text-2xl font-bold text-slate-900 dark:text-white">Resume Preview</h2>
                <p className="text-sm lg:text-base text-slate-600 dark:text-gray-300">See how your resume looks with the selected theme</p>
              </div>

              {/* Preview Container */}
              <div className="bg-slate-50 dark:bg-gray-800 rounded-lg p-3 lg:p-6 border border-slate-200 dark:border-gray-600 overflow-auto">
                <div className="min-w-0">
                  <ResumePreview resume={selectedResume} theme={selectedTheme} />
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Panel */}
          <div className="bg-white dark:bg-gray-900 border-t border-slate-200 dark:border-gray-700 p-4 lg:p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
              <div className="min-w-0">
                <MatchScorer 
                  resume={selectedResume} 
                  job={selectedJob} 
                />
              </div>
              <div className="min-w-0">
                <CoverLetterGenerator 
                  resume={selectedResume} 
                  job={selectedJob} 
                />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
