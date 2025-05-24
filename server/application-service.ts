import { db } from "./db";
import { applications, resumes, jobPostings, coverLetters } from "@shared/schema";
import { eq } from "drizzle-orm";
import type { Application, InsertApplication } from "@shared/schema";

export class ApplicationService {
  async getByUserId(userId: number) {
    try {
      const result = await db
        .select({
          id: applications.id,
          userId: applications.userId,
          resumeId: applications.resumeId,
          jobId: applications.jobId,
          coverLetterId: applications.coverLetterId,
          status: applications.status,
          notes: applications.notes,
          packageUrl: applications.packageUrl,
          appliedAt: applications.appliedAt,
          createdAt: applications.createdAt,
          // Resume details
          resumeName: resumes.name,
          resumeFilename: resumes.filename,
          // Job details
          jobTitle: jobPostings.title,
          jobCompany: jobPostings.company,
          jobLocation: jobPostings.location,
          jobEmploymentType: jobPostings.employmentType,
          // Cover letter details
          coverLetterContent: coverLetters.content
        })
        .from(applications)
        .leftJoin(resumes, eq(applications.resumeId, resumes.id))
        .leftJoin(jobPostings, eq(applications.jobId, jobPostings.id))
        .leftJoin(coverLetters, eq(applications.coverLetterId, coverLetters.id))
        .where(eq(applications.userId, userId));

      // Transform the flat result into nested objects for the frontend
      return result.map(row => ({
        id: row.id,
        userId: row.userId,
        resumeId: row.resumeId,
        jobId: row.jobId,
        coverLetterId: row.coverLetterId,
        status: row.status,
        notes: row.notes,
        packageUrl: row.packageUrl,
        appliedAt: row.appliedAt,
        createdAt: row.createdAt,
        jobPosting: {
          id: row.jobId,
          title: row.jobTitle || 'Unknown Position',
          company: row.jobCompany || 'Unknown Company',
          location: row.jobLocation || '',
          employmentType: row.jobEmploymentType || 'Full-time'
        },
        resume: {
          id: row.resumeId,
          name: row.resumeName || 'Resume',
          filename: row.resumeFilename || ''
        },
        coverLetter: row.coverLetterContent ? {
          id: row.coverLetterId,
          content: row.coverLetterContent.length > 100 
            ? row.coverLetterContent.substring(0, 100) + '...'
            : row.coverLetterContent
        } : null
      }));
    } catch (error) {
      console.error("Error fetching applications:", error);
      throw error;
    }
  }

  async create(applicationData: InsertApplication): Promise<Application> {
    try {
      const [application] = await db
        .insert(applications)
        .values(applicationData)
        .returning();
      return application;
    } catch (error) {
      console.error("Error creating application:", error);
      throw error;
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
      throw error;
    }
  }

  async update(id: number, updateData: Partial<InsertApplication>): Promise<Application | null> {
    try {
      const [application] = await db
        .update(applications)
        .set(updateData)
        .where(eq(applications.id, id))
        .returning();
      return application || null;
    } catch (error) {
      console.error("Error updating application:", error);
      throw error;
    }
  }

  async delete(id: number): Promise<boolean> {
    try {
      const result = await db
        .delete(applications)
        .where(eq(applications.id, id));
      return true;
    } catch (error) {
      console.error("Error deleting application:", error);
      throw error;
    }
  }
}

export const applicationService = new ApplicationService();