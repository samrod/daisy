
// testUtils.helper.ts: reusable mock factories for tests
// NOTE: This file contains only utility functions and is not a Jest test suite.
// Jest should not run this file as a test suite.

export function createMockAudioContext() {
  const mockSource = { start: jest.fn(), stop: jest.fn(), connect: jest.fn(), frequency: { value: 0 }, type: '' };
  const mockStereoPanner = { pan: { value: 0 }, connect: jest.fn() };
  const mockGain = { connect: jest.fn(), gain: { setValueAtTime: jest.fn(), linearRampToValueAtTime: jest.fn(), value: 0 } };
  const mockConvolver = { connect: jest.fn(), buffer: null };
  const mockCtx = {
    state: 'running',
    resume: jest.fn(),
    currentTime: 0,
    createOscillator: jest.fn(() => mockSource),
    createStereoPanner: jest.fn(() => mockStereoPanner),
    createGain: jest.fn(() => mockGain),
    createConvolver: jest.fn(() => mockConvolver),
    createBuffer: jest.fn(() => ({ getChannelData: jest.fn(() => new Float32Array(10)) })),
    sampleRate: 44100,
    destination: {},
  };
  return { mockCtx, mockSource, mockStereoPanner, mockGain, mockConvolver };
}

export function createMockWindow(overrides = {}) {
  return {
    self: {
      location: {
        ancestorOrigins: { contains: () => false, item: () => null, length: 0, [Symbol.iterator]: function* () {} },
        hash: '', host: '', hostname: '', href: '', origin: '', pathname: '', port: '', protocol: '', search: '',
        assign: () => {}, reload: () => {}, replace: () => {}
      }
    },
    name: 'test',
    ...overrides
  };
}
