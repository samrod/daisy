// No imports needed; all usage is via require()
describe('guideState', () => {
  it('should initialize with default state', () => {
    const { useGuideState } = require('../guideState');
    const state = useGuideState.getState();
    expect(state.userMode).toBe(false);
    expect(state.activePreset).toBe('');
    expect(state.clientStatus).toBe(0);
    expect(state.clientName).toBe('');
    expect(state.presets).toEqual([]);
    expect(state.modalActive).toBe(false);
    expect(state.trigger).toBe(null);
  });
});
