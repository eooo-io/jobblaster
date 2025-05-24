import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { ResumeService } from "../server/resume-service";
import { pool } from "../server/db";
import type { InsertResume } from "@shared/schema";

describe("ResumeService", () => {
  let resumeService: ResumeService;
  let testUserId: number;
  let createdResumeIds: number[] = [];

  beforeEach(async () => {
    resumeService = new ResumeService();
    testUserId = 999; // Use a test user ID
    createdResumeIds = [];
  });

  afterEach(async () => {
    // Clean up created test resumes
    if (createdResumeIds.length > 0) {
      await pool.query(
        `DELETE FROM resumes WHERE id = ANY($1)`,
        [createdResumeIds]
      );
    }
  });

  describe("create", () => {
    it("should create a new resume successfully", async () => {
      const resumeData: InsertResume = {
        name: "Test Resume",
        userId: testUserId,
        jsonData: { basics: { name: "John Doe" } },
        theme: "default",
        isDefault: false
      };

      const result = await resumeService.create(resumeData);
      createdResumeIds.push(result.id);

      expect(result).toBeDefined();
      expect(result.id).toBeTypeOf("number");
      expect(result.name).toBe("Test Resume");
      expect(result.userId).toBe(testUserId);
      expect(result.jsonData).toEqual({ basics: { name: "John Doe" } });
      expect(result.theme).toBe("default");
      expect(result.isDefault).toBe(false);
      expect(result.createdAt).toBeDefined();
    });

    it("should create a resume with default values", async () => {
      const resumeData: InsertResume = {
        name: "Simple Resume",
        userId: testUserId,
        jsonData: { basics: { name: "Jane Doe" } }
      };

      const result = await resumeService.create(resumeData);
      createdResumeIds.push(result.id);

      expect(result.theme).toBe("default");
      expect(result.isDefault).toBe(false);
    });
  });

  describe("getByUserId", () => {
    it("should return all resumes for a user", async () => {
      // Create test resumes
      const resume1 = await resumeService.create({
        name: "Resume 1",
        userId: testUserId,
        jsonData: { basics: { name: "User 1" } }
      });
      createdResumeIds.push(resume1.id);

      const resume2 = await resumeService.create({
        name: "Resume 2",
        userId: testUserId,
        jsonData: { basics: { name: "User 2" } }
      });
      createdResumeIds.push(resume2.id);

      const resumes = await resumeService.getByUserId(testUserId);
      const testResumes = resumes.filter(r => createdResumeIds.includes(r.id));

      expect(testResumes).toHaveLength(2);
      expect(testResumes.map(r => r.name)).toContain("Resume 1");
      expect(testResumes.map(r => r.name)).toContain("Resume 2");
    });

    it("should return empty array for user with no resumes", async () => {
      const resumes = await resumeService.getByUserId(9999);
      expect(resumes).toEqual([]);
    });
  });

  describe("getById", () => {
    it("should return a resume by ID", async () => {
      const created = await resumeService.create({
        name: "Test Resume",
        userId: testUserId,
        jsonData: { basics: { name: "Test User" } }
      });
      createdResumeIds.push(created.id);

      const resume = await resumeService.getById(created.id);

      expect(resume).toBeDefined();
      expect(resume!.id).toBe(created.id);
      expect(resume!.name).toBe("Test Resume");
    });

    it("should return null for non-existent resume", async () => {
      const resume = await resumeService.getById(99999);
      expect(resume).toBeNull();
    });
  });

  describe("update", () => {
    it("should update a resume successfully", async () => {
      const created = await resumeService.create({
        name: "Original Name",
        userId: testUserId,
        jsonData: { basics: { name: "Original" } }
      });
      createdResumeIds.push(created.id);

      const updated = await resumeService.update(created.id, testUserId, {
        name: "Updated Name",
        jsonData: { basics: { name: "Updated" } }
      });

      expect(updated).toBeDefined();
      expect(updated!.name).toBe("Updated Name");
      expect(updated!.jsonData).toEqual({ basics: { name: "Updated" } });
    });

    it("should return null when updating non-existent resume", async () => {
      const result = await resumeService.update(99999, testUserId, {
        name: "Updated"
      });

      expect(result).toBeNull();
    });

    it("should return null when user doesn't own the resume", async () => {
      const created = await resumeService.create({
        name: "Test Resume",
        userId: testUserId,
        jsonData: { basics: { name: "Test" } }
      });
      createdResumeIds.push(created.id);

      const result = await resumeService.update(created.id, 8888, {
        name: "Hacked"
      });

      expect(result).toBeNull();
    });
  });

  describe("delete", () => {
    it("should delete a resume successfully", async () => {
      const created = await resumeService.create({
        name: "To Delete",
        userId: testUserId,
        jsonData: { basics: { name: "Delete Me" } }
      });

      const deleted = await resumeService.delete(created.id, testUserId);
      expect(deleted).toBe(true);

      // Verify it's actually deleted
      const resume = await resumeService.getById(created.id);
      expect(resume).toBeNull();
    });

    it("should return false when deleting non-existent resume", async () => {
      const result = await resumeService.delete(99999, testUserId);
      expect(result).toBe(false);
    });

    it("should return false when user doesn't own the resume", async () => {
      const created = await resumeService.create({
        name: "Protected Resume",
        userId: testUserId,
        jsonData: { basics: { name: "Protected" } }
      });
      createdResumeIds.push(created.id);

      const result = await resumeService.delete(created.id, 8888);
      expect(result).toBe(false);

      // Verify it still exists
      const resume = await resumeService.getById(created.id);
      expect(resume).toBeDefined();
    });
  });

  describe("getDefault", () => {
    it("should return the default resume", async () => {
      const created = await resumeService.create({
        name: "Default Resume",
        userId: testUserId,
        jsonData: { basics: { name: "Default" } },
        isDefault: true
      });
      createdResumeIds.push(created.id);

      const defaultResume = await resumeService.getDefault(testUserId);

      expect(defaultResume).toBeDefined();
      expect(defaultResume!.id).toBe(created.id);
      expect(defaultResume!.isDefault).toBe(true);
    });

    it("should return null when no default resume exists", async () => {
      const defaultResume = await resumeService.getDefault(9999);
      expect(defaultResume).toBeNull();
    });
  });

  describe("setDefault", () => {
    it("should set a resume as default", async () => {
      const resume1 = await resumeService.create({
        name: "Resume 1",
        userId: testUserId,
        jsonData: { basics: { name: "User 1" } },
        isDefault: true
      });
      createdResumeIds.push(resume1.id);

      const resume2 = await resumeService.create({
        name: "Resume 2",
        userId: testUserId,
        jsonData: { basics: { name: "User 2" } }
      });
      createdResumeIds.push(resume2.id);

      const result = await resumeService.setDefault(resume2.id, testUserId);

      expect(result).toBeDefined();
      expect(result!.isDefault).toBe(true);

      // Verify the old default is no longer default
      const oldDefault = await resumeService.getById(resume1.id);
      expect(oldDefault!.isDefault).toBe(false);
    });

    it("should return null when setting non-existent resume as default", async () => {
      const result = await resumeService.setDefault(99999, testUserId);
      expect(result).toBeNull();
    });

    it("should return null when user doesn't own the resume", async () => {
      const created = await resumeService.create({
        name: "Protected Resume",
        userId: testUserId,
        jsonData: { basics: { name: "Protected" } }
      });
      createdResumeIds.push(created.id);

      const result = await resumeService.setDefault(created.id, 8888);
      expect(result).toBeNull();
    });
  });
});