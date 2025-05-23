import { pgTable, text, serial, integer, boolean, jsonb, timestamp, varchar, index, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for authentication
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email"),
  profilePicture: text("profile_picture"), // URL or base64 encoded image
  openaiApiKey: text("openai_api_key"), // User's personal OpenAI API key
  // Job Connector API Keys
  adzunaAppId: text("adzuna_app_id"), // Adzuna App ID
  adzunaApiKey: text("adzuna_api_key"), // Adzuna API Key
  // Future connector configurations
  indeedApiKey: text("indeed_api_key"),
  glassdoorApiKey: text("glassdoor_api_key"), 
  greenhouseApiKey: text("greenhouse_api_key"),
  ziprecruiterApiKey: text("ziprecruiter_api_key"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const resumes = pgTable("resumes", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  name: text("name").notNull(),
  jsonData: jsonb("json_data").notNull(),
  theme: text("theme").notNull().default("modern"),
  isDefault: boolean("is_default").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const jobPostings = pgTable("job_postings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  title: text("title").notNull(),
  company: text("company").notNull(),
  description: text("description").notNull(),
  parsedData: jsonb("parsed_data"),
  techStack: text("tech_stack").array(),
  softSkills: text("soft_skills").array(),
  experienceYears: text("experience_years"),
  location: text("location"),
  employmentType: text("employment_type"),
  createdAt: timestamp("created_at").defaultNow(),
});

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
  createdAt: timestamp("created_at").defaultNow(),
});

export const coverLetters = pgTable("cover_letters", {
  id: serial("id").primaryKey(),
  resumeId: integer("resume_id").references(() => resumes.id),
  jobId: integer("job_id").references(() => jobPostings.id),
  content: text("content").notNull(),
  tone: text("tone").notNull(),
  focus: text("focus").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const applications = pgTable("applications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  resumeId: integer("resume_id").references(() => resumes.id),
  jobId: integer("job_id").references(() => jobPostings.id),
  coverLetterId: integer("cover_letter_id").references(() => coverLetters.id),
  status: text("status").notNull().default("draft"),
  notes: text("notes"),
  appliedAt: timestamp("applied_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const externalLogs = pgTable("external_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  service: varchar("service", { length: 50 }).notNull(), // openai, adzuna, etc.
  endpoint: varchar("endpoint", { length: 255 }).notNull(),
  method: varchar("method", { length: 10 }).notNull(), // GET, POST, etc.
  requestData: jsonb("request_data"), // Request payload
  responseStatus: integer("response_status"), // HTTP status code
  responseData: jsonb("response_data"), // Response data
  responseTime: integer("response_time"), // Response time in milliseconds
  success: boolean("success").notNull(),
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const aiTemplates = pgTable("ai_templates", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  name: varchar("name", { length: 100 }).notNull(),
  description: varchar("description", { length: 500 }),
  provider: varchar("provider", { length: 50 }).notNull(), // openai, anthropic, xai, etc.
  category: varchar("category", { length: 50 }).notNull(), // job_analysis, resume_analysis, etc.
  systemPrompt: text("system_prompt").notNull(),
  extractionInstruction: text("extraction_instruction").notNull(),
  outputFormat: jsonb("output_format").notNull(),
  temperature: integer("temperature").notNull().default(20), // stored as integer * 100 for precision
  maxTokens: integer("max_tokens").notNull().default(1024),
  model: varchar("model", { length: 50 }), // gpt-4o, claude-3-5-sonnet, grok-1, etc.
  isDefault: boolean("is_default").default(false),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertResumeSchema = createInsertSchema(resumes).omit({
  id: true,
  createdAt: true,
});

export const insertJobPostingSchema = createInsertSchema(jobPostings).omit({
  id: true,
  createdAt: true,
});

export const insertMatchScoreSchema = createInsertSchema(matchScores).omit({
  id: true,
  createdAt: true,
});

export const insertCoverLetterSchema = createInsertSchema(coverLetters).omit({
  id: true,
  createdAt: true,
});

export const insertApplicationSchema = createInsertSchema(applications).omit({
  id: true,
  createdAt: true,
});

export const insertExternalLogSchema = createInsertSchema(externalLogs).omit({
  id: true,
  createdAt: true,
});

export const insertAiTemplateSchema = createInsertSchema(aiTemplates).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertResume = z.infer<typeof insertResumeSchema>;
export type Resume = typeof resumes.$inferSelect;

export type InsertJobPosting = z.infer<typeof insertJobPostingSchema>;
export type JobPosting = typeof jobPostings.$inferSelect;

export type InsertMatchScore = z.infer<typeof insertMatchScoreSchema>;
export type MatchScore = typeof matchScores.$inferSelect;

export type InsertCoverLetter = z.infer<typeof insertCoverLetterSchema>;
export type CoverLetter = typeof coverLetters.$inferSelect;

export type InsertApplication = z.infer<typeof insertApplicationSchema>;
export type Application = typeof applications.$inferSelect;

export type InsertExternalLog = z.infer<typeof insertExternalLogSchema>;
export type ExternalLog = typeof externalLogs.$inferSelect;

export type InsertAiTemplate = z.infer<typeof insertAiTemplateSchema>;
export type AiTemplate = typeof aiTemplates.$inferSelect;
