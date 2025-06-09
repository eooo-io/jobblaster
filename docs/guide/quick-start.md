# Quick Start Guide

This guide will help you get JobBlaster up and running quickly. Choose between
local installation or Docker setup.

## Option 1: Local Installation

### Prerequisites

- Node.js 18.0 or higher
- PostgreSQL 14.0 or higher
- Git

### Step 1: Clone the Repository

```bash
git clone https://github.com/yourusername/JobBlaster.git
cd JobBlaster
```

### Step 2: Install Dependencies

```bash
# Install dependencies for both client and server
npm install
```

### Step 3: Configure Environment

1. Copy the example environment files:

```bash
cp .env.example .env
```

2. Update the `.env` file with your settings:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/jobblaster
OPENAI_API_KEY=your_openai_api_key
```

### Step 4: Initialize Database

```bash
# Run database migrations
npm run db:migrate
```

### Step 5: Start Development Server

```bash
# Start both client and server in development mode
npm run dev
```

The application will be available at:

- Frontend: http://localhost:5173
- Backend API: http://localhost:3000

## Option 2: Docker Setup

### Prerequisites

- Docker
- Docker Compose

### Step 1: Clone the Repository

```bash
git clone https://github.com/yourusername/JobBlaster.git
cd JobBlaster
```

### Step 2: Configure Environment

1. Copy the example environment files:

```bash
cp .env.example .env
```

2. Update the `.env` file with your settings (Docker configuration is pre-set)

### Step 3: Start with Docker Compose

```bash
# Build and start all services
docker-compose up -d
```

The application will be available at:

- Frontend: http://localhost:5173
- Backend API: http://localhost:3000

## Next Steps

1. Create your first resume:

   - Navigate to the dashboard
   - Click "Create New Resume"
   - Choose a template
   - Fill in your information
   - Export to PDF

2. Set up job matching:

   - Configure your job preferences
   - Connect job board integrations
   - Start receiving matches

3. Explore more features:
   - [Creating Resumes](/user-guide/creating-resumes)
   - [Managing Applications](/user-guide/managing-applications)
   - [Job Search](/user-guide/job-search)

## Troubleshooting

### Common Issues

1. **Database Connection Error**

   - Check if PostgreSQL is running
   - Verify database credentials in `.env`
   - Ensure database exists

2. **API Key Issues**

   - Verify OpenAI API key is valid
   - Check API key permissions

3. **Port Conflicts**
   - Check if ports 5173 or 3000 are in use
   - Update port numbers in configuration if needed

For more detailed information, check the
[Installation Guide](/guide/installation) or
[Docker Setup](/guide/docker-setup).
