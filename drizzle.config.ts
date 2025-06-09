import type { Config } from "drizzle-kit";

export default {
  schema: "./shared/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    host: "postgres",
    port: 5432,
    user: "jobblaster",
    password: "jobblaster_password",
    database: "jobblaster",
    ssl: false,
  },
  verbose: true,
  strict: true,
} satisfies Config;
