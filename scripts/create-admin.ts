import { hashPassword } from "../server/auth.js";
import { db } from "../server/db.js";
import { users } from "../shared/schema.js";

async function createAdminUser() {
  console.log("🔑 Creating admin user...");

  try {
    // Create admin user
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
    console.error("❌ Error creating admin user:", error);
  }
}

createAdminUser();
