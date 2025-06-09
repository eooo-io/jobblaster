import type { JobPosting, Resume } from "@shared/schema";
import OpenAI from "openai";
import type {
  ChatCompletionCreateParamsNonStreaming,
  ChatCompletionMessage,
  ChatCompletionMessageParam,
  ChatCompletionSystemMessageParam,
  ChatCompletionUserMessageParam,
} from "openai/resources/chat/completions";
import { logApiCall } from "./api-logger";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "default_key",
});

interface OpenAIConfig {
  apiKey: string;
}

export class OpenAIService {
  private client: OpenAI;

  constructor(config: OpenAIConfig) {
    this.client = new OpenAI({
      apiKey: config.apiKey,
    });
  }

  private async createChatCompletion(
    params: ChatCompletionCreateParamsNonStreaming
  ): Promise<ChatCompletionMessage> {
    const response = await this.client.chat.completions.create({
      ...params,
      model: "gpt-4",
    });
    return response.choices[0].message;
  }

  async chatCompletion(
    messages: ChatCompletionMessageParam[],
    options: {
      temperature?: number;
      maxTokens?: number;
      responseFormat?: { type: "json_object" };
    } = {}
  ) {
    try {
      const completion = await this.client.chat.completions.create({
        model: "gpt-4-turbo-preview",
        messages,
        temperature: options.temperature ?? 0.7,
        max_tokens: options.maxTokens,
        response_format: options.responseFormat,
      });

      return completion.choices[0]?.message?.content || "";
    } catch (error) {
      console.error("OpenAI API Error:", error);
      throw error;
    }
  }

  async analyzeResume(resume: Resume): Promise<{
    technicalSkills: string[];
    softSkills: string[];
    experienceYears: string;
    recommendations: string[];
  }> {
    const resumeData = resume.jsonData as any;
    const basics = resumeData.basics || {};
    const prompt = `
      Analyze this resume and extract key information:
      Name: ${basics.name || "Not provided"}
      Summary: ${basics.summary || "Not provided"}
      Work Experience: ${JSON.stringify(resumeData.work || [])}
      Education: ${JSON.stringify(resumeData.education || [])}
      Skills: ${JSON.stringify(resumeData.skills || [])}

      Please provide:
      1. Technical skills (list)
      2. Soft skills (list)
      3. Years of experience (single number or range)
      4. Recommendations for improvement (list)
    `;

    try {
      const messages: [ChatCompletionSystemMessageParam, ChatCompletionUserMessageParam] = [
        {
          role: "system",
          content:
            "You are a professional resume analyzer. Extract key information and provide insights.",
        },
        { role: "user", content: prompt },
      ];

      const params: ChatCompletionCreateParamsNonStreaming = {
        model: "gpt-4",
        messages,
        response_format: { type: "json_object" },
        temperature: 0.7,
        max_tokens: 1000,
      };

      const message = await this.createChatCompletion(params);
      const content = message.content;
      if (!content) {
        throw new Error("No content in OpenAI response");
      }

      const result = JSON.parse(content);
      return {
        technicalSkills: result.technicalSkills || [],
        softSkills: result.softSkills || [],
        experienceYears: result.experienceYears || "0",
        recommendations: result.recommendations || [],
      };
    } catch (error) {
      console.error("OpenAI resume analysis failed:", error);
      throw new Error("Failed to analyze resume");
    }
  }

  async analyzeJob(jobData: unknown) {
    const messages: ChatCompletionMessageParam[] = [
      {
        role: "system",
        content:
          "You are a professional job posting analyzer. Extract key information from the job posting.",
      },
      {
        role: "user",
        content: JSON.stringify(jobData),
      },
    ];

    return this.chatCompletion(messages, {
      temperature: 0.3,
      responseFormat: { type: "json_object" },
    });
  }

  async matchResumeToJob(resumeData: unknown, jobData: unknown) {
    const messages: ChatCompletionMessageParam[] = [
      {
        role: "system",
        content:
          "You are a professional job matcher. Compare the resume with the job posting and provide a detailed match analysis.",
      },
      {
        role: "user",
        content: JSON.stringify({ resume: resumeData, job: jobData }),
      },
    ];

    return this.chatCompletion(messages, {
      temperature: 0.3,
      responseFormat: { type: "json_object" },
    });
  }

