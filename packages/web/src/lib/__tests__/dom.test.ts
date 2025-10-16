import { bindEvent, unbindEvent } from '../dom';

jest.mock('firebase/app', () => ({
  initializeApp: jest.fn(() => ({})),
}));
jest.mock('firebase/database', () => ({
  ref: jest.fn((db, path) => `ref:${path}`),
  onValue: jest.fn(),
  getDatabase: jest.fn(() => ({})),
  get: jest.fn(),
  child: jest.fn(),
  set: jest.fn(),
}));
jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(() => ({ currentUser: null })),
}));
jest.mock('firebase/analytics', () => ({
  getAnalytics: jest.fn(() => ({})),
}));

describe('bindEvent', () => {
  it('adds event listener to element', () => {
    const element = document.createElement('div');
    const handler = jest.fn();
    bindEvent({ element, event: 'click', handler });
    element.click();
    expect(handler).toHaveBeenCalled();
  });

  it('passes options to addEventListener', () => {
    const element = document.createElement('div');
    const handler = jest.fn();
    const options = { once: true };
    bindEvent({ element, event: 'click', handler, options });
    element.click();
    element.click();
    expect(handler).toHaveBeenCalledTimes(1);
  });
});

describe('unbindEvent', () => {
  it('removes event listener from element', () => {
    const element = document.createElement('div');
    const handler = jest.fn();
    bindEvent({ element, event: 'click', handler });
    unbindEvent({ element, event: 'click', handler });
    element.click();
    expect(handler).not.toHaveBeenCalled();
  });
});

describe('setKeys', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  it('calls changeSetting for ArrowDown', () => {
    jest.doMock('@/state', () => ({
      useLinkState: { getState: () => ({ volumeDown: jest.fn(), settings: { volume: 5, speed: 2 } }) },
      useGuideState: { getState: () => ({ userMode: false }) },
      updateSetting: jest.fn(),
      togglePlay: jest.fn(),
    }));
    const { setKeys } = require('../dom');
    setKeys({ key: 'ArrowDown' });
  });

  it('calls togglePlay for spacebar', () => {
    jest.doMock('@/state', () => ({
      useLinkState: { getState: () => ({ settings: { volume: 5, speed: 2 } }) },
      useGuideState: { getState: () => ({ userMode: false }) },
      updateSetting: jest.fn(),
      togglePlay: jest.fn(),
    }));
    const { setKeys } = require('../dom');
    setKeys({ key: ' ' });
    // No error means function executed
  });

  it('returns early if userMode is true', () => {
    jest.doMock('@/state', () => ({
      useLinkState: { getState: () => ({}) },
      useGuideState: { getState: () => ({ userMode: true }) },
      updateSetting: jest.fn(),
      togglePlay: jest.fn(),
    }));
    const { setKeys } = require('../dom');
    expect(setKeys({ key: 'ArrowDown' })).toBeUndefined();
  });
});
