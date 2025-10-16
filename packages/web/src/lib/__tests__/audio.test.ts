import {
  generateSound,
  // getAudioContext,
  // createOscillator,
  // applyEnvelope,
  // createDryWetRouting,
} from '../audio';

describe('generateSound', () => {
  let mockCtx, mockSource, mockStereoPanner, mockGain, mockConvolver;
  beforeEach(() => {
    mockSource = { start: jest.fn(), stop: jest.fn(), connect: jest.fn(), frequency: { value: 0 }, type: '' };
    mockStereoPanner = { pan: { value: 0 }, connect: jest.fn() };
    mockGain = { connect: jest.fn(), gain: { setValueAtTime: jest.fn(), linearRampToValueAtTime: jest.fn(), value: 0 } };
    mockConvolver = { connect: jest.fn(), buffer: null };
    mockCtx = {
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
    window.AudioContext = jest.fn(() => mockCtx);
    window.webkitAudioContext = undefined;
    window.AudioCtx = undefined;
  });

  it('should generate sound and connect nodes', async () => {
    await generateSound({ panX: 0, pitch: 440, gain: 0.5, duration: 500, reverb: 0 });
    expect(mockCtx.createOscillator).toHaveBeenCalled();
    expect(mockCtx.createStereoPanner).toHaveBeenCalled();
    expect(mockGain.connect).toHaveBeenCalledWith(mockCtx.destination);
    expect(mockSource.start).toHaveBeenCalled();
    expect(mockSource.stop).toHaveBeenCalled();
  });

  it('should resume context if suspended', async () => {
    mockCtx.state = 'suspended';
    await generateSound({ panX: 0, pitch: 440, gain: 0.5, duration: 500, reverb: 0 });
    expect(mockCtx.resume).toHaveBeenCalled();
  });

  it('should handle reverb', async () => {
    await generateSound({ panX: 0, pitch: 440, gain: 0.5, duration: 500, reverb: 1 });
    expect(mockCtx.createConvolver).toHaveBeenCalled();
    expect(mockConvolver.connect).toHaveBeenCalled();
    expect(mockGain.connect).toHaveBeenCalledWith(mockCtx.destination);
  });
});
