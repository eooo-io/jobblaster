// Test script to run job scraper with Adzuna
const fetch = require('node-fetch');

async function testJobScraper() {
  try {
    // Set environment variables
    process.env.ADZUNA_APP_ID = "17d34542";
    process.env.ADZUNA_API_KEY = "d2ef014f5e751407895b6b7ef87f2dd4";
    
    // Import the job scraper service
    const { jobScraperService } = require('./server/job-scraper-service.ts');
    
    console.log("Testing job scraper with Adzuna...");
    
    // Run scraper for user ID 2 (your logged in user)
    const result = await jobScraperService.runScrapingSession(2);
    
    console.log("Scraping result:", result);
    
  } catch (error) {
    console.error("Error running scraper:", error);
  }
}

testJobScraper();