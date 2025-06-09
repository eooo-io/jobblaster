export interface JSONResumeSchema {
  basics?: {
    name?: string;
    label?: string;
    image?: string;
    email?: string;
    phone?: string;
    url?: string;
    summary?: string;
    location?: {
      address?: string;
      postalCode?: string;
      city?: string;
      countryCode?: string;
      region?: string;
    };
    profiles?: {
      network?: string;
      username?: string;
      url?: string;
    }[];
    dateOfBirth?: string;
  };
  work?: Array<{
    name?: string;
    company?: string;
    position?: string;
    url?: string;
    startDate?: string;
    endDate?: string;
    summary?: string;
    highlights?: string[];
    location?: string;
  }>;
  volunteer?: Array<{
    organization?: string;
    position?: string;
    url?: string;
    startDate?: string;
    endDate?: string;
    summary?: string;
    highlights?: string[];
  }>;
  education?: Array<{
    institution?: string;
    url?: string;
    area?: string;
    studyType?: string;
    startDate?: string;
    endDate?: string;
    score?: string;
    courses?: string[];
  }>;
  awards?: Array<{
    title?: string;
    date?: string;
    awarder?: string;
    summary?: string;
  }>;
  certificates?: Array<{
    name?: string;
    date?: string;
    issuer?: string;
    url?: string;
  }>;
  publications?: Array<{
    name?: string;
    publisher?: string;
    releaseDate?: string;
    url?: string;
    summary?: string;
  }>;
  skills?: Array<{
    name?: string;
    level?: string;
    keywords?: string[];
  }>;
  languages?: Array<{
    language?: string;
    fluency?: string;
  }>;
  interests?: Array<{
    name?: string;
    keywords?: string[];
  }>;
  references?: Array<{
    name?: string;
    reference?: string;
  }>;
  projects?: Array<{
    name?: string;
    description?: string;
    highlights?: string[];
    keywords?: string[];
    startDate?: string;
    endDate?: string;
    url?: string;
    roles?: string[];
    entity?: string;
    type?: string;
  }>;
  meta?: {
    canonical?: string;
    version?: string;
    lastModified?: string;
  };
}

export interface JobAnalysis {
  title: string;
  company: string;
  techStack: string[];
  softSkills: string[];
  experienceYears: string;
  location: string;
  employmentType: string;
  description: string;
}

export interface MatchScoreBreakdown {
  overallScore: number;
  technicalScore: number;
  experienceScore: number;
  softSkillsScore: number;
  locationScore: number;
  recommendations: string[];
}
