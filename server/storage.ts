import { 
  users, resumes, jobPostings, matchScores, coverLetters, applications, externalLogs, aiTemplates, templateAssignments,
  type User, type InsertUser, type Resume, type InsertResume, 
  type JobPosting, type InsertJobPosting, type MatchScore, type InsertMatchScore,
  type CoverLetter, type InsertCoverLetter, type Application, type InsertApplication,
  type ExternalLog, type InsertExternalLog, type AiTemplate, type InsertAiTemplate,
  type TemplateAssignment, type InsertTemplateAssignment
} from "@shared/schema";
import { db } from "./db";
import { eq, and } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined>;

  // Resumes
  getResume(id: number): Promise<Resume | undefined>;
  getResumesByUserId(userId: number): Promise<Resume[]>;
  getDefaultResume(userId: number): Promise<Resume | undefined>;
  createResume(resume: InsertResume): Promise<Resume>;
  updateResume(id: number, resume: Partial<InsertResume>): Promise<Resume | undefined>;
  setDefaultResume(userId: number, resumeId: number): Promise<Resume | undefined>;
  deleteResume(id: number): Promise<boolean>;

  // Job Postings
  getJobPosting(id: number): Promise<JobPosting | undefined>;
  getJobPostingsByUserId(userId: number): Promise<JobPosting[]>;
  createJobPosting(jobPosting: InsertJobPosting): Promise<JobPosting>;
  updateJobPosting(id: number, jobPosting: Partial<InsertJobPosting>): Promise<JobPosting | undefined>;
  deleteJobPosting(id: number): Promise<boolean>;

  // Match Scores
  getMatchScore(resumeId: number, jobId: number): Promise<MatchScore | undefined>;
  createMatchScore(matchScore: InsertMatchScore): Promise<MatchScore>;
  updateMatchScore(id: number, matchScore: Partial<InsertMatchScore>): Promise<MatchScore | undefined>;

  // Cover Letters
  getCoverLetter(id: number): Promise<CoverLetter | undefined>;
  getCoverLettersByResumeAndJob(resumeId: number, jobId: number): Promise<CoverLetter[]>;
  createCoverLetter(coverLetter: InsertCoverLetter): Promise<CoverLetter>;
  updateCoverLetter(id: number, coverLetter: Partial<InsertCoverLetter>): Promise<CoverLetter | undefined>;

  // Applications
  getApplication(id: number): Promise<Application | undefined>;
  getApplicationsByUserId(userId: number): Promise<Application[]>;
  createApplication(application: InsertApplication): Promise<Application>;
  updateApplication(id: number, application: Partial<InsertApplication>): Promise<Application | undefined>;

  // External Logs
  getExternalLogs(userId: number, limit?: number): Promise<ExternalLog[]>;
  createExternalLog(log: InsertExternalLog): Promise<ExternalLog>;

  // AI Templates
  getAiTemplates(userId: number): Promise<AiTemplate[]>;
  getAiTemplate(id: number): Promise<AiTemplate | undefined>;
  createAiTemplate(template: InsertAiTemplate): Promise<AiTemplate>;
  updateAiTemplate(id: number, template: Partial<InsertAiTemplate>): Promise<AiTemplate | undefined>;
  deleteAiTemplate(id: number): Promise<boolean>;

  // Template Assignments
  getTemplateAssignments(userId: number): Promise<TemplateAssignment[]>;
  setTemplateAssignments(userId: number, assignments: InsertTemplateAssignment[]): Promise<TemplateAssignment[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private resumes: Map<number, Resume>;
  private jobPostings: Map<number, JobPosting>;
  private matchScores: Map<number, MatchScore>;
  private coverLetters: Map<number, CoverLetter>;
  private applications: Map<number, Application>;
  private currentUserId: number;
  private currentResumeId: number;
  private currentJobId: number;
  private currentMatchId: number;
  private currentCoverLetterId: number;
  private currentApplicationId: number;

  constructor() {
    this.users = new Map();
    this.resumes = new Map();
    this.jobPostings = new Map();
    this.matchScores = new Map();
    this.coverLetters = new Map();
    this.applications = new Map();
    this.currentUserId = 1;
    this.currentResumeId = 1;
    this.currentJobId = 1;
    this.currentMatchId = 1;
    this.currentCoverLetterId = 1;
    this.currentApplicationId = 1;
  }

  // Users
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { 
      ...insertUser, 
      id,
      email: insertUser.email || null,
      profilePicture: null,
      openaiApiKey: null,
      createdAt: new Date()
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, userUpdate: Partial<InsertUser>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updated = { ...user, ...userUpdate };
    this.users.set(id, updated);
    return updated;
  }

  // Resumes
  async getResume(id: number): Promise<Resume | undefined> {
    return this.resumes.get(id);
  }

  async getResumesByUserId(userId: number): Promise<Resume[]> {
    return Array.from(this.resumes.values()).filter(resume => resume.userId === userId);
  }

  async createResume(insertResume: InsertResume): Promise<Resume> {
    const id = this.currentResumeId++;
    const resume: Resume = { 
      ...insertResume, 
      id, 
      createdAt: new Date() 
    };
    this.resumes.set(id, resume);
    return resume;
  }

  async updateResume(id: number, resumeUpdate: Partial<InsertResume>): Promise<Resume | undefined> {
    const resume = this.resumes.get(id);
    if (!resume) return undefined;
    
    const updated = { ...resume, ...resumeUpdate };
    this.resumes.set(id, updated);
    return updated;
  }

  async getDefaultResume(userId: number): Promise<Resume | undefined> {
    return Array.from(this.resumes.values()).find(
      resume => resume.userId === userId && resume.isDefault
    );
  }

  async setDefaultResume(userId: number, resumeId: number): Promise<Resume | undefined> {
    // First, remove default flag from all user's resumes
    Array.from(this.resumes.values())
      .filter(resume => resume.userId === userId)
      .forEach(resume => {
        this.resumes.set(resume.id, { ...resume, isDefault: false });
      });
    
    // Then set the specified resume as default
    const resume = this.resumes.get(resumeId);
    if (resume && resume.userId === userId) {
      const defaultResume = { ...resume, isDefault: true };
      this.resumes.set(resumeId, defaultResume);
      return defaultResume;
    }
    
    return undefined;
  }

  async deleteResume(id: number): Promise<boolean> {
    return this.resumes.delete(id);
  }

  // Job Postings
  async getJobPosting(id: number): Promise<JobPosting | undefined> {
    return this.jobPostings.get(id);
  }

  async getJobPostingsByUserId(userId: number): Promise<JobPosting[]> {
    return Array.from(this.jobPostings.values()).filter(job => job.userId === userId);
  }

  async createJobPosting(insertJobPosting: InsertJobPosting): Promise<JobPosting> {
    const id = this.currentJobId++;
    const jobPosting: JobPosting = { 
      ...insertJobPosting, 
      id, 
      createdAt: new Date() 
    };
    this.jobPostings.set(id, jobPosting);
    return jobPosting;
  }

  async updateJobPosting(id: number, jobUpdate: Partial<InsertJobPosting>): Promise<JobPosting | undefined> {
    const job = this.jobPostings.get(id);
    if (!job) return undefined;
    
    const updated = { ...job, ...jobUpdate };
    this.jobPostings.set(id, updated);
    return updated;
  }

  async deleteJobPosting(id: number): Promise<boolean> {
    return this.jobPostings.delete(id);
  }

  // Match Scores
  async getMatchScore(resumeId: number, jobId: number): Promise<MatchScore | undefined> {
    return Array.from(this.matchScores.values()).find(
      score => score.resumeId === resumeId && score.jobId === jobId
    );
  }

  async createMatchScore(insertMatchScore: InsertMatchScore): Promise<MatchScore> {
    const id = this.currentMatchId++;
    const matchScore: MatchScore = { 
      ...insertMatchScore, 
      id, 
      createdAt: new Date() 
    };
    this.matchScores.set(id, matchScore);
    return matchScore;
  }

  async updateMatchScore(id: number, scoreUpdate: Partial<InsertMatchScore>): Promise<MatchScore | undefined> {
    const score = this.matchScores.get(id);
    if (!score) return undefined;
    
    const updated = { ...score, ...scoreUpdate };
    this.matchScores.set(id, updated);
    return updated;
  }

  // Cover Letters
  async getCoverLetter(id: number): Promise<CoverLetter | undefined> {
    return this.coverLetters.get(id);
  }

  async getCoverLettersByResumeAndJob(resumeId: number, jobId: number): Promise<CoverLetter[]> {
    return Array.from(this.coverLetters.values()).filter(
      letter => letter.resumeId === resumeId && letter.jobId === jobId
    );
  }

  async createCoverLetter(insertCoverLetter: InsertCoverLetter): Promise<CoverLetter> {
    const id = this.currentCoverLetterId++;
    const coverLetter: CoverLetter = { 
      ...insertCoverLetter, 
      id, 
      createdAt: new Date() 
    };
    this.coverLetters.set(id, coverLetter);
    return coverLetter;
  }

  async updateCoverLetter(id: number, letterUpdate: Partial<InsertCoverLetter>): Promise<CoverLetter | undefined> {
    const letter = this.coverLetters.get(id);
    if (!letter) return undefined;
    
    const updated = { ...letter, ...letterUpdate };
    this.coverLetters.set(id, updated);
    return updated;
  }

  // Applications
  async getApplication(id: number): Promise<Application | undefined> {
    return this.applications.get(id);
  }

  async getApplicationsByUserId(userId: number): Promise<Application[]> {
    return Array.from(this.applications.values()).filter(app => app.userId === userId);
  }

  async createApplication(insertApplication: InsertApplication): Promise<Application> {
    const id = this.currentApplicationId++;
    const application: Application = { 
      ...insertApplication, 
      id, 
      createdAt: new Date() 
    };
    this.applications.set(id, application);
    return application;
  }

  async updateApplication(id: number, appUpdate: Partial<InsertApplication>): Promise<Application | undefined> {
    const app = this.applications.get(id);
    if (!app) return undefined;
    
    const updated = { ...app, ...appUpdate };
    this.applications.set(id, updated);
    return updated;
  }

  // External Logs (MemStorage implementation)
  async getExternalLogs(userId: number, limit: number = 100): Promise<ExternalLog[]> {
    // MemStorage doesn't persist external logs
    return [];
  }

  async createExternalLog(insertLog: InsertExternalLog): Promise<ExternalLog> {
    // MemStorage doesn't persist external logs, return a mock for interface compliance
    const log: ExternalLog = {
      id: 1,
      ...insertLog,
      createdAt: new Date()
    };
    return log;
  }
}

