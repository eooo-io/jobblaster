import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import type { Resume } from "@shared/schema";
import type { JSONResumeSchema } from "@/lib/types";

interface ResumePreviewProps {
  resume: Resume | null;
  theme?: string;
  forceLightMode?: boolean;
  showDownloadButton?: boolean;
}

export default function ResumePreview({ resume, theme = "modern", forceLightMode = false, showDownloadButton = true }: ResumePreviewProps) {
  const handleDownloadPDF = () => {
    if (!resume?.jsonData) return;
    
    const resumeData = resume.jsonData as JSONResumeSchema;
    const resumeName = resumeData.basics?.name || resume.name || 'Resume';
    
    // Create a new window with the resume content for PDF generation
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    // Get the resume content with the exact theme styling
    // Try different selectors based on theme structure
    let resumeElement = document.querySelector('.resume-content');
    
    // If not found, try alternative selectors for different themes
    if (!resumeElement) {
      // For themes that might have different structure
      resumeElement = document.querySelector('[class*="bg-white"][class*="rounded"]');
    }
    
    if (!resumeElement) {
      // Last resort - get the entire preview container
      resumeElement = document.querySelector('.overflow-auto > div');
    }
    
    if (!resumeElement) return;

    // Get all current stylesheets to preserve theme styling
    const stylesheets = Array.from(document.styleSheets)
      .map(sheet => {
        try {
          return Array.from(sheet.cssRules)
            .map(rule => rule.cssText)
            .join('\n');
        } catch (e) {
          return '';
        }
      })
      .join('\n');

    // Create HTML for PDF that preserves the exact theme styling
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            ${stylesheets}
            
            /* PDF-specific overrides */
            @media print {
              body { 
                margin: 0; 
                padding: 0;
                -webkit-print-color-adjust: exact !important;
                color-adjust: exact !important;
              }
              @page { 
                margin: 0.5in; 
                size: letter;
                /* Remove browser headers and footers */
                @top-left { content: ""; }
                @top-center { content: ""; }
                @top-right { content: ""; }
                @bottom-left { content: ""; }
                @bottom-center { content: ""; }
                @bottom-right { content: ""; }
              }
              .resume-content {
                max-width: none !important;
                margin: 0 !important;
                box-shadow: none !important;
                border: none !important;
                border-radius: 0 !important;
                padding: 0 !important;
              }
              /* Force background colors and images to print */
              * {
                -webkit-print-color-adjust: exact !important;
                color-adjust: exact !important;
              }
              /* Remove any headers */
              header, .header, .page-header {
                display: none !important;
              }
            }
            
            /* Ensure consistent spacing and layout */
            body {
              background: white !important;
              font-size: 14px;
              line-height: 1.4;
            }
            
            /* Page numbering */
            .page-number {
              position: fixed;
              bottom: 0.5in;
              left: 50%;
              transform: translateX(-50%);
              font-size: 10px;
              color: #666;
              text-align: center;
            }
          </style>
          <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
        </head>
        <body>
          ${resumeElement.outerHTML}
          <div class="page-number"></div>
          <script>
            window.onload = function() {
              // Add page numbering functionality
              function addPageNumbers() {
                const style = document.createElement('style');
                style.textContent = \`
                  @media print {
                    body { counter-reset: page; }
                    .page-number:after {
                      counter-increment: page;
                      content: counter(page, lower-roman);
                    }
                  }
                \`;
                document.head.appendChild(style);
              }
              
              addPageNumbers();
              
              // Small delay to ensure styles are loaded
              setTimeout(() => {
                window.print();
                setTimeout(() => window.close(), 1000);
              }, 500);
            }
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };
  if (!resume?.jsonData) {
    return (
      <div className="lg:col-span-1">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Resume Preview</h3>
        </div>
        <div className="bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-gray-600 rounded-lg p-4 h-96 overflow-auto">
          <div className="flex items-center justify-center h-full text-slate-500 dark:text-gray-400">
            <div className="text-center">
              <div className="w-12 h-12 bg-slate-200 dark:bg-gray-600 rounded-lg mx-auto mb-2"></div>
              <p className="text-sm">Upload a resume to see the preview</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const resumeData = resume.jsonData as JSONResumeSchema;
  const basics = resumeData.basics || {};
  const work = resumeData.work || [];
  const skills = resumeData.skills || [];
  const education = resumeData.education || [];
  const languages = resumeData.languages || [];
  const interests = resumeData.interests || [];
  const projects = resumeData.projects || [];

  const getSkillPercentage = (level: string): number => {
    const levelMap: { [key: string]: number } = {
      'beginner': 30,
      'intermediate': 60,
      'advanced': 80,
      'expert': 95,
      'master': 100
    };
    return levelMap[level.toLowerCase()] || 80;
  };

  const getFluencyPercentage = (fluency: string): number => {
    const fluencyMap: { [key: string]: number } = {
      'elementary': 40,
      'limited': 50,
      'professional': 80,
      'full professional': 90,
      'native': 100,
      'native speaker': 100,
      'bilingual': 100
    };
    return fluencyMap[fluency.toLowerCase()] || 80;
  };

  const formatDate = (dateStr: string | undefined): string => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.getFullYear().toString();
  };

  // Debug theme - shows all data in plain text format
  if (theme === "debug") {
    return (
      <div className="lg:col-span-1">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Resume Preview - Debug Mode</h3>
          {showDownloadButton && (
            <Button
              onClick={handleDownloadPDF}
              size="sm"
              variant="outline"
              className="flex items-center space-x-2"
            >
              <Download className="h-4 w-4" />
              <span>Download PDF</span>
            </Button>
          )}
        </div>
        <div className={`${forceLightMode ? 'bg-slate-50 border-slate-200' : 'bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-gray-600'} rounded-lg p-4 overflow-auto`} style={{ height: '70vh' }}>
          <div className="text-xs font-mono space-y-4 text-slate-700 dark:text-gray-300">
            
            {/* Basics Section */}
            {basics && Object.keys(basics).length > 0 && (
              <div>
                <h4 className="font-bold text-blue-600 dark:text-blue-400 mb-2">BASICS:</h4>
                {basics.name && <div>• Name: {basics.name}</div>}
                {basics.label && <div>• Label: {basics.label}</div>}
                {basics.email && <div>• Email: {basics.email}</div>}
                {basics.phone && <div>• Phone: {basics.phone}</div>}
                {basics.url && <div>• Website: {basics.url}</div>}
                {basics.summary && <div>• Summary: {basics.summary}</div>}
                {basics.location && (
                  <div>• Location: {basics.location.city}, {basics.location.region} {basics.location.countryCode}</div>
                )}
                {basics.profiles && basics.profiles.length > 0 && (
                  <div>• Profiles: {basics.profiles.map(p => `${p.network}: ${p.url || p.username}`).join(', ')}</div>
                )}
              </div>
            )}

            {/* Work Experience */}
            {work && work.length > 0 && (
              <div>
                <h4 className="font-bold text-green-600 dark:text-green-400 mb-2">WORK EXPERIENCE ({work.length}):</h4>
                {work.map((job: any, index: number) => (
                  <div key={index} className="mb-3 pl-4 border-l-2 border-gray-300 dark:border-gray-600">
                    <div className="font-semibold">{index + 1}. {job.position || 'Position'}</div>
                    {job.name && <div>   Company: {job.name}</div>}
                    {job.startDate && <div>   Duration: {job.startDate} - {job.endDate || 'Present'}</div>}
                    {job.location && <div>   Location: {job.location}</div>}
                    {job.summary && <div>   Summary: {job.summary}</div>}
                    {job.highlights && job.highlights.length > 0 && (
                      <div>   Highlights: {job.highlights.join('; ')}</div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Skills */}
            {skills && skills.length > 0 && (
              <div>
                <h4 className="font-bold text-purple-600 dark:text-purple-400 mb-2">SKILLS ({skills.length}):</h4>
                {skills.map((skill: any, index: number) => (
                  <div key={index} className="mb-2">
                    <div>• {skill.name || `Skill ${index + 1}`}</div>
                    {skill.level && <div>   Level: {skill.level}</div>}
                    {skill.keywords && skill.keywords.length > 0 && (
                      <div>   Keywords: {skill.keywords.join(', ')}</div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Education */}
            {education && education.length > 0 && (
              <div>
                <h4 className="font-bold text-orange-600 dark:text-orange-400 mb-2">EDUCATION ({education.length}):</h4>
                {education.map((edu: any, index: number) => (
                  <div key={index} className="mb-3 pl-4 border-l-2 border-gray-300 dark:border-gray-600">
                    <div className="font-semibold">{index + 1}. {edu.studyType} {edu.area && `in ${edu.area}`}</div>
                    {edu.institution && <div>   Institution: {edu.institution}</div>}
                    {edu.startDate && <div>   Duration: {edu.startDate} - {edu.endDate || 'Present'}</div>}
                    {edu.gpa && <div>   GPA: {edu.gpa}</div>}
                    {edu.courses && edu.courses.length > 0 && (
                      <div>   Courses: {edu.courses.join(', ')}</div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Languages */}
            {languages && languages.length > 0 && (
              <div>
                <h4 className="font-bold text-red-600 dark:text-red-400 mb-2">LANGUAGES ({languages.length}):</h4>
                {languages.map((lang: any, index: number) => (
                  <div key={index}>
                    • {lang.language || `Language ${index + 1}`} - {lang.fluency || 'Not specified'}
                  </div>
                ))}
              </div>
            )}

            {/* Additional Sections */}
            {resumeData.awards && resumeData.awards.length > 0 && (
              <div>
                <h4 className="font-bold text-yellow-600 dark:text-yellow-400 mb-2">AWARDS ({resumeData.awards.length}):</h4>
                {resumeData.awards.map((award: any, index: number) => (
                  <div key={index}>
                    • {award.title} - {award.awarder} ({award.date})
                  </div>
                ))}
              </div>
            )}

            {resumeData.publications && resumeData.publications.length > 0 && (
              <div>
                <h4 className="font-bold text-indigo-600 dark:text-indigo-400 mb-2">PUBLICATIONS ({resumeData.publications.length}):</h4>
                {resumeData.publications.map((pub: any, index: number) => (
                  <div key={index}>
                    • {pub.name} - {pub.publisher} ({pub.releaseDate})
                  </div>
                ))}
              </div>
            )}

            {resumeData.volunteer && resumeData.volunteer.length > 0 && (
              <div>
                <h4 className="font-bold text-teal-600 dark:text-teal-400 mb-2">VOLUNTEER ({resumeData.volunteer.length}):</h4>
                {resumeData.volunteer.map((vol: any, index: number) => (
                  <div key={index}>
                    • {vol.position} at {vol.organization} ({vol.startDate} - {vol.endDate || 'Present'})
                  </div>
                ))}
              </div>
            )}

            {resumeData.interests && resumeData.interests.length > 0 && (
              <div>
                <h4 className="font-bold text-pink-600 dark:text-pink-400 mb-2">INTERESTS ({resumeData.interests.length}):</h4>
                {resumeData.interests.map((interest: any, index: number) => (
                  <div key={index}>
                    • {interest.name} {interest.keywords && `(${interest.keywords.join(', ')})`}
                  </div>
                ))}
              </div>
            )}

            {resumeData.projects && resumeData.projects.length > 0 && (
              <div>
                <h4 className="font-bold text-cyan-600 dark:text-cyan-400 mb-2">PROJECTS ({resumeData.projects.length}):</h4>
                {resumeData.projects.map((project: any, index: number) => (
                  <div key={index} className="mb-2">
                    <div className="font-semibold">• {project.name}</div>
                    {project.description && <div>   Description: {project.description}</div>}
                    {project.url && <div>   URL: {project.url}</div>}
                  </div>
                ))}
              </div>
            )}

          </div>
        </div>
      </div>
    );
  }

  // Lucide Theme - Blue sidebar layout from JSON Resume registry
  if (theme === "lucide") {
    return (
      <div className="lg:col-span-1">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Resume Preview - Lucide Theme</h3>
          {showDownloadButton && (
            <Button
              onClick={handleDownloadPDF}
              size="sm"
              variant="outline"
              className="flex items-center space-x-2"
            >
              <Download className="h-4 w-4" />
              <span>Download PDF</span>
            </Button>
          )}
        </div>
        <div className={`${forceLightMode ? 'bg-slate-50 border-slate-200' : 'bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-gray-600'} rounded-lg p-4 overflow-auto`} style={{ height: '70vh' }}>
          <div className={`resume-content ${forceLightMode ? 'bg-white' : 'bg-white dark:bg-gray-900'} rounded shadow-sm min-h-full flex text-sm`}>
            
            {/* Left Sidebar - Blue */}
            <div className="w-1/3 text-white p-6" style={{ backgroundColor: 'rgb(28, 35, 51)', fontFamily: 'Indivisa Text Sans-Regular, sans-serif' }}>
              
              {/* Contact Information */}
              <div className="mb-8">
                <h3 className="text-base font-bold mb-4 py-2 px-6 -mx-6" style={{ backgroundColor: 'rgb(20, 25, 35)' }}>
                  CONTACT
                </h3>
                <div className="space-y-3 text-xs">
                  {/* Location */}
                  {basics.location?.city && (
                    <div className="flex items-center">
                      <i className="fas fa-map-marker-alt mr-3 w-4 text-center"></i>
                      <span>{basics.location.city}{basics.location.region && `, ${basics.location.region}`}</span>
                    </div>
                  )}
                  
                  {/* Phone */}
                  {basics.phone && (
                    <div className="flex items-center">
                      <i className="fas fa-phone mr-3 w-4 text-center"></i>
                      <span>{basics.phone}</span>
                    </div>
                  )}
                  
                  {/* Email */}
                  {basics.email && (
                    <div className="flex items-center">
                      <i className="fas fa-envelope mr-3 w-4 text-center"></i>
                      <span className="break-all">{basics.email}</span>
                    </div>
                  )}
                  
                  {/* GitHub */}
                  {basics.profiles && basics.profiles.find((p: any) => p.network?.toLowerCase() === 'github' || p.url?.includes('github.com')) && (
                    <div className="flex items-center">
                      <i className="fab fa-github mr-3 w-4 text-center"></i>
                      <span className="text-blue-200">{basics.profiles.find((p: any) => p.network?.toLowerCase() === 'github' || p.url?.includes('github.com'))?.username || basics.profiles.find((p: any) => p.network?.toLowerCase() === 'github' || p.url?.includes('github.com'))?.url}</span>
                    </div>
                  )}
                  
                  {/* LinkedIn */}
                  {basics.profiles && basics.profiles.find((p: any) => p.network?.toLowerCase() === 'linkedin' || p.url?.includes('linkedin.com')) && (
                    <div className="flex items-center">
                      <i className="fab fa-linkedin mr-3 w-4 text-center"></i>
                      <span className="text-blue-200">{basics.profiles.find((p: any) => p.network?.toLowerCase() === 'linkedin' || p.url?.includes('linkedin.com'))?.username || basics.profiles.find((p: any) => p.network?.toLowerCase() === 'linkedin' || p.url?.includes('linkedin.com'))?.url}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Skills */}
              {skills.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-base font-bold mb-4 py-2 px-6 -mx-6" style={{ backgroundColor: 'rgb(20, 25, 35)' }}>
                    SKILLS
                  </h3>
                  <div className="space-y-2 text-xs">
                    {skills.map((skill: any, index: number) => (
                      <div key={index}>
                        {typeof skill === 'string' ? (
                          <span className="inline-block bg-gray-900 text-white px-2 py-1 rounded-md text-xs mr-1 mb-1">
                            {skill}
                          </span>
                        ) : (
                          <>
                            {skill.name && (
                              <div className="font-bold text-white text-xs mb-2 uppercase tracking-wide border-b border-blue-300 pb-1 whitespace-nowrap">{skill.name}</div>
                            )}
                            {skill.keywords && skill.keywords.length > 0 && (
                              <div className="flex flex-wrap gap-1 mb-3">
                                {skill.keywords.map((keyword: string, kidx: number) => (
                                  <span key={kidx} className="inline-block bg-gray-900 text-white px-2 py-1 rounded-md text-xs">
                                    {keyword}
                                  </span>
                                ))}
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Languages */}
              {languages.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-base font-bold mb-4 py-2 px-6 -mx-6" style={{ backgroundColor: 'rgb(20, 25, 35)' }}>
                    LANGUAGES
                  </h3>
                  <div className="space-y-2 text-xs">
                    {languages.map((lang: any, index: number) => (
                      <div key={index}>
                        <div className="font-medium">{lang.language}</div>
                        <div className="text-blue-200 text-xs">{lang.fluency}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Interests */}
              {interests.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-base font-bold mb-4 py-2 px-6 -mx-6" style={{ backgroundColor: 'rgb(20, 25, 35)' }}>
                    INTERESTS
                  </h3>
                  <div className="space-y-2 text-xs">
                    {interests.map((interest: any, index: number) => (
                      <div key={index}>
                        {typeof interest === 'string' ? interest : interest.name}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* References */}
              <div>
                <h3 className="text-base font-bold mb-4 py-2 px-6 -mx-6" style={{ backgroundColor: 'rgb(20, 25, 35)' }}>
                  REFERENCES
                </h3>
                <div className="text-xs leading-relaxed">
                  <p className="italic">
                    "Professional references available upon request. Previous colleagues and supervisors can attest to technical expertise, work ethic, and collaborative abilities."
                  </p>
                </div>
              </div>
            </div>

            {/* Right Content Area */}
            <div className="w-2/3 p-6 bg-gray-50" style={{ fontFamily: 'Indivisa Text Sans-Regular, sans-serif' }}>
              
              {/* Header */}
              <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2 uppercase" style={{ color: 'rgb(28, 35, 51)' }}>
                  {basics.name || "Your Name"}
                </h1>
                {basics.label && (
                  <h2 className="text-lg text-blue-600 font-medium mb-4">
                    {basics.label}
                  </h2>
                )}
                
                {basics.summary && (
                  <p className="text-gray-700 leading-relaxed text-xs">
                    {basics.summary}
                  </p>
                )}
              </div>

              {/* Work Experience */}
              {work.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-lg font-bold mb-6 border-b-2 pb-2" style={{ color: 'rgb(28, 35, 51)', borderColor: 'rgb(28, 35, 51)' }}>
                    PROFESSIONAL EXPERIENCES
                  </h3>
                  {work.map((job: any, index: number) => (
                    <div key={index} className="mb-6 last:mb-0">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-4 mb-1">
                            <span className="text-xs font-medium text-gray-600 whitespace-nowrap">
                              {job.startDate && formatDate(job.startDate)}
                              {job.endDate ? ` – ${formatDate(job.endDate)}` : " – Current"}
                            </span>
                            <h4 className="text-sm font-bold text-gray-900">
                              {job.position || "Position"}
                            </h4>
                          </div>
                          <div className="flex items-center gap-2 mb-2">
                            <p className="text-blue-600 font-medium">
                              {job.name || job.company || "Company"}
                            </p>
                            <span className="text-xs text-gray-500"><i className="fas fa-map-marker-alt mr-1"></i> {job.location || "Location"}</span>
                          </div>
                        </div>
                      </div>
                      
                      {job.summary && (
                        <p className="text-gray-700 mb-3 text-xs leading-relaxed">
                          {job.summary}
                        </p>
                      )}
                      
                      {job.highlights && job.highlights.length > 0 && (
                        <ul className="text-gray-700 space-y-0.5 text-xs">
                          {job.highlights.map((highlight: string, idx: number) => (
                            <li key={idx} className="flex items-start">
                              <span className="text-blue-600 mr-2 mt-1">•</span>
                              <span>{highlight}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Skills/Competences */}
              {skills.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-lg font-bold mb-6 border-b-2 pb-2" style={{ color: 'rgb(28, 35, 51)', borderColor: 'rgb(28, 35, 51)' }}>
                    CORE COMPETENCIES
                  </h3>
                  <div className="grid grid-cols-3 gap-4">
                    {skills.map((skill: any, index: number) => (
                      <div key={index} className="bg-gray-900 text-white px-3 py-2 rounded-md text-xs text-center">
                        {typeof skill === 'string' ? skill : skill.name}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Education */}
              {education.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-lg font-bold mb-6 border-b-2 pb-2" style={{ color: 'rgb(28, 35, 51)', borderColor: 'rgb(28, 35, 51)' }}>
                    EDUCATION
                  </h3>
                  {education.map((edu: any, index: number) => (
                    <div key={index} className="mb-4 last:mb-0">
                      <div className="flex justify-between items-start mb-1">
                        <div>
                          <span className="text-xs font-medium text-gray-600 whitespace-nowrap">
                            {edu.startDate && formatDate(edu.startDate)}
                            {edu.endDate ? ` – ${formatDate(edu.endDate)}` : ""}
                          </span>
                          <h4 className="font-bold text-gray-900">
                            {edu.studyType} {edu.area && `en ${edu.area}`}
                          </h4>
                          <p className="text-blue-600 font-medium">
                            {edu.institution}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Projects */}
              {projects.length > 0 && (
                <div>
                  <h3 className="text-lg font-bold mb-6 border-b-2 pb-2" style={{ color: 'rgb(28, 35, 51)', borderColor: 'rgb(28, 35, 51)' }}>
                    PROJECTS
                  </h3>
                  {projects.map((project: any, index: number) => (
                    <div key={index} className="mb-6 last:mb-0">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <span className="text-sm font-medium text-gray-600">
                            {project.startDate && formatDate(project.startDate)}
                            {project.endDate ? ` – ${formatDate(project.endDate)}` : project.startDate && " – Current"}
                          </span>
                          <h4 className="font-bold text-gray-900">
                            {project.name}
                          </h4>
                        </div>
                      </div>
                      
                      {project.description && (
                        <p className="text-gray-700 mb-2 text-sm leading-relaxed">
                          {project.description}
                        </p>
                      )}
                      
                      {project.highlights && project.highlights.length > 0 && (
                        <ul className="text-gray-700 space-y-1 text-sm">
                          {project.highlights.map((highlight: string, idx: number) => (
                            <li key={idx} className="flex items-start">
                              <span className="text-blue-600 mr-2 mt-1">•</span>
                              <span>{highlight}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    );
  }

  // Modern Theme - Comprehensive JSON Resume Rendering
  if (theme === "modern") {
    return (
      <div className="lg:col-span-1">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Resume Preview - Modern Theme</h3>
          {showDownloadButton && (
            <Button
              onClick={handleDownloadPDF}
              size="sm"
              variant="outline"
              className="flex items-center space-x-2"
            >
              <Download className="h-4 w-4" />
              <span>Download PDF</span>
            </Button>
          )}
        </div>
        <div className={`${forceLightMode ? 'bg-slate-50 border-slate-200' : 'bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-gray-600'} rounded-lg p-4 overflow-auto`} style={{ height: '70vh' }}>
          <div className="resume-content bg-white rounded shadow-sm p-6 text-sm space-y-4">
            
            {/* Header Section */}
            <div className="text-center border-b border-blue-100 pb-4">
              <h1 className="text-2xl font-bold text-gray-900 mb-1">
                {basics.name || "Your Name"}
              </h1>
              {basics.label && (
                <p className="text-blue-600 font-medium mb-2">
                  {basics.label}
                </p>
              )}
              
              {/* Contact Information */}
              <div className="text-xs text-gray-600 space-x-2 flex flex-wrap justify-center gap-x-3">
                {basics.email && <span><i className="fas fa-envelope mr-1"></i>{basics.email}</span>}
                {basics.phone && <span><i className="fas fa-phone mr-1"></i>{basics.phone}</span>}
                {basics.location?.city && (
                  <span><i className="fas fa-map-marker-alt mr-1"></i>{basics.location.city}{basics.location.region && `, ${basics.location.region}`}</span>
                )}
              </div>
              
              {/* Social Profiles */}
              {basics.profiles && basics.profiles.length > 0 && (
                <div className="text-xs text-gray-600 mt-1 flex flex-wrap justify-center gap-x-3">
                  {basics.profiles.map((profile: any, index: number) => {
                    const getProfileIcon = (network: string) => {
                      const lowerNetwork = network.toLowerCase();
                      if (lowerNetwork.includes('linkedin')) return 'fab fa-linkedin';
                      if (lowerNetwork.includes('github')) return 'fab fa-github';
                      if (lowerNetwork.includes('twitter') || lowerNetwork.includes('x')) return 'fab fa-twitter';
                      if (lowerNetwork.includes('facebook')) return 'fab fa-facebook';
                      if (lowerNetwork.includes('instagram')) return 'fab fa-instagram';
                      if (lowerNetwork.includes('youtube')) return 'fab fa-youtube';
                      if (lowerNetwork.includes('website') || lowerNetwork.includes('portfolio')) return 'fas fa-globe';
                      return 'fas fa-link';
                    };
                    
                    return (
                      <span key={index}>
                        <i className={`${getProfileIcon(profile.network || '')} mr-1`}></i>
                        {profile.username || profile.url}
                      </span>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Summary */}
            {basics.summary && (
              <div>
                <h2 className="text-sm font-bold text-blue-600 border-b border-gray-200 pb-1 mb-2">
                  PROFESSIONAL SUMMARY
                </h2>
                <p className="text-xs text-gray-700 leading-relaxed">
                  {basics.summary}
                </p>
              </div>
            )}

            {/* Work Experience */}
            {work.length > 0 && (
              <div>
                <h2 className="text-sm font-bold text-blue-600 border-b border-gray-200 pb-1 mb-2">
                  WORK EXPERIENCE
                </h2>
                {work.map((job: any, index: number) => (
                  <div key={index} className="mb-3 last:mb-0">
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="font-semibold text-gray-900 text-xs">
                        {job.position || "Position"}
                      </h3>
                      <span className="text-xs text-gray-500">
                        {formatDate(job.startDate)}{job.endDate ? ` - ${formatDate(job.endDate)}` : " - Present"}
                      </span>
                    </div>
                    <div className="text-xs mb-1">
                      <span className="text-blue-600 dark:text-blue-400 font-medium inline-block mr-2">
                        {job.name || job.company || "Company"}
                      </span>
                      {job.location && (
                        <>
                          <span className="text-gray-500 dark:text-gray-400 inline-block mr-1">•</span>
                          <span className="text-gray-600 dark:text-gray-300 font-normal inline-block">
                            {job.location}
                          </span>
                        </>
                      )}
                    </div>
                    {job.summary && (
                      <p className="text-xs text-gray-700 mb-1">
                        {job.summary}
                      </p>
                    )}
                    {job.highlights && job.highlights.length > 0 && (
                      <ul className="text-xs text-gray-700 ml-3 list-disc space-y-0.5">
                        {job.highlights.map((highlight: string, idx: number) => (
                          <li key={idx}>{highlight}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Education */}
            {education.length > 0 && (
              <div>
                <h2 className="text-sm font-bold text-blue-600 dark:text-blue-400 border-b border-gray-200 dark:border-gray-700 pb-1 mb-2">
                  EDUCATION
                </h2>
                {education.map((edu: any, index: number) => (
                  <div key={index} className="mb-2 last:mb-0">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white text-xs">
                          {edu.studyType} {edu.area && `in ${edu.area}`}
                        </h3>
                        <p className="text-xs text-blue-600 dark:text-blue-400">
                          {edu.institution}
                        </p>
                        {edu.gpa && (
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            GPA: {edu.gpa}
                          </p>
                        )}
                      </div>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {formatDate(edu.startDate)}{edu.endDate ? ` - ${formatDate(edu.endDate)}` : ""}
                      </span>
                    </div>
                    {edu.courses && edu.courses.length > 0 && (
                      <p className="text-xs text-gray-700 dark:text-gray-300 mt-1">
                        Relevant coursework: {edu.courses.slice(0, 3).join(', ')}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Skills */}
            {skills.length > 0 && (
              <div>
                <h2 className="text-sm font-bold text-blue-600 dark:text-blue-400 border-b border-gray-200 dark:border-gray-700 pb-1 mb-2">
                  SKILLS
                </h2>
                <div className="space-y-3">
                  {skills.map((skill: any, index: number) => (
                    <div key={index}>
                      <h3 className="text-xs font-semibold text-gray-900 dark:text-white mb-1">
                        {skill.name || `Skill ${index + 1}`}
                      </h3>
                      {skill.keywords && skill.keywords.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {skill.keywords.slice(0, 6).map((keyword: string, kidx: number) => (
                            <Badge key={kidx} variant="secondary" className="text-xs px-2 py-1 rounded-sm">
                              {keyword}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Languages */}
            {languages.length > 0 && (
              <div>
                <h2 className="text-sm font-bold text-blue-600 dark:text-blue-400 border-b border-gray-200 dark:border-gray-700 pb-1 mb-2">
                  LANGUAGES
                </h2>
                <div className="space-y-1">
                  {languages.map((lang: any, index: number) => {
                    const languageName = lang.language || `Language ${index + 1}`;
                    const getIcon = (language: string) => {
                      const lowerLang = language.toLowerCase();
                      if (lowerLang.includes('english')) return 'EN';
                      if (lowerLang.includes('german') || lowerLang.includes('deutsch')) return 'DE';
                      return '';
                    };
                    
                    return (
                      <div key={index} className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          {getIcon(languageName) && (
                            <div className="w-6 h-4 bg-gray-200 dark:bg-gray-700 rounded-sm flex items-center justify-center">
                              <span className="text-xs font-bold text-gray-700 dark:text-gray-300">
                                {getIcon(languageName)}
                              </span>
                            </div>
                          )}
                          <span className="text-xs font-semibold text-gray-900 dark:text-white">
                            {languageName}
                          </span>
                        </div>
                        <span className="text-xs text-gray-600 dark:text-gray-400">
                          {lang.fluency || "Fluent"}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Projects */}
            {resumeData.projects && resumeData.projects.length > 0 && (
              <div>
                <h2 className="text-sm font-bold text-blue-600 dark:text-blue-400 border-b border-gray-200 dark:border-gray-700 pb-1 mb-2">
                  PROJECTS
                </h2>
                {resumeData.projects.slice(0, 3).map((project: any, index: number) => (
                  <div key={index} className="mb-2 last:mb-0">
                    <h3 className="font-semibold text-gray-900 dark:text-white text-xs">
                      {project.name}
                      {project.url && (
                        <span className="text-blue-600 dark:text-blue-400 font-normal ml-1">
                          ({project.url})
                        </span>
                      )}
                    </h3>
                    {project.description && (
                      <p className="text-xs text-gray-700 dark:text-gray-300">
                        {project.description}
                      </p>
                    )}
                    {project.keywords && project.keywords.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {project.keywords.slice(0, 4).map((keyword: string, kidx: number) => (
                          <Badge key={kidx} variant="outline" className="text-xs px-2 py-1 rounded-sm">
                            {keyword}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Awards */}
            {resumeData.awards && resumeData.awards.length > 0 && (
              <div>
                <h2 className="text-sm font-bold text-blue-600 dark:text-blue-400 border-b border-gray-200 dark:border-gray-700 pb-1 mb-2">
                  AWARDS & ACHIEVEMENTS
                </h2>
                {resumeData.awards.map((award: any, index: number) => (
                  <div key={index} className="mb-1 last:mb-0">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white text-xs">
                          {award.title}
                        </h3>
                        <p className="text-xs text-blue-600 dark:text-blue-400">
                          {award.awarder}
                        </p>
                      </div>
                      {award.date && (
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {formatDate(award.date)}
                        </span>
                      )}
                    </div>
                    {award.summary && (
                      <p className="text-xs text-gray-700 dark:text-gray-300 mt-1">
                        {award.summary}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Volunteer Experience */}
            {resumeData.volunteer && resumeData.volunteer.length > 0 && (
              <div>
                <h2 className="text-sm font-bold text-blue-600 dark:text-blue-400 border-b border-gray-200 dark:border-gray-700 pb-1 mb-2">
                  VOLUNTEER EXPERIENCE
                </h2>
                {resumeData.volunteer.map((vol: any, index: number) => (
                  <div key={index} className="mb-2 last:mb-0">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white text-xs">
                          {vol.position}
                        </h3>
                        <p className="text-xs text-blue-600 dark:text-blue-400">
                          {vol.organization}
                        </p>
                      </div>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {formatDate(vol.startDate)}{vol.endDate ? ` - ${formatDate(vol.endDate)}` : " - Present"}
                      </span>
                    </div>
                    {vol.summary && (
                      <p className="text-xs text-gray-700 dark:text-gray-300 mt-1">
                        {vol.summary}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Publications */}
            {resumeData.publications && resumeData.publications.length > 0 && (
              <div>
                <h2 className="text-sm font-bold text-blue-600 dark:text-blue-400 border-b border-gray-200 dark:border-gray-700 pb-1 mb-2">
                  PUBLICATIONS
                </h2>
                {resumeData.publications.map((pub: any, index: number) => (
                  <div key={index} className="mb-1 last:mb-0">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white text-xs">
                          {pub.name}
                        </h3>
                        <p className="text-xs text-blue-600 dark:text-blue-400">
                          {pub.publisher}
                        </p>
                      </div>
                      {pub.releaseDate && (
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {formatDate(pub.releaseDate)}
                        </span>
                      )}
                    </div>
                    {pub.summary && (
                      <p className="text-xs text-gray-700 dark:text-gray-300 mt-1">
                        {pub.summary}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Interests */}
            {resumeData.interests && resumeData.interests.length > 0 && (
              <div>
                <h2 className="text-sm font-bold text-blue-600 dark:text-blue-400 border-b border-gray-200 dark:border-gray-700 pb-1 mb-2">
                  INTERESTS
                </h2>
                <div className="flex flex-wrap gap-1">
                  {resumeData.interests.map((interest: any, index: number) => (
                    <Badge key={index} variant="secondary" className="text-xs px-2 py-1 rounded-sm">
                      {interest.name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    );
  }

  // Default Theme Preview (for other themes)
  return (
    <div className="lg:col-span-1">
      <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Resume Preview - {theme.charAt(0).toUpperCase() + theme.slice(1)} Theme</h3>
      <div className={`${forceLightMode ? 'bg-slate-50 border-slate-200' : 'bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-gray-600'} rounded-lg p-4 overflow-auto`} style={{ height: '70vh' }}>
        <div className="bg-white dark:bg-gray-900 rounded shadow-sm p-6 text-sm">
          {/* Header */}
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-slate-900 mb-1">
              {basics.name || "Your Name"}
            </h1>
            <p className="text-slate-600 mb-2">
              {basics.label || basics.summary || "Professional Title"}
            </p>
            <div className="text-xs text-slate-500 space-x-2">
              {basics.email && <span>{basics.email}</span>}
              {basics.phone && basics.email && <span>•</span>}
              {basics.phone && <span>{basics.phone}</span>}
              {basics.location?.city && (basics.email || basics.phone) && <span>•</span>}
              {basics.location?.city && (
                <span>{basics.location.city}{basics.location.region && `, ${basics.location.region}`}</span>
              )}
            </div>
          </div>

          {/* Experience */}
          {work.length > 0 && (
            <div className="mb-4">
              <h2 className="text-lg font-bold text-slate-900 border-b border-slate-200 pb-1 mb-2">
                Experience
              </h2>
              {work.slice(0, 3).map((job: any, index: number) => (
                <div key={index} className="mb-3">
                  <h3 className="font-semibold text-slate-900">
                    {job.position || "Position"}
                  </h3>
                  <p className="text-slate-600 text-xs">
                    {job.name || job.company || "Company"} • {job.startDate && new Date(job.startDate).getFullYear()}{job.endDate ? ` - ${new Date(job.endDate).getFullYear()}` : " - Present"}
                  </p>
                  {job.highlights && job.highlights.length > 0 && (
                    <ul className="text-xs text-slate-700 mt-1 ml-4 list-disc">
                      {job.highlights.slice(0, 2).map((highlight: string, idx: number) => (
                        <li key={idx}>{highlight}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Skills */}
          {skills.length > 0 && (
            <div className="mb-4">
              <h2 className="text-lg font-bold text-slate-900 border-b border-slate-200 pb-1 mb-2">
                Skills
              </h2>
              <div className="flex flex-wrap gap-1">
                {skills.slice(0, 8).map((skill: any, index: number) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="text-xs px-2 py-1 bg-slate-100 text-slate-700"
                  >
                    {typeof skill === 'string' ? skill : skill.name || skill.keywords?.[0]}
                  </Badge>
                ))}
                {skills.length > 8 && (
                  <Badge variant="outline" className="text-xs">
                    +{skills.length - 8} more
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* Education */}
          {education.length > 0 && (
            <div>
              <h2 className="text-lg font-bold text-slate-900 border-b border-slate-200 pb-1 mb-2">
                Education
              </h2>
              {education.slice(0, 2).map((edu: any, index: number) => (
                <div key={index} className="mb-2">
                  <h3 className="font-semibold text-slate-900 text-sm">
                    {edu.studyType} {edu.area && `in ${edu.area}`}
                  </h3>
                  <p className="text-slate-600 text-xs">
                    {edu.institution} • {edu.endDate && new Date(edu.endDate).getFullYear()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
