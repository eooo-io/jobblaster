import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import { registerRoutes } from '../server/routes';

// Mock all dependencies
vi.mock('../server/storage', () => ({
  storage: {
    getUser: vi.fn(),
    getUserByUsername: vi.fn(),
    createUser: vi.fn(),
    updateUser: vi.fn(),
    getResumesByUserId: vi.fn(),
    getResume: vi.fn(),
    createResume: vi.fn(),
    updateResume: vi.fn(),
    deleteResume: vi.fn(),
    setDefaultResume: vi.fn(),
    getDefaultResume: vi.fn(),
    getJobPostingsByUserId: vi.fn(),
    createJobPosting: vi.fn(),
    updateJobPosting: vi.fn(),
    deleteJobPosting: vi.fn(),
    getMatchScore: vi.fn(),
    createMatchScore: vi.fn(),
    getCoverLettersByResumeAndJob: vi.fn(),
    createCoverLetter: vi.fn(),
    getApplicationsByUserId: vi.fn(),
    createApplication: vi.fn(),
    getExternalLogs: vi.fn(),
    createExternalLog: vi.fn(),
    getAiTemplates: vi.fn(),
    getAiTemplate: vi.fn(),
    createAiTemplate: vi.fn(),
    updateAiTemplate: vi.fn(),
    deleteAiTemplate: vi.fn(),
    getTemplateAssignments: vi.fn(),
    setTemplateAssignments: vi.fn()
  }
}));

vi.mock('../server/auth', () => ({
  hashPassword: vi.fn(),
  verifyPassword: vi.fn(),
  requireAuth: vi.fn((req, res, next) => {
    if (req.session?.userId) {
      next();
    } else {
      res.status(401).json({ message: 'Authentication required' });
    }
  }),
  getCurrentUserId: vi.fn((req) => req.session?.userId || null),
  setupAuth: vi.fn()
}));

vi.mock('../server/openai', () => ({
  analyzeJobDescription: vi.fn(),
  calculateMatchScore: vi.fn(),
  generateCoverLetter: vi.fn()
}));