// Database Storage Implementation
export class DatabaseStorage implements IStorage {
  // Users
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUser(id: number, userUpdate: Partial<InsertUser>): Promise<User | undefined> {
    const [user] = await db.update(users).set(userUpdate).where(eq(users.id, id)).returning();
    return user;
  }

  // Resumes - Database Implementation
  async getResume(id: number): Promise<Resume | undefined> {
    const [resume] = await db.select().from(resumes).where(eq(resumes.id, id));
    return resume;
  }

  async getResumesByUserId(userId: number): Promise<Resume[]> {
    console.log(`Fetching resumes for user ${userId}`);
    const userResumes = await db.select().from(resumes).where(eq(resumes.userId, userId));
    console.log(`Found ${userResumes.length} resumes:`, userResumes.map(r => ({ id: r.id, name: r.name })));
    return userResumes;
  }

  async getDefaultResume(userId: number): Promise<Resume | undefined> {
    const [defaultResume] = await db.select().from(resumes).where(
      and(eq(resumes.userId, userId), eq(resumes.isDefault, true))
    );
    return defaultResume;
  }

  async createResume(insertResume: InsertResume): Promise<Resume> {
    const [resume] = await db.insert(resumes).values(insertResume).returning();
    return resume;
  }

  async setDefaultResume(userId: number, resumeId: number): Promise<Resume | undefined> {
    // First, remove default flag from all user's resumes
    await db.update(resumes)
      .set({ isDefault: false })
      .where(eq(resumes.userId, userId));
    
    // Then set the specified resume as default
    const [defaultResume] = await db.update(resumes)
      .set({ isDefault: true })
      .where(and(eq(resumes.id, resumeId), eq(resumes.userId, userId)))
      .returning();
    
    return defaultResume;
  }

