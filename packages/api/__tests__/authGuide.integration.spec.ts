import { authGuide } from '../src/middleware/authGuide';
import { Request, Response, NextFunction } from 'express';

describe('authGuide middleware integration', () => {
  it('calls next and sets req.user for valid token', async () => {
    const admin = require('firebase-admin');
    admin.auth = jest.fn(() => ({
      verifyIdToken: jest.fn((token: any) => {
        if (token === 'valid') return Promise.resolve({ uid: 'user123' });
        return Promise.reject(new Error('Invalid token'));
      })
    }));
    const req = { headers: { authorization: 'Bearer valid' } } as Partial<Request>;
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as Partial<Response>;
    const next = jest.fn();
    await authGuide(req as Request, res as Response, next);
    expect(next).toHaveBeenCalled();
    expect((req as any).user).toEqual({ uid: 'user123' });
    jest.restoreAllMocks();
  });

  it('returns 401 if no auth header', async () => {
    const req = { headers: {} } as Partial<Request>;
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as Partial<Response>;
    const next = jest.fn();
    await authGuide(req as Request, res as Response, next);
    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Missing or invalid auth token' });
  });

  it('returns 403 if token is invalid', async () => {
    const req = { headers: { authorization: 'Bearer invalid' } } as Partial<Request>;
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as Partial<Response>;
    const next = jest.fn();
    await authGuide(req as Request, res as Response, next);
    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ error: 'Unauthorized' });
  });
});
