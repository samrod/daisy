import { update } from '../state';

describe('update', () => {
  it('calls set with produced state and resolves', async () => {
    const set = jest.fn(fn => fn({ value: 1 }));
    const func = jest.fn(state => { state.value = 2; });
  await update(set, func);
  expect(set).toHaveBeenCalled();
  expect(func).toHaveBeenCalled();
  });

  it('resolves the promise after setTimeout', async () => {
    jest.useFakeTimers();
    const set = jest.fn(fn => fn({ value: 1 }));
    const func = jest.fn(state => { state.value = 2; });
    const promise = update(set, func);
    jest.runAllTimers();
    await promise;
    expect(set).toHaveBeenCalled();
    jest.useRealTimers();
  });
});
