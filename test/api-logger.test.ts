import { describe, it, expect, vi, beforeEach } from 'vitest';
import { logApiCall, logApiCallFromRequest } from '@server/api-logger';
import { MemStorage } from '@server/storage';

// Mock storage
const mockStorage = {
  createExternalLog: vi.fn()
};

// Mock the storage import
vi.mock('@server/storage', () => ({
  storage: mockStorage
}));

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('API Logger', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('logApiCall function', () => {
    it('should log successful API calls', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        json: vi.fn().mockResolvedValue({ data: 'success' })
      };
      mockFetch.mockResolvedValue(mockResponse);
      mockStorage.createExternalLog.mockResolvedValue({
        id: 1,
        service: 'openai',
        endpoint: 'https://api.openai.com/v1/chat/completions',
        method: 'POST',
        requestData: { message: 'test' },
        responseData: { data: 'success' },
        statusCode: 200,
        success: true,
        errorMessage: null,
        userId: 1,
        createdAt: new Date()
      });

      const result = await logApiCall({
        service: 'openai',
        endpoint: 'https://api.openai.com/v1/chat/completions',
        method: 'POST',
        requestData: { message: 'test' },
        userId: 1
      });

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.openai.com/v1/chat/completions',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: 'test' })
        }
      );

      expect(mockStorage.createExternalLog).toHaveBeenCalledWith({
        service: 'openai',
        endpoint: 'https://api.openai.com/v1/chat/completions',
        method: 'POST',
        requestData: { message: 'test' },
        responseData: { data: 'success' },
        statusCode: 200,
        success: true,
        errorMessage: null,
        userId: 1
      });

      expect(result.ok).toBe(true);
      expect(result.status).toBe(200);
    });

    it('should log failed API calls', async () => {
      const mockResponse = {
        ok: false,
        status: 401,
        json: vi.fn().mockResolvedValue({ error: 'Unauthorized' })
      };
      mockFetch.mockResolvedValue(mockResponse);
      mockStorage.createExternalLog.mockResolvedValue({
        id: 2,
        service: 'adzuna',
        endpoint: 'https://api.adzuna.com/v1/api/jobs/us/search/1',
        method: 'GET',
        requestData: null,
        responseData: { error: 'Unauthorized' },
        statusCode: 401,
        success: false,
        errorMessage: 'HTTP 401',
        userId: 1,
        createdAt: new Date()
      });

      const result = await logApiCall({
        service: 'adzuna',
        endpoint: 'https://api.adzuna.com/v1/api/jobs/us/search/1',
        method: 'GET',
        userId: 1
      });

      expect(mockStorage.createExternalLog).toHaveBeenCalledWith({
        service: 'adzuna',
        endpoint: 'https://api.adzuna.com/v1/api/jobs/us/search/1',
        method: 'GET',
        requestData: null,
        responseData: { error: 'Unauthorized' },
        statusCode: 401,
        success: false,
        errorMessage: 'HTTP 401',
        userId: 1
      });

      expect(result.ok).toBe(false);
      expect(result.status).toBe(401);
    });

    it('should handle network errors', async () => {
      const networkError = new Error('Network timeout');
      mockFetch.mockRejectedValue(networkError);
      mockStorage.createExternalLog.mockResolvedValue({
        id: 3,
        service: 'openai',
        endpoint: 'https://api.openai.com/v1/models',
        method: 'GET',
        requestData: null,
        responseData: null,
        statusCode: 0,
        success: false,
        errorMessage: 'Network timeout',
        userId: 1,
        createdAt: new Date()
      });

      await expect(logApiCall({
        service: 'openai',
        endpoint: 'https://api.openai.com/v1/models',
        method: 'GET',
        userId: 1
      })).rejects.toThrow('Network timeout');

      expect(mockStorage.createExternalLog).toHaveBeenCalledWith({
        service: 'openai',
        endpoint: 'https://api.openai.com/v1/models',
        method: 'GET',
        requestData: null,
        responseData: null,
        statusCode: 0,
        success: false,
        errorMessage: 'Network timeout',
        userId: 1
      });
    });

    it('should handle different HTTP methods', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        json: vi.fn().mockResolvedValue({ success: true })
      };
      mockFetch.mockResolvedValue(mockResponse);
      mockStorage.createExternalLog.mockResolvedValue({
        id: 4,
        service: 'test',
        endpoint: 'https://api.test.com/data',
        method: 'PUT',
        requestData: { update: 'data' },
        responseData: { success: true },
        statusCode: 200,
        success: true,
        errorMessage: null,
        userId: 1,
        createdAt: new Date()
      });

      await logApiCall({
        service: 'test',
        endpoint: 'https://api.test.com/data',
        method: 'PUT',
        requestData: { update: 'data' },
        userId: 1
      });

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.test.com/data',
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ update: 'data' })
        }
      );
    });

    it('should handle GET requests without body', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        json: vi.fn().mockResolvedValue({ data: [] })
      };
      mockFetch.mockResolvedValue(mockResponse);
      mockStorage.createExternalLog.mockResolvedValue({
        id: 5,
        service: 'test',
        endpoint: 'https://api.test.com/list',
        method: 'GET',
        requestData: null,
        responseData: { data: [] },
        statusCode: 200,
        success: true,
        errorMessage: null,
        userId: 1,
        createdAt: new Date()
      });

      await logApiCall({
        service: 'test',
        endpoint: 'https://api.test.com/list',
        method: 'GET',
        userId: 1
      });

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.test.com/list',
        {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        }
      );
    });

    it('should handle logging failures gracefully', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        json: vi.fn().mockResolvedValue({ data: 'success' })
      };
      mockFetch.mockResolvedValue(mockResponse);
      mockStorage.createExternalLog.mockRejectedValue(new Error('Database error'));

      // Should not throw even if logging fails
      const result = await logApiCall({
        service: 'test',
        endpoint: 'https://api.test.com/data',
        method: 'POST',
        requestData: { test: 'data' },
        userId: 1
      });

      expect(result.ok).toBe(true);
      expect(result.status).toBe(200);
    });
  });

  describe('logApiCallFromRequest function', () => {
    it('should extract data from Express request', () => {
      const mockReq = {
        body: { message: 'test request' },
        session: { userId: 42 }
      };

      const result = logApiCallFromRequest(mockReq as any, 'openai', 'https://api.openai.com/v1/test', 'POST');

      expect(result).toEqual({
        service: 'openai',
        endpoint: 'https://api.openai.com/v1/test',
        method: 'POST',
        requestData: { message: 'test request' },
        userId: 42
      });
    });

    it('should handle missing request body', () => {
      const mockReq = {
        session: { userId: 42 }
      };

      const result = logApiCallFromRequest(mockReq as any, 'test', 'https://api.test.com/endpoint', 'GET');

      expect(result).toEqual({
        service: 'test',
        endpoint: 'https://api.test.com/endpoint',
        method: 'GET',
        requestData: null,
        userId: 42
      });
    });

    it('should handle missing user session', () => {
      const mockReq = {
        body: { data: 'test' }
      };

      const result = logApiCallFromRequest(mockReq as any, 'test', 'https://api.test.com/endpoint', 'POST');

      expect(result).toEqual({
        service: 'test',
        endpoint: 'https://api.test.com/endpoint',
        method: 'POST',
        requestData: { data: 'test' },
        userId: undefined
      });
    });

    it('should handle empty request body', () => {
      const mockReq = {
        body: {},
        session: { userId: 1 }
      };

      const result = logApiCallFromRequest(mockReq as any, 'test', 'https://api.test.com/endpoint', 'POST');

      expect(result).toEqual({
        service: 'test',
        endpoint: 'https://api.test.com/endpoint',
        method: 'POST',
        requestData: {},
        userId: 1
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle JSON parsing errors in response', async () => {
      const mockResponse = {
        ok: false,
        status: 500,
        json: vi.fn().mockRejectedValue(new Error('Invalid JSON'))
      };
      mockFetch.mockResolvedValue(mockResponse);
      mockStorage.createExternalLog.mockResolvedValue({
        id: 6,
        service: 'test',
        endpoint: 'https://api.test.com/invalid',
        method: 'GET',
        requestData: null,
        responseData: null,
        statusCode: 500,
        success: false,
        errorMessage: 'HTTP 500',
        userId: 1,
        createdAt: new Date()
      });

      const result = await logApiCall({
        service: 'test',
        endpoint: 'https://api.test.com/invalid',
        method: 'GET',
        userId: 1
      });

      expect(mockStorage.createExternalLog).toHaveBeenCalledWith({
        service: 'test',
        endpoint: 'https://api.test.com/invalid',
        method: 'GET',
        requestData: null,
        responseData: null,
        statusCode: 500,
        success: false,
        errorMessage: 'HTTP 500',
        userId: 1
      });

      expect(result.ok).toBe(false);
      expect(result.status).toBe(500);
    });

    it('should handle undefined response data', async () => {
      const mockResponse = {
        ok: true,
        status: 204,
        json: vi.fn().mockResolvedValue(undefined)
      };
      mockFetch.mockResolvedValue(mockResponse);
      mockStorage.createExternalLog.mockResolvedValue({
        id: 7,
        service: 'test',
        endpoint: 'https://api.test.com/no-content',
        method: 'DELETE',
        requestData: null,
        responseData: null,
        statusCode: 204,
        success: true,
        errorMessage: null,
        userId: 1,
        createdAt: new Date()
      });

      const result = await logApiCall({
        service: 'test',
        endpoint: 'https://api.test.com/no-content',
        method: 'DELETE',
        userId: 1
      });

      expect(mockStorage.createExternalLog).toHaveBeenCalledWith({
        service: 'test',
        endpoint: 'https://api.test.com/no-content',
        method: 'DELETE',
        requestData: null,
        responseData: null,
        statusCode: 204,
        success: true,
        errorMessage: null,
        userId: 1
      });

      expect(result.ok).toBe(true);
      expect(result.status).toBe(204);
    });
  });

  describe('Data Sanitization', () => {
    it('should handle sensitive data in requests', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        json: vi.fn().mockResolvedValue({ success: true })
      };
      mockFetch.mockResolvedValue(mockResponse);
      mockStorage.createExternalLog.mockResolvedValue({
        id: 8,
        service: 'auth',
        endpoint: 'https://api.auth.com/login',
        method: 'POST',
        requestData: { username: 'user', password: 'secret123' },
        responseData: { success: true },
        statusCode: 200,
        success: true,
        errorMessage: null,
        userId: 1,
        createdAt: new Date()
      });

      await logApiCall({
        service: 'auth',
        endpoint: 'https://api.auth.com/login',
        method: 'POST',
        requestData: { username: 'user', password: 'secret123' },
        userId: 1
      });

      // Verify that the request data is logged as-is (sanitization would be handled at storage level if needed)
      expect(mockStorage.createExternalLog).toHaveBeenCalledWith({
        service: 'auth',
        endpoint: 'https://api.auth.com/login',
        method: 'POST',
        requestData: { username: 'user', password: 'secret123' },
        responseData: { success: true },
        statusCode: 200,
        success: true,
        errorMessage: null,
        userId: 1
      });
    });
  });
});