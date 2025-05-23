import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DatabaseStorage } from '@server/storage';
import { db } from '@server/db';

// Mock the database
vi.mock('@server/db', () => ({
  db: {
    select: vi.fn(),
    insert: vi.fn(),
    update: vi.fn(),
    delete: vi.fn()
  }
}));

describe('Database Operations', () => {
  let storage: DatabaseStorage;

  beforeEach(() => {
    vi.clearAllMocks();
    storage = new DatabaseStorage();
  });

  describe('User Database Operations', () => {
    it('should create user in database', async () => {
      const mockInsert = {
        values: vi.fn().mockReturnThis(),
        returning: vi.fn().mockResolvedValue([{
          id: 1,
          username: 'testuser',
          password: 'hashedpass',
          email: null,
          profilePicture: null,
          openaiApiKey: null,
          adzunaAppId: null,
          adzunaApiKey: null,
          indeedApiKey: null,
          glassdoorApiKey: null,
          anthropicApiKey: null,
          xaiApiKey: null,
          createdAt: new Date()
        }])
      };
      
      (db.insert as any).mockReturnValue(mockInsert);

      const userData = {
        username: 'testuser',
        password: 'hashedpass'
      };

      const result = await storage.createUser(userData);

      expect(db.insert).toHaveBeenCalled();
      expect(mockInsert.values).toHaveBeenCalledWith(userData);
      expect(mockInsert.returning).toHaveBeenCalled();
      expect(result.username).toBe('testuser');
    });

    it('should retrieve user by ID from database', async () => {
      const mockSelect = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue([{
          id: 1,
          username: 'testuser',
          password: 'hashedpass',
          email: null,
          profilePicture: null,
          openaiApiKey: null,
          adzunaAppId: null,
          adzunaApiKey: null,
          indeedApiKey: null,
          glassdoorApiKey: null,
          anthropicApiKey: null,
          xaiApiKey: null,
          createdAt: new Date()
        }])
      };

      (db.select as any).mockReturnValue(mockSelect);

      const result = await storage.getUser(1);

      expect(db.select).toHaveBeenCalled();
      expect(mockSelect.from).toHaveBeenCalled();
      expect(mockSelect.where).toHaveBeenCalled();
      expect(result?.username).toBe('testuser');
    });

    it('should update user in database', async () => {
      const mockUpdate = {
        set: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        returning: vi.fn().mockResolvedValue([{
          id: 1,
          username: 'updateduser',
          password: 'hashedpass',
          email: 'test@example.com',
          profilePicture: null,
          openaiApiKey: null,
          adzunaAppId: null,
          adzunaApiKey: null,
          indeedApiKey: null,
          glassdoorApiKey: null,
          anthropicApiKey: null,
          xaiApiKey: null,
          createdAt: new Date()
        }])
      };

      (db.update as any).mockReturnValue(mockUpdate);

      const result = await storage.updateUser(1, {
        username: 'updateduser',
        email: 'test@example.com'
      });

      expect(db.update).toHaveBeenCalled();
      expect(mockUpdate.set).toHaveBeenCalledWith({
        username: 'updateduser',
        email: 'test@example.com'
      });
      expect(mockUpdate.where).toHaveBeenCalled();
      expect(mockUpdate.returning).toHaveBeenCalled();
      expect(result?.username).toBe('updateduser');
      expect(result?.email).toBe('test@example.com');
    });
  });

  describe('Resume Database Operations', () => {
    it('should create resume in database', async () => {
      const mockInsert = {
        values: vi.fn().mockReturnThis(),
        returning: vi.fn().mockResolvedValue([{
          id: 1,
          name: 'Test Resume',
          userId: 1,
          jsonData: { basics: { name: 'John Doe' } },
          theme: 'modern',
          isDefault: false,
          createdAt: new Date()
        }])
      };

      (db.insert as any).mockReturnValue(mockInsert);

      const resumeData = {
        name: 'Test Resume',
        userId: 1,
        jsonData: { basics: { name: 'John Doe' } },
        theme: 'modern'
      };

      const result = await storage.createResume(resumeData);

      expect(db.insert).toHaveBeenCalled();
      expect(mockInsert.values).toHaveBeenCalledWith(resumeData);
      expect(result.name).toBe('Test Resume');
    });

    it('should retrieve resumes by user ID from database', async () => {
      const mockSelect = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue([
          {
            id: 1,
            name: 'Resume 1',
            userId: 1,
            jsonData: { basics: { name: 'John Doe' } },
            theme: 'modern',
            isDefault: true,
            createdAt: new Date()
          },
          {
            id: 2,
            name: 'Resume 2',
            userId: 1,
            jsonData: { basics: { name: 'John Doe' } },
            theme: 'lucide',
            isDefault: false,
            createdAt: new Date()
          }
        ])
      };

      (db.select as any).mockReturnValue(mockSelect);

      const result = await storage.getResumesByUserId(1);

      expect(db.select).toHaveBeenCalled();
      expect(mockSelect.from).toHaveBeenCalled();
      expect(mockSelect.where).toHaveBeenCalled();
      expect(result).toHaveLength(2);
      expect(result[0].name).toBe('Resume 1');
      expect(result[1].name).toBe('Resume 2');
    });

    it('should set default resume in database', async () => {
      const mockUpdateFalse = {
        set: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue([])
      };

      const mockUpdateTrue = {
        set: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        returning: vi.fn().mockResolvedValue([{
          id: 2,
          name: 'New Default Resume',
          userId: 1,
          jsonData: { basics: { name: 'John Doe' } },
          theme: 'modern',
          isDefault: true,
          createdAt: new Date()
        }])
      };

      (db.update as any)
        .mockReturnValueOnce(mockUpdateFalse)
        .mockReturnValueOnce(mockUpdateTrue);

      const result = await storage.setDefaultResume(1, 2);

      expect(db.update).toHaveBeenCalledTimes(2);
      expect(result?.isDefault).toBe(true);
      expect(result?.id).toBe(2);
    });
  });

  describe('Job Posting Database Operations', () => {
    it('should create job posting in database', async () => {
      const mockInsert = {
        values: vi.fn().mockReturnThis(),
        returning: vi.fn().mockResolvedValue([{
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
        }])
      };

      (db.insert as any).mockReturnValue(mockInsert);

      const jobData = {
        title: 'Software Engineer',
        company: 'Tech Corp',
        description: 'Great opportunity',
        userId: 1
      };

      const result = await storage.createJobPosting(jobData);

      expect(db.insert).toHaveBeenCalled();
      expect(mockInsert.values).toHaveBeenCalledWith(jobData);
      expect(result.title).toBe('Software Engineer');
    });
  });

  describe('External Logs Database Operations', () => {
    it('should create external log in database', async () => {
      const mockInsert = {
        values: vi.fn().mockReturnThis(),
        returning: vi.fn().mockResolvedValue([{
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
        }])
      };

      (db.insert as any).mockReturnValue(mockInsert);

      const logData = {
        service: 'openai',
        endpoint: 'https://api.openai.com/v1/chat/completions',
        method: 'POST',
        requestData: { message: 'test' },
        responseData: { response: 'success' },
        statusCode: 200,
        success: true,
        errorMessage: null,
        userId: 1
      };

      const result = await storage.createExternalLog(logData);

      expect(db.insert).toHaveBeenCalled();
      expect(mockInsert.values).toHaveBeenCalledWith(logData);
      expect(result.service).toBe('openai');
      expect(result.success).toBe(true);
    });

    it('should retrieve external logs with pagination', async () => {
      const mockSelect = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([
          {
            id: 1,
            service: 'openai',
            endpoint: 'https://api.openai.com/v1/models',
            method: 'GET',
            requestData: null,
            responseData: { data: [] },
            statusCode: 200,
            success: true,
            errorMessage: null,
            userId: 1,
            createdAt: new Date()
          }
        ])
      };

      (db.select as any).mockReturnValue(mockSelect);

      const result = await storage.getExternalLogs(1, 10);

      expect(db.select).toHaveBeenCalled();
      expect(mockSelect.from).toHaveBeenCalled();
      expect(mockSelect.where).toHaveBeenCalled();
      expect(mockSelect.orderBy).toHaveBeenCalled();
      expect(mockSelect.limit).toHaveBeenCalledWith(10);
      expect(result).toHaveLength(1);
      expect(result[0].service).toBe('openai');
    });
  });

  describe('AI Template Database Operations', () => {
    it('should create AI template in database', async () => {
      const mockInsert = {
        values: vi.fn().mockReturnThis(),
        returning: vi.fn().mockResolvedValue([{
          id: 1,
          name: 'Job Analysis Template',
          provider: 'openai',
          category: 'job_analysis',
          content: 'Analyze this job posting...',
          isActive: true,
          userId: 1,
          createdAt: new Date()
        }])
      };

      (db.insert as any).mockReturnValue(mockInsert);

      const templateData = {
        name: 'Job Analysis Template',
        provider: 'openai',
        category: 'job_analysis',
        content: 'Analyze this job posting...',
        isActive: true,
        userId: 1
      };

      const result = await storage.createAiTemplate(templateData);

      expect(db.insert).toHaveBeenCalled();
      expect(mockInsert.values).toHaveBeenCalledWith(templateData);
      expect(result.name).toBe('Job Analysis Template');
      expect(result.provider).toBe('openai');
    });

    it('should retrieve AI templates by user ID', async () => {
      const mockSelect = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockResolvedValue([
          {
            id: 1,
            name: 'OpenAI Job Analysis',
            provider: 'openai',
            category: 'job_analysis',
            content: 'Analyze job posting with OpenAI',
            isActive: true,
            userId: 1,
            createdAt: new Date()
          },
          {
            id: 2,
            name: 'Anthropic Resume Match',
            provider: 'anthropic',
            category: 'resume_match',
            content: 'Match resume with Anthropic',
            isActive: false,
            userId: 1,
            createdAt: new Date()
          }
        ])
      };

      (db.select as any).mockReturnValue(mockSelect);

      const result = await storage.getAiTemplates(1);

      expect(db.select).toHaveBeenCalled();
      expect(mockSelect.from).toHaveBeenCalled();
      expect(mockSelect.where).toHaveBeenCalled();
      expect(mockSelect.orderBy).toHaveBeenCalled();
      expect(result).toHaveLength(2);
      expect(result[0].provider).toBe('openai');
      expect(result[1].provider).toBe('anthropic');
    });
  });

  describe('Template Assignment Database Operations', () => {
    it('should set template assignments in database', async () => {
      const mockDelete = {
        where: vi.fn().mockResolvedValue([])
      };

      const mockInsert = {
        values: vi.fn().mockReturnThis(),
        returning: vi.fn().mockResolvedValue([
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
        ])
      };

      (db.delete as any).mockReturnValue(mockDelete);
      (db.insert as any).mockReturnValue(mockInsert);

      const assignments = [
        { userId: 1, category: 'job_analysis', templateId: 1 },
        { userId: 1, category: 'resume_match', templateId: 2 }
      ];

      const result = await storage.setTemplateAssignments(1, assignments);

      expect(db.delete).toHaveBeenCalled();
      expect(mockDelete.where).toHaveBeenCalled();
      expect(db.insert).toHaveBeenCalled();
      expect(mockInsert.values).toHaveBeenCalledWith(assignments);
      expect(result).toHaveLength(2);
      expect(result[0].category).toBe('job_analysis');
      expect(result[1].category).toBe('resume_match');
    });
  });

  describe('Error Handling', () => {
    it('should handle database connection errors', async () => {
      const mockSelect = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockRejectedValue(new Error('Database connection failed'))
      };

      (db.select as any).mockReturnValue(mockSelect);

      await expect(storage.getUser(1)).rejects.toThrow('Database connection failed');
    });

    it('should handle constraint violations', async () => {
      const mockInsert = {
        values: vi.fn().mockReturnThis(),
        returning: vi.fn().mockRejectedValue(new Error('UNIQUE constraint failed'))
      };

      (db.insert as any).mockReturnValue(mockInsert);

      await expect(storage.createUser({
        username: 'duplicate',
        password: 'password'
      })).rejects.toThrow('UNIQUE constraint failed');
    });

    it('should handle invalid foreign key references', async () => {
      const mockInsert = {
        values: vi.fn().mockReturnThis(),
        returning: vi.fn().mockRejectedValue(new Error('FOREIGN KEY constraint failed'))
      };

      (db.insert as any).mockReturnValue(mockInsert);

      await expect(storage.createResume({
        name: 'Test Resume',
        userId: 999, // Non-existent user
        jsonData: {},
        theme: 'modern'
      })).rejects.toThrow('FOREIGN KEY constraint failed');
    });
  });

  describe('Data Validation', () => {
    it('should handle empty results gracefully', async () => {
      const mockSelect = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue([])
      };

      (db.select as any).mockReturnValue(mockSelect);

      const result = await storage.getUser(999);
      expect(result).toBeUndefined();
    });

    it('should handle null values in database', async () => {
      const mockSelect = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue([{
          id: 1,
          username: 'testuser',
          password: 'hashedpass',
          email: null,
          profilePicture: null,
          openaiApiKey: null,
          adzunaAppId: null,
          adzunaApiKey: null,
          indeedApiKey: null,
          glassdoorApiKey: null,
          anthropicApiKey: null,
          xaiApiKey: null,
          createdAt: new Date()
        }])
      };

      (db.select as any).mockReturnValue(mockSelect);

      const result = await storage.getUser(1);
      expect(result?.email).toBeNull();
      expect(result?.profilePicture).toBeNull();
      expect(result?.openaiApiKey).toBeNull();
    });
  });
});