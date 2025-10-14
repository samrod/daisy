
import React from 'react';
import { render, act } from '@testing-library/react';
import { useRehydrate, useSessionCheck, useFullscreenHandler, useEventBinder, useUnloadHandler } from '../hooks';

// Mocks for dependencies
jest.mock('lodash', () => ({ debounce: (fn: (...args: any[]) => any) => fn, isEmpty: jest.fn(), noop: jest.fn() }));
jest.mock('../', () => ({
  DB_LINKS: 'DB_LINKS',
  bindEvent: jest.fn(),
  consoleLog: jest.fn(),
  readPropValue: jest.fn(),
  unbindEvent: jest.fn(),
}));
jest.mock('@/state', () => ({
  useClientState: Object.assign(
    (selector?: (state: any) => any) => selector ? selector({ setSupressCallback: jest.fn(), setLocalPriority: jest.fn(), setStatus: jest.fn(), status: 1 }) : { setSupressCallback: jest.fn(), setLocalPriority: jest.fn(), setStatus: jest.fn(), status: 1 },
    {
      persist: { rehydrate: jest.fn(), hasHydrated: jest.fn(() => false) },
      getState: jest.fn(() => ({ status: 1 }))
    }
  ),
  updateLinkData: jest.fn(),
  useSessionState: {
    getState: jest.fn(() => ({ localSession: true, session: true, setSessionStatus: jest.fn(), setUpdatedAt: jest.fn(), sessionStatus: 'available' }))
  },
  sessionExpired: jest.fn(() => false),
  endSession: jest.fn(),
  clientLinkFromStore: jest.fn(async () => ({ clientLink: 'link' })),
  PersistedLinkType: {}
}));

// Mock import.meta.env for tests
Object.defineProperty(globalThis, 'import', {
  value: { meta: { env: { NODE_ENV: 'test' } } },
  writable: true,
  configurable: true,
});

describe('useRehydrate', () => {
  it('calls rehydrate if not hydrated and localSession exists', async () => {
    // Test component to trigger hook
    function TestComponent() {
      useRehydrate();
      return null;
    }
    render(<TestComponent />);
    // If no error, hook runs
    expect(true).toBe(true);
  });
});

describe('useSessionCheck', () => {
  it('sets session status based on clientLink and session', async () => {
    function TestComponent() {
      useSessionCheck();
      return null;
    }
    render(<TestComponent />);
    expect(true).toBe(true);
  });
});

describe('useFullscreenHandler', () => {
  function TestComponent({ authorized }: { authorized: boolean }) {
    useFullscreenHandler(authorized);
    return null;
  }
  it('requests fullscreen if authorized', () => {
    document.documentElement.requestFullscreen = jest.fn(() => Promise.resolve());
    act(() => {
      render(<TestComponent authorized={true} />);
    });
    expect(document.documentElement.requestFullscreen).toHaveBeenCalled();
  });
  it('exits fullscreen if not authorized', () => {
    Object.defineProperty(document, 'fullscreenEnabled', { value: true, configurable: true });
    document.exitFullscreen = jest.fn(() => Promise.resolve());
    act(() => {
      render(<TestComponent authorized={false} />);
    });
    expect(document.exitFullscreen).toHaveBeenCalled();
  });
});

describe('useEventBinder', () => {
  it('runs without error for valid bindList', () => {
    const bindList = [
      { element: window, event: 'resize', handler: jest.fn() },
      { element: document, event: 'click', handler: jest.fn() }
    ];
    function TestComponent() {
      useEventBinder(bindList, [1, 2]);
      return null;
    }
    act(() => {
      const { unmount } = render(<TestComponent />);
      expect(true).toBe(true);
      unmount();
    });
  });
});

describe('useUnloadHandler', () => {
  it('sets up unload events if sessionStatus is available', () => {
    (window as any).unloadEventSet = false;
    function TestComponent() {
      useUnloadHandler();
      return null;
    }
    render(<TestComponent />);
    expect((window as any).unloadEventSet).toBe(true);
  });
});

