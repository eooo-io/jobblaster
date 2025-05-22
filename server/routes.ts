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
        email: user.email,
        profilePicture: user.profilePicture
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Profile picture upload
  app.post("/api/upload-profile-picture", requireAuth, upload.single("profilePicture"), async (req: any, res: Response) => {
    try {
      const userId = getCurrentUserId(req);
      if (!userId) {
        return res.status(401).json({ message: "Authentication required" });
      }

      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      // Convert to base64 for storage
      const base64Image = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
      
      const updatedUser = await storage.updateUser(userId, { profilePicture: base64Image });
      
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json({ 
        message: "Profile picture updated successfully",
        profilePicture: base64Image
      });
    } catch (error) {
      console.error("Error uploading profile picture:", error);
      res.status(500).json({ message: "Failed to upload profile picture" });
    }
  });

  // Update profile settings
  app.post("/api/update-profile", requireAuth, async (req, res) => {
    try {
      const userId = getCurrentUserId(req);
      if (!userId) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const { openaiApiKey, adzunaAppId, adzunaApiKey } = req.body;
      
      const updateData: any = {};
      if (openaiApiKey !== undefined) updateData.openaiApiKey = openaiApiKey;
      if (adzunaAppId !== undefined) updateData.adzunaAppId = adzunaAppId;
      if (adzunaApiKey !== undefined) updateData.adzunaApiKey = adzunaApiKey;
      
      const updatedUser = await storage.updateUser(userId, updateData);
      
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json({ 
        message: "Profile updated successfully",
        openaiApiKey: updatedUser.openaiApiKey
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(500).json({ message: "Failed to update profile" });
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

  // PATCH route for renaming resumes
  app.patch("/api/resumes/:id", requireAuth, async (req, res) => {
    try {
      const userId = getCurrentUserId(req);
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const resumeId = parseInt(req.params.id);
      const { name } = req.body;

      if (!name || typeof name !== 'string' || !name.trim()) {
        return res.status(400).json({ message: "Valid name is required" });
      }

      // Check if resume belongs to the user
      const existingResume = await storage.getResume(resumeId);
      if (!existingResume) {
        return res.status(404).json({ message: "Resume not found" });
      }

      if (existingResume.userId !== userId) {
        return res.status(403).json({ message: "Not authorized to update this resume" });
      }

      const resume = await storage.updateResume(resumeId, { name: name.trim() });
      if (!resume) {
        return res.status(404).json({ message: "Resume not found" });
      }
      
      res.json(resume);
    } catch (error) {
      console.error("Resume rename error:", error);
      res.status(500).json({ message: "Failed to rename resume" });
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

  // Job Search API Routes
  app.get("/api/jobs/search", requireAuth, async (req: any, res: Response) => {
    try {
      const userId = getCurrentUserId(req);
      if (!userId) return res.status(401).json({ message: "Authentication required" });

      const user = await storage.getUser(userId);
      if (!user) return res.status(404).json({ message: "User not found" });

      // Import JobConnectorManager here to avoid circular imports
      const { JobConnectorManager } = await import("./job-connectors/connector-manager");
      const connectorManager = new JobConnectorManager(user);

      const searchParams = {
        query: req.query.query as string,
        location: req.query.location as string,
        salary_min: req.query.salary_min ? parseInt(req.query.salary_min as string) : undefined,
        salary_max: req.query.salary_max ? parseInt(req.query.salary_max as string) : undefined,
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        per_page: 20
      };

      const { results, errors } = await connectorManager.searchJobs(searchParams);
      
      if (results.length === 0 && errors.length > 0) {
        return res.status(400).json({ 
          message: "No job connectors are configured or all searches failed",
          errors 
        });
      }

      // Combine results from all connectors
      const combinedJobs = results.flatMap(result => result.jobs);
      const totalResults = results.reduce((sum, result) => sum + result.total_results, 0);

      res.json({
        jobs: combinedJobs,
        total_results: totalResults,
        page: searchParams.page,
        per_page: searchParams.per_page,
        has_more: results.some(result => result.has_more),
        connector_errors: errors
      });

    } catch (error) {
      console.error("Job search error:", error);
      res.status(500).json({ message: "Failed to search jobs" });
    }
  });

  // Set default resume
  app.put("/api/resumes/:id/default", requireAuth, async (req: any, res: Response) => {
    try {
      const userId = getCurrentUserId(req);
      if (!userId) return res.status(401).json({ message: "Authentication required" });

      const resumeId = parseInt(req.params.id);
      const defaultResume = await storage.setDefaultResume(userId, resumeId);
      
      if (!defaultResume) {
        return res.status(404).json({ message: "Resume not found" });
      }

      res.json(defaultResume);
    } catch (error) {
      console.error("Set default resume error:", error);
      res.status(500).json({ message: "Failed to set default resume" });
    }
  });

  // Get default resume
  app.get("/api/resumes/default", requireAuth, async (req: any, res: Response) => {
    try {
      const userId = getCurrentUserId(req);
      if (!userId) return res.status(401).json({ message: "Authentication required" });

      const defaultResume = await storage.getDefaultResume(userId);
      res.json(defaultResume || null);
    } catch (error) {
      console.error("Get default resume error:", error);
      res.status(500).json({ message: "Failed to get default resume" });
    }
  });

  // Get available job connectors
  app.get("/api/jobs/connectors", requireAuth, async (req: any, res: Response) => {
    try {
      const userId = getCurrentUserId(req);
      if (!userId) return res.status(401).json({ message: "Authentication required" });

      const user = await storage.getUser(userId);
      if (!user) return res.status(404).json({ message: "User not found" });

      const { JobConnectorManager } = await import("./job-connectors/connector-manager");
      const connectorManager = new JobConnectorManager(user);

      res.json({
        available: connectorManager.getAvailableConnectors(),
        configured: connectorManager.getConfiguredConnectors()
      });

    } catch (error) {
      console.error("Connector list error:", error);
      res.status(500).json({ message: "Failed to get connectors" });
    }
  });

  // Update connector credentials
  app.put("/api/jobs/connectors", requireAuth, async (req: any, res: Response) => {
    try {
      const userId = getCurrentUserId(req);
      if (!userId) return res.status(401).json({ message: "Authentication required" });

      const { adzunaAppId, adzunaApiKey } = req.body;

      const updateData: any = {};
      if (adzunaAppId !== undefined) updateData.adzunaAppId = adzunaAppId;
      if (adzunaApiKey !== undefined) updateData.adzunaApiKey = adzunaApiKey;

      const updatedUser = await storage.updateUser(userId, updateData);
      if (!updatedUser) return res.status(404).json({ message: "User not found" });

      res.json({ message: "Connector credentials updated successfully" });

    } catch (error) {
      console.error("Connector update error:", error);
      res.status(500).json({ message: "Failed to update connector credentials" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
