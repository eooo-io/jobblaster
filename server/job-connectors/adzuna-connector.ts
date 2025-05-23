import { BaseJobConnector, JobSearchParams, JobSearchResponse, JobResult } from './base-connector';
import { logApiCall } from '../api-logger';

export class AdzunaConnector extends BaseJobConnector {
  protected baseUrl = 'https://api.adzuna.com/v1/api/jobs';
  private country: string;

  constructor(config: { apiKey?: string; appId?: string; country?: string }) {
    super(config);
    this.country = config.country || 'us'; // Default to US
  }

  isConfigured(): boolean {
    return !!(this.apiKey && this.appId);
  }

  async searchJobs(params: JobSearchParams): Promise<JobSearchResponse> {
    this.validateConfig();

    const page = params.page || 1;
    const per_page = Math.min(params.per_page || 20, 50); // Adzuna max is 50

    const queryParams = new URLSearchParams({
      app_id: this.appId!,
      app_key: this.apiKey!,
      results_per_page: per_page.toString(),
      page: page.toString(),
    });

    // Add search parameters
    if (params.query) queryParams.append('what', params.query);
    if (params.location) queryParams.append('where', params.location);
    if (params.salary_min) queryParams.append('salary_min', params.salary_min.toString());
    if (params.salary_max) queryParams.append('salary_max', params.salary_max.toString());
    if (params.company) queryParams.append('company', params.company);

    const url = `${this.baseUrl}/${this.country}/search?${queryParams}`;
    console.log("🔗 Adzuna API URL:", url);

    try {
      // Use the API logger to track all external calls
      const response = await logApiCall({
        service: 'Adzuna',
        endpoint: url,
        method: 'GET',
        requestData: Object.fromEntries(queryParams.entries()),
        userId: this.userId || 1 // Default to user 1 if not provided
      }, async () => {
        return await fetch(url);
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.log("❌ Adzuna API Error Response:", errorText);
        throw new Error(`Adzuna API error: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const data = await response.json();

      const jobs: JobResult[] = data.results?.map((job: any) => ({
        id: job.id.toString(),
        title: job.title,
        company: job.company?.display_name || 'Unknown Company',
        location: job.location?.display_name || 'Unknown Location',
        description: job.description || '',
        salary_min: job.salary_min,
        salary_max: job.salary_max,
        url: job.redirect_url,
        posted_date: job.created,
        contract_type: job.contract_type,
        source: 'adzuna'
      })) || [];

      return {
        jobs,
        total_results: data.count || 0,
        page,
        per_page,
        has_more: jobs.length === per_page
      };

    } catch (error) {
      console.error('Adzuna search error:', error);
      throw new Error(`Failed to search jobs: ${error.message}`);
    }
  }

  async getJobDetails(jobId: string): Promise<JobResult | null> {
    this.validateConfig();

    const queryParams = new URLSearchParams({
      app_id: this.appId!,
      app_key: this.apiKey!,
    });

    const url = `${this.baseUrl}/${this.country}/details/${jobId}?${queryParams}`;

    try {
      const response = await fetch(url);
      
      if (!response.ok) {
        if (response.status === 404) return null;
        throw new Error(`Adzuna API error: ${response.status} ${response.statusText}`);
      }

      const job = await response.json();

      return {
        id: job.id.toString(),
        title: job.title,
        company: job.company?.display_name || 'Unknown Company',
        location: job.location?.display_name || 'Unknown Location',
        description: job.description || '',
        salary_min: job.salary_min,
        salary_max: job.salary_max,
        url: job.redirect_url,
        posted_date: job.created,
        contract_type: job.contract_type,
        source: 'adzuna'
      };

    } catch (error) {
      console.error('Adzuna job details error:', error);
      return null;
    }
  }

  // Additional Adzuna-specific methods
  async getCategories(): Promise<{ tag: string; label: string }[]> {
    this.validateConfig();

    const queryParams = new URLSearchParams({
      app_id: this.appId!,
      app_key: this.apiKey!,
    });

    const url = `${this.baseUrl}/${this.country}/categories?${queryParams}`;

    try {
      const response = await fetch(url);
      if (!response.ok) return [];
      
      const data = await response.json();
      return data.results || [];
    } catch (error) {
      console.error('Adzuna categories error:', error);
      return [];
    }
  }
}