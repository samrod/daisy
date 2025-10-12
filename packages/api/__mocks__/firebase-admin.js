module.exports = {
  database: () => ({
    ref: jest.fn(() => ({
      set: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
      push: jest.fn(() => ({ set: jest.fn() })),
      transaction: jest.fn(),
      once: jest.fn()
    }))
  }),
  credential: { applicationDefault: jest.fn() },
  get apps() { return []; },
  initializeApp: jest.fn()
};
