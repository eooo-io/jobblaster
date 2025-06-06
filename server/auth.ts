import bcrypt from "bcryptjs";
import connectPg from "connect-pg-simple";
import type { Express, NextFunction, Request, Response } from "express";
import session from "express-session";
import { pool } from "./db";

declare module "express-session" {
  interface SessionData {
    userId?: number;
    username?: string;
  }
}

export function setupAuth(app: Express) {
  // Session configuration
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    pool: pool, // Use the pool directly
    createTableIfMissing: true,
    ttl: sessionTtl,
    tableName: "sessions",
    pruneSessionInterval: 60, // Cleanup old sessions every minute
  });

  app.use(
    session({
      store: sessionStore,
      secret: process.env.SESSION_SECRET || "your-secret-key-change-in-production",
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        secure: false, // Allow non-HTTPS in development
        sameSite: "lax",
        maxAge: sessionTtl,
        domain: "localhost", // Allow sharing between ports
      },
      name: "jobblaster.sid", // Custom cookie name
    })
  );
}

export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12;
  return bcrypt.hash(password, saltRounds);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.session.userId) {
    return res.status(401).json({ message: "Authentication required" });
  }
  next();
}

export function getCurrentUserId(req: Request): number | null {
  return req.session.userId || null;
}
