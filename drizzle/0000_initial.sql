-- Initial schema for JobBlaster

-- Create sessions table for authentication
CREATE TABLE IF NOT EXISTS "sessions" (
  "sid" varchar PRIMARY KEY,
  "sess" jsonb NOT NULL,
  "expire" timestamp NOT NULL
);
CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON "sessions" ("expire");

-- Create users table
CREATE TABLE IF NOT EXISTS "users" (
  "id" serial PRIMARY KEY,
  "username" text NOT NULL UNIQUE,
  "password" text NOT NULL,
  "email" text,
  "profile_picture" text,
  "openai_api_key" text,
  "adzuna_app_id" text,
  "adzuna_api_key" text,
  "indeed_api_key" text,
  "glassdoor_api_key" text,
  "linkedin_api_key" text,
  "is_admin" boolean DEFAULT false,
  "created_at" timestamp DEFAULT now()
);

-- Create resumes table
CREATE TABLE IF NOT EXISTS "resumes" (
  "id" serial PRIMARY KEY,
  "user_id" integer REFERENCES "users" ("id"),
  "name" text NOT NULL,
  "json_data" jsonb NOT NULL,
  "theme" text NOT NULL DEFAULT 'modern',
  "is_default" boolean DEFAULT false,
  "filename" text,
  "created_at" timestamp DEFAULT now()
);

-- Create job_postings table
CREATE TABLE IF NOT EXISTS "job_postings" (
  "id" serial PRIMARY KEY,
  "user_id" integer REFERENCES "users" ("id"),
  "title" text NOT NULL,
  "company" text NOT NULL,
  "description" text NOT NULL,
  "parsed_data" jsonb,
  "tech_stack" text[],
  "soft_skills" text[],
  "experience_years" text,
  "location" text,
  "employment_type" text,
  "created_at" timestamp DEFAULT now()
);

-- Create match_scores table
CREATE TABLE IF NOT EXISTS "match_scores" (
  "id" serial PRIMARY KEY,
  "resume_id" integer REFERENCES "resumes" ("id"),
  "job_id" integer REFERENCES "job_postings" ("id"),
  "overall_score" integer NOT NULL,
  "technical_score" integer NOT NULL,
  "experience_score" integer NOT NULL,
  "soft_skills_score" integer NOT NULL,
  "location_score" integer NOT NULL,
  "recommendations" text[],
  "created_at" timestamp DEFAULT now()
);

-- Create cover_letters table
CREATE TABLE IF NOT EXISTS "cover_letters" (
  "id" serial PRIMARY KEY,
  "resume_id" integer REFERENCES "resumes" ("id"),
  "job_id" integer REFERENCES "job_postings" ("id"),
  "content" text NOT NULL,
  "tone" text NOT NULL,
  "focus" text NOT NULL,
  "created_at" timestamp DEFAULT now()
);

-- Create applications table
CREATE TABLE IF NOT EXISTS "applications" (
  "id" serial PRIMARY KEY,
  "job_title" varchar(255) NOT NULL,
  "short_description" text,
  "full_text" text,
  "company" varchar(255) NOT NULL,
  "listing_url" varchar(500),
  "applied_on" varchar(10),
  "created_at" timestamp DEFAULT now(),
  "updated_at" timestamp DEFAULT now()
);

-- Create application_notes table
CREATE TABLE IF NOT EXISTS "application_notes" (
  "id" serial PRIMARY KEY,
  "application_id" integer NOT NULL REFERENCES "applications" ("id"),
  "content" text NOT NULL,
  "note_type" varchar(50) DEFAULT 'general',
  "created_at" timestamp DEFAULT now(),
  "updated_at" timestamp DEFAULT now()
);

-- Create external_logs table
CREATE TABLE IF NOT EXISTS "external_logs" (
  "id" serial PRIMARY KEY,
  "user_id" integer NOT NULL REFERENCES "users" ("id"),
  "service" varchar(50) NOT NULL,
  "endpoint" varchar(255) NOT NULL,
  "method" varchar(10) NOT NULL,
  "request_data" jsonb,
  "response_status" integer,
  "response_data" jsonb,
  "response_time" integer,
  "success" boolean NOT NULL,
  "error_message" text,
  "created_at" timestamp DEFAULT now()
);

-- Create ai_templates table
CREATE TABLE IF NOT EXISTS "ai_templates" (
  "id" serial PRIMARY KEY,
  "user_id" integer NOT NULL REFERENCES "users" ("id"),
  "name" varchar(100) NOT NULL,
  "description" varchar(500),
  "provider" varchar(50) NOT NULL,
  "category" varchar(50) NOT NULL,
  "system_prompt" text NOT NULL,
  "extraction_instruction" text NOT NULL,
  "output_format" jsonb NOT NULL,
  "temperature" integer NOT NULL DEFAULT 20,
  "max_tokens" integer NOT NULL DEFAULT 1024,
  "model" varchar(50),
  "is_default" boolean DEFAULT false,
  "is_active" boolean DEFAULT true,
  "created_at" timestamp DEFAULT now(),
  "updated_at" timestamp DEFAULT now()
);

-- Create template_assignments table
CREATE TABLE IF NOT EXISTS "template_assignments" (
  "id" serial PRIMARY KEY,
  "user_id" integer NOT NULL REFERENCES "users" ("id"),
  "category" varchar(50) NOT NULL,
  "template_id" integer REFERENCES "ai_templates" ("id"),
  "created_at" timestamp DEFAULT now(),
  "updated_at" timestamp DEFAULT now()
);
