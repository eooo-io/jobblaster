import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertResumeSchema, insertJobPostingSchema, insertMatchScoreSchema, 
  insertCoverLetterSchema, insertApplicationSchema, insertUserSchema
} from "@shared/schema";
import { analyzeJobDescription, calculateMatchScore, generateCoverLetter } from "./openai";
import { setupAuth, hashPassword, verifyPassword, requireAuth, getCurrentUserId } from "./auth";
import multer from "multer";
import JSZip from "jszip";

const upload = multer({ storage: multer.memoryStorage() });

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication middleware
  setupAuth(app);

  // Authentication routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const { username, password, email } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
      }

      // Check if user already exists
      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }

      // Hash password and create user
      const hashedPassword = await hashPassword(password);
      const userData = insertUserSchema.parse({
        username,
        password: hashedPassword,
        email: email || undefined
      });
      
      const user = await storage.createUser(userData);
      
      res.json({ 
        id: user.id, 
        username: user.username, 
        email: user.email,
        message: "Account created successfully" 
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ message: "Registration failed" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
      }

      // Find user and verify password
      const user = await storage.getUserByUsername(username);
      if (!user) {
        return res.status(401).json({ message: "Invalid username or password" });
      }

      const isValidPassword = await verifyPassword(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid username or password" });
      }

      // Set session
      req.session.userId = user.id;
      req.session.username = user.username;

      res.json({ 
        id: user.id, 
        username: user.username, 
        email: user.email,
        message: "Login successful" 
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Logout failed" });
      }
      res.json({ message: "Logout successful" });
    });
  });

  app.get("/api/auth/user", requireAuth, async (req, res) => {
    try {
      const userId = getCurrentUserId(req);
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json({
        id: user.id,
        username: user.username,
        email: user.email
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Resumes (protected routes)
  app.get("/api/resumes", requireAuth, async (req, res) => {
    try {
      const userId = getCurrentUserId(req);
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      const resumes = await storage.getResumesByUserId(userId);
      res.json(resumes);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch resumes" });
    }
  });

  app.get("/api/resumes/:id", async (req, res) => {
    try {
      const resume = await storage.getResume(parseInt(req.params.id));
      if (!resume) {
        return res.status(404).json({ message: "Resume not found" });
      }
      res.json(resume);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch resume" });
    }
  });

  app.post("/api/resumes", requireAuth, async (req, res) => {
    try {
      const userId = getCurrentUserId(req);
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      const resumeData = insertResumeSchema.parse({
        ...req.body,
        userId
      });
      const resume = await storage.createResume(resumeData);
      res.json(resume);
    } catch (error) {
      res.status(400).json({ message: "Invalid resume data" });
    }
  });

  app.put("/api/resumes/:id", async (req, res) => {
    try {
      const resume = await storage.updateResume(parseInt(req.params.id), req.body);
      if (!resume) {
        return res.status(404).json({ message: "Resume not found" });
      }
      res.json(resume);
    } catch (error) {
      res.status(500).json({ message: "Failed to update resume" });
    }
  });

  // Job Postings
  app.get("/api/jobs", async (req, res) => {
    try {
      const jobs = await storage.getJobPostingsByUserId(mockUserId);
      res.json(jobs);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch job postings" });
    }
  });

  app.post("/api/jobs", async (req, res) => {
    try {
      const jobData = insertJobPostingSchema.parse({
        ...req.body,
        userId: mockUserId
      });
      const job = await storage.createJobPosting(jobData);
      res.json(job);
    } catch (error) {
      res.status(400).json({ message: "Invalid job posting data" });
    }
  });

  app.post("/api/jobs/analyze", async (req, res) => {
    try {
      const { description } = req.body;
      if (!description) {
        return res.status(400).json({ message: "Job description is required" });
      }

      const analysis = await analyzeJobDescription(description);
      res.json(analysis);
    } catch (error) {
      res.status(500).json({ message: "Failed to analyze job description" });
    }
  });

  // File upload for job descriptions
  app.post("/api/jobs/upload", upload.single("file"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      let text = "";
      if (req.file.mimetype === "text/plain") {
        text = req.file.buffer.toString("utf-8");
      } else {
        return res.status(400).json({ message: "Only text files are supported for now" });
      }

      const analysis = await analyzeJobDescription(text);
      res.json(analysis);
    } catch (error) {
      res.status(500).json({ message: "Failed to process uploaded file" });
    }
  });

  // Match Scoring
  app.post("/api/match-score", async (req, res) => {
    try {
      const { resumeId, jobId } = req.body;
      
      const resume = await storage.getResume(resumeId);
      const job = await storage.getJobPosting(jobId);
      
      if (!resume || !job) {
        return res.status(404).json({ message: "Resume or job posting not found" });
      }

      const matchScore = await calculateMatchScore(resume, job);
      
      const savedScore = await storage.createMatchScore({
        resumeId,
        jobId,
        ...matchScore
      });

      res.json(savedScore);
    } catch (error) {
      res.status(500).json({ message: "Failed to calculate match score" });
    }
  });

  app.get("/api/match-score/:resumeId/:jobId", async (req, res) => {
    try {
      const resumeId = parseInt(req.params.resumeId);
      const jobId = parseInt(req.params.jobId);
      
      const matchScore = await storage.getMatchScore(resumeId, jobId);
      if (!matchScore) {
        return res.status(404).json({ message: "Match score not found" });
      }
      
      res.json(matchScore);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch match score" });
    }
  });

  // Cover Letters
  app.post("/api/cover-letters", async (req, res) => {
    try {
      const { resumeId, jobId, tone, focus } = req.body;
      
      const resume = await storage.getResume(resumeId);
      const job = await storage.getJobPosting(jobId);
      
      if (!resume || !job) {
        return res.status(404).json({ message: "Resume or job posting not found" });
      }

      const content = await generateCoverLetter(resume, job, tone, focus);
      
      const coverLetter = await storage.createCoverLetter({
        resumeId,
        jobId,
        content,
        tone,
        focus
      });

      res.json(coverLetter);
    } catch (error) {
      res.status(500).json({ message: "Failed to generate cover letter" });
    }
  });

  app.get("/api/cover-letters/:resumeId/:jobId", async (req, res) => {
    try {
      const resumeId = parseInt(req.params.resumeId);
      const jobId = parseInt(req.params.jobId);
      
      const coverLetters = await storage.getCoverLettersByResumeAndJob(resumeId, jobId);
      res.json(coverLetters);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch cover letters" });
    }
  });

  // Export Package
  app.post("/api/export-package", async (req, res) => {
    try {
      const { resumeId, jobId, coverLetterId } = req.body;
      
      const resume = await storage.getResume(resumeId);
      const job = await storage.getJobPosting(jobId);
      const coverLetter = await storage.getCoverLetter(coverLetterId);
      
      if (!resume || !job || !coverLetter) {
        return res.status(404).json({ message: "Required documents not found" });
      }

      const zip = new JSZip();
      
      // Add resume JSON
      zip.file("resume.json", JSON.stringify(resume.jsonData, null, 2));
      
      // Add cover letter
      zip.file("cover-letter.txt", coverLetter.content);
      
      // Add job description
      zip.file("job-description.txt", job.description);
      
      // Add match score if available
      const matchScore = await storage.getMatchScore(resumeId, jobId);
      if (matchScore) {
        const scoreReport = `Match Score Report
Overall Score: ${matchScore.overallScore}%
Technical Skills: ${matchScore.technicalScore}%
Experience Level: ${matchScore.experienceScore}%
Soft Skills: ${matchScore.softSkillsScore}%
Location Match: ${matchScore.locationScore}%

Recommendations:
${matchScore.recommendations?.join('\n') || 'No recommendations available'}`;
        zip.file("match-score-report.txt", scoreReport);
      }

      const zipBuffer = await zip.generateAsync({ type: "nodebuffer" });
      
      res.setHeader("Content-Type", "application/zip");
      res.setHeader("Content-Disposition", `attachment; filename="application-package-${job.company}-${job.title}.zip"`);
      res.send(zipBuffer);
    } catch (error) {
      res.status(500).json({ message: "Failed to create export package" });
    }
  });

  // Applications
  app.get("/api/applications", async (req, res) => {
    try {
      const applications = await storage.getApplicationsByUserId(mockUserId);
      res.json(applications);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch applications" });
    }
  });

  app.post("/api/applications", async (req, res) => {
    try {
      const applicationData = insertApplicationSchema.parse({
        ...req.body,
        userId: mockUserId
      });
      const application = await storage.createApplication(applicationData);
      res.json(application);
    } catch (error) {
      res.status(400).json({ message: "Invalid application data" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
