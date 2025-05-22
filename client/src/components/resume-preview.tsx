import { Badge } from "@/components/ui/badge";
import type { Resume } from "@shared/schema";
import type { JSONResumeSchema } from "@/lib/types";

interface ResumePreviewProps {
  resume: Resume | null;
  theme?: string;
  forceLightMode?: boolean;
}

export default function ResumePreview({ resume, theme = "modern", forceLightMode = false }: ResumePreviewProps) {
  if (!resume?.jsonData) {
    return (
      <div className="lg:col-span-1">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Resume Preview</h3>
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
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Resume Preview - Debug Mode</h3>
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

  // Lucide Theme - Clean, minimal design inspired by JSON Resume registry
  if (theme === "lucide") {
    return (
      <div className="lg:col-span-1">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Resume Preview - Lucide Theme</h3>
        <div className={`${forceLightMode ? 'bg-slate-50 border-slate-200' : 'bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-gray-600'} rounded-lg p-4 overflow-auto`} style={{ height: '70vh' }}>
          <div className={`${forceLightMode ? 'bg-white' : 'bg-white dark:bg-gray-900'} rounded shadow-sm p-8 text-sm max-w-4xl mx-auto`}>
            
            {/* Header Section */}
            <div className="mb-8">
              <h1 className="text-3xl font-light text-gray-900 mb-2">
                {basics.name || "Your Name"}
              </h1>
              {basics.label && (
                <h2 className="text-lg text-gray-600 mb-4 font-light">
                  {basics.label}
                </h2>
              )}
              
              {/* Contact Information */}
              <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                {basics.email && (
                  <span className="flex items-center">
                    <span>{basics.email}</span>
                  </span>
                )}
                {basics.phone && (
                  <span>{basics.phone}</span>
                )}
                {basics.location?.city && (
                  <span>
                    {basics.location.city}{basics.location.region && `, ${basics.location.region}`}
                  </span>
                )}
                {basics.url && (
                  <span className="text-blue-600">{basics.url}</span>
                )}
              </div>
            </div>

            {/* Summary */}
            {basics.summary && (
              <div className="mb-8">
                <h3 className="text-lg font-medium text-gray-900 mb-3 border-b border-gray-200 pb-1">
                  About
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  {basics.summary}
                </p>
              </div>
            )}

            {/* Work Experience */}
            {work.length > 0 && (
              <div className="mb-8">
                <h3 className="text-lg font-medium text-gray-900 mb-4 border-b border-gray-200 pb-1">
                  Work Experience
                </h3>
                {work.map((job: any, index: number) => (
                  <div key={index} className="mb-6 last:mb-0">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-2">
                      <div>
                        <h4 className="font-medium text-gray-900">
                          {job.position || "Position"}
                        </h4>
                        <p className="text-gray-600">
                          {job.name || job.company || "Company"}
                        </p>
                      </div>
                      <div className="text-sm text-gray-500 mt-1 sm:mt-0">
                        {job.startDate && formatDate(job.startDate)}
                        {job.endDate ? ` – ${formatDate(job.endDate)}` : " – Present"}
                      </div>
                    </div>
                    
                    {job.summary && (
                      <p className="text-gray-700 mb-2 leading-relaxed">
                        {job.summary}
                      </p>
                    )}
                    
                    {job.highlights && job.highlights.length > 0 && (
                      <ul className="text-gray-700 space-y-1">
                        {job.highlights.map((highlight: string, idx: number) => (
                          <li key={idx} className="flex items-start">
                            <span className="text-gray-400 mr-2 mt-1">•</span>
                            <span>{highlight}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Education */}
            {education.length > 0 && (
              <div className="mb-8">
                <h3 className="text-lg font-medium text-gray-900 mb-4 border-b border-gray-200 pb-1">
                  Education
                </h3>
                {education.map((edu: any, index: number) => (
                  <div key={index} className="mb-4 last:mb-0">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-1">
                      <div>
                        <h4 className="font-medium text-gray-900">
                          {edu.studyType} {edu.area && `in ${edu.area}`}
                        </h4>
                        <p className="text-gray-600">
                          {edu.institution}
                        </p>
                      </div>
                      <div className="text-sm text-gray-500 mt-1 sm:mt-0">
                        {edu.startDate && formatDate(edu.startDate)}
                        {edu.endDate ? ` – ${formatDate(edu.endDate)}` : edu.startDate && " – Present"}
                      </div>
                    </div>
                    {edu.gpa && (
                      <p className="text-sm text-gray-600">GPA: {edu.gpa}</p>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Skills */}
            {skills.length > 0 && (
              <div className="mb-8">
                <h3 className="text-lg font-medium text-gray-900 mb-4 border-b border-gray-200 pb-1">
                  Skills
                </h3>
                <div className="space-y-3">
                  {skills.map((skill: any, index: number) => (
                    <div key={index}>
                      {typeof skill === 'string' ? (
                        <span className="inline-block bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm mr-2 mb-2">
                          {skill}
                        </span>
                      ) : (
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">
                            {skill.name}
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {skill.keywords?.map((keyword: string, kidx: number) => (
                              <span key={kidx} className="inline-block bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                                {keyword}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Projects */}
            {projects.length > 0 && (
              <div className="mb-8">
                <h3 className="text-lg font-medium text-gray-900 mb-4 border-b border-gray-200 pb-1">
                  Projects
                </h3>
                {projects.map((project: any, index: number) => (
                  <div key={index} className="mb-6 last:mb-0">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-2">
                      <div>
                        <h4 className="font-medium text-gray-900">
                          {project.name}
                        </h4>
                        {project.url && (
                          <p className="text-blue-600 text-sm">
                            {project.url}
                          </p>
                        )}
                      </div>
                      <div className="text-sm text-gray-500 mt-1 sm:mt-0">
                        {project.startDate && formatDate(project.startDate)}
                        {project.endDate ? ` – ${formatDate(project.endDate)}` : project.startDate && " – Present"}
                      </div>
                    </div>
                    
                    {project.description && (
                      <p className="text-gray-700 mb-2 leading-relaxed">
                        {project.description}
                      </p>
                    )}
                    
                    {project.highlights && project.highlights.length > 0 && (
                      <ul className="text-gray-700 space-y-1">
                        {project.highlights.map((highlight: string, idx: number) => (
                          <li key={idx} className="flex items-start">
                            <span className="text-gray-400 mr-2 mt-1">•</span>
                            <span>{highlight}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                    
                    {project.keywords && project.keywords.length > 0 && (
                      <div className="mt-2">
                        <div className="flex flex-wrap gap-1">
                          {project.keywords.map((keyword: string, kidx: number) => (
                            <span key={kidx} className="inline-block bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs">
                              {keyword}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Languages */}
            {languages.length > 0 && (
              <div className="mb-8">
                <h3 className="text-lg font-medium text-gray-900 mb-4 border-b border-gray-200 pb-1">
                  Languages
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {languages.map((lang: any, index: number) => (
                    <div key={index} className="flex justify-between">
                      <span className="text-gray-900">{lang.language}</span>
                      <span className="text-gray-600 text-sm">{lang.fluency}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Interests */}
            {interests.length > 0 && (
              <div className="mb-8">
                <h3 className="text-lg font-medium text-gray-900 mb-4 border-b border-gray-200 pb-1">
                  Interests
                </h3>
                <div className="flex flex-wrap gap-2">
                  {interests.map((interest: any, index: number) => (
                    <span key={index} className="inline-block bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                      {typeof interest === 'string' ? interest : interest.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    );
  }

  // Modern Theme - Comprehensive JSON Resume Rendering
  if (theme === "modern") {
    return (
      <div className="lg:col-span-1">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Resume Preview - Modern Theme</h3>
        <div className={`${forceLightMode ? 'bg-slate-50 border-slate-200' : 'bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-gray-600'} rounded-lg p-4 overflow-auto`} style={{ height: '70vh' }}>
          <div className={`${forceLightMode ? 'bg-white' : 'bg-white dark:bg-gray-900'} rounded shadow-sm p-6 text-sm space-y-4`}>
            
            {/* Header Section */}
            <div className="text-center border-b border-blue-100 pb-4">
              <h1 className={`text-2xl font-bold ${forceLightMode ? 'text-gray-900' : 'text-gray-900 dark:text-white'} mb-1`}>
                {basics.name || "Your Name"}
              </h1>
              {basics.label && (
                <p className="text-blue-600 dark:text-blue-400 font-medium mb-2">
                  {basics.label}
                </p>
              )}
              
              {/* Contact Information */}
              <div className="text-xs text-gray-600 dark:text-gray-400 space-x-2 flex flex-wrap justify-center gap-x-3">
                {basics.email && <span>📧 {basics.email}</span>}
                {basics.phone && <span>📞 {basics.phone}</span>}
                {basics.url && <span>🌐 {basics.url}</span>}
                {basics.location?.city && (
                  <span>📍 {basics.location.city}{basics.location.region && `, ${basics.location.region}`}</span>
                )}
              </div>
              
              {/* Social Profiles */}
              {basics.profiles && basics.profiles.length > 0 && (
                <div className="text-xs text-gray-600 dark:text-gray-400 mt-1 flex flex-wrap justify-center gap-x-2">
                  {basics.profiles.map((profile: any, index: number) => (
                    <span key={index}>
                      {profile.network}: {profile.username || profile.url}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Summary */}
            {basics.summary && (
              <div>
                <h2 className="text-sm font-bold text-blue-600 dark:text-blue-400 border-b border-gray-200 dark:border-gray-700 pb-1 mb-2">
                  PROFESSIONAL SUMMARY
                </h2>
                <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">
                  {basics.summary}
                </p>
              </div>
            )}

            {/* Work Experience */}
            {work.length > 0 && (
              <div>
                <h2 className="text-sm font-bold text-blue-600 dark:text-blue-400 border-b border-gray-200 dark:border-gray-700 pb-1 mb-2">
                  WORK EXPERIENCE
                </h2>
                {work.map((job: any, index: number) => (
                  <div key={index} className="mb-3 last:mb-0">
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white text-xs">
                        {job.position || "Position"}
                      </h3>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {formatDate(job.startDate)}{job.endDate ? ` - ${formatDate(job.endDate)}` : " - Present"}
                      </span>
                    </div>
                    <p className="text-xs text-blue-600 dark:text-blue-400 font-medium mb-1">
                      {job.name || job.company || "Company"}
                      {job.location && <span className="text-gray-500 dark:text-gray-400"> • {job.location}</span>}
                    </p>
                    {job.summary && (
                      <p className="text-xs text-gray-700 dark:text-gray-300 mb-1">
                        {job.summary}
                      </p>
                    )}
                    {job.highlights && job.highlights.length > 0 && (
                      <ul className="text-xs text-gray-700 dark:text-gray-300 ml-3 list-disc space-y-0.5">
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
                <div className="space-y-2">
                  {skills.map((skill: any, index: number) => (
                    <div key={index}>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-medium text-gray-900 dark:text-white">
                          {skill.name || `Skill ${index + 1}`}
                        </span>
                        {skill.level && (
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {skill.level}
                          </span>
                        )}
                      </div>
                      {skill.level && (
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1">
                          <div 
                            className="bg-blue-600 h-1 rounded-full" 
                            style={{ width: `${getSkillPercentage(skill.level)}%` }}
                          ></div>
                        </div>
                      )}
                      {skill.keywords && skill.keywords.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {skill.keywords.slice(0, 6).map((keyword: string, kidx: number) => (
                            <Badge key={kidx} variant="secondary" className="text-xs px-2 py-0">
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
                <div className="grid grid-cols-2 gap-2">
                  {languages.map((lang: any, index: number) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-xs font-medium text-gray-900 dark:text-white">
                        {lang.language || `Language ${index + 1}`}
                      </span>
                      <span className="text-xs text-gray-600 dark:text-gray-400">
                        {lang.fluency || "Fluent"}
                      </span>
                    </div>
                  ))}
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
                          <Badge key={kidx} variant="outline" className="text-xs px-1 py-0">
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
                    <Badge key={index} variant="secondary" className="text-xs px-2 py-1">
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
