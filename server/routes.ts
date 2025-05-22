import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertResumeSchema, insertJobPostingSchema, insertMatchScoreSchema, 
  insertCoverLetterSchema, insertApplicationSchema 
} from "@shared/schema";
import { analyzeJobDescription, calculateMatchScore, generateCoverLetter } from "./openai";
import multer from "multer";
import JSZip from "jszip";

const upload = multer({ storage: multer.memoryStorage() });

export async function registerRoutes(app: Express): Promise<Server> {
  // Mock user ID for demo (in real app would come from authentication)
  const mockUserId = 1;

  // Resumes
  app.get("/api/resumes", async (req, res) => {
    try {
      const resumes = await storage.getResumesByUserId(mockUserId);
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

  app.post("/api/resumes", async (req, res) => {
    try {
      const resumeData = insertResumeSchema.parse({
        ...req.body,
        userId: mockUserId
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
