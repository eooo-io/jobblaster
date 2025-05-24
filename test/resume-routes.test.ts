import { describe, it, expect, beforeEach, afterEach } from "vitest";
import request from "supertest";
import express from "express";
import { setupResumeRoutes } from "../server/resume-routes";
import { setupAuth } from "../server/auth";
import { pool } from "../server/db";

describe("Resume API Routes", () => {
  let app: express.Express;
  let testUserId: number;
  let authCookie: string;
  let createdResumeIds: number[] = [];

  beforeEach(async () => {
    app = express();
    app.use(express.json());
    
    // Setup auth and routes
    setupAuth(app);
    setupResumeRoutes(app);
    
    testUserId = 999;
    createdResumeIds = [];
    
    // Create a test session (simulate login)
    authCookie = "test-session";
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

  describe("GET /api/resumes", () => {
    it("should return 401 without authentication", async () => {
      const response = await request(app)
        .get("/api/resumes");
      
      expect(response.status).toBe(401);
    });

    it("should return empty array for user with no resumes", async () => {
      // Mock authenticated user
      app.use((req, res, next) => {
        (req as any).session = { userId: 9999 };
        next();
      });

      const response = await request(app)
        .get("/api/resumes");
      
      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });
  });

  describe("POST /api/resumes", () => {
    beforeEach(() => {
      // Mock authenticated user
      app.use((req, res, next) => {
        (req as any).session = { userId: testUserId };
        next();
      });
    });

    it("should create a new resume", async () => {
      const resumeData = {
        name: "Test Resume",
        jsonData: { basics: { name: "John Doe" } },
        theme: "default"
      };

      const response = await request(app)
        .post("/api/resumes")
        .send(resumeData);
      
      expect(response.status).toBe(201);
      expect(response.body.name).toBe("Test Resume");
      expect(response.body.userId).toBe(testUserId);
      expect(response.body.id).toBeTypeOf("number");
      
      createdResumeIds.push(response.body.id);
    });

    it("should return 400 for invalid data", async () => {
      const invalidData = {
        // Missing required fields
        invalidField: "test"
      };

      const response = await request(app)
        .post("/api/resumes")
        .send(invalidData);
      
      expect(response.status).toBe(400);
      expect(response.body.message).toContain("Invalid resume data");
    });
  });

  describe("GET /api/resumes/:id", () => {
    let testResumeId: number;

    beforeEach(async () => {
      // Mock authenticated user
      app.use((req, res, next) => {
        (req as any).session = { userId: testUserId };
        next();
      });

      // Create a test resume
      const result = await pool.query(
        `INSERT INTO resumes (name, user_id, json_data, theme, is_default)
         VALUES ($1, $2, $3, $4, $5) RETURNING id`,
        ["Test Resume", testUserId, JSON.stringify({ basics: { name: "Test" } }), "default", false]
      );
      testResumeId = result.rows[0].id;
      createdResumeIds.push(testResumeId);
    });

    it("should return a resume by ID", async () => {
      const response = await request(app)
        .get(`/api/resumes/${testResumeId}`);
      
      expect(response.status).toBe(200);
      expect(response.body.id).toBe(testResumeId);
      expect(response.body.name).toBe("Test Resume");
    });

    it("should return 404 for non-existent resume", async () => {
      const response = await request(app)
        .get("/api/resumes/99999");
      
      expect(response.status).toBe(404);
    });

    it("should return 400 for invalid ID", async () => {
      const response = await request(app)
        .get("/api/resumes/invalid");
      
      expect(response.status).toBe(400);
    });
  });

  describe("PUT /api/resumes/:id", () => {
    let testResumeId: number;

    beforeEach(async () => {
      // Mock authenticated user
      app.use((req, res, next) => {
        (req as any).session = { userId: testUserId };
        next();
      });

      // Create a test resume
      const result = await pool.query(
        `INSERT INTO resumes (name, user_id, json_data, theme, is_default)
         VALUES ($1, $2, $3, $4, $5) RETURNING id`,
        ["Original Name", testUserId, JSON.stringify({ basics: { name: "Original" } }), "default", false]
      );
      testResumeId = result.rows[0].id;
      createdResumeIds.push(testResumeId);
    });

    it("should update a resume", async () => {
      const updateData = {
        name: "Updated Name",
        jsonData: { basics: { name: "Updated" } }
      };

      const response = await request(app)
        .put(`/api/resumes/${testResumeId}`)
        .send(updateData);
      
      expect(response.status).toBe(200);
      expect(response.body.name).toBe("Updated Name");
      expect(response.body.jsonData).toEqual({ basics: { name: "Updated" } });
    });

    it("should return 404 for non-existent resume", async () => {
      const response = await request(app)
        .put("/api/resumes/99999")
        .send({ name: "Updated" });
      
      expect(response.status).toBe(404);
    });
  });

  describe("DELETE /api/resumes/:id", () => {
    let testResumeId: number;

    beforeEach(async () => {
      // Mock authenticated user
      app.use((req, res, next) => {
        (req as any).session = { userId: testUserId };
        next();
      });

      // Create a test resume
      const result = await pool.query(
        `INSERT INTO resumes (name, user_id, json_data, theme, is_default)
         VALUES ($1, $2, $3, $4, $5) RETURNING id`,
        ["To Delete", testUserId, JSON.stringify({ basics: { name: "Delete Me" } }), "default", false]
      );
      testResumeId = result.rows[0].id;
      // Don't add to createdResumeIds since we're testing deletion
    });

    it("should delete a resume", async () => {
      const response = await request(app)
        .delete(`/api/resumes/${testResumeId}`);
      
      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Resume deleted successfully");

      // Verify it's actually deleted
      const checkResult = await pool.query(
        `SELECT id FROM resumes WHERE id = $1`,
        [testResumeId]
      );
      expect(checkResult.rows).toHaveLength(0);
    });

    it("should return 404 for non-existent resume", async () => {
      const response = await request(app)
        .delete("/api/resumes/99999");
      
      expect(response.status).toBe(404);
    });
  });

  describe("PUT /api/resumes/:id/default", () => {
    let testResumeId: number;

    beforeEach(async () => {
      // Mock authenticated user
      app.use((req, res, next) => {
        (req as any).session = { userId: testUserId };
        next();
      });

      // Create a test resume
      const result = await pool.query(
        `INSERT INTO resumes (name, user_id, json_data, theme, is_default)
         VALUES ($1, $2, $3, $4, $5) RETURNING id`,
        ["Test Resume", testUserId, JSON.stringify({ basics: { name: "Test" } }), "default", false]
      );
      testResumeId = result.rows[0].id;
      createdResumeIds.push(testResumeId);
    });

    it("should set a resume as default", async () => {
      const response = await request(app)
        .put(`/api/resumes/${testResumeId}/default`);
      
      expect(response.status).toBe(200);
      expect(response.body.isDefault).toBe(true);
    });

    it("should return 404 for non-existent resume", async () => {
      const response = await request(app)
        .put("/api/resumes/99999/default");
      
      expect(response.status).toBe(404);
    });
  });
});