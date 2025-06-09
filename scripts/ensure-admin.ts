import { eq } from "drizzle-orm";
import { hashPassword } from "../server/auth.js";
import { db } from "../server/db.js";
import { users } from "../shared/schema.js";

async function ensureAdminUser() {
  console.log("🔍 Checking for admin user...");

  try {
    // Check if admin user exists
    const [existingAdmin] = await db.select().from(users).where(eq(users.username, "admin"));

    if (existingAdmin) {
      console.log("✅ Admin user already exists");
      return;
    }

    // Create admin user if it doesn't exist
    console.log("🔑 Creating admin user...");
    const hashedPassword = await hashPassword("admin123");
    const [user] = await db
      .insert(users)
      .values({
        username: "admin",
        password: hashedPassword,
        email: "admin@jobblaster.dev",
        isAdmin: true,
      })
      .returning();

    console.log("✅ Created admin user");
    console.log("Username: admin");
    console.log("Password: admin123");
  } catch (error) {
    console.error("❌ Error managing admin user:", error);
    process.exit(1);
  }
}

ensureAdminUser();
