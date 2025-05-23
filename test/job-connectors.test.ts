import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AdzunaConnector } from '@server/job-connectors/adzuna-connector';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('Job Connectors', () => {
  describe('AdzunaConnector', () => {
    let connector: AdzunaConnector;

    beforeEach(() => {
      vi.clearAllMocks();
      connector = new AdzunaConnector({
        apiKey: 'test-api-key',
        appId: 'test-app-id',
        country: 'us'
      });
    });

    describe('Configuration', () => {
      it('should be configured when API key and app ID are provided', () => {
        expect(connector.isConfigured()).toBe(true);
      });

      it('should not be configured when API key is missing', () => {
        const unconfiguredConnector = new AdzunaConnector({
          appId: 'test-app-id',
          country: 'us'
        });
        expect(unconfiguredConnector.isConfigured()).toBe(false);
      });

      it('should not be configured when app ID is missing', () => {
        const unconfiguredConnector = new AdzunaConnector({
          apiKey: 'test-api-key',
          country: 'us'
        });
        expect(unconfiguredConnector.isConfigured()).toBe(false);
      });

      it('should use default country when not specified', () => {
        const defaultConnector = new AdzunaConnector({
          apiKey: 'test-api-key',
          appId: 'test-app-id'
        });
        expect(defaultConnector.isConfigured()).toBe(true);
      });
    });

    describe('Job Search', () => {
      it('should search for jobs with basic parameters', async () => {
        const mockResponse = {
          ok: true,
          json: vi.fn().mockResolvedValue({
            results: [
              {
                id: '123',
                title: 'Software Engineer',
                company: { display_name: 'Tech Corp' },
                description: 'Great software engineering role',
                location: { display_name: 'San Francisco, CA' },
                salary_min: 100000,
                salary_max: 150000,
                contract_type: 'permanent',
                created: '2025-01-01T00:00:00Z',
                redirect_url: 'https://example.com/job/123'
              }
            ],
            count: 1
          })
        };

        mockFetch.mockResolvedValue(mockResponse);

        const searchParams = {
          query: 'software engineer',
          location: 'San Francisco',
          page: 1,
          resultsPerPage: 10
        };

        const result = await connector.searchJobs(searchParams);

        expect(result.jobs).toHaveLength(1);
        expect(result.jobs[0]).toEqual({
          id: '123',
          title: 'Software Engineer',
          company: 'Tech Corp',
          description: 'Great software engineering role',
          location: 'San Francisco, CA',
          salaryMin: 100000,
          salaryMax: 150000,
          employmentType: 'permanent',
          datePosted: '2025-01-01T00:00:00Z',
          url: 'https://example.com/job/123',
          source: 'adzuna'
        });
        expect(result.totalCount).toBe(1);
      });

      it('should handle pagination correctly', async () => {
        const mockResponse = {
          ok: true,
          json: vi.fn().mockResolvedValue({
            results: [],
            count: 100
          })
        };

        mockFetch.mockResolvedValue(mockResponse);

        const searchParams = {
          query: 'developer',
          page: 3,
          resultsPerPage: 20
        };

        await connector.searchJobs(searchParams);

        expect(mockFetch).toHaveBeenCalledWith(
          expect.stringContaining('page=3'),
          expect.any(Object)
        );
        expect(mockFetch).toHaveBeenCalledWith(
          expect.stringContaining('results_per_page=20'),
          expect.any(Object)
        );
      });

      it('should handle search filters', async () => {
        const mockResponse = {
          ok: true,
          json: vi.fn().mockResolvedValue({
            results: [],
            count: 0
          })
        };

        mockFetch.mockResolvedValue(mockResponse);

        const searchParams = {
          query: 'react developer',
          location: 'New York',
          salaryMin: 80000,
          salaryMax: 120000,
          employmentType: 'permanent',
          page: 1,
          resultsPerPage: 10
        };

        await connector.searchJobs(searchParams);

        const fetchCall = mockFetch.mock.calls[0][0] as string;
        expect(fetchCall).toContain('what=react%20developer');
        expect(fetchCall).toContain('where=New%20York');
        expect(fetchCall).toContain('salary_min=80000');
        expect(fetchCall).toContain('salary_max=120000');
      });

      it('should handle API errors gracefully', async () => {
        const mockResponse = {
          ok: false,
          status: 401,
          json: vi.fn().mockResolvedValue({
            error: 'Invalid API key'
          })
        };

        mockFetch.mockResolvedValue(mockResponse);

        await expect(connector.searchJobs({
          query: 'developer',
          page: 1,
          resultsPerPage: 10
        })).rejects.toThrow('Adzuna API error: Invalid API key');
      });

      it('should handle network errors', async () => {
        mockFetch.mockRejectedValue(new Error('Network error'));

        await expect(connector.searchJobs({
          query: 'developer',
          page: 1,
          resultsPerPage: 10
        })).rejects.toThrow('Network error while searching jobs');
      });

      it('should handle missing or malformed response data', async () => {
        const mockResponse = {
          ok: true,
          json: vi.fn().mockResolvedValue({
            // Missing results array
            count: 0
          })
        };

        mockFetch.mockResolvedValue(mockResponse);

        const result = await connector.searchJobs({
          query: 'developer',
          page: 1,
          resultsPerPage: 10
        });

        expect(result.jobs).toEqual([]);
        expect(result.totalCount).toBe(0);
      });
    });

    describe('Job Details', () => {
      it('should fetch individual job details', async () => {
        const mockResponse = {
          ok: true,
          json: vi.fn().mockResolvedValue({
            id: '456',
            title: 'Senior React Developer',
            company: { display_name: 'Frontend Corp' },
            description: 'Detailed job description with requirements',
            location: { display_name: 'Remote' },
            salary_min: 120000,
            salary_max: 180000,
            contract_type: 'permanent',
            created: '2025-01-02T00:00:00Z',
            redirect_url: 'https://example.com/job/456'
          })
        };

        mockFetch.mockResolvedValue(mockResponse);

        const jobDetail = await connector.getJobDetails('456');

        expect(jobDetail).toEqual({
          id: '456',
          title: 'Senior React Developer',
          company: 'Frontend Corp',
          description: 'Detailed job description with requirements',
          location: 'Remote',
          salaryMin: 120000,
          salaryMax: 180000,
          employmentType: 'permanent',
          datePosted: '2025-01-02T00:00:00Z',
          url: 'https://example.com/job/456',
          source: 'adzuna'
        });
      });

      it('should return null for non-existent job', async () => {
        const mockResponse = {
          ok: false,
          status: 404,
          json: vi.fn().mockResolvedValue({
            error: 'Job not found'
          })
        };

        mockFetch.mockResolvedValue(mockResponse);

        const jobDetail = await connector.getJobDetails('nonexistent');
        expect(jobDetail).toBeNull();
      });

      it('should handle incomplete job data gracefully', async () => {
        const mockResponse = {
          ok: true,
          json: vi.fn().mockResolvedValue({
            id: '789',
            title: 'Developer',
            // Missing some fields
            description: 'Basic description'
          })
        };

        mockFetch.mockResolvedValue(mockResponse);

        const jobDetail = await connector.getJobDetails('789');

        expect(jobDetail).toEqual({
          id: '789',
          title: 'Developer',
          company: '',
          description: 'Basic description',
          location: '',
          salaryMin: null,
          salaryMax: null,
          employmentType: '',
          datePosted: '',
          url: '',
          source: 'adzuna'
        });
      });
    });

    describe('Categories', () => {
      it('should fetch job categories', async () => {
        const mockResponse = {
          ok: true,
          json: vi.fn().mockResolvedValue({
            results: [
              { tag: 'it-jobs', label: 'IT Jobs' },
              { tag: 'engineering-jobs', label: 'Engineering Jobs' },
              { tag: 'healthcare-jobs', label: 'Healthcare Jobs' }
            ]
          })
        };

        mockFetch.mockResolvedValue(mockResponse);

        const categories = await connector.getCategories();

        expect(categories).toEqual([
          { tag: 'it-jobs', label: 'IT Jobs' },
          { tag: 'engineering-jobs', label: 'Engineering Jobs' },
          { tag: 'healthcare-jobs', label: 'Healthcare Jobs' }
        ]);
      });

      it('should handle empty categories response', async () => {
        const mockResponse = {
          ok: true,
          json: vi.fn().mockResolvedValue({
            results: []
          })
        };

        mockFetch.mockResolvedValue(mockResponse);

        const categories = await connector.getCategories();
        expect(categories).toEqual([]);
      });

      it('should handle categories API error', async () => {
        const mockResponse = {
          ok: false,
          status: 500,
          json: vi.fn().mockResolvedValue({
            error: 'Internal server error'
          })
        };

        mockFetch.mockResolvedValue(mockResponse);

        await expect(connector.getCategories()).rejects.toThrow('Failed to fetch categories');
      });
    });

    describe('URL Building', () => {
      it('should build correct API URLs', async () => {
        const mockResponse = {
          ok: true,
          json: vi.fn().mockResolvedValue({ results: [], count: 0 })
        };

        mockFetch.mockResolvedValue(mockResponse);

        await connector.searchJobs({
          query: 'test job',
          location: 'test location',
          page: 1,
          resultsPerPage: 10
        });

        const fetchUrl = mockFetch.mock.calls[0][0] as string;
        expect(fetchUrl).toContain('https://api.adzuna.com/v1/api/jobs/us/search/1');
        expect(fetchUrl).toContain('app_id=test-app-id');
        expect(fetchUrl).toContain('app_key=test-api-key');
        expect(fetchUrl).toContain('what=test%20job');
        expect(fetchUrl).toContain('where=test%20location');
      });

      it('should handle special characters in search parameters', async () => {
        const mockResponse = {
          ok: true,
          json: vi.fn().mockResolvedValue({ results: [], count: 0 })
        };

        mockFetch.mockResolvedValue(mockResponse);

        await connector.searchJobs({
          query: 'C++ developer & architect',
          location: 'San Francisco, CA',
          page: 1,
          resultsPerPage: 10
        });

        const fetchUrl = mockFetch.mock.calls[0][0] as string;
        expect(fetchUrl).toContain('what=C%2B%2B%20developer%20%26%20architect');
        expect(fetchUrl).toContain('where=San%20Francisco%2C%20CA');
      });
    });

    describe('Rate Limiting', () => {
      it('should handle rate limiting errors', async () => {
        const mockResponse = {
          ok: false,
          status: 429,
          json: vi.fn().mockResolvedValue({
            error: 'Rate limit exceeded'
          })
        };

        mockFetch.mockResolvedValue(mockResponse);

        await expect(connector.searchJobs({
          query: 'developer',
          page: 1,
          resultsPerPage: 10
        })).rejects.toThrow('Adzuna API error: Rate limit exceeded');
      });
    });

    describe('Data Transformation', () => {
      it('should transform salary data correctly', async () => {
        const mockResponse = {
          ok: true,
          json: vi.fn().mockResolvedValue({
            results: [
              {
                id: '1',
                title: 'Job with salary range',
                company: { display_name: 'Company' },
                description: 'Description',
                salary_min: 75000.50,
                salary_max: 125000.75
              },
              {
                id: '2',
                title: 'Job without salary',
                company: { display_name: 'Company' },
                description: 'Description'
                // No salary fields
              }
            ],
            count: 2
          })
        };

        mockFetch.mockResolvedValue(mockResponse);

        const result = await connector.searchJobs({
          query: 'test',
          page: 1,
          resultsPerPage: 10
        });

        expect(result.jobs[0].salaryMin).toBe(75000.50);
        expect(result.jobs[0].salaryMax).toBe(125000.75);
        expect(result.jobs[1].salaryMin).toBeNull();
        expect(result.jobs[1].salaryMax).toBeNull();
      });

      it('should handle various employment types', async () => {
        const mockResponse = {
          ok: true,
          json: vi.fn().mockResolvedValue({
            results: [
              { id: '1', title: 'Job 1', contract_type: 'permanent' },
              { id: '2', title: 'Job 2', contract_type: 'contract' },
              { id: '3', title: 'Job 3', contract_type: 'part_time' },
              { id: '4', title: 'Job 4' } // No contract type
            ],
            count: 4
          })
        };

        mockFetch.mockResolvedValue(mockResponse);

        const result = await connector.searchJobs({
          query: 'test',
          page: 1,
          resultsPerPage: 10
        });

        expect(result.jobs[0].employmentType).toBe('permanent');
        expect(result.jobs[1].employmentType).toBe('contract');
        expect(result.jobs[2].employmentType).toBe('part_time');
        expect(result.jobs[3].employmentType).toBe('');
      });
    });
  });
});