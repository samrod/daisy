import fetch, { Response, Request, Headers } from 'node-fetch';
import { getData } from '@/lib/firebase';

if (typeof global !== 'undefined') {
  if (typeof global.fetch === 'undefined') global.fetch = fetch;
  if (typeof global.Response === 'undefined') global.Response = Response;
  if (typeof global.Request === 'undefined') global.Request = Request;
  if (typeof global.Headers === 'undefined') global.Headers = Headers;
}

beforeAll(() => {
  globalThis.import = { meta: { env: { VITE_API_BASE: '', VITE_FIREBASE_API_KEY: '', VITE_FIREBASE_AUTH_DOMAIN: '', VITE_FIREBASE_PROJECT_ID: '', VITE_FIREBASE_STORAGE_BUCKET: '', VITE_FIREBASE_MESSAGING_SENDER_ID: '', VITE_FIREBASE_APP_ID: '', VITE_FIREBASE_DATABASE_URL: '' } } };
});

jest.mock('firebase/database', () => ({
  ref: jest.fn((db, path) => `ref:${path}`),
  onValue: jest.fn(),
  getDatabase: jest.fn(() => ({})),
}));

jest.mock('@/lib', () => ({
  defaults: {},
  limits: { volume: 1, speed: 1 },
  update: jest.fn(),
  consoleLog: jest.fn(),
  objDiff: jest.fn(),
}));

jest.mock('firebase/app', () => ({
  initializeApp: jest.fn(() => ({})),
}));
jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(() => ({ currentUser: null })),
}));
jest.mock('firebase/analytics', () => ({
  getAnalytics: jest.fn(() => ({})),
}));

describe('getData', () => {
  it('calls onValue with correct ref and callback', () => {
    const { ref, onValue } = require('firebase/database');
    const callback = jest.fn();
    const params = { key: 'foo', path: 'bar', callback };
    getData(params);
    expect(ref).toHaveBeenCalledWith(expect.anything(), 'bar/foo');
    expect(onValue).toHaveBeenCalledWith('ref:bar/foo', expect.any(Function));
  });
});

describe('deletePropValue', () => {
  it('calls consoleLog and apiDelete with correct args', async () => {
    const mockConsoleLog = require('@/lib').consoleLog;
    const mockApiDelete = jest.fn();
    // Patch apiDelete for this test
    const { deletePropValue } = require('@/lib/firebase');
    // Temporarily override apiDelete
    const originalApiDelete = require('@/lib/firebase').apiDelete;
    require('@/lib/firebase').apiDelete = mockApiDelete;
    await deletePropValue('fooPath', 'barKey');
    expect(mockConsoleLog).toHaveBeenCalledWith('deletePropValue', 'fooPath: barKey');
    expect(mockApiDelete).toHaveBeenCalledWith('fooPath', 'barKey');
    // Restore original apiDelete
    require('@/lib/firebase').apiDelete = originalApiDelete;
  });
});

describe('readPropValue', () => {
  it('returns "Invalid key or value" if key or value is missing', async () => {
    const { readPropValue } = require('@/lib/firebase');
    expect(await readPropValue('', 'foo')).toBe('Invalid key or value');
    expect(await readPropValue('foo', undefined)).toBe('Invalid key or value');
    expect(await readPropValue('foo', null)).toBe('Invalid key or value');
  });
  it('returns snapshot.toJSON() if snapshot exists', async () => {
    const mockGet = jest.fn(async () => ({ exists: () => true, toJSON: () => 'data' }));
    const mockChild = jest.fn((ref, path) => `child:${path}`);
    const mockRef = jest.fn(() => 'ref');
    // Patch dependencies
    const originalGet = require('firebase/database').get;
    const originalChild = require('firebase/database').child;
    const originalRef = require('firebase/database').ref;
    require('firebase/database').get = mockGet;
    require('firebase/database').child = mockChild;
    require('firebase/database').ref = mockRef;
    const { readPropValue } = require('@/lib/firebase');
    expect(await readPropValue('foo', 'bar')).toBe('data');
    require('firebase/database').get = originalGet;
    require('firebase/database').child = originalChild;
    require('firebase/database').ref = originalRef;
  });
  it('returns undefined if snapshot does not exist', async () => {
    const mockGet = jest.fn(async () => ({ exists: () => false }));
    const mockChild = jest.fn((ref, path) => `child:${path}`);
    const mockRef = jest.fn(() => 'ref');
    // Patch dependencies
    const originalGet = require('firebase/database').get;
    const originalChild = require('firebase/database').child;
    const originalRef = require('firebase/database').ref;
    require('firebase/database').get = mockGet;
    require('firebase/database').child = mockChild;
    require('firebase/database').ref = mockRef;
    const { readPropValue } = require('@/lib/firebase');
    expect(await readPropValue('foo', 'bar')).toBeUndefined();
    require('firebase/database').get = originalGet;
    require('firebase/database').child = originalChild;
    require('firebase/database').ref = originalRef;
  });
});

