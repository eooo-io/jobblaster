import { describe, it, expect, beforeEach } from "vitest";
import { ApplicationService } from "../server/application-service";
import type { InsertApplication } from "../shared/schema";

describe("ApplicationService", () => {
  let applicationService: ApplicationService;
  const mockUserId = 1;
  const mockResumeId = 20;
  const mockJobId = 1;
  const mockCoverLetterId = 1;

  beforeEach(() => {
    applicationService = new ApplicationService();
  });

  describe("create", () => {
    it("should create a new application", async () => {
      const applicationData: InsertApplication = {
        userId: mockUserId,
        resumeId: mockResumeId,
        jobId: mockJobId,
        coverLetterId: mockCoverLetterId,
        status: "applied",
        notes: "Applied through company website",
        packageUrl: null,
        appliedAt: new Date()
      };

      const result = await applicationService.create(applicationData);

      expect(result).toBeDefined();
      expect(result.userId).toBe(mockUserId);
      expect(result.status).toBe("applied");
      expect(result.notes).toBe("Applied through company website");
    });
  });

  describe("getByUserId", () => {
    it("should retrieve applications for a specific user", async () => {
      // First create an application
      const applicationData: InsertApplication = {
        userId: mockUserId,
        resumeId: mockResumeId,
        jobId: mockJobId,
        coverLetterId: mockCoverLetterId,
        status: "applied",
        notes: "Test application",
        packageUrl: null,
        appliedAt: new Date()
      };

      await applicationService.create(applicationData);

      const applications = await applicationService.getByUserId(mockUserId);

      expect(applications).toBeDefined();
      expect(applications.length).toBeGreaterThan(0);
      expect(applications[0].userId).toBe(mockUserId);
    });

    it("should return empty array for user with no applications", async () => {
      const applications = await applicationService.getByUserId(999);
      expect(applications).toEqual([]);
    });
  });

  describe("getById", () => {
    it("should retrieve a specific application by id", async () => {
      const applicationData: InsertApplication = {
        userId: mockUserId,
        resumeId: mockResumeId,
        jobId: mockJobId,
        coverLetterId: mockCoverLetterId,
        status: "applied",
        notes: "Test application for getById",
        packageUrl: null,
        appliedAt: new Date()
      };

      const created = await applicationService.create(applicationData);
      const retrieved = await applicationService.getById(created.id);

      expect(retrieved).toBeDefined();
      expect(retrieved?.id).toBe(created.id);
      expect(retrieved?.notes).toBe("Test application for getById");
    });

    it("should return null for non-existent application", async () => {
      const result = await applicationService.getById(999);
      expect(result).toBeNull();
    });
  });

  describe("update", () => {
    it("should update an existing application", async () => {
      const applicationData: InsertApplication = {
        userId: mockUserId,
        resumeId: mockResumeId,
        jobId: mockJobId,
        coverLetterId: mockCoverLetterId,
        status: "applied",
        notes: "Original notes",
        packageUrl: null,
        appliedAt: new Date()
      };

      const created = await applicationService.create(applicationData);
      
      const updateData = {
        status: "interviewed" as const,
        notes: "Updated notes after interview"
      };

      const updated = await applicationService.update(created.id, updateData);

      expect(updated).toBeDefined();
      expect(updated?.status).toBe("interviewed");
      expect(updated?.notes).toBe("Updated notes after interview");
    });

    it("should return null when updating non-existent application", async () => {
      const result = await applicationService.update(999, { status: "rejected" });
      expect(result).toBeNull();
    });
  });

  describe("delete", () => {
    it("should delete an existing application", async () => {
      const applicationData: InsertApplication = {
        userId: mockUserId,
        resumeId: mockResumeId,
        jobId: mockJobId,
        coverLetterId: mockCoverLetterId,
        status: "applied",
        notes: "Application to be deleted",
        packageUrl: null,
        appliedAt: new Date()
      };

      const created = await applicationService.create(applicationData);
      const deleted = await applicationService.delete(created.id);

      expect(deleted).toBe(true);

      // Verify it's actually deleted
      const retrieved = await applicationService.getById(created.id);
      expect(retrieved).toBeNull();
    });

    it("should return false when deleting non-existent application", async () => {
      const result = await applicationService.delete(999);
      expect(result).toBe(false);
    });
  });

  describe("getWithDetails", () => {
    it("should retrieve applications with job posting and resume details", async () => {
      const applicationData: InsertApplication = {
        userId: mockUserId,
        resumeId: mockResumeId,
        jobId: mockJobId,
        coverLetterId: mockCoverLetterId,
        status: "applied",
        notes: "Application with details",
        packageUrl: null,
        appliedAt: new Date()
      };

      await applicationService.create(applicationData);
      const applications = await applicationService.getWithDetails(mockUserId);

      expect(applications).toBeDefined();
      expect(applications.length).toBeGreaterThan(0);
      
      const app = applications[0];
      expect(app.jobPosting).toBeDefined();
      expect(app.resume).toBeDefined();
      expect(app.jobPosting?.title).toBeDefined();
      expect(app.resume?.name).toBeDefined();
    });
  });
});