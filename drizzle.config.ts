import type { Config } from "drizzle-kit";

export default {
  schema: "./shared/schema.ts",
  out: "./drizzle",
  driver: "pg",
  dbCredentials: {
    connectionString:
      process.env.DATABASE_URL ||
      "postgresql://jobblaster:jobblaster_password@localhost:5432/jobblaster",
  },
  verbose: true,
  strict: true,
} satisfies Config;
