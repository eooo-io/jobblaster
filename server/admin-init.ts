import { storage } from "./storage.js";
import { hashPassword } from "./auth.js";

/**
 * Initialize admin user from environment variables
 * This runs automatically on server startup to ensure an admin user exists
 */
export async function initializeAdminUser(): Promise<void> {
  const adminUsername = process.env.ADMIN_USERNAME;
  const adminPassword = process.env.ADMIN_PASSWORD;
  const adminEmail = process.env.ADMIN_EMAIL;

  // Skip if no admin credentials are configured
  if (!adminUsername || !adminPassword) {
    console.log("ℹ️  No admin credentials configured in environment variables");
    return;
  }

  try {
    // Check if admin user already exists
    const existingUser = await storage.getUserByUsername(adminUsername);
    
    if (existingUser) {
      console.log(`✅ Admin user '${adminUsername}' already exists`);
      return;
    }

    // Create admin user
    console.log(`🔧 Creating admin user '${adminUsername}'...`);
    
    const hashedPassword = await hashPassword(adminPassword);
    
    const adminUser = await storage.createUser({
      username: adminUsername,
      password: hashedPassword,
      email: adminEmail || `${adminUsername}@example.com`,
      profilePicture: null,
      openaiApiKey: null,
      adzunaAppId: null,
      adzunaApiKey: null,
      indeedApiKey: null,
      glassdoorApiKey: null,
      linkedinApiKey: null,
      isAdmin: true
    });

    console.log(`🎉 Admin user created successfully!`);
    console.log(`   Username: ${adminUser.username}`);
    console.log(`   Email: ${adminUser.email}`);
    console.log(`   ID: ${adminUser.id}`);
    
    // Create a default sample resume for the admin user
    try {
      const sampleResume = {
        basics: {
          name: adminUser.username,
          label: "System Administrator",
          email: adminUser.email,
          summary: "Default admin user for JobBlaster application management",
          location: {
            city: "Admin City",
            countryCode: "US"
          }
        },
        work: [
          {
            company: "JobBlaster",
            position: "Administrator",
            startDate: new Date().toISOString().split('T')[0],
            summary: "Managing JobBlaster application and user accounts"
          }
        ],
        skills: [
          {
            name: "Administration",
            keywords: ["User Management", "System Administration", "JobBlaster"]
          }
        ]
      };

      await storage.createResume({
        name: "Admin Sample Resume",
        userId: adminUser.id,
        jsonData: sampleResume,
        theme: "modern",
        isDefault: true,
        filename: "admin-sample.json"
      });

      console.log("📄 Created sample resume for admin user");
    } catch (resumeError) {
      console.warn("⚠️  Could not create sample resume for admin user:", resumeError);
    }

  } catch (error) {
    console.error("❌ Failed to create admin user:", error);
    throw error;
  }
}

/**
 * Check if any admin users exist in the system
 */
export async function hasAdminUsers(): Promise<boolean> {
  try {
    // This would need to be implemented in storage if we add admin role tracking
    // For now, we'll just check if any users exist
    const adminUsername = process.env.ADMIN_USERNAME;
    if (!adminUsername) return false;
    
    const user = await storage.getUserByUsername(adminUsername);
    return !!user;
  } catch (error) {
    console.error("Error checking for admin users:", error);
    return false;
  }
}

/**
 * Display admin setup information
 */
export function displayAdminInfo(): void {
  const adminUsername = process.env.ADMIN_USERNAME;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminUsername || !adminPassword) {
    console.log("💡 Tip: Set ADMIN_USERNAME and ADMIN_PASSWORD in your .env file to auto-create an admin user");
    return;
  }

  console.log("🔐 Admin credentials configured:");
  console.log(`   Username: ${adminUsername}`);
  console.log(`   Password: ${'*'.repeat(adminPassword.length)}`);
  console.log("   Use these credentials to log in at /login");
}