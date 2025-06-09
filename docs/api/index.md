# API Documentation

JobBlaster provides a comprehensive REST API that allows you to integrate resume
building, job matching, and application tracking features into your
applications.

## API Overview

The API is organized around REST principles. It accepts JSON-encoded request
bodies, returns JSON-encoded responses, and uses standard HTTP response codes,
authentication, and verbs.

### Base URL

```
Development: http://localhost:3000/api/v1
Production: https://your-domain.com/api/v1
```

### Authentication

JobBlaster uses JWT (JSON Web Tokens) for API authentication. Include the token
in the Authorization header:

```bash
Authorization: Bearer your_jwt_token
```

To obtain a token:

1. Register a new user:

```bash
POST /auth/register
{
  "username": "user@example.com",
  "password": "secure_password"
}
```

2. Login to get token:

```bash
POST /auth/login
{
  "username": "user@example.com",
  "password": "secure_password"
}
```

### Response Format

All responses follow this format:

```json
{
  "success": true,
  "data": {
    // Response data
  },
  "message": "Optional message",
  "error": null
}
```

### Error Handling

Errors return appropriate HTTP status codes and details:

```json
{
  "success": false,
  "data": null,
  "message": "Error description",
  "error": {
    "code": "ERROR_CODE",
    "details": {}
  }
}
```

## API Endpoints

### Resume Management

- `GET /resumes` - List all resumes
- `POST /resumes` - Create new resume
- `GET /resumes/:id` - Get resume details
- `PUT /resumes/:id` - Update resume
- `DELETE /resumes/:id` - Delete resume
- `POST /resumes/:id/export` - Export resume to PDF/DOCX

### Cover Letters

- `GET /cover-letters` - List all cover letters
- `POST /cover-letters` - Create new cover letter
- `GET /cover-letters/:id` - Get cover letter details
- `PUT /cover-letters/:id` - Update cover letter
- `DELETE /cover-letters/:id` - Delete cover letter
- `POST /cover-letters/:id/generate` - Generate AI content

### Job Applications

- `GET /applications` - List all applications
- `POST /applications` - Create new application
- `GET /applications/:id` - Get application details
- `PUT /applications/:id` - Update application status
- `DELETE /applications/:id` - Delete application

### Job Matching

- `POST /jobs/match` - Match resume with jobs
- `GET /jobs/recommendations` - Get job recommendations
- `POST /jobs/analyze` - Analyze job posting
- `GET /jobs/search` - Search job listings

### AI Services

- `POST /ai/analyze-resume` - Analyze resume content
- `POST /ai/improve-content` - Get content improvements
- `POST /ai/match-score` - Calculate match score
- `POST /ai/generate-letter` - Generate cover letter

### User Management

- `GET /user/profile` - Get user profile
- `PUT /user/profile` - Update user profile
- `GET /user/settings` - Get user settings
- `PUT /user/settings` - Update user settings

## Rate Limiting

API requests are limited to:

- 100 requests per minute for authenticated users
- 20 requests per minute for unauthenticated users
- 50 AI-related requests per day per user

## Webhooks

JobBlaster can send webhooks for important events:

```bash
POST your_webhook_url
{
  "event": "application.status_changed",
  "data": {
    "application_id": "123",
    "new_status": "interview_scheduled"
  }
}
```

Available events:

- `resume.created`
- `resume.updated`
- `application.created`
- `application.status_changed`
- `job.matched`

## SDKs and Libraries

Official SDKs:

- [JavaScript/TypeScript](https://github.com/yourusername/jobblaster-js)
- [Python](https://github.com/yourusername/jobblaster-python)
- [Ruby](https://github.com/yourusername/jobblaster-ruby)

## API Versioning

The API is versioned through the URL path. Current version: `v1`

Breaking changes are released as new versions:

- `/api/v1/` - Current stable version
- `/api/v2/` - Next version (when available)

## Additional Resources

- [Authentication Guide](/api/authentication)
- [Resume Endpoints](/api/resume-endpoints)
- [Job Endpoints](/api/job-endpoints)
- [AI Endpoints](/api/ai-endpoints)
- [API Changelog](/api/changelog)
