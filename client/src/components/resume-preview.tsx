import { Badge } from "@/components/ui/badge";
import type { Resume } from "@shared/schema";
import type { JSONResumeSchema } from "@/lib/types";

interface ResumePreviewProps {
  resume: Resume | null;
  theme?: string;
}

export default function ResumePreview({ resume, theme = "modern" }: ResumePreviewProps) {
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

  // James Clark Professional Theme Preview
  if (theme === "james-clark") {
    return (
      <div className="lg:col-span-1">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Resume Preview - James Clark Professional</h3>
        <div className="bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-gray-600 rounded-lg p-4 h-96 overflow-auto">
          <div className="bg-white shadow-lg rounded-lg overflow-hidden transform scale-50 origin-top-left" style={{ width: '400px', height: '500px' }}>
            {/* Purple Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-4 relative">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 rounded flex items-center justify-center text-lg font-bold">
                  {basics.name?.charAt(0) || 'E'}
                </div>
                <div>
                  <h1 className="text-lg font-bold tracking-wide">{basics.name || 'EZRA TER LINDEN'}</h1>
                  <p className="text-sm opacity-90">{basics.label || 'Lead Software Developer'}</p>
                </div>
              </div>
              <div className="absolute top-4 right-4 text-right text-xs">
                {basics.email && <div>📧 {basics.email}</div>}
                {basics.phone && <div>📞 {basics.phone}</div>}
                {basics.location?.city && <div>📍 {basics.location.city}</div>}
              </div>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-5 gap-0">
              {/* Sidebar */}
              <div className="col-span-2 bg-indigo-50 p-3 space-y-4">
                <div>
                  <h2 className="text-sm font-bold text-gray-800 mb-2 flex items-center gap-1">
                    <span className="w-3 h-3 bg-indigo-600 rounded-full"></span>
                    SKILLS
                  </h2>
                  {skills.slice(0, 3).map((skill, index) => {
                    const skillName = typeof skill === 'string' ? skill : skill.name || 'Skill';
                    const level = typeof skill === 'object' && skill.level ? skill.level : 'Expert';
                    const percentage = getSkillPercentage(level);
                    return (
                      <div key={index} className="mb-2">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="font-medium">{skillName.slice(0, 15)}</span>
                          <span>{Math.round(percentage/10)}</span>
                        </div>
                        <div className="h-1 bg-gray-200 rounded overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-indigo-600 to-purple-600" style={{ width: `${percentage}%` }}></div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {languages.length > 0 && (
                  <div>
                    <h2 className="text-sm font-bold text-gray-800 mb-2 flex items-center gap-1">
                      <span className="w-3 h-3 bg-indigo-600 rounded-full"></span>
                      LANGUAGES
                    </h2>
                    <div className="space-y-2">
                      {languages.slice(0, 2).map((lang, index) => {
                        const name = typeof lang === 'string' ? lang : lang.language || 'Language';
                        const fluency = typeof lang === 'object' && lang.fluency ? lang.fluency : 'Native';
                        const percentage = getFluencyPercentage(fluency);
                        return (
                          <div key={index} className="text-center">
                            <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-xs mx-auto mb-1">
                              {percentage}%
                            </div>
                            <div className="text-xs">{name}</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Main Content */}
              <div className="col-span-3 p-3 space-y-3">
                {basics.summary && (
                  <div>
                    <h2 className="text-sm font-bold text-gray-800 mb-2 flex items-center gap-1">
                      <span className="w-3 h-3 bg-indigo-600 rounded-full"></span>
                      SUMMARY
                    </h2>
                    <p className="text-xs text-gray-700 leading-tight">{basics.summary.slice(0, 120)}...</p>
                  </div>
                )}

                {work.length > 0 && (
                  <div>
                    <h2 className="text-sm font-bold text-gray-800 mb-2 flex items-center gap-1">
                      <span className="w-3 h-3 bg-indigo-600 rounded-full"></span>
                      EXPERIENCE
                    </h2>
                    {work.slice(0, 2).map((job, index) => (
                      <div key={index} className="mb-3 pb-2 border-b border-gray-200 last:border-b-0">
                        <h3 className="text-xs font-bold text-gray-800">{job.position}</h3>
                        <div className="text-xs text-indigo-600 font-medium">{job.name || job.company}</div>
                        <div className="text-xs text-gray-600">{formatDate(job.startDate)}-{job.endDate ? formatDate(job.endDate) : 'Present'}</div>
                        {job.summary && <p className="text-xs text-gray-700 mt-1">{job.summary.slice(0, 100)}...</p>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Default Theme Preview
  return (
    <div className="lg:col-span-1">
      <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Resume Preview - {theme.charAt(0).toUpperCase() + theme.slice(1)} Theme</h3>
      <div className="bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-gray-600 rounded-lg p-4 h-96 overflow-auto">
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