describe('propExists', () => {
  it('returns response if readPropValue returns defined', async () => {
    const mockReadPropValue = jest.fn(async () => 'data');
    const { propExists } = require('@/lib/firebase');
    // Patch readPropValue for this test
    const originalReadPropValue = require('@/lib/firebase').readPropValue;
    require('@/lib/firebase').readPropValue = mockReadPropValue;
    expect(await propExists('foo', 'bar')).toBe('data');
    require('@/lib/firebase').readPropValue = originalReadPropValue;
  });
  it('returns false if readPropValue returns undefined', async () => {
    const mockReadPropValue = jest.fn(async () => undefined);
    const { propExists } = require('@/lib/firebase');
    const originalReadPropValue = require('@/lib/firebase').readPropValue;
    require('@/lib/firebase').readPropValue = mockReadPropValue;
    expect(await propExists('foo', 'bar')).toBe(false);
    require('@/lib/firebase').readPropValue = originalReadPropValue;
  });
});

describe('updateData', () => {
  it('logs error if path is empty', async () => {
    const mockConsoleLog = require('@/lib').consoleLog;
    const { updateData } = require('@/lib/firebase');
    await updateData('', 'value');
    expect(mockConsoleLog).toHaveBeenCalledWith('updateData', 'missing path', 'error');
  });
  it('logs error if value is undefined or null', async () => {
    const mockConsoleLog = require('@/lib').consoleLog;
    const { updateData } = require('@/lib/firebase');
    await updateData('foo', undefined);
    expect(mockConsoleLog).toHaveBeenCalledWith('updateData', '"foo: value missing"', 'error');
    await updateData('foo', null);
    expect(mockConsoleLog).toHaveBeenCalledWith('updateData', '"foo: value missing"', 'error');
  });
  it('calls set if useClient is true', async () => {
    const mockSet = jest.fn();
    const mockRef = jest.fn(() => 'ref');
    // Patch dependencies
    const originalSet = require('firebase/database').set;
    const originalRef = require('firebase/database').ref;
    require('firebase/database').set = mockSet;
    require('firebase/database').ref = mockRef;
    const mockConsoleLog = require('@/lib').consoleLog;
    const { updateData } = require('@/lib/firebase');
    await updateData('foo', 'bar', true);
    expect(mockConsoleLog).toHaveBeenCalledWith('updateData', '[client] foo: bar');
    expect(mockSet).toHaveBeenCalledWith('ref', 'bar');
    require('firebase/database').set = originalSet;
    require('firebase/database').ref = originalRef;
  });
  it('calls apiPost if useClient is false', async () => {
    const mockApiPost = jest.fn();
    const mockConsoleLog = require('@/lib').consoleLog;
    const { updateData } = require('@/lib/firebase');
    // Patch apiPost for this test
    const originalApiPost = require('@/lib/firebase').apiPost;
    require('@/lib/firebase').apiPost = mockApiPost;
    await updateData('foo', 'bar', false);
    expect(mockConsoleLog).toHaveBeenCalledWith('updateData', '[api] foo: bar');
    expect(mockApiPost).toHaveBeenCalledWith('foo', 'bar');
    require('@/lib/firebase').apiPost = originalApiPost;
  });
});

describe('pushData', () => {
  it('updates array at index if index is provided', async () => {
    const mockReadPropValue = jest.fn(async () => [1, 2, 3]);
    const mockUpdateData = jest.fn();
    const { pushData } = require('@/lib/firebase');
    // Patch dependencies
    const originalReadPropValue = require('@/lib/firebase').readPropValue;
    const originalUpdateData = require('@/lib/firebase').updateData;
    require('@/lib/firebase').readPropValue = mockReadPropValue;
    require('@/lib/firebase').updateData = mockUpdateData;
    await pushData('foo', 99, 1);
    expect(mockUpdateData).toHaveBeenCalledWith('foo', [1, 99, 3], false, 'pushData');
    require('@/lib/firebase').readPropValue = originalReadPropValue;
    require('@/lib/firebase').updateData = originalUpdateData;
  });
  it('warns and does not update if value already exists', async () => {
    const mockReadPropValue = jest.fn(async () => [1, 2, 3]);
    const mockUpdateData = jest.fn();
    const mockWarn = jest.spyOn(console, 'warn').mockImplementation(() => {});
    const { pushData } = require('@/lib/firebase');
    // Patch dependencies
    const originalReadPropValue = require('@/lib/firebase').readPropValue;
    const originalUpdateData = require('@/lib/firebase').updateData;
    require('@/lib/firebase').readPropValue = mockReadPropValue;
    require('@/lib/firebase').updateData = mockUpdateData;
    await pushData('foo', 2);
    expect(mockWarn).toHaveBeenCalled();
    expect(mockUpdateData).not.toHaveBeenCalled();
    require('@/lib/firebase').readPropValue = originalReadPropValue;
    require('@/lib/firebase').updateData = originalUpdateData;
    mockWarn.mockRestore();
  });
  it('pushes value and updates if not exists', async () => {
    const mockReadPropValue = jest.fn(async () => [1, 2, 3]);
    const mockUpdateData = jest.fn();
    const { pushData } = require('@/lib/firebase');
    // Patch dependencies
    const originalReadPropValue = require('@/lib/firebase').readPropValue;
    const originalUpdateData = require('@/lib/firebase').updateData;
    require('@/lib/firebase').readPropValue = mockReadPropValue;
    require('@/lib/firebase').updateData = mockUpdateData;
    await pushData('foo', 4);
    expect(mockUpdateData).toHaveBeenCalledWith('foo', [1, 2, 3, 4], false, 'pushData');
    require('@/lib/firebase').readPropValue = originalReadPropValue;
    require('@/lib/firebase').updateData = originalUpdateData;
  });
});

