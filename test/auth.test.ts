import { describe, it, expect, vi, beforeEach } from 'vitest';
import { hashPassword, verifyPassword, requireAuth, getCurrentUserId } from '@server/auth';
import type { Request, Response, NextFunction } from 'express';

describe('Authentication System', () => {
  describe('Password Hashing', () => {
    it('should hash passwords securely', async () => {
      const plainPassword = 'testPassword123';
      const hashedPassword = await hashPassword(plainPassword);
      
      expect(hashedPassword).toBeDefined();
      expect(hashedPassword).not.toBe(plainPassword);
      expect(hashedPassword.length).toBeGreaterThan(50); // bcrypt hashes are typically 60 chars
    });

    it('should generate different hashes for the same password', async () => {
      const password = 'samePassword';
      const hash1 = await hashPassword(password);
      const hash2 = await hashPassword(password);
      
      expect(hash1).not.toBe(hash2);
    });
  });

  describe('Password Verification', () => {
    it('should verify correct passwords', async () => {
      const password = 'correctPassword';
      const hash = await hashPassword(password);
      
      const isValid = await verifyPassword(password, hash);
      expect(isValid).toBe(true);
    });

    it('should reject incorrect passwords', async () => {
      const correctPassword = 'correctPassword';
      const wrongPassword = 'wrongPassword';
      const hash = await hashPassword(correctPassword);
      
      const isValid = await verifyPassword(wrongPassword, hash);
      expect(isValid).toBe(false);
    });

    it('should handle empty passwords gracefully', async () => {
      const hash = await hashPassword('somePassword');
      
      const isValid = await verifyPassword('', hash);
      expect(isValid).toBe(false);
    });
  });

  describe('Authentication Middleware', () => {
    let mockReq: Partial<Request>;
    let mockRes: Partial<Response>;
    let mockNext: NextFunction;

    beforeEach(() => {
      mockReq = {
        session: {}
      };
      mockRes = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn().mockReturnThis(),
        redirect: vi.fn()
      };
      mockNext = vi.fn();
    });

    it('should allow authenticated users to proceed', () => {
      mockReq.session = { userId: 1, username: 'testuser' };
      
      requireAuth(mockReq as Request, mockRes as Response, mockNext);
      
      expect(mockNext).toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalled();
    });

    it('should reject unauthenticated users', () => {
      mockReq.session = {};
      
      requireAuth(mockReq as Request, mockRes as Response, mockNext);
      
      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Authentication required' });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should handle missing session gracefully', () => {
      delete mockReq.session;
      
      requireAuth(mockReq as Request, mockRes as Response, mockNext);
      
      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('User ID Extraction', () => {
    it('should return user ID from valid session', () => {
      const mockReq = {
        session: { userId: 42, username: 'testuser' }
      } as Request;
      
      const userId = getCurrentUserId(mockReq);
      expect(userId).toBe(42);
    });

    it('should return null for invalid session', () => {
      const mockReq = {
        session: {}
      } as Request;
      
      const userId = getCurrentUserId(mockReq);
      expect(userId).toBeNull();
    });

    it('should return null for missing session', () => {
      const mockReq = {} as Request;
      
      const userId = getCurrentUserId(mockReq);
      expect(userId).toBeNull();
    });
  });
});