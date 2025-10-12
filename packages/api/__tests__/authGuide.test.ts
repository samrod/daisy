import { authGuide } from '../src/middleware/authGuide';
import { Request, Response, NextFunction } from 'express';

jest.mock('firebase-admin', () => ({
  auth: () => ({
    verifyIdToken: jest.fn((token) => {
      if (token === 'valid') return Promise.resolve({ uid: 'user123' });
      throw new Error('Invalid token');
    })
  })
}));

describe('authGuide middleware', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    req = { headers: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();
  });

  it('returns 401 if no auth header', async () => {
    await authGuide(req as Request, res as Response, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Missing or invalid auth token' });
  });

  it('returns 401 if auth header is malformed', async () => {
    req.headers = { authorization: 'BadToken' };
    await authGuide(req as Request, res as Response, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Missing or invalid auth token' });
  });

  it('calls next if token is valid', async () => {
    req.headers = { authorization: 'Bearer valid' };
    await authGuide(req as Request, res as Response, next);
    expect(next).toHaveBeenCalled();
    expect((req as any).user).toEqual({ uid: 'user123' });
  });

  it('returns 403 if token is invalid', async () => {
    req.headers = { authorization: 'Bearer invalid' };
    await authGuide(req as Request, res as Response, next);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ error: 'Unauthorized' });
  });
});
