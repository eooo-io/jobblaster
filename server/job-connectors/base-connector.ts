// Base interface for all job connectors
export interface JobSearchParams {
  query?: string;
  location?: string;
  category?: string;
  salary_min?: number;
  salary_max?: number;
  company?: string;
  page?: number;
  per_page?: number;
}

export interface JobResult {
  id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  salary_min?: number;
  salary_max?: number;
  url: string;
  posted_date?: string;
  contract_type?: string;
  source: string; // 'adzuna', 'indeed', etc.
}

export interface JobSearchResponse {
  jobs: JobResult[];
  total_results: number;
  page: number;
  per_page: number;
  has_more: boolean;
}

export abstract class BaseJobConnector {
  protected apiKey?: string;
  protected appId?: string;
  protected baseUrl: string = '';
  protected userId?: number;
  
  constructor(config: { apiKey?: string; appId?: string; userId?: number }) {
    this.apiKey = config.apiKey;
    this.appId = config.appId;
    this.userId = config.userId;
  }

  abstract isConfigured(): boolean;
  abstract searchJobs(params: JobSearchParams): Promise<JobSearchResponse>;
  abstract getJobDetails(jobId: string): Promise<JobResult | null>;
  
  protected validateConfig(): void {
    if (!this.isConfigured()) {
      throw new Error(`${this.constructor.name} is not properly configured. Missing API credentials.`);
    }
  }
}