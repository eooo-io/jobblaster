import { pool } from "./db";
import type { InsertApplication, Application } from "../shared/schema";

export class ApplicationService {
  async getAll(): Promise<Application[]> {
    try {
      console.log("Attempting to fetch applications...");
      const query = `
        SELECT 
          id,
          job_title as "jobTitle",
          short_description as "shortDescription", 
          full_text as "fullText",
          company,
          listing_url as "listingUrl",
          applied_on as "appliedOn",
          created_at as "createdAt",
          updated_at as "updatedAt"
        FROM applications 
        ORDER BY created_at DESC
      `;
      const result = await pool.query(query);
      console.log("Applications query result:", result.rows);
      return result.rows;
    } catch (error) {
      console.error("Error fetching applications:", error);
      console.error("Error stack:", error);
      throw error;
    }
  }

  async create(applicationData: InsertApplication): Promise<Application> {
    try {
      const query = `
        INSERT INTO applications (job_title, company, short_description, full_text, listing_url, applied_on, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
        RETURNING 
          id,
          job_title as "jobTitle",
          short_description as "shortDescription", 
          full_text as "fullText",
          company,
          listing_url as "listingUrl",
          applied_on as "appliedOn",
          created_at as "createdAt",
          updated_at as "updatedAt"
      `;
      const values = [
        applicationData.jobTitle,
        applicationData.company,
        applicationData.shortDescription || null,
        applicationData.fullText || null,
        applicationData.listingUrl || null,
        applicationData.appliedOn || null
      ];
      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      console.error("Error creating application:", error);
      throw new Error("Failed to create application");
    }
  }

  async getById(id: number): Promise<Application | null> {
    try {
      const [application] = await db
        .select()
        .from(applications)
        .where(eq(applications.id, id));
      return application || null;
    } catch (error) {
      console.error("Error fetching application by ID:", error);
      throw new Error("Failed to fetch application");
    }
  }

  async update(id: number, updateData: Partial<InsertApplication>): Promise<Application | null> {
    try {
      const [updatedApplication] = await db
        .update(applications)
        .set({ ...updateData, updatedAt: new Date() })
        .where(eq(applications.id, id))
        .returning();
      return updatedApplication || null;
    } catch (error) {
      console.error("Error updating application:", error);
      throw new Error("Failed to update application");
    }
  }

  async delete(id: number): Promise<boolean> {
    try {
      const result = await db
        .delete(applications)
        .where(eq(applications.id, id));
      return result.rowCount !== undefined && result.rowCount > 0;
    } catch (error) {
      console.error("Error deleting application:", error);
      throw new Error("Failed to delete application");
    }
  }
}

export const applicationService = new ApplicationService();