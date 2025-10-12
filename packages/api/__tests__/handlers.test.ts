import { handlePost, handleDelete, db } from '../src/utils';
import { Request, Response } from 'express';

describe('handlePost', () => {
  it('should set data and return success', async () => {
    const mockSet = jest.fn();
    (db as any) = { ref: () => ({ set: mockSet }) };
    const req = { body: { data: { foo: 'bar' } }, params: { collection: 'test', id: '123' } } as Partial<Request>;
    const res = { json: jest.fn() } as Partial<Response>;
    await handlePost(req as Request, res as Response);
    expect(mockSet).toHaveBeenCalledWith({ foo: 'bar' });
    expect(res.json).toHaveBeenCalledWith({ success: true });
  });

  it('should handle errors and return 500', async () => {
    const mockSet = jest.fn().mockRejectedValue(new Error('fail'));
    (db as any) = { ref: () => ({ set: mockSet }) };
    const req = { body: { data: {} }, params: { collection: 'test', id: '123' } } as Partial<Request>;
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as Partial<Response>;
    await handlePost(req as Request, res as Response);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'fail' });
  });
});

describe('handleDelete', () => {
  it('should remove data and return success', async () => {
    const mockRemove = jest.fn();
    (db as any) = { ref: () => ({ remove: mockRemove }) };
    const req = { params: { collection: 'test', id: '123' } } as Partial<Request>;
    const res = { json: jest.fn() } as Partial<Response>;
    await handleDelete(req as Request, res as Response);
    expect(mockRemove).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith({ success: true });
  });

  it('should handle errors and return 500', async () => {
    const mockRemove = jest.fn().mockRejectedValue(new Error('fail'));
    (db as any) = { ref: () => ({ remove: mockRemove }) };
    const req = { params: { collection: 'test', id: '123' } } as Partial<Request>;
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as Partial<Response>;
    await handleDelete(req as Request, res as Response);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'fail' });
  });
});
