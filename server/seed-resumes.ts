import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { storage } from "./storage.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Seed test resumes for the admin user
 */
export async function seedTestResumes(adminUserId: number): Promise<void> {
  try {
    // Check if test resumes are already seeded
    const existingResumes = await storage.getResumesByUserId(adminUserId);
    if (existingResumes.length > 1) {
      // More than just the default admin resume
      console.log("✅ Test resumes already seeded");
      return;
    }

    console.log("🌱 Seeding test resumes...");

    // Read all test resume files
    const resumeDir = path.join(__dirname, "..", "test", "resumes");
    const resumeFiles = fs.readdirSync(resumeDir).filter((file) => file.endsWith(".json"));

    // Create each resume
    for (const file of resumeFiles) {
      const filePath = path.join(resumeDir, file);
      const jsonData = JSON.parse(fs.readFileSync(filePath, "utf8"));
      const name = file
        .replace(".json", "")
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");

      await storage.createResume({
        name,
        userId: adminUserId,
        jsonData,
        theme: "modern",
        isDefault: false,
        filename: file,
      });

      console.log(`📄 Created test resume: ${name}`);
    }

    console.log("✨ Successfully seeded all test resumes!");
  } catch (error) {
    console.error("❌ Failed to seed test resumes:", error);
    throw error;
  }
}
