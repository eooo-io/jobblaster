import { db } from "./db";
import { logs, type InsertLog } from "@shared/schema";

interface LogOptions {
  userId?: number;
  level: "error" | "warn" | "info" | "debug";
  message: string;
  component?: string;
  error?: Error;
  metadata?: any;
}

export class Logger {
  // Log to database
  private static async logToDatabase(options: LogOptions): Promise<void> {
    try {
      const logEntry: InsertLog = {
        userId: options.userId || null,
        level: options.level,
        message: options.message,
        component: options.component || null,
        errorStack: options.error?.stack || null,
        metadata: options.metadata || null,
      };

      await db.insert(logs).values(logEntry);
    } catch (dbError) {
      // If database logging fails, fall back to console
      console.error("Failed to log to database:", dbError);
      console.error("Original log entry:", options);
    }
  }

  // Log to console with formatting
  private static logToConsole(options: LogOptions): void {
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${options.level.toUpperCase()}]`;
    const component = options.component ? ` [${options.component}]` : "";
    
    let message = `${prefix}${component} ${options.message}`;
    
    if (options.metadata) {
      message += `\nMetadata: ${JSON.stringify(options.metadata, null, 2)}`;
    }
    
    if (options.error) {
      message += `\nError: ${options.error.message}`;
      if (options.error.stack) {
        message += `\nStack: ${options.error.stack}`;
      }
    }

    switch (options.level) {
      case "error":
        console.error(message);
        break;
      case "warn":
        console.warn(message);
        break;
      case "info":
        console.info(message);
        break;
      case "debug":
        console.debug(message);
        break;
    }
  }

  // Main logging method
  private static async log(options: LogOptions): Promise<void> {
    // Always log to console first
    this.logToConsole(options);
    
    // Try to log to database
    try {
      await this.logToDatabase(options);
    } catch (error) {
      // Database logging failed - already handled in logToDatabase
    }
  }

  // Convenience methods
  static async error(message: string, options: Partial<LogOptions> = {}): Promise<void> {
    await this.log({ level: "error", message, ...options });
  }

  static async warn(message: string, options: Partial<LogOptions> = {}): Promise<void> {
    await this.log({ level: "warn", message, ...options });
  }

  static async info(message: string, options: Partial<LogOptions> = {}): Promise<void> {
    await this.log({ level: "info", message, ...options });
  }

  static async debug(message: string, options: Partial<LogOptions> = {}): Promise<void> {
    await this.log({ level: "debug", message, ...options });
  }

  // Log exceptions with full stack trace
  static async exception(error: Error, options: Partial<LogOptions> = {}): Promise<void> {
    await this.log({ 
      level: "error", 
      message: error.message, 
      error,
      component: options.component || "application",
      ...options 
    });
  }

  // Wrap async functions to automatically log exceptions
  static wrapAsync<T extends any[], R>(
    fn: (...args: T) => Promise<R>,
    component?: string
  ) {
    return async (...args: T): Promise<R> => {
      try {
        return await fn(...args);
      } catch (error) {
        await this.exception(error as Error, { 
          component,
          metadata: { functionArgs: args }
        });
        throw error; // Re-throw to maintain normal error handling
      }
    };
  }
}

// Export a global error handler for unhandled exceptions
export function setupGlobalErrorHandling(): void {
  process.on('uncaughtException', async (error) => {
    await Logger.exception(error, { 
      component: "uncaught-exception",
      message: "Uncaught exception occurred"
    });
    console.error("Uncaught Exception - Application will exit:", error);
    process.exit(1);
  });

  process.on('unhandledRejection', async (reason, promise) => {
    const error = reason instanceof Error ? reason : new Error(String(reason));
    await Logger.exception(error, { 
      component: "unhandled-rejection",
      message: "Unhandled promise rejection",
      metadata: { promise: promise.toString() }
    });
    console.error("Unhandled Rejection:", reason);
  });
}