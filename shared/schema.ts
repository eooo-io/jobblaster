import { relations } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for authentication
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire", { mode: "date" }).notNull(),
  },
  (table) => ({
    expireIdx: index("IDX_session_expire").on(table.expire),
  })
);

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull(),
  password: text("password").notNull(),
  email: text("email"),
  dateOfBirth: text("date_of_birth"),
  profilePicture: text("profile_picture"),
  openaiApiKey: text("openai_api_key"),
  adzunaAppId: text("adzuna_app_id"),
  adzunaApiKey: text("adzuna_api_key"),
  indeedApiKey: text("indeed_api_key"),
  linkedinApiKey: text("linkedin_api_key"),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
});

// Resumes table
export const resumes = pgTable("resumes", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  theme: text("theme").notNull(),
  userId: integer("user_id").references(() => users.id),
  jsonData: jsonb("json_data"),
  isDefault: boolean("is_default"),
  filename: text("filename"),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
});

// Jobs table
export const jobPostings = pgTable("job_postings", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  company: text("company").notNull(),
  description: text("description").notNull(),
  location: text("location"),
  userId: integer("user_id").references(() => users.id),
  parsedData: jsonb("parsed_data"),
  techStack: text("tech_stack").array(),
  softSkills: text("soft_skills").array(),
  experienceYears: text("experience_years"),
  employmentType: text("employment_type"),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
});

// Applications table
export const applications = pgTable("applications", {
  id: serial("id").primaryKey(),
  status: text("status"),
  location: text("location"),
  company: text("company").notNull(),
  jobTitle: text("job_title").notNull(),
  userId: integer("user_id").references(() => users.id),
  resumeId: integer("resume_id").references(() => resumes.id),
  jobId: integer("job_id").references(() => jobPostings.id),
  coverLetterId: integer("cover_letter_id").references(() => coverLetters.id),
  notes: text("notes"),
  followUpDate: timestamp("follow_up_date", { mode: "date" }),
  salary: text("salary"),
  contactInfo: text("contact_info"),
  appliedAt: timestamp("applied_at", { mode: "date" }),
  updatedAt: timestamp("updated_at", { mode: "date" }),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
});

// Cover Letters table
export const coverLetters = pgTable("cover_letters", {
  id: serial("id").primaryKey(),
  content: text("content").notNull(),
  resumeId: integer("resume_id").references(() => resumes.id),
  jobId: integer("job_id").references(() => jobPostings.id),
  tone: text("tone").notNull(),
  focus: text("focus").notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
});

// Match Scores table
export const matchScores = pgTable("match_scores", {
  id: serial("id").primaryKey(),
  resumeId: integer("resume_id").references(() => resumes.id),
  jobId: integer("job_id").references(() => jobPostings.id),
  overallScore: integer("overall_score").notNull(),
  technicalScore: integer("technical_score").notNull(),
  experienceScore: integer("experience_score").notNull(),
  softSkillsScore: integer("soft_skills_score").notNull(),
  locationScore: integer("location_score").notNull(),
  recommendations: text("recommendations").array(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
});

// External API Logs table
export const externalLogs = pgTable("external_logs", {
  id: serial("id").primaryKey(),
  method: text("method").notNull(),
  userId: integer("user_id")
    .references(() => users.id)
    .notNull(),
  service: text("service").notNull(),
  endpoint: text("endpoint").notNull(),
  requestData: jsonb("request_data"),
  responseStatus: integer("response_status"),
  responseData: jsonb("response_data"),
  responseTime: integer("response_time"),
  success: boolean("success").notNull(),
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
});

// AI Templates table
export const aiTemplates = pgTable("ai_templates", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  prompt: text("prompt").notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
});

// Template Assignments table
export const templateAssignments = pgTable("template_assignments", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .references(() => users.id)
    .notNull(),
  templateId: integer("template_id")
    .references(() => aiTemplates.id)
    .notNull(),
  category: text("category").notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  resumes: many(resumes),
  jobPostings: many(jobPostings),
  applications: many(applications),
  externalLogs: many(externalLogs),
  templateAssignments: many(templateAssignments),
}));

export const resumesRelations = relations(resumes, ({ one, many }) => ({
  user: one(users, {
    fields: [resumes.userId],
    references: [users.id],
  }),
  matchScores: many(matchScores),
  coverLetters: many(coverLetters),
  applications: many(applications),
}));

