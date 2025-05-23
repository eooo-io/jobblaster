import { describe, it, expect } from 'vitest';
import { 
  insertUserSchema, 
  insertResumeSchema, 
  insertJobPostingSchema,
  insertMatchScoreSchema,
  insertCoverLetterSchema,
  insertApplicationSchema,
  insertExternalLogSchema,
  insertAiTemplateSchema,
  insertTemplateAssignmentSchema
} from '@shared/schema';

describe('Schema Validation', () => {
  describe('User Schema', () => {
    it('should validate correct user data', () => {
      const validUser = {
        username: 'testuser',
        password: 'securePassword123'
      };

      const result = insertUserSchema.safeParse(validUser);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.username).toBe('testuser');
        expect(result.data.password).toBe('securePassword123');
      }
    });

    it('should reject user data with missing username', () => {
      const invalidUser = {
        password: 'securePassword123'
      };

      const result = insertUserSchema.safeParse(invalidUser);
      expect(result.success).toBe(false);
    });

    it('should reject user data with missing password', () => {
      const invalidUser = {
        username: 'testuser'
      };

      const result = insertUserSchema.safeParse(invalidUser);
      expect(result.success).toBe(false);
    });

    it('should reject empty username', () => {
      const invalidUser = {
        username: '',
        password: 'securePassword123'
      };

      const result = insertUserSchema.safeParse(invalidUser);
      expect(result.success).toBe(false);
    });

    it('should reject empty password', () => {
      const invalidUser = {
        username: 'testuser',
        password: ''
      };

      const result = insertUserSchema.safeParse(invalidUser);
      expect(result.success).toBe(false);
    });
  });

  describe('Resume Schema', () => {
    it('should validate correct resume data', () => {
      const validResume = {
        name: 'Software Engineer Resume',
        userId: 1,
        jsonData: {
          basics: {
            name: 'John Doe',
            email: 'john@example.com',
            phone: '555-1234',
            summary: 'Experienced software engineer'
          },
          work: [{
            company: 'Tech Corp',
            position: 'Senior Developer',
            startDate: '2020-01-01',
            endDate: '2023-12-31',
            summary: 'Led development team'
          }],
          education: [{
            institution: 'University of Technology',
            area: 'Computer Science',
            studyType: 'Bachelor',
            startDate: '2016-09-01',
            endDate: '2020-05-15'
          }],
          skills: [{
            name: 'Programming Languages',
            keywords: ['JavaScript', 'TypeScript', 'Python']
          }]
        },
        theme: 'modern'
      };

      const result = insertResumeSchema.safeParse(validResume);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.name).toBe('Software Engineer Resume');
        expect(result.data.userId).toBe(1);
        expect(result.data.theme).toBe('modern');
        expect(result.data.jsonData).toBeDefined();
      }
    });

    it('should reject resume with missing required fields', () => {
      const invalidResume = {
        name: 'Incomplete Resume'
        // Missing userId, jsonData, theme
      };

      const result = insertResumeSchema.safeParse(invalidResume);
      expect(result.success).toBe(false);
    });

    it('should validate different theme options', () => {
      const themes = ['modern', 'lucide', 'debug'];
      
      themes.forEach(theme => {
        const resume = {
          name: 'Test Resume',
          userId: 1,
          jsonData: { basics: { name: 'Test' } },
          theme
        };

        const result = insertResumeSchema.safeParse(resume);
        expect(result.success).toBe(true);
      });
    });

    it('should handle complex JSON data structures', () => {
      const complexResume = {
        name: 'Complex Resume',
        userId: 1,
        jsonData: {
          basics: {
            name: 'Jane Smith',
            label: 'Full Stack Developer',
            image: 'https://example.com/photo.jpg',
            email: 'jane@example.com',
            phone: '(555) 123-4567',
            url: 'https://janesmith.dev',
            summary: 'Passionate full stack developer with 5+ years experience',
            location: {
              address: '123 Tech Street',
              postalCode: '12345',
              city: 'San Francisco',
              countryCode: 'US',
              region: 'California'
            },
            profiles: [{
              network: 'GitHub',
              username: 'janesmith',
              url: 'https://github.com/janesmith'
            }]
          },
          work: [{
            name: 'TechCorp Inc.',
            position: 'Senior Full Stack Developer',
            url: 'https://techcorp.com',
            startDate: '2021-03-01',
            summary: 'Lead development of microservices architecture',
            highlights: [
              'Reduced API response time by 40%',
              'Mentored 3 junior developers'
            ]
          }],
          volunteer: [{
            organization: 'Code for Good',
            position: 'Volunteer Developer',
            startDate: '2020-01-01',
            summary: 'Built web applications for non-profits'
          }],
          education: [{
            institution: 'Stanford University',
            url: 'https://stanford.edu',
            area: 'Computer Science',
            studyType: 'Master of Science',
            startDate: '2018-09-01',
            endDate: '2020-06-15',
            score: '3.8',
            courses: ['Advanced Algorithms', 'Machine Learning']
          }],
          awards: [{
            title: 'Best Innovation Award',
            date: '2022-12-01',
            awarder: 'TechCorp Inc.',
            summary: 'Recognized for innovative API design'
          }],
          certificates: [{
            name: 'AWS Certified Solutions Architect',
            date: '2021-06-15',
            issuer: 'Amazon Web Services'
          }],
          publications: [{
            name: 'Modern Web Development Practices',
            publisher: 'Tech Journal',
            releaseDate: '2022-03-01',
            url: 'https://techjournal.com/article'
          }],
          skills: [{
            name: 'Programming Languages',
            level: 'Master',
            keywords: ['JavaScript', 'TypeScript', 'Python', 'Java']
          }],
          languages: [{
            language: 'English',
            fluency: 'Native speaker'
          }],
          interests: [{
            name: 'Open Source',
            keywords: ['Contributing', 'Maintainer']
          }],
          references: [{
            name: 'John Manager',
            reference: 'Jane is an exceptional developer with strong leadership skills'
          }],
          projects: [{
            name: 'Personal Portfolio',
            startDate: '2021-01-01',
            summary: 'Built with React and Node.js',
            highlights: ['Responsive design', 'SEO optimized'],
            url: 'https://janesmith.dev'
          }]
        },
        theme: 'lucide'
      };

      const result = insertResumeSchema.safeParse(complexResume);
      expect(result.success).toBe(true);
    });
  });

  describe('Job Posting Schema', () => {
    it('should validate correct job posting data', () => {
      const validJob = {
        title: 'Senior React Developer',
        company: 'Innovation Labs',
        description: 'We are looking for an experienced React developer to join our growing team. The ideal candidate will have 5+ years of experience with React, TypeScript, and modern web development practices.',
        userId: 1
      };

      const result = insertJobPostingSchema.safeParse(validJob);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.title).toBe('Senior React Developer');
        expect(result.data.company).toBe('Innovation Labs');
        expect(result.data.userId).toBe(1);
      }
    });

    it('should reject job posting with missing required fields', () => {
      const invalidJob = {
        title: 'Developer'
        // Missing company, description, userId
      };

      const result = insertJobPostingSchema.safeParse(invalidJob);
      expect(result.success).toBe(false);
    });

    it('should handle long job descriptions', () => {
      const longDescription = 'A'.repeat(5000); // Very long description
      
      const job = {
        title: 'Software Engineer',
        company: 'Big Corp',
        description: longDescription,
        userId: 1
      };

      const result = insertJobPostingSchema.safeParse(job);
      expect(result.success).toBe(true);
    });
  });

  describe('Match Score Schema', () => {
    it('should validate correct match score data', () => {
      const validMatchScore = {
        resumeId: 1,
        jobId: 1,
        overallScore: 85,
        technicalMatch: 90,
        experienceMatch: 80,
        skillsMatch: 85,
        feedback: 'Strong technical match with relevant experience in React and Node.js',
        userId: 1
      };

      const result = insertMatchScoreSchema.safeParse(validMatchScore);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.overallScore).toBe(85);
        expect(result.data.technicalMatch).toBe(90);
        expect(result.data.feedback).toContain('Strong technical match');
      }
    });

    it('should validate score ranges', () => {
      const scores = [0, 25, 50, 75, 100];
      
      scores.forEach(score => {
        const matchScore = {
          resumeId: 1,
          jobId: 1,
          overallScore: score,
          technicalMatch: score,
          experienceMatch: score,
          skillsMatch: score,
          feedback: `Score: ${score}`,
          userId: 1
        };

        const result = insertMatchScoreSchema.safeParse(matchScore);
        expect(result.success).toBe(true);
      });
    });

    it('should reject invalid score ranges', () => {
      const invalidScores = [-1, 101, 150];
      
      invalidScores.forEach(score => {
        const matchScore = {
          resumeId: 1,
          jobId: 1,
          overallScore: score,
          technicalMatch: 50,
          experienceMatch: 50,
          skillsMatch: 50,
          feedback: 'Test feedback',
          userId: 1
        };

        const result = insertMatchScoreSchema.safeParse(matchScore);
        expect(result.success).toBe(false);
      });
    });
  });

  describe('Cover Letter Schema', () => {
    it('should validate correct cover letter data', () => {
      const validCoverLetter = {
        resumeId: 1,
        jobId: 1,
        content: 'Dear Hiring Manager,\n\nI am excited to apply for the Software Engineer position at Tech Corp...',
        tone: 'professional',
        userId: 1
      };

      const result = insertCoverLetterSchema.safeParse(validCoverLetter);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.tone).toBe('professional');
        expect(result.data.content).toContain('Dear Hiring Manager');
      }
    });

    it('should validate different tone options', () => {
      const tones = ['professional', 'casual', 'enthusiastic', 'formal'];
      
      tones.forEach(tone => {
        const coverLetter = {
          resumeId: 1,
          jobId: 1,
          content: `Cover letter with ${tone} tone`,
          tone,
          userId: 1
        };

        const result = insertCoverLetterSchema.safeParse(coverLetter);
        expect(result.success).toBe(true);
      });
    });
  });

  describe('External Log Schema', () => {
    it('should validate correct external log data', () => {
      const validLog = {
        service: 'openai',
        endpoint: 'https://api.openai.com/v1/chat/completions',
        method: 'POST',
        requestData: { 
          model: 'gpt-4o',
          messages: [{ role: 'user', content: 'Analyze this job posting' }]
        },
        responseData: {
          choices: [{ message: { content: 'Analysis complete' } }]
        },
        statusCode: 200,
        success: true,
        errorMessage: null,
        userId: 1
      };

      const result = insertExternalLogSchema.safeParse(validLog);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.service).toBe('openai');
        expect(result.data.statusCode).toBe(200);
        expect(result.data.success).toBe(true);
      }
    });

    it('should validate error scenarios', () => {
      const errorLog = {
        service: 'adzuna',
        endpoint: 'https://api.adzuna.com/v1/api/jobs/us/search/1',
        method: 'GET',
        requestData: null,
        responseData: { error: 'Unauthorized' },
        statusCode: 401,
        success: false,
        errorMessage: 'API key invalid',
        userId: 1
      };

      const result = insertExternalLogSchema.safeParse(errorLog);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.success).toBe(false);
        expect(result.data.errorMessage).toBe('API key invalid');
      }
    });
  });

  describe('AI Template Schema', () => {
    it('should validate correct AI template data', () => {
      const validTemplate = {
        name: 'Job Analysis Template',
        provider: 'openai',
        category: 'job_analysis',
        content: 'Analyze the following job posting and extract: {analysis_instructions}',
        isActive: true,
        userId: 1
      };

      const result = insertAiTemplateSchema.safeParse(validTemplate);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.provider).toBe('openai');
        expect(result.data.category).toBe('job_analysis');
        expect(result.data.isActive).toBe(true);
      }
    });

    it('should validate different providers', () => {
      const providers = ['openai', 'anthropic', 'xai'];
      
      providers.forEach(provider => {
        const template = {
          name: `${provider} Template`,
          provider,
          category: 'job_analysis',
          content: `Template for ${provider}`,
          isActive: true,
          userId: 1
        };

        const result = insertAiTemplateSchema.safeParse(template);
        expect(result.success).toBe(true);
      });
    });

    it('should validate different categories', () => {
      const categories = ['job_analysis', 'resume_match', 'cover_letter'];
      
      categories.forEach(category => {
        const template = {
          name: `Template for ${category}`,
          provider: 'openai',
          category,
          content: `Content for ${category}`,
          isActive: true,
          userId: 1
        };

        const result = insertAiTemplateSchema.safeParse(template);
        expect(result.success).toBe(true);
      });
    });
  });

  describe('Template Assignment Schema', () => {
    it('should validate correct template assignment data', () => {
      const validAssignment = {
        userId: 1,
        category: 'job_analysis',
        templateId: 5
      };

      const result = insertTemplateAssignmentSchema.safeParse(validAssignment);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.userId).toBe(1);
        expect(result.data.category).toBe('job_analysis');
        expect(result.data.templateId).toBe(5);
      }
    });

    it('should validate all category types', () => {
      const categories = ['job_analysis', 'resume_match', 'cover_letter'];
      
      categories.forEach(category => {
        const assignment = {
          userId: 1,
          category,
          templateId: 1
        };

        const result = insertTemplateAssignmentSchema.safeParse(assignment);
        expect(result.success).toBe(true);
      });
    });
  });

  describe('Data Type Validation', () => {
    it('should handle numeric values correctly', () => {
      const matchScore = {
        resumeId: 1,
        jobId: 1,
        overallScore: 85.5, // Decimal score
        technicalMatch: 90,
        experienceMatch: 80,
        skillsMatch: 85,
        feedback: 'Good match',
        userId: 1
      };

      const result = insertMatchScoreSchema.safeParse(matchScore);
      expect(result.success).toBe(true);
    });

    it('should handle boolean values correctly', () => {
      const template = {
        name: 'Test Template',
        provider: 'openai',
        category: 'job_analysis',
        content: 'Test content',
        isActive: false, // Boolean value
        userId: 1
      };

      const result = insertAiTemplateSchema.safeParse(template);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.isActive).toBe(false);
      }
    });

    it('should handle null values where allowed', () => {
      const log = {
        service: 'test',
        endpoint: 'https://api.test.com',
        method: 'GET',
        requestData: null, // Null value
        responseData: null, // Null value
        statusCode: 204,
        success: true,
        errorMessage: null, // Null value
        userId: 1
      };

      const result = insertExternalLogSchema.safeParse(log);
      expect(result.success).toBe(true);
    });
  });
});