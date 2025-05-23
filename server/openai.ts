import OpenAI from "openai";
import type { Resume, JobPosting } from "@shared/schema";
import { logApiCall } from "./api-logger";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "default_key" 
});

export async function analyzeJobDescription(description: string, userId?: number): Promise<{
  title: string;
  company: string;
  techStack: string[];
  softSkills: string[];
  experienceYears: string;
  location: string;
  employmentType: string;
}> {
  // Using your OpenAI template for consistent job analysis
  const systemPrompt = "You are an AI assistant that extracts structured job details from raw job postings. Always return only valid JSON.";
  
  const extractionInstruction = `Extract structured job details from the following job post. Output as a JSON object with the following fields:

- Company Name
- Role Title
- Required Technologies
- Required Soft Skills
- Preferred Experience
- Location (Remote/On-site)
- Employment Type

Only include the fields listed above.

Job Post:
"""
${description}
"""`;

  const requestData = {
    model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: extractionInstruction }
    ],
    response_format: { type: "json_object" as const },
    temperature: 0.2,
    max_tokens: 1024,
  };

  try {
    const response = await logApiCall({
      service: 'OpenAI',
      endpoint: '/chat/completions',
      method: 'POST',
      requestData,
      userId: userId || 1
    }, () => openai.chat.completions.create(requestData));

    const result = JSON.parse(response.choices[0].message.content || "{}");
    
    return {
      title: result["Role Title"] || "Position Title",
      company: result["Company Name"] || "Company Name",
      techStack: Array.isArray(result["Required Technologies"]) ? result["Required Technologies"] : [],
      softSkills: Array.isArray(result["Required Soft Skills"]) ? result["Required Soft Skills"] : [],
      experienceYears: result["Preferred Experience"] || "Not specified",
      location: result["Location"] || "Not specified", 
      employmentType: result["Employment Type"] || "Not specified"
    };
  } catch (error) {
    console.error("Job description analysis failed:", error);
    throw new Error("Failed to analyze job description. Please check your API key and try again.");
  }
}

export async function calculateMatchScore(resume: Resume, job: JobPosting): Promise<{
  overallScore: number;
  technicalScore: number;
  experienceScore: number;
  softSkillsScore: number;
  locationScore: number;
  recommendations: string[];
}> {
  try {
    const resumeText = JSON.stringify(resume.jsonData);
    const jobRequirements = {
      title: job.title,
      company: job.company,
      techStack: job.techStack || [],
      softSkills: job.softSkills || [],
      experienceYears: job.experienceYears,
      location: job.location
    };

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an expert resume matcher. Analyze how well a resume matches job requirements and provide detailed scoring.

          Score each category from 0-100:
          - technicalScore: How well technical skills match (programming languages, frameworks, tools)
          - experienceScore: How well experience level and years match requirements  
          - softSkillsScore: How well soft skills and leadership qualities match
          - locationScore: Location compatibility (100 if remote or same location, lower for relocation needed)
          - overallScore: Weighted average considering all factors

          Also provide 3-5 specific recommendations for improving the match.

          Return only valid JSON in this exact format:
          {
            "overallScore": number,
            "technicalScore": number, 
            "experienceScore": number,
            "softSkillsScore": number,
            "locationScore": number,
            "recommendations": ["string"]
          }`
        },
        {
          role: "user",
          content: `Please score this resume against the job requirements:

          RESUME DATA:
          ${resumeText}

          JOB REQUIREMENTS:
          ${JSON.stringify(jobRequirements, null, 2)}

          Provide detailed scoring and actionable recommendations.`
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.1,
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    
    return {
      overallScore: Math.max(0, Math.min(100, Math.round(result.overallScore || 0))),
      technicalScore: Math.max(0, Math.min(100, Math.round(result.technicalScore || 0))),
      experienceScore: Math.max(0, Math.min(100, Math.round(result.experienceScore || 0))),
      softSkillsScore: Math.max(0, Math.min(100, Math.round(result.softSkillsScore || 0))),
      locationScore: Math.max(0, Math.min(100, Math.round(result.locationScore || 0))),
      recommendations: Array.isArray(result.recommendations) ? result.recommendations : []
    };
  } catch (error) {
    console.error("Match score calculation failed:", error);
    throw new Error("Failed to calculate match score. Please check your API key and try again.");
  }
}

export async function generateCoverLetter(
  resume: Resume, 
  job: JobPosting, 
  tone: string, 
  focus: string
): Promise<string> {
  try {
    const resumeData = resume.jsonData;
    const basics = resumeData.basics || {};
    
    const toneInstructions = {
      professional: "Write in a formal, professional tone suitable for corporate environments.",
      friendly: "Write in a warm, approachable tone while maintaining professionalism.",
      enthusiastic: "Write with energy and excitement, showing genuine interest in the role.",
      minimal: "Write concisely and directly, focusing only on key qualifications."
    };

    const focusInstructions = {
      technical: "Emphasize technical skills, programming languages, and technical achievements.",
      leadership: "Highlight leadership experience, team management, and strategic thinking.",
      project: "Focus on project delivery, results achieved, and problem-solving abilities.",
      innovation: "Showcase creative thinking, innovation, and cutting-edge technology experience."
    };

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an expert cover letter writer. Create personalized, compelling cover letters that highlight the candidate's most relevant qualifications for the specific job.

          Guidelines:
          - Keep it to 3-4 paragraphs
          - Start with a strong opening that mentions the specific role and company
          - Highlight 2-3 most relevant qualifications that match job requirements
          - Show genuine interest in the company and role
          - End with a call to action
          - Use specific examples from the resume when possible
          - Avoid generic phrases and clichés
          
          Tone: ${toneInstructions[tone as keyof typeof toneInstructions] || toneInstructions.professional}
          Focus: ${focusInstructions[focus as keyof typeof focusInstructions] || focusInstructions.technical}`
        },
        {
          role: "user",
          content: `Write a cover letter for this candidate applying to this job:

          CANDIDATE INFO:
          Name: ${basics.name || "Candidate"}
          Current Title: ${basics.label || "Professional"}
          Email: ${basics.email || ""}
          
          RESUME HIGHLIGHTS:
          ${JSON.stringify({
            work: resumeData.work?.slice(0, 3) || [],
            skills: resumeData.skills?.slice(0, 8) || [],
            education: resumeData.education?.slice(0, 2) || []
          }, null, 2)}

          JOB DETAILS:
          Position: ${job.title}
          Company: ${job.company}
          Required Skills: ${job.techStack?.join(", ") || "Various"}
          Experience: ${job.experienceYears || "Not specified"}
          Location: ${job.location || "Not specified"}

          Create a compelling cover letter that demonstrates why this candidate is perfect for this role.`
        }
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("No cover letter content generated");
    }

    return content;
  } catch (error) {
    console.error("Cover letter generation failed:", error);
    throw new Error("Failed to generate cover letter. Please check your API key and try again.");
  }
}

