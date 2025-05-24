#!/bin/bash

# JobBlaster Documentation Generator
# Automated documentation generation and maintenance

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print status
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Help function
show_help() {
    echo -e "${BLUE}JobBlaster Documentation Tools${NC}"
    echo -e "${BLUE}=============================${NC}"
    echo ""
    echo "Available commands:"
    echo "  api               Generate API documentation"
    echo "  readme            Update README.md with current info"
    echo "  setup             Generate setup documentation"
    echo "  deploy            Generate deployment guide"
    echo "  all               Generate all documentation"
    echo "  serve             Serve documentation locally"
    echo "  help              Show this help message"
    echo ""
    echo "Examples:"
    echo "  ./scripts/docs.sh api"
    echo "  ./scripts/docs.sh all"
}

# Generate API documentation
generate_api_docs() {
    print_info "Generating API documentation..."
    
    mkdir -p docs/api
    
    cat > docs/api/README.md << 'EOF'
# JobBlaster API Documentation

## Overview

The JobBlaster API provides endpoints for managing resumes, job postings, and AI-powered job matching.

## Base URL

```
http://localhost:3000/api
```

## Authentication

All API endpoints require authentication using session-based cookies.

### Login
```http
POST /auth/login
Content-Type: application/json

{
  "username": "your-username",
  "password": "your-password"
}
```

### Logout
```http
POST /auth/logout
```

## Endpoints

### Resumes

#### Get All Resumes
```http
GET /resumes
```

#### Get Resume by ID
```http
GET /resumes/:id
```

#### Create Resume
```http
POST /resumes
Content-Type: application/json

{
  "name": "Resume Name",
  "jsonData": { /* JSON Resume data */ },
  "theme": "modern",
  "filename": "resume.json"
}
```

#### Update Resume
```http
PUT /resumes/:id
Content-Type: application/json

{
  "name": "Updated Name",
  "jsonData": { /* Updated JSON Resume data */ }
}
```

#### Delete Resume
```http
DELETE /resumes/:id
```

#### Set Default Resume
```http
PUT /resumes/:id/default
```

### Job Search

#### Search Jobs
```http
GET /jobs/search?query=developer&location=san%20francisco
```

### AI Features

#### Analyze Job Description
```http
POST /ai/analyze-job
Content-Type: application/json

{
  "description": "Job description text"
}
```

#### Calculate Match Score
```http
POST /ai/match-score
Content-Type: application/json

{
  "resumeId": 1,
  "jobId": 2
}
```

#### Generate Cover Letter
```http
POST /ai/cover-letter
Content-Type: application/json

{
  "resumeId": 1,
  "jobId": 2,
  "tone": "professional",
  "focus": "technical"
}
```

## Error Responses

All endpoints return standard HTTP status codes:

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `404` - Not Found
- `500` - Internal Server Error

Error response format:
```json
{
  "message": "Error description",
  "code": "ERROR_CODE"
}
```
EOF

    print_status "API documentation generated!"
}