  async updateResume(id: number, resumeUpdate: Partial<InsertResume>): Promise<Resume | undefined> {
    const [resume] = await db.update(resumes).set(resumeUpdate).where(eq(resumes.id, id)).returning();
    return resume;
  }

  async deleteResume(id: number): Promise<boolean> {
    console.log(`Attempting to delete resume with id: ${id}`);
    const result = await db.delete(resumes).where(eq(resumes.id, id));
    console.log(`Delete result:`, result);
    console.log(`Row count:`, result.rowCount);
    const success = result.rowCount !== null && result.rowCount > 0;
    console.log(`Delete successful:`, success);
    return success;
  }

  // Job Postings - Database Implementation
  async getJobPosting(id: number): Promise<JobPosting | undefined> {
    const [jobPosting] = await db.select().from(jobPostings).where(eq(jobPostings.id, id));
    return jobPosting;
  }

  async getJobPostingsByUserId(userId: number): Promise<JobPosting[]> {
    const userJobPostings = await db.select().from(jobPostings).where(eq(jobPostings.userId, userId));
    return userJobPostings;
  }

  async createJobPosting(insertJobPosting: InsertJobPosting): Promise<JobPosting> {
    const [jobPosting] = await db.insert(jobPostings).values(insertJobPosting).returning();
    return jobPosting;
  }

