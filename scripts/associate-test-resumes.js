import fs from "fs";
import path from "path";
import pg from "pg";
import { fileURLToPath } from "url";

const { Pool } = pg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Database configuration matching Docker environment
const pool = new Pool({
  user: "jobblaster",
  host: "postgres", // Use the Docker service name
  database: "jobblaster",
  password: "jobblaster_password", // Match Docker environment
  port: 5432,
});

async function main() {
  const client = await pool.connect();

  try {
    // Start transaction
    await client.query("BEGIN");

    // Check if admin user exists, create if not
    const adminResult = await client.query(`
      SELECT id FROM users WHERE username = 'admin' AND is_admin = true
    `);

    let adminId;
    if (adminResult.rows.length === 0) {
      const insertResult = await client.query(`
        INSERT INTO users (username, password, email, is_admin)
        VALUES ('admin', '$2b$10$default_hashed_password', 'admin@jobblaster.local', true)
        RETURNING id
      `);
      adminId = insertResult.rows[0].id;
      console.log("Created new admin user with ID:", adminId);
    } else {
      adminId = adminResult.rows[0].id;
      console.log("Using existing admin user with ID:", adminId);
    }

    // Get list of test resume files
    const resumeDir = path.join(__dirname, "..", "test", "resumes");
    const resumeFiles = fs.readdirSync(resumeDir).filter((file) => file.endsWith(".json"));

    // Associate each resume with the admin user
    for (const file of resumeFiles) {
      const filePath = path.join(resumeDir, file);
      const jsonData = JSON.parse(fs.readFileSync(filePath, "utf8"));
      const name = file
        .replace(".json", "")
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");

      // Check if resume already exists
      const existingResult = await client.query(
        `
        SELECT id FROM resumes
        WHERE user_id = $1 AND filename = $2
      `,
        [adminId, file]
      );

      if (existingResult.rows.length === 0) {
        await client.query(
          `
          INSERT INTO resumes (user_id, name, json_data, filename)
          VALUES ($1, $2, $3, $4)
        `,
          [adminId, name, jsonData, file]
        );
        console.log(`Associated resume: ${file}`);
      } else {
        console.log(`Resume already associated: ${file}`);
      }
    }

    // Commit transaction
    await client.query("COMMIT");
    console.log("Successfully associated all test resumes with admin user");
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Error:", err);
    process.exit(1);
  } finally {
    client.release();
    pool.end();
  }
}

main();