  async generateCoverLetter(
    resume: Resume,
    job: JobPosting,
    tone: string,
    focus: string
  ): Promise<string> {
    const resumeData = resume.jsonData as any;
    const prompt = `
      Generate a cover letter with the following parameters:

      Resume Information:
      - Name: ${resumeData.basics?.name || "Not provided"}
      - Summary: ${resumeData.basics?.summary || "Not provided"}
      - Key Experience: ${JSON.stringify(resumeData.work?.slice(0, 3) || [])}
      - Key Skills: ${JSON.stringify(resumeData.skills?.slice(0, 8) || [])}
      - Education: ${JSON.stringify(resumeData.education?.slice(0, 2) || [])}

      Job Information:
      - Title: ${job.title}
      - Company: ${job.company}
      - Description: ${job.description}

      Style Parameters:
      - Tone: ${tone} (e.g., professional, enthusiastic, confident)
      - Focus: ${focus} (e.g., technical skills, leadership, creativity)

      Please write a personalized cover letter that:
      1. Matches the specified tone
      2. Emphasizes the specified focus areas
      3. Connects the candidate's experience with the job requirements
      4. Maintains a professional and engaging style
      5. Keeps the length to 2-3 paragraphs
    `;

    try {
      const messages: [ChatCompletionSystemMessageParam, ChatCompletionUserMessageParam] = [
        {
          role: "system",
          content:
            "You are a professional cover letter writer. Create compelling, personalized cover letters.",
        },
        { role: "user", content: prompt },
      ];

      const params: ChatCompletionCreateParamsNonStreaming = {
        model: "gpt-4",
        messages,
        temperature: 0.7,
        max_tokens: 1000,
      };

      const message = await this.createChatCompletion(params);
      const content = message.content;
      if (!content) {
        throw new Error("No content in OpenAI response");
      }

      return content;
    } catch (error) {
      console.error("OpenAI cover letter generation failed:", error);
      throw new Error("Failed to generate cover letter");
    }
  }

  async calculateMatchScore(
    job: JobPosting,
    resume: Resume
  ): Promise<{
    overallScore: number;
    technicalScore: number;
    experienceScore: number;
    softSkillsScore: number;
    locationScore: number;
    recommendations: string[];
  }> {
    const resumeData = resume.jsonData as any;
    const prompt = `
      Compare this job posting and resume to calculate match scores:

      Job Posting:
      - Title: ${job.title}
      - Company: ${job.company}
      - Description: ${job.description}
      - Required Skills: ${JSON.stringify(job.techStack || [])}
      - Experience Required: ${job.experienceYears || "Not specified"}
      - Location: ${job.location || "Not specified"}

      Resume:
      - Name: ${resumeData.basics?.name || "Not provided"}
      - Skills: ${JSON.stringify(resumeData.skills || [])}
      - Experience: ${JSON.stringify(resumeData.work || [])}
      - Location: ${resumeData.basics?.location || "Not provided"}

      Please provide:
      1. Overall match score (0-100)
      2. Technical skills match score (0-100)
      3. Experience level match score (0-100)
      4. Soft skills match score (0-100)
      5. Location match score (0-100)
      6. Specific recommendations for improving the match
    `;

    try {
      const messages: [ChatCompletionSystemMessageParam, ChatCompletionUserMessageParam] = [
        {
          role: "system",
          content:
            "You are a professional job match analyzer. Calculate match scores and provide recommendations.",
        },
        { role: "user", content: prompt },
      ];

      const params: ChatCompletionCreateParamsNonStreaming = {
        model: "gpt-4",
        messages,
        response_format: { type: "json_object" },
        temperature: 0.3,
        max_tokens: 1000,
      };

      const message = await this.createChatCompletion(params);
      const content = message.content;
      if (!content) {
        throw new Error("No content in OpenAI response");
      }

      const result = JSON.parse(content);
      return {
        overallScore: result.overallScore || 0,
        technicalScore: result.technicalScore || 0,
        experienceScore: result.experienceScore || 0,
        softSkillsScore: result.softSkillsScore || 0,
        locationScore: result.locationScore || 0,
        recommendations: result.recommendations || [],
      };
    } catch (error) {
      console.error("OpenAI match score calculation failed:", error);
      throw new Error("Failed to calculate match score");
    }
  }
}

export async function analyzeJobDescription(
  description: string,
  userId?: number
): Promise<{
  title: string;
  company: string;
  techStack: string[];
  softSkills: string[];
  experienceYears: string;
  location: string;
  employmentType: string;
}> {
  // Using your OpenAI template for consistent job analysis
  const systemPrompt =
    "You are an AI assistant that extracts structured job details from raw job postings. Always return only valid JSON.";

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
      { role: "user", content: extractionInstruction },
    ],
    response_format: { type: "json_object" as const },
    temperature: 0.2,
    max_tokens: 1024,
  };

  try {
    const response = await logApiCall(
      {
        service: "OpenAI",
        endpoint: "/chat/completions",
        method: "POST",
        requestData,
        userId: userId || 1,
      },
      () => openai.chat.completions.create(requestData)
    );

    const result = JSON.parse(response.choices[0].message.content || "{}");

    return {
      title: result["Role Title"] || "Position Title",
      company: result["Company Name"] || "Company Name",
      techStack: Array.isArray(result["Required Technologies"])
        ? result["Required Technologies"]
        : [],
      softSkills: Array.isArray(result["Required Soft Skills"])
        ? result["Required Soft Skills"]
        : [],
      experienceYears: result["Preferred Experience"] || "Not specified",
      location: result["Location"] || "Not specified",
      employmentType: result["Employment Type"] || "Not specified",
    };
  } catch (error) {
    console.error("Job description analysis failed:", error);
    throw new Error("Failed to analyze job description. Please check your API key and try again.");
  }
}
