import { handlePost, handleDelete, db } from '../src/utils';
import { Request, Response } from 'express';

describe('Integration: handlePost and handleDelete', () => {
  beforeEach(() => {
    // Reset all mock calls before each test
    jest.clearAllMocks();
  });

  it('should call set and remove in sequence for post and delete', async () => {
    const mockSet = jest.fn();
    const mockRemove = jest.fn();
    (db as any) = { ref: jest.fn((path: string) => ({ set: mockSet, remove: mockRemove })) };

    // Simulate a POST
    const postReq = { body: { data: { foo: 'bar' } }, params: { collection: 'test', id: '123' } } as Partial<Request>;
    const postRes = { json: jest.fn() } as Partial<Response>;
    await handlePost(postReq as Request, postRes as Response);
    expect(db.ref).toHaveBeenCalledWith('test/123');
    expect(mockSet).toHaveBeenCalledWith({ foo: 'bar' });
    expect(postRes.json).toHaveBeenCalledWith({ success: true });

    // Simulate a DELETE
    const deleteReq = { params: { collection: 'test', id: '123' } } as Partial<Request>;
    const deleteRes = { json: jest.fn() } as Partial<Response>;
    await handleDelete(deleteReq as Request, deleteRes as Response);
    expect(db.ref).toHaveBeenCalledWith('test/123');
    expect(mockRemove).toHaveBeenCalled();
    expect(deleteRes.json).toHaveBeenCalledWith({ success: true });
  });

  it('should handle error propagation between handlers', async () => {
    const mockSet = jest.fn().mockRejectedValue(new Error('fail-set'));
    const mockRemove = jest.fn().mockRejectedValue(new Error('fail-remove'));
    (db as any) = { ref: jest.fn((path: string) => ({ set: mockSet, remove: mockRemove })) };

    const postReq = { body: { data: {} }, params: { collection: 'test', id: '123' } } as Partial<Request>;
    const postRes = { status: jest.fn().mockReturnThis(), json: jest.fn() } as Partial<Response>;
    await handlePost(postReq as Request, postRes as Response);
    expect(postRes.status).toHaveBeenCalledWith(500);
    expect(postRes.json).toHaveBeenCalledWith({ error: 'fail-set' });

    const deleteReq = { params: { collection: 'test', id: '123' } } as Partial<Request>;
    const deleteRes = { status: jest.fn().mockReturnThis(), json: jest.fn() } as Partial<Response>;
    await handleDelete(deleteReq as Request, deleteRes as Response);
    expect(deleteRes.status).toHaveBeenCalledWith(500);
    expect(deleteRes.json).toHaveBeenCalledWith({ error: 'fail-remove' });
  });
});
