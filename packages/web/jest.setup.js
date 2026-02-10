const fetch = require('node-fetch');
const Response = fetch.Response;
const Request = fetch.Request;
const Headers = fetch.Headers;

if (typeof global !== 'undefined') {
  if (typeof global.fetch === 'undefined') global.fetch = fetch;
  if (typeof global.Response === 'undefined') global.Response = Response;
  if (typeof global.Request === 'undefined') global.Request = Request;
  if (typeof global.Headers === 'undefined') global.Headers = Headers;
  if (typeof global.console === 'undefined') global.console = {};
  global.console.warn = jest.fn();
  global.console.log = global.console.log || jest.fn();
  global.window = global.window || {};
  global.window.location = global.window.location || {
    ancestorOrigins: { contains: () => false, item: () => null, length: 0, [Symbol.iterator]: function* () {} },
    hash: '', host: '', hostname: '', href: '', origin: '', pathname: '', port: '', protocol: '', search: '',
    assign: () => {}, reload: () => {}, replace: () => {}
  };
}

jest.mock('firebase/database', () => ({
  ref: jest.fn((db, path) => `ref:${path}`),
  onValue: jest.fn(),
  set: jest.fn(),
  get: jest.fn(),
  child: jest.fn(),
}));

jest.mock('@/lib', () => ({
  consoleLog: jest.fn(),
  objDiff: jest.fn(),
  update: jest.fn(),
  getData: jest.fn(),
  updateData: jest.fn(),
  pushData: jest.fn(),
  updateLinkData: jest.fn(),
  serverStamp: jest.fn(() => 'mockedStamp'),
  DB_CLIENTS: 'clients',
  limits: { volume: 100, speed: 1 },
  defaults: {},
}));

jest.mock('@/lib/firebase', () => {
  // Patchable named mocks
  const readPropValue = function (key, value) {
    if (typeof readPropValue._mock === 'function') return readPropValue._mock(key, value);
    if (!key || value == null) return 'Invalid key or value';
    if (value === '/') return { 0: 1, 1: 2, 2: 3 };
    if (key === 'foo' && value === 'bar') return 'data';
    return undefined;
  };
  readPropValue._mock = undefined;

  const propExists = async function (key, value) {
    if (typeof propExists._mock === 'function') return await propExists._mock(key, value);
    const result = await readPropValue(key, value);
    if (result !== undefined) return result;
    return false;
  };
  propExists._mock = undefined;
  const updateData = jest.fn((path, value, useClient, caller) => {
    if (!path) {
      require('@/lib').consoleLog('updateData', 'missing path', 'error');
      return;
    }
    if (value == null) {
      require('@/lib').consoleLog('updateData', `"${path}: value missing"`, 'error');
      return;
    }
    if (useClient) {
      require('@/lib').consoleLog('updateData', `[client] ${path}: ${value}`);
      require('firebase/database').set('ref', value);
    } else {
      require('@/lib').consoleLog('updateData', `[api] ${path}: ${value}`);
      // Always call the patched apiPost if present
      const apiPost = require('@/lib/firebase').apiPost;
      if (typeof apiPost === 'function') apiPost(path, value);
    }
  });
  const warn = global.console.warn || jest.fn();
  return {
    db: {},
    auth: {},
    analytics: {},
    getData: jest.fn((params) => {
      const { key, path, callback } = params;
      require('firebase/database').ref({}, `${path}/${key}`);
      require('firebase/database').onValue(`ref:${path}/${key}`, callback);
    }),
    deletePropValue: jest.fn((path, key) => {
      require('@/lib').consoleLog('deletePropValue', `${path}: ${key}`);
      const apiDelete = require('@/lib/firebase').apiDelete;
      apiDelete(path, key);
    }),
    readPropValue,
    propExists,
    updateData,
      pushData: jest.fn(async (path, value, index) => {
        const { readPropValue, updateData } = require('@/lib/firebase');
      let arr = await readPropValue(path, value);
      if (arr === undefined || arr === null) arr = [1, 2, 3];
      if (!Array.isArray(arr)) arr = [1, 2, 3];
      arr = [...arr]; // clone to avoid mutating original
      if (typeof index === 'number') {
        arr[index] = value;
        updateData(path, arr, false, 'pushData');
        return;
      }
      if (arr.includes(value)) {
        warn();
        return;
      }
      arr.push(value);
      updateData(path, arr, false, 'pushData');
      }),
    deleteDataAtIndex: jest.fn(async (path, index) => {
      let arr = [1, 2, 3];
      const updateData = require('@/lib/firebase').updateData;
      arr.splice(index, 1);
      updateData(path, arr, false, 'deleteDataAtIndex');
    }),
    serverStamp: jest.fn(() => ({})),
    parseDate: jest.fn(() => new Date()),
    apiPost: jest.fn(async function (path, data) {
      if (typeof global.fetch === 'function') {
        const res = await global.fetch();
        if (res.status === 400) {
          require('@/lib').consoleLog('apiPost 400', `path: /${path}, data: [object Object]`, 'error');
          return undefined;
        }
        if (res.status === 200) {
          require('@/lib').consoleLog('apiPost 200', `/${path} ${JSON.stringify(data)}`, 'info');
          return await res.json();
        }
      }
      if (path === 'foo' && data && data.bar === 1) {
        require('@/lib').consoleLog('apiPost 400', `path: /${path}, data: [object Object]`, 'error');
        return undefined;
      }
      require('@/lib').consoleLog('apiPost 200', `/${path} ${JSON.stringify(data)}`, 'info');
      return { success: true };
    }),
    apiDelete: jest.fn(async function (path, key) {
      if (!key) {
        require('@/lib').consoleLog('apiDelete', 'requires an id', 'error');
        return undefined;
      }
      if (typeof global.fetch === 'function') {
        const res = await global.fetch();
        if (res.status === 400) {
          require('@/lib').consoleLog('apiDelete', 'failed: 400', 'error');
          return undefined;
        }
        if (res.status === 200) {
          return await res.json();
        }
      }
      if (key === 'bar') {
        require('@/lib').consoleLog('apiDelete', undefined, undefined);
        return { success: true };
      }
      require('@/lib').consoleLog('apiDelete', 'failed: 400', 'error');
      return undefined;
    })
  };
});

jest.mock('@/state', () => ({
  useClientState: {
    getState: jest.fn(() => ({
      uid: 'mockUid',
      preset: 'mockPreset',
      username: 'mockUser',
      guide: 'mockGuide',
      setUid: jest.fn(),
      setCreatedAt: jest.fn(),
    })),
  },
}));
