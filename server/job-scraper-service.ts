import { storage } from "./storage";
import { ConnectorManager } from "./job-connectors/connector-manager";
import { logApiCall } from "./api-logger";
import type { JobSearchCriteria, InsertScrapedJob } from "@shared/schema";

export class JobScraperService {
  private connectorManager: ConnectorManager | null = null;

  constructor() {
    // We'll initialize the connector manager when we have user data
  }

  private async initializeConnectorManager(userId: number): Promise<void> {
    if (!this.connectorManager) {
      // Get the user data with credentials from the database
      console.log(`🔍 Getting user data for userId: ${userId}`);
      const user = await storage.getUser(userId);
      console.log(`🔍 User retrieved:`, JSON.stringify(user, null, 2));
      if (!user) {
        throw new Error(`User not found: ${userId}`);
      }
      
      // Force the credentials we know are correct
      const userWithCredentials = {
        ...user,
        adzunaApiKey: user.adzunaApiKey || 'd2ef014f5e751407895b6b7ef87f2dd4',
        adzunaAppId: user.adzunaAppId || '17d34542'
      };
      
      console.log(`🔍 Creating connector manager with user:`, {
        id: userWithCredentials.id,
        username: userWithCredentials.username,
        hasAdzunaApiKey: !!userWithCredentials.adzunaApiKey,
        hasAdzunaAppId: !!userWithCredentials.adzunaAppId,
        adzunaApiKey: userWithCredentials.adzunaApiKey ? 'SET' : 'NOT_SET',
        adzunaAppId: userWithCredentials.adzunaAppId ? 'SET' : 'NOT_SET'
      });
      this.connectorManager = new ConnectorManager(userWithCredentials);
    }
  }

  async runScrapeForCriteria(criteriaId: number, userId: number): Promise<{
    success: boolean;
    jobsFound: number;
    errors: string[];
  }> {
    console.log(`🎯 Starting scrape for criteria ID: ${criteriaId}`);
    
    // Initialize connector manager with user credentials
    await this.initializeConnectorManager(userId);
    
    const criteria = await storage.getJobSearchCriteriaById(criteriaId);
    if (!criteria) {
      return { success: false, jobsFound: 0, errors: ["Criteria not found"] };
    }

    const errors: string[] = [];
    let totalJobsFound = 0;

    // Run Adzuna connector using the new connector manager
    try {
      console.log("🔍 Running Adzuna job search...");
      
      // Convert search criteria to Adzuna-compatible format
      const searchKeywords = [...(criteria.keywords || []), ...(criteria.jobTitles || [])].join(' OR ');
      const searchLocation = criteria.locations && criteria.locations.length > 0 ? criteria.locations[0] : 'United States';
      
      const searchParams = {
        query: searchKeywords,
        location: searchLocation,
        salary_min: criteria.salaryMin,
        salary_max: criteria.salaryMax,
      };

      console.log(`🔍 Sending to Adzuna:`, searchParams);
      const results = await this.connectorManager.searchJobs(searchParams, ['adzuna']);
      console.log(`🎯 Adzuna search completed! Found ${results?.jobs?.length || 0} jobs`);
      
      for (const job of results.jobs) {
        await this.saveScrapedJob(job, criteriaId, userId, "adzuna");
        totalJobsFound++;
      }
    } catch (error) {
      console.error("Adzuna connector error:", error);
      errors.push(`Adzuna: ${error.message}`);
    }

    console.log(`✅ Scraping complete! Found ${totalJobsFound} total jobs`);
    
    return {
      success: errors.length === 0 || totalJobsFound > 0,
      jobsFound: totalJobsFound,
      errors
    };
  }

  private async saveScrapedJob(
    jobData: any,
    criteriaId: number,
    userId: number,
    source: string
  ): Promise<void> {
    try {
      // Check if job already exists (prevent duplicates)
      const existingJobs = await storage.getScrapedJobsByUrl(jobData.url);
      if (existingJobs.length > 0) {
        console.log(`⏭️ Skipping duplicate job: ${jobData.title}`);
        return;
      }

      const scrapedJob: InsertScrapedJob = {
        userId,
        criteriaId,
        source,
        title: jobData.title || "Untitled Position",
        company: jobData.company || "Unknown Company",
        location: jobData.location || "Not specified",
        description: jobData.description || "",
        url: jobData.url || "",
        salary: jobData.salary || null,
        employmentType: jobData.employmentType || null,
        experienceLevel: jobData.experienceLevel || null,
        postedDate: jobData.postedDate ? new Date(jobData.postedDate) : new Date(),
        matchScore: null, // Will be calculated later by OpenAI
        isActive: true
      };

      await storage.createScrapedJob(scrapedJob);
      console.log(`💾 Saved job: ${jobData.title} at ${jobData.company}`);
    } catch (error) {
      console.error("Error saving scraped job:", error);
      throw error;
    }
  }

  async runScrapingSession(userId: number): Promise<{
    success: boolean;
    totalJobs: number;
    criteriaSummary: { [criteriaId: number]: { name: string; jobsFound: number; errors: string[] } };
  }> {
    console.log(`🚀 Starting comprehensive scraping session for user ${userId}`);
    
    // Initialize connector manager with user credentials
    await this.initializeConnectorManager(userId);
    
    // Get all active criteria for user
    const allCriteria = await storage.getJobSearchCriteria(userId);
    const activeCriteria = allCriteria.filter(c => c.isActive);
    
    if (activeCriteria.length === 0) {
      return {
        success: false,
        totalJobs: 0,
        criteriaSummary: {}
      };
    }

    const criteriaSummary: { [criteriaId: number]: { name: string; jobsFound: number; errors: string[] } } = {};
    let totalJobs = 0;

    // Create scraping session record
    const session = await storage.createJobSearchSession({
      userId,
      status: "running",
      totalJobsFound: 0,
      errorCount: 0,
      completedCriteria: 0,
      totalCriteria: activeCriteria.length
    });

    console.log(`📋 Processing ${activeCriteria.length} active criteria`);

    for (const criteria of activeCriteria) {
      console.log(`\n🎯 Processing: ${criteria.name}`);
      
      const result = await this.runScrapeForCriteria(criteria.id, userId);
      
      criteriaSummary[criteria.id] = {
        name: criteria.name,
        jobsFound: result.jobsFound,
        errors: result.errors
      };
      
      totalJobs += result.jobsFound;
    }

    // Update session with final results
    await storage.updateJobSearchSession(session.id, {
      status: "completed",
      totalJobsFound: totalJobs,
      errorCount: Object.values(criteriaSummary).reduce((sum, c) => sum + c.errors.length, 0),
      completedCriteria: activeCriteria.length
    });

    console.log(`\n🎉 Scraping session complete!`);
    console.log(`📊 Total jobs found: ${totalJobs}`);
    console.log(`📋 Criteria processed: ${activeCriteria.length}`);

    return {
      success: true,
      totalJobs,
      criteriaSummary
    };
  }
}

export const jobScraperService = new JobScraperService();