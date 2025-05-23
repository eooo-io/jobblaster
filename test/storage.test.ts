import { describe, it, expect, beforeEach } from 'vitest';
import { MemStorage } from '@server/storage';
import type { InsertUser, InsertResume, InsertJobPosting } from '@shared/schema';

describe('Storage Layer', () => {
  let storage: MemStorage;

  beforeEach(() => {
    storage = new MemStorage();
  });

  describe('User Management', () => {
    it('should create a user with valid data', async () => {
      const userData: InsertUser = {
        username: 'testuser',
        password: 'hashedpassword'
      };

      const user = await storage.createUser(userData);
      
      expect(user).toBeDefined();
      expect(user.id).toBeDefined();
      expect(user.username).toBe('testuser');
      expect(user.password).toBe('hashedpassword');
      expect(user.createdAt).toBeInstanceOf(Date);
    });

    it('should retrieve user by ID', async () => {
      const userData: InsertUser = {
        username: 'testuser',
        password: 'hashedpassword'
      };

      const createdUser = await storage.createUser(userData);
      const retrievedUser = await storage.getUser(createdUser.id);
      
      expect(retrievedUser).toBeDefined();
      expect(retrievedUser?.username).toBe('testuser');
    });

    it('should retrieve user by username', async () => {
      const userData: InsertUser = {
        username: 'testuser',
        password: 'hashedpassword'
      };

      await storage.createUser(userData);
      const retrievedUser = await storage.getUserByUsername('testuser');
      
      expect(retrievedUser).toBeDefined();
      expect(retrievedUser?.username).toBe('testuser');
    });

    it('should return undefined for non-existent user', async () => {
      const user = await storage.getUser(999);
      expect(user).toBeUndefined();
    });

    it('should update user data', async () => {
      const userData: InsertUser = {
        username: 'testuser',
        password: 'hashedpassword'
      };

      const createdUser = await storage.createUser(userData);
      const updatedUser = await storage.updateUser(createdUser.id, {
        username: 'updateduser'
      });
      
      expect(updatedUser).toBeDefined();
      expect(updatedUser?.username).toBe('updateduser');
      expect(updatedUser?.password).toBe('hashedpassword'); // Should remain unchanged
    });
  });

  describe('Resume Management', () => {
    let userId: number;

    beforeEach(async () => {
      const user = await storage.createUser({
        username: 'testuser',
        password: 'hashedpassword'
      });
      userId = user.id;
    });

    it('should create a resume', async () => {
      const resumeData: InsertResume = {
        name: 'Test Resume',
        jsonData: { basics: { name: 'John Doe' } },
        userId,
        theme: 'modern'
      };

      const resume = await storage.createResume(resumeData);
      
      expect(resume).toBeDefined();
      expect(resume.id).toBeDefined();
      expect(resume.name).toBe('Test Resume');
      expect(resume.userId).toBe(userId);
      expect(resume.theme).toBe('modern');
    });

    it('should retrieve resumes by user ID', async () => {
      const resumeData1: InsertResume = {
        name: 'Resume 1',
        jsonData: { basics: { name: 'John Doe' } },
        userId,
        theme: 'modern'
      };

      const resumeData2: InsertResume = {
        name: 'Resume 2',
        jsonData: { basics: { name: 'Jane Doe' } },
        userId,
        theme: 'lucide'
      };

      await storage.createResume(resumeData1);
      await storage.createResume(resumeData2);

      const resumes = await storage.getResumesByUserId(userId);
      
      expect(resumes).toHaveLength(2);
      expect(resumes.map(r => r.name)).toContain('Resume 1');
      expect(resumes.map(r => r.name)).toContain('Resume 2');
    });

    it('should set and retrieve default resume', async () => {
      const resumeData: InsertResume = {
        name: 'Default Resume',
        jsonData: { basics: { name: 'John Doe' } },
        userId,
        theme: 'modern'
      };

      const resume = await storage.createResume(resumeData);
      await storage.setDefaultResume(userId, resume.id);

      const defaultResume = await storage.getDefaultResume(userId);
      
      expect(defaultResume).toBeDefined();
      expect(defaultResume?.id).toBe(resume.id);
      expect(defaultResume?.isDefault).toBe(true);
    });

    it('should delete a resume', async () => {
      const resumeData: InsertResume = {
        name: 'To Delete',
        jsonData: { basics: { name: 'John Doe' } },
        userId,
        theme: 'modern'
      };

      const resume = await storage.createResume(resumeData);
      const deleted = await storage.deleteResume(resume.id);
      
      expect(deleted).toBe(true);
      
      const retrievedResume = await storage.getResume(resume.id);
      expect(retrievedResume).toBeUndefined();
    });
  });

  describe('Job Posting Management', () => {
    let userId: number;

    beforeEach(async () => {
      const user = await storage.createUser({
        username: 'testuser',
        password: 'hashedpassword'
      });
      userId = user.id;
    });

    it('should create a job posting', async () => {
      const jobData: InsertJobPosting = {
        title: 'Software Engineer',
        company: 'Tech Corp',
        description: 'Build amazing software',
        userId
      };

      const job = await storage.createJobPosting(jobData);
      
      expect(job).toBeDefined();
      expect(job.id).toBeDefined();
      expect(job.title).toBe('Software Engineer');
      expect(job.company).toBe('Tech Corp');
      expect(job.userId).toBe(userId);
    });

    it('should retrieve job postings by user ID', async () => {
      const jobData1: InsertJobPosting = {
        title: 'Frontend Developer',
        company: 'Web Corp',
        description: 'Build UIs',
        userId
      };

      const jobData2: InsertJobPosting = {
        title: 'Backend Developer',
        company: 'API Corp',
        description: 'Build APIs',
        userId
      };

      await storage.createJobPosting(jobData1);
      await storage.createJobPosting(jobData2);

      const jobs = await storage.getJobPostingsByUserId(userId);
      
      expect(jobs).toHaveLength(2);
      expect(jobs.map(j => j.title)).toContain('Frontend Developer');
      expect(jobs.map(j => j.title)).toContain('Backend Developer');
    });

    it('should update job posting', async () => {
      const jobData: InsertJobPosting = {
        title: 'Software Engineer',
        company: 'Tech Corp',
        description: 'Build amazing software',
        userId
      };

      const job = await storage.createJobPosting(jobData);
      const updatedJob = await storage.updateJobPosting(job.id, {
        title: 'Senior Software Engineer'
      });
      
      expect(updatedJob).toBeDefined();
      expect(updatedJob?.title).toBe('Senior Software Engineer');
      expect(updatedJob?.company).toBe('Tech Corp'); // Should remain unchanged
    });

    it('should delete a job posting', async () => {
      const jobData: InsertJobPosting = {
        title: 'To Delete',
        company: 'Delete Corp',
        description: 'Will be deleted',
        userId
      };

      const job = await storage.createJobPosting(jobData);
      const deleted = await storage.deleteJobPosting(job.id);
      
      expect(deleted).toBe(true);
      
      const retrievedJob = await storage.getJobPosting(job.id);
      expect(retrievedJob).toBeUndefined();
    });
  });

  describe('Data Consistency', () => {
    it('should maintain referential integrity for resumes', async () => {
      const user = await storage.createUser({
        username: 'testuser',
        password: 'hashedpassword'
      });

      const resumeData: InsertResume = {
        name: 'Test Resume',
        jsonData: { basics: { name: 'John Doe' } },
        userId: user.id,
        theme: 'modern'
      };

      const resume = await storage.createResume(resumeData);
      expect(resume.userId).toBe(user.id);
    });

    it('should handle concurrent operations safely', async () => {
      const userData: InsertUser = {
        username: 'testuser',
        password: 'hashedpassword'
      };

      // Create multiple users concurrently
      const promises = Array.from({ length: 5 }, (_, i) => 
        storage.createUser({
          ...userData,
          username: `user${i}`
        })
      );

      const users = await Promise.all(promises);
      
      expect(users).toHaveLength(5);
      const userIds = users.map(u => u.id);
      const uniqueIds = new Set(userIds);
      expect(uniqueIds.size).toBe(5); // All IDs should be unique
    });
  });
});