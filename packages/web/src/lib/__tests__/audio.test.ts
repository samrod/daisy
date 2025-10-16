
import { generateSound } from '../audio';
import { createMockAudioContext } from '../testUtils.helper';

describe('generateSound', () => {
  let mockCtx, mockSource, mockGain, mockConvolver;
  beforeEach(() => {
    const mocks = createMockAudioContext();
    mockCtx = mocks.mockCtx;
    mockSource = mocks.mockSource;
    mockGain = mocks.mockGain;
    mockConvolver = mocks.mockConvolver;
    window.AudioContext = jest.fn(() => mockCtx);
    window.webkitAudioContext = undefined;
    (window as any).AudioCtx = undefined;
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
