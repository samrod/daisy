// No imports needed; all usage is via require()
describe('sessionState', () => {
  it('should be defined', () => {
    const { useSessionState } = require('../sessionState');
    expect(useSessionState).toBeDefined();
  });

  it('should initialize with default state', () => {
    const { useSessionState } = require('../sessionState');
    const state = useSessionState.getState();
    expect(state.session).toBeNull();
    expect(state.sessionStatus).toBeNull();
    expect(state.updatedAt).toBeNull();
    expect(state.localSession).toBe(false);
    expect(state.trigger).toBeNull();
  });
});
