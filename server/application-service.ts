import { applications, type Application } from "@shared/schema";
import { eq } from "drizzle-orm";
import { db } from "./db";

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
      const result = await db.query(query);
      console.log("Applications query result:", result.rows);
      return result.rows;
    } catch (error) {
      console.error("Error fetching applications:", error);
      console.error("Error stack:", error);
      throw error;
    }
  }

  async create(application: Omit<Application, "id" | "createdAt" | "updatedAt">) {
    const [newApplication] = await db
      .insert(applications)
      .values({
        ...application,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    return newApplication;
  }

  async getById(id: number) {
    const [application] = await db.select().from(applications).where(eq(applications.id, id));

    return application;
  }

  async update(id: number, updates: Partial<Application>) {
    const [updatedApplication] = await db
      .update(applications)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(applications.id, id))
      .returning();

    return updatedApplication;
  }

  async delete(id: number) {
    const [deletedApplication] = await db
      .delete(applications)
      .where(eq(applications.id, id))
      .returning();

    return deletedApplication;
  }

  async getByUserId(userId: number) {
    const userApplications = await db
      .select()
      .from(applications)
      .where(eq(applications.userId, userId));

    return userApplications;
  }
}

export const applicationService = new ApplicationService();
