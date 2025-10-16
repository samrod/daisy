import { receiveMessage, sendMessage } from '../messaging';

describe('receiveMessage', () => {
  let context;
  beforeEach(() => {
    context = {
      testAction: jest.fn(),
      warn: jest.fn(),
    };
    global.console.warn = jest.fn();
    global.window = { self: { location: { pathname: '/test' } }, name: 'test' };
  });

  it('calls the correct action if present', () => {
    const data = JSON.stringify({ action: 'testAction', params: 42 });
    receiveMessage.call(context, { data });
    expect(context.testAction).toHaveBeenCalledWith(42);
  });

  it('warns if action is not present', () => {
    const data = JSON.stringify({ action: 'missingAction', params: 42 });
    receiveMessage.call(context, { data });
    expect(console.warn).toHaveBeenCalledWith(
      expect.stringContaining('receivedMessage is not available'),
      {}
    );
  });

  it('does not warn for invalid data due to code logic', () => {
    receiveMessage.call(context, { data: 'not-json' });
    expect(console.warn).not.toHaveBeenCalled();
  });

  it('does not warn for webpack string', () => {
    receiveMessage.call(context, { data: 'webpackHotUpdate' });
    expect(console.warn).not.toHaveBeenCalled();
  });
});

describe('sendMessage', () => {
  let mockWindow;
  beforeEach(() => {
    mockWindow = { postMessage: jest.fn(), self: { location: { pathname: '/test' } } };
    global.window = { opener: mockWindow, parent: mockWindow, location: { href: 'http://test' } };
    global.console.warn = jest.fn();
  });

  it('sends message to windows', () => {
    jest.useFakeTimers();
    sendMessage({ action: 'foo', params: 123 }, [mockWindow], 'http://test');
    jest.runAllTimers();
    expect(mockWindow.postMessage).toHaveBeenCalledWith(
      JSON.stringify({ action: 'foo', params: 123 }),
      'http://test'
    );
    jest.useRealTimers();
  });

  it('warns if data is missing', () => {
    sendMessage(undefined as any, [mockWindow], 'http://test');
    expect(console.warn).toHaveBeenCalledWith(
      expect.stringContaining('sendMessage is missing data'),
      undefined,
      'undefined'
    );
  });
});
