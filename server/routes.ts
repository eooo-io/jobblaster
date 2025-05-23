import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertResumeSchema, insertJobPostingSchema, insertMatchScoreSchema, 
  insertCoverLetterSchema, insertApplicationSchema, insertUserSchema
} from "@shared/schema";
import { analyzeJobDescription, calculateMatchScore, generateCoverLetter } from "./openai";
import { setupAuth, hashPassword, verifyPassword, requireAuth, getCurrentUserId } from "./auth";
import { logApiCall } from "./api-logger";
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
        profilePicture: user.profilePicture,
        openaiApiKey: user.openaiApiKey,
        adzunaAppId: user.adzunaAppId,
        adzunaApiKey: user.adzunaApiKey
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

      const { openaiApiKey, adzunaAppId, adzunaApiKey, appId, apiKey } = req.body;
      
      console.log('Update profile request body:', req.body);
      
      const updateData: any = {};
      if (openaiApiKey !== undefined) updateData.openaiApiKey = openaiApiKey;
      if (adzunaAppId !== undefined) updateData.adzunaAppId = adzunaAppId;
      if (adzunaApiKey !== undefined) updateData.adzunaApiKey = adzunaApiKey;
      // Also check for the other possible field names from frontend
      if (appId !== undefined) updateData.adzunaAppId = appId;
      if (apiKey !== undefined) updateData.adzunaApiKey = apiKey;
      
      console.log('Update data to be sent to storage:', updateData);
      
      const updatedUser = await storage.updateUser(userId, updateData);
      console.log('User updated successfully, updatedUser:', !!updatedUser);
      console.log('Now testing APIs...');
      
      if (!updatedUser) {
        console.log('UpdateUser returned null - user not found');
        return res.status(404).json({ message: "User not found" });
      }

      // Test APIs if credentials were provided
      let adzunaTestResult = null;
      let openaiTestResult = null;

      // Test Adzuna API connection
      if (updateData.adzunaAppId && updateData.adzunaApiKey) {
        try {
          const testUrl = `https://api.adzuna.com/v1/api/jobs/us/search/1?app_id=${updateData.adzunaAppId}&app_key=${updateData.adzunaApiKey}&results_per_page=1&what=test`;
          const testResponse = await fetch(testUrl);
          const testData = await testResponse.json();
          
          if (testResponse.ok) {
            adzunaTestResult = { success: true, message: "Connection successful" };
          } else {
            adzunaTestResult = { success: false, error: testData };
          }
        } catch (error) {
          adzunaTestResult = { 
            success: false, 
            error: { message: "Network error", details: error.message } 
          };
        }
      }

      // Test OpenAI API connection
      console.log("Checking if OpenAI API key provided:", !!updateData.openaiApiKey);
      if (updateData.openaiApiKey) {
        try {
          console.log("Testing OpenAI API key...");
          const testResponse = await fetch('https://api.openai.com/v1/models', {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${updateData.openaiApiKey}`,
              'Content-Type': 'application/json'
            }
          });
          
          console.log("OpenAI API response status:", testResponse.status);
          
          if (testResponse.ok) {
            openaiTestResult = { success: true, message: "API key verified successfully" };
            console.log("OpenAI API test successful");
          } else {
            const errorData = await testResponse.json();
            openaiTestResult = { success: false, error: errorData };
            console.log("OpenAI API test failed:", errorData);
          }
        } catch (error) {
          openaiTestResult = { 
            success: false, 
            error: { message: "Network error", details: error.message } 
          };
          console.log("OpenAI API test network error:", error);
        }
      }
      
      console.log("Final response data:", { 
        adzunaTest: adzunaTestResult, 
        openaiTest: openaiTestResult 
      });

      res.json({ 
        message: "Profile updated successfully",
        openaiApiKey: updatedUser.openaiApiKey,
        adzunaTest: adzunaTestResult,
        openaiTest: openaiTestResult
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

  // System Tools - External Logs
  app.get("/api/external-logs", requireAuth, async (req, res) => {
    try {
      const userId = getCurrentUserId(req);
      if (!userId) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const limit = parseInt(req.query.limit as string) || 100;
      const logs = await storage.getExternalLogs(userId, limit);
      
      res.json(logs);
    } catch (error) {
      console.error("Error fetching external logs:", error);
      res.status(500).json({ message: "Failed to fetch external logs" });
    }
  });

  // AI Templates Management
  app.get("/api/templates", requireAuth, async (req, res) => {
    try {
      const userId = getCurrentUserId(req);
      if (!userId) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const templates = await storage.getAiTemplates(userId);
      res.json(templates);
    } catch (error) {
      console.error("Error fetching templates:", error);
      res.status(500).json({ message: "Failed to fetch templates" });
    }
  });

  app.post("/api/templates", requireAuth, async (req, res) => {
    try {
      const userId = getCurrentUserId(req);
      if (!userId) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const templateData = { ...req.body, userId };
      const template = await storage.createAiTemplate(templateData);
      res.json(template);
    } catch (error) {
      console.error("Error creating template:", error);
      res.status(500).json({ message: "Failed to create template" });
    }
  });

  app.put("/api/templates/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const template = await storage.updateAiTemplate(id, req.body);
      
      if (!template) {
        return res.status(404).json({ message: "Template not found" });
      }
      
      res.json(template);
    } catch (error) {
      console.error("Error updating template:", error);
      res.status(500).json({ message: "Failed to update template" });
    }
  });

  app.delete("/api/templates/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteAiTemplate(id);
      
      if (!success) {
        return res.status(404).json({ message: "Template not found" });
      }
      
      res.json({ message: "Template deleted successfully" });
    } catch (error) {
      console.error("Error deleting template:", error);
      res.status(500).json({ message: "Failed to delete template" });
    }
  });

  // Test API logging with both services
  app.post("/api/test-logging", requireAuth, async (req, res) => {
    try {
      const userId = getCurrentUserId(req);
      if (!userId) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const results = [];

      // Test OpenAI API call
      try {
        await logApiCall({
          service: 'OpenAI',
          endpoint: '/chat/completions',
          method: 'POST',
          requestData: { 
            model: 'gpt-4o',
            messages: [{ role: 'user', content: 'Test API logging' }],
            max_tokens: 10
          },
          userId
        }, async () => {
          // Simulate OpenAI response for demo
          throw new Error('Please configure your OpenAI API key in your profile settings to test this service');
        });
      } catch (error) {
        results.push({ service: 'OpenAI', status: 'logged', note: 'API call logged (requires valid API key)' });
      }

      // Test Adzuna API call
      try {
        await logApiCall({
          service: 'Adzuna',
          endpoint: '/jobs/search',
          method: 'GET',
          requestData: { query: 'software developer', location: 'london' },
          userId
        }, async () => {
          // Simulate Adzuna response for demo
          throw new Error('Please configure your Adzuna credentials in your profile settings to test this service');
        });
      } catch (error) {
        results.push({ service: 'Adzuna', status: 'logged', note: 'API call logged (requires valid credentials)' });
      }

      res.json({ 
        message: 'API logging test completed', 
        results,
        note: 'Check the External API Logs page to see the logged calls'
      });
    } catch (error) {
      console.error("Error testing API logging:", error);
      res.status(500).json({ message: "Failed to test API logging" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
