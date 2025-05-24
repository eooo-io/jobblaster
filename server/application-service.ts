import { db } from "./db";
import { applications } from "../shared/schema";
import type { InsertApplication, Application } from "../shared/schema";
import { eq } from "drizzle-orm";

export class ApplicationService {
  async getAll(): Promise<Application[]> {
    try {
      const result = await db.select().from(applications);
      return result;
    } catch (error) {
      console.error("Error fetching applications:", error);
      throw new Error("Failed to fetch applications");
    }
  }

  async create(applicationData: InsertApplication): Promise<Application> {
    try {
      const [newApplication] = await db
        .insert(applications)
        .values(applicationData)
        .returning();
      return newApplication;
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
      return result.rowCount > 0;
    } catch (error) {
      console.error("Error deleting application:", error);
      throw new Error("Failed to delete application");
    }
  }
}

export const applicationService = new ApplicationService();