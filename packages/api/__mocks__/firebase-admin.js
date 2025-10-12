function auth() {
  return {
    verifyIdToken: jest.fn(token => {
      if (token === 'valid') return Promise.resolve({ uid: 'user123' });
      return Promise.reject(new Error('Invalid token'));
    })
  };
}
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
  auth,
  credential: { applicationDefault: jest.fn() },
  get apps() { return []; },
  initializeApp: jest.fn()
};