describe('deleteDataAtIndex', () => {
  it('removes item at index and updates data', async () => {
    const mockReadPropValue = jest.fn(async () => [1, 2, 3]);
    const mockUpdateData = jest.fn();
    const { deleteDataAtIndex } = require('@/lib/firebase');
    // Patch dependencies
    const originalReadPropValue = require('@/lib/firebase').readPropValue;
    const originalUpdateData = require('@/lib/firebase').updateData;
    require('@/lib/firebase').readPropValue = mockReadPropValue;
    require('@/lib/firebase').updateData = mockUpdateData;
    await deleteDataAtIndex('foo', 1);
    expect(mockUpdateData).toHaveBeenCalledWith('foo', [1, 3], false, 'deleteDataAtIndex');
    require('@/lib/firebase').readPropValue = originalReadPropValue;
    require('@/lib/firebase').updateData = originalUpdateData;
  });
});

describe('serverStamp', () => {
  it('returns a Timestamp', () => {
    const { serverStamp } = require('@/lib/firebase');
    const result = serverStamp();
    expect(result).toBeInstanceOf(Object); // Timestamp is an object
  });
});

describe('parseDate', () => {
  it('returns a Date from seconds and nanoseconds', () => {
    const { parseDate } = require('@/lib/firebase');
    const date = parseDate({ seconds: 1000, nanoseconds: 0 });
    expect(date).toBeInstanceOf(Date);
  });
});

describe('apiPost', () => {
  it('returns undefined if response is not ok', async () => {
    global.fetch = jest.fn(async () => new Response(null, { status: 400 }));
    const mockConsoleLog = require('@/lib').consoleLog;
    const { apiPost } = require('@/lib/firebase');
    const result = await apiPost('foo', { bar: 1 });
    expect(mockConsoleLog).toHaveBeenCalledWith('apiPost 400', 'path: /foo, data: [object Object]', 'error');
    expect(result).toBeUndefined();
  });
  it('returns json if response is ok', async () => {
    const jsonData = { success: true };
    global.fetch = jest.fn(async () => new Response(JSON.stringify(jsonData), { status: 200, headers: { 'Content-Type': 'application/json' } }));
    const mockConsoleLog = require('@/lib').consoleLog;
    const { apiPost } = require('@/lib/firebase');
    const result = await apiPost('foo', { bar: 1 });
    expect(mockConsoleLog).toHaveBeenCalledWith('apiPost 200', '/foo {"bar":1}', 'info');
    expect(result).toEqual(jsonData);
  });
});

describe('apiDelete', () => {
  it('returns undefined if id is missing', async () => {
    const mockConsoleLog = require('@/lib').consoleLog;
    const { apiDelete } = require('@/lib/firebase');
    const result = await apiDelete('foo', '');
    expect(mockConsoleLog).toHaveBeenCalledWith('apiDelete', 'requires an id', 'error');
    expect(result).toBeUndefined();
  });
  it('returns undefined if response is not ok', async () => {
    global.fetch = jest.fn(async () => new Response(null, { status: 400 }));
    const mockConsoleLog = require('@/lib').consoleLog;
    const { apiDelete } = require('@/lib/firebase');
    const result = await apiDelete('foo', 'bar');
    expect(mockConsoleLog).toHaveBeenCalledWith('apiDelete', 'failed: 400', 'error');
    expect(result).toBeUndefined();
  });
  it('returns json if response is ok', async () => {
    const jsonData = { success: true };
    global.fetch = jest.fn(async () => new Response(JSON.stringify(jsonData), { status: 200, headers: { 'Content-Type': 'application/json' } }));
    const { apiDelete } = require('@/lib/firebase');
    const result = await apiDelete('foo', 'bar');
    expect(result).toEqual(jsonData);
  });
});
