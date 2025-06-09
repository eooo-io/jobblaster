#!/bin/bash

# JobBlaster Database Management Scripts
# Provides convenient database operations for development

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

# Check if DATABASE_URL is set
check_database_url() {
    if [ -z "$DATABASE_URL" ]; then
        print_error "DATABASE_URL environment variable is not set"
        echo "Please set DATABASE_URL in your .env file or environment"
        exit 1
    fi
}

# Help function
show_help() {
    echo -e "${BLUE}JobBlaster Database Management${NC}"
    echo -e "${BLUE}=============================${NC}"
    echo ""
    echo "Available commands:"
    echo "  migrate           Push schema changes to database"
    echo "  reset             Reset database (drops all tables)"
    echo "  seed              Seed database with sample data"
    echo "  backup            Create database backup"
    echo "  restore           Restore database from backup"
    echo "  status            Show database connection status"
    echo "  psql              Open PostgreSQL command line"
    echo "  create-admin      Create an admin user"
    echo "  help              Show this help message"
    echo ""
    echo "Examples:"
    echo "  ./scripts/database.sh migrate"
    echo "  ./scripts/database.sh seed"
    echo "  ./scripts/database.sh create-admin"
}

# Migrate database
run_migrate() {
    print_info "Pushing schema changes to database..."
    check_database_url

    if npm run db:push; then
        print_status "Database migration completed successfully!"
    else
        print_error "Database migration failed"
        exit 1
    fi
}

# Reset database
run_reset() {
    print_warning "This will DROP ALL TABLES in your database!"
    read -p "Are you sure you want to continue? (yes/no): " confirm

    if [ "$confirm" = "yes" ]; then
        print_info "Resetting database..."
        check_database_url

        # Drop all tables
        npx drizzle-kit drop --force

        # Push schema again
        npm run db:push

        print_status "Database reset completed!"
    else
        print_info "Database reset cancelled"
    fi
}

