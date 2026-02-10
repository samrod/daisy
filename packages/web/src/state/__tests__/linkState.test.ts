// No imports needed; all usage is via require()
describe('linkState', () => {
  it('should be defined', () => {
    const { useLinkState } = require('../linkState');
    expect(useLinkState).toBeDefined();
  });

  it('should initialize with default state', () => {
    const { useLinkState } = require('../linkState');
    const state = useLinkState.getState();
    expect(state.clientLink).toBeNull();
    expect(state.activePreset).toBeUndefined();
    expect(state.trigger).toBeNull();
    expect(state.preset).toBe('');
    expect(state.presetName).toBe('');
    expect(state.clientStatus).toBe(0);
    expect(state.clientName).toBe('');
    expect(state.motionBarActive).toBe(false);
    expect(state.activeSetting).toBe('');
    expect(state.settings).toBeDefined();
  });
});
