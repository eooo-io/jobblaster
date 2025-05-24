import type { Express, Request, Response } from "express";
import { ResumeService } from "./resume-service";
import { requireAuth, getCurrentUserId } from "./auth";
import { insertResumeSchema } from "@shared/schema";
import { z } from "zod";

const resumeService = new ResumeService();

export function setupResumeRoutes(app: Express) {
  // GET /api/resumes - Get all resumes for the current user
  app.get("/api/resumes", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = getCurrentUserId(req);
      if (!userId) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const resumes = await resumeService.getByUserId(userId);
      res.json(resumes);
    } catch (error) {
      console.error("Error fetching resumes:", error);
      res.status(500).json({ message: "Failed to fetch resumes" });
    }
  });

  // GET /api/resumes/:id - Get a specific resume
  app.get("/api/resumes/:id", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = getCurrentUserId(req);
      if (!userId) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const resumeId = parseInt(req.params.id);
      if (isNaN(resumeId)) {
        return res.status(400).json({ message: "Invalid resume ID" });
      }

      const resume = await resumeService.getById(resumeId);
      if (!resume) {
        return res.status(404).json({ message: "Resume not found" });
      }

      // Check if user owns this resume
      if (resume.userId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }

      res.json(resume);
    } catch (error) {
      console.error("Error fetching resume:", error);
      res.status(500).json({ message: "Failed to fetch resume" });
    }
  });

  // POST /api/resumes - Create a new resume
  app.post("/api/resumes", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = getCurrentUserId(req);
      if (!userId) {
        return res.status(401).json({ message: "Authentication required" });
      }

      // Validate request body
      const validationResult = insertResumeSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ 
          message: "Invalid resume data", 
          errors: validationResult.error.errors 
        });
      }

      const resumeData = { ...validationResult.data, userId };
      const newResume = await resumeService.create(resumeData);
      
      res.status(201).json(newResume);
    } catch (error) {
      console.error("Error creating resume:", error);
      res.status(500).json({ message: "Failed to create resume" });
    }
  });

  // PUT /api/resumes/:id - Update a resume
  app.put("/api/resumes/:id", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = getCurrentUserId(req);
      if (!userId) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const resumeId = parseInt(req.params.id);
      if (isNaN(resumeId)) {
        return res.status(400).json({ message: "Invalid resume ID" });
      }

      // Validate request body (partial update)
      const updateSchema = insertResumeSchema.partial();
      const validationResult = updateSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ 
          message: "Invalid resume data", 
          errors: validationResult.error.errors 
        });
      }

      const updatedResume = await resumeService.update(resumeId, userId, validationResult.data);
      if (!updatedResume) {
        return res.status(404).json({ message: "Resume not found or access denied" });
      }

      res.json(updatedResume);
    } catch (error) {
      console.error("Error updating resume:", error);
      res.status(500).json({ message: "Failed to update resume" });
    }
  });

  // PATCH /api/resumes/:id - Update a resume (partial update)
  app.patch("/api/resumes/:id", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = getCurrentUserId(req);
      if (!userId) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const resumeId = parseInt(req.params.id);
      if (isNaN(resumeId)) {
        return res.status(400).json({ message: "Invalid resume ID" });
      }

      // Validate request body (partial update)
      const updateSchema = insertResumeSchema.partial();
      const validationResult = updateSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ 
          message: "Invalid resume data", 
          errors: validationResult.error.errors 
        });
      }

      const updatedResume = await resumeService.update(resumeId, userId, validationResult.data);
      if (!updatedResume) {
        return res.status(404).json({ message: "Resume not found or access denied" });
      }

      res.json(updatedResume);
    } catch (error) {
      console.error("Error updating resume:", error);
      res.status(500).json({ message: "Failed to update resume" });
    }
  });

  // DELETE /api/resumes/:id - Delete a resume
  app.delete("/api/resumes/:id", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = getCurrentUserId(req);
      if (!userId) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const resumeId = parseInt(req.params.id);
      if (isNaN(resumeId)) {
        return res.status(400).json({ message: "Invalid resume ID" });
      }

      const deleted = await resumeService.delete(resumeId, userId);
      if (!deleted) {
        return res.status(404).json({ message: "Resume not found or access denied" });
      }

      res.json({ message: "Resume deleted successfully" });
    } catch (error) {
      console.error("Error deleting resume:", error);
      res.status(500).json({ message: "Failed to delete resume" });
    }
  });

  // GET /api/resumes/default - Get the default resume for the current user
  app.get("/api/resumes/default", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = getCurrentUserId(req);
      if (!userId) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const defaultResume = await resumeService.getDefault(userId);
      if (!defaultResume) {
        return res.status(404).json({ message: "No default resume found" });
      }

      res.json(defaultResume);
    } catch (error) {
      console.error("Error fetching default resume:", error);
      res.status(500).json({ message: "Failed to fetch default resume" });
    }
  });

  // PUT /api/resumes/:id/default - Set a resume as default
  app.put("/api/resumes/:id/default", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = getCurrentUserId(req);
      if (!userId) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const resumeId = parseInt(req.params.id);
      if (isNaN(resumeId)) {
        return res.status(400).json({ message: "Invalid resume ID" });
      }

      const defaultResume = await resumeService.setDefault(resumeId, userId);
      if (!defaultResume) {
        return res.status(404).json({ message: "Resume not found or access denied" });
      }

      res.json(defaultResume);
    } catch (error) {
      console.error("Error setting default resume:", error);
      res.status(500).json({ message: "Failed to set default resume" });
    }
  });
}