# Seed database
run_seed() {
    print_info "Seeding database with sample data..."
    check_database_url

    # First ensure schema is up to date
    npm run db:push

    # Create seed script if it doesn't exist
    if [ ! -f "scripts/seed-data.ts" ]; then
        print_info "Creating seed data script..."
        cat > scripts/seed-data.ts << 'EOF'
import { db } from '../server/db.js';
import { users, resumes } from '../shared/schema.js';
import { hashPassword } from '../server/auth.js';

async function seedDatabase() {
  console.log('🌱 Seeding database...');

  try {
    // Create a demo user
    const hashedPassword = await hashPassword('demo123');
    const [user] = await db.insert(users).values({
      username: 'demo',
      password: hashedPassword,
      email: 'demo@example.com'
    }).returning();

    console.log('✅ Created demo user');

    // Create sample resume
    const sampleResume = {
      basics: {
        name: "John Doe",
        label: "Software Developer",
        email: "john.doe@example.com",
        phone: "(555) 123-4567",
        website: "https://johndoe.dev",
        summary: "Passionate software developer with 3+ years of experience building web applications.",
        location: {
          address: "123 Main St",
          postalCode: "12345",
          city: "San Francisco",
          countryCode: "US",
          region: "California"
        },
        profiles: [
          {
            network: "GitHub",
            username: "johndoe",
            url: "https://github.com/johndoe"
          },
          {
            network: "LinkedIn",
            username: "johndoe",
            url: "https://linkedin.com/in/johndoe"
          }
        ]
      },
      work: [
        {
          company: "Tech Corp",
          position: "Full Stack Developer",
          website: "https://techcorp.com",
          startDate: "2021-06-01",
          endDate: "2024-05-01",
          summary: "Developed and maintained web applications using React and Node.js",
          highlights: [
            "Built responsive web applications serving 10,000+ users",
            "Implemented CI/CD pipelines reducing deployment time by 50%",
            "Collaborated with cross-functional teams to deliver features"
          ]
        }
      ],
      education: [
        {
          institution: "University of Technology",
          area: "Computer Science",
          studyType: "Bachelor",
          startDate: "2017-09-01",
          endDate: "2021-05-01",
          gpa: "3.8",
          courses: [
            "Data Structures and Algorithms",
            "Web Development",
            "Database Systems"
          ]
        }
      ],
      skills: [
        {
          name: "Frontend",
          level: "Advanced",
          keywords: ["React", "TypeScript", "HTML", "CSS", "JavaScript"]
        },
        {
          name: "Backend",
          level: "Intermediate",
          keywords: ["Node.js", "Express", "PostgreSQL", "REST APIs"]
        },
        {
          name: "Tools",
          level: "Intermediate",
          keywords: ["Git", "Docker", "VS Code", "Linux"]
        }
      ],
      projects: [
        {
          name: "JobBlaster Clone",
          description: "A resume management and job application tracking system",
          highlights: [
            "Built with React and Node.js",
            "Integrated with OpenAI for resume analysis",
            "Deployed using Docker"
          ],
          keywords: ["React", "Node.js", "PostgreSQL", "OpenAI"],
          startDate: "2024-01-01",
          endDate: "2024-05-01",
          url: "https://github.com/johndoe/jobblaster",
          roles: ["Developer"],
          entity: "Personal Project",
          type: "application"
        }
      ]
    };

    await db.insert(resumes).values({
      name: 'John Doe - Software Developer',
      userId: user.id,
      jsonData: sampleResume,
      theme: 'modern',
      isDefault: true,
      filename: 'john-doe-resume.json'
    });

    console.log('✅ Created sample resume');
    console.log('🎉 Database seeding completed!');
    console.log('');
    console.log('Demo credentials:');
    console.log('Username: demo');
    console.log('Password: demo123');

  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

seedDatabase();
EOF
    fi

    # Run the seed script
    if npx tsx scripts/seed-data.ts; then
        print_status "Database seeding completed!"
    else
        print_error "Database seeding failed"
        exit 1
    fi
}

# Backup database
run_backup() {
    print_info "Creating database backup..."
    check_database_url

    # Create backups directory
    mkdir -p backups

    # Generate backup filename with timestamp
    BACKUP_FILE="backups/jobblaster_$(date +%Y%m%d_%H%M%S).sql"

    # Create backup
    if pg_dump "$DATABASE_URL" > "$BACKUP_FILE"; then
        print_status "Backup created: $BACKUP_FILE"
    else
        print_error "Backup failed"
        exit 1
    fi
}

# Restore database
run_restore() {
    print_info "Available backups:"
    ls -la backups/*.sql 2>/dev/null || {
        print_error "No backup files found in backups/ directory"
        exit 1
    }

    echo ""
    read -p "Enter backup filename (from backups/ directory): " backup_file

    if [ ! -f "backups/$backup_file" ]; then
        print_error "Backup file not found: backups/$backup_file"
        exit 1
    fi

    print_warning "This will REPLACE ALL DATA in your database!"
    read -p "Are you sure you want to continue? (yes/no): " confirm

    if [ "$confirm" = "yes" ]; then
        print_info "Restoring database from $backup_file..."
        check_database_url

        if psql "$DATABASE_URL" < "backups/$backup_file"; then
            print_status "Database restored successfully!"
        else
            print_error "Database restore failed"
            exit 1
        fi
    else
        print_info "Database restore cancelled"
    fi
}

# Check database status
run_status() {
    print_info "Checking database connection..."
    check_database_url

    if psql "$DATABASE_URL" -c "SELECT version();" > /dev/null 2>&1; then
        print_status "Database connection successful!"

        # Show basic info
        echo ""
        echo "Database Info:"
        psql "$DATABASE_URL" -c "SELECT version();" -t | head -1

        echo ""
        echo "Tables:"
        psql "$DATABASE_URL" -c "\dt" -t 2>/dev/null || echo "No tables found"
    else
        print_error "Cannot connect to database"
        echo "Please check your DATABASE_URL and ensure PostgreSQL is running"
        exit 1
    fi
}

# Open PostgreSQL command line
run_psql() {
    print_info "Opening PostgreSQL command line..."
    check_database_url

    echo "Type \q to quit"
    psql "$DATABASE_URL"
}

# Create admin user
run_create_admin() {
    print_info "Creating admin user..."
    check_database_url

    # First ensure schema is up to date
    npm run db:push

    # Run the create-admin script
    npx tsx scripts/create-admin.ts
}

# Main script
case "$1" in
    "migrate")
        run_migrate
        ;;
    "reset")
        run_reset
        ;;
    "seed")
        run_seed
        ;;
    "backup")
        run_backup
        ;;
    "restore")
        run_restore
        ;;
    "status")
        run_status
        ;;
    "psql")
        run_psql
        ;;
    "create-admin")
        run_create_admin
        ;;
    "help"|"")
        show_help
        ;;
    *)
        print_error "Unknown command: $1"
        show_help
        exit 1
        ;;
esac
