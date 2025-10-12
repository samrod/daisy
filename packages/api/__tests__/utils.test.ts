
import * as utils from '../src/utils';
import { db } from '../src/utils';

beforeAll(() => {
  // Patch exported db for getFullRef
  (db as any) = { ref: (path: string) => ({ toString: () => path }) };
});

describe('getFullRef', () => {
  it('returns correct ref path for collection and id', () => {
    const params = { collection: 'guides', id: '123' };
  const ref = utils.getFullRef(params);
    expect(ref.toString()).toContain('guides/123');
  });

  it('returns correct ref path for collection only', () => {
    const params = { collection: 'presets' };
  const ref = utils.getFullRef(params);
    expect(ref.toString()).toContain('presets');
  });
});

describe('authenticatedCollections', () => {
  it('contains expected collections', () => {
  expect(utils.authenticatedCollections).toEqual(
      expect.arrayContaining(['presets', 'links', 'sessions', 'guides'])
    );
  });
});

// Note: handlers tests would require mocking Firebase admin/database, which is best done in integration tests.