  async updateJobPosting(id: number, jobUpdate: Partial<InsertJobPosting>): Promise<JobPosting | undefined> {
    const [jobPosting] = await db.update(jobPostings).set(jobUpdate).where(eq(jobPostings.id, id)).returning();
    return jobPosting;
  }

  async deleteJobPosting(id: number): Promise<boolean> {
    const result = await db.delete(jobPostings).where(eq(jobPostings.id, id));
    return result.rowCount > 0;
  }

  // Match Scores - Database Implementation
  async getMatchScore(resumeId: number, jobId: number): Promise<MatchScore | undefined> {
    const [matchScore] = await db.select().from(matchScores)
      .where(eq(matchScores.resumeId, resumeId))
      .where(eq(matchScores.jobId, jobId));
    return matchScore;
  }

  async createMatchScore(insertMatchScore: InsertMatchScore): Promise<MatchScore> {
    const [matchScore] = await db.insert(matchScores).values(insertMatchScore).returning();
    return matchScore;
  }

  async updateMatchScore(id: number, scoreUpdate: Partial<InsertMatchScore>): Promise<MatchScore | undefined> {
    const [matchScore] = await db.update(matchScores).set(scoreUpdate).where(eq(matchScores.id, id)).returning();
    return matchScore;
  }

  // Cover Letters - Database Implementation
  async getCoverLetter(id: number): Promise<CoverLetter | undefined> {
    const [coverLetter] = await db.select().from(coverLetters).where(eq(coverLetters.id, id));
    return coverLetter;
  }

  async getCoverLettersByResumeAndJob(resumeId: number, jobId: number): Promise<CoverLetter[]> {
    const letters = await db.select().from(coverLetters)
      .where(eq(coverLetters.resumeId, resumeId))
      .where(eq(coverLetters.jobId, jobId));
    return letters;
  }

