import { produce } from 'immer';
export { v4 as uuid } from "uuid";

export const update = async (
  set: (fn: (state: UpdateTypes) => void) => void,
  func: (state: UpdateTypes) => void
): Promise<void> => new Promise(resolve => {
  set(produce((state: UpdateTypes) => {
    func(state);
    setTimeout(resolve);
  }));
});
