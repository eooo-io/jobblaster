import { 
  users, resumes, jobPostings, matchScores, coverLetters, applications,
  type User, type InsertUser, type Resume, type InsertResume, 
  type JobPosting, type InsertJobPosting, type MatchScore, type InsertMatchScore,
  type CoverLetter, type InsertCoverLetter, type Application, type InsertApplication
} from "@shared/schema";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Resumes
  getResume(id: number): Promise<Resume | undefined>;
  getResumesByUserId(userId: number): Promise<Resume[]>;
  createResume(resume: InsertResume): Promise<Resume>;
  updateResume(id: number, resume: Partial<InsertResume>): Promise<Resume | undefined>;
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
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
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
}

export const storage = new MemStorage();
