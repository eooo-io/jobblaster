import { describe, it, expect, vi, beforeEach } from 'vitest';
import { analyzeJobDescription, calculateMatchScore, generateCoverLetter } from '@server/openai';
import type { Resume, JobPosting } from '@shared/schema';

// Mock OpenAI module
vi.mock('openai', () => {
  const mockOpenAI = {
    chat: {
      completions: {
        create: vi.fn()
      }
    }
  };
  return {
    default: vi.fn(() => mockOpenAI)
  };
});

describe('OpenAI Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Set up environment variable for tests
    process.env.OPENAI_API_KEY = 'test-key';
  });

  describe('Job Description Analysis', () => {
    it('should analyze job description and extract structured data', async () => {
      const mockResponse = {
        choices: [{
          message: {
            content: JSON.stringify({
              techStack: ['React', 'TypeScript', 'Node.js'],
              softSkills: ['Communication', 'Team work'],
              experienceYears: '3-5 years',
              location: 'Remote',
              employmentType: 'Full-time'
            })
          }
        }]
      };

      mockOpenAI.chat.completions.create.mockResolvedValue(mockResponse);

      const jobDescription = 'Senior React Developer position requiring 3+ years experience...';
      const result = await analyzeJobDescription(jobDescription, 1);

      expect(result).toBeDefined();
      expect(result.techStack).toContain('React');
      expect(result.techStack).toContain('TypeScript');
      expect(result.softSkills).toContain('Communication');
      expect(result.experienceYears).toBe('3-5 years');
      expect(mockOpenAI.chat.completions.create).toHaveBeenCalledWith({
        model: 'gpt-4o',
        messages: expect.any(Array),
        response_format: { type: 'json_object' }
      });
    });

    it('should handle API errors gracefully', async () => {
      mockOpenAI.chat.completions.create.mockRejectedValue(new Error('API Error'));

      await expect(analyzeJobDescription('Job description', 1))
        .rejects.toThrow('Failed to analyze job description');
    });

    it('should handle invalid JSON responses', async () => {
      const mockResponse = {
        choices: [{
          message: {
            content: 'Invalid JSON response'
          }
        }]
      };

      mockOpenAI.chat.completions.create.mockResolvedValue(mockResponse);

      await expect(analyzeJobDescription('Job description', 1))
        .rejects.toThrow('Failed to analyze job description');
    });
  });

  describe('Match Score Calculation', () => {
    it('should calculate match score between resume and job', async () => {
      const mockResponse = {
        choices: [{
          message: {
            content: JSON.stringify({
              overallScore: 85,
              technicalMatch: 90,
              experienceMatch: 80,
              skillsMatch: 85,
              feedback: 'Strong technical match with relevant experience'
            })
          }
        }]
      };

      mockOpenAI.chat.completions.create.mockResolvedValue(mockResponse);

      const mockResume: Resume = {
        id: 1,
        name: 'Test Resume',
        userId: 1,
        jsonData: {
          basics: { name: 'John Doe' },
          skills: [{ name: 'React' }, { name: 'TypeScript' }]
        },
        theme: 'modern',
        isDefault: true,
        createdAt: new Date()
      };

      const mockJob: JobPosting = {
        id: 1,
        title: 'React Developer',
        company: 'Tech Corp',
        description: 'React developer position',
        userId: 1,
        parsedData: {
          techStack: ['React', 'TypeScript'],
          experienceYears: '3+ years'
        },
        techStack: ['React', 'TypeScript'],
        softSkills: ['Communication'],
        experienceYears: '3+ years',
        location: 'Remote',
        employmentType: 'Full-time',
        createdAt: new Date()
      };

      const result = await calculateMatchScore(mockResume, mockJob);

      expect(result).toBeDefined();
      expect(result.overallScore).toBe(85);
      expect(result.technicalMatch).toBe(90);
      expect(result.experienceMatch).toBe(80);
      expect(result.feedback).toContain('Strong technical match');
    });

    it('should handle missing resume data gracefully', async () => {
      const mockResponse = {
        choices: [{
          message: {
            content: JSON.stringify({
              overallScore: 0,
              technicalMatch: 0,
              experienceMatch: 0,
              skillsMatch: 0,
              feedback: 'Insufficient resume data'
            })
          }
        }]
      };

      mockOpenAI.chat.completions.create.mockResolvedValue(mockResponse);

      const mockResume: Resume = {
        id: 1,
        name: 'Empty Resume',
        userId: 1,
        jsonData: {},
        theme: 'modern',
        isDefault: false,
        createdAt: new Date()
      };

      const mockJob: JobPosting = {
        id: 1,
        title: 'Developer',
        company: 'Tech Corp',
        description: 'Developer position',
        userId: 1,
        parsedData: null,
        techStack: null,
        softSkills: null,
        experienceYears: null,
        location: null,
        employmentType: null,
        createdAt: new Date()
      };

      const result = await calculateMatchScore(mockResume, mockJob);

      expect(result.overallScore).toBe(0);
      expect(result.feedback).toContain('Insufficient');
    });
  });

  describe('Cover Letter Generation', () => {
    it('should generate personalized cover letter', async () => {
      const mockResponse = {
        choices: [{
          message: {
            content: 'Dear Hiring Manager,\n\nI am excited to apply for the React Developer position...'
          }
        }]
      };

      mockOpenAI.chat.completions.create.mockResolvedValue(mockResponse);

      const mockResume: Resume = {
        id: 1,
        name: 'Test Resume',
        userId: 1,
        jsonData: {
          basics: { 
            name: 'John Doe',
            email: 'john@example.com'
          },
          work: [{
            company: 'Previous Corp',
            position: 'Frontend Developer',
            summary: 'Built React applications'
          }]
        },
        theme: 'modern',
        isDefault: true,
        createdAt: new Date()
      };

      const mockJob: JobPosting = {
        id: 1,
        title: 'React Developer',
        company: 'Tech Corp',
        description: 'React developer position with growth opportunities',
        userId: 1,
        parsedData: null,
        techStack: ['React', 'TypeScript'],
        softSkills: ['Communication'],
        experienceYears: '3+ years',
        location: 'Remote',
        employmentType: 'Full-time',
        createdAt: new Date()
      };

      const result = await generateCoverLetter(mockResume, mockJob, 'professional', 1);

      expect(result).toBeDefined();
      expect(result.content).toContain('Dear Hiring Manager');
      expect(result.content).toContain('React Developer');
      expect(mockOpenAI.chat.completions.create).toHaveBeenCalledWith({
        model: 'gpt-4o',
        messages: expect.arrayContaining([
          expect.objectContaining({
            content: expect.stringContaining('professional')
          })
        ])
      });
    });

    it('should customize tone based on parameter', async () => {
      const mockResponse = {
        choices: [{
          message: {
            content: 'Hey there! I\'m super excited about this awesome opportunity...'
          }
        }]
      };

      mockOpenAI.chat.completions.create.mockResolvedValue(mockResponse);

      const mockResume: Resume = {
        id: 1,
        name: 'Test Resume',
        userId: 1,
        jsonData: { basics: { name: 'John Doe' } },
        theme: 'modern',
        isDefault: false,
        createdAt: new Date()
      };

      const mockJob: JobPosting = {
        id: 1,
        title: 'Creative Developer',
        company: 'Startup Inc',
        description: 'Creative developer for innovative projects',
        userId: 1,
        parsedData: null,
        techStack: null,
        softSkills: null,
        experienceYears: null,
        location: null,
        employmentType: null,
        createdAt: new Date()
      };

      const result = await generateCoverLetter(mockResume, mockJob, 'casual', 1);

      expect(result.content).toContain('Hey there');
      expect(result.content).toContain('excited');
    });
  });

  describe('API Key Validation', () => {
    it('should require API key for operations', async () => {
      delete process.env.OPENAI_API_KEY;

      await expect(analyzeJobDescription('Job description', 1))
        .rejects.toThrow();
    });
  });
});