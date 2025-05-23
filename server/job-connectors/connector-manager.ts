import { BaseJobConnector, JobSearchParams, JobSearchResponse } from './base-connector';
import { AdzunaConnector } from './adzuna-connector';
import type { User } from '@shared/schema';

export type ConnectorType = 'adzuna' | 'indeed' | 'glassdoor' | 'greenhouse' | 'ziprecruiter';

export interface ConnectorConfig {
  type: ConnectorType;
  name: string;
  description: string;
  isConfigured: boolean;
  requiresCredentials: { field: string; label: string }[];
}

export class JobConnectorManager {
  private connectors: Map<ConnectorType, BaseJobConnector> = new Map();

  constructor(private user: User) {
    this.initializeConnectors();
  }

  private initializeConnectors(): void {
    // Initialize Adzuna connector - use database credentials as primary source
    const adzunaApiKey = this.user?.adzunaApiKey || undefined;
    const adzunaAppId = this.user?.adzunaAppId || undefined;
    
    console.log("🔑 Initializing Adzuna connector with:", {
      hasApiKey: !!adzunaApiKey,
      hasAppId: !!adzunaAppId,
      userHasApiKey: !!this.user?.adzunaApiKey,
      userHasAppId: !!this.user?.adzunaAppId,
      userId: this.user?.id,
      userObject: this.user
    });
    
    const adzunaConnector = new AdzunaConnector({
      apiKey: adzunaApiKey,
      appId: adzunaAppId,
      userId: this.user.id
    });
    this.connectors.set('adzuna', adzunaConnector);

    // Note: LinkedIn and Indeed connectors removed - focusing on Adzuna only
  }

  getAvailableConnectors(): ConnectorConfig[] {
    return [
      {
        type: 'adzuna',
        name: 'Adzuna',
        description: 'Global job search engine aggregating positions from hundreds of job boards',
        isConfigured: this.connectors.get('adzuna')?.isConfigured() || false,
        requiresCredentials: [
          { field: 'adzunaAppId', label: 'App ID' },
          { field: 'adzunaApiKey', label: 'API Key' }
        ]
      },
      {
        type: 'indeed',
        name: 'Indeed',
        description: 'Automated job scraping from Indeed (scraping-based)',
        isConfigured: this.connectors.get('indeed')?.isConfigured() || false,
        requiresCredentials: [
          { field: 'indeedApiKey', label: 'API Key (Optional)' }
        ]
      },
      {
        type: 'linkedin',
        name: 'LinkedIn',
        description: 'Professional job scraping from LinkedIn (scraping-based)',
        isConfigured: this.connectors.get('linkedin')?.isConfigured() || false,
        requiresCredentials: [
          { field: 'linkedinApiKey', label: 'API Key (Optional)' }
        ]
      },
      {
        type: 'glassdoor',
        name: 'Glassdoor',
        description: 'Company reviews and salary data (API discontinued in 2018)',
        isConfigured: false,
        requiresCredentials: [
          { field: 'glassdoorApiKey', label: 'API Key (Legacy)' }
        ]
      },
      {
        type: 'greenhouse',
        name: 'Greenhouse',
        description: 'ATS platform with job board API for approved partners',
        isConfigured: false,
        requiresCredentials: [
          { field: 'greenhouseApiKey', label: 'Job Board API Key' }
        ]
      },
      {
        type: 'ziprecruiter',
        name: 'ZipRecruiter',
        description: 'Job distribution platform with partner API access',
        isConfigured: false,
        requiresCredentials: [
          { field: 'ziprecruiterApiKey', label: 'Jobs API Key' }
        ]
      }
    ];
  }

  getConfiguredConnectors(): ConnectorType[] {
    return Array.from(this.connectors.entries())
      .filter(([_, connector]) => connector.isConfigured())
      .map(([type, _]) => type);
  }

  async searchJobs(params: JobSearchParams, connectorTypes?: ConnectorType[]): Promise<{
    results: JobSearchResponse[];
    errors: { connector: ConnectorType; error: string }[];
  }> {
    const targetConnectors = connectorTypes || this.getConfiguredConnectors();
    const results: JobSearchResponse[] = [];
    const errors: { connector: ConnectorType; error: string }[] = [];

    for (const connectorType of targetConnectors) {
      const connector = this.connectors.get(connectorType);
      
      if (!connector || !connector.isConfigured()) {
        errors.push({
          connector: connectorType,
          error: `${connectorType} connector is not configured`
        });
        continue;
      }

      try {
        const result = await connector.searchJobs(params);
        results.push(result);
      } catch (error) {
        errors.push({
          connector: connectorType,
          error: error.message || `Failed to search ${connectorType}`
        });
      }
    }

    return { results, errors };
  }

  async getJobDetails(jobId: string, connectorType: ConnectorType) {
    const connector = this.connectors.get(connectorType);
    
    if (!connector || !connector.isConfigured()) {
      throw new Error(`${connectorType} connector is not configured`);
    }

    return connector.getJobDetails(jobId);
  }
}

// Export alias for compatibility
export const ConnectorManager = JobConnectorManager;