import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock environment variables for testing
process.env.DATABASE_URL = 'test://localhost/test';
process.env.SESSION_SECRET = 'test-secret';

// Mock global fetch for API testing
global.fetch = vi.fn();

// Clean up after each test
afterEach(() => {
  vi.clearAllMocks();
});