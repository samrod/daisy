import { objDiff, consoleLog } from '../logging';

describe('objDiff', () => {
  it('returns false if either object is falsy', () => {
    expect(objDiff(null, {})).toBe(false);
    expect(objDiff({}, null)).toBe(false);
    expect(objDiff(undefined, {})).toBe(false);
    expect(objDiff({}, undefined)).toBe(false);
  });

  it('returns false if objects are equal', () => {
    expect(objDiff({ a: 1 }, { a: 1 })).toBe(false);
  });

  it('returns diff for changed primitive values', () => {
    expect(objDiff({ a: 1 }, { a: 2 })).toEqual({ a: '1 => 2' });
  });

  it('returns diff for changed nested objects', () => {
    expect(objDiff({ a: { b: 1 } }, { a: { b: 2 } })).toEqual({ a: { b: '1 => 2' } });
  });

  it('returns diff for added/removed keys', () => {
    expect(objDiff({ a: 1 }, { a: 1, b: 2 })).toEqual({ b: 'undefined => 2' });
    expect(objDiff({ a: 1, b: 2 }, { a: 1 })).toEqual({ b: '2 => undefined' });
  });
});

describe('consoleLog', () => {
  const originalConsoleLog = console.log;
  const originalWindow = global.window;
  beforeAll(() => {
    // @ts-ignore
    global.window = { location: { pathname: '/test' } };
  });
  afterAll(() => {
    console.log = originalConsoleLog;
    // @ts-ignore
    global.window = originalWindow;
  });
  beforeEach(() => {
    console.log = jest.fn();
  });

  it('logs message with correct formatting', () => {
    consoleLog('msg', { foo: 'bar' }, 'info');
    expect(console.log).toHaveBeenCalledWith(
      '%c/%c msg',
      expect.any(String),
      expect.any(String),
      { foo: 'bar' }
    );
  });

  it('does not log in production', () => {
    jest.spyOn(require('../constants'), 'getEnv').mockReturnValue('production');
    consoleLog('msg', 'extra', 'info');
    expect(console.log).not.toHaveBeenCalled();
    jest.spyOn(require('../constants'), 'getEnv').mockRestore();
  });
});
