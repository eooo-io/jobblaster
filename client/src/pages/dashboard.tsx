import CoverLetterGenerator from "@/components/cover-letter-generator";
import JobAnalyzer from "@/components/job-analyzer";
import JobSearch from "@/components/job-search";
import { LanguageSwitcher } from "@/components/language-switcher";
import ResumeEditor from "@/components/resume-editor";
import ResumePreview from "@/components/resume-preview";
import Sidebar from "@/components/sidebar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import type { JobPosting, Resume } from "@shared/schema";
import { Bell, Printer } from "lucide-react";
import { useState } from "react";

export default function Dashboard() {
  const { getUIText } = useLanguage();
  const { toast } = useToast();
  const { user } = useAuth();
  const [showPrintPreview, setShowPrintPreview] = useState(false);
  const [selectedResume, setSelectedResume] = useState<Resume | null>(null);
  const [selectedJob, setSelectedJob] = useState<JobPosting | null>(null);
  const [selectedTheme, setSelectedTheme] = useState<string>("modern");
  const [paperFormat, setPaperFormat] = useState<string>("a4");
  const [resumeLanguage, setResumeLanguage] = useState<string>("en");

  const resumeLanguages = [
    { code: "en", name: "English", nativeName: "English" },
    { code: "es", name: "Spanish", nativeName: "Español" },
    { code: "fr", name: "French", nativeName: "Français" },
    { code: "de", name: "German", nativeName: "Deutsch" },
    { code: "it", name: "Italian", nativeName: "Italiano" },
    { code: "pt", name: "Portuguese", nativeName: "Português" },
  ];

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
                <h2 className="text-lg font-bold text-slate-900 dark:text-white truncate">
                  {getUIText("resumeBuilder")}
                </h2>
                <p className="text-xs text-slate-600 dark:text-gray-300">
                  {getUIText("buildAndMatchResumes")}
                </p>
              </div>
              <Button variant="ghost" size="sm">
                <Bell className="w-4 h-4" />
              </Button>
              <LanguageSwitcher />
            </div>
          </div>

          {/* Desktop Layout */}
          <div className="hidden lg:flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                {getUIText("resumeBuilder")}
              </h2>
              <p className="text-base text-slate-600 dark:text-gray-300">
                {getUIText("findPerfectMatch")}
              </p>
            </div>

            <div className="flex items-center space-x-4">
              {/* Theme Selector */}
              <Select value={selectedTheme} onValueChange={setSelectedTheme}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select Theme" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="modern">Modern</SelectItem>
                  <SelectItem value="classic">Classic</SelectItem>
                  <SelectItem value="creative">Creative</SelectItem>
                  <SelectItem value="formal">Formal</SelectItem>
                  <SelectItem value="paper++">Paper++</SelectItem>
                  <SelectItem value="lucide">Lucide</SelectItem>
                  <SelectItem value="clean-de">Clean-DE</SelectItem>
                </SelectContent>
              </Select>

              {/* Resume Language Selector */}
              <Select value={resumeLanguage} onValueChange={setResumeLanguage}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder={getUIText("selectResumeLanguage")} />
                </SelectTrigger>
                <SelectContent>
                  {resumeLanguages.map((lang) => (
                    <SelectItem key={lang.code} value={lang.code}>
                      <span className="flex items-center gap-2">
                        <span>{lang.name}</span>
                        <span className="text-gray-500 text-sm">({lang.nativeName})</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Paper Format Selector */}
              <Select value={paperFormat} onValueChange={setPaperFormat}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder={getUIText("selectPaperFormat")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="a4">A4 (210mm × 297mm)</SelectItem>
                  <SelectItem value="legal">US Legal (8.5" × 14")</SelectItem>
                </SelectContent>
              </Select>

              <Button
                className="bg-blue-600 hover:bg-blue-700"
                onClick={() => {
                  if (selectedResume) {
                    setShowPrintPreview(true);
                  } else {
                    toast({
                      title: getUIText("noResumeSelected"),
                      description: getUIText("pleaseSelectResume"),
                      variant: "destructive",
                    });
                  }
                }}
              >
                <Printer className="w-4 h-4 mr-2" />
                {getUIText("printPreview")}
              </Button>
              <Button variant="ghost" size="sm">
                <Bell className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </header>

        {/* Content Grid */}
        <div className="flex-1 overflow-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6 p-4 lg:p-6 min-h-0">
            {/* Resume Editor and JSON Editor - 2/3 width */}
            <div className="lg:col-span-2 min-h-0 overflow-hidden">
              <ResumeEditor selectedResume={selectedResume} onResumeSelect={setSelectedResume} />
            </div>

            {/* Right Column - Job Search and Analysis - 1/3 width */}
            <div className="min-h-0 overflow-hidden flex flex-col gap-4 lg:gap-6">
              <div className="flex-none">
                <JobSearch onJobSelect={setSelectedJob} />
              </div>
              <div className="flex-1">
                <JobAnalyzer
                  selectedJob={selectedJob}
                  onJobSelect={setSelectedJob}
                  selectedResume={selectedResume}
                />
              </div>
            </div>
          </div>

          {/* Resume Preview Section */}
          <div
            id="resume-preview-section"
            className="bg-white dark:bg-gray-900 border-t border-slate-200 dark:border-gray-700 p-4 lg:p-6 transition-all duration-300"
          >
            <div className="max-w-4xl mx-auto">
              <div className="mb-4 lg:mb-6">
                <h2 className="text-xl lg:text-2xl font-bold text-slate-900 dark:text-white">
                  {getUIText("printPreview")}
                </h2>
                <p className="text-sm lg:text-base text-slate-600 dark:text-gray-300">
                  {getUIText("findPerfectMatch")}
                </p>
              </div>

              {/* Preview Container */}
              <div className="bg-slate-50 dark:bg-gray-800 rounded-lg p-3 lg:p-6 border border-slate-200 dark:border-gray-600 overflow-auto">
                <div className="min-w-0">
                  <ResumePreview
                    key={selectedResume?.id || "no-resume"}
                    resume={selectedResume}
                    theme={selectedTheme}
                    showDownloadButton={false}
                    user={user}
                    outputLanguage={resumeLanguage}
                    paperFormat={paperFormat}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Panel */}
          <div className="bg-white dark:bg-gray-900 border-t border-slate-200 dark:border-gray-700 p-4 lg:p-6">
            <div className="max-w-4xl mx-auto">
              <div className="min-w-0">
                <CoverLetterGenerator resume={selectedResume} job={selectedJob} />
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Print Preview Modal */}
      <Dialog open={showPrintPreview} onOpenChange={setShowPrintPreview}>
        <DialogContent className="max-w-none w-screen h-screen p-0 m-0 bg-gray-100 dark:bg-gray-900">
          <DialogHeader>
            <div className="flex flex-col items-center space-y-4">
              <div className="text-center">
                <DialogTitle>{getUIText("printPreview")}</DialogTitle>
                <DialogDescription>
                  {selectedResume?.name || "Resume"} • {getUIText("readyToPrint")}
                </DialogDescription>
              </div>

              <div className="flex items-center gap-4">
                {/* Resume Language Selector */}
                <Select value={resumeLanguage} onValueChange={setResumeLanguage}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder={getUIText("selectResumeLanguage")} />
                  </SelectTrigger>
                  <SelectContent>
                    {resumeLanguages.map((lang) => (
                      <SelectItem key={lang.code} value={lang.code}>
                        <span className="flex items-center gap-2">
                          <span>{lang.name}</span>
                          <span className="text-gray-500 text-sm">({lang.nativeName})</span>
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Paper Format Selector */}
                <Select value={paperFormat} onValueChange={setPaperFormat}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder={getUIText("selectPaperFormat")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="a4">A4 (210mm × 297mm)</SelectItem>
                    <SelectItem value="legal">US Legal (8.5" × 14")</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </DialogHeader>

          <div className="flex flex-col h-full">
            {/* Print Preview Content - Always Light Mode */}
            <div className="flex-1 overflow-auto bg-gray-100 p-2">
              {/* Paper Size Container with Page Breaks */}
              <div
                className="bg-white shadow-xl transform origin-top scale-50 sm:scale-75 md:scale-90 lg:scale-100 mx-auto"
                style={{
                  width: paperFormat === "a4" ? "210mm" : "8.5in",
                  minHeight: paperFormat === "a4" ? "297mm" : "14in",
                  marginBottom: "40px",
                  padding: "0.5in",
                  fontSize: "10pt",
                  lineHeight: "1.3",
                  fontFamily: "Arial, sans-serif",
                  position: "relative",
                  pageBreakAfter: "always",
                }}
              >
                {/* Page Break Indicator */}
                <div
                  className="absolute top-0 left-0 right-0 border-t-2 border-dashed border-gray-300"
                  style={{ height: "1px" }}
                />
                <div
                  className="absolute bottom-0 left-0 right-0 border-b-2 border-dashed border-gray-300"
                  style={{ height: "1px" }}
                />

                {/* Page number indicator */}
                <div className="absolute top-2 right-4 text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">
                  Page 1
                </div>

                <div style={{ height: "100%", overflow: "hidden" }}>
                  <ResumePreview
                    key={selectedResume?.id || "no-resume"}
                    resume={selectedResume}
                    theme={selectedTheme}
                    forceLightMode={true}
                    showDownloadButton={false}
                    user={user}
                    outputLanguage={resumeLanguage}
                    paperFormat={paperFormat}
                  />
                </div>
              </div>
            </div>

            {/* Print Actions Footer */}
            <div className="flex flex-col sm:flex-row items-center justify-between p-3 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 gap-3">
              <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                <span>
                  📄 {paperFormat === "a4" ? "A4 (210mm × 297mm)" : 'US Legal (8.5" × 14")'}
                </span>
                <span>
                  🎨 {selectedTheme.charAt(0).toUpperCase() + selectedTheme.slice(1)} Theme
                </span>
                <span>📏 0.5" margins</span>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.print()}
                  className="flex items-center gap-2 flex-1 sm:flex-none"
                >
                  <Printer className="w-4 h-4" />
                  Print Resume
                </Button>
                <Button
                  size="sm"
                  variant="teal"
                  onClick={() => setShowPrintPreview(false)}
                  className="flex-1 sm:flex-none"
                >
                  Done
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
