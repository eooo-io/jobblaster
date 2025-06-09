export type LanguageCode = "en" | "de" | "es" | "fr" | "it" | "pt" | "ru" | "zh" | "ja" | "ko";

export interface LanguageConfig {
  code: LanguageCode;
  name: string;
  nativeName: string;
  direction: "ltr" | "rtl";
}

export interface ResumeTokens {
  // Basic section titles
  basics: string;
  summary: string;
  contact: string;
  profiles: string;

  // Work experience
  work: string;
  position: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string;
  present: string;
  highlights: string;

  // Education
  education: string;
  institution: string;
  area: string;
  studyType: string;
  score: string;
  courses: string;

  // Skills section
  skills: string;
  level: string;
  keywords: string;

  // Languages section
  languages: string;
  language: string;
  fluency: string;

  // Projects section
  projects: string;
  description: string;
  roles: string;

  // Additional sections
  awards: string;
  certificates: string;
  publications: string;
  interests: string;
  references: string;

  // Common terms
  to: string;
  at: string;
  and: string;

  // Fluency levels
  native: string;
  fluent: string;
  professional: string;
  intermediate: string;
  elementary: string;

  // Skill levels
  expert: string;
  advanced: string;
  intermediate_skill: string;
  beginner: string;
}

export interface LanguageTokenMap {
  [key: string]: ResumeTokens;
}
