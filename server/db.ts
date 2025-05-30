import pg from 'pg';
import { drizzle as pgDrizzle } from 'drizzle-orm/node-postgres';

const { Pool: PgPool } = pg;
import { Pool as NeonPool, neonConfig } from '@neondatabase/serverless';
import { drizzle as neonDrizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Detect if we're using Neon (cloud) or local PostgreSQL
const isNeonDatabase = process.env.DATABASE_URL.includes('neon.tech') || 
                      process.env.DATABASE_URL.includes('neon.db') ||
                      process.env.DATABASE_URL.includes('pooler.supabase.com');

let pool: any;
let db: any;

if (isNeonDatabase) {
  // Use Neon serverless driver for cloud databases
  neonConfig.webSocketConstructor = ws;
  pool = new NeonPool({ connectionString: process.env.DATABASE_URL });
  db = neonDrizzle({ client: pool, schema });
} else {
  // Use standard PostgreSQL driver for local/Docker databases
  pool = new PgPool({ connectionString: process.env.DATABASE_URL });
  db = pgDrizzle({ client: pool, schema });
}

export { pool, db };