describe('API Routes', () => {
  let app: express.Application;
  let mockStorage: any;

  beforeEach(async () => {
    vi.clearAllMocks();
    app = express();
    app.use(express.json());
    
    // Mock session
    app.use((req, res, next) => {
      req.session = { userId: 1, username: 'testuser' };
      next();
    });

    mockStorage = (await import('../server/storage')).storage;
    await registerRoutes(app);
  });

  describe('Authentication Routes', () => {
    it('should handle login with valid credentials', async () => {
      const { hashPassword, verifyPassword } = await import('../server/auth');
      mockStorage.getUserByUsername.mockResolvedValue({
        id: 1,
        username: 'testuser',
        password: 'hashedpassword',
        email: null
      });
      (verifyPassword as any).mockResolvedValue(true);

      const response = await request(app)
        .post('/api/login')
        .send({ username: 'testuser', password: 'password' });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Login successful');
    });

    it('should reject login with invalid credentials', async () => {
      const { verifyPassword } = await import('../server/auth');
      mockStorage.getUserByUsername.mockResolvedValue({
        id: 1,
        username: 'testuser',
        password: 'hashedpassword'
      });
      (verifyPassword as any).mockResolvedValue(false);

      const response = await request(app)
        .post('/api/login')
        .send({ username: 'testuser', password: 'wrongpassword' });

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Invalid credentials');
    });

    it('should handle logout', async () => {
      const response = await request(app)
        .post('/api/logout');

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Logout successful');
    });
  });

  describe('User Routes', () => {
    it('should get user profile', async () => {
      mockStorage.getUser.mockResolvedValue({
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        profilePicture: null,
        openaiApiKey: null,
        adzunaAppId: null,
        adzunaApiKey: null
      });

      const response = await request(app)
        .get('/api/user/1');

      expect(response.status).toBe(200);
      expect(response.body.username).toBe('testuser');
    });

    it('should update user profile', async () => {
      mockStorage.updateUser.mockResolvedValue({
        id: 1,
        username: 'testuser',
        email: 'updated@example.com',
        profilePicture: null,
        openaiApiKey: 'new-key'
      });

      const response = await request(app)
        .put('/api/user/1')
        .send({ email: 'updated@example.com', openaiApiKey: 'new-key' });

      expect(response.status).toBe(200);
      expect(response.body.email).toBe('updated@example.com');
    });
  });

  describe('Resume Routes', () => {
    it('should get user resumes', async () => {
      mockStorage.getResumesByUserId.mockResolvedValue([
        {
          id: 1,
          name: 'Software Engineer Resume',
          userId: 1,
          jsonData: { basics: { name: 'John Doe' } },
          theme: 'modern',
          isDefault: true,
          createdAt: new Date()
        }
      ]);

      const response = await request(app)
        .get('/api/resumes');

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(1);
      expect(response.body[0].name).toBe('Software Engineer Resume');
    });

    it('should create new resume', async () => {
      mockStorage.createResume.mockResolvedValue({
        id: 2,
        name: 'New Resume',
        userId: 1,
        jsonData: { basics: { name: 'Jane Doe' } },
        theme: 'lucide',
        isDefault: false,
        createdAt: new Date()
      });

      const response = await request(app)
        .post('/api/resumes')
        .send({
          name: 'New Resume',
          jsonData: { basics: { name: 'Jane Doe' } },
          theme: 'lucide'
        });

      expect(response.status).toBe(201);
      expect(response.body.name).toBe('New Resume');
    });

    it('should update resume', async () => {
      mockStorage.updateResume.mockResolvedValue({
        id: 1,
        name: 'Updated Resume',
        userId: 1,
        jsonData: { basics: { name: 'John Updated' } },
        theme: 'modern',
        isDefault: false,
        createdAt: new Date()
      });

      const response = await request(app)
        .put('/api/resumes/1')
        .send({
          name: 'Updated Resume',
          jsonData: { basics: { name: 'John Updated' } }
        });

      expect(response.status).toBe(200);
      expect(response.body.name).toBe('Updated Resume');
    });

    it('should delete resume', async () => {
      mockStorage.deleteResume.mockResolvedValue(true);

      const response = await request(app)
        .delete('/api/resumes/1');

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Resume deleted successfully');
    });

    it('should set default resume', async () => {
      mockStorage.setDefaultResume.mockResolvedValue({
        id: 1,
        name: 'Default Resume',
        userId: 1,
        jsonData: { basics: { name: 'John Doe' } },
        theme: 'modern',
        isDefault: true,
        createdAt: new Date()
      });

      const response = await request(app)
        .put('/api/resumes/1/default');

      expect(response.status).toBe(200);
      expect(response.body.isDefault).toBe(true);
    });
  });

  describe('Job Posting Routes', () => {
    it('should get user job postings', async () => {
      mockStorage.getJobPostingsByUserId.mockResolvedValue([
        {
          id: 1,
          title: 'Software Engineer',
          company: 'Tech Corp',
          description: 'Great opportunity',
          userId: 1,
          parsedData: null,
          techStack: ['React', 'Node.js'],
          softSkills: ['Communication'],
          experienceYears: '3+ years',
          location: 'Remote',
          employmentType: 'Full-time',
          createdAt: new Date()
        }
      ]);

      const response = await request(app)
        .get('/api/jobs');

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(1);
      expect(response.body[0].title).toBe('Software Engineer');
    });

    it('should create job posting with AI analysis', async () => {
      const { analyzeJobDescription } = await import('../server/openai');
      
      mockStorage.createJobPosting.mockResolvedValue({
        id: 2,
        title: 'React Developer',
        company: 'Web Corp',
        description: 'React developer position',
        userId: 1,
        parsedData: {
          techStack: ['React', 'TypeScript'],
          softSkills: ['Team work'],
          experienceYears: '2+ years',
          location: 'San Francisco',
          employmentType: 'Full-time'
        },
        techStack: ['React', 'TypeScript'],
        softSkills: ['Team work'],
        experienceYears: '2+ years',
        location: 'San Francisco',
        employmentType: 'Full-time',
        createdAt: new Date()
      });

      (analyzeJobDescription as any).mockResolvedValue({
        techStack: ['React', 'TypeScript'],
        softSkills: ['Team work'],
        experienceYears: '2+ years',
        location: 'San Francisco',
        employmentType: 'Full-time'
      });

      const response = await request(app)
        .post('/api/jobs')
        .send({
          title: 'React Developer',
          company: 'Web Corp',
          description: 'React developer position requiring 2+ years experience'
        });

      expect(response.status).toBe(201);
      expect(response.body.title).toBe('React Developer');
      expect(response.body.techStack).toContain('React');
    });
  });

  describe('Match Score Routes', () => {
    it('should calculate match score between resume and job', async () => {
      const { calculateMatchScore } = await import('../server/openai');
      
      mockStorage.getResume.mockResolvedValue({
        id: 1,
        name: 'Software Engineer Resume',
        userId: 1,
        jsonData: { 
          basics: { name: 'John Doe' },
          skills: [{ name: 'Programming', keywords: ['React', 'TypeScript'] }]
        },
        theme: 'modern',
        isDefault: true,
        createdAt: new Date()
      });

      mockStorage.createJobPosting.mockResolvedValue({
        id: 1,
        title: 'React Developer',
        company: 'Tech Corp',
        description: 'React position',
        userId: 1,
        parsedData: null,
        techStack: ['React', 'TypeScript'],
        softSkills: ['Communication'],
        experienceYears: '3+ years',
        location: 'Remote',
        employmentType: 'Full-time',
        createdAt: new Date()
      });

      mockStorage.createMatchScore.mockResolvedValue({
        id: 1,
        resumeId: 1,
        jobId: 1,
        overallScore: 85,
        technicalMatch: 90,
        experienceMatch: 80,
        skillsMatch: 85,
        feedback: 'Strong technical match',
        userId: 1,
        createdAt: new Date()
      });

      (calculateMatchScore as any).mockResolvedValue({
        overallScore: 85,
        technicalMatch: 90,
        experienceMatch: 80,
        skillsMatch: 85,
        feedback: 'Strong technical match'
      });

      const response = await request(app)
        .post('/api/match-score')
        .send({ resumeId: 1, jobId: 1 });

      expect(response.status).toBe(200);
      expect(response.body.overallScore).toBe(85);
      expect(response.body.feedback).toContain('Strong technical match');
    });
  });

  describe('Cover Letter Routes', () => {
    it('should generate cover letter', async () => {
      const { generateCoverLetter } = await import('../server/openai');
      
      mockStorage.getResume.mockResolvedValue({
        id: 1,
        name: 'Software Engineer Resume',
        userId: 1,
        jsonData: { 
          basics: { name: 'John Doe', email: 'john@example.com' },
          work: [{ company: 'Previous Corp', position: 'Developer' }]
        },
        theme: 'modern',
        isDefault: true,
        createdAt: new Date()
      });

      mockStorage.createJobPosting.mockResolvedValue({
        id: 1,
        title: 'React Developer',
        company: 'Tech Corp',
        description: 'React position',
        userId: 1,
        parsedData: null,
        techStack: ['React'],
        softSkills: ['Communication'],
        experienceYears: '3+ years',
        location: 'Remote',
        employmentType: 'Full-time',
        createdAt: new Date()
      });

      mockStorage.createCoverLetter.mockResolvedValue({
        id: 1,
        resumeId: 1,
        jobId: 1,
        content: 'Dear Hiring Manager,\n\nI am excited to apply...',
        tone: 'professional',
        userId: 1,
        createdAt: new Date()
      });

      (generateCoverLetter as any).mockResolvedValue({
        content: 'Dear Hiring Manager,\n\nI am excited to apply...'
      });

      const response = await request(app)
        .post('/api/cover-letters')
        .send({ resumeId: 1, jobId: 1, tone: 'professional' });

      expect(response.status).toBe(201);
      expect(response.body.content).toContain('Dear Hiring Manager');
      expect(response.body.tone).toBe('professional');
    });
  });

  describe('AI Template Routes', () => {
    it('should get AI templates', async () => {
      mockStorage.getAiTemplates.mockResolvedValue([
        {
          id: 1,
          name: 'Job Analysis Template',
          provider: 'openai',
          category: 'job_analysis',
          content: 'Analyze this job posting...',
          isActive: true,
          userId: 1,
          createdAt: new Date()
        }
      ]);

      const response = await request(app)
        .get('/api/ai-templates');

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(1);
      expect(response.body[0].name).toBe('Job Analysis Template');
    });

    it('should create AI template', async () => {
      mockStorage.createAiTemplate.mockResolvedValue({
        id: 2,
        name: 'New Template',
        provider: 'anthropic',
        category: 'resume_match',
        content: 'Match resume with job...',
        isActive: true,
        userId: 1,
        createdAt: new Date()
      });

      const response = await request(app)
        .post('/api/ai-templates')
        .send({
          name: 'New Template',
          provider: 'anthropic',
          category: 'resume_match',
          content: 'Match resume with job...',
          isActive: true
        });

      expect(response.status).toBe(201);
      expect(response.body.name).toBe('New Template');
      expect(response.body.provider).toBe('anthropic');
    });

    it('should update AI template', async () => {
      mockStorage.updateAiTemplate.mockResolvedValue({
        id: 1,
        name: 'Updated Template',
        provider: 'openai',
        category: 'job_analysis',
        content: 'Updated content...',
        isActive: false,
        userId: 1,
        createdAt: new Date()
      });

      const response = await request(app)
        .put('/api/ai-templates/1')
        .send({
          name: 'Updated Template',
          content: 'Updated content...',
          isActive: false
        });

      expect(response.status).toBe(200);
      expect(response.body.name).toBe('Updated Template');
      expect(response.body.isActive).toBe(false);
    });

    it('should delete AI template', async () => {
      mockStorage.deleteAiTemplate.mockResolvedValue(true);

      const response = await request(app)
        .delete('/api/ai-templates/1');

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Template deleted successfully');
    });
  });

  describe('Template Assignment Routes', () => {
    it('should get template assignments', async () => {
      mockStorage.getTemplateAssignments.mockResolvedValue([
        {
          id: 1,
          userId: 1,
          category: 'job_analysis',
          templateId: 1,
          createdAt: new Date()
        }
      ]);

      const response = await request(app)
        .get('/api/template-assignments');

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(1);
      expect(response.body[0].category).toBe('job_analysis');
    });

    it('should set template assignments', async () => {
      mockStorage.setTemplateAssignments.mockResolvedValue([
        {
          id: 1,
          userId: 1,
          category: 'job_analysis',
          templateId: 1,
          createdAt: new Date()
        },
        {
          id: 2,
          userId: 1,
          category: 'resume_match',
          templateId: 2,
          createdAt: new Date()
        }
      ]);

      const assignments = [
        { category: 'job_analysis', templateId: 1 },
        { category: 'resume_match', templateId: 2 }
      ];

      const response = await request(app)
        .post('/api/template-assignments')
        .send(assignments);

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(2);
    });
  });

  describe('External Logs Routes', () => {
    it('should get external logs with pagination', async () => {
      mockStorage.getExternalLogs.mockResolvedValue([
        {
          id: 1,
          service: 'openai',
          endpoint: 'https://api.openai.com/v1/chat/completions',
          method: 'POST',
          requestData: { message: 'test' },
          responseData: { response: 'success' },
          statusCode: 200,
          success: true,
          errorMessage: null,
          userId: 1,
          createdAt: new Date()
        }
      ]);

      const response = await request(app)
        .get('/api/external-logs?page=1&limit=10');

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(1);
      expect(response.body[0].service).toBe('openai');
    });
  });

  describe('Error Handling', () => {
    it('should handle database errors gracefully', async () => {
      mockStorage.getResumesByUserId.mockRejectedValue(new Error('Database connection failed'));

      const response = await request(app)
        .get('/api/resumes');

      expect(response.status).toBe(500);
      expect(response.body.message).toBe('Failed to fetch resumes');
    });

    it('should handle validation errors', async () => {
      const response = await request(app)
        .post('/api/resumes')
        .send({
          // Missing required fields
          name: ''
        });

      expect(response.status).toBe(400);
    });

    it('should handle authentication errors', async () => {
      // Override auth middleware to simulate unauthenticated request
      app.use((req, res, next) => {
        req.session = {};
        next();
      });

      const response = await request(app)
        .get('/api/resumes');

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Authentication required');
    });
  });

  describe('Job Search Integration', () => {
    it('should handle job search requests', async () => {
      // Mock global fetch for external API calls
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          results: [
            {
              id: '123',
              title: 'Software Engineer',
              company: { display_name: 'Tech Corp' },
              description: 'Great opportunity',
              location: { display_name: 'San Francisco' },
              redirect_url: 'https://example.com/job/123'
            }
          ],
          count: 1
        })
      });

      const response = await request(app)
        .get('/api/jobs/search?query=software%20engineer&location=san%20francisco');

      expect(response.status).toBe(200);
      expect(response.body.jobs).toBeDefined();
      expect(response.body.totalCount).toBeDefined();
    });
  });
});