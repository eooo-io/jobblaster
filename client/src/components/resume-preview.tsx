import { Button } from "@/components/ui/button";
import type { JSONResumeSchema } from "@/lib/types";
import type { Resume, User } from "@shared/schema";
import { Download, Mail, MapPin, Phone } from "lucide-react";
import React from "react";

interface ResumePreviewProps {
  resume: Resume | null;
  theme?: string;
  showDownloadButton?: boolean;
  user?: User | null;
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      div: React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>;
      span: React.DetailedHTMLProps<React.HTMLAttributes<HTMLSpanElement>, HTMLSpanElement>;
      img: React.DetailedHTMLProps<React.ImgHTMLAttributes<HTMLImageElement>, HTMLImageElement>;
      i: React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
      h1: React.DetailedHTMLProps<React.HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement>;
      h2: React.DetailedHTMLProps<React.HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement>;
      h3: React.DetailedHTMLProps<React.HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement>;
      h4: React.DetailedHTMLProps<React.HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement>;
      p: React.DetailedHTMLProps<React.HTMLAttributes<HTMLParagraphElement>, HTMLParagraphElement>;
      ul: React.DetailedHTMLProps<React.HTMLAttributes<HTMLUListElement>, HTMLUListElement>;
      li: React.DetailedHTMLProps<React.LiHTMLAttributes<HTMLLIElement>, HTMLLIElement>;
      a: React.DetailedHTMLProps<React.AnchorHTMLAttributes<HTMLAnchorElement>, HTMLAnchorElement>;
    }
  }
}

export default function ResumePreview({
  resume,
  theme = "modern",
  showDownloadButton = true,
  user,
}: ResumePreviewProps) {
  if (!resume?.jsonData) {
    return null;
  }

  const resumeData = resume.jsonData as JSONResumeSchema;
  const {
    basics = {},
    work = [],
    education = [],
    skills = [],
    languages = [],
    projects = [],
  } = resumeData;

  // Helper function to get the appropriate icon component for social profiles
  const getProfileIcon = (network: string | undefined) => {
    const networkLower = network?.toLowerCase() || "link";
    switch (networkLower) {
      case "github":
        return <i className="fab fa-github text-gray-600 mr-2 w-4 h-4" />;
      case "linkedin":
        return <i className="fab fa-linkedin text-gray-600 mr-2 w-4 h-4" />;
      case "twitter":
        return <i className="fab fa-twitter text-gray-600 mr-2 w-4 h-4" />;
      case "facebook":
        return <i className="fab fa-facebook text-gray-600 mr-2 w-4 h-4" />;
      case "instagram":
        return <i className="fab fa-instagram text-gray-600 mr-2 w-4 h-4" />;
      case "stackoverflow":
        return <i className="fab fa-stack-overflow text-gray-600 mr-2 w-4 h-4" />;
      case "medium":
        return <i className="fab fa-medium text-gray-600 mr-2 w-4 h-4" />;
      case "behance":
        return <i className="fab fa-behance text-gray-600 mr-2 w-4 h-4" />;
      case "dribbble":
        return <i className="fab fa-dribbble text-gray-600 mr-2 w-4 h-4" />;
      case "gitlab":
        return <i className="fab fa-gitlab text-gray-600 mr-2 w-4 h-4" />;
      case "bitbucket":
        return <i className="fab fa-bitbucket text-gray-600 mr-2 w-4 h-4" />;
      default:
        return <i className="fas fa-link text-gray-600 mr-2 w-4 h-4" />;
    }
  };

  // Format date helper
  const formatDate = (dateStr: string | undefined): string => {
    if (!dateStr) return "";

    // Handle YYYY-MM format (e.g., "2020-11" -> "Nov 2020")
    if (dateStr.match(/^\d{4}-\d{2}$/)) {
      const [year, month] = dateStr.split("-");
      const monthNames = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];
      const monthIndex = parseInt(month, 10) - 1;
      return `${monthNames[monthIndex]} ${year}`;
    }

    // Handle other date formats
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) {
      return dateStr; // Return as-is if not a valid date
    }

    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    return `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
  };

  // Handle PDF download
  const handleDownloadPDF = () => {
    if (!resume?.jsonData) return;

    const resumeName = basics.name || resume.name || "Resume";

    // Create a new window with the resume content for PDF generation
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    // Get the resume content
    const resumeElement = document.querySelector(".resume-content");
    if (!resumeElement) return;

    // Get all current stylesheets
    const stylesheets = Array.from(document.styleSheets)
      .map((sheet) => {
        try {
          return Array.from(sheet.cssRules)
            .map((rule) => rule.cssText)
            .join("\n");
        } catch (e) {
          return "";
        }
      })
      .join("\n");

    // Create HTML for PDF
    const pdfContent = `
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
                size: A4;
              }
              .resume-content {
                width: 210mm;
                min-height: 297mm;
                max-width: none !important;
                margin: 0 auto !important;
                box-shadow: none !important;
                border: none !important;
                border-radius: 0 !important;
                padding: 0 !important;
              }
              * {
                -webkit-print-color-adjust: exact !important;
                color-adjust: exact !important;
              }
              a {
                color: #2563eb !important;
                text-decoration: none !important;
              }
            }

            /* Ensure consistent spacing and layout */
            body {
              background: white !important;
              font-size: 14px;
              line-height: 1.4;
            }

            /* A4 dimensions for preview */
            .resume-content {
              width: 210mm;
              min-height: 297mm;
              margin: 0 auto !important;
              background: white;
              position: relative;
            }
          </style>
          <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
        </head>
        <body>
          ${resumeElement.outerHTML}
          <script>
            window.onload = function() {
              setTimeout(() => {
                window.print();
                setTimeout(() => window.close(), 1000);
              }, 500);
            }
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(pdfContent);
    printWindow.document.close();
  };

  // Modern Theme
  if (theme === "modern") {
    return (
      <div className="lg:col-span-1">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-900">Resume Preview - Modern Theme</h3>
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
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 overflow-auto">
          <div className="flex justify-center">
            <div className="resume-content bg-white shadow-lg rounded-lg w-[210mm] min-h-[297mm] p-8 relative">
              {/* Page number */}
              <div className="absolute bottom-4 right-4 text-sm text-gray-400">Page 1</div>

              {/* Content */}
              <div className="space-y-6">
                {/* Header Section */}
                <div className="border-b pb-6">
                  <h1 className="text-3xl font-bold text-gray-900">{basics.name}</h1>
                  <p className="text-lg text-gray-600 mt-1">{basics.label}</p>

                  {/* Contact Info */}
                  <div className="mt-4 flex flex-wrap gap-4">
                    {basics.email && (
                      <div className="flex items-center text-gray-600">
                        <Mail className="h-4 w-4 mr-2" />
                        <a href={`mailto:${basics.email}`} className="hover:text-blue-600">
                          {basics.email}
                        </a>
                      </div>
                    )}
                    {basics.phone && (
                      <div className="flex items-center text-gray-600">
                        <Phone className="h-4 w-4 mr-2" />
                        <a href={`tel:${basics.phone}`} className="hover:text-blue-600">
                          {basics.phone}
                        </a>
                      </div>
                    )}
                    {basics.location && basics.location.city && (
                      <div className="flex items-center text-gray-600">
                        <MapPin className="h-4 w-4 mr-2" />
                        <span>
                          {basics.location.city}
                          {basics.location.region && `, ${basics.location.region}`}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Social Profiles */}
                  {basics.profiles && basics.profiles.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-4">
                      {basics.profiles.map((profile, index) => (
                        <a
                          key={index}
                          href={profile.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center text-gray-600 hover:text-blue-600"
                        >
                          {getProfileIcon(profile.network)}
                          <span>{profile.username}</span>
                        </a>
                      ))}
                    </div>
                  )}
                </div>

                {/* Summary Section */}
                {basics.summary && (
                  <div className="space-y-2">
                    <h2 className="text-xl font-semibold text-gray-900">Summary</h2>
                    <p className="text-gray-700 whitespace-pre-wrap">{basics.summary}</p>
                  </div>
                )}

                {/* Work Experience */}
                {work.length > 0 && (
                  <div className="space-y-4">
                    <h2 className="text-xl font-semibold text-gray-900">Experience</h2>
                    {work.map((job, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="text-lg font-medium text-gray-900">{job.position}</h3>
                            <p className="text-gray-600">{job.company}</p>
                          </div>
                          <p className="text-sm text-gray-500">
                            {job.startDate} - {job.endDate || "Present"}
                          </p>
                        </div>
                        {job.summary && <p className="text-gray-700">{job.summary}</p>}
                        {job.highlights && job.highlights.length > 0 && (
                          <ul className="list-disc list-inside space-y-1 text-gray-700">
                            {job.highlights.map((highlight, i) => (
                              <li key={i}>{highlight}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Skills Section */}
                {skills.length > 0 && (
                  <div className="space-y-4">
                    <h2 className="text-xl font-semibold text-gray-900">Skills</h2>
                    <div className="grid grid-cols-2 gap-4">
                      {skills.map((skill, index) => (
                        <div key={index} className="space-y-2">
                          <h3 className="font-medium text-gray-900">{skill.name}</h3>
                          {skill.keywords && (
                            <div className="flex flex-wrap gap-2">
                              {skill.keywords.map((keyword, i) => (
                                <span
                                  key={i}
                                  className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm"
                                >
                                  {keyword}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Education Section */}
                {education.length > 0 && (
                  <div className="space-y-4">
                    <h2 className="text-xl font-semibold text-gray-900">Education</h2>
                    {education.map((edu, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="text-lg font-medium text-gray-900">{edu.institution}</h3>
                            <p className="text-gray-600">
                              {edu.area} - {edu.studyType}
                            </p>
                          </div>
                          <p className="text-sm text-gray-500">
                            {edu.startDate} - {edu.endDate || "Present"}
                          </p>
                        </div>
                        {edu.score && <p className="text-gray-700">GPA: {edu.score}</p>}
                      </div>
                    ))}
                  </div>
                )}

                {/* Projects Section */}
                {projects.length > 0 && (
                  <div className="space-y-4">
                    <h2 className="text-xl font-semibold text-gray-900">Projects</h2>
                    {projects.map((project, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="text-lg font-medium text-gray-900">{project.name}</h3>
                            {project.url && (
                              <a
                                href={project.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline text-sm"
                              >
                                {project.url}
                              </a>
                            )}
                          </div>
                          {project.endDate && (
                            <p className="text-sm text-gray-500">{project.endDate}</p>
                          )}
                        </div>
                        {project.description && (
                          <p className="text-gray-700">{project.description}</p>
                        )}
                        {project.highlights && project.highlights.length > 0 && (
                          <ul className="list-disc list-inside space-y-1 text-gray-700">
                            {project.highlights.map((highlight, i) => (
                              <li key={i}>{highlight}</li>
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
      </div>
    );
  }

  // Paper++ Theme
  if (theme === "paper++") {
    return (
      <div className="lg:col-span-1">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-900">Resume Preview - Paper++ Theme</h3>
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
        <div
          className="bg-slate-50 border border-slate-200 rounded-lg p-4 overflow-auto"
          style={{ height: "90vh" }}
        >
          <div className="relative flex justify-center">
            <div className="resume-content bg-white rounded shadow-sm p-8 max-w-4xl mx-auto">
              {/* Header */}
              <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">{basics.name || "Your Name"}</h1>
                {basics.label && <h2 className="text-xl text-gray-600 mb-4">{basics.label}</h2>}

                {/* Contact Section */}
                <div className="flex flex-wrap gap-4 text-sm">
                  {basics.email && (
                    <div className="flex items-center">
                      <i className="fas fa-envelope mr-2"></i>
                      <a
                        href={`mailto:${basics.email}`}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        {basics.email}
                      </a>
                    </div>
                  )}
                  {basics.phone && (
                    <div className="flex items-center">
                      <i className="fas fa-phone mr-2"></i>
                      <span>{basics.phone}</span>
                    </div>
                  )}
                  {basics.url && (
                    <div className="flex items-center">
                      <i className="fas fa-globe mr-2"></i>
                      <a
                        href={basics.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800"
                      >
                        {basics.url}
                      </a>
                    </div>
                  )}
                </div>

                {/* Location */}
                {basics.location && (
                  <div className="mt-2 text-sm text-gray-600">
                    {basics.location.city && <span>{basics.location.city}</span>}
                    {basics.location.region && <span>, {basics.location.region}</span>}
                    {basics.location.countryCode && <span>, {basics.location.countryCode}</span>}
                  </div>
                )}

                {/* Profiles */}
                {basics.profiles && basics.profiles.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-4">
                    {basics.profiles.map((profile: any, index: number) => (
                      <a
                        key={index}
                        href={profile.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center text-sm text-blue-600 hover:text-blue-800"
                      >
                        {getProfileIcon(profile.network)}
                        {profile.username || profile.url}
                      </a>
                    ))}
                  </div>
                )}
              </div>

              {/* About Me */}
              {basics.summary && (
                <div className="mb-8">
                  <h3 className="text-xl font-bold mb-3 text-gray-800">About Me</h3>
                  <p className="text-gray-700 leading-relaxed">{basics.summary}</p>
                </div>
              )}

              {/* Work Experience */}
              {work.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-xl font-bold mb-4 text-gray-800">Work Experience</h3>
                  <div className="space-y-6">
                    {work.map((job: any, index: number) => (
                      <div key={index} className="pb-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="text-lg font-semibold text-gray-800">{job.position}</h4>
                            <div className="text-gray-600">
                              {job.name || job.company}
                              {job.location && <span> • {job.location}</span>}
                            </div>
                          </div>
                          <div className="text-sm text-gray-600">
                            {formatDate(job.startDate)}
                            {job.endDate ? ` to ${formatDate(job.endDate)}` : " to Present"}
                          </div>
                        </div>
                        {job.summary && (
                          <p className="text-gray-700 mb-2 leading-relaxed">{job.summary}</p>
                        )}
                        {job.highlights && job.highlights.length > 0 && (
                          <ul className="list-disc list-inside space-y-1 text-gray-700">
                            {job.highlights.map((highlight: string, idx: number) => (
                              <li key={idx} className="leading-relaxed">
                                {highlight}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Education */}
              {education.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-xl font-bold mb-4 text-gray-800">Education</h3>
                  <div className="space-y-4">
                    {education.map((edu: any, index: number) => (
                      <div key={index} className="pb-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="text-lg font-semibold text-gray-800">
                              {edu.studyType} {edu.area}
                            </h4>
                            <div className="text-gray-600">{edu.institution}</div>
                          </div>
                          <div className="text-sm text-gray-600">
                            {formatDate(edu.startDate)}
                            {edu.endDate ? ` to ${formatDate(edu.endDate)}` : ""}
                          </div>
                        </div>
                        {edu.score && <div className="text-gray-700">GPA: {edu.score}</div>}
                        {edu.courses && edu.courses.length > 0 && (
                          <div className="text-gray-700 mt-2">
                            <span className="font-medium">Relevant Courses:</span>{" "}
                            {edu.courses.join(", ")}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Skills */}
              {skills.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-xl font-bold mb-4 text-gray-800">Skills</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {skills.map((skill: any, index: number) => (
                      <div key={index} className="bg-gray-50 rounded p-3 border border-gray-200">
                        <h4 className="font-semibold text-gray-800 mb-2">
                          {typeof skill === "string" ? skill : skill.name}
                        </h4>
                        {skill.keywords && (
                          <div className="flex flex-wrap gap-2">
                            {skill.keywords.map((keyword: string, idx: number) => (
                              <span
                                key={idx}
                                className="px-2 py-1 bg-gray-100 text-gray-700 text-sm rounded"
                              >
                                {keyword}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Projects */}
              {projects.length > 0 && (
                <div>
                  <h3 className="text-xl font-bold mb-4 text-gray-800">Projects</h3>
                  <div className="space-y-6">
                    {projects.map((project: any, index: number) => (
                      <div key={index} className="pb-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="text-lg font-semibold text-gray-800">{project.name}</h4>
                            {project.url && (
                              <a
                                href={project.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="ml-2 text-sm text-blue-600 hover:text-blue-800"
                              >
                                {project.url}
                              </a>
                            )}
                          </div>
                          {project.endDate && (
                            <div className="text-sm text-gray-600">{project.endDate}</div>
                          )}
                        </div>
                        {project.description && (
                          <p className="text-gray-700 mb-2">{project.description}</p>
                        )}
                        {project.highlights && project.highlights.length > 0 && (
                          <ul className="list-disc list-inside space-y-1 text-gray-700">
                            {project.highlights.map((highlight: string, idx: number) => (
                              <li key={idx}>{highlight}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Lucide Theme
  if (theme === "lucide") {
    return (
      <div className="lg:col-span-1">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-900">Resume Preview - Lucide Theme</h3>
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
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 overflow-auto h-[90vh]">
          <div className="flex justify-center">
            <div className="resume-content bg-white rounded shadow-sm p-8 max-w-4xl mx-auto">
              {/* Header Section */}
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{basics.name}</h1>
                {basics.label && <p className="text-xl text-gray-600">{basics.label}</p>}

                {/* Contact Info */}
                <div className="mt-4 flex justify-center gap-4 text-sm text-gray-600">
                  {basics.email && (
                    <a href={`mailto:${basics.email}`} className="hover:text-blue-600">
                      {basics.email}
                    </a>
                  )}
                  {basics.phone && <span>{basics.phone}</span>}
                  {basics.location && basics.location.city && (
                    <span>
                      {basics.location.city}
                      {basics.location.region && `, ${basics.location.region}`}
                    </span>
                  )}
                </div>

                {/* Social Profiles */}
                {basics.profiles && basics.profiles.length > 0 && (
                  <div className="text-xs flex flex-wrap justify-center gap-x-2">
                    {basics.profiles.map((profile: any, index: number) => (
                      <a
                        key={index}
                        href={profile.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-700"
                      >
                        {getProfileIcon(profile.network)}
                        {profile.username}
                      </a>
                    ))}
                  </div>
                )}
              </div>

              {/* Summary */}
              {basics.summary && (
                <div className="mb-8">
                  <p className="text-gray-700 leading-relaxed">{basics.summary}</p>
                </div>
              )}

              {/* Work Experience */}
              {work.length > 0 && (
                <div className="mb-8">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Experience</h2>
                  {work.map((job: any, index: number) => (
                    <div key={index} className="mb-6 last:mb-0">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{job.position}</h3>
                          <p className="text-gray-600">{job.name || job.company}</p>
                        </div>
                        <span className="text-sm text-gray-600">
                          {formatDate(job.startDate)}
                          {job.endDate ? ` - ${formatDate(job.endDate)}` : " - Present"}
                        </span>
                      </div>
                      {job.summary && <p className="text-gray-700 mb-2">{job.summary}</p>}
                      {job.highlights && job.highlights.length > 0 && (
                        <ul className="list-disc list-inside space-y-1 text-gray-700">
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
                <div className="mb-8">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Education</h2>
                  {education.map((edu: any, index: number) => (
                    <div key={index} className="mb-4 last:mb-0">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {edu.studyType} {edu.area}
                          </h3>
                          <p className="text-gray-600">{edu.institution}</p>
                        </div>
                        <span className="text-sm text-gray-600">
                          {formatDate(edu.startDate)}
                          {edu.endDate ? ` - ${formatDate(edu.endDate)}` : ""}
                        </span>
                      </div>
                      {edu.score && <p className="text-gray-700">GPA: {edu.score}</p>}
                      {edu.courses && edu.courses.length > 0 && (
                        <p className="text-gray-700 mt-1">
                          Relevant coursework: {edu.courses.join(", ")}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Skills */}
              {skills.length > 0 && (
                <div className="mb-8">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Skills</h2>
                  <div className="grid grid-cols-2 gap-4">
                    {skills.map((skill: any, index: number) => (
                      <div key={index} className="bg-gray-50 rounded p-3 border border-gray-200">
                        <h3 className="font-semibold text-gray-900">
                          {typeof skill === "string" ? skill : skill.name}
                        </h3>
                        {skill.keywords && (
                          <div className="flex flex-wrap gap-2 mt-2">
                            {skill.keywords.map((keyword: string, idx: number) => (
                              <span
                                key={idx}
                                className="px-2 py-1 bg-gray-100 text-gray-700 text-sm rounded"
                              >
                                {keyword}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Projects */}
              {projects.length > 0 && (
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Projects</h2>
                  {projects.map((project: any, index: number) => (
                    <div key={index} className="mb-6 last:mb-0">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{project.name}</h3>
                          {project.url && (
                            <a
                              href={project.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 text-sm"
                            >
                              {project.url}
                            </a>
                          )}
                        </div>
                        {project.endDate && (
                          <span className="text-sm text-gray-600">{project.endDate}</span>
                        )}
                      </div>
                      {project.description && (
                        <p className="text-gray-700 mb-2">{project.description}</p>
                      )}
                      {project.highlights && project.highlights.length > 0 && (
                        <ul className="list-disc list-inside space-y-1 text-gray-700">
                          {project.highlights.map((highlight: string, idx: number) => (
                            <li key={idx}>{highlight}</li>
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

  // Clean-DE Theme
  if (theme === "clean-de") {
    return (
      <div className="lg:col-span-1">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-900">Resume Preview - Clean-DE Theme</h3>
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
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 overflow-auto h-[90vh]">
          <div className="flex justify-center">
            <div className="resume-content bg-white rounded shadow-sm p-8">
              {/* Header Section */}
              <div className="bg-gray-100 border-b border-gray-200 py-8 mb-12">
                <div className="flex items-center px-8 gap-8">
                  {/* Left Side - Info */}
                  <div className="flex-grow text-left">
                    <h1 className="text-2xl font-bold text-gray-900 mb-3">
                      {basics.name || "Your Name"}
                    </h1>
                    {basics.label && (
                      <p className="text-gray-600 font-medium mb-3">{basics.label}</p>
                    )}

                    {/* Contact Information */}
                    <div className="text-xs text-gray-600 space-y-2">
                      {basics.email && (
                        <div className="flex items-center text-gray-600">
                          <Mail className="h-4 w-4 mr-2" />
                          <a href={`mailto:${basics.email}`} className="hover:text-blue-600">
                            {basics.email}
                          </a>
                        </div>
                      )}
                      {basics.phone && (
                        <div className="flex items-center text-gray-600">
                          <Phone className="h-4 w-4 mr-2" />
                          <a href={`tel:${basics.phone}`} className="hover:text-blue-600">
                            {basics.phone}
                          </a>
                        </div>
                      )}
                      {basics.location && basics.location.city && (
                        <div className="flex items-center text-gray-600">
                          <MapPin className="h-4 w-4 mr-2" />
                          <span>
                            {basics.location.city}
                            {basics.location.region && `, ${basics.location.region}`}
                            {basics.location.countryCode && `, ${basics.location.countryCode}`}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Side - Profile Picture */}
                  <div className="flex-shrink-0">
                    <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg">
                      {user?.profilePicture ? (
                        <img
                          src={user.profilePicture}
                          alt={basics.name || "Profile"}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-600 text-2xl font-bold">
                          {basics.name
                            ? basics.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                                .toUpperCase()
                            : "U"}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Summary */}
              {basics.summary && (
                <div className="mb-12">
                  <div className="border-t border-gray-200 mb-6"></div>
                  <h2 className="text-xl font-bold mb-6 text-gray-900">SUMMARY</h2>
                  <p className="text-gray-700 leading-relaxed">{basics.summary}</p>
                </div>
              )}

              {/* Work Experience */}
              {work.length > 0 && (
                <div className="mb-12">
                  <div className="border-t border-gray-200 mb-6"></div>
                  <h2 className="text-xl font-bold mb-6 text-gray-900">EXPERIENCE</h2>
                  <div className="space-y-6">
                    {work.map((job: any, index: number) => (
                      <div
                        key={index}
                        className="relative pl-6 pb-6 border-l-2 border-gray-200 last:border-l-0 last:pb-0"
                      >
                        <div className="absolute -left-1.5 top-0 w-2.5 h-2.5 bg-white border-2 border-gray-300 rounded-full"></div>
                        <div className="mb-2">
                          <span className="text-gray-600 font-mono text-sm">
                            {job.startDate && formatDate(job.startDate)} -{" "}
                            {job.endDate ? formatDate(job.endDate) : "Present"}
                          </span>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">{job.position}</h3>
                        <div className="text-gray-600 mb-2">
                          {job.name || job.company}
                          {job.location && <span className="ml-2">{job.location}</span>}
                        </div>
                        {job.summary && <p className="text-gray-700 mb-2">{job.summary}</p>}
                        {job.highlights && job.highlights.length > 0 && (
                          <ul className="space-y-2">
                            {job.highlights.map((highlight: string, idx: number) => (
                              <li key={idx} className="text-gray-700 flex items-start">
                                <span className="text-gray-400 mr-2">•</span>
                                <span>{highlight}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Skills */}
              {skills.length > 0 && (
                <div className="mb-12">
                  <div className="border-t border-gray-200 mb-6"></div>
                  <h2 className="text-xl font-bold mb-6 text-gray-900">SKILLS</h2>
                  <div className="grid grid-cols-2 gap-4">
                    {skills.map((skill: any, index: number) => (
                      <div key={index} className="bg-gray-50 rounded p-4 border border-gray-200">
                        <h3 className="font-semibold text-gray-900 mb-2">
                          {typeof skill === "string" ? skill : skill.name}
                        </h3>
                        {skill.keywords && (
                          <div className="flex flex-wrap gap-2">
                            {skill.keywords.map((keyword: string, idx: number) => (
                              <span
                                key={idx}
                                className="px-2 py-1 bg-gray-100 text-gray-700 text-sm rounded"
                              >
                                {keyword}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Education */}
              {education.length > 0 && (
                <div className="mb-12">
                  <div className="border-t border-gray-200 mb-6"></div>
                  <h2 className="text-xl font-bold mb-6 text-gray-900">EDUCATION</h2>
                  <div className="space-y-6">
                    {education.map((edu: any, index: number) => (
                      <div
                        key={index}
                        className="relative pl-6 pb-6 border-l-2 border-gray-200 last:border-l-0 last:pb-0"
                      >
                        <div className="absolute -left-1.5 top-0 w-2.5 h-2.5 bg-white border-2 border-gray-300 rounded-full"></div>
                        <div className="mb-2">
                          <span className="text-gray-600 font-mono text-sm">
                            {edu.startDate && formatDate(edu.startDate)} -{" "}
                            {edu.endDate ? formatDate(edu.endDate) : "Present"}
                          </span>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          {edu.studyType} {edu.area && `in ${edu.area}`}
                        </h3>
                        <div className="text-gray-600">{edu.institution}</div>
                        {edu.score && <div className="text-gray-700 mt-1">GPA: {edu.score}</div>}
                        {edu.courses && edu.courses.length > 0 && (
                          <div className="text-gray-700 mt-2">
                            <span className="font-medium">Relevant Courses:</span>{" "}
                            {edu.courses.join(", ")}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Projects */}
              {projects.length > 0 && (
                <div>
                  <div className="border-t border-gray-200 mb-6"></div>
                  <h2 className="text-xl font-bold mb-6 text-gray-900">PROJECTS</h2>
                  <div className="space-y-6">
                    {projects.map((project: any, index: number) => (
                      <div
                        key={index}
                        className="relative pl-6 pb-6 border-l-2 border-gray-200 last:border-l-0 last:pb-0"
                      >
                        <div className="absolute -left-1.5 top-0 w-2.5 h-2.5 bg-white border-2 border-gray-300 rounded-full"></div>
                        <div className="mb-2">
                          <h3 className="text-lg font-semibold text-gray-800">
                            {project.name}
                            {project.url && (
                              <a
                                href={project.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="ml-2 text-sm text-blue-600 hover:text-blue-800"
                              >
                                {project.url}
                              </a>
                            )}
                          </h3>
                          {project.endDate && (
                            <span className="text-gray-600 font-mono text-sm">
                              {formatDate(project.endDate)}
                            </span>
                          )}
                        </div>
                        {project.description && (
                          <p className="text-gray-700 mb-2">{project.description}</p>
                        )}
                        {project.highlights && project.highlights.length > 0 && (
                          <ul className="space-y-2">
                            {project.highlights.map((highlight: string, idx: number) => (
                              <li key={idx} className="text-gray-700 flex items-start">
                                <span className="text-gray-400 mr-2">•</span>
                                <span>{highlight}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Tech1 Theme
  if (theme === "tech1") {
    return (
      <div className="lg:col-span-1">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-900">Resume Preview - Tech1 Theme</h3>
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
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 overflow-auto h-[90vh]">
          <div className="flex justify-center">
            <div className="resume-content bg-white rounded shadow-sm p-6 text-sm space-y-4">
              {/* Header Section */}
              <div className="bg-gray-100 text-center border-b border-gray-200 py-8">
                <h1 className="text-2xl font-bold text-gray-900 mb-3">
                  {basics.name || "Your Name"}
                </h1>
                {basics.label && <p className="text-gray-600 font-medium mb-3">{basics.label}</p>}

                {/* Contact Information */}
                <div className="text-xs text-gray-600 flex justify-center items-center gap-x-2 mb-2">
                  {basics.email && <span>{basics.email}</span>}
                  {basics.phone && <span>{basics.phone}</span>}
                  {basics.location?.city && (
                    <span>
                      {basics.location.city}
                      {basics.location.region && `, ${basics.location.region}`}
                    </span>
                  )}
                </div>

                {/* Social Profiles */}
                {basics.profiles && basics.profiles.length > 0 && (
                  <div className="text-xs flex flex-wrap justify-center gap-x-2">
                    {basics.profiles.map((profile: any, index: number) => (
                      <a
                        key={index}
                        href={profile.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800"
                      >
                        {getProfileIcon(profile.network)}
                        <span>{profile.username}</span>
                      </a>
                    ))}
                  </div>
                )}
              </div>

              {/* Summary */}
              {basics.summary && (
                <div className="mb-4">
                  <h2 className="text-sm font-bold text-gray-900 border-b border-gray-200 pb-1 mb-2">
                    PROFESSIONAL SUMMARY
                  </h2>
                  <p className="text-xs text-gray-700 leading-relaxed">{basics.summary}</p>
                </div>
              )}

              {/* Work Experience */}
              {work.length > 0 && (
                <div>
                  <h2 className="text-sm font-bold text-gray-900 border-b border-gray-200 pb-1 mb-2">
                    WORK EXPERIENCE
                  </h2>
                  {work.map((job: any, index: number) => (
                    <div key={index} className="mb-3 last:mb-0">
                      <div className="flex justify-between items-start mb-1">
                        <h3 className="font-semibold text-gray-900 text-xs">
                          {job.position || "Position"}
                        </h3>
                        <span className="text-xs text-gray-600">
                          {formatDate(job.startDate)}
                          {job.endDate ? ` - ${formatDate(job.endDate)}` : " - Present"}
                        </span>
                      </div>
                      <div className="text-xs mb-2">
                        <span className="text-gray-600 font-medium">{job.name || job.company}</span>
                      </div>
                      {job.summary && <p className="text-xs text-gray-700 mb-2">{job.summary}</p>}
                      {job.highlights && job.highlights.length > 0 && (
                        <ul className="list-disc list-inside space-y-1 text-gray-700">
                          {job.highlights.map((highlight: string, idx: number) => (
                            <li key={idx} className="text-xs">
                              {highlight}
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
                <div>
                  <h2 className="text-sm font-bold text-gray-900 border-b border-gray-200 pb-1 mb-2">
                    EDUCATION
                  </h2>
                  {education.map((edu: any, index: number) => (
                    <div key={index} className="mb-2 last:mb-0">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-gray-900 text-sm">
                            {edu.studyType} {edu.area}
                          </h3>
                          <p className="text-gray-600 text-xs">{edu.institution}</p>
                          {edu.score && <p className="text-gray-600 text-xs">GPA: {edu.score}</p>}
                        </div>
                        <span className="text-xs text-gray-600">
                          {formatDate(edu.startDate)}
                          {edu.endDate ? ` - ${formatDate(edu.endDate)}` : ""}
                        </span>
                      </div>
                      {edu.courses && edu.courses.length > 0 && (
                        <p className="text-xs text-gray-700 mt-1">
                          Relevant coursework: {edu.courses.slice(0, 3).join(", ")}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Skills */}
              {skills.length > 0 && (
                <div>
                  <h2 className="text-sm font-bold text-gray-900 border-b border-gray-200 pb-1 mb-2">
                    SKILLS
                  </h2>
                  <div className="grid grid-cols-2 gap-2">
                    {skills.map((skill: any, index: number) => (
                      <div key={index} className="bg-gray-50 rounded-md p-2 border border-gray-200">
                        <div className="font-medium text-gray-900 text-sm">
                          {typeof skill === "string" ? skill : skill.name}
                        </div>
                        {skill.keywords && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {skill.keywords.map((keyword: string, idx: number) => (
                              <span
                                key={idx}
                                className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded"
                              >
                                {keyword}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Tech2 Theme
  if (theme === "tech2") {
    return (
      <div className="lg:col-span-1">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-900">Resume Preview - Tech2 Theme</h3>
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
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 overflow-auto h-[90vh]">
          <div className="flex justify-center">
            <div className="resume-content bg-white rounded shadow-sm p-6 text-sm space-y-4">
              {/* Header Section */}
              <div className="text-center mb-6">
                <h1 className="text-2xl font-bold mb-2 text-gray-900">
                  {basics.name || "Your Name"}
                </h1>
                {basics.label && <h2 className="text-lg text-gray-600">{basics.label}</h2>}
                {basics.summary && (
                  <p className="mt-4 text-gray-700 text-[12px] leading-[1.5]">{basics.summary}</p>
                )}
              </div>

              {/* Work Experience */}
              {work.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-lg font-bold mb-6 border-b-2 pb-2 text-gray-900 border-gray-200">
                    WORK EXPERIENCE
                  </h3>
                  {work.map((job: any, index: number) => (
                    <div key={index} className="mb-6 last:mb-0">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="text-base font-semibold text-gray-900">{job.position}</h4>
                          <p className="text-gray-600">{job.name || job.company}</p>
                        </div>
                        <span className="text-sm text-gray-600">
                          {formatDate(job.startDate)}
                          {job.endDate ? ` - ${formatDate(job.endDate)}` : " - Present"}
                        </span>
                      </div>
                      {job.summary && <p className="text-gray-700 mb-2">{job.summary}</p>}
                      {job.highlights && job.highlights.length > 0 && (
                        <ul className="list-disc list-inside space-y-1 text-gray-700">
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
                <div className="mb-8">
                  <h3 className="text-lg font-bold mb-6 border-b-2 pb-2 text-gray-900 border-gray-200">
                    EDUCATION
                  </h3>
                  {education.map((edu: any, index: number) => (
                    <div key={index} className="mb-4 last:mb-0">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="text-base font-semibold text-gray-900">
                            {edu.studyType} {edu.area}
                          </h4>
                          <p className="text-gray-600">{edu.institution}</p>
                        </div>
                        <span className="text-sm text-gray-600">
                          {formatDate(edu.startDate)}
                          {edu.endDate ? ` - ${formatDate(edu.endDate)}` : ""}
                        </span>
                      </div>
                      {edu.score && <p className="text-gray-700">GPA: {edu.score}</p>}
                      {edu.courses && edu.courses.length > 0 && (
                        <p className="text-gray-700 mt-1">
                          Relevant coursework: {edu.courses.join(", ")}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Skills */}
              {skills.length > 0 && (
                <div>
                  <h3 className="text-lg font-bold mb-6 border-b-2 pb-2 text-gray-900 border-gray-200">
                    SKILLS
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    {skills.map((skill: any, index: number) => (
                      <div key={index} className="bg-gray-50 rounded p-3 border border-gray-200">
                        <h4 className="font-semibold text-gray-900 mb-2">
                          {typeof skill === "string" ? skill : skill.name}
                        </h4>
                        {skill.keywords && (
                          <div className="flex flex-wrap gap-2">
                            {skill.keywords.map((keyword: string, idx: number) => (
                              <span
                                key={idx}
                                className="px-2 py-1 bg-gray-100 text-gray-700 text-sm rounded"
                              >
                                {keyword}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Default Theme
  return (
    <div className="lg:col-span-1">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-900">Resume Preview</h3>
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
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 overflow-auto h-[90vh]">
        <div className="flex justify-center">
          <div className="resume-content bg-white rounded shadow-sm p-8 max-w-4xl mx-auto">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{basics.name}</h1>
              {basics.label && <p className="text-xl text-gray-600">{basics.label}</p>}

              {/* Contact Info */}
              <div className="mt-4 flex justify-center gap-4 text-sm text-gray-600">
                {basics.email && (
                  <a href={`mailto:${basics.email}`} className="hover:text-blue-600">
                    {basics.email}
                  </a>
                )}
                {basics.phone && <span>{basics.phone}</span>}
                {basics.location && basics.location.city && (
                  <span>
                    {basics.location.city}
                    {basics.location.region && `, ${basics.location.region}`}
                  </span>
                )}
              </div>

              {/* Social Profiles */}
              {basics.profiles && basics.profiles.length > 0 && (
                <div className="mt-4 flex flex-wrap justify-center gap-4">
                  {basics.profiles.map((profile: any, index: number) => (
                    <a
                      key={index}
                      href={profile.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800"
                    >
                      {getProfileIcon(profile.network)}
                      <span>{profile.username}</span>
                    </a>
                  ))}
                </div>
              )}
            </div>

            {/* Summary */}
            {basics.summary && (
              <div className="mb-8">
                <p className="text-gray-700 leading-relaxed">{basics.summary}</p>
              </div>
            )}

            {/* Work Experience */}
            {work.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Experience</h2>
                {work.map((job: any, index: number) => (
                  <div key={index} className="mb-6 last:mb-0">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{job.position}</h3>
                        <p className="text-gray-600">{job.name || job.company}</p>
                      </div>
                      <span className="text-sm text-gray-600">
                        {formatDate(job.startDate)}
                        {job.endDate ? ` - ${formatDate(job.endDate)}` : " - Present"}
                      </span>
                    </div>
                    {job.summary && <p className="text-gray-700 mb-2">{job.summary}</p>}
                    {job.highlights && job.highlights.length > 0 && (
                      <ul className="list-disc list-inside space-y-1 text-gray-700">
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
              <div className="mb-8">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Education</h2>
                {education.map((edu: any, index: number) => (
                  <div key={index} className="mb-4 last:mb-0">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {edu.studyType} {edu.area}
                        </h3>
                        <p className="text-gray-600">{edu.institution}</p>
                      </div>
                      <span className="text-sm text-gray-600">
                        {formatDate(edu.startDate)}
                        {edu.endDate ? ` - ${formatDate(edu.endDate)}` : ""}
                      </span>
                    </div>
                    {edu.score && <p className="text-gray-700">GPA: {edu.score}</p>}
                    {edu.courses && edu.courses.length > 0 && (
                      <p className="text-gray-700 mt-1">
                        Relevant coursework: {edu.courses.join(", ")}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Skills */}
            {skills.length > 0 && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">Skills</h2>
                <div className="grid grid-cols-2 gap-4">
                  {skills.map((skill: any, index: number) => (
                    <div key={index} className="bg-gray-50 rounded p-3 border border-gray-200">
                      <h3 className="font-semibold text-gray-900">
                        {typeof skill === "string" ? skill : skill.name}
                      </h3>
                      {skill.keywords && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {skill.keywords.map((keyword: string, idx: number) => (
                            <span
                              key={idx}
                              className="px-2 py-1 bg-gray-100 text-gray-700 text-sm rounded"
                            >
                              {keyword}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