// Score job match compatibility between resume and job description
export async function scoreJobMatch(resumeData: any, jobData: any, userId: number): Promise<number> {
  try {
    const user = await storage.getUser(userId);
    if (!user?.openaiApiKey) {
      throw new Error("OpenAI API key not configured. Please add your API key in the profile settings.");
    }

    const openai = new OpenAI({ 
      apiKey: user.openaiApiKey,
    });

    // Get the assigned template for job scoring
    const assignments = await storage.getTemplateAssignments(userId);
    const scoringAssignment = assignments.find(a => a.category === 'job_scoring');
    
    let systemPrompt = `You are an expert HR recruiter and career coach. Analyze the compatibility between a candidate's resume and a job posting. 

Provide a match score from 0-100 based on:
- Technical skills alignment (40%)
- Experience level match (30%) 
- Industry/domain relevance (20%)
- Education/certifications (10%)

Return your response as a JSON object with this exact format:
{
  "score": 85,
  "reasoning": "Strong technical skills match with 8+ years experience in required technologies. Leadership experience aligns with senior role requirements."
}`;

    if (scoringAssignment?.templateId) {
      const template = await storage.getAiTemplate(scoringAssignment.templateId);
      if (template) {
        systemPrompt = template.systemPrompt;
      }
    }

    const prompt = `
RESUME DATA:
${JSON.stringify(resumeData, null, 2)}

JOB POSTING:
Title: ${jobData.title}
Company: ${jobData.company}
Description: ${jobData.description}
Requirements: ${jobData.requirements}

Analyze the match between this resume and job posting. Focus on skills, experience, and qualifications alignment.`;

    const response = await logApiCall({
      service: 'OpenAI',
      endpoint: '/chat/completions',
      method: 'POST',
      requestData: {
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: prompt }
        ],
        response_format: { type: "json_object" },
        temperature: 0.3,
        max_tokens: 500
      },
      userId
    }, async () => {
      return await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: prompt }
        ],
        response_format: { type: "json_object" },
        temperature: 0.3,
        max_tokens: 500
      });
    });

    const result = JSON.parse(response.choices[0].message.content);
    const score = Math.max(0, Math.min(100, Math.round(result.score || 0)));
    
    return score;
  } catch (error) {
    console.error("Job scoring failed:", error);
    throw new Error("Failed to score job match. Please check your OpenAI API key and try again.");
  }
}
