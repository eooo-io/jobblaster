# TargetLock - AI-Powered Resume & Job Matching Platform

## Overview

TargetLock is an intelligent resume and job matching platform that helps users optimize their resumes, analyze job descriptions, and generate tailored cover letters using AI. The application provides match scoring between resumes and job postings, automated analysis of job requirements, and personalized recommendations for improving job application success rates.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for lightweight client-side routing
- **Styling**: Tailwind CSS with shadcn/ui component library
- **State Management**: TanStack Query for server state management
- **Build Tool**: Vite for development and production builds
- **UI Components**: Radix UI primitives with custom styling

The frontend follows a component-based architecture with a dashboard-centric design. The main dashboard provides a unified interface for resume editing, job analysis, match scoring, and cover letter generation.

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **API Pattern**: RESTful API design
- **Development**: tsx for TypeScript execution in development
- **Production**: esbuild for optimized bundling

The backend implements a clean separation between routes, storage, and external service integrations.

### Database Architecture
- **ORM**: Drizzle ORM for type-safe database operations
- **Database**: PostgreSQL (configured via Neon serverless)
- **Migrations**: Drizzle Kit for schema management
- **Schema Location**: Shared schema definitions in `/shared/schema.ts`

## Key Components

### Data Models
1. **Users**: Basic user authentication and identification
2. **Resumes**: JSON-based resume storage with theme support
3. **Job Postings**: Structured job data with parsed requirements
4. **Match Scores**: AI-generated compatibility scores between resumes and jobs
5. **Cover Letters**: AI-generated personalized cover letters
6. **Applications**: Job application tracking (schema defined but implementation pending)

### Core Features
1. **Resume Builder**: JSON-based resume editor with multiple themes
2. **Job Analysis**: AI-powered parsing of job descriptions to extract requirements
3. **Match Scoring**: Compatibility analysis between resumes and job postings
4. **Cover Letter Generation**: Personalized cover letter creation based on resume and job data
5. **PDF Export**: Resume export functionality (basic implementation)

### AI Integration
- **Provider**: OpenAI GPT-4o for natural language processing
- **Functions**:
  - Job description analysis and requirement extraction
  - Resume-job compatibility scoring
  - Cover letter generation with customizable tone and focus

## Data Flow

1. **Resume Upload**: Users upload or create resumes in JSON Resume format
2. **Job Analysis**: Job descriptions are processed by AI to extract structured data
3. **Match Scoring**: AI compares resume content against job requirements
4. **Cover Letter Generation**: AI creates personalized cover letters based on match data
5. **Export**: Users can download resumes as PDFs or export complete application packages

## External Dependencies

### Production Dependencies
- **Database**: Neon PostgreSQL serverless database
- **AI Service**: OpenAI API for GPT-4o access
- **File Processing**: Multer for multipart form handling
- **Archive Creation**: JSZip for creating downloadable packages

### Development Dependencies
- **Build Tools**: Vite, esbuild, TypeScript compiler
- **Development Server**: Express with Vite middleware integration
- **Code Quality**: TypeScript strict mode, path aliases for clean imports

## Deployment Strategy

### Environment Configuration
- **Development**: Local development with Vite dev server and tsx
- **Production**: Static build with Express server for API
- **Database**: Environment-based connection via `DATABASE_URL`
- **AI Services**: Configurable OpenAI API key via environment variables

### Build Process
1. **Frontend**: Vite builds React application to `/dist/public`
2. **Backend**: esbuild bundles server code to `/dist/index.js`
3. **Assets**: Static files served from built frontend directory

### Hosting Platform
- **Target**: Replit with autoscale deployment
- **Port Configuration**: Internal port 5000, external port 80
- **Database**: PostgreSQL module integration
- **Modules**: Node.js 20, web server, PostgreSQL 16

### Authentication Strategy
Currently uses mock authentication with a hardcoded user ID. Production implementation would require:
- User registration and login system
- Session management with secure cookies
- Password hashing and validation
- JWT token-based authentication

The application is architected to easily integrate a complete authentication system by replacing the mock user ID with session-based user identification.