# Update README.md
update_readme() {
    print_info "Updating README.md..."
    
    # Get current package.json info
    local name=$(node -p "require('./package.json').name")
    local version=$(node -p "require('./package.json').version")
    local description="AI-powered job application platform"
    
    cat > README.md << EOF
# JobBlaster

${description}

![Version](https://img.shields.io/badge/version-${version}-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)

## 🚀 Features

- **Smart Resume Management** - Create, edit, and organize multiple JSON resumes
- **AI-Powered Job Matching** - Get intelligent match scores for job postings
- **Automated Cover Letters** - Generate personalized cover letters using AI
- **Job Search Integration** - Search jobs from multiple sources
- **Professional Themes** - Multiple resume themes for different industries
- **Export Options** - Generate PDFs and other formats
- **Application Tracking** - Track your job applications and their status

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, Vite
- **Backend**: Node.js, Express, TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **AI**: OpenAI GPT integration
- **Job APIs**: Adzuna, Indeed, Glassdoor
- **Authentication**: Session-based with bcrypt
- **Testing**: Vitest, Testing Library
- **Code Quality**: ESLint, Prettier, Husky
- **Deployment**: Docker, Replit

## 📋 Prerequisites

- Node.js 18+ and npm
- PostgreSQL database
- OpenAI API key (for AI features)
- Job API keys (optional, for job search)

## 🚀 Quick Start

1. **Clone and install dependencies**
   \`\`\`bash
   git clone <repository-url>
   cd jobblaster
   npm install
   \`\`\`

2. **Set up environment**
   \`\`\`bash
   cp .env.example .env
   # Edit .env with your database URL and API keys
   \`\`\`

3. **Set up database**
   \`\`\`bash
   ./scripts/database.sh migrate
   ./scripts/database.sh seed
   \`\`\`

4. **Start development server**
   \`\`\`bash
   npm run dev
   \`\`\`

5. **Open your browser**
   \`\`\`
   http://localhost:3000
   \`\`\`

## 📚 Documentation

- [API Documentation](docs/api/README.md)
- [Setup Guide](docs/setup/README.md)
- [Deployment Guide](docs/deployment/README.md)
- [Development Guide](docs/development/README.md)

## 🧪 Testing

\`\`\`bash
# Run all tests
./scripts/testing.sh all

# Run with coverage
./scripts/testing.sh coverage

# Run in watch mode
./scripts/testing.sh watch
\`\`\`

## 🔧 Development Tools

\`\`\`bash
# Code quality checks
./scripts/code-quality.sh check:all

# Fix formatting and lint issues
./scripts/code-quality.sh fix:all

# Database management
./scripts/database.sh help

# Testing utilities
./scripts/testing.sh help
\`\`\`

## 🐳 Docker

\`\`\`bash
# Development
docker-compose -f docker-compose.yml up

# Production
docker build -f Dockerfile -t jobblaster .
docker run -p 3000:3000 jobblaster
\`\`\`

## 📝 Environment Variables

See \`.env.example\` for all available configuration options.

Key variables:
- \`DATABASE_URL\` - PostgreSQL connection string
- \`OPENAI_API_KEY\` - OpenAI API key for AI features
- \`ADZUNA_APP_ID\` & \`ADZUNA_API_KEY\` - Job search API
- \`SESSION_SECRET\` - Session encryption key

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and quality checks
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

- Check the [documentation](docs/)
- Review [common issues](docs/troubleshooting.md)
- Create an issue for bugs or feature requests

## 🙏 Acknowledgments

- [JSON Resume](https://jsonresume.org/) for the resume schema
- [OpenAI](https://openai.com/) for AI capabilities
- [Adzuna](https://www.adzuna.com/) for job search API
- The open-source community for amazing tools and libraries
EOF

    print_status "README.md updated!"
}

# Generate setup documentation
generate_setup_docs() {
    print_info "Generating setup documentation..."
    
    mkdir -p docs/setup
    
    cat > docs/setup/README.md << 'EOF'
# JobBlaster Setup Guide

## System Requirements

- **Node.js**: 18.0.0 or higher
- **npm**: 8.0.0 or higher
- **PostgreSQL**: 12.0 or higher
- **Git**: For version control

## Development Setup

### 1. Clone Repository

```bash
git clone <repository-url>
cd jobblaster
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
DATABASE_URL=postgresql://username:password@localhost:5432/jobblaster
OPENAI_API_KEY=sk-your-openai-api-key
ADZUNA_APP_ID=your-adzuna-app-id
ADZUNA_API_KEY=your-adzuna-api-key
NODE_ENV=development
SESSION_SECRET=your-secure-session-secret
```

### 4. Database Setup

```bash
# Create and migrate database
./scripts/database.sh migrate

# Seed with sample data
./scripts/database.sh seed
```

### 5. Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## API Keys Setup

### OpenAI API Key

1. Visit [OpenAI Platform](https://platform.openai.com/)
2. Create an account or sign in
3. Navigate to API keys section
4. Create a new API key
5. Add to your `.env` file

### Adzuna API Keys

1. Visit [Adzuna Developer Portal](https://developer.adzuna.com/)
2. Create an account
3. Create a new application
4. Copy your App ID and API Key
5. Add to your `.env` file

### Additional Job APIs (Optional)

- **Indeed**: Register at [Indeed Publisher Portal](https://ads.indeed.com/jobroll/xmlfeed)
- **Glassdoor**: Register at [Glassdoor Developer](https://www.glassdoor.com/developer/)

## IDE Setup

### VS Code (Recommended)

The project includes VS Code configuration:

1. Install recommended extensions when prompted
2. Settings are automatically applied
3. Debugging configurations are pre-configured

### Other IDEs

Ensure your IDE supports:
- TypeScript
- ESLint
- Prettier
- EditorConfig

## Git Hooks

Pre-commit hooks are automatically installed:

```bash
# Manual setup if needed
npx husky install
```

## Troubleshooting

### Database Connection Issues

```bash
# Check database status
./scripts/database.sh status

# Reset database if needed
./scripts/database.sh reset
```

### Port Already in Use

```bash
# Find process using port 3000
lsof -i :3000

# Kill process
kill -9 <process-id>
```

### Node Modules Issues

```bash
# Clean install
rm -rf node_modules package-lock.json
npm install
```

### Environment Variables

```bash
# Verify environment variables are loaded
node -e "console.log(process.env.DATABASE_URL)"
```

## Next Steps

- Read the [API Documentation](../api/README.md)
- Explore the [Development Guide](../development/README.md)
- Check out [Deployment Options](../deployment/README.md)
EOF

    print_status "Setup documentation generated!"
}

# Generate deployment documentation
generate_deployment_docs() {
    print_info "Generating deployment documentation..."
    
    mkdir -p docs/deployment
    
    cat > docs/deployment/README.md << 'EOF'
# JobBlaster Deployment Guide

## Deployment Options

### 1. Replit Deployment (Recommended)

JobBlaster is optimized for Replit deployment:

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Deploy on Replit**
   - Click the "Deploy" button in Replit
   - Configure environment variables in Replit Secrets
   - Your app will be available at `your-app.replit.app`

3. **Environment Variables in Replit**
   Add these secrets in Replit:
   - `DATABASE_URL`
   - `OPENAI_API_KEY`
   - `ADZUNA_APP_ID`
   - `ADZUNA_API_KEY`
   - `SESSION_SECRET`

### 2. Docker Deployment

#### Development
```bash
docker-compose up
```

#### Production
```bash
# Build image
docker build -f Dockerfile -t jobblaster .

# Run container
docker run -d \
  --name jobblaster \
  -p 3000:3000 \
  -e DATABASE_URL="your-database-url" \
  -e OPENAI_API_KEY="your-openai-key" \
  jobblaster
```

#### Multi-platform Build
```bash
# Build for multiple architectures
docker buildx build \
  --platform linux/amd64,linux/arm64 \
  -t jobblaster:latest \
  --push .
```

### 3. Traditional VPS Deployment

#### Prerequisites
- Ubuntu 20.04+ or similar
- Node.js 18+
- PostgreSQL 12+
- Nginx (recommended)

#### Setup Process

1. **Install Dependencies**
   ```bash
   # Update system
   sudo apt update && sudo apt upgrade -y
   
   # Install Node.js
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   
   # Install PostgreSQL
   sudo apt install postgresql postgresql-contrib
   ```

2. **Clone and Setup**
   ```bash
   git clone <repository-url>
   cd jobblaster
   npm ci --production
   npm run build
   ```

3. **Configure Database**
   ```bash
   sudo -u postgres createdb jobblaster
   sudo -u postgres createuser jobblaster_user
   # Set password and permissions
   ```

4. **Environment Configuration**
   ```bash
   cp .env.example .env
   # Edit with production values
   ```

5. **Start with PM2**
   ```bash
   npm install -g pm2
   pm2 start dist/index.js --name jobblaster
   pm2 startup
   pm2 save
   ```

6. **Nginx Configuration**
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
       
       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

### 4. Cloud Platform Deployment

#### Heroku
```bash
# Install Heroku CLI
npm install -g heroku

# Create app
heroku create your-app-name

# Add PostgreSQL addon
heroku addons:create heroku-postgresql:hobby-dev

# Set environment variables
heroku config:set OPENAI_API_KEY=your-key

# Deploy
git push heroku main
```

#### Railway
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway init
railway up
```

#### DigitalOcean App Platform
1. Connect GitHub repository
2. Configure build and run commands
3. Set environment variables
4. Deploy

## Production Checklist

### Security
- [ ] Set strong `SESSION_SECRET`
- [ ] Use HTTPS in production
- [ ] Configure CORS properly
- [ ] Set up rate limiting
- [ ] Enable security headers

### Performance
- [ ] Enable gzip compression
- [ ] Set up CDN for static assets
- [ ] Configure database connection pooling
- [ ] Set up monitoring and logging

### Database
- [ ] Regular backups scheduled
- [ ] Connection pooling configured
- [ ] Performance monitoring
- [ ] Index optimization

### Monitoring
- [ ] Application monitoring (e.g., New Relic)
- [ ] Error tracking (e.g., Sentry)
- [ ] Log aggregation
- [ ] Uptime monitoring

## Environment Variables

Production-specific variables:

```env
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://...
OPENAI_API_KEY=sk-...
SESSION_SECRET=<32-character-random-string>
CORS_ORIGIN=https://yourdomain.com
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## Troubleshooting

### Common Issues

1. **Database Connection Timeout**
   - Check firewall settings
   - Verify connection string
   - Ensure database is accessible

2. **Memory Issues**
   - Increase container/server memory
   - Check for memory leaks
   - Optimize queries

3. **API Rate Limits**
   - Implement proper caching
   - Add rate limiting
   - Monitor API usage

### Health Checks

```bash
# Check application health
curl http://your-domain.com/api/health

# Check database connection
./scripts/database.sh status
```

## Scaling

### Horizontal Scaling
- Use load balancer
- Session store (Redis)
- Database read replicas

### Vertical Scaling
- Increase server resources
- Optimize database queries
- Enable caching layers
EOF

    print_status "Deployment documentation generated!"
}

# Generate all documentation
generate_all_docs() {
    print_info "Generating complete documentation suite..."
    
    generate_api_docs
    update_readme
    generate_setup_docs
    generate_deployment_docs
    
    # Create main docs index
    mkdir -p docs
    cat > docs/README.md << 'EOF'
# JobBlaster Documentation

Welcome to the JobBlaster documentation. Choose a section below:

## 📖 Documentation Sections

- **[API Documentation](api/README.md)** - Complete API reference
- **[Setup Guide](setup/README.md)** - Getting started with development
- **[Deployment Guide](deployment/README.md)** - Production deployment options
- **[Development Guide](development/README.md)** - Contributing and development workflow

## 🚀 Quick Links

- [Quick Start](#quick-start)
- [Environment Setup](setup/README.md#environment-configuration)
- [API Reference](api/README.md)
- [Deployment Options](deployment/README.md)

## Quick Start

1. **Prerequisites**: Node.js 18+, PostgreSQL, Git
2. **Install**: `npm install`
3. **Configure**: Copy `.env.example` to `.env` and fill in values
4. **Database**: `./scripts/database.sh migrate && ./scripts/database.sh seed`
5. **Start**: `npm run dev`
6. **Open**: http://localhost:3000

## 🆘 Need Help?

- Check the [setup troubleshooting](setup/README.md#troubleshooting)
- Review [common deployment issues](deployment/README.md#troubleshooting)
- Create an issue for bugs or questions

## 📝 Contributing

See our development guide for contribution guidelines and coding standards.
EOF

    print_status "Complete documentation suite generated!"
}

# Serve documentation locally
serve_docs() {
    print_info "Starting documentation server..."
    
    if command -v python3 >/dev/null 2>&1; then
        print_info "Serving documentation at http://localhost:8080"
        print_info "Press Ctrl+C to stop"
        cd docs && python3 -m http.server 8080
    elif command -v python >/dev/null 2>&1; then
        print_info "Serving documentation at http://localhost:8080"
        print_info "Press Ctrl+C to stop"
        cd docs && python -m SimpleHTTPServer 8080
    else
        print_error "Python not found. Cannot serve documentation."
        print_info "Please install Python or serve docs manually."
        exit 1
    fi
}

# Main command handler
case "${1:-help}" in
    "api")
        generate_api_docs
        ;;
    "readme")
        update_readme
        ;;
    "setup")
        generate_setup_docs
        ;;
    "deploy")
        generate_deployment_docs
        ;;
    "all")
        generate_all_docs
        ;;
    "serve")
        serve_docs
        ;;
    "help"|*)
        show_help
        ;;
esac