  async createCoverLetter(insertCoverLetter: InsertCoverLetter): Promise<CoverLetter> {
    const [coverLetter] = await db.insert(coverLetters).values(insertCoverLetter).returning();
    return coverLetter;
  }

  async updateCoverLetter(id: number, letterUpdate: Partial<InsertCoverLetter>): Promise<CoverLetter | undefined> {
    const [coverLetter] = await db.update(coverLetters).set(letterUpdate).where(eq(coverLetters.id, id)).returning();
    return coverLetter;
  }

  // Applications - Database Implementation
  async getApplication(id: number): Promise<Application | undefined> {
    const [application] = await db.select().from(applications).where(eq(applications.id, id));
    return application;
  }

  async getApplicationsByUserId(userId: number): Promise<Application[]> {
    const userApplications = await db.select().from(applications).where(eq(applications.userId, userId));
    return userApplications;
  }

  async createApplication(insertApplication: InsertApplication): Promise<Application> {
    const [application] = await db.insert(applications).values(insertApplication).returning();
    return application;
  }

  async updateApplication(id: number, appUpdate: Partial<InsertApplication>): Promise<Application | undefined> {
    const [application] = await db.update(applications).set(appUpdate).where(eq(applications.id, id)).returning();
    return application;
  }

  // External Logs
  async getExternalLogs(userId: number, limit: number = 100): Promise<ExternalLog[]> {
    const logs = await db.select().from(externalLogs)
      .where(eq(externalLogs.userId, userId))
      .orderBy(externalLogs.createdAt)
      .limit(limit);
    return logs;
  }

  async createExternalLog(insertLog: InsertExternalLog): Promise<ExternalLog> {
    const [log] = await db.insert(externalLogs).values(insertLog).returning();
    return log;
  }

  // AI Templates
  async getAiTemplates(userId: number): Promise<AiTemplate[]> {
    const templates = await db.select().from(aiTemplates)
      .where(eq(aiTemplates.userId, userId))
      .orderBy(aiTemplates.createdAt);
    return templates;
  }

  async getAiTemplate(id: number): Promise<AiTemplate | undefined> {
    const [template] = await db.select().from(aiTemplates).where(eq(aiTemplates.id, id));
    return template;
  }

  async createAiTemplate(insertTemplate: InsertAiTemplate): Promise<AiTemplate> {
    const [template] = await db.insert(aiTemplates).values(insertTemplate).returning();
    return template;
  }

  async updateAiTemplate(id: number, templateUpdate: Partial<InsertAiTemplate>): Promise<AiTemplate | undefined> {
    const [template] = await db.update(aiTemplates)
      .set({ ...templateUpdate, updatedAt: new Date() })
      .where(eq(aiTemplates.id, id))
      .returning();
    return template;
  }

  async deleteAiTemplate(id: number): Promise<boolean> {
    const result = await db.delete(aiTemplates).where(eq(aiTemplates.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Template Assignments - Database Implementation
  async getTemplateAssignments(userId: number): Promise<TemplateAssignment[]> {
    const assignments = await db.select().from(templateAssignments).where(eq(templateAssignments.userId, userId));
    return assignments;
  }

  async setTemplateAssignments(userId: number, assignments: InsertTemplateAssignment[]): Promise<TemplateAssignment[]> {
    // Clear existing assignments for this user
    await db.delete(templateAssignments).where(eq(templateAssignments.userId, userId));
    
    // Insert new assignments
    const result = [];
    for (const assignment of assignments) {
      if (assignment.templateId) {
        const [saved] = await db.insert(templateAssignments).values({
          userId,
          category: assignment.category,
          templateId: assignment.templateId
        }).returning();
        result.push(saved);
      }
    }
    
    return result;
  }
}

export const storage = new DatabaseStorage();
