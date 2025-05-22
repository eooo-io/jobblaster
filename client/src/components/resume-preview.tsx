import { Badge } from "@/components/ui/badge";
import type { Resume } from "@shared/schema";

interface ResumePreviewProps {
  resume: Resume | null;
}

export default function ResumePreview({ resume }: ResumePreviewProps) {
  if (!resume?.jsonData) {
    return (
      <div className="lg:col-span-1">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Resume Preview</h3>
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 h-96 overflow-auto">
          <div className="flex items-center justify-center h-full text-slate-500">
            <div className="text-center">
              <div className="w-12 h-12 bg-slate-200 rounded-lg mx-auto mb-2"></div>
              <p className="text-sm">Upload a resume to see the preview</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const resumeData = resume.jsonData;
  const basics = resumeData.basics || {};
  const work = resumeData.work || [];
  const skills = resumeData.skills || [];
  const education = resumeData.education || [];

  return (
    <div className="lg:col-span-1">
      <h3 className="text-lg font-semibold text-slate-900 mb-4">Resume Preview</h3>
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 h-96 overflow-auto">
        <div className="bg-white rounded shadow-sm p-6 text-sm">
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
