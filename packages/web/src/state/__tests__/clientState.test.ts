
describe('clientState', () => {
  it('should initialize with default state', () => {
    const state = require('../clientState').useClientState.getState();
    expect(state.status).toBe(0);
    expect(state.previousStatus).toBeNull();
    expect(state.preset).toBeNull();
    expect(state.clientLink).toBeNull();
    expect(state.username).toBe('');
    expect(state.uid).toBeNull();
    expect(state.guide).toBeNull();
    expect(state.trigger).toBeNull();
    expect(state.localPriority).toBe(false);
    expect(state.suppressCallback).toBe(false);
  });
});