export const jobPostingsRelations = relations(jobPostings, ({ one, many }) => ({
  user: one(users, {
    fields: [jobPostings.userId],
    references: [users.id],
  }),
  matchScores: many(matchScores),
  coverLetters: many(coverLetters),
  applications: many(applications),
}));

export const matchScoresRelations = relations(matchScores, ({ one }) => ({
  resume: one(resumes, {
    fields: [matchScores.resumeId],
    references: [resumes.id],
  }),
  job: one(jobPostings, {
    fields: [matchScores.jobId],
    references: [jobPostings.id],
  }),
}));

export const coverLettersRelations = relations(coverLetters, ({ one, many }) => ({
  resume: one(resumes, {
    fields: [coverLetters.resumeId],
    references: [resumes.id],
  }),
  job: one(jobPostings, {
    fields: [coverLetters.jobId],
    references: [jobPostings.id],
  }),
  applications: many(applications),
}));

export const applicationsRelations = relations(applications, ({ one }) => ({
  user: one(users, {
    fields: [applications.userId],
    references: [users.id],
  }),
  resume: one(resumes, {
    fields: [applications.resumeId],
    references: [resumes.id],
  }),
  job: one(jobPostings, {
    fields: [applications.jobId],
    references: [jobPostings.id],
  }),
  coverLetter: one(coverLetters, {
    fields: [applications.coverLetterId],
    references: [coverLetters.id],
  }),
}));

export const externalLogsRelations = relations(externalLogs, ({ one }) => ({
  user: one(users, {
    fields: [externalLogs.userId],
    references: [users.id],
  }),
}));

export const templateAssignmentsRelations = relations(templateAssignments, ({ one }) => ({
  user: one(users, {
    fields: [templateAssignments.userId],
    references: [users.id],
  }),
  template: one(aiTemplates, {
    fields: [templateAssignments.templateId],
    references: [aiTemplates.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users);
export const selectUserSchema = createSelectSchema(users);
export type User = z.infer<typeof selectUserSchema>;
export type InsertUser = z.infer<typeof insertUserSchema>;

export const insertResumeSchema = createInsertSchema(resumes);
export const selectResumeSchema = createSelectSchema(resumes);
export type Resume = z.infer<typeof selectResumeSchema>;
export type InsertResume = z.infer<typeof insertResumeSchema>;

export const insertJobPostingSchema = createInsertSchema(jobPostings);
export const selectJobPostingSchema = createSelectSchema(jobPostings);
export type JobPosting = z.infer<typeof selectJobPostingSchema>;
export type InsertJobPosting = z.infer<typeof insertJobPostingSchema>;

export const insertMatchScoreSchema = createInsertSchema(matchScores);
export const selectMatchScoreSchema = createSelectSchema(matchScores);
export type MatchScore = z.infer<typeof selectMatchScoreSchema>;
export type InsertMatchScore = z.infer<typeof insertMatchScoreSchema>;

export const insertCoverLetterSchema = createInsertSchema(coverLetters);
export const selectCoverLetterSchema = createSelectSchema(coverLetters);
export type CoverLetter = z.infer<typeof selectCoverLetterSchema>;
export type InsertCoverLetter = z.infer<typeof insertCoverLetterSchema>;

export const insertApplicationSchema = createInsertSchema(applications);
export const selectApplicationSchema = createSelectSchema(applications);
export type Application = z.infer<typeof selectApplicationSchema>;
export type InsertApplication = z.infer<typeof insertApplicationSchema>;

export const insertExternalLogSchema = createInsertSchema(externalLogs);
export const selectExternalLogSchema = createSelectSchema(externalLogs);
export type ExternalLog = z.infer<typeof selectExternalLogSchema>;
export type InsertExternalLog = z.infer<typeof insertExternalLogSchema>;

export const insertAiTemplateSchema = createInsertSchema(aiTemplates);
export const selectAiTemplateSchema = createSelectSchema(aiTemplates);
export type AiTemplate = z.infer<typeof selectAiTemplateSchema>;
export type InsertAiTemplate = z.infer<typeof insertAiTemplateSchema>;

export const insertTemplateAssignmentSchema = createInsertSchema(templateAssignments);
export const selectTemplateAssignmentSchema = createSelectSchema(templateAssignments);
export type TemplateAssignment = z.infer<typeof selectTemplateAssignmentSchema>;
export type InsertTemplateAssignment = z.infer<typeof insertTemplateAssignmentSchema